// Unified filter and sort engine

import type { ComparisonRestaurant } from '../comparison/normalizer';
import type { FilterState } from './types';
import type { SortOption } from '../sorting/types';
import { filterByCuisine } from './cuisine';
import { filterByDietary } from './dietary';
import { filterByPrice } from './price';
import { filterByRating } from './rating';
import { filterByDeliveryTime } from './delivery';
import { filterByPlatform } from './platform';
import { sortRestaurants } from '../sorting/sorter';
import { DEFAULT_FILTER_STATE } from './types';

export interface SearchProcessorOptions {
  filters: Partial<FilterState>;
  sortBy: SortOption;
}

export interface ProcessedResults {
  restaurants: ComparisonRestaurant[];
  totalCount: number;
  filteredCount: number;
  appliedFilters: string[];
}

/**
 * Apply all filters and sorting to restaurant results
 */
export function processSearchResults(
  restaurants: ComparisonRestaurant[],
  options: SearchProcessorOptions
): ProcessedResults {
  const { filters, sortBy } = options;
  const mergedFilters: FilterState = {
    ...DEFAULT_FILTER_STATE,
    ...filters,
  };

  const appliedFilters: string[] = [];
  let filtered = restaurants;

  // Apply cuisine filter
  if (mergedFilters.cuisines.length > 0) {
    filtered = filterByCuisine(filtered, mergedFilters.cuisines);
    appliedFilters.push(`Cuisines: ${mergedFilters.cuisines.join(', ')}`);
  }

  // Apply dietary filter
  if (mergedFilters.dietary !== 'all') {
    filtered = filterByDietary(filtered, mergedFilters.dietary);
    appliedFilters.push(`Dietary: ${mergedFilters.dietary}`);
  }

  // Apply price filter
  if (mergedFilters.priceRange.length > 0) {
    filtered = filterByPrice(filtered, mergedFilters.priceRange);
    appliedFilters.push(`Price: ${mergedFilters.priceRange.join(', ')}`);
  }

  // Apply rating filter
  if (mergedFilters.minRating !== 'any') {
    filtered = filterByRating(filtered, mergedFilters.minRating);
    appliedFilters.push(`Rating: ${mergedFilters.minRating}`);
  }

  // Apply delivery time filter
  if (mergedFilters.maxDeliveryTime !== 'any') {
    filtered = filterByDeliveryTime(filtered, mergedFilters.maxDeliveryTime);
    appliedFilters.push(`Delivery: Under ${mergedFilters.maxDeliveryTime} min`);
  }

  // Apply platform filter
  if (mergedFilters.platform !== 'all') {
    filtered = filterByPlatform(filtered, mergedFilters.platform);
    appliedFilters.push(`Platform: ${mergedFilters.platform}`);
  }

  // Apply sorting
  const sorted = sortRestaurants(filtered, sortBy);

  return {
    restaurants: sorted,
    totalCount: restaurants.length,
    filteredCount: sorted.length,
    appliedFilters,
  };
}

/**
 * Parse filter parameters from URL query string
 */
export function parseFiltersFromQuery(
  params: URLSearchParams
): Partial<FilterState> {
  const filters: Partial<FilterState> = {};

  // Cuisines (comma-separated)
  const cuisines = params.get('cuisines');
  if (cuisines) {
    filters.cuisines = cuisines.split(',').map(c => c.trim()).filter(Boolean);
  }

  // Dietary
  const dietary = params.get('dietary');
  if (dietary === 'veg' || dietary === 'non-veg' || dietary === 'all') {
    filters.dietary = dietary;
  }

  // Price range (comma-separated)
  const priceRange = params.get('price');
  if (priceRange) {
    const validRanges = ['budget', 'moderate', 'premium'];
    filters.priceRange = priceRange
      .split(',')
      .map(p => p.trim())
      .filter(p => validRanges.includes(p)) as FilterState['priceRange'];
  }

  // Rating
  const rating = params.get('rating');
  if (rating === '3+' || rating === '3.5+' || rating === '4+' || rating === '4.5+') {
    filters.minRating = rating;
  }

  // Delivery time
  const deliveryTime = params.get('delivery');
  if (deliveryTime === '30' || deliveryTime === '45' || deliveryTime === '60') {
    filters.maxDeliveryTime = deliveryTime;
  }

  // Platform
  const platform = params.get('platform');
  if (platform === 'matched' || platform === 'swiggy' || platform === 'zomato') {
    filters.platform = platform;
  }

  return filters;
}

/**
 * Parse sort option from URL query string
 */
export function parseSortFromQuery(params: URLSearchParams): SortOption {
  const sort = params.get('sort');
  const validSorts: SortOption[] = [
    'relevance',
    'price-low',
    'price-high',
    'rating',
    'delivery-time',
    'savings',
  ];

  if (sort && validSorts.includes(sort as SortOption)) {
    return sort as SortOption;
  }

  return 'relevance';
}

/**
 * Build URL query string from filters and sort
 */
export function buildFilterQueryString(
  filters: Partial<FilterState>,
  sortBy: SortOption
): string {
  const params = new URLSearchParams();

  if (filters.cuisines && filters.cuisines.length > 0) {
    params.set('cuisines', filters.cuisines.join(','));
  }

  if (filters.dietary && filters.dietary !== 'all') {
    params.set('dietary', filters.dietary);
  }

  if (filters.priceRange && filters.priceRange.length > 0) {
    params.set('price', filters.priceRange.join(','));
  }

  if (filters.minRating && filters.minRating !== 'any') {
    params.set('rating', filters.minRating);
  }

  if (filters.maxDeliveryTime && filters.maxDeliveryTime !== 'any') {
    params.set('delivery', filters.maxDeliveryTime);
  }

  if (filters.platform && filters.platform !== 'all') {
    params.set('platform', filters.platform);
  }

  if (sortBy !== 'relevance') {
    params.set('sort', sortBy);
  }

  return params.toString();
}
