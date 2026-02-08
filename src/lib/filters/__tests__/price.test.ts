import { describe, it, expect } from 'vitest';
import { filterByPrice, getPriceRangeLabel, getPriceRangeCategory, getPriceDistribution } from '../price';
import { createMockComparisonRestaurant } from '@/test/helpers';

describe('filterByPrice', () => {
  const restaurants = [
    createMockComparisonRestaurant({
      swiggy: { costForTwoValue: 200 },
      zomato: { costForTwoValue: 250 },
    }),
    createMockComparisonRestaurant({
      swiggy: { costForTwoValue: 400 },
      zomato: { costForTwoValue: 450 },
    }),
    createMockComparisonRestaurant({
      swiggy: { costForTwoValue: 800 },
      zomato: { costForTwoValue: 750 },
    }),
    createMockComparisonRestaurant({
      swiggy: { costForTwoValue: 1200 },
      zomato: null,
    }),
  ];

  it('should return all restaurants when no price range selected', () => {
    const result = filterByPrice(restaurants, []);
    expect(result).toHaveLength(4);
  });

  it('should filter budget restaurants (< ₹300)', () => {
    const result = filterByPrice(restaurants, ['budget']);
    expect(result).toHaveLength(1);
    expect(result[0].swiggy?.costForTwoValue).toBe(200);
  });

  it('should filter moderate restaurants (₹300-600)', () => {
    const result = filterByPrice(restaurants, ['moderate']);
    expect(result).toHaveLength(1);
    expect(result[0].swiggy?.costForTwoValue).toBe(400);
  });

  it('should filter premium restaurants (> ₹600)', () => {
    const result = filterByPrice(restaurants, ['premium']);
    expect(result).toHaveLength(2);
  });

  it('should handle multiple price ranges (OR logic)', () => {
    const result = filterByPrice(restaurants, ['budget', 'premium']);
    expect(result).toHaveLength(3);
  });

  it('should use lowest price from either platform', () => {
    // Restaurant with swiggy: 800, zomato: 750 should use 750 (premium)
    const result = filterByPrice(restaurants, ['premium']);
    expect(result.some(r => r.zomato?.costForTwoValue === 750)).toBe(true);
  });
});

describe('getPriceRangeLabel', () => {
  it('should return ₹ for budget', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: { costForTwoValue: 200 },
      zomato: { costForTwoValue: 250 },
    });
    expect(getPriceRangeLabel(restaurant)).toBe('₹');
  });

  it('should return ₹₹ for moderate', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: { costForTwoValue: 400 },
      zomato: { costForTwoValue: 500 },
    });
    expect(getPriceRangeLabel(restaurant)).toBe('₹₹');
  });

  it('should return ₹₹₹ for premium', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: { costForTwoValue: 800 },
      zomato: { costForTwoValue: 900 },
    });
    expect(getPriceRangeLabel(restaurant)).toBe('₹₹₹');
  });

  it('should return - when no price info', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: { costForTwoValue: 0 },
      zomato: { costForTwoValue: 0 },
    });
    // When costForTwoValue is 0, treated as no price info
    expect(getPriceRangeLabel(restaurant)).toBe('-');
  });
});

describe('getPriceRangeCategory', () => {
  it('should return budget for < ₹300', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: { costForTwoValue: 200 },
      zomato: null,
    });
    expect(getPriceRangeCategory(restaurant)).toBe('budget');
  });

  it('should return moderate for ₹300-600', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: { costForTwoValue: 450 },
      zomato: null,
    });
    expect(getPriceRangeCategory(restaurant)).toBe('moderate');
  });

  it('should return premium for > ₹600', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: { costForTwoValue: 800 },
      zomato: null,
    });
    expect(getPriceRangeCategory(restaurant)).toBe('premium');
  });
});

describe('getPriceDistribution', () => {
  it('should count restaurants in each price range', () => {
    const restaurants = [
      createMockComparisonRestaurant({ swiggy: { costForTwoValue: 200 }, zomato: null }),
      createMockComparisonRestaurant({ swiggy: { costForTwoValue: 250 }, zomato: null }),
      createMockComparisonRestaurant({ swiggy: { costForTwoValue: 400 }, zomato: null }),
      createMockComparisonRestaurant({ swiggy: { costForTwoValue: 800 }, zomato: null }),
    ];

    const distribution = getPriceDistribution(restaurants);
    expect(distribution.budget).toBe(2);
    expect(distribution.moderate).toBe(1);
    expect(distribution.premium).toBe(1);
  });
});
