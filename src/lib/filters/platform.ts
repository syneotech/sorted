// Platform availability filter implementation

import type { ComparisonRestaurant } from '../comparison/normalizer';
import type { PlatformFilter } from './types';

/**
 * Filter restaurants by platform availability
 */
export function filterByPlatform(
  restaurants: ComparisonRestaurant[],
  platform: PlatformFilter
): ComparisonRestaurant[] {
  switch (platform) {
    case 'all':
      return restaurants;

    case 'matched':
      // Only restaurants available on both platforms
      return restaurants.filter(r => r.swiggy && r.zomato);

    case 'swiggy':
      // Only restaurants on Swiggy
      return restaurants.filter(r => r.swiggy);

    case 'zomato':
      // Only restaurants on Zomato
      return restaurants.filter(r => r.zomato);

    default:
      return restaurants;
  }
}

/**
 * Get platform distribution for filter UI
 */
export function getPlatformDistribution(
  restaurants: ComparisonRestaurant[]
): Record<PlatformFilter, number> {
  let matched = 0;
  let swiggyOnly = 0;
  let zomatoOnly = 0;

  for (const restaurant of restaurants) {
    const hasSwiggy = !!restaurant.swiggy;
    const hasZomato = !!restaurant.zomato;

    if (hasSwiggy && hasZomato) {
      matched++;
    } else if (hasSwiggy) {
      swiggyOnly++;
    } else if (hasZomato) {
      zomatoOnly++;
    }
  }

  return {
    all: restaurants.length,
    matched,
    swiggy: matched + swiggyOnly,
    zomato: matched + zomatoOnly,
  };
}

/**
 * Check if restaurant is available on both platforms (matched)
 */
export function isMatched(restaurant: ComparisonRestaurant): boolean {
  return !!restaurant.swiggy && !!restaurant.zomato;
}

/**
 * Get platform availability label
 */
export function getPlatformLabel(restaurant: ComparisonRestaurant): string {
  const hasSwiggy = !!restaurant.swiggy;
  const hasZomato = !!restaurant.zomato;

  if (hasSwiggy && hasZomato) return 'Both';
  if (hasSwiggy) return 'Swiggy only';
  if (hasZomato) return 'Zomato only';
  return 'Unknown';
}
