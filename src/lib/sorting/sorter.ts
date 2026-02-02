// Sorting implementation for restaurant results

import type { ComparisonRestaurant } from '../comparison/normalizer';
import type { SortOption } from './types';

/**
 * Sort restaurants by the specified option
 */
export function sortRestaurants(
  restaurants: ComparisonRestaurant[],
  sortBy: SortOption
): ComparisonRestaurant[] {
  // Create a copy to avoid mutating the original array
  const sorted = [...restaurants];

  switch (sortBy) {
    case 'relevance':
      return sortByRelevance(sorted);
    case 'price-low':
      return sortByPrice(sorted, 'asc');
    case 'price-high':
      return sortByPrice(sorted, 'desc');
    case 'rating':
      return sortByRating(sorted);
    case 'delivery-time':
      return sortByDeliveryTime(sorted);
    case 'savings':
      return sortBySavings(sorted);
    default:
      return sorted;
  }
}

/**
 * Sort by relevance score (highest first)
 */
function sortByRelevance(restaurants: ComparisonRestaurant[]): ComparisonRestaurant[] {
  return restaurants.sort((a, b) => {
    const scoreA = a.relevanceScore?.total ?? 0;
    const scoreB = b.relevanceScore?.total ?? 0;
    return scoreB - scoreA;
  });
}

/**
 * Sort by price (uses lowest cost-for-two from either platform)
 */
function sortByPrice(
  restaurants: ComparisonRestaurant[],
  direction: 'asc' | 'desc'
): ComparisonRestaurant[] {
  return restaurants.sort((a, b) => {
    const priceA = getLowestPrice(a);
    const priceB = getLowestPrice(b);

    // Push restaurants without price to the end
    if (priceA === null && priceB === null) return 0;
    if (priceA === null) return 1;
    if (priceB === null) return -1;

    return direction === 'asc' ? priceA - priceB : priceB - priceA;
  });
}

/**
 * Sort by rating (highest first)
 */
function sortByRating(restaurants: ComparisonRestaurant[]): ComparisonRestaurant[] {
  return restaurants.sort((a, b) => {
    const ratingA = getBestRating(a);
    const ratingB = getBestRating(b);

    // Push restaurants without rating to the end
    if (ratingA === null && ratingB === null) return 0;
    if (ratingA === null) return 1;
    if (ratingB === null) return -1;

    return ratingB - ratingA;
  });
}

/**
 * Sort by delivery time (fastest first)
 */
function sortByDeliveryTime(restaurants: ComparisonRestaurant[]): ComparisonRestaurant[] {
  return restaurants.sort((a, b) => {
    const timeA = getFastestDeliveryTime(a);
    const timeB = getFastestDeliveryTime(b);

    // Push restaurants without delivery time to the end
    if (timeA === null && timeB === null) return 0;
    if (timeA === null) return 1;
    if (timeB === null) return -1;

    return timeA - timeB;
  });
}

/**
 * Sort by savings (biggest difference first)
 * Only considers restaurants available on both platforms
 */
function sortBySavings(restaurants: ComparisonRestaurant[]): ComparisonRestaurant[] {
  return restaurants.sort((a, b) => {
    const savingsA = a.priceDifference?.savings ?? 0;
    const savingsB = b.priceDifference?.savings ?? 0;

    // Push unmatched restaurants to the end
    const isMatchedA = a.swiggy && a.zomato;
    const isMatchedB = b.swiggy && b.zomato;

    if (!isMatchedA && !isMatchedB) return 0;
    if (!isMatchedA) return 1;
    if (!isMatchedB) return -1;

    return savingsB - savingsA;
  });
}

// Helper functions

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

function getFastestDeliveryTime(restaurant: ComparisonRestaurant): number | null {
  const times: number[] = [];

  if (restaurant.swiggy?.deliveryTime && restaurant.swiggy.deliveryTime > 0) {
    times.push(restaurant.swiggy.deliveryTime);
  }

  if (restaurant.zomato?.deliveryTime && restaurant.zomato.deliveryTime > 0) {
    times.push(restaurant.zomato.deliveryTime);
  }

  if (times.length === 0) return null;
  return Math.min(...times);
}
