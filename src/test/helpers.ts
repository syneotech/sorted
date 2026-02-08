import type { NormalizedRestaurant, NormalizedMenuItem } from '@/lib/swiggy/types';
import type { ComparisonRestaurant, ComparisonMenuItem } from '@/lib/comparison/normalizer';
import type { RelevanceScore } from '@/lib/search/types';

/**
 * Creates a mock NormalizedRestaurant with sensible defaults
 */
export function createMockRestaurant(
  overrides: Partial<NormalizedRestaurant> = {}
): NormalizedRestaurant {
  return {
    id: `restaurant_${Math.random().toString(36).substr(2, 9)}`,
    platform: 'swiggy',
    platformId: '123456',
    name: 'Test Restaurant',
    imageUrl: 'https://example.com/image.jpg',
    locality: 'Koramangala',
    area: 'Bangalore',
    cuisines: ['North Indian', 'Chinese'],
    rating: 4.2,
    ratingCount: '1K+',
    costForTwo: '₹400 for two',
    costForTwoValue: 400,
    deliveryTime: 30,
    deliveryTimeString: '30 mins',
    isOpen: true,
    deepLink: 'https://swiggy.com/test',
    ...overrides,
  };
}

/**
 * Creates a mock ComparisonRestaurant with optional Swiggy/Zomato data
 */
export function createMockComparisonRestaurant(
  options: {
    swiggy?: Partial<NormalizedRestaurant> | null;
    zomato?: Partial<NormalizedRestaurant> | null;
    matchConfidence?: number;
    relevanceScore?: RelevanceScore;
  } = {}
): ComparisonRestaurant {
  const swiggy = options.swiggy === null
    ? undefined
    : createMockRestaurant({ platform: 'swiggy', ...options.swiggy });
  const zomato = options.zomato === null
    ? undefined
    : createMockRestaurant({ platform: 'zomato', ...options.zomato });

  const comparison: ComparisonRestaurant = {
    matchId: `match_${swiggy?.platformId || 'none'}_${zomato?.platformId || 'none'}`,
    name: swiggy?.name || zomato?.name || 'Test Restaurant',
    swiggy,
    zomato,
    matchConfidence: options.matchConfidence ?? (swiggy && zomato ? 0.85 : 0),
    relevanceScore: options.relevanceScore,
  };

  // Calculate price difference if both platforms present
  if (swiggy && zomato) {
    const swiggyPrice = swiggy.costForTwoValue;
    const zomatoPrice = zomato.costForTwoValue;
    comparison.priceDifference = {
      swiggy: swiggyPrice,
      zomato: zomatoPrice,
      savings: Math.abs(swiggyPrice - zomatoPrice),
      cheaperPlatform:
        swiggyPrice < zomatoPrice
          ? 'swiggy'
          : zomatoPrice < swiggyPrice
            ? 'zomato'
            : 'same',
    };
  }

  return comparison;
}

/**
 * Creates a mock NormalizedMenuItem
 */
export function createMockMenuItem(
  overrides: Partial<NormalizedMenuItem> = {}
): NormalizedMenuItem {
  return {
    id: `item_${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Item',
    description: 'A delicious test item',
    category: 'Main Course',
    price: 299,
    isVeg: true,
    imageUrl: 'https://example.com/item.jpg',
    rating: 4.5,
    ratingCount: '100+',
    ...overrides,
  };
}

/**
 * Creates a mock ComparisonMenuItem
 */
export function createMockComparisonMenuItem(
  options: {
    swiggy?: Partial<NormalizedMenuItem> | null;
    zomato?: Partial<NormalizedMenuItem> | null;
    matchConfidence?: number;
  } = {}
): ComparisonMenuItem {
  const swiggy = options.swiggy === null
    ? undefined
    : createMockMenuItem(options.swiggy);
  const zomato = options.zomato === null
    ? undefined
    : createMockMenuItem(options.zomato);

  const comparison: ComparisonMenuItem = {
    matchId: `item_${swiggy?.id || 'none'}_${zomato?.id || 'none'}`,
    name: swiggy?.name || zomato?.name || 'Test Item',
    category: swiggy?.category || zomato?.category || 'Main Course',
    swiggy,
    zomato,
    matchConfidence: options.matchConfidence ?? (swiggy && zomato ? 0.85 : 0),
  };

  // Calculate price difference if both platforms present
  if (swiggy && zomato) {
    comparison.priceDifference = {
      swiggy: swiggy.price,
      zomato: zomato.price,
      savings: Math.abs(swiggy.price - zomato.price),
      cheaperPlatform:
        swiggy.price < zomato.price
          ? 'swiggy'
          : zomato.price < swiggy.price
            ? 'zomato'
            : 'same',
    };
  }

  return comparison;
}

/**
 * Creates an array of mock comparison restaurants
 */
export function createMockRestaurantList(count: number): ComparisonRestaurant[] {
  const restaurants: ComparisonRestaurant[] = [];

  for (let i = 0; i < count; i++) {
    restaurants.push(
      createMockComparisonRestaurant({
        swiggy: {
          name: `Restaurant ${i + 1}`,
          platformId: `swiggy_${i}`,
          rating: 3.5 + Math.random() * 1.5,
          costForTwoValue: 200 + Math.floor(Math.random() * 600),
          deliveryTime: 20 + Math.floor(Math.random() * 40),
        },
        zomato: i % 3 !== 0 ? {
          name: `Restaurant ${i + 1}`,
          platformId: `zomato_${i}`,
          rating: 3.5 + Math.random() * 1.5,
          costForTwoValue: 200 + Math.floor(Math.random() * 600),
          deliveryTime: 20 + Math.floor(Math.random() * 40),
        } : null, // Every 3rd restaurant is Swiggy-only
      })
    );
  }

  return restaurants;
}
