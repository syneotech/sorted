'use client';

import { useState } from 'react';
import type { FilterState } from '@/lib/filters/types';
import type { SortOption } from '@/lib/sorting/types';
import { DEFAULT_FILTER_STATE, countActiveFilters } from '@/lib/filters/types';
import { useIsMobile } from '@/hooks/useMediaQuery';
import MobileFilterDrawer from '@/components/MobileFilterDrawer';
import CuisineFilter from './CuisineFilter';
import DietaryFilter from './DietaryFilter';
import PriceFilter from './PriceFilter';
import RatingFilter from './RatingFilter';
import DeliveryTimeFilter from './DeliveryTimeFilter';
import PlatformFilter from './PlatformFilter';
import SortDropdown from './SortDropdown';
import ActiveFilters from './ActiveFilters';

interface FilterBarProps {
  filters: FilterState;
  sortBy: SortOption;
  onFiltersChange: (filters: FilterState) => void;
  onSortChange: (sort: SortOption) => void;
  availableCuisines?: string[];
  resultCount?: number;
  totalCount?: number;
}

export default function FilterBar({
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
  availableCuisines,
  resultCount,
  totalCount,
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const activeCount = countActiveFilters(filters);

  const handleClearFilter = (key: keyof FilterState, value?: string) => {
    const newFilters = { ...filters };

    switch (key) {
      case 'cuisines':
        if (value) {
          newFilters.cuisines = filters.cuisines.filter(c => c !== value);
        } else {
          newFilters.cuisines = [];
        }
        break;
      case 'priceRange':
        if (value) {
          newFilters.priceRange = filters.priceRange.filter(p => p !== value);
        } else {
          newFilters.priceRange = [];
        }
        break;
      case 'dietary':
        newFilters.dietary = 'all';
        break;
      case 'minRating':
        newFilters.minRating = 'any';
        break;
      case 'maxDeliveryTime':
        newFilters.maxDeliveryTime = 'any';
        break;
      case 'platform':
        newFilters.platform = 'all';
        break;
    }

    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    onFiltersChange(DEFAULT_FILTER_STATE);
  };

  // Mobile: Show simplified bar with button to open drawer
  if (isMobile) {
    return (
      <>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors min-h-[44px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {activeCount > 0 && (
              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                {activeCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-3">
            {resultCount !== undefined && totalCount !== undefined && (
              <span className="text-sm text-gray-500 hidden xs:inline">
                {resultCount} of {totalCount}
              </span>
            )}
            <SortDropdown selected={sortBy} onChange={onSortChange} />
          </div>
        </div>

        <MobileFilterDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          filters={filters}
          sortBy={sortBy}
          onFiltersChange={onFiltersChange}
          onSortChange={onSortChange}
          availableCuisines={availableCuisines}
          resultCount={resultCount}
        />
      </>
    );
  }

  // Desktop: Full filter bar
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      {/* Header row with toggle and sort */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="font-medium">Filters</span>
            {activeCount > 0 && (
              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                {activeCount}
              </span>
            )}
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {resultCount !== undefined && totalCount !== undefined && (
            <span className="text-sm text-gray-500">
              Showing {resultCount} of {totalCount} restaurants
            </span>
          )}
        </div>

        <SortDropdown selected={sortBy} onChange={onSortChange} />
      </div>

      {/* Active filters summary */}
      <ActiveFilters
        filters={filters}
        onClearFilter={handleClearFilter}
        onClearAll={handleClearAll}
      />

      {/* Expanded filter options */}
      {isExpanded && (
        <div className="pt-4 border-t border-gray-200 space-y-6">
          <CuisineFilter
            selected={filters.cuisines}
            onChange={cuisines => onFiltersChange({ ...filters, cuisines })}
            availableCuisines={availableCuisines}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DietaryFilter
              selected={filters.dietary}
              onChange={dietary => onFiltersChange({ ...filters, dietary })}
            />

            <PriceFilter
              selected={filters.priceRange}
              onChange={priceRange => onFiltersChange({ ...filters, priceRange })}
            />

            <RatingFilter
              selected={filters.minRating}
              onChange={minRating => onFiltersChange({ ...filters, minRating })}
            />

            <DeliveryTimeFilter
              selected={filters.maxDeliveryTime}
              onChange={maxDeliveryTime => onFiltersChange({ ...filters, maxDeliveryTime })}
            />
          </div>

          <PlatformFilter
            selected={filters.platform}
            onChange={platform => onFiltersChange({ ...filters, platform })}
          />
        </div>
      )}
    </div>
  );
}
