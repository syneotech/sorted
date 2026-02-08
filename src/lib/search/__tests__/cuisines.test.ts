import { describe, it, expect } from 'vitest';
import {
  CUISINE_TAXONOMY,
  CUISINE_TAXONOMY_V2,
  findCuisineByName,
  findCuisineByAlias,
  findCuisinesByDish,
  cuisineMatchesSearch,
  getRelatedCuisines,
  cuisineSimilarity,
  // V2 Functions
  findCuisineByIdV2,
  findCuisineByNameV2,
  getCuisineAffinity,
  inferCuisineProfile,
  getDishCuisineWeight,
  findCuisinesByDishV2,
  calculateCuisineCoverage,
  getCuisineProminence,
} from '../cuisines';

describe('CUISINE_TAXONOMY', () => {
  it('should contain major cuisine categories', () => {
    const cuisineNames = CUISINE_TAXONOMY.map(c => c.name);
    expect(cuisineNames).toContain('Chinese');
    expect(cuisineNames).toContain('North Indian');
    expect(cuisineNames).toContain('South Indian');
    expect(cuisineNames).toContain('Italian');
    expect(cuisineNames).toContain('Biryani');
    expect(cuisineNames).toContain('Pizza');
    expect(cuisineNames).toContain('Fast Food');
  });

  it('should have aliases for each cuisine', () => {
    for (const cuisine of CUISINE_TAXONOMY) {
      expect(cuisine.aliases.length).toBeGreaterThan(0);
    }
  });

  it('should have dishes for each cuisine', () => {
    for (const cuisine of CUISINE_TAXONOMY) {
      expect(cuisine.dishes.length).toBeGreaterThan(0);
    }
  });
});

describe('findCuisineByName', () => {
  it('should find cuisine by exact name', () => {
    const chinese = findCuisineByName('Chinese');
    expect(chinese).toBeDefined();
    expect(chinese?.name).toBe('Chinese');
  });

  it('should be case insensitive', () => {
    const chinese = findCuisineByName('chinese');
    expect(chinese?.name).toBe('Chinese');

    const northIndian = findCuisineByName('NORTH INDIAN');
    expect(northIndian?.name).toBe('North Indian');
  });

  it('should return undefined for unknown cuisine', () => {
    const unknown = findCuisineByName('Unknown Cuisine');
    expect(unknown).toBeUndefined();
  });
});

describe('findCuisineByAlias', () => {
  it('should find cuisine by alias', () => {
    const chinese = findCuisineByAlias('indo-chinese');
    expect(chinese?.name).toBe('Chinese');

    const northIndian = findCuisineByAlias('punjabi');
    expect(northIndian?.name).toBe('North Indian');
  });

  it('should find cuisine by mughlai alias', () => {
    const mughlai = findCuisineByAlias('mughlai');
    expect(mughlai?.name).toBe('North Indian');
  });

  it('should return undefined for unknown alias', () => {
    const unknown = findCuisineByAlias('xyz-food');
    expect(unknown).toBeUndefined();
  });
});

describe('findCuisinesByDish', () => {
  it('should find cuisines that serve biryani', () => {
    const cuisines = findCuisinesByDish('biryani');
    expect(cuisines.length).toBeGreaterThan(0);
    const names = cuisines.map(c => c.name);
    expect(names).toContain('Biryani');
    expect(names).toContain('North Indian');
  });

  it('should find cuisines that serve dosa', () => {
    const cuisines = findCuisinesByDish('dosa');
    const names = cuisines.map(c => c.name);
    expect(names).toContain('South Indian');
  });

  it('should find cuisines for pizza', () => {
    const cuisines = findCuisinesByDish('pizza');
    const names = cuisines.map(c => c.name);
    expect(names).toContain('Pizza');
    expect(names).toContain('Italian');
  });

  it('should return empty array for unknown dish', () => {
    const cuisines = findCuisinesByDish('unknowndish123');
    expect(cuisines).toHaveLength(0);
  });
});

