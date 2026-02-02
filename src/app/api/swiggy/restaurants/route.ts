import { NextRequest, NextResponse } from 'next/server';
import { searchSwiggyRestaurants } from '@/lib/swiggy/client';
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

  // Validate coordinates
  if (lat === 0 || lng === 0) {
    return NextResponse.json(
      { error: 'Valid latitude and longitude are required' },
      { status: 400 }
    );
  }

  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = await checkRateLimit(`swiggy:${clientIp}`, 30, 60);

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
    const cached = await getCachedSearch(`swiggy:${query}`, lat, lng);
    if (cached?.swiggy) {
      return NextResponse.json({
        success: true,
        cached: true,
        data: cached.swiggy,
      });
    }

    // Fetch from Swiggy
    const restaurants = await searchSwiggyRestaurants(lat, lng, query || undefined);

    // Cache the results
    await setCachedSearch(`swiggy:${query}`, lat, lng, {
      swiggy: restaurants,
      zomato: [],
    });

    return NextResponse.json({
      success: true,
      cached: false,
      data: restaurants,
    });
  } catch (error) {
    console.error('Swiggy restaurants API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch restaurants from Swiggy',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
