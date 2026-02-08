import { describe, it, expect } from 'vitest';
import {
  processSearchResults,
  parseFiltersFromQuery,
  parseSortFromQuery,
  buildFilterQueryString,
} from '../engine';
import { createMockComparisonRestaurant } from '@/test/helpers';
import type { FilterState } from '../types';

describe('processSearchResults', () => {
  const restaurants = [
    createMockComparisonRestaurant({
      swiggy: {
        name: 'Chinese Restaurant',
        cuisines: ['Chinese', 'North Indian'],
        rating: 4.5,
        costForTwoValue: 400,
        deliveryTime: 30,
      },
      zomato: {
        name: 'Chinese Restaurant',
        cuisines: ['Chinese'],
        rating: 4.3,
        costForTwoValue: 450,
        deliveryTime: 35,
      },
      relevanceScore: { total: 80, breakdown: {} },
    }),
    createMockComparisonRestaurant({
      swiggy: {
        name: 'South Indian Meals',
        cuisines: ['South Indian', 'Vegetarian'],
        rating: 4.0,
        costForTwoValue: 250,
        deliveryTime: 25,
      },
      zomato: {
        name: 'South Indian Meals',
        cuisines: ['South Indian'],
        rating: 4.2,
        costForTwoValue: 280,
        deliveryTime: 28,
      },
      relevanceScore: { total: 60, breakdown: {} },
    }),
    createMockComparisonRestaurant({
      swiggy: {
        name: 'Premium Dining',
        cuisines: ['Italian', 'Continental'],
        rating: 4.8,
        costForTwoValue: 800,
        deliveryTime: 45,
      },
      zomato: null,
      relevanceScore: { total: 40, breakdown: {} },
    }),
  ];

  it('should apply cuisine filter', () => {
    const result = processSearchResults(restaurants, {
      filters: { cuisines: ['Chinese'] },
      sortBy: 'relevance',
    });
    expect(result.filteredCount).toBe(1);
    expect(result.restaurants[0].name).toBe('Chinese Restaurant');
    expect(result.appliedFilters).toContain('Cuisines: Chinese');
  });

  it('should apply price filter', () => {
    const result = processSearchResults(restaurants, {
      filters: { priceRange: ['budget'] },
      sortBy: 'relevance',
    });
    expect(result.filteredCount).toBe(1);
    expect(result.restaurants[0].name).toBe('South Indian Meals');
  });

  it('should apply rating filter', () => {
    const result = processSearchResults(restaurants, {
      filters: { minRating: '4.5+' },
      sortBy: 'relevance',
    });
    // Chinese Restaurant has 4.5, Premium Dining has 4.8
    expect(result.filteredCount).toBe(2);
  });

  it('should apply platform filter', () => {
    const result = processSearchResults(restaurants, {
      filters: { platform: 'matched' },
      sortBy: 'relevance',
    });
    expect(result.filteredCount).toBe(2);
    result.restaurants.forEach(r => {
      expect(r.swiggy).toBeDefined();
      expect(r.zomato).toBeDefined();
    });
  });

  it('should apply multiple filters', () => {
    const result = processSearchResults(restaurants, {
      filters: {
        cuisines: ['Chinese', 'South Indian'],
        minRating: '4+',
      },
      sortBy: 'relevance',
    });
    expect(result.filteredCount).toBe(2);
  });

  it('should sort by price ascending', () => {
    const result = processSearchResults(restaurants, {
      filters: {},
      sortBy: 'price-low',
    });
    expect(result.restaurants[0].name).toBe('South Indian Meals');
    expect(result.restaurants[2].name).toBe('Premium Dining');
  });

  it('should include total count', () => {
    const result = processSearchResults(restaurants, {
      filters: { cuisines: ['Chinese'] },
      sortBy: 'relevance',
    });
    expect(result.totalCount).toBe(3);
    expect(result.filteredCount).toBe(1);
  });
});

