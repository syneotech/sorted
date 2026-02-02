// Keyword extraction and query analysis

import type { SearchContext } from './types';
import {
  CUISINE_TAXONOMY,
  findCuisineByName,
  findCuisineByAlias,
  findCuisinesByDish,
} from './cuisines';

// Common stop words to filter out
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'up', 'about', 'into', 'over', 'after',
  'near', 'me', 'my', 'best', 'top', 'good', 'great', 'nearby', 'close',
  'around', 'here', 'restaurant', 'restaurants', 'food', 'order', 'delivery',
  'eat', 'eating', 'hungry', 'want', 'need', 'like', 'get', 'find',
]);

// Words that indicate restaurant name search
const RESTAURANT_INDICATORS = new Set([
  'outlet', 'branch', 'store', 'shop', 'location', 'near',
]);

/**
 * Extract meaningful keywords from a search query
 */
export function extractKeywords(query: string): string[] {
  // Normalize and split
  const words = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1);

  // Filter out stop words
  const keywords = words.filter(word => !STOP_WORDS.has(word));

  // Also check for multi-word phrases (bigrams)
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    bigrams.push(bigram);
  }

  return [...new Set([...keywords, ...bigrams])];
}

/**
 * Detect cuisines mentioned in the query
 */
export function detectCuisines(keywords: string[]): string[] {
  const detectedCuisines: Set<string> = new Set();

  for (const keyword of keywords) {
    // Check if keyword is a cuisine name
    const cuisineByName = findCuisineByName(keyword);
    if (cuisineByName) {
      detectedCuisines.add(cuisineByName.name);
      continue;
    }

    // Check if keyword is a cuisine alias
    const cuisineByAlias = findCuisineByAlias(keyword);
    if (cuisineByAlias) {
      detectedCuisines.add(cuisineByAlias.name);
      continue;
    }

    // Check if keyword is a dish
    const cuisinesByDish = findCuisinesByDish(keyword);
    for (const cuisine of cuisinesByDish) {
      detectedCuisines.add(cuisine.name);
    }
  }

  return [...detectedCuisines];
}

/**
 * Check if query is searching for a specific dish
 */
export function isDishSearch(keywords: string[]): boolean {
  for (const keyword of keywords) {
    const cuisines = findCuisinesByDish(keyword);
    if (cuisines.length > 0) {
      return true;
    }
  }
  return false;
}

/**
 * Check if query is searching for a cuisine type
 */
export function isCuisineSearch(keywords: string[]): boolean {
  for (const keyword of keywords) {
    if (findCuisineByName(keyword) || findCuisineByAlias(keyword)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if query looks like a restaurant name search
 */
export function isRestaurantNameSearch(query: string, keywords: string[]): boolean {
  // Check for indicators
  for (const keyword of keywords) {
    if (RESTAURANT_INDICATORS.has(keyword)) {
      return true;
    }
  }

  // Check if it's a proper noun (capitalized words)
  const words = query.trim().split(/\s+/);
  const capitalizedWords = words.filter(w => /^[A-Z]/.test(w));

  // If most words are capitalized, likely a restaurant name
  if (words.length >= 2 && capitalizedWords.length >= words.length * 0.5) {
    return true;
  }

  // Check if it doesn't match any cuisine or dish
  const detectedCuisines = detectCuisines(keywords);
  const hasDish = isDishSearch(keywords);

  // If no cuisine or dish detected, might be a restaurant name
  if (detectedCuisines.length === 0 && !hasDish && keywords.length > 0) {
    // Check against known restaurant patterns
    const patterns = [
      /^[A-Z][a-z]+\s+[A-Z][a-z]+/,  // Two capitalized words
      /\'s$/,                         // Ends with 's (possessive)
      /kitchen$/i,
      /cafe$/i,
      /restaurant$/i,
      /express$/i,
      /corner$/i,
      /house$/i,
    ];

    for (const pattern of patterns) {
      if (pattern.test(query)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Analyze a search query and extract context
 */
export function analyzeQuery(query: string): SearchContext {
  const keywords = extractKeywords(query);
  const detectedCuisines = detectCuisines(keywords);
  const cuisineSearch = isCuisineSearch(keywords);
  const dishSearch = isDishSearch(keywords);
  const restaurantSearch = isRestaurantNameSearch(query, keywords);

  return {
    query,
    keywords,
    detectedCuisines,
    isCuisineSearch: cuisineSearch,
    isDishSearch: dishSearch,
    isRestaurantSearch: restaurantSearch,
  };
}

/**
 * Get the primary search intent
 */
export function getPrimaryIntent(context: SearchContext): 'cuisine' | 'dish' | 'restaurant' | 'general' {
  if (context.isRestaurantSearch) {
    return 'restaurant';
  }
  if (context.isCuisineSearch) {
    return 'cuisine';
  }
  if (context.isDishSearch) {
    return 'dish';
  }
  return 'general';
}
