import { describe, it, expect } from 'vitest';
import {
  calculateCuisineScore,
  calculateNameScore,
  calculateRatingScore,
  calculatePopularityScore,
  calculateRelevanceScore,
  calculateQueryInNameBonus,
  scoreAndSortRestaurants,
  filterByRelevance,
  getRelevanceTier,
} from '../relevance';
import { analyzeQuery } from '../keywords';
import type { NormalizedRestaurant } from '../../swiggy/types';

// Helper to create mock restaurants
function createMockRestaurant(overrides: Partial<NormalizedRestaurant> = {}): NormalizedRestaurant {
  return {
    id: 'test-123',
    platform: 'swiggy',
    platformId: '123',
    name: 'Test Restaurant',
    imageUrl: 'https://example.com/image.jpg',
    locality: 'Koramangala',
    area: 'Bangalore',
    cuisines: ['North Indian', 'Chinese'],
    rating: 4.2,
    ratingCount: '1K+',
    costForTwo: '₹400 for two',
    costForTwoValue: 400,
    deliveryTime: 30,
    deliveryTimeString: '30 mins',
    isOpen: true,
    deepLink: 'https://swiggy.com/test',
    ...overrides,
  };
}

describe('Cuisine Score Calculation', () => {
  it('should return high score for exact primary cuisine match', () => {
    // V2: Scoring factors in coverage and prominence
    // Chinese as primary cuisine gets high score
    const restaurant = createMockRestaurant({ cuisines: ['Chinese', 'North Indian'] });
    const context = analyzeQuery('chinese');

    const score = calculateCuisineScore(restaurant, context);
    // With affinity=1.0, coverage~0.7, prominence=1.0, confidence=0.9
    // Score should be in the 60-80 range for primary match
    expect(score).toBeGreaterThanOrEqual(60);
  });

  it('should return high score for related cuisine match', () => {
    const restaurant = createMockRestaurant({ cuisines: ['Indo-Chinese'] });
    const context = analyzeQuery('chinese');

    const score = calculateCuisineScore(restaurant, context);
    // Indo-Chinese has high affinity with Chinese
    expect(score).toBeGreaterThanOrEqual(60);
  });

  it('should return moderate score for dish-based cuisine match', () => {
    // V2: biryani search matches North Indian (which has biryani as dish)
    // but Biryani cuisine is a better match
    const restaurant = createMockRestaurant({ cuisines: ['North Indian', 'Mughlai'] });
    const context = analyzeQuery('biryani');

    const score = calculateCuisineScore(restaurant, context);
    // North Indian has biryani dish with lower weight (0.7)
    // Mughlai is related to Biryani cuisine
    expect(score).toBeGreaterThanOrEqual(10);
  });

  it('should return low score for non-matching cuisine', () => {
    const restaurant = createMockRestaurant({ cuisines: ['South Indian'] });
    const context = analyzeQuery('chinese');

    const score = calculateCuisineScore(restaurant, context);
    expect(score).toBeLessThanOrEqual(20);
  });

  it('should return neutral score when no cuisine in query', () => {
    const restaurant = createMockRestaurant({ cuisines: ['Chinese'] });
    const context = analyzeQuery('restaurant near me');

    const score = calculateCuisineScore(restaurant, context);
    expect(score).toBeGreaterThanOrEqual(30);
    expect(score).toBeLessThanOrEqual(60);
  });
});

describe('Name Score Calculation', () => {
  it('should return 100 for exact name match', () => {
    const restaurant = createMockRestaurant({ name: 'Pizza Hut' });
    const context = analyzeQuery('pizza hut');

    const score = calculateNameScore(restaurant, context);
    expect(score).toBe(100);
  });

  it('should return high score for starts-with match', () => {
    const restaurant = createMockRestaurant({ name: 'Pizza Hut Koramangala' });
    const context = analyzeQuery('pizza hut');

    const score = calculateNameScore(restaurant, context);
    expect(score).toBeGreaterThanOrEqual(70);
  });

  it('should return medium score for contains match', () => {
    const restaurant = createMockRestaurant({ name: 'The Best Pizza Hut Express' });
    const context = analyzeQuery('pizza hut');

    const score = calculateNameScore(restaurant, context);
    expect(score).toBeGreaterThanOrEqual(40);
    expect(score).toBeLessThanOrEqual(70);
  });

  it('should return low score for no name match', () => {
    const restaurant = createMockRestaurant({ name: 'Burger King' });
    const context = analyzeQuery('pizza hut');

    const score = calculateNameScore(restaurant, context);
    expect(score).toBeLessThanOrEqual(40);
  });
});