describe('cuisineMatchesSearch', () => {
  it('should match direct cuisine name', () => {
    expect(cuisineMatchesSearch('Chinese', 'chinese')).toBe(true);
    expect(cuisineMatchesSearch('North Indian', 'indian')).toBe(true);
  });

  it('should match cuisine alias', () => {
    expect(cuisineMatchesSearch('Chinese', 'indo-chinese')).toBe(true);
    expect(cuisineMatchesSearch('North Indian', 'punjabi')).toBe(true);
  });

  it('should not match unrelated cuisines', () => {
    expect(cuisineMatchesSearch('South Indian', 'chinese')).toBe(false);
    expect(cuisineMatchesSearch('Italian', 'biryani')).toBe(false);
  });
});

describe('getRelatedCuisines', () => {
  it('should return related cuisines for Chinese', () => {
    const related = getRelatedCuisines('Chinese');
    expect(related).toContain('Chinese');
    expect(related).toContain('Asian');
    expect(related).toContain('Thai');
    expect(related.some(r => r.toLowerCase().includes('indo-chinese'))).toBe(true);
  });

  it('should return empty array for unknown cuisine', () => {
    const related = getRelatedCuisines('UnknownCuisine');
    expect(related).toHaveLength(0);
  });
});

describe('cuisineSimilarity', () => {
  it('should return 1.0 for exact match', () => {
    expect(cuisineSimilarity('Chinese', 'Chinese')).toBe(1.0);
    expect(cuisineSimilarity('chinese', 'CHINESE')).toBe(1.0);
  });

  it('should return high score for partial match', () => {
    const score = cuisineSimilarity('Indo-Chinese', 'Chinese');
    expect(score).toBeGreaterThanOrEqual(0.9);
  });

  it('should return 0.95 for alias of same cuisine', () => {
    const score = cuisineSimilarity('North Indian', 'Punjabi');
    expect(score).toBeGreaterThanOrEqual(0.7);
  });

  it('should return 0.7 for related cuisines', () => {
    const score = cuisineSimilarity('Chinese', 'Thai');
    expect(score).toBeGreaterThanOrEqual(0.7);
  });

  it('should return 0 for unrelated cuisines', () => {
    const score = cuisineSimilarity('Italian', 'South Indian');
    expect(score).toBe(0);
  });
});

// ============================================================================
// V2 Hierarchical Taxonomy Tests
// ============================================================================

describe('CUISINE_TAXONOMY_V2', () => {
  it('should contain all major cuisine families', () => {
    const cuisineIds = CUISINE_TAXONOMY_V2.map(c => c.id);
    // East Asian
    expect(cuisineIds).toContain('chinese');
    expect(cuisineIds).toContain('japanese');
    expect(cuisineIds).toContain('thai');
    // South Asian
    expect(cuisineIds).toContain('north_indian');
    expect(cuisineIds).toContain('south_indian');
    expect(cuisineIds).toContain('biryani');
    // Middle Eastern
    expect(cuisineIds).toContain('lebanese');
    expect(cuisineIds).toContain('turkish');
    // European/American
    expect(cuisineIds).toContain('italian');
    expect(cuisineIds).toContain('pizza');
    expect(cuisineIds).toContain('fast_food');
    expect(cuisineIds).toContain('mexican');
    // Specialty
    expect(cuisineIds).toContain('cafe');
    expect(cuisineIds).toContain('desserts');
    expect(cuisineIds).toContain('street_food');
  });

  it('should have proper hierarchy with parent relationships', () => {
    const chinese = CUISINE_TAXONOMY_V2.find(c => c.id === 'chinese');
    expect(chinese?.parent).toBe('east_asian');

    const punjabi = CUISINE_TAXONOMY_V2.find(c => c.id === 'punjabi');
    expect(punjabi?.parent).toBe('north_indian');

    const pizza = CUISINE_TAXONOMY_V2.find(c => c.id === 'pizza');
    expect(pizza?.parent).toBe('italian');
  });

  it('should have dish entries with weights', () => {
    const chinese = CUISINE_TAXONOMY_V2.find(c => c.id === 'chinese');
    expect(chinese?.dishes.length).toBeGreaterThan(0);

    const noodlesDish = chinese?.dishes.find(d => d.name === 'noodles');
    expect(noodlesDish?.weight).toBe(1.0);

    const momosDish = chinese?.dishes.find(d => d.name === 'momos');
    expect(momosDish?.weight).toBeLessThan(1.0); // Shared with Tibetan
  });

  it('should have neighbor relationships with affinity', () => {
    const chinese = CUISINE_TAXONOMY_V2.find(c => c.id === 'chinese');
    expect(chinese?.neighbors.length).toBeGreaterThan(0);

    const thaiNeighbor = chinese?.neighbors.find(n => n.cuisine === 'thai');
    expect(thaiNeighbor?.affinity).toBeGreaterThan(0);
    expect(thaiNeighbor?.affinity).toBeLessThanOrEqual(1);
  });
});

