// Cuisine filter implementation

import type { ComparisonRestaurant } from '../comparison/normalizer';

/**
 * Filter restaurants by selected cuisines
 * A restaurant passes if it has at least one cuisine from the selected list
 */
export function filterByCuisine(
  restaurants: ComparisonRestaurant[],
  selectedCuisines: string[]
): ComparisonRestaurant[] {
  if (selectedCuisines.length === 0) {
    return restaurants;
  }

  const normalizedSelected = new Set(
    selectedCuisines.map(c => c.toLowerCase().trim())
  );

  return restaurants.filter(restaurant => {
    // Get cuisines from both platforms
    const cuisines = getCombinedCuisines(restaurant);

    // Check if any cuisine matches
    return cuisines.some(cuisine =>
      normalizedSelected.has(cuisine.toLowerCase().trim())
    );
  });
}

/**
 * Get combined cuisines from both platforms
 */
function getCombinedCuisines(restaurant: ComparisonRestaurant): string[] {
  const cuisines = new Set<string>();

  if (restaurant.swiggy?.cuisines) {
    restaurant.swiggy.cuisines.forEach(c => cuisines.add(c));
  }

  if (restaurant.zomato?.cuisines) {
    restaurant.zomato.cuisines.forEach(c => cuisines.add(c));
  }

  return [...cuisines];
}

/**
 * Get unique cuisines from a list of restaurants
 * Useful for building the cuisine filter UI
 */
export function getUniqueCuisines(restaurants: ComparisonRestaurant[]): string[] {
  const cuisineCount = new Map<string, number>();

  for (const restaurant of restaurants) {
    const cuisines = getCombinedCuisines(restaurant);
    for (const cuisine of cuisines) {
      const normalized = cuisine.trim();
      cuisineCount.set(normalized, (cuisineCount.get(normalized) || 0) + 1);
    }
  }

  // Sort by frequency (most common first)
  return [...cuisineCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([cuisine]) => cuisine);
}

/**
 * Common cuisines for quick filter chips
 */
export const POPULAR_CUISINES = [
  'Chinese',
  'North Indian',
  'South Indian',
  'Biryani',
  'Pizza',
  'Burger',
  'Italian',
  'Fast Food',
  'Desserts',
  'Cafe',
  'Street Food',
  'Healthy',
];
