// Price range filter implementation

import type { ComparisonRestaurant } from '../comparison/normalizer';
import type { PriceRange } from './types';
import { PRICE_RANGES } from './types';

/**
 * Filter restaurants by price range
 * Uses the lower cost-for-two value from either platform
 */
export function filterByPrice(
  restaurants: ComparisonRestaurant[],
  selectedRanges: PriceRange[]
): ComparisonRestaurant[] {
  if (selectedRanges.length === 0) {
    return restaurants;
  }

  return restaurants.filter(restaurant => {
    const price = getLowestPrice(restaurant);
    if (price === null) return true; // Include if no price info

    return selectedRanges.some(range => {
      const { min, max } = PRICE_RANGES[range];
      return price >= min && price < max;
    });
  });
}

/**
 * Get the lowest cost-for-two from either platform
 */
function getLowestPrice(restaurant: ComparisonRestaurant): number | null {
  const prices: number[] = [];

  if (restaurant.swiggy?.costForTwoValue) {
    prices.push(restaurant.swiggy.costForTwoValue);
  }

  if (restaurant.zomato?.costForTwoValue) {
    prices.push(restaurant.zomato.costForTwoValue);
  }

  if (prices.length === 0) return null;
  return Math.min(...prices);
}

/**
 * Get price range label for a restaurant
 */
export function getPriceRangeLabel(restaurant: ComparisonRestaurant): string {
  const price = getLowestPrice(restaurant);
  if (price === null) return '-';

  if (price < PRICE_RANGES.budget.max) return '₹';
  if (price < PRICE_RANGES.moderate.max) return '₹₹';
  return '₹₹₹';
}

/**
 * Get price range category for a restaurant
 */
export function getPriceRangeCategory(restaurant: ComparisonRestaurant): PriceRange | null {
  const price = getLowestPrice(restaurant);
  if (price === null) return null;

  if (price < PRICE_RANGES.budget.max) return 'budget';
  if (price < PRICE_RANGES.moderate.max) return 'moderate';
  return 'premium';
}

/**
 * Get distribution of price ranges in results
 */
export function getPriceDistribution(
  restaurants: ComparisonRestaurant[]
): Record<PriceRange, number> {
  const distribution: Record<PriceRange, number> = {
    budget: 0,
    moderate: 0,
    premium: 0,
  };

  for (const restaurant of restaurants) {
    const category = getPriceRangeCategory(restaurant);
    if (category) {
      distribution[category]++;
    }
  }

  return distribution;
}
