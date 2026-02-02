import Fuse, { type IFuseOptions } from 'fuse.js';
import type { NormalizedRestaurant, NormalizedMenuItem } from '../swiggy/types';
import {
  normalizeRestaurantName,
  normalizeItemName,
  calculateRestaurantComparison,
  calculateMenuItemComparison,
  type ComparisonRestaurant,
  type ComparisonMenuItem,
} from './normalizer';
import {
  calculateRelevanceScore,
  analyzeQuery,
  type SearchContext,
  type RelevanceScore,
} from '../search';

// Fuse.js configuration for fuzzy matching
const RESTAURANT_FUSE_OPTIONS: IFuseOptions<NormalizedRestaurant> = {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'locality', weight: 0.2 },
    { name: 'cuisines', weight: 0.1 },
  ],
  threshold: 0.4, // 0 = exact match, 1 = match anything
  includeScore: true,
  ignoreLocation: true,
};

const MENU_ITEM_FUSE_OPTIONS: IFuseOptions<NormalizedMenuItem> = {
  keys: [
    { name: 'name', weight: 0.8 },
    { name: 'category', weight: 0.2 },
  ],
  threshold: 0.3,
  includeScore: true,
  ignoreLocation: true,
};

// Match restaurants between Swiggy and Zomato
export function matchRestaurants(
  swiggyRestaurants: NormalizedRestaurant[],
  zomatoRestaurants: NormalizedRestaurant[],
  query?: string
): ComparisonRestaurant[] {
  // Analyze query for relevance scoring
  const searchContext = query ? analyzeQuery(query) : null;
  const results: ComparisonRestaurant[] = [];
  const matchedZomatoIds = new Set<string>();

  // Create Fuse index for Zomato restaurants
  const zomatoFuse = new Fuse(zomatoRestaurants, RESTAURANT_FUSE_OPTIONS);

  // Match each Swiggy restaurant to potential Zomato matches
  for (const swiggyRestaurant of swiggyRestaurants) {
    const normalizedName = normalizeRestaurantName(swiggyRestaurant.name);
    const searchResults = zomatoFuse.search(normalizedName);

    let matchedZomato: NormalizedRestaurant | undefined;
    let matchConfidence = 0;

    if (searchResults.length > 0) {
      const bestMatch = searchResults[0];
      const score = bestMatch.score ?? 1;

      // Check if this is a good enough match
      if (score < 0.4) {
        // Also check locality similarity
        const swiggyLocality = swiggyRestaurant.locality.toLowerCase();
        const zomatoLocality = bestMatch.item.locality.toLowerCase();
        const localityMatch =
          swiggyLocality.includes(zomatoLocality) ||
          zomatoLocality.includes(swiggyLocality) ||
          swiggyLocality === zomatoLocality;

        // Check cuisine overlap
        const swiggyCuisines = new Set(swiggyRestaurant.cuisines.map((c) => c.toLowerCase()));
        const zomatoCuisines = bestMatch.item.cuisines.map((c) => c.toLowerCase());
        const cuisineOverlap = zomatoCuisines.filter((c) => swiggyCuisines.has(c)).length;
        const cuisineMatch = cuisineOverlap > 0;

        if (localityMatch || cuisineMatch) {
          matchedZomato = bestMatch.item;
          matchedZomatoIds.add(matchedZomato.id);
          // Calculate confidence (inverse of score, adjusted for locality/cuisine match)
          matchConfidence = Math.min(
            1,
            (1 - score) * 0.7 + (localityMatch ? 0.2 : 0) + (cuisineMatch ? 0.1 : 0)
          );
        }
      }
    }

    const comparison = calculateRestaurantComparison(swiggyRestaurant, matchedZomato);

    // Calculate relevance score if we have a search context
    let relevanceScore: RelevanceScore | undefined;
    if (searchContext) {
      // Use the primary restaurant data for relevance scoring
      // Prefer Swiggy data, but use Zomato if matched
      const primaryRestaurant = swiggyRestaurant;
      relevanceScore = calculateRelevanceScore(primaryRestaurant, searchContext);

      // Boost relevance if matched on both platforms (more trustworthy result)
      if (matchedZomato) {
        relevanceScore.total = Math.min(100, Math.round(relevanceScore.total * 1.1));
      }
    }

    results.push({
      matchId: `match_${swiggyRestaurant.platformId}_${matchedZomato?.platformId || 'none'}`,
      name: swiggyRestaurant.name,
      swiggy: swiggyRestaurant,
      zomato: matchedZomato,
      matchConfidence,
      relevanceScore,
      ...comparison,
    });
  }

  // Add unmatched Zomato restaurants
  for (const zomatoRestaurant of zomatoRestaurants) {
    if (!matchedZomatoIds.has(zomatoRestaurant.id)) {
      // Calculate relevance score for Zomato-only restaurants
      let relevanceScore: RelevanceScore | undefined;
      if (searchContext) {
        relevanceScore = calculateRelevanceScore(zomatoRestaurant, searchContext);
      }

      results.push({
        matchId: `match_none_${zomatoRestaurant.platformId}`,
        name: zomatoRestaurant.name,
        swiggy: undefined,
        zomato: zomatoRestaurant,
        matchConfidence: 0,
        relevanceScore,
      });
    }
  }

  // Sort by relevance score (primary), then by match status, then by name
  return results.sort((a, b) => {
    // Primary sort: relevance score (if available)
    const aRelevance = a.relevanceScore?.total ?? 0;
    const bRelevance = b.relevanceScore?.total ?? 0;

    if (aRelevance !== bRelevance) {
      return bRelevance - aRelevance; // Higher relevance first
    }

    // Secondary sort: matched restaurants before unmatched
    const aMatched = a.swiggy && a.zomato;
    const bMatched = b.swiggy && b.zomato;

    if (aMatched !== bMatched) {
      return aMatched ? -1 : 1;
    }

    // Tertiary sort: match confidence
    if (a.matchConfidence !== b.matchConfidence) {
      return b.matchConfidence - a.matchConfidence;
    }

    // Final sort: alphabetical by name
    return a.name.localeCompare(b.name);
  });
}