describe('Rating Score Calculation', () => {
  it('should return 0 for ratings below threshold', () => {
    const restaurant = createMockRestaurant({ rating: 3.0 });
    const score = calculateRatingScore(restaurant);
    expect(score).toBe(0);
  });

  it('should return proportional score for good ratings', () => {
    const restaurant = createMockRestaurant({ rating: 4.0 });
    const score = calculateRatingScore(restaurant);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });

  it('should return high score for excellent ratings', () => {
    const restaurant = createMockRestaurant({ rating: 4.7 });
    const score = calculateRatingScore(restaurant);
    expect(score).toBeGreaterThanOrEqual(80);
  });

  it('should return max score for perfect ratings', () => {
    const restaurant = createMockRestaurant({ rating: 5.0 });
    const score = calculateRatingScore(restaurant);
    expect(score).toBe(100);
  });
});

describe('Popularity Score Calculation', () => {
  it('should return 0 for low rating counts', () => {
    const restaurant = createMockRestaurant({ ratingCount: '50+' });
    const score = calculatePopularityScore(restaurant);
    expect(score).toBe(0);
  });

  it('should return proportional score for medium popularity', () => {
    const restaurant = createMockRestaurant({ ratingCount: '1K+' });
    const score = calculatePopularityScore(restaurant);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });

  it('should return high score for very popular restaurants', () => {
    const restaurant = createMockRestaurant({ ratingCount: '10K+' });
    const score = calculatePopularityScore(restaurant);
    expect(score).toBeGreaterThanOrEqual(80);
  });
});

describe('Total Relevance Score', () => {
  it('should return high score for perfect match', () => {
    const restaurant = createMockRestaurant({
      name: 'Chung Wah Chinese',
      cuisines: ['Chinese', 'Pan-Asian'],
      rating: 4.5,
      ratingCount: '5K+',
    });

    const context = analyzeQuery('chinese');
    const result = calculateRelevanceScore(restaurant, context);

    expect(result.total).toBeGreaterThanOrEqual(70);
  });

  it('should return low score for poor match', () => {
    const restaurant = createMockRestaurant({
      name: 'South Indian Meals',
      cuisines: ['South Indian'],
      rating: 3.5,
      ratingCount: '100+',
    });

    const context = analyzeQuery('chinese');
    const result = calculateRelevanceScore(restaurant, context);

    expect(result.total).toBeLessThanOrEqual(30);
  });

  it('should include breakdown in score', () => {
    const restaurant = createMockRestaurant();
    const context = analyzeQuery('test query');
    const result = calculateRelevanceScore(restaurant, context);

    expect(result.breakdown).toBeDefined();
    expect(result.breakdown.cuisineMatch).toBeDefined();
    expect(result.breakdown.nameMatch).toBeDefined();
    expect(result.breakdown.ratingBoost).toBeDefined();
    expect(result.breakdown.popularityBoost).toBeDefined();
  });
});

describe('Score and Sort Restaurants', () => {
  it('should sort restaurants by relevance', () => {
    const restaurants = [
      createMockRestaurant({
        id: '1',
        name: 'South Indian Meals',
        cuisines: ['South Indian'],
        rating: 4.5,
      }),
      createMockRestaurant({
        id: '2',
        name: 'Mainland China',
        cuisines: ['Chinese', 'Pan-Asian'],
        rating: 4.3,
      }),
      createMockRestaurant({
        id: '3',
        name: 'Chinese Wok',
        cuisines: ['Chinese', 'Indo-Chinese'],
        rating: 4.0,
      }),
    ];

    const results = scoreAndSortRestaurants(restaurants, 'chinese');

    // Chinese restaurants should rank higher
    expect(results[0].item.id).not.toBe('1'); // South Indian should not be first
    expect(results[0].relevance.total).toBeGreaterThan(results[2].relevance.total);
  });
});

describe('Filter by Relevance', () => {
  it('should filter out low relevance results', () => {
    const results = [
      {
        item: createMockRestaurant({ id: '1' }),
        relevance: { total: 80, breakdown: { cuisineMatch: 40, nameMatch: 20, ratingBoost: 10, popularityBoost: 10 } },
      },
      {
        item: createMockRestaurant({ id: '2' }),
        relevance: { total: 5, breakdown: { cuisineMatch: 2, nameMatch: 1, ratingBoost: 1, popularityBoost: 1 } },
      },
    ];

    const filtered = filterByRelevance(results);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].item.id).toBe('1');
  });
});

describe('Relevance Tier', () => {
  it('should return correct tier for scores', () => {
    expect(getRelevanceTier(95)).toBe('perfect');
    expect(getRelevanceTier(80)).toBe('high');
    expect(getRelevanceTier(50)).toBe('medium');
    expect(getRelevanceTier(10)).toBe('low');
  });
});

