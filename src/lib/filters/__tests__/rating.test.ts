import { describe, it, expect } from 'vitest';
import { filterByRating, getAverageRating, getRatingDistribution } from '../rating';
import { createMockComparisonRestaurant } from '@/test/helpers';

describe('filterByRating', () => {
  const restaurants = [
    createMockComparisonRestaurant({
      swiggy: { rating: 4.5 },
      zomato: { rating: 4.3 },
    }),
    createMockComparisonRestaurant({
      swiggy: { rating: 4.0 },
      zomato: { rating: 3.8 },
    }),
    createMockComparisonRestaurant({
      swiggy: { rating: 3.5 },
      zomato: { rating: 3.2 },
    }),
    createMockComparisonRestaurant({
      swiggy: { rating: 2.5 },
      zomato: { rating: 2.8 },
    }),
  ];

  it('should return all restaurants when rating is "any"', () => {
    const result = filterByRating(restaurants, 'any');
    expect(result).toHaveLength(4);
  });

  it('should filter by minimum rating 3+', () => {
    const result = filterByRating(restaurants, '3+');
    expect(result).toHaveLength(3);
  });

  it('should filter by minimum rating 3.5+', () => {
    const result = filterByRating(restaurants, '3.5+');
    expect(result).toHaveLength(3);
  });

  it('should filter by minimum rating 4+', () => {
    const result = filterByRating(restaurants, '4+');
    expect(result).toHaveLength(2);
  });

  it('should filter by minimum rating 4.5+', () => {
    const result = filterByRating(restaurants, '4.5+');
    expect(result).toHaveLength(1);
  });

  it('should use best rating from either platform', () => {
    // Restaurant with swiggy: 4.0, zomato: 3.8 should use 4.0
    const result = filterByRating(restaurants, '4+');
    expect(result.some(r => r.swiggy?.rating === 4.0)).toBe(true);
  });

  it('should include restaurants without rating', () => {
    const restaurantsWithNoRating = [
      ...restaurants,
      createMockComparisonRestaurant({
        swiggy: { rating: 0 },
        zomato: { rating: 0 },
      }),
    ];
    const result = filterByRating(restaurantsWithNoRating, '4+');
    // Restaurants without rating (0) are included
    expect(result).toHaveLength(3);
  });
});

describe('getAverageRating', () => {
  it('should calculate average rating from both platforms', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: { rating: 4.0 },
      zomato: { rating: 4.4 },
    });
    const avg = getAverageRating(restaurant);
    expect(avg).toBe(4.2);
  });

  it('should return single platform rating if only one exists', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: { rating: 4.0 },
      zomato: null,
    });
    const avg = getAverageRating(restaurant);
    expect(avg).toBe(4.0);
  });

  it('should return null if no rating info', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: { rating: 0 },
      zomato: { rating: 0 },
    });
    const avg = getAverageRating(restaurant);
    expect(avg).toBeNull();
  });
});

describe('getRatingDistribution', () => {
  it('should count restaurants by rating thresholds', () => {
    const restaurants = [
      createMockComparisonRestaurant({ swiggy: { rating: 4.8 }, zomato: null }),
      createMockComparisonRestaurant({ swiggy: { rating: 4.2 }, zomato: null }),
      createMockComparisonRestaurant({ swiggy: { rating: 3.7 }, zomato: null }),
      createMockComparisonRestaurant({ swiggy: { rating: 3.2 }, zomato: null }),
      createMockComparisonRestaurant({ swiggy: { rating: 2.5 }, zomato: null }),
    ];

    const distribution = getRatingDistribution(restaurants);
    expect(distribution['any']).toBe(5);
    expect(distribution['3+']).toBe(4);
    expect(distribution['3.5+']).toBe(3);
    expect(distribution['4+']).toBe(2);
    expect(distribution['4.5+']).toBe(1);
  });
});