describe('parseFiltersFromQuery', () => {
  it('should parse cuisines from query string', () => {
    const params = new URLSearchParams('cuisines=Chinese,Italian');
    const filters = parseFiltersFromQuery(params);
    expect(filters.cuisines).toEqual(['Chinese', 'Italian']);
  });

  it('should parse dietary from query string', () => {
    const params = new URLSearchParams('dietary=veg');
    const filters = parseFiltersFromQuery(params);
    expect(filters.dietary).toBe('veg');
  });

  it('should parse price range from query string', () => {
    const params = new URLSearchParams('price=budget,moderate');
    const filters = parseFiltersFromQuery(params);
    expect(filters.priceRange).toEqual(['budget', 'moderate']);
  });

  it('should parse rating from query string', () => {
    // URL encodes + as %2B, so we need to use that or set directly
    const params = new URLSearchParams();
    params.set('rating', '4+');
    const filters = parseFiltersFromQuery(params);
    expect(filters.minRating).toBe('4+');
  });

  it('should parse delivery time from query string', () => {
    const params = new URLSearchParams('delivery=30');
    const filters = parseFiltersFromQuery(params);
    expect(filters.maxDeliveryTime).toBe('30');
  });

  it('should parse platform from query string', () => {
    const params = new URLSearchParams('platform=matched');
    const filters = parseFiltersFromQuery(params);
    expect(filters.platform).toBe('matched');
  });

  it('should ignore invalid values', () => {
    const params = new URLSearchParams('dietary=invalid&rating=invalid');
    const filters = parseFiltersFromQuery(params);
    expect(filters.dietary).toBeUndefined();
    expect(filters.minRating).toBeUndefined();
  });
});

describe('parseSortFromQuery', () => {
  it('should parse valid sort options', () => {
    expect(parseSortFromQuery(new URLSearchParams('sort=price-low'))).toBe('price-low');
    expect(parseSortFromQuery(new URLSearchParams('sort=price-high'))).toBe('price-high');
    expect(parseSortFromQuery(new URLSearchParams('sort=rating'))).toBe('rating');
    expect(parseSortFromQuery(new URLSearchParams('sort=delivery-time'))).toBe('delivery-time');
    expect(parseSortFromQuery(new URLSearchParams('sort=savings'))).toBe('savings');
  });

  it('should default to relevance for invalid sort', () => {
    expect(parseSortFromQuery(new URLSearchParams('sort=invalid'))).toBe('relevance');
    expect(parseSortFromQuery(new URLSearchParams(''))).toBe('relevance');
  });
});

describe('buildFilterQueryString', () => {
  it('should build query string from filters', () => {
    const filters: Partial<FilterState> = {
      cuisines: ['Chinese', 'Italian'],
      dietary: 'veg',
      priceRange: ['budget'],
      minRating: '4+',
      maxDeliveryTime: '30',
      platform: 'matched',
    };
    const queryString = buildFilterQueryString(filters, 'price-low');

    expect(queryString).toContain('cuisines=Chinese%2CItalian');
    expect(queryString).toContain('dietary=veg');
    expect(queryString).toContain('price=budget');
    expect(queryString).toContain('rating=4%2B');
    expect(queryString).toContain('delivery=30');
    expect(queryString).toContain('platform=matched');
    expect(queryString).toContain('sort=price-low');
  });

  it('should omit default values', () => {
    const filters: Partial<FilterState> = {
      dietary: 'all',
      minRating: 'any',
      maxDeliveryTime: 'any',
      platform: 'all',
    };
    const queryString = buildFilterQueryString(filters, 'relevance');
    expect(queryString).toBe('');
  });

  it('should omit empty cuisines', () => {
    const filters: Partial<FilterState> = {
      cuisines: [],
    };
    const queryString = buildFilterQueryString(filters, 'relevance');
    expect(queryString).not.toContain('cuisines');
  });
});
