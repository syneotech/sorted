import { NextRequest, NextResponse } from 'next/server';
import { getSwiggyMenu } from '@/lib/swiggy/client';
import {
  checkRateLimit,
  getCachedMenu,
  setCachedMenu,
} from '@/lib/cache/redis';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const restaurantId = searchParams.get('restaurantId');
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');

  // Validate parameters
  if (!restaurantId) {
    return NextResponse.json(
      { error: 'Restaurant ID is required' },
      { status: 400 }
    );
  }

  if (lat === 0 || lng === 0) {
    return NextResponse.json(
      { error: 'Valid latitude and longitude are required' },
      { status: 400 }
    );
  }

  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = await checkRateLimit(`swiggy:menu:${clientIp}`, 20, 60);

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
    const cached = await getCachedMenu('swiggy', restaurantId);
    if (cached) {
      return NextResponse.json({
        success: true,
        cached: true,
        data: cached,
      });
    }

    // Fetch menu from Swiggy
    const menu = await getSwiggyMenu(restaurantId, lat, lng);

    // Cache the results
    await setCachedMenu('swiggy', restaurantId, menu);

    return NextResponse.json({
      success: true,
      cached: false,
      data: menu,
    });
  } catch (error) {
    console.error('Swiggy menu API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch menu from Swiggy',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
