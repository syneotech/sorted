import { describe, it, expect } from 'vitest';
import {
  extractKeywords,
  detectCuisines,
  isDishSearch,
  isCuisineSearch,
  isRestaurantNameSearch,
  analyzeQuery,
  getPrimaryIntent,
  hasDishPriorityTerm,
  analyzeQueryV2,
  getIntentConfidence,
} from '../keywords';
import { INTENT_CONFIDENCE } from '../config';

describe('extractKeywords', () => {
  it('should extract meaningful keywords', () => {
    const keywords = extractKeywords('best chinese food near me');
    expect(keywords).toContain('chinese');
    expect(keywords).not.toContain('me');
    expect(keywords).not.toContain('the');
  });

  it('should handle special characters', () => {
    const keywords = extractKeywords('pizza! @home #1');
    expect(keywords).toContain('pizza');
    expect(keywords).toContain('home');
  });

  it('should extract bigrams', () => {
    const keywords = extractKeywords('butter chicken');
    expect(keywords).toContain('butter');
    expect(keywords).toContain('chicken');
    expect(keywords).toContain('butter chicken');
  });
});

describe('detectCuisines', () => {
  it('should detect cuisine names', () => {
    const cuisines = detectCuisines(['chinese', 'restaurant']);
    expect(cuisines).toContain('Chinese');
  });

  it('should detect cuisines from dishes', () => {
    const cuisines = detectCuisines(['biryani']);
    expect(cuisines).toContain('Biryani');
  });

  it('should detect cuisines from aliases', () => {
    const cuisines = detectCuisines(['mughlai']);
    expect(cuisines).toContain('North Indian');
  });

  it('should return empty for non-cuisine keywords', () => {
    const cuisines = detectCuisines(['best', 'restaurant', 'nearby']);
    expect(cuisines).toHaveLength(0);
  });
});

describe('isDishSearch', () => {
  it('should return true for dish names', () => {
    expect(isDishSearch(['biryani'])).toBe(true);
    expect(isDishSearch(['butter chicken'])).toBe(true); // bigram matches
    expect(isDishSearch(['pizza'])).toBe(true);
    expect(isDishSearch(['dosa'])).toBe(true);
    expect(isDishSearch(['noodles'])).toBe(true);
  });

  it('should return false for non-dish keywords', () => {
    expect(isDishSearch(['xyz123'])).toBe(false);
    expect(isDishSearch(['unknown', 'item'])).toBe(false);
  });
});

describe('isCuisineSearch', () => {
  it('should return true for cuisine names', () => {
    expect(isCuisineSearch(['chinese'])).toBe(true);
    expect(isCuisineSearch(['italian'])).toBe(true);
    expect(isCuisineSearch(['south indian'])).toBe(true); // bigram
  });

  it('should return true for cuisine aliases', () => {
    expect(isCuisineSearch(['mughlai'])).toBe(true);
    expect(isCuisineSearch(['punjabi'])).toBe(true);
    // Note: burger IS a cuisine alias, but analyzeQuery() treats it as dish-priority
    expect(isCuisineSearch(['burger'])).toBe(true);
  });

  it('should return false for non-cuisine keywords', () => {
    expect(isCuisineSearch(['xyz123'])).toBe(false);
    expect(isCuisineSearch(['unknown'])).toBe(false);
  });
});

describe('hasDishPriorityTerm', () => {
  it('should return true for dish-priority terms', () => {
    expect(hasDishPriorityTerm(['burger'])).toBe(true);
    expect(hasDishPriorityTerm(['pizza'])).toBe(true);
    expect(hasDishPriorityTerm(['biryani'])).toBe(true);
    expect(hasDishPriorityTerm(['dosa'])).toBe(true);
    expect(hasDishPriorityTerm(['momos'])).toBe(true);
  });

  it('should return false for non-dish-priority terms', () => {
    expect(hasDishPriorityTerm(['chinese'])).toBe(false);
    expect(hasDishPriorityTerm(['italian'])).toBe(false);
    expect(hasDishPriorityTerm(['restaurant'])).toBe(false);
  });

  it('should return true if any keyword is dish-priority', () => {
    expect(hasDishPriorityTerm(['best', 'burger', 'near'])).toBe(true);
    expect(hasDishPriorityTerm(['pizza', 'place'])).toBe(true);
  });
});

