// Relevance scoring for search results

import type { NormalizedRestaurant } from '../swiggy/types';
import type { RelevanceScore, SearchContext, ScoringWeights, RelevanceResult } from './types';
import { analyzeQuery } from './keywords';
import {
  getWeightsForSearch,
  RATING_CONFIG,
  POPULARITY_CONFIG,
  NAME_MATCH_CONFIG,
  SCORE_THRESHOLDS,
} from './config';
import {
  cuisineMatchesSearch,
  cuisineSimilarity,
  findCuisinesByDish,
} from './cuisines';

/**
 * Calculate cuisine match score (0-100)
 */
export function calculateCuisineScore(
  restaurant: NormalizedRestaurant,
  context: SearchContext
): number {
  if (context.detectedCuisines.length === 0 && !context.isDishSearch) {
    // No cuisine context in query - give neutral score
    return 50;
  }

  const restaurantCuisines = restaurant.cuisines.map(c => c.toLowerCase());

  // Check direct cuisine matches
  if (context.isCuisineSearch) {
    for (const detectedCuisine of context.detectedCuisines) {
      for (const restaurantCuisine of restaurantCuisines) {
        // Check if restaurant cuisine matches detected cuisine
        if (cuisineMatchesSearch(restaurantCuisine, detectedCuisine.toLowerCase())) {
          return 100; // Perfect match
        }

        // Check similarity
        const similarity = cuisineSimilarity(restaurantCuisine, detectedCuisine);
        if (similarity >= 0.9) {
          return 95;
        }
        if (similarity >= 0.7) {
          return 80;
        }
      }
    }
  }

  // Check dish-based cuisine matching
  if (context.isDishSearch) {
    for (const keyword of context.keywords) {
      const dishCuisines = findCuisinesByDish(keyword);
      if (dishCuisines.length > 0) {
        for (const dishCuisine of dishCuisines) {
          for (const restaurantCuisine of restaurantCuisines) {
            if (cuisineMatchesSearch(restaurantCuisine, dishCuisine.name.toLowerCase())) {
              return 95; // Restaurant serves the cuisine of the searched dish
            }

            // Check related cuisines
            for (const related of dishCuisine.related) {
              if (cuisineMatchesSearch(restaurantCuisine, related.toLowerCase())) {
                return 70; // Restaurant serves a related cuisine
              }
            }
          }
        }
      }
    }
  }

  // Check for any keyword match in cuisines
  for (const keyword of context.keywords) {
    for (const cuisine of restaurantCuisines) {
      if (cuisine.includes(keyword) || keyword.includes(cuisine)) {
        return 60; // Partial match
      }
    }
  }

  // No cuisine match - low score for cuisine-focused searches
  if (context.isCuisineSearch || context.isDishSearch) {
    return 10; // Penalize non-matching results
  }

  return 40; // Neutral for non-cuisine searches
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
 * Calculate popularity score based on rating count (0-100)
 */
export function calculatePopularityScore(restaurant: NormalizedRestaurant): number {
  // Parse rating count from string (e.g., "10K+" -> 10000)
  const ratingCountStr = restaurant.ratingCount || '0';
  let ratingCount = 0;

  const match = ratingCountStr.match(/(\d+(?:\.\d+)?)\s*([KkMm])?/);
  if (match) {
    ratingCount = parseFloat(match[1]);
    if (match[2]?.toLowerCase() === 'k') {
      ratingCount *= 1000;
    } else if (match[2]?.toLowerCase() === 'm') {
      ratingCount *= 1000000;
    }
  }

  if (ratingCount < POPULARITY_CONFIG.MIN_RATING_COUNT) {
    return 0;
  }

  // Log scale for rating count
  const minLog = Math.log10(POPULARITY_CONFIG.MIN_RATING_COUNT);
  const maxLog = Math.log10(POPULARITY_CONFIG.MAX_RATING_COUNT);
  const countLog = Math.log10(Math.min(ratingCount, POPULARITY_CONFIG.MAX_RATING_COUNT));

  const normalizedCount = (countLog - minLog) / (maxLog - minLog);

  return normalizedCount * 100;
}

/**
 * Calculate total relevance score for a restaurant
 */
export function calculateRelevanceScore(
  restaurant: NormalizedRestaurant,
  context: SearchContext,
  weights?: ScoringWeights
): RelevanceScore {
  // Get appropriate weights based on search type
  const w = weights || getWeightsForSearch(
    context.isCuisineSearch,
    context.isDishSearch,
    context.isRestaurantSearch
  );

  // Calculate individual scores
  const cuisineScore = calculateCuisineScore(restaurant, context);
  const nameScore = calculateNameScore(restaurant, context);
  const ratingScore = calculateRatingScore(restaurant);
  const popularityScore = calculatePopularityScore(restaurant);

  // Weighted combination (scale to 0-100)
  const total = Math.round(
    cuisineScore * w.cuisineMatch +
    nameScore * w.nameMatch +
    ratingScore * w.ratingBoost +
    popularityScore * w.popularityBoost
  );

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