describe('Query In Name Bonus', () => {
  it('should give bonus when query keyword is a word in restaurant name', () => {
    const restaurant = createMockRestaurant({ name: 'Burger King' });
    const context = analyzeQuery('burger');

    const bonus = calculateQueryInNameBonus(restaurant, context);
    expect(bonus).toBe(35); // keyword is exact word in name
  });

  it('should give smaller bonus for substring match', () => {
    const restaurant = createMockRestaurant({ name: 'Burgertown Express' });
    const context = analyzeQuery('burger');

    const bonus = calculateQueryInNameBonus(restaurant, context);
    // "burger" is a substring of "Burgertown", not an exact word match
    expect(bonus).toBe(15);
  });

  it('should give no bonus when keyword not in name', () => {
    const restaurant = createMockRestaurant({ name: 'South Indian Delights' });
    const context = analyzeQuery('burger');

    const bonus = calculateQueryInNameBonus(restaurant, context);
    expect(bonus).toBe(0);
  });

  it('should accumulate bonus for multiple keyword matches', () => {
    const restaurant = createMockRestaurant({ name: 'Pizza Burger Joint' });
    const context = analyzeQuery('pizza burger');

    const bonus = calculateQueryInNameBonus(restaurant, context);
    // 35 for "pizza" + 35 for "burger" + 15 for "pizza burger" substring = 85
    expect(bonus).toBeGreaterThanOrEqual(70);
    expect(bonus).toBeLessThanOrEqual(100);
  });

  it('should cap bonus at 100', () => {
    const restaurant = createMockRestaurant({ name: 'Pizza Burger Sandwich Wrap Cafe' });
    const context = analyzeQuery('pizza burger sandwich wrap');

    const bonus = calculateQueryInNameBonus(restaurant, context);
    expect(bonus).toBe(100); // capped at 100
  });
});

describe('Burger Search Fix', () => {
  it('should rank Burger King higher than unrelated restaurants for burger search', () => {
    const restaurants = [
      createMockRestaurant({
        id: '1',
        name: 'Desserts Corner',
        cuisines: ['Desserts', 'Cafe'],
        rating: 4.5,
        ratingCount: '5K+',
      }),
      createMockRestaurant({
        id: '2',
        name: 'South Indian Pure Veg',
        cuisines: ['South Indian'],
        rating: 4.3,
        ratingCount: '3K+',
      }),
      createMockRestaurant({
        id: '3',
        name: 'Burger King',
        cuisines: ['Fast Food', 'American'],
        rating: 4.0,
        ratingCount: '10K+',
      }),
      createMockRestaurant({
        id: '4',
        name: 'American Snacks',
        cuisines: ['American', 'Fast Food'],
        rating: 4.2,
        ratingCount: '2K+',
      }),
    ];

    const results = scoreAndSortRestaurants(restaurants, 'burger');

    // Burger King should rank higher due to name bonus
    const burgerKingRank = results.findIndex(r => r.item.id === '3');
    const dessertsRank = results.findIndex(r => r.item.id === '1');
    const southIndianRank = results.findIndex(r => r.item.id === '2');

    expect(burgerKingRank).toBeLessThan(dessertsRank);
    expect(burgerKingRank).toBeLessThan(southIndianRank);
  });

  it('should treat burger as dish search, not cuisine search', () => {
    const context = analyzeQuery('burger');
    expect(context.hasDishPriorityTerm).toBe(true);
    expect(context.isCuisineSearch).toBe(false);
    expect(context.isDishSearch).toBe(true);
  });
});

// ============================================================================
// V2 Coverage-Weighted Scoring Tests
// ============================================================================

