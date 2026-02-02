// Search scoring configuration

import type { ScoringWeights } from './types';

/**
 * Default scoring weights
 * Total = 1.0 (100%)
 */
export const DEFAULT_WEIGHTS: ScoringWeights = {
  cuisineMatch: 0.40,    // 40% - Most important for cuisine/dish searches
  nameMatch: 0.30,       // 30% - Important for restaurant name searches
  ratingBoost: 0.15,     // 15% - Quality signal
  popularityBoost: 0.15, // 15% - Popularity signal
};

/**
 * Weights optimized for cuisine-focused searches
 * (e.g., "Chinese", "biryani")
 */
export const CUISINE_SEARCH_WEIGHTS: ScoringWeights = {
  cuisineMatch: 0.55,    // Higher weight on cuisine match
  nameMatch: 0.15,       // Lower weight on name
  ratingBoost: 0.15,
  popularityBoost: 0.15,
};

/**
 * Weights optimized for restaurant name searches
 * (e.g., "Meghana Foods", "KFC")
 */
export const RESTAURANT_SEARCH_WEIGHTS: ScoringWeights = {
  cuisineMatch: 0.10,    // Lower weight on cuisine
  nameMatch: 0.60,       // Higher weight on name match
  ratingBoost: 0.15,
  popularityBoost: 0.15,
};

/**
 * Weights for dish-specific searches
 * (e.g., "butter chicken", "dosa")
 */
export const DISH_SEARCH_WEIGHTS: ScoringWeights = {
  cuisineMatch: 0.50,    // Dish implies cuisine
  nameMatch: 0.20,       // Name match still matters
  ratingBoost: 0.15,
  popularityBoost: 0.15,
};

/**
 * Score thresholds
 */
export const SCORE_THRESHOLDS = {
  /** Minimum score for a result to be considered relevant (0-100) */
  MINIMUM_RELEVANCE: 10,
  /** Score threshold for "highly relevant" (0-100) */
  HIGH_RELEVANCE: 70,
  /** Score threshold for "perfect match" (0-100) */
  PERFECT_MATCH: 90,
};

/**
 * Rating boost configuration
 */
export const RATING_CONFIG = {
  /** Minimum rating to get any boost */
  MIN_RATING: 3.5,
  /** Rating that gets maximum boost */
  MAX_RATING: 5.0,
  /** Bonus for 4.5+ ratings */
  EXCELLENT_RATING_THRESHOLD: 4.5,
  /** Extra boost percentage for excellent ratings */
  EXCELLENT_RATING_BONUS: 0.2, // 20% extra
};

/**
 * Popularity boost configuration
 */
export const POPULARITY_CONFIG = {
  /** Minimum rating count to get any boost */
  MIN_RATING_COUNT: 100,
  /** Rating count that gets maximum boost */
  MAX_RATING_COUNT: 10000,
  /** Log scale base for rating count */
  LOG_BASE: 10,
};

/**
 * Name matching configuration
 */
export const NAME_MATCH_CONFIG = {
  /** Boost for exact name match */
  EXACT_MATCH_BOOST: 1.0, // 100%
  /** Boost for starts with match */
  STARTS_WITH_BOOST: 0.8, // 80%
  /** Boost for contains match */
  CONTAINS_BOOST: 0.5, // 50%
  /** Boost for fuzzy match (via Fuse.js) */
  FUZZY_MATCH_MULTIPLIER: 0.7, // 70% of Fuse score
};

/**
 * Get appropriate weights based on search context
 */
export function getWeightsForSearch(
  isCuisineSearch: boolean,
  isDishSearch: boolean,
  isRestaurantSearch: boolean
): ScoringWeights {
  if (isRestaurantSearch) {
    return RESTAURANT_SEARCH_WEIGHTS;
  }
  if (isCuisineSearch) {
    return CUISINE_SEARCH_WEIGHTS;
  }
  if (isDishSearch) {
    return DISH_SEARCH_WEIGHTS;
  }
  return DEFAULT_WEIGHTS;
}
