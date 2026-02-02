import type { NormalizedRestaurant, NormalizedMenuItem } from '../swiggy/types';
import type { RelevanceScore } from '../search/types';

// Unified types for comparison
export interface ComparisonRestaurant {
  matchId: string;
  name: string;
  swiggy?: NormalizedRestaurant;
  zomato?: NormalizedRestaurant;
  matchConfidence: number;
  /** Relevance score for search ranking */
  relevanceScore?: RelevanceScore;
  priceDifference?: {
    swiggy: number;
    zomato: number;
    savings: number;
    cheaperPlatform: 'swiggy' | 'zomato' | 'same';
  };
  ratingDifference?: {
    swiggy: number;
    zomato: number;
    difference: number;
    betterPlatform: 'swiggy' | 'zomato' | 'same';
  };
  deliveryTimeDifference?: {
    swiggy: number;
    zomato: number;
    difference: number;
    fasterPlatform: 'swiggy' | 'zomato' | 'same';
  };
}

export interface ComparisonMenuItem {
  matchId: string;
  name: string;
  category: string;
  swiggy?: NormalizedMenuItem;
  zomato?: NormalizedMenuItem;
  matchConfidence: number;
  priceDifference?: {
    swiggy: number;
    zomato: number;
    savings: number;
    cheaperPlatform: 'swiggy' | 'zomato' | 'same';
  };
}

// Normalize restaurant name for comparison
export function normalizeRestaurantName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .replace(/\b(the|restaurant|cafe|kitchen|express|delivery)\b/g, '') // Remove common words
    .replace(/\s+/g, ' ')
    .trim();
}

// Normalize menu item name for comparison
export function normalizeItemName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b(special|combo|meal|plate|regular|large|small|medium)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Calculate comparison metrics for restaurants
export function calculateRestaurantComparison(
  swiggy?: NormalizedRestaurant,
  zomato?: NormalizedRestaurant
): Partial<ComparisonRestaurant> {
  const result: Partial<ComparisonRestaurant> = {};

  if (swiggy && zomato) {
    // Price comparison
    const swiggyPrice = swiggy.costForTwoValue;
    const zomatoPrice = zomato.costForTwoValue;
    const priceDiff = Math.abs(swiggyPrice - zomatoPrice);

    result.priceDifference = {
      swiggy: swiggyPrice,
      zomato: zomatoPrice,
      savings: priceDiff,
      cheaperPlatform:
        swiggyPrice < zomatoPrice
          ? 'swiggy'
          : zomatoPrice < swiggyPrice
            ? 'zomato'
            : 'same',
    };

    // Rating comparison
    const ratingDiff = Math.abs(swiggy.rating - zomato.rating);
    result.ratingDifference = {
      swiggy: swiggy.rating,
      zomato: zomato.rating,
      difference: ratingDiff,
      betterPlatform:
        swiggy.rating > zomato.rating
          ? 'swiggy'
          : zomato.rating > swiggy.rating
            ? 'zomato'
            : 'same',
    };

    // Delivery time comparison
    const timeDiff = Math.abs(swiggy.deliveryTime - zomato.deliveryTime);
    result.deliveryTimeDifference = {
      swiggy: swiggy.deliveryTime,
      zomato: zomato.deliveryTime,
      difference: timeDiff,
      fasterPlatform:
        swiggy.deliveryTime < zomato.deliveryTime
          ? 'swiggy'
          : zomato.deliveryTime < swiggy.deliveryTime
            ? 'zomato'
            : 'same',
    };
  }

  return result;
}

// Calculate comparison metrics for menu items
export function calculateMenuItemComparison(
  swiggy?: NormalizedMenuItem,
  zomato?: NormalizedMenuItem
): Partial<ComparisonMenuItem> {
  const result: Partial<ComparisonMenuItem> = {};

  if (swiggy && zomato) {
    const priceDiff = Math.abs(swiggy.price - zomato.price);

    result.priceDifference = {
      swiggy: swiggy.price,
      zomato: zomato.price,
      savings: priceDiff,
      cheaperPlatform:
        swiggy.price < zomato.price
          ? 'swiggy'
          : zomato.price < swiggy.price
            ? 'zomato'
            : 'same',
    };
  }

  return result;
}

// Get the best option based on user preference
export function getBestOption(
  comparison: ComparisonRestaurant,
  preference: 'price' | 'rating' | 'time' = 'price'
): 'swiggy' | 'zomato' | null {
  if (!comparison.swiggy && !comparison.zomato) return null;
  if (!comparison.swiggy) return 'zomato';
  if (!comparison.zomato) return 'swiggy';

  switch (preference) {
    case 'price':
      return comparison.priceDifference?.cheaperPlatform === 'same'
        ? null
        : comparison.priceDifference?.cheaperPlatform || null;
    case 'rating':
      return comparison.ratingDifference?.betterPlatform === 'same'
        ? null
        : comparison.ratingDifference?.betterPlatform || null;
    case 'time':
      return comparison.deliveryTimeDifference?.fasterPlatform === 'same'
        ? null
        : comparison.deliveryTimeDifference?.fasterPlatform || null;
    default:
      return null;
  }
}

// Format price for display
export function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

// Format savings for display
export function formatSavings(savings: number, cheaperPlatform: string): string {
  if (savings === 0 || cheaperPlatform === 'same') {
    return 'Same price on both';
  }
  const platformName = cheaperPlatform === 'swiggy' ? 'Swiggy' : 'Zomato';
  return `Save ${formatPrice(savings)} on ${platformName}`;
}