describe('V2 Chinese Search Relevance', () => {
  it('should rank pure Chinese restaurant higher than multi-cuisine with Chinese secondary', () => {
    const restaurants = [
      createMockRestaurant({
        id: 'mainland',
        name: 'Mainland China',
        cuisines: ['Chinese', 'Pan-Asian'], // Primary Chinese
        rating: 4.3,
        ratingCount: '5K+',
      }),
      createMockRestaurant({
        id: 'chungwah',
        name: 'Chung Wah',
        cuisines: ['Chinese'], // Pure Chinese
        rating: 4.0,
        ratingCount: '1K+',
      }),
      createMockRestaurant({
        id: 'empire',
        name: 'Empire Restaurant',
        cuisines: ['North Indian', 'South Indian', 'Chinese', 'Continental'], // Chinese is tertiary
        rating: 4.5,
        ratingCount: '10K+',
      }),
    ];

    const results = scoreAndSortRestaurants(restaurants, 'chinese');

    // Pure Chinese or primary Chinese restaurants should rank higher
    const mainlandRank = results.findIndex(r => r.item.id === 'mainland');
    const chungwahRank = results.findIndex(r => r.item.id === 'chungwah');
    const empireRank = results.findIndex(r => r.item.id === 'empire');

    // Empire (with Chinese as secondary) should rank lower than pure Chinese restaurants
    expect(mainlandRank).toBeLessThan(empireRank);
    expect(chungwahRank).toBeLessThan(empireRank);
  });

  it('should de-bias popularity for low-relevance restaurants', () => {
    // Empire has higher popularity but lower Chinese relevance
    const empire = createMockRestaurant({
      id: 'empire',
      name: 'Empire Restaurant',
      cuisines: ['North Indian', 'South Indian', 'Chinese'], // Chinese tertiary
      rating: 4.5,
      ratingCount: '10K+', // Very popular
    });

    const chungwah = createMockRestaurant({
      id: 'chungwah',
      name: 'Chung Wah',
      cuisines: ['Chinese'], // Pure Chinese
      rating: 4.0,
      ratingCount: '500+', // Less popular
    });

    const context = analyzeQuery('chinese');
    const empireScore = calculateRelevanceScore(empire, context);
    const chungwahScore = calculateRelevanceScore(chungwah, context);

    // Despite higher popularity, Empire's low cuisine relevance should cap its score
    // Chung Wah with better relevance should compete well
    expect(chungwahScore.total).toBeGreaterThan(empireScore.total * 0.5);
  });
});

describe('V2 Hard Filter', () => {
  it('should filter out restaurants with no cuisine match for cuisine searches', () => {
    const southIndian = createMockRestaurant({
      cuisines: ['South Indian'],
      rating: 4.8,
      ratingCount: '10K+',
    });

    const context = analyzeQuery('chinese');
    const score = calculateRelevanceScore(southIndian, context);

    // Should be filtered (score 0) for cuisine search with no match
    expect(score.total).toBe(0);
  });

  it('should not filter for general/explore searches', () => {
    const southIndian = createMockRestaurant({
      cuisines: ['South Indian'],
      rating: 4.8,
      ratingCount: '10K+',
    });

    const context = analyzeQuery('good food'); // General query
    const score = calculateRelevanceScore(southIndian, context);

    // Should not be filtered for general searches
    expect(score.total).toBeGreaterThan(0);
  });
});

describe('V2 Popularity De-biasing', () => {
  it('should apply sigmoid saturation to popularity', () => {
    const mediumPopular = createMockRestaurant({ ratingCount: '2K+' });
    const veryPopular = createMockRestaurant({ ratingCount: '20K+' });

    const mediumScore = calculatePopularityScore(mediumPopular);
    const veryScore = calculatePopularityScore(veryPopular);

    // Sigmoid should saturate, so difference shouldn't be 10x
    expect(veryScore).toBeGreaterThan(mediumScore);
    expect(veryScore).toBeLessThan(mediumScore * 5); // Saturated
  });

  it('should apply relevance penalty to popularity', () => {
    const restaurant = createMockRestaurant({ ratingCount: '5K+' });

    const highRelevanceScore = calculatePopularityScore(restaurant, 80);
    const lowRelevanceScore = calculatePopularityScore(restaurant, 20);

    // Low relevance should reduce popularity score
    expect(lowRelevanceScore).toBeLessThan(highRelevanceScore);
  });
});

describe('V2 Feature Gating', () => {
  it('should emphasize name score for restaurant/brand searches', () => {
    const restaurant = createMockRestaurant({
      name: "McDonald's Koramangala",
      cuisines: ['Fast Food', 'American'],
    });

    // Restaurant/brand search should have name match component
    const context = analyzeQuery("McDonald's");
    const score = calculateRelevanceScore(restaurant, context);

    // Name match should be present and total should be reasonable
    expect(score.total).toBeGreaterThan(0);
    // For exact match restaurant name, the score should be decent
    expect(score.total).toBeGreaterThanOrEqual(30);
  });

  it('should use appropriate weights for cuisine search', () => {
    const restaurant = createMockRestaurant({
      name: 'Some Restaurant',
      cuisines: ['Chinese'],
    });

    const context = analyzeQuery('chinese');
    const score = calculateRelevanceScore(restaurant, context);

    // Cuisine match should be the dominant component
    expect(score.breakdown.cuisineMatch).toBeGreaterThanOrEqual(score.breakdown.nameMatch);
  });
});
