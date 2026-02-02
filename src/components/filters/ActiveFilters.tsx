'use client';

import type { FilterState } from '@/lib/filters/types';
import { hasActiveFilters } from '@/lib/filters/types';
import { PRICE_RANGES } from '@/lib/filters/types';

interface ActiveFiltersProps {
  filters: FilterState;
  onClearFilter: (filterKey: keyof FilterState, value?: string) => void;
  onClearAll: () => void;
}

export default function ActiveFilters({
  filters,
  onClearFilter,
  onClearAll,
}: ActiveFiltersProps) {
  if (!hasActiveFilters(filters)) {
    return null;
  }

  const activeFilterTags: { key: keyof FilterState; label: string; value?: string }[] = [];

  // Cuisines
  filters.cuisines.forEach(cuisine => {
    activeFilterTags.push({ key: 'cuisines', label: cuisine, value: cuisine });
  });

  // Dietary
  if (filters.dietary !== 'all') {
    const label = filters.dietary === 'veg' ? 'Vegetarian' : 'Non-Vegetarian';
    activeFilterTags.push({ key: 'dietary', label });
  }

  // Price
  filters.priceRange.forEach(range => {
    activeFilterTags.push({
      key: 'priceRange',
      label: `Price: ${PRICE_RANGES[range].label}`,
      value: range,
    });
  });

  // Rating
  if (filters.minRating !== 'any') {
    activeFilterTags.push({ key: 'minRating', label: `Rating: ${filters.minRating}` });
  }

  // Delivery time
  if (filters.maxDeliveryTime !== 'any') {
    activeFilterTags.push({
      key: 'maxDeliveryTime',
      label: `Delivery: <${filters.maxDeliveryTime} min`,
    });
  }

  // Platform
  if (filters.platform !== 'all') {
    const labels: Record<string, string> = {
      matched: 'Both Platforms',
      swiggy: 'Swiggy Only',
      zomato: 'Zomato Only',
    };
    activeFilterTags.push({ key: 'platform', label: labels[filters.platform] });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-500">Active filters:</span>
      {activeFilterTags.map((tag, index) => (
        <span
          key={`${tag.key}-${tag.value || index}`}
          className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
        >
          {tag.label}
          <button
            type="button"
            onClick={() => onClearFilter(tag.key, tag.value)}
            className="hover:text-orange-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
