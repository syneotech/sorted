// Filter types for restaurant search

export interface FilterState {
  /** Selected cuisines (multi-select) */
  cuisines: string[];
  /** Dietary preference */
  dietary: DietaryFilter;
  /** Price range */
  priceRange: PriceRange[];
  /** Minimum rating */
  minRating: RatingFilter;
  /** Maximum delivery time in minutes */
  maxDeliveryTime: DeliveryTimeFilter;
  /** Platform availability */
  platform: PlatformFilter;
}

export type DietaryFilter = 'all' | 'veg' | 'non-veg';

export type PriceRange = 'budget' | 'moderate' | 'premium';
// budget: ₹0-300, moderate: ₹300-600, premium: ₹600+

export type RatingFilter = 'any' | '3+' | '3.5+' | '4+' | '4.5+';

export type DeliveryTimeFilter = 'any' | '30' | '45' | '60';

export type PlatformFilter = 'all' | 'matched' | 'swiggy' | 'zomato';

export interface FilterConfig {
  id: string;
  label: string;
  type: 'single' | 'multi' | 'range';
}

export const PRICE_RANGES: Record<PriceRange, { min: number; max: number; label: string }> = {
  budget: { min: 0, max: 300, label: '₹' },
  moderate: { min: 300, max: 600, label: '₹₹' },
  premium: { min: 600, max: Infinity, label: '₹₹₹' },
};

export const RATING_VALUES: Record<RatingFilter, number> = {
  'any': 0,
  '3+': 3.0,
  '3.5+': 3.5,
  '4+': 4.0,
  '4.5+': 4.5,
};

export const DELIVERY_TIME_VALUES: Record<DeliveryTimeFilter, number> = {
  'any': Infinity,
  '30': 30,
  '45': 45,
  '60': 60,
};

export const DEFAULT_FILTER_STATE: FilterState = {
  cuisines: [],
  dietary: 'all',
  priceRange: [],
  minRating: 'any',
  maxDeliveryTime: 'any',
  platform: 'all',
};

/**
 * Check if any filters are active (non-default)
 */
export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.cuisines.length > 0 ||
    filters.dietary !== 'all' ||
    filters.priceRange.length > 0 ||
    filters.minRating !== 'any' ||
    filters.maxDeliveryTime !== 'any' ||
    filters.platform !== 'all'
  );
}

/**
 * Count active filters
 */
export function countActiveFilters(filters: FilterState): number {
  let count = 0;
  if (filters.cuisines.length > 0) count += filters.cuisines.length;
  if (filters.dietary !== 'all') count++;
  if (filters.priceRange.length > 0) count += filters.priceRange.length;
  if (filters.minRating !== 'any') count++;
  if (filters.maxDeliveryTime !== 'any') count++;
  if (filters.platform !== 'all') count++;
  return count;
}
