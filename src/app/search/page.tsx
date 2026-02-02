'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import LocationPicker from '@/components/LocationPicker';
import ComparisonCard from '@/components/ComparisonCard';
import { FilterBar } from '@/components/filters';
import { SkeletonCardGrid } from '@/components/SkeletonCard';
import LoadingProgress from '@/components/LoadingProgress';
import PartialResultsBanner, { TotalFailureBanner } from '@/components/PartialResultsBanner';
import { InitialSearchEmpty, NoFilteredResultsEmpty } from '@/components/EmptyState';
import SearchSuggestions from '@/components/SearchSuggestions';
import type { ComparisonRestaurant } from '@/lib/comparison/normalizer';
import type { FilterState } from '@/lib/filters/types';
import type { SortOption } from '@/lib/sorting/types';
import { DEFAULT_FILTER_STATE } from '@/lib/filters/types';
import { DEFAULT_SORT } from '@/lib/sorting/types';
import {
  parseFiltersFromQuery,
  parseSortFromQuery,
  buildFilterQueryString,
} from '@/lib/filters/engine';
import { getUniqueCuisines } from '@/lib/filters/cuisine';

interface Location {
  lat: number;
  lng: number;
  city: string;
  address?: string;
}

interface PlatformStatus {
  success: boolean;
  error?: string;
  count: number;
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
  filtered: {
    totalCount: number;
    filteredCount: number;
    appliedFilters: string[];
  };
  platformStatus?: {
    swiggy: PlatformStatus;
    zomato: PlatformStatus;
  };
  cached: boolean;
}

function SearchContent() {
  const router = useRouter();
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

  // Filter and sort state
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...DEFAULT_FILTER_STATE,
    ...parseFiltersFromQuery(searchParams),
  }));
  const [sortBy, setSortBy] = useState<SortOption>(() =>
    parseSortFromQuery(searchParams)
  );

  // Available cuisines from results (for filter UI)
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);

  // Build URL with all params
  const buildUrl = useCallback(
    (searchQuery: string, loc: Location, filterState: FilterState, sort: SortOption) => {
      const params = new URLSearchParams({
        q: searchQuery,
        lat: loc.lat.toString(),
        lng: loc.lng.toString(),
        city: loc.city,
      });

      const filterQuery = buildFilterQueryString(filterState, sort);
      const filterParams = new URLSearchParams(filterQuery);
      filterParams.forEach((value, key) => {
        params.set(key, value);
      });

      return `/search?${params.toString()}`;
    },
    []
  );

  const performSearch = useCallback(
    async (searchQuery: string, loc: Location, filterState: FilterState, sort: SortOption) => {
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

        // Add filter and sort params
        const filterQuery = buildFilterQueryString(filterState, sort);
        const filterParams = new URLSearchParams(filterQuery);
        filterParams.forEach((value, key) => {
          params.set(key, value);
        });

        const response = await fetch(`/api/search?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Search failed');
        }

        setResults(data);

        // Extract available cuisines for filter UI
        if (data.comparisons) {
          const cuisines = getUniqueCuisines(data.comparisons);
          setAvailableCuisines(cuisines);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial search on mount
  useEffect(() => {
    if (query) {
      performSearch(query, location, filters, sortBy);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      const url = buildUrl(newQuery, location, filters, sortBy);
      router.push(url);
      performSearch(newQuery, location, filters, sortBy);
    },
    [location, filters, sortBy, buildUrl, router, performSearch]
  );

  const handleLocationChange = useCallback(
    (newLocation: Location) => {
      setLocation(newLocation);
      if (query) {
        const url = buildUrl(query, newLocation, filters, sortBy);
        router.push(url);
        performSearch(query, newLocation, filters, sortBy);
      }
    },
    [query, filters, sortBy, buildUrl, router, performSearch]
  );

  const handleFiltersChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      if (query) {
        const url = buildUrl(query, location, newFilters, sortBy);
        router.replace(url, { scroll: false });
        performSearch(query, location, newFilters, sortBy);
      }
    },
    [query, location, sortBy, buildUrl, router, performSearch]
  );

  const handleSortChange = useCallback(
    (newSort: SortOption) => {
      setSortBy(newSort);
      if (query) {
        const url = buildUrl(query, location, filters, newSort);
        router.replace(url, { scroll: false });
        performSearch(query, location, filters, newSort);
      }
    },
    [query, location, filters, buildUrl, router, performSearch]
  );

  // Handler for retrying a single platform
  const handlePlatformRetry = useCallback(
    (_platform: 'swiggy' | 'zomato') => {
      // For now, just retry the full search
      // In a more advanced implementation, you could retry only the failed platform
      if (query) {
        performSearch(query, location, filters, sortBy);
      }
    },
    [query, location, filters, sortBy, performSearch]
  );

  // Check if we have total failure (both platforms failed)
  const hasTotalFailure = results?.platformStatus &&
    !results.platformStatus.swiggy.success &&
    !results.platformStatus.zomato.success;

  // Check if we have partial results
  const hasPartialResults = results?.platformStatus &&
    ((results.platformStatus.swiggy.success && !results.platformStatus.zomato.success) ||
    (!results.platformStatus.swiggy.success && results.platformStatus.zomato.success));

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
      <main className="max-w-7xl mx-auto px-4 py-8" role="main">
        {/* Screen reader announcement for results */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {loading && 'Searching restaurants...'}
          {results && !loading && (
            `Showing ${results.filtered?.filteredCount ?? results.comparisons.length} restaurants`
          )}
          {error && !loading && `Error: ${error}`}
        </div>
        {/* Loading State */}
        {loading && (
          <div className="space-y-8">
            {/* Loading progress indicator */}
            <div className="py-8">
              <LoadingProgress />
            </div>

            {/* Skeleton cards */}
            <SkeletonCardGrid count={6} />
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
              onClick={() => performSearch(query, location, filters, sortBy)}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Total Failure State */}
        {results && !loading && hasTotalFailure && (
          <TotalFailureBanner onRetry={() => performSearch(query, location, filters, sortBy)} />
        )}

        {/* Results */}
        {results && !loading && !hasTotalFailure && (
          <>
            {/* Partial Results Banner */}
            {hasPartialResults && results.platformStatus && (
              <PartialResultsBanner
                platformStatus={results.platformStatus}
                onRetry={handlePlatformRetry}
              />
            )}

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

            {/* Filter Bar */}
            <div className="mb-6">
              <FilterBar
                filters={filters}
                sortBy={sortBy}
                onFiltersChange={handleFiltersChange}
                onSortChange={handleSortChange}
                availableCuisines={availableCuisines}
                resultCount={results.filtered?.filteredCount ?? results.comparisons.length}
                totalCount={results.filtered?.totalCount ?? results.comparisons.length}
              />
            </div>

            {/* Restaurant Grid */}
            {results.comparisons && results.comparisons.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.comparisons.map((comparison) => (
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
              <NoFilteredResultsEmpty
                onClearFilters={() => {
                  setFilters(DEFAULT_FILTER_STATE);
                  setSortBy(DEFAULT_SORT);
                  if (query) {
                    performSearch(query, location, DEFAULT_FILTER_STATE, DEFAULT_SORT);
                  }
                }}
              >
                <SearchSuggestions onSelect={handleSearch} />
              </NoFilteredResultsEmpty>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && !results && (
          <InitialSearchEmpty>
            <SearchSuggestions onSelect={handleSearch} />
          </InitialSearchEmpty>
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
