// Search relevance types

// ============================================================================
// V2 Types: Multi-axis Intent Model
// ============================================================================

/** Primary search intent types */
export type PrimaryIntent =
  | 'cuisine'
  | 'dish'
  | 'restaurant'
  | 'brand'
  | 'meal_type'
  | 'dietary'
  | 'occasion'
  | 'explore'
  | 'nearby';

/** Quality modifiers in search queries */
export type QualityModifier = 'best' | 'cheap' | 'authentic' | 'premium';

/** Time-based modifiers */
export type TimeModifier =
  | 'open_now'
  | 'late_night'
  | 'breakfast'
  | 'lunch'
  | 'dinner';

/** Dietary modifiers */
export type DietaryModifier = 'veg' | 'vegan' | 'jain' | 'halal';

/** Intent modifiers extracted from search query */
export interface IntentModifiers {
  quality?: QualityModifier;
  proximity?: 'near_me';
  time?: TimeModifier;
  dietary?: DietaryModifier;
}

/** Multi-axis search intent with confidence */
export interface SearchIntent {
  primary: PrimaryIntent;
  modifiers: IntentModifiers;
  confidence: number; // 0-1
}

// ============================================================================
// V2 Types: Hierarchical Cuisine Taxonomy
// ============================================================================

/** Cuisine hierarchy level */
export type CuisineLevel = 'family' | 'regional' | 'specialty';

/** Dish entry with exclusivity weight */
export interface DishEntry {
  name: string;
  weight: number; // 0-1 exclusivity (1.0 = exclusive to this cuisine)
}

/** Cuisine affinity for neighbor relationships */
export interface CuisineAffinity {
  cuisine: string;
  affinity: number; // 0-1
}

/** V2 Hierarchical cuisine taxonomy entry */
export interface CuisineTaxonomyV2 {
  id: string;
  name: string;
  level: CuisineLevel;
  parent?: string;
  aliases: string[];
  dishes: DishEntry[];
  neighbors: CuisineAffinity[];
}

/** Restaurant cuisine profile (inferred from cuisine list) */
export interface RestaurantCuisineProfile {
  primary: string;
  secondary: { cuisine: string; strength: number }[];
  estimatedCoverage: number; // 0-1, inferred from cuisine list
}

// ============================================================================
// V2 Types: Feature Gating
// ============================================================================

/** Feature gate levels */
export type FeatureGate = 'ON' | 'MEDIUM' | 'LOW' | 'OFF';

/** Intent-based feature gating configuration */
export interface IntentGating {
  cuisine: FeatureGate;
  name: FeatureGate;
  rating: FeatureGate;
  popularity: FeatureGate;
  distance?: FeatureGate;
}

// ============================================================================
// V1 Types (maintained for backward compatibility)
// ============================================================================

export interface RelevanceScore {
  /** Overall relevance score (0-100) */
  total: number;
  /** Breakdown of score components */
  breakdown: {
    /** Score from cuisine match (0-40) */
    cuisineMatch: number;
    /** Score from name match (0-30) */
    nameMatch: number;
    /** Score from rating (0-15) */
    ratingBoost: number;
    /** Score from popularity (0-15) */
    popularityBoost: number;
  };
}

export interface SearchContext {
  /** Original search query */
  query: string;
  /** Extracted keywords from query */
  keywords: string[];
  /** Detected cuisine types */
  detectedCuisines: string[];
  /** Whether query is a cuisine search */
  isCuisineSearch: boolean;
  /** Whether query is a dish search */
  isDishSearch: boolean;
  /** Whether query is a restaurant name search */
  isRestaurantSearch: boolean;
  /** Whether query contains dish-priority terms (e.g., burger, pizza) that should be treated as dishes not cuisines */
  hasDishPriorityTerm: boolean;
}

export interface ScoringWeights {
  /** Weight for cuisine match (default: 0.40) */
  cuisineMatch: number;
  /** Weight for name match (default: 0.30) */
  nameMatch: number;
  /** Weight for rating boost (default: 0.15) */
  ratingBoost: number;
  /** Weight for popularity boost (default: 0.15) */
  popularityBoost: number;
}

export interface CuisineTaxonomy {
  /** Main cuisine name */
  name: string;
  /** Aliases and variations */
  aliases: string[];
  /** Related dishes */
  dishes: string[];
  /** Related/similar cuisines */
  related: string[];
}

export interface RelevanceResult<T> {
  /** Original item */
  item: T;
  /** Relevance score */
  relevance: RelevanceScore;
}
