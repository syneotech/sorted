import { describe, it, expect } from 'vitest';
import { filterByCuisine, getUniqueCuisines, POPULAR_CUISINES } from '../cuisine';
import { createMockComparisonRestaurant } from '@/test/helpers';

describe('filterByCuisine', () => {
  const restaurants = [
    createMockComparisonRestaurant({
      swiggy: { cuisines: ['Chinese', 'North Indian'] },
      zomato: { cuisines: ['Chinese'] },
    }),
    createMockComparisonRestaurant({
      swiggy: { cuisines: ['South Indian', 'Biryani'] },
      zomato: { cuisines: ['South Indian'] },
    }),
    createMockComparisonRestaurant({
      swiggy: { cuisines: ['Italian', 'Pizza'] },
      zomato: { cuisines: ['Italian', 'Continental'] },
    }),
  ];

  it('should return all restaurants when no cuisines selected', () => {
    const result = filterByCuisine(restaurants, []);
    expect(result).toHaveLength(3);
  });

  it('should filter by single cuisine', () => {
    const result = filterByCuisine(restaurants, ['Chinese']);
    expect(result).toHaveLength(1);
    expect(result[0].swiggy?.cuisines).toContain('Chinese');
  });

  it('should filter by multiple cuisines (OR logic)', () => {
    const result = filterByCuisine(restaurants, ['Chinese', 'Italian']);
    expect(result).toHaveLength(2);
  });

  it('should be case insensitive', () => {
    const result = filterByCuisine(restaurants, ['chinese']);
    expect(result).toHaveLength(1);

    const result2 = filterByCuisine(restaurants, ['CHINESE']);
    expect(result2).toHaveLength(1);
  });

  it('should match cuisines from either platform', () => {
    // Continental only exists in zomato data
    const result = filterByCuisine(restaurants, ['Continental']);
    expect(result).toHaveLength(1);
    expect(result[0].zomato?.cuisines).toContain('Continental');
  });

  it('should return empty array when no match', () => {
    const result = filterByCuisine(restaurants, ['Thai']);
    expect(result).toHaveLength(0);
  });
});

describe('getUniqueCuisines', () => {
  const restaurants = [
    createMockComparisonRestaurant({
      swiggy: { cuisines: ['Chinese', 'North Indian'] },
      zomato: { cuisines: ['Chinese'] },
    }),
    createMockComparisonRestaurant({
      swiggy: { cuisines: ['Chinese', 'Fast Food'] },
      zomato: { cuisines: ['Chinese', 'Cafe'] },
    }),
    createMockComparisonRestaurant({
      swiggy: { cuisines: ['Italian'] },
      zomato: null,
    }),
  ];

  it('should return unique cuisines sorted by frequency', () => {
    const cuisines = getUniqueCuisines(restaurants);
    // Chinese appears most (in 2 restaurants, both platforms), should be first
    expect(cuisines[0]).toBe('Chinese');
    expect(cuisines).toContain('North Indian');
    expect(cuisines).toContain('Italian');
  });

  it('should not have duplicates', () => {
    const cuisines = getUniqueCuisines(restaurants);
    const uniqueCuisines = [...new Set(cuisines)];
    expect(cuisines).toHaveLength(uniqueCuisines.length);
  });
});

describe('POPULAR_CUISINES', () => {
  it('should contain common cuisines', () => {
    expect(POPULAR_CUISINES).toContain('Chinese');
    expect(POPULAR_CUISINES).toContain('North Indian');
    expect(POPULAR_CUISINES).toContain('South Indian');
    expect(POPULAR_CUISINES).toContain('Pizza');
    expect(POPULAR_CUISINES).toContain('Biryani');
  });
});