describe('isRestaurantNameSearch', () => {
  it('should detect restaurant name patterns', () => {
    expect(isRestaurantNameSearch("McDonald's", ['mcdonalds'])).toBe(true);
    expect(isRestaurantNameSearch('Pizza Hut', ['pizza', 'hut'])).toBe(true);
  });

  it('should not flag cuisine/dish searches as restaurant names', () => {
    expect(isRestaurantNameSearch('chinese food', ['chinese', 'food'])).toBe(false);
    expect(isRestaurantNameSearch('biryani', ['biryani'])).toBe(false);
  });
});

describe('analyzeQuery', () => {
  it('should analyze cuisine search', () => {
    const context = analyzeQuery('chinese food');
    expect(context.isCuisineSearch).toBe(true);
    expect(context.detectedCuisines).toContain('Chinese');
  });

  it('should analyze dish search', () => {
    const context = analyzeQuery('butter chicken');
    expect(context.isDishSearch).toBe(true);
    expect(context.detectedCuisines.length).toBeGreaterThan(0);
  });

  it('should include original query', () => {
    const context = analyzeQuery('test query');
    expect(context.query).toBe('test query');
  });

  it('should extract keywords', () => {
    const context = analyzeQuery('best chinese near me');
    expect(context.keywords).toContain('chinese');
  });

  it('should treat dish-priority terms as dish search not cuisine search', () => {
    const context = analyzeQuery('burger');
    // burger is a cuisine alias, but it's also a dish-priority term
    // so isCuisineSearch should be false for better ranking
    expect(context.hasDishPriorityTerm).toBe(true);
    expect(context.isDishSearch).toBe(true);
    expect(context.isCuisineSearch).toBe(false); // overridden due to dish-priority
  });

  it('should not override cuisine search for non-dish-priority terms', () => {
    const context = analyzeQuery('chinese');
    expect(context.hasDishPriorityTerm).toBe(false);
    expect(context.isCuisineSearch).toBe(true);
  });

  it('should set hasDishPriorityTerm for pizza search', () => {
    const context = analyzeQuery('pizza');
    expect(context.hasDishPriorityTerm).toBe(true);
    expect(context.isDishSearch).toBe(true);
  });
});

describe('getPrimaryIntent', () => {
  it('should return cuisine for cuisine searches', () => {
    const context = analyzeQuery('chinese');
    expect(getPrimaryIntent(context)).toBe('cuisine');
  });

  it('should return dish for dish searches', () => {
    const context = analyzeQuery('pizza');
    // Pizza is both a cuisine and a dish, so might return either
    const intent = getPrimaryIntent(context);
    expect(['cuisine', 'dish']).toContain(intent);
  });

  it('should return general for vague searches', () => {
    const context = analyzeQuery('restaurant');
    expect(getPrimaryIntent(context)).toBe('general');
  });
});

// ============================================================================
// V2 Multi-Axis Intent Detection Tests
// ============================================================================

