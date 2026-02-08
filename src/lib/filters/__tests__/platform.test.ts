import { describe, it, expect } from 'vitest';
import { filterByPlatform, getPlatformDistribution, isMatched, getPlatformLabel } from '../platform';
import { createMockComparisonRestaurant } from '@/test/helpers';

describe('filterByPlatform', () => {
  const restaurants = [
    createMockComparisonRestaurant({
      swiggy: { name: 'Both Platforms 1' },
      zomato: { name: 'Both Platforms 1' },
    }),
    createMockComparisonRestaurant({
      swiggy: { name: 'Both Platforms 2' },
      zomato: { name: 'Both Platforms 2' },
    }),
    createMockComparisonRestaurant({
      swiggy: { name: 'Swiggy Only' },
      zomato: null,
    }),
    createMockComparisonRestaurant({
      swiggy: null,
      zomato: { name: 'Zomato Only' },
    }),
  ];

  it('should return all restaurants when platform is "all"', () => {
    const result = filterByPlatform(restaurants, 'all');
    expect(result).toHaveLength(4);
  });

  it('should filter matched restaurants only', () => {
    const result = filterByPlatform(restaurants, 'matched');
    expect(result).toHaveLength(2);
    result.forEach(r => {
      expect(r.swiggy).toBeDefined();
      expect(r.zomato).toBeDefined();
    });
  });

  it('should filter Swiggy restaurants', () => {
    const result = filterByPlatform(restaurants, 'swiggy');
    expect(result).toHaveLength(3);
    result.forEach(r => {
      expect(r.swiggy).toBeDefined();
    });
  });

  it('should filter Zomato restaurants', () => {
    const result = filterByPlatform(restaurants, 'zomato');
    expect(result).toHaveLength(3);
    result.forEach(r => {
      expect(r.zomato).toBeDefined();
    });
  });
});

describe('getPlatformDistribution', () => {
  it('should count restaurants by platform availability', () => {
    const restaurants = [
      createMockComparisonRestaurant({ swiggy: {}, zomato: {} }),
      createMockComparisonRestaurant({ swiggy: {}, zomato: {} }),
      createMockComparisonRestaurant({ swiggy: {}, zomato: null }),
      createMockComparisonRestaurant({ swiggy: null, zomato: {} }),
    ];

    const distribution = getPlatformDistribution(restaurants);
    expect(distribution.all).toBe(4);
    expect(distribution.matched).toBe(2);
    expect(distribution.swiggy).toBe(3); // matched + swiggy-only
    expect(distribution.zomato).toBe(3); // matched + zomato-only
  });
});

describe('isMatched', () => {
  it('should return true for restaurants on both platforms', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: {},
      zomato: {},
    });
    expect(isMatched(restaurant)).toBe(true);
  });

  it('should return false for Swiggy-only restaurants', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: {},
      zomato: null,
    });
    expect(isMatched(restaurant)).toBe(false);
  });

  it('should return false for Zomato-only restaurants', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: null,
      zomato: {},
    });
    expect(isMatched(restaurant)).toBe(false);
  });
});

describe('getPlatformLabel', () => {
  it('should return "Both" for matched restaurants', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: {},
      zomato: {},
    });
    expect(getPlatformLabel(restaurant)).toBe('Both');
  });

  it('should return "Swiggy only" for Swiggy-only restaurants', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: {},
      zomato: null,
    });
    expect(getPlatformLabel(restaurant)).toBe('Swiggy only');
  });

  it('should return "Zomato only" for Zomato-only restaurants', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: null,
      zomato: {},
    });
    expect(getPlatformLabel(restaurant)).toBe('Zomato only');
  });

  it('should return "Unknown" for restaurants with no platform data', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: null,
      zomato: null,
    });
    expect(getPlatformLabel(restaurant)).toBe('Unknown');
  });
});
