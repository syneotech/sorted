import { NextRequest, NextResponse } from 'next/server';
import { searchZomatoRestaurants } from '@/lib/zomato/scraper';
import {
  checkRateLimit,
  getCachedSearch,
  setCachedSearch,
} from '@/lib/cache/redis';

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

  // Rate limiting (more strict for scraping)
  const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = await checkRateLimit(`zomato:${clientIp}`, 10, 60);

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
    const cached = await getCachedSearch(`zomato:${query}:${city}`, lat, lng);
    if (cached?.zomato) {
      return NextResponse.json({
        success: true,
        cached: true,
        data: cached.zomato,
      });
    }

    // Scrape from Zomato
    const restaurants = await searchZomatoRestaurants(
      lat,
      lng,
      query || undefined,
      city
    );

    // Cache the results
    await setCachedSearch(`zomato:${query}:${city}`, lat, lng, {
      swiggy: [],
      zomato: restaurants,
    });

    return NextResponse.json({
      success: true,
      cached: false,
      data: restaurants,
    });
  } catch (error) {
    console.error('Zomato restaurants API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch restaurants from Zomato',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Increase timeout for scraping operations
export const maxDuration = 30;