// Match menu items between Swiggy and Zomato for a restaurant
export function matchMenuItems(
  swiggyMenu: NormalizedMenuItem[],
  zomatoMenu: NormalizedMenuItem[]
): ComparisonMenuItem[] {
  const results: ComparisonMenuItem[] = [];
  const matchedZomatoIds = new Set<string>();

  // Group items by category for better matching
  const swiggyByCategory = new Map<string, NormalizedMenuItem[]>();
  for (const item of swiggyMenu) {
    const category = item.category.toLowerCase();
    if (!swiggyByCategory.has(category)) {
      swiggyByCategory.set(category, []);
    }
    swiggyByCategory.get(category)!.push(item);
  }

  const zomatoByCategory = new Map<string, NormalizedMenuItem[]>();
  for (const item of zomatoMenu) {
    const category = item.category.toLowerCase();
    if (!zomatoByCategory.has(category)) {
      zomatoByCategory.set(category, []);
    }
    zomatoByCategory.get(category)!.push(item);
  }

  // Create Fuse index for all Zomato items
  const zomatoFuse = new Fuse(zomatoMenu, MENU_ITEM_FUSE_OPTIONS);

  // Match each Swiggy item
  for (const swiggyItem of swiggyMenu) {
    const normalizedName = normalizeItemName(swiggyItem.name);
    const searchResults = zomatoFuse.search(normalizedName);

    let matchedZomato: NormalizedMenuItem | undefined;
    let matchConfidence = 0;

    if (searchResults.length > 0) {
      // Find the best match that's in a similar category
      for (const result of searchResults) {
        const score = result.score ?? 1;
        if (score > 0.3) break; // Don't accept poor matches

        const swiggyCategory = swiggyItem.category.toLowerCase();
        const zomatoCategory = result.item.category.toLowerCase();
        const categoryMatch =
          swiggyCategory.includes(zomatoCategory) ||
          zomatoCategory.includes(swiggyCategory) ||
          swiggyCategory === zomatoCategory;

        // Check veg/non-veg match
        const vegMatch = swiggyItem.isVeg === result.item.isVeg;

        if (!matchedZomatoIds.has(result.item.id) && (categoryMatch || vegMatch)) {
          matchedZomato = result.item;
          matchedZomatoIds.add(matchedZomato.id);
          matchConfidence = Math.min(
            1,
            (1 - score) * 0.7 + (categoryMatch ? 0.2 : 0) + (vegMatch ? 0.1 : 0)
          );
          break;
        }
      }
    }

    const comparison = calculateMenuItemComparison(swiggyItem, matchedZomato);

    results.push({
      matchId: `item_${swiggyItem.id}_${matchedZomato?.id || 'none'}`,
      name: swiggyItem.name,
      category: swiggyItem.category,
      swiggy: swiggyItem,
      zomato: matchedZomato,
      matchConfidence,
      ...comparison,
    });
  }

  // Add unmatched Zomato items
  for (const zomatoItem of zomatoMenu) {
    if (!matchedZomatoIds.has(zomatoItem.id)) {
      results.push({
        matchId: `item_none_${zomatoItem.id}`,
        name: zomatoItem.name,
        category: zomatoItem.category,
        swiggy: undefined,
        zomato: zomatoItem,
        matchConfidence: 0,
      });
    }
  }

  // Sort by category, then by match confidence, then by name
  return results.sort((a, b) => {
    // First by category
    const categoryCompare = a.category.localeCompare(b.category);
    if (categoryCompare !== 0) return categoryCompare;

    // Then matched before unmatched
    if ((a.swiggy && a.zomato) !== (b.swiggy && b.zomato)) {
      return (a.swiggy && a.zomato) ? -1 : 1;
    }

    // Then by confidence
    if (a.matchConfidence !== b.matchConfidence) {
      return b.matchConfidence - a.matchConfidence;
    }

    // Finally by name
    return a.name.localeCompare(b.name);
  });
}

