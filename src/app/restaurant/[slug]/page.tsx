'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import MenuComparison from '@/components/MenuComparison';
import Skeleton from '@/components/ui/Skeleton';
import { SkeletonMenuList } from '@/components/SkeletonMenuItem';
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

function RestaurantContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = params.slug as string;
  const swiggyId = searchParams.get('swiggy_id');
  const zomatoSlug = searchParams.get('zomato_slug');
  const lat = searchParams.get('lat') || '12.97';
  const lng = searchParams.get('lng') || '77.59';
  const city = searchParams.get('city') || 'bangalore';

  const [result, setResult] = useState<MenuComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const restaurantName = decodeURIComponent(slug).replace(/-/g, ' ');

  const fetchComparison = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (swiggyId) params.append('swiggy_id', swiggyId);
      if (zomatoSlug) params.append('zomato_slug', zomatoSlug);
      params.append('lat', lat);
      params.append('lng', lng);
      params.append('city', city);

      const response = await fetch(`/api/restaurant?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch menu comparison');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [swiggyId, zomatoSlug, lat, lng, city]);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  // Build deep links
  const swiggyLink = swiggyId
    ? `https://www.swiggy.com/restaurants/${slug}-${swiggyId}`
    : undefined;
  const zomatoLink = zomatoSlug
    ? `https://www.zomato.com/${city}/${zomatoSlug}/order`
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
            >
              Sorted
            </Link>
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/search" className="hover:text-gray-700">
                Search
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium capitalize">{restaurantName}</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Restaurant Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize mb-2">
                {restaurantName}
              </h1>
              <div className="flex items-center gap-3">
                {swiggyId && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                    Swiggy
                  </span>
                )}
                {zomatoSlug && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    Zomato
                  </span>
                )}
                {result?.cached && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Cached
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            {result && (
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{result.stats.totalSwiggy}</p>
                  <p className="text-gray-500">Swiggy items</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{result.stats.totalZomato}</p>
                  <p className="text-gray-500">Zomato items</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{result.stats.matched}</p>
                  <p className="text-gray-500">Matched</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            {/* Pricing summary skeleton */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            </div>

            {/* Filter bar skeleton */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>

            {/* Menu items skeleton */}
            <SkeletonMenuList categoryCount={3} />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg
              className="w-12 h-12 text-red-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={fetchComparison}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Menu Comparison */}
        {result && !loading && (
          <MenuComparison
            menuItems={result.menuComparison}
            categories={result.categories}
            pricing={result.pricing}
            swiggyLink={swiggyLink}
            zomatoLink={zomatoLink}
          />
        )}

        {/* Empty State */}
        {result && !loading && result.menuComparison.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-500 mb-4">No menu items found for this restaurant</p>
            <div className="flex justify-center gap-4">
              {swiggyLink && (
                <a
                  href={swiggyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  View on Swiggy
                </a>
              )}
              {zomatoLink && (
                <a
                  href={zomatoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  View on Zomato
                </a>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function RestaurantPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      }
    >
      <RestaurantContent />
    </Suspense>
  );
}