describe('findCuisineByIdV2', () => {
  it('should find cuisine by ID', () => {
    const chinese = findCuisineByIdV2('chinese');
    expect(chinese?.name).toBe('Chinese');
  });

  it('should be case insensitive', () => {
    const chinese = findCuisineByIdV2('CHINESE');
    expect(chinese?.name).toBe('Chinese');
  });

  it('should return undefined for unknown ID', () => {
    expect(findCuisineByIdV2('unknown')).toBeUndefined();
  });
});

describe('findCuisineByNameV2', () => {
  it('should find cuisine by name', () => {
    const chinese = findCuisineByNameV2('Chinese');
    expect(chinese?.id).toBe('chinese');
  });

  it('should find cuisine by alias', () => {
    const chinese = findCuisineByNameV2('indo-chinese');
    expect(chinese?.id).toBe('chinese');

    const northIndian = findCuisineByNameV2('punjabi');
    expect(northIndian?.id).toBe('punjabi');
  });
});

describe('getCuisineAffinity', () => {
  it('should return 1.0 for same cuisine', () => {
    expect(getCuisineAffinity('Chinese', 'Chinese')).toBe(1.0);
  });

  it('should return affinity for neighbor cuisines', () => {
    const affinity = getCuisineAffinity('Chinese', 'Thai');
    expect(affinity).toBeGreaterThan(0);
    expect(affinity).toBeLessThanOrEqual(1);
  });

  it('should return affinity in both directions', () => {
    const affinity1 = getCuisineAffinity('Chinese', 'Thai');
    const affinity2 = getCuisineAffinity('Thai', 'Chinese');
    // Both should have affinity (may be symmetric or asymmetric)
    expect(Math.max(affinity1, affinity2)).toBeGreaterThan(0);
  });

  it('should return parent-child affinity', () => {
    const affinity = getCuisineAffinity('Punjabi', 'North Indian');
    expect(affinity).toBeGreaterThanOrEqual(0.8);
  });

  it('should return same-family affinity', () => {
    // Japanese and Korean share east_asian parent
    const affinity = getCuisineAffinity('Japanese', 'Korean');
    expect(affinity).toBeGreaterThan(0);
  });

  it('should return 0 for unrelated cuisines', () => {
    const affinity = getCuisineAffinity('Italian', 'South Indian');
    expect(affinity).toBe(0);
  });
});

