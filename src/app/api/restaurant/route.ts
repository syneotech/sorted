import { NextRequest, NextResponse } from 'next/server';
import { getSwiggyMenu } from '@/lib/swiggy/client';
import { getZomatoMenu } from '@/lib/zomato/scraper';
import { matchMenuItems, calculateOptimalOrder } from '@/lib/comparison/matcher';
import {
  checkRateLimit,
  getCachedMenu,
  setCachedMenu,
  generateCacheKey,
  getFromCache,
  setInCache,
  CACHE_TTL,
} from '@/lib/cache/redis';
import type { NormalizedMenuItem } from '@/lib/swiggy/types';
import type { ComparisonMenuItem } from '@/lib/comparison/normalizer';

interface MenuComparisonResult {
  swiggyId?: string;
  zomatoSlug?: string;
  menuComparison: ComparisonMenuItem[];
  categories: string[];
  stats: {
    totalSwiggy: number;
    totalZomato: number;
    matched: number;
    swiggyOnly: number;
    zomatoOnly: number;
  };
  pricing: {
    swiggyTotal: number;
    zomatoTotal: number;
    optimalTotal: number;
    totalSavings: number;
  };
  cached: boolean;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const swiggyId = searchParams.get('swiggy_id');
  const zomatoSlug = searchParams.get('zomato_slug');
  const lat = parseFloat(searchParams.get('lat') || '12.97');
  const lng = parseFloat(searchParams.get('lng') || '77.59');
  const city = searchParams.get('city') || 'bangalore';

  // Validate parameters
  if (!swiggyId && !zomatoSlug) {
    return NextResponse.json(
      { error: 'At least one of swiggy_id or zomato_slug is required' },
      { status: 400 }
    );
  }

  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = await checkRateLimit(`restaurant:${clientIp}`, 15, 60);

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
    const cacheKey = generateCacheKey('menu_comparison', {
      swiggyId: swiggyId || '',
      zomatoSlug: zomatoSlug || '',
    });
    const cached = await getFromCache<MenuComparisonResult>(cacheKey);

    if (cached) {
      return NextResponse.json({
        success: true,
        ...cached,
        cached: true,
      });
    }

    // Fetch menus in parallel
    const menuPromises: [
      Promise<NormalizedMenuItem[]> | null,
      Promise<NormalizedMenuItem[]> | null,
    ] = [null, null];

    if (swiggyId) {
      // Check Swiggy menu cache
      const cachedSwiggyMenu = await getCachedMenu('swiggy', swiggyId);
      if (cachedSwiggyMenu) {
        menuPromises[0] = Promise.resolve(cachedSwiggyMenu as NormalizedMenuItem[]);
      } else {
        menuPromises[0] = getSwiggyMenu(swiggyId, lat, lng);
      }
    }

    if (zomatoSlug) {
      // Check Zomato menu cache
      const cachedZomatoMenu = await getCachedMenu('zomato', zomatoSlug);
      if (cachedZomatoMenu) {
        menuPromises[1] = Promise.resolve(cachedZomatoMenu as NormalizedMenuItem[]);
      } else {
        menuPromises[1] = getZomatoMenu(zomatoSlug, city);
      }
    }

    const [swiggyMenuResult, zomatoMenuResult] = await Promise.allSettled([
      menuPromises[0] || Promise.resolve([]),
      menuPromises[1] || Promise.resolve([]),
    ]);

    const swiggyMenu: NormalizedMenuItem[] =
      swiggyMenuResult.status === 'fulfilled' ? swiggyMenuResult.value : [];
    const zomatoMenu: NormalizedMenuItem[] =
      zomatoMenuResult.status === 'fulfilled' ? zomatoMenuResult.value : [];

    // Log any errors
    if (swiggyMenuResult.status === 'rejected') {
      console.error('Swiggy menu fetch failed:', swiggyMenuResult.reason);
    }
    if (zomatoMenuResult.status === 'rejected') {
      console.error('Zomato menu fetch failed:', zomatoMenuResult.reason);
    }

    // Cache individual menus
    if (swiggyId && swiggyMenu.length > 0) {
      await setCachedMenu('swiggy', swiggyId, swiggyMenu);
    }
    if (zomatoSlug && zomatoMenu.length > 0) {
      await setCachedMenu('zomato', zomatoSlug, zomatoMenu);
    }

    // Match menu items across platforms
    const menuComparison = matchMenuItems(swiggyMenu, zomatoMenu);

    // Extract unique categories
    const categories = [...new Set(menuComparison.map((item) => item.category))].sort();

    // Calculate stats
    const matched = menuComparison.filter((c) => c.swiggy && c.zomato).length;
    const swiggyOnly = menuComparison.filter((c) => c.swiggy && !c.zomato).length;
    const zomatoOnly = menuComparison.filter((c) => !c.swiggy && c.zomato).length;

    // Calculate pricing
    const pricing = calculateOptimalOrder(menuComparison);

    const result: MenuComparisonResult = {
      swiggyId: swiggyId || undefined,
      zomatoSlug: zomatoSlug || undefined,
      menuComparison,
      categories,
      stats: {
        totalSwiggy: swiggyMenu.length,
        totalZomato: zomatoMenu.length,
        matched,
        swiggyOnly,
        zomatoOnly,
      },
      pricing,
      cached: false,
    };

    // Cache the unified comparison
    await setInCache(cacheKey, result, CACHE_TTL.MENU);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Restaurant comparison API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to compare restaurant menus',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Increase timeout for menu fetching
export const maxDuration = 60;
