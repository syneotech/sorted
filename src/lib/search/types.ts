// Search relevance types

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
