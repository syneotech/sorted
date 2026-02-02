'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import LocationPicker from '@/components/LocationPicker';
import ComparisonCard from '@/components/ComparisonCard';
import type { ComparisonRestaurant } from '@/lib/comparison/normalizer';

interface Location {
  lat: number;
  lng: number;
  city: string;
  address?: string;
}

interface SearchResult {
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

function SearchContent() {
  const searchParams = useSearchParams();

  const [location, setLocation] = useState<Location>({
    lat: parseFloat(searchParams.get('lat') || '12.9716'),
    lng: parseFloat(searchParams.get('lng') || '77.5946'),
    city: searchParams.get('city') || 'bangalore',
  });
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'matched' | 'swiggy' | 'zomato'>('all');

  const performSearch = useCallback(async (searchQuery: string, loc: Location) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        lat: loc.lat.toString(),
        lng: loc.lng.toString(),
        city: loc.city,
      });

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial search on mount
  useEffect(() => {
    if (query) {
      performSearch(query, location);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      // Update URL
      const params = new URLSearchParams({
        q: newQuery,
        lat: location.lat.toString(),
        lng: location.lng.toString(),
        city: location.city,
      });
      window.history.pushState({}, '', `/search?${params.toString()}`);
      performSearch(newQuery, location);
    },
    [location, performSearch]
  );

  const handleLocationChange = useCallback(
    (newLocation: Location) => {
      setLocation(newLocation);
      if (query) {
        // Update URL
        const params = new URLSearchParams({
          q: query,
          lat: newLocation.lat.toString(),
          lng: newLocation.lng.toString(),
          city: newLocation.city,
        });
        window.history.pushState({}, '', `/search?${params.toString()}`);
        performSearch(query, newLocation);
      }
    },
    [query, performSearch]
  );

  const filteredComparisons = results?.comparisons.filter((c) => {
    switch (filter) {
      case 'matched':
        return c.swiggy && c.zomato;
      case 'swiggy':
        return c.swiggy && !c.zomato;
      case 'zomato':
        return !c.swiggy && c.zomato;
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent shrink-0"
            >
              Sorted
            </Link>
            <div className="flex-1 max-w-xl">
              <SearchBar initialQuery={query} onSearch={handleSearch} />
            </div>
            <LocationPicker
              onLocationChange={handleLocationChange}
              initialLocation={location}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Searching Swiggy & Zomato...</p>
            <p className="text-sm text-gray-400 mt-1">This may take a few seconds</p>
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
              onClick={() => performSearch(query, location)}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <>
            {/* Stats Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-sm">
                    <span className="text-gray-500">Results for</span>{' '}
                    <span className="font-semibold text-gray-900">&quot;{results.query}&quot;</span>
                  </div>
                  {results.cached && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Cached
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-gray-600">{results.stats.matched} matched</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-orange-500 rounded-full" />
                    <span className="text-gray-600">{results.stats.swiggyOnly} Swiggy only</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-gray-600">{results.stats.zomatoOnly} Zomato only</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {[
                { key: 'all', label: 'All', count: results.comparisons.length },
                { key: 'matched', label: 'Matched', count: results.stats.matched },
                { key: 'swiggy', label: 'Swiggy Only', count: results.stats.swiggyOnly },
                { key: 'zomato', label: 'Zomato Only', count: results.stats.zomatoOnly },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as typeof filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === key
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            {/* Restaurant Grid */}
            {filteredComparisons && filteredComparisons.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredComparisons.map((comparison) => (
                  <ComparisonCard
                    key={comparison.matchId}
                    comparison={comparison}
                    lat={location.lat}
                    lng={location.lng}
                    city={location.city}
                  />
                ))}
              </div>
            ) : (
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
                <p className="text-gray-500">No restaurants found matching this filter</p>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && !results && (
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-gray-500">Search for restaurants or dishes to compare prices</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