describe('analyzeQueryV2', () => {
  describe('Primary Intent Detection', () => {
    it('should detect cuisine intent for explicit cuisine terms', () => {
      const intent = analyzeQueryV2('chinese food');
      expect(intent.primary).toBe('cuisine');
      expect(intent.confidence).toBeGreaterThanOrEqual(INTENT_CONFIDENCE.HIGH);
    });

    it('should detect dish intent for dish-priority terms', () => {
      const intent = analyzeQueryV2('burger');
      expect(intent.primary).toBe('dish');
      expect(intent.confidence).toBeGreaterThanOrEqual(INTENT_CONFIDENCE.HIGH);
    });

    it('should detect brand intent for known brands', () => {
      const intent = analyzeQueryV2('mcdonalds');
      expect(intent.primary).toBe('brand');
      expect(intent.confidence).toBe(INTENT_CONFIDENCE.HIGH);
    });

    it('should detect brand intent for chains like Mainland China', () => {
      const intent = analyzeQueryV2('mainland china');
      expect(intent.primary).toBe('brand');
    });

    it('should detect restaurant intent for proper noun patterns', () => {
      const intent = analyzeQueryV2('Pizza Hut');
      expect(['brand', 'restaurant']).toContain(intent.primary);
    });

    it('should detect explore intent for vague queries', () => {
      const intent = analyzeQueryV2('good food');
      expect(intent.primary).toBe('explore');
    });
  });

  describe('Modifier Detection', () => {
    it('should detect quality modifier "best"', () => {
      const intent = analyzeQueryV2('best chinese food');
      expect(intent.modifiers.quality).toBe('best');
    });

    it('should detect quality modifier "cheap"', () => {
      const intent = analyzeQueryV2('cheap pizza');
      expect(intent.modifiers.quality).toBe('cheap');
    });

    it('should detect quality modifier "authentic"', () => {
      const intent = analyzeQueryV2('authentic italian');
      expect(intent.modifiers.quality).toBe('authentic');
    });

    it('should detect proximity modifier', () => {
      const intent = analyzeQueryV2('pizza near me');
      expect(intent.modifiers.proximity).toBe('near_me');
    });

    it('should detect time modifier for breakfast', () => {
      const intent = analyzeQueryV2('breakfast places');
      expect(intent.modifiers.time).toBe('breakfast');
    });

    it('should detect time modifier for late night', () => {
      const intent = analyzeQueryV2('late night food');
      expect(intent.modifiers.time).toBe('late_night');
    });

    it('should detect dietary modifier for veg', () => {
      const intent = analyzeQueryV2('pure veg restaurant');
      expect(intent.modifiers.dietary).toBe('veg');
    });

    it('should detect dietary modifier for halal', () => {
      const intent = analyzeQueryV2('halal biryani');
      expect(intent.modifiers.dietary).toBe('halal');
    });

    it('should detect multiple modifiers', () => {
      const intent = analyzeQueryV2('best veg chinese near me');
      expect(intent.modifiers.quality).toBe('best');
      expect(intent.modifiers.dietary).toBe('veg');
      expect(intent.modifiers.proximity).toBe('near_me');
    });
  });

  describe('Confidence Levels', () => {
    it('should have high confidence for explicit cuisine search', () => {
      const intent = analyzeQueryV2('south indian');
      expect(intent.confidence).toBeGreaterThanOrEqual(INTENT_CONFIDENCE.HIGH);
    });

    it('should have high confidence for brand search', () => {
      const intent = analyzeQueryV2('kfc');
      expect(intent.confidence).toBe(INTENT_CONFIDENCE.HIGH);
    });

    it('should have medium confidence for dish search via cuisine', () => {
      const intent = analyzeQueryV2('dosa'); // Dish that maps to cuisine
      expect(intent.confidence).toBeGreaterThanOrEqual(INTENT_CONFIDENCE.MEDIUM);
    });

    it('should have low confidence for explore intent', () => {
      const intent = analyzeQueryV2('something nice');
      expect(intent.confidence).toBe(INTENT_CONFIDENCE.LOW);
    });
  });
});

describe('getIntentConfidence', () => {
  it('should return high confidence for restaurant search', () => {
    const context = analyzeQuery('Pizza Hut');
    const confidence = getIntentConfidence(context);
    expect(confidence).toBe(INTENT_CONFIDENCE.HIGH);
  });

  it('should return high confidence for cuisine search', () => {
    const context = analyzeQuery('chinese');
    const confidence = getIntentConfidence(context);
    expect(confidence).toBe(INTENT_CONFIDENCE.HIGH);
  });

  it('should return high confidence for dish-priority terms', () => {
    const context = analyzeQuery('burger');
    const confidence = getIntentConfidence(context);
    expect(confidence).toBe(INTENT_CONFIDENCE.HIGH);
  });

  it('should return low confidence for general search', () => {
    const context = analyzeQuery('food');
    const confidence = getIntentConfidence(context);
    expect(confidence).toBe(INTENT_CONFIDENCE.LOW);
  });
});
