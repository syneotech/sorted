// Relevance scoring for search results

import type { NormalizedRestaurant } from '../swiggy/types';
import type { RelevanceScore, SearchContext, ScoringWeights, RelevanceResult, FeatureGate } from './types';
import { analyzeQuery, getPrimaryIntent, getIntentConfidence } from './keywords';
import {
  getWeightsForSearch,
  getGatingWeights,
  gateToWeight,
  RATING_CONFIG,
  POPULARITY_CONFIG,
  NAME_MATCH_CONFIG,
  SCORE_THRESHOLDS,
  CUISINE_CONFIG,
  INTENT_GATING,
} from './config';
import {
  cuisineMatchesSearch,
  cuisineSimilarity,
  findCuisinesByDish,
  inferCuisineProfile,
  getCuisineAffinity,
  calculateCuisineCoverage,
  getCuisineProminence,
} from './cuisines';

/**
 * Calculate cuisine match score (0-100)
 * V2: Uses affinity, coverage, and prominence for more nuanced scoring
 */
export function calculateCuisineScore(
  restaurant: NormalizedRestaurant,
  context: SearchContext
): number {
  if (context.detectedCuisines.length === 0 && !context.isDishSearch) {
    // No cuisine context in query - give neutral score
    return 50;
  }

  // Infer restaurant's cuisine profile from their cuisine list
  const profile = inferCuisineProfile(restaurant.cuisines);
  const searchedCuisines = context.detectedCuisines;

  // Calculate best affinity match
  const affinity = calculateBestAffinity(searchedCuisines, restaurant.cuisines);

  // Calculate coverage estimate
  const coverage = calculateCuisineCoverage(searchedCuisines, profile);

  // Get prominence (is searched cuisine the primary?)
  const prominence = getCuisineProminence(searchedCuisines, profile);

  // Hard filter for cuisine/dish searches with low coverage
  if (
    (context.isCuisineSearch || context.isDishSearch) &&
    coverage < CUISINE_CONFIG.MIN_MENU_COVERAGE &&
    affinity < 0.5 // Don't filter if there's a strong affinity match
  ) {
    return 0; // Completely filter out
  }

  // Base score from affinity * coverage * prominence
  const baseScore = affinity * coverage * prominence * 100;

  // Apply intent confidence
  const confidence = getIntentConfidence(context);

  // For non-cuisine/dish searches, use a softer scoring
  if (!context.isCuisineSearch && !context.isDishSearch) {
    return Math.min(Math.max(baseScore * 0.5 + 25, 30), 70);
  }

  return Math.min(Math.round(baseScore * confidence), 100);
}

/**
 * Calculate best affinity match between searched cuisines and restaurant cuisines
 */
function calculateBestAffinity(
  searchedCuisines: string[],
  restaurantCuisines: string[]
): number {
  if (searchedCuisines.length === 0 || restaurantCuisines.length === 0) {
    return 0;
  }

  let maxAffinity = 0;

  for (const searched of searchedCuisines) {
    for (const restaurant of restaurantCuisines) {
      // Check direct match first
      if (cuisineMatchesSearch(restaurant, searched.toLowerCase())) {
        return CUISINE_CONFIG.EXACT_MATCH_SCORE;
      }

      // Check similarity
      const similarity = cuisineSimilarity(restaurant, searched);
      if (similarity > maxAffinity) {
        maxAffinity = similarity;
      }

      // Check V2 affinity
      const affinity = getCuisineAffinity(searched, restaurant);
      if (affinity > maxAffinity) {
        maxAffinity = affinity;
      }
    }
  }

  // Check dish-based cuisine matching for dish searches
  for (const keyword of searchedCuisines) {
    const dishCuisines = findCuisinesByDish(keyword);
    for (const dishCuisine of dishCuisines) {
      for (const restaurantCuisine of restaurantCuisines) {
        if (cuisineMatchesSearch(restaurantCuisine, dishCuisine.name.toLowerCase())) {
          return Math.max(maxAffinity, CUISINE_CONFIG.ALIAS_MATCH_SCORE);
        }
      }
    }
  }

  return maxAffinity;
}

/**
 * Calculate name match score (0-100)
 */
