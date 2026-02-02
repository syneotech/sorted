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
import type { NormalizedRestaurant } from '@/lib/swiggy/types';
import type { ComparisonRestaurant } from '@/lib/comparison/normalizer';

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
      return NextResponse.json({
        success: true,
        ...cached,
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

    // Log any errors
    if (swiggyResults.status === 'rejected') {
      console.error('Swiggy fetch failed:', swiggyResults.reason);
    }
    if (zomatoResults.status === 'rejected') {
      console.error('Zomato fetch failed:', zomatoResults.reason);
    }

    // Match restaurants across platforms
    const comparisons = matchRestaurants(swiggyRestaurants, zomatoRestaurants);

    // Calculate stats
    const matched = comparisons.filter((c) => c.swiggy && c.zomato).length;
    const swiggyOnly = comparisons.filter((c) => c.swiggy && !c.zomato).length;
    const zomatoOnly = comparisons.filter((c) => !c.swiggy && c.zomato).length;

    const result: UnifiedSearchResult = {
      query,
      location: { lat, lng, city },
      comparisons,
      stats: {
        totalSwiggy: swiggyRestaurants.length,
        totalZomato: zomatoRestaurants.length,
        matched,
        swiggyOnly,
        zomatoOnly,
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
