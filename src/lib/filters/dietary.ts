// Dietary filter implementation

import type { ComparisonRestaurant } from '../comparison/normalizer';
import type { DietaryFilter } from './types';

/**
 * Filter restaurants by dietary preference
 * Note: This is a soft filter - we can only reliably filter if we know
 * the restaurant offers veg-only or has veg options
 */
export function filterByDietary(
  restaurants: ComparisonRestaurant[],
  dietary: DietaryFilter
): ComparisonRestaurant[] {
  if (dietary === 'all') {
    return restaurants;
  }

  return restaurants.filter(restaurant => {
    const cuisines = getCombinedCuisines(restaurant);
    const name = restaurant.name.toLowerCase();

    // Check for veg indicators
    const isLikelyVeg = checkVegIndicators(name, cuisines);

    if (dietary === 'veg') {
      return isLikelyVeg;
    }

    // For non-veg, include restaurants that are not purely veg
    return !isLikelyVeg || checkNonVegIndicators(name, cuisines);
  });
}

/**
 * Get combined cuisines from both platforms
 */
function getCombinedCuisines(restaurant: ComparisonRestaurant): string[] {
  const cuisines = new Set<string>();

  if (restaurant.swiggy?.cuisines) {
    restaurant.swiggy.cuisines.forEach(c => cuisines.add(c.toLowerCase()));
  }

  if (restaurant.zomato?.cuisines) {
    restaurant.zomato.cuisines.forEach(c => cuisines.add(c.toLowerCase()));
  }

  return [...cuisines];
}

/**
 * Check if restaurant appears to be vegetarian
 */
function checkVegIndicators(name: string, cuisines: string[]): boolean {
  // Name indicators
  const vegNamePatterns = [
    /\bpure\s*veg\b/i,
    /\bveg\s*(only|restaurant|kitchen|corner|house)\b/i,
    /\bsatvic\b/i,
    /\bjain\b/i,
    /\bvegan\b/i,
    /\budupi\b/i,
  ];

  for (const pattern of vegNamePatterns) {
    if (pattern.test(name)) {
      return true;
    }
  }

  // Cuisine indicators
  const vegCuisines = [
    'pure veg',
    'vegetarian',
    'vegan',
    'jain',
    'satvic',
    'south indian',
    'udupi',
    'gujarati',
    'rajasthani',
  ];

  return cuisines.some(c =>
    vegCuisines.some(vc => c.includes(vc))
  );
}

/**
 * Check if restaurant likely serves non-veg
 */
function checkNonVegIndicators(name: string, cuisines: string[]): boolean {
  // Name indicators
  const nonVegNamePatterns = [
    /\bchicken\b/i,
    /\bmutton\b/i,
    /\bfish\b/i,
    /\bseafood\b/i,
    /\bmeat\b/i,
    /\bkebab\b/i,
    /\bbbq\b/i,
    /\bgrill\b/i,
  ];

  for (const pattern of nonVegNamePatterns) {
    if (pattern.test(name)) {
      return true;
    }
  }

  // Cuisine indicators
  const nonVegCuisines = [
    'mughlai',
    'kebab',
    'biryani',
    'chinese',
    'seafood',
    'coastal',
    'bengali',
    'chettinad',
    'hyderabadi',
    'lucknowi',
    'awadhi',
  ];

  return cuisines.some(c =>
    nonVegCuisines.some(nvc => c.includes(nvc))
  );
}