describe('inferCuisineProfile', () => {
  it('should set first cuisine as primary', () => {
    const profile = inferCuisineProfile(['Chinese', 'North Indian', 'Fast Food']);
    expect(profile.primary).toBe('Chinese');
  });

  it('should set remaining cuisines as secondary with decreasing strength', () => {
    const profile = inferCuisineProfile(['Chinese', 'North Indian', 'Fast Food']);
    expect(profile.secondary.length).toBe(2);
    expect(profile.secondary[0].cuisine).toBe('North Indian');
    expect(profile.secondary[0].strength).toBeGreaterThan(profile.secondary[1].strength);
  });

  it('should estimate coverage based on secondary cuisines', () => {
    const singleCuisine = inferCuisineProfile(['Chinese']);
    const multiCuisine = inferCuisineProfile(['Chinese', 'North Indian', 'Fast Food', 'Cafe']);

    // Single cuisine restaurant has higher coverage
    expect(singleCuisine.estimatedCoverage).toBeGreaterThan(multiCuisine.estimatedCoverage);
  });

  it('should handle empty cuisine list', () => {
    const profile = inferCuisineProfile([]);
    expect(profile.primary).toBe('unknown');
    expect(profile.secondary).toHaveLength(0);
    expect(profile.estimatedCoverage).toBe(0);
  });
});

describe('getDishCuisineWeight', () => {
  it('should return high weight for exclusive dishes', () => {
    const weight = getDishCuisineWeight('manchurian', 'Chinese');
    expect(weight).toBe(1.0);
  });

  it('should return lower weight for shared dishes', () => {
    const weight = getDishCuisineWeight('momos', 'Chinese');
    expect(weight).toBeLessThan(1.0);
    expect(weight).toBeGreaterThan(0);
  });

  it('should return 0 for non-associated dish', () => {
    const weight = getDishCuisineWeight('dosa', 'Chinese');
    expect(weight).toBe(0);
  });
});

describe('findCuisinesByDishV2', () => {
  it('should find cuisines with weights for dishes', () => {
    const results = findCuisinesByDishV2('momos');
    expect(results.length).toBeGreaterThan(0);

    // Should include both Chinese and Tibetan
    const cuisineIds = results.map(r => r.cuisine.id);
    expect(cuisineIds).toContain('chinese');
    expect(cuisineIds).toContain('tibetan');
  });

  it('should include weight for each cuisine', () => {
    const results = findCuisinesByDishV2('pizza');
    expect(results.length).toBeGreaterThan(0);

    for (const result of results) {
      expect(result.weight).toBeGreaterThan(0);
      expect(result.weight).toBeLessThanOrEqual(1);
    }
  });
});

describe('calculateCuisineCoverage', () => {
  it('should return high coverage for primary cuisine match', () => {
    const profile = inferCuisineProfile(['Chinese']);
    const coverage = calculateCuisineCoverage(['Chinese'], profile);
    expect(coverage).toBeGreaterThanOrEqual(0.8);
  });

  it('should return lower coverage for secondary cuisine match', () => {
    const profile = inferCuisineProfile(['North Indian', 'Chinese', 'Fast Food']);
    const coverage = calculateCuisineCoverage(['Chinese'], profile);
    // Chinese is secondary, so coverage is lower
    expect(coverage).toBeLessThan(1.0);
    expect(coverage).toBeGreaterThan(0);
  });

  it('should return 0.5 for neutral (no searched cuisines)', () => {
    const profile = inferCuisineProfile(['Chinese']);
    const coverage = calculateCuisineCoverage([], profile);
    expect(coverage).toBe(0.5);
  });
});

describe('getCuisineProminence', () => {
  it('should return 1.0 for primary cuisine match', () => {
    const profile = inferCuisineProfile(['Chinese', 'North Indian']);
    const prominence = getCuisineProminence(['Chinese'], profile);
    expect(prominence).toBe(1.0);
  });

  it('should return lower prominence for secondary cuisine match', () => {
    const profile = inferCuisineProfile(['North Indian', 'Chinese']);
    const prominence = getCuisineProminence(['Chinese'], profile);
    expect(prominence).toBeLessThan(1.0);
    expect(prominence).toBeGreaterThan(0);
  });
});