export function calculateNameScore(
  restaurant: NormalizedRestaurant,
  context: SearchContext
): number {
  const restaurantName = restaurant.name.toLowerCase();
  const query = context.query.toLowerCase();

  // Exact match
  if (restaurantName === query) {
    return 100 * NAME_MATCH_CONFIG.EXACT_MATCH_BOOST;
  }

  // Starts with
  if (restaurantName.startsWith(query)) {
    return 100 * NAME_MATCH_CONFIG.STARTS_WITH_BOOST;
  }

  // Contains
  if (restaurantName.includes(query)) {
    return 100 * NAME_MATCH_CONFIG.CONTAINS_BOOST;
  }

  // Check keyword matches
  let keywordMatches = 0;
  let keywordScore = 0;

  for (const keyword of context.keywords) {
    if (keyword.length < 3) continue; // Skip very short keywords

    if (restaurantName.includes(keyword)) {
      keywordMatches++;
      // Weight by keyword length relative to name length
      keywordScore += (keyword.length / restaurantName.length) * 50;
    }
  }

  if (keywordMatches > 0) {
    // Boost for multiple keyword matches
    const multiMatchBonus = Math.min(keywordMatches * 10, 30);
    return Math.min(keywordScore + multiMatchBonus, 70);
  }

  // Check for word-level matches
  const nameWords = restaurantName.split(/\s+/);
  const queryWords = query.split(/\s+/);

  let wordMatches = 0;
  for (const queryWord of queryWords) {
    if (queryWord.length < 2) continue;
    for (const nameWord of nameWords) {
      if (nameWord === queryWord || nameWord.startsWith(queryWord)) {
        wordMatches++;
        break;
      }
    }
  }

  if (wordMatches > 0) {
    return (wordMatches / queryWords.length) * 60;
  }

  // No name match - return low score for restaurant searches, neutral otherwise
  if (context.isRestaurantSearch) {
    return 5;
  }

  return 30; // Neutral for non-name searches
}

/**
 * Calculate rating boost score (0-100)
 */
export function calculateRatingScore(restaurant: NormalizedRestaurant): number {
  const rating = restaurant.rating || 0;

  if (rating < RATING_CONFIG.MIN_RATING) {
    return 0;
  }

  // Linear scale from MIN_RATING to MAX_RATING
  const normalizedRating =
    (rating - RATING_CONFIG.MIN_RATING) /
    (RATING_CONFIG.MAX_RATING - RATING_CONFIG.MIN_RATING);

  let score = normalizedRating * 100;

  // Bonus for excellent ratings
  if (rating >= RATING_CONFIG.EXCELLENT_RATING_THRESHOLD) {
    score *= (1 + RATING_CONFIG.EXCELLENT_RATING_BONUS);
  }

  return Math.min(score, 100);
}

/**
 * Parse rating count from string (e.g., "10K+" -> 10000)
 */
export function parseRatingCount(ratingCountStr: string | undefined): number {
  if (!ratingCountStr) return 0;

  const match = ratingCountStr.match(/(\d+(?:\.\d+)?)\s*([KkMm])?/);
  if (!match) return 0;

  let ratingCount = parseFloat(match[1]);
  if (match[2]?.toLowerCase() === 'k') {
    ratingCount *= 1000;
  } else if (match[2]?.toLowerCase() === 'm') {
    ratingCount *= 1000000;
  }

  return ratingCount;
}

/**
 * Sigmoid function for saturation
 */
function sigmoid(x: number, midpoint: number, steepness: number): number {
  return 1 / (1 + Math.exp(-steepness * (x - midpoint)));
}

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate popularity score based on rating count (0-100)
 * V2: Uses sigmoid saturation and optional relevance penalty
 */
export function calculatePopularityScore(
  restaurant: NormalizedRestaurant,
  cuisineScore?: number
): number {
  const ratingCount = parseRatingCount(restaurant.ratingCount);

  if (ratingCount < POPULARITY_CONFIG.MIN_RATING_COUNT) {
    return 0;
  }

  // Use sigmoid saturation for more natural scaling
  const { SATURATION_MIDPOINT, SATURATION_STEEPNESS } = POPULARITY_CONFIG;
  const saturated = sigmoid(ratingCount, SATURATION_MIDPOINT, SATURATION_STEEPNESS);

  // Apply relevance penalty: low cuisine relevance caps popularity
  // This prevents popular but irrelevant restaurants from dominating
  let relevancePenalty = 1.0;
  if (cuisineScore !== undefined && cuisineScore < POPULARITY_CONFIG.RELEVANCE_PENALTY_THRESHOLD) {
    // Scale penalty: 0% cuisine score = 0.3x popularity, 50% = 1.0x
    relevancePenalty = clamp(cuisineScore / POPULARITY_CONFIG.RELEVANCE_PENALTY_THRESHOLD, 0.3, 1.0);
  }

  return Math.round(saturated * relevancePenalty * 100);
}

/**
 * Calculate bonus for query keywords appearing in restaurant name
 * This boosts restaurants like "Burger King" when searching "burger"
 */
export function calculateQueryInNameBonus(
  restaurant: NormalizedRestaurant,
  context: SearchContext
): number {
  const restaurantName = restaurant.name.toLowerCase();
  const nameWords = restaurantName.replace(/[^a-z0-9\s]/g, '').split(/\s+/);

  let bonus = 0;
  for (const keyword of context.keywords) {
    if (keyword.length < 3) continue;

    if (nameWords.includes(keyword)) {
      bonus += 35; // Keyword is a word in name (e.g., "burger" in "Burger King")
    } else if (restaurantName.includes(keyword)) {
      bonus += 15; // Keyword is substring
    }
  }

  return Math.min(bonus, 100);
}

