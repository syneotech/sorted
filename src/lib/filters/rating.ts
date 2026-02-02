// Rating filter implementation

import type { ComparisonRestaurant } from '../comparison/normalizer';
import type { RatingFilter } from './types';
import { RATING_VALUES } from './types';

/**
 * Filter restaurants by minimum rating
 * Uses the higher rating from either platform
 */
export function filterByRating(
  restaurants: ComparisonRestaurant[],
  minRating: RatingFilter
): ComparisonRestaurant[] {
  if (minRating === 'any') {
    return restaurants;
  }

  const threshold = RATING_VALUES[minRating];

  return restaurants.filter(restaurant => {
    const rating = getBestRating(restaurant);
    if (rating === null) return true; // Include if no rating info
    return rating >= threshold;
  });
}

/**
 * Get the best (highest) rating from either platform
 */
function getBestRating(restaurant: ComparisonRestaurant): number | null {
  const ratings: number[] = [];

  if (restaurant.swiggy?.rating && restaurant.swiggy.rating > 0) {
    ratings.push(restaurant.swiggy.rating);
  }

  if (restaurant.zomato?.rating && restaurant.zomato.rating > 0) {
    ratings.push(restaurant.zomato.rating);
  }

  if (ratings.length === 0) return null;
  return Math.max(...ratings);
}

/**
 * Get average rating from both platforms
 */
export function getAverageRating(restaurant: ComparisonRestaurant): number | null {
  const ratings: number[] = [];

  if (restaurant.swiggy?.rating && restaurant.swiggy.rating > 0) {
    ratings.push(restaurant.swiggy.rating);
  }

  if (restaurant.zomato?.rating && restaurant.zomato.rating > 0) {
    ratings.push(restaurant.zomato.rating);
  }

  if (ratings.length === 0) return null;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

/**
 * Get rating distribution for filter UI
 */
export function getRatingDistribution(
  restaurants: ComparisonRestaurant[]
): Record<RatingFilter, number> {
  const distribution: Record<RatingFilter, number> = {
    'any': restaurants.length,
    '3+': 0,
    '3.5+': 0,
    '4+': 0,
    '4.5+': 0,
  };

  for (const restaurant of restaurants) {
    const rating = getBestRating(restaurant);
    if (rating === null) continue;

    if (rating >= 3.0) distribution['3+']++;
    if (rating >= 3.5) distribution['3.5+']++;
    if (rating >= 4.0) distribution['4+']++;
    if (rating >= 4.5) distribution['4.5+']++;
  }

  return distribution;
}
