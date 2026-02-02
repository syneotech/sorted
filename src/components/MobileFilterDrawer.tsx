'use client';

import { useEffect, useRef } from 'react';
import type { FilterState } from '@/lib/filters/types';
import type { SortOption } from '@/lib/sorting/types';
import { DEFAULT_FILTER_STATE, countActiveFilters } from '@/lib/filters/types';
import CuisineFilter from './filters/CuisineFilter';
import DietaryFilter from './filters/DietaryFilter';
import PriceFilter from './filters/PriceFilter';
import RatingFilter from './filters/RatingFilter';
import DeliveryTimeFilter from './filters/DeliveryTimeFilter';
import PlatformFilter from './filters/PlatformFilter';
import SortDropdown from './filters/SortDropdown';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  sortBy: SortOption;
  onFiltersChange: (filters: FilterState) => void;
  onSortChange: (sort: SortOption) => void;
  availableCuisines?: string[];
  resultCount?: number;
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
  availableCuisines,
  resultCount,
}: MobileFilterDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const activeCount = countActiveFilters(filters);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClearAll = () => {
    onFiltersChange(DEFAULT_FILTER_STATE);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filter options"
        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl transform transition-transform duration-300 ease-out max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            {activeCount > 0 && (
              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-500 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close filters"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <SortDropdown selected={sortBy} onChange={onSortChange} />
          </div>

          {/* Cuisines */}
          <CuisineFilter
            selected={filters.cuisines}
            onChange={cuisines => onFiltersChange({ ...filters, cuisines })}
            availableCuisines={availableCuisines}
          />

          {/* Dietary */}
          <DietaryFilter
            selected={filters.dietary}
            onChange={dietary => onFiltersChange({ ...filters, dietary })}
          />

          {/* Price Range */}
          <PriceFilter
            selected={filters.priceRange}
            onChange={priceRange => onFiltersChange({ ...filters, priceRange })}
          />

          {/* Rating */}
          <RatingFilter
            selected={filters.minRating}
            onChange={minRating => onFiltersChange({ ...filters, minRating })}
          />

          {/* Delivery Time */}
          <DeliveryTimeFilter
            selected={filters.maxDeliveryTime}
            onChange={maxDeliveryTime => onFiltersChange({ ...filters, maxDeliveryTime })}
          />

          {/* Platform */}
          <PlatformFilter
            selected={filters.platform}
            onChange={platform => onFiltersChange({ ...filters, platform })}
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-200 bg-white flex gap-3">
          <button
            onClick={handleClearAll}
            disabled={activeCount === 0}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            Clear all
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-white bg-orange-500 rounded-lg font-medium hover:bg-orange-600 transition-colors min-h-[44px]"
          >
            Show {resultCount ?? 0} results
          </button>
        </div>
      </div>
    </>
  );
}
