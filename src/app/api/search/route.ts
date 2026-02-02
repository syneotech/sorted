import { NextRequest, NextResponse } from 'next/server';
import { searchSwiggyRestaurants } from '@/lib/swiggy/client';
import { searchZomatoRestaurants } from '@/lib/zomato/scraper';
import { matchRestaurants } from '@/lib/comparison/matcher';
import {
  checkRateLimit,
  getCachedSearch,
  setCachedSearch,
  generateCacheKey,
  getFromCache,
  setInCache,
  CACHE_TTL,
} from '@/lib/cache/redis';
import {
  processSearchResults,
  parseFiltersFromQuery,
  parseSortFromQuery,
} from '@/lib/filters';
import type { NormalizedRestaurant } from '@/lib/swiggy/types';
import type { ComparisonRestaurant } from '@/lib/comparison/normalizer';

interface PlatformStatus {
  success: boolean;
  error?: string;
  count: number;
}

interface UnifiedSearchResult {
  query: string;
  location: {
    lat: number;
    lng: number;
    city: string;
  };
  comparisons: ComparisonRestaurant[];
  stats: {
    totalSwiggy: number;
    totalZomato: number;
    matched: number;
    swiggyOnly: number;
    zomatoOnly: number;
  };
  filtered: {
    totalCount: number;
    filteredCount: number;
    appliedFilters: string[];
  };
  platformStatus: {
    swiggy: PlatformStatus;
    zomato: PlatformStatus;
  };
  cached: boolean;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const query = searchParams.get('q') || '';
  const city = searchParams.get('city') || 'bangalore';

  // Validate coordinates
  if (lat === 0 || lng === 0) {
    return NextResponse.json(
      { error: 'Valid latitude and longitude are required' },
      { status: 400 }
    );
  }

  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = await checkRateLimit(`search:${clientIp}`, 20, 60);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: rateLimit.resetIn,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.resetIn),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      }
    );
  }

  try {
    // Check unified cache first
    const cacheKey = generateCacheKey('unified_search', { query, lat, lng, city });
    const cached = await getFromCache<UnifiedSearchResult>(cacheKey);

    if (cached) {
      // Parse filter and sort parameters for cached results too
      const filters = parseFiltersFromQuery(searchParams);
      const sortBy = parseSortFromQuery(searchParams);

      // Apply filters and sorting to cached results
      const processed = processSearchResults(cached.comparisons, { filters, sortBy });

      return NextResponse.json({
        success: true,
        ...cached,
        comparisons: processed.restaurants,
        filtered: {
          totalCount: processed.totalCount,
          filteredCount: processed.filteredCount,
          appliedFilters: processed.appliedFilters,
        },
        cached: true,
      });
    }

    // Fetch from both platforms in parallel
    const [swiggyResults, zomatoResults] = await Promise.allSettled([
      searchSwiggyRestaurants(lat, lng, query || undefined),
      searchZomatoRestaurants(lat, lng, query || undefined, city),
    ]);

    const swiggyRestaurants: NormalizedRestaurant[] =
      swiggyResults.status === 'fulfilled' ? swiggyResults.value : [];
    const zomatoRestaurants: NormalizedRestaurant[] =
      zomatoResults.status === 'fulfilled' ? zomatoResults.value : [];

    // Track platform status
    const swiggyError = swiggyResults.status === 'rejected'
      ? (swiggyResults.reason instanceof Error ? swiggyResults.reason.message : 'Unknown error')
      : undefined;
    const zomatoError = zomatoResults.status === 'rejected'
      ? (zomatoResults.reason instanceof Error ? zomatoResults.reason.message : 'Unknown error')
      : undefined;

    // Log any errors
    if (swiggyError) {
      console.error('Swiggy fetch failed:', swiggyError);
    }
    if (zomatoError) {
      console.error('Zomato fetch failed:', zomatoError);
    }

    // Match restaurants across platforms with relevance scoring
    const comparisons = matchRestaurants(swiggyRestaurants, zomatoRestaurants, query || undefined);

    // Parse filter and sort parameters
    const filters = parseFiltersFromQuery(searchParams);
    const sortBy = parseSortFromQuery(searchParams);

    // Apply filters and sorting
    const processed = processSearchResults(comparisons, { filters, sortBy });

    // Calculate stats (before filtering)
    const matched = comparisons.filter((c) => c.swiggy && c.zomato).length;
    const swiggyOnly = comparisons.filter((c) => c.swiggy && !c.zomato).length;
    const zomatoOnly = comparisons.filter((c) => !c.swiggy && c.zomato).length;

    const result: UnifiedSearchResult = {
      query,
      location: { lat, lng, city },
      comparisons: processed.restaurants,
      stats: {
        totalSwiggy: swiggyRestaurants.length,
        totalZomato: zomatoRestaurants.length,
        matched,
        swiggyOnly,
        zomatoOnly,
      },
      filtered: {
        totalCount: processed.totalCount,
        filteredCount: processed.filteredCount,
        appliedFilters: processed.appliedFilters,
      },
      platformStatus: {
        swiggy: {
          success: !swiggyError,
          error: swiggyError,
          count: swiggyRestaurants.length,
        },
        zomato: {
          success: !zomatoError,
          error: zomatoError,
          count: zomatoRestaurants.length,
        },
      },
      cached: false,
    };

    // Cache the unified results
    await setInCache(cacheKey, result, CACHE_TTL.SEARCH);

    // Also cache individual platform results for faster partial fetches
    if (swiggyRestaurants.length > 0) {
      await setCachedSearch(`swiggy:${query}`, lat, lng, {
        swiggy: swiggyRestaurants,
        zomato: [],
      });
    }
    if (zomatoRestaurants.length > 0) {
      await setCachedSearch(`zomato:${query}:${city}`, lat, lng, {
        swiggy: [],
        zomato: zomatoRestaurants,
      });
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Unified search API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to search restaurants',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Increase timeout for parallel fetching
export const maxDuration = 60;