// Find the best price for a specific item across platforms
export function findBestPrice(comparison: ComparisonMenuItem): {
  bestPrice: number;
  platform: 'swiggy' | 'zomato' | null;
  savings: number;
} {
  const swiggyPrice = comparison.swiggy?.price;
  const zomatoPrice = comparison.zomato?.price;

  if (swiggyPrice === undefined && zomatoPrice === undefined) {
    return { bestPrice: 0, platform: null, savings: 0 };
  }

  if (swiggyPrice === undefined) {
    return { bestPrice: zomatoPrice!, platform: 'zomato', savings: 0 };
  }

  if (zomatoPrice === undefined) {
    return { bestPrice: swiggyPrice, platform: 'swiggy', savings: 0 };
  }

  if (swiggyPrice <= zomatoPrice) {
    return {
      bestPrice: swiggyPrice,
      platform: 'swiggy',
      savings: zomatoPrice - swiggyPrice,
    };
  }

  return {
    bestPrice: zomatoPrice,
    platform: 'zomato',
    savings: swiggyPrice - zomatoPrice,
  };
}

// Calculate total savings if user orders from the cheaper platform for each item
export function calculateOptimalOrder(
  menuComparison: ComparisonMenuItem[]
): {
  swiggyTotal: number;
  zomatoTotal: number;
  optimalTotal: number;
  totalSavings: number;
} {
  let swiggyTotal = 0;
  let zomatoTotal = 0;
  let optimalTotal = 0;

  for (const item of menuComparison) {
    if (item.swiggy) swiggyTotal += item.swiggy.price;
    if (item.zomato) zomatoTotal += item.zomato.price;

    const { bestPrice } = findBestPrice(item);
    optimalTotal += bestPrice;
  }

  return {
    swiggyTotal,
    zomatoTotal,
    optimalTotal,
    totalSavings: Math.max(swiggyTotal, zomatoTotal) - optimalTotal,
  };
}
