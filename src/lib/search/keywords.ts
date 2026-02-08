// Keyword extraction and query analysis

import type {
  SearchContext,
  SearchIntent,
  PrimaryIntent,
  IntentModifiers,
  QualityModifier,
  TimeModifier,
  DietaryModifier,
} from './types';
import { INTENT_CONFIDENCE } from './config';
import {
  CUISINE_TAXONOMY,
  findCuisineByName,
  findCuisineByAlias,
  findCuisinesByDish,
  findCuisineByNameV2,
  findCuisinesByDishV2,
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

// Terms that are primarily dishes, not cuisine types
// These should be treated as dish searches even if they match cuisine aliases
const DISH_PRIORITY_TERMS = new Set([
  'burger', 'pizza', 'biryani', 'dosa', 'momos', 'rolls', 'noodles',
  'pasta', 'sandwich', 'wrap', 'fries', 'nuggets', 'wings', 'tacos',
  'shawarma', 'kebab', 'tikka', 'paratha', 'thali', 'curry',
]);

// ============================================================================
// V2 Intent Detection: Modifier Keywords
// ============================================================================

const QUALITY_MODIFIERS: Record<QualityModifier, string[]> = {
  best: ['best', 'top', 'rated', 'famous', 'popular', 'recommended'],
  cheap: ['cheap', 'budget', 'affordable', 'value', 'economical', 'pocket-friendly'],
  authentic: ['authentic', 'traditional', 'real', 'genuine', 'original', 'pure'],
  premium: ['premium', 'fine', 'upscale', 'luxury', 'gourmet', 'high-end'],
};

const TIME_MODIFIERS: Record<TimeModifier, string[]> = {
  breakfast: ['breakfast', 'morning', 'brunch'],
  lunch: ['lunch', 'afternoon'],
  dinner: ['dinner', 'evening'],
  late_night: ['late night', 'midnight', 'after 10', '24 hours', 'late', 'night'], // night moved here
  open_now: ['open now', 'open', 'available'],
};

const DIETARY_MODIFIERS: Record<DietaryModifier, string[]> = {
  veg: ['veg', 'vegetarian', 'pure veg'],
  vegan: ['vegan', 'plant-based', 'plant based'],
  jain: ['jain', 'no onion', 'no garlic'],
  halal: ['halal'],
};

const PROXIMITY_KEYWORDS = ['near me', 'nearby', 'close', 'around', 'closest'];

// Known brand/chain names for brand intent detection
const KNOWN_BRANDS = new Set([
  'mcdonalds', 'mcdonald', 'kfc', 'burger king', 'dominos', 'domino',
  'pizza hut', 'subway', 'starbucks', 'dunkin', 'taco bell',
  'wendys', 'chipotle', 'papa johns', 'little caesars',
  // Indian chains
  'haldirams', 'bikanervala', 'saravana bhavan', 'mtr', 'adyar ananda bhavan',
  'a2b', 'paradise', 'behrouz', 'faasos', 'box8', 'wow momo',
  'chaayos', 'chai point', 'third wave', 'blue tokai',
  'social', 'barbeque nation', 'absolute barbecues', 'mainland china',
]);

// Meal type keywords
const MEAL_TYPE_KEYWORDS = new Set([
  'breakfast', 'lunch', 'dinner', 'brunch', 'snacks', 'snack',
  'meal', 'meals', 'combo', 'thali',
]);

// Occasion keywords
const OCCASION_KEYWORDS = new Set([
  'party', 'birthday', 'date', 'romantic', 'family', 'friends',
  'celebration', 'anniversary', 'office', 'meeting', 'corporate',
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
 * Check if any keyword is a dish-priority term
 */
export function hasDishPriorityTerm(keywords: string[]): boolean {
  for (const keyword of keywords) {
    if (DISH_PRIORITY_TERMS.has(keyword)) {
      return true;
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
  const dishPriorityTerm = hasDishPriorityTerm(keywords);

  // If keyword is a dish-priority term, treat as dish search NOT cuisine
  // This ensures "burger" is treated as dish search, not cuisine search
  const effectiveCuisineSearch = dishPriorityTerm && dishSearch ? false : cuisineSearch;

  return {
    query,
    keywords,
    detectedCuisines,
    isCuisineSearch: effectiveCuisineSearch,
    isDishSearch: dishSearch,
    isRestaurantSearch: restaurantSearch,
    hasDishPriorityTerm: dishPriorityTerm,
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

// ============================================================================
// V2 Multi-Axis Intent Detection
// ============================================================================

/**
 * Detect quality modifier from keywords
 */
function detectQualityModifier(query: string, keywords: string[]): QualityModifier | undefined {
  const lowerQuery = query.toLowerCase();

  for (const [modifier, terms] of Object.entries(QUALITY_MODIFIERS)) {
    for (const term of terms) {
      if (lowerQuery.includes(term) || keywords.includes(term)) {
        return modifier as QualityModifier;
      }
    }
  }
  return undefined;
}

/**
 * Detect time modifier from keywords
 */
function detectTimeModifier(query: string, keywords: string[]): TimeModifier | undefined {
  const lowerQuery = query.toLowerCase();

  for (const [modifier, terms] of Object.entries(TIME_MODIFIERS)) {
    for (const term of terms) {
      if (lowerQuery.includes(term) || keywords.includes(term)) {
        return modifier as TimeModifier;
      }
    }
  }
  return undefined;
}

/**
 * Detect dietary modifier from keywords
 */
function detectDietaryModifier(query: string, keywords: string[]): DietaryModifier | undefined {
  const lowerQuery = query.toLowerCase();

  for (const [modifier, terms] of Object.entries(DIETARY_MODIFIERS)) {
    for (const term of terms) {
      if (lowerQuery.includes(term) || keywords.includes(term)) {
        return modifier as DietaryModifier;
      }
    }
  }
  return undefined;
}

/**
 * Detect proximity modifier
 */
function detectProximity(query: string, keywords: string[]): 'near_me' | undefined {
  const lowerQuery = query.toLowerCase();

  for (const term of PROXIMITY_KEYWORDS) {
    if (lowerQuery.includes(term)) {
      return 'near_me';
    }
  }
  return undefined;
}

/**
 * Detect all modifiers from query
 */
function detectModifiers(query: string, keywords: string[]): IntentModifiers {
  return {
    quality: detectQualityModifier(query, keywords),
    proximity: detectProximity(query, keywords),
    time: detectTimeModifier(query, keywords),
    dietary: detectDietaryModifier(query, keywords),
  };
}

/**
 * Check if query contains a known brand name
 */
function detectBrand(query: string, keywords: string[]): boolean {
  const lowerQuery = query.toLowerCase();

  for (const brand of KNOWN_BRANDS) {
    if (lowerQuery.includes(brand)) {
      return true;
    }
  }

  // Check bigrams
  for (const keyword of keywords) {
    if (KNOWN_BRANDS.has(keyword)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if query is a meal type search
 */
function detectMealType(keywords: string[]): boolean {
  for (const keyword of keywords) {
    if (MEAL_TYPE_KEYWORDS.has(keyword)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if query is an occasion search
 */
function detectOccasion(keywords: string[]): boolean {
  for (const keyword of keywords) {
    if (OCCASION_KEYWORDS.has(keyword)) {
      return true;
    }
  }
  return false;
}

/**
 * Detect primary intent with confidence score
 */
function detectPrimaryIntent(
  query: string,
  keywords: string[],
  modifiers: IntentModifiers
): { primary: PrimaryIntent; confidence: number } {
  // Priority 1: Brand/chain names (high confidence)
  if (detectBrand(query, keywords)) {
    return { primary: 'brand', confidence: INTENT_CONFIDENCE.HIGH };
  }

  // Priority 2: Restaurant name patterns
  if (isRestaurantNameSearch(query, keywords)) {
    return { primary: 'restaurant', confidence: INTENT_CONFIDENCE.HIGH };
  }

  // Priority 3: Dietary modifiers with no other context
  if (modifiers.dietary && keywords.length <= 2) {
    return { primary: 'dietary', confidence: INTENT_CONFIDENCE.MEDIUM };
  }

  // Priority 4: Explicit cuisine terms
  const hasCuisine = keywords.some(k =>
    findCuisineByName(k) || findCuisineByAlias(k)
  );
  const hasDishPriority = hasDishPriorityTerm(keywords);

  if (hasCuisine && !hasDishPriority) {
    return { primary: 'cuisine', confidence: INTENT_CONFIDENCE.HIGH };
  }

  // Priority 5: Dish search
  const hasDish = isDishSearch(keywords);
  if (hasDish) {
    // Dish priority terms get higher confidence
    const confidence = hasDishPriority
      ? INTENT_CONFIDENCE.HIGH
      : INTENT_CONFIDENCE.MEDIUM;
    return { primary: 'dish', confidence };
  }

  // Priority 6: Cuisine via dish (lower confidence)
  if (hasCuisine) {
    return { primary: 'cuisine', confidence: INTENT_CONFIDENCE.MEDIUM };
  }

  // Priority 7: Meal type
  if (detectMealType(keywords)) {
    return { primary: 'meal_type', confidence: INTENT_CONFIDENCE.MEDIUM };
  }

  // Priority 8: Occasion
  if (detectOccasion(keywords)) {
    return { primary: 'occasion', confidence: INTENT_CONFIDENCE.MEDIUM };
  }

  // Priority 9: Proximity-focused (nearby)
  if (modifiers.proximity && keywords.length <= 2) {
    return { primary: 'nearby', confidence: INTENT_CONFIDENCE.MEDIUM };
  }

  // Default: explore intent
  return { primary: 'explore', confidence: INTENT_CONFIDENCE.LOW };
}

/**
 * Analyze a search query and extract V2 multi-axis intent
 */
export function analyzeQueryV2(query: string): SearchIntent {
  const keywords = extractKeywords(query);
  const modifiers = detectModifiers(query, keywords);
  const { primary, confidence } = detectPrimaryIntent(query, keywords, modifiers);

  return { primary, modifiers, confidence };
}

/**
 * Get intent confidence from legacy SearchContext
 * Used for bridging V1 and V2 systems
 */
export function getIntentConfidence(context: SearchContext): number {
  // High confidence for explicit searches
  if (context.isRestaurantSearch) {
    return INTENT_CONFIDENCE.HIGH;
  }
  if (context.isCuisineSearch && !context.hasDishPriorityTerm) {
    return INTENT_CONFIDENCE.HIGH;
  }
  if (context.isDishSearch && context.hasDishPriorityTerm) {
    return INTENT_CONFIDENCE.HIGH;
  }
  if (context.isDishSearch) {
    return INTENT_CONFIDENCE.MEDIUM;
  }
  // Default for general searches
  return INTENT_CONFIDENCE.LOW;
}

/**
 * Convert V2 SearchIntent to legacy SearchContext for backward compatibility
 */
export function intentToContext(intent: SearchIntent, query: string): SearchContext {
  const keywords = extractKeywords(query);
  const detectedCuisines = detectCuisines(keywords);

  return {
    query,
    keywords,
    detectedCuisines,
    isCuisineSearch: intent.primary === 'cuisine',
    isDishSearch: intent.primary === 'dish',
    isRestaurantSearch: intent.primary === 'restaurant' || intent.primary === 'brand',
    hasDishPriorityTerm: hasDishPriorityTerm(keywords),
  };
}