/**
 * Calculate total relevance score for a restaurant
 * V2: Uses intent-based feature gating and popularity de-biasing
 */
export function calculateRelevanceScore(
  restaurant: NormalizedRestaurant,
  context: SearchContext,
  weights?: ScoringWeights
): RelevanceScore {
  // Get intent and apply gating
  const intent = getPrimaryIntent(context);
  const gating = INTENT_GATING[intent] || INTENT_GATING.general;

  // Get weights - either provided, from gating, or from legacy method
  const w = weights || (
    // Use gating weights for V2 intents, legacy for others
    intent === 'general'
      ? getWeightsForSearch(
          context.isCuisineSearch,
          context.isDishSearch,
          context.isRestaurantSearch,
          context.hasDishPriorityTerm
        )
      : getGatingWeights(gating)
  );

  // Calculate cuisine score first (needed for popularity de-biasing)
  const cuisineScore = gating.cuisine !== 'OFF'
    ? calculateCuisineScore(restaurant, context)
    : 0;

  // Hard filter: if cuisine score is 0, it was filtered out
  if (cuisineScore === 0 && (context.isCuisineSearch || context.isDishSearch)) {
    return {
      total: 0,
      breakdown: {
        cuisineMatch: 0,
        nameMatch: 0,
        ratingBoost: 0,
        popularityBoost: 0,
      },
    };
  }

  // Calculate other scores (with gating)
  const nameScore = gating.name !== 'OFF'
    ? calculateNameScore(restaurant, context)
    : 0;

  const ratingScore = gating.rating !== 'OFF'
    ? calculateRatingScore(restaurant)
    : 0;

  // Popularity now receives cuisine score for de-biasing
  const popularityScore = gating.popularity !== 'OFF'
    ? calculatePopularityScore(restaurant, cuisineScore)
    : 0;

  // Calculate query-in-name bonus
  const queryInNameBonus = calculateQueryInNameBonus(restaurant, context);
  // Higher weight for dish-priority terms (burger in "Burger King" should matter more)
  const bonusWeight = context.hasDishPriorityTerm ? 0.20 : 0.10;

  // Weighted combination (scale to 0-100)
  const baseTotal =
    cuisineScore * w.cuisineMatch +
    nameScore * w.nameMatch +
    ratingScore * w.ratingBoost +
    popularityScore * w.popularityBoost;

  const total = Math.round(baseTotal + queryInNameBonus * bonusWeight);

  return {
    total: Math.min(Math.max(total, 0), 100),
    breakdown: {
      cuisineMatch: Math.round(cuisineScore * w.cuisineMatch),
      nameMatch: Math.round(nameScore * w.nameMatch),
      ratingBoost: Math.round(ratingScore * w.ratingBoost),
      popularityBoost: Math.round(popularityScore * w.popularityBoost),
    },
  };
}

/**
 * Score and sort restaurants by relevance
 */
export function scoreAndSortRestaurants(
  restaurants: NormalizedRestaurant[],
  query: string
): RelevanceResult<NormalizedRestaurant>[] {
  const context = analyzeQuery(query);

  // Score all restaurants
  const scored = restaurants.map(restaurant => ({
    item: restaurant,
    relevance: calculateRelevanceScore(restaurant, context),
  }));

  // Sort by total relevance score (descending)
  scored.sort((a, b) => b.relevance.total - a.relevance.total);

  return scored;
}

/**
 * Filter out low-relevance results
 */
export function filterByRelevance(
  results: RelevanceResult<NormalizedRestaurant>[],
  minScore: number = SCORE_THRESHOLDS.MINIMUM_RELEVANCE
): RelevanceResult<NormalizedRestaurant>[] {
  return results.filter(r => r.relevance.total >= minScore);
}

/**
 * Check if a result is highly relevant
 */
export function isHighlyRelevant(score: RelevanceScore): boolean {
  return score.total >= SCORE_THRESHOLDS.HIGH_RELEVANCE;
}

/**
 * Check if a result is a perfect match
 */
export function isPerfectMatch(score: RelevanceScore): boolean {
  return score.total >= SCORE_THRESHOLDS.PERFECT_MATCH;
}

/**
 * Get relevance tier for display
 */
export function getRelevanceTier(score: number): 'perfect' | 'high' | 'medium' | 'low' {
  if (score >= SCORE_THRESHOLDS.PERFECT_MATCH) return 'perfect';
  if (score >= SCORE_THRESHOLDS.HIGH_RELEVANCE) return 'high';
  if (score >= SCORE_THRESHOLDS.MINIMUM_RELEVANCE * 3) return 'medium';
  return 'low';
}
