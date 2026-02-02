import { NextRequest, NextResponse } from 'next/server';
import { getZomatoMenu } from '@/lib/zomato/scraper';
import {
  checkRateLimit,
  getCachedMenu,
  setCachedMenu,
} from '@/lib/cache/redis';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const restaurantSlug = searchParams.get('slug');
  const city = searchParams.get('city') || 'bangalore';

  // Validate parameters
  if (!restaurantSlug) {
    return NextResponse.json(
      { error: 'Restaurant slug is required' },
      { status: 400 }
    );
  }

  // Rate limiting (more strict for scraping)
  const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = await checkRateLimit(`zomato:menu:${clientIp}`, 10, 60);

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
    // Check cache first
    const cached = await getCachedMenu('zomato', restaurantSlug);
    if (cached) {
      return NextResponse.json({
        success: true,
        cached: true,
        data: cached,
      });
    }

    // Scrape menu from Zomato
    const menu = await getZomatoMenu(restaurantSlug, city);

    // Cache the results
    await setCachedMenu('zomato', restaurantSlug, menu);

    return NextResponse.json({
      success: true,
      cached: false,
      data: menu,
    });
  } catch (error) {
    console.error('Zomato menu API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch menu from Zomato',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Increase timeout for scraping operations
export const maxDuration = 30;
