// Search scoring configuration

import type { ScoringWeights, IntentGating, FeatureGate } from './types';

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
  /** Sigmoid saturation midpoint for popularity scoring */
  SATURATION_MIDPOINT: 2000,
  /** Sigmoid steepness for popularity scoring */
  SATURATION_STEEPNESS: 0.002,
  /** Cuisine score below which popularity is penalized */
  RELEVANCE_PENALTY_THRESHOLD: 50,
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

// ============================================================================
// V2 Configuration: Cuisine Scoring
// ============================================================================

/**
 * Cuisine scoring configuration for V2 system
 */
export const CUISINE_CONFIG = {
  /** Hard filter threshold - restaurants below this coverage are excluded */
  MIN_MENU_COVERAGE: 0.25,
  /** Boost for primary cuisine match */
  PRIMARY_CUISINE_BOOST: 1.0,
  /** Penalty for secondary cuisine (not primary) */
  SECONDARY_CUISINE_PENALTY: 0.5,
  /** Maximum score for related cuisine match */
  RELATED_CUISINE_MAX: 0.6,
  /** Score for exact cuisine name match */
  EXACT_MATCH_SCORE: 1.0,
  /** Score for alias match */
  ALIAS_MATCH_SCORE: 0.95,
  /** Score for related cuisine match */
  RELATED_MATCH_SCORE: 0.6,
  /** Score for weak/partial match */
  WEAK_MATCH_SCORE: 0.3,
};

/**
 * Intent confidence thresholds
 */
export const INTENT_CONFIDENCE = {
  HIGH: 0.9,
  MEDIUM: 0.6,
  LOW: 0.3,
};

// ============================================================================
// V2 Configuration: Intent-based Feature Gating
// ============================================================================

/**
 * Feature gating matrix: maps intent type to feature weights
 * ON = full weight, MEDIUM = 0.6x, LOW = 0.3x, OFF = disabled
 */
export const INTENT_GATING: Record<string, IntentGating> = {
  cuisine: {
    cuisine: 'ON',
    name: 'LOW',
    rating: 'MEDIUM',
    popularity: 'MEDIUM',
  },
  dish: {
    cuisine: 'ON',
    name: 'LOW',
    rating: 'MEDIUM',
    popularity: 'MEDIUM',
  },
  restaurant: {
    cuisine: 'OFF',
    name: 'ON',
    rating: 'MEDIUM',
    popularity: 'MEDIUM',
  },
  brand: {
    cuisine: 'OFF',
    name: 'ON',
    rating: 'LOW',
    popularity: 'MEDIUM',
  },
  explore: {
    cuisine: 'MEDIUM',
    name: 'MEDIUM',
    rating: 'ON',
    popularity: 'ON',
  },
  nearby: {
    cuisine: 'LOW',
    name: 'LOW',
    rating: 'MEDIUM',
    popularity: 'LOW',
  },
  meal_type: {
    cuisine: 'MEDIUM',
    name: 'LOW',
    rating: 'MEDIUM',
    popularity: 'MEDIUM',
  },
  dietary: {
    cuisine: 'MEDIUM',
    name: 'LOW',
    rating: 'MEDIUM',
    popularity: 'LOW',
  },
  occasion: {
    cuisine: 'MEDIUM',
    name: 'LOW',
    rating: 'ON',
    popularity: 'MEDIUM',
  },
  general: {
    cuisine: 'MEDIUM',
    name: 'MEDIUM',
    rating: 'ON',
    popularity: 'ON',
  },
};

/**
 * Convert feature gate to weight multiplier
 */
export function gateToWeight(gate: FeatureGate): number {
  switch (gate) {
    case 'ON':
      return 1.0;
    case 'MEDIUM':
      return 0.6;
    case 'LOW':
      return 0.3;
    case 'OFF':
      return 0;
  }
}

/**
 * Get scoring weights from intent gating
 */
export function getGatingWeights(gating: IntentGating): ScoringWeights {
  const cuisineWeight = gateToWeight(gating.cuisine);
  const nameWeight = gateToWeight(gating.name);
  const ratingWeight = gateToWeight(gating.rating);
  const popularityWeight = gateToWeight(gating.popularity);

  // Normalize to sum to 1.0
  const total = cuisineWeight + nameWeight + ratingWeight + popularityWeight;
  if (total === 0) {
    return DEFAULT_WEIGHTS;
  }

  return {
    cuisineMatch: cuisineWeight / total,
    nameMatch: nameWeight / total,
    ratingBoost: ratingWeight / total,
    popularityBoost: popularityWeight / total,
  };
}

/**
 * Get appropriate weights based on search context
 */
export function getWeightsForSearch(
  isCuisineSearch: boolean,
  isDishSearch: boolean,
  isRestaurantSearch: boolean,
  hasDishPriorityTerm: boolean = false
): ScoringWeights {
  if (isRestaurantSearch) {
    return RESTAURANT_SEARCH_WEIGHTS;
  }

  // Dish-priority terms use dish weights, not cuisine weights
  // This ensures "burger" search uses dish weights even if detected as cuisine
  if (hasDishPriorityTerm && isDishSearch) {
    return DISH_SEARCH_WEIGHTS;
  }

  if (isCuisineSearch) {
    return CUISINE_SEARCH_WEIGHTS;
  }
  if (isDishSearch) {
    return DISH_SEARCH_WEIGHTS;
  }
  return DEFAULT_WEIGHTS;
}
