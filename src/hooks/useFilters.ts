'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { FilterState } from '@/lib/filters/types';
import type { SortOption } from '@/lib/sorting/types';
import { DEFAULT_FILTER_STATE } from '@/lib/filters/types';
import { DEFAULT_SORT } from '@/lib/sorting/types';
import {
  parseFiltersFromQuery,
  parseSortFromQuery,
  buildFilterQueryString,
} from '@/lib/filters/engine';

interface UseFiltersReturn {
  filters: FilterState;
  sortBy: SortOption;
  setFilters: (filters: FilterState) => void;
  setSortBy: (sort: SortOption) => void;
  resetFilters: () => void;
  updateUrl: boolean;
}

interface UseFiltersOptions {
  updateUrl?: boolean;
}

export function useFilters(options: UseFiltersOptions = {}): UseFiltersReturn {
  const { updateUrl = true } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize from URL
  const [filters, setFiltersState] = useState<FilterState>(() => ({
    ...DEFAULT_FILTER_STATE,
    ...parseFiltersFromQuery(searchParams),
  }));

  const [sortBy, setSortByState] = useState<SortOption>(() =>
    parseSortFromQuery(searchParams)
  );

  // Update URL when filters/sort change
  const updateUrlParams = useCallback(
    (newFilters: FilterState, newSort: SortOption) => {
      if (!updateUrl) return;

      const query = searchParams.get('q') || '';
      const filterQuery = buildFilterQueryString(newFilters, newSort);

      // Build new URL preserving search query
      const params = new URLSearchParams();
      if (query) params.set('q', query);

      // Append filter params
      const filterParams = new URLSearchParams(filterQuery);
      filterParams.forEach((value, key) => {
        params.set(key, value);
      });

      const newUrl = `${pathname}?${params.toString()}`;
      router.replace(newUrl, { scroll: false });
    },
    [router, pathname, searchParams, updateUrl]
  );

  const setFilters = useCallback(
    (newFilters: FilterState) => {
      setFiltersState(newFilters);
      updateUrlParams(newFilters, sortBy);
    },
    [sortBy, updateUrlParams]
  );

  const setSortBy = useCallback(
    (newSort: SortOption) => {
      setSortByState(newSort);
      updateUrlParams(filters, newSort);
    },
    [filters, updateUrlParams]
  );

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTER_STATE);
    setSortByState(DEFAULT_SORT);
    if (updateUrl) {
      const query = searchParams.get('q') || '';
      const newUrl = query ? `${pathname}?q=${encodeURIComponent(query)}` : pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [router, pathname, searchParams, updateUrl]);

  // Sync with URL on navigation
  useEffect(() => {
    const urlFilters = parseFiltersFromQuery(searchParams);
    const urlSort = parseSortFromQuery(searchParams);

    setFiltersState({ ...DEFAULT_FILTER_STATE, ...urlFilters });
    setSortByState(urlSort);
  }, [searchParams]);

  return {
    filters,
    sortBy,
    setFilters,
    setSortBy,
    resetFilters,
    updateUrl,
  };
}
