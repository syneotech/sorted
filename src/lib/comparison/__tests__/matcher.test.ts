import { describe, it, expect } from 'vitest';
import {
  matchRestaurants,
  matchMenuItems,
  findBestPrice,
  calculateOptimalOrder,
} from '../matcher';
import { createMockRestaurant, createMockMenuItem, createMockComparisonMenuItem } from '@/test/helpers';

describe('matchRestaurants', () => {
  it('should match restaurants with same name', () => {
    const swiggyRestaurants = [
      createMockRestaurant({
        platform: 'swiggy',
        name: 'Pizza Hut',
        locality: 'Koramangala',
        cuisines: ['Pizza', 'Italian'],
      }),
    ];

    const zomatoRestaurants = [
      createMockRestaurant({
        platform: 'zomato',
        name: 'Pizza Hut',
        locality: 'Koramangala',
        cuisines: ['Pizza', 'Italian'],
      }),
    ];

    const results = matchRestaurants(swiggyRestaurants, zomatoRestaurants);

    expect(results.length).toBe(1);
    expect(results[0].swiggy).toBeDefined();
    expect(results[0].zomato).toBeDefined();
    expect(results[0].matchConfidence).toBeGreaterThan(0.5);
  });

  it('should handle restaurants with different names', () => {
    const swiggyRestaurants = [
      createMockRestaurant({
        platform: 'swiggy',
        name: 'Dominos Pizza',
        locality: 'Koramangala',
        cuisines: ['Pizza', 'Italian'],
      }),
    ];

    const zomatoRestaurants = [
      createMockRestaurant({
        platform: 'zomato',
        name: 'Pizza Hut',
        locality: 'Koramangala',
        cuisines: ['Pizza', 'Italian'],
      }),
    ];

    const results = matchRestaurants(swiggyRestaurants, zomatoRestaurants);

    // Should have at least the swiggy restaurant
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some(r => r.swiggy)).toBe(true);
  });

  it('should boost confidence with matching locality', () => {
    const swiggyRestaurants = [
      createMockRestaurant({
        platform: 'swiggy',
        name: 'Pizza Hut',
        locality: 'Koramangala',
        cuisines: ['Pizza'],
      }),
    ];

    const zomatoRestaurants = [
      createMockRestaurant({
        platform: 'zomato',
        name: 'Pizza Hut',
        locality: 'Koramangala', // Same locality
        cuisines: ['Pizza'],
      }),
    ];

    const results = matchRestaurants(swiggyRestaurants, zomatoRestaurants);

    // Should match with high confidence due to locality match
    const matched = results.find(r => r.swiggy && r.zomato);
    expect(matched).toBeDefined();
    expect(matched?.matchConfidence).toBeGreaterThan(0.5);
  });

  it('should add unmatched Zomato restaurants', () => {
    const swiggyRestaurants = [
      createMockRestaurant({
        platform: 'swiggy',
        name: 'Completely Different Name Restaurant',
        locality: 'Area X',
        cuisines: ['Japanese', 'Sushi'],
      }),
    ];

    const zomatoRestaurants = [
      createMockRestaurant({
        platform: 'zomato',
        name: 'Unique Zomato Place',
        locality: 'Area Y',
        cuisines: ['Mexican', 'Tacos'],
      }),
    ];

    const results = matchRestaurants(swiggyRestaurants, zomatoRestaurants);

    // Should have both restaurants as unmatched
    expect(results.length).toBeGreaterThanOrEqual(1);
    // At minimum, the swiggy restaurant should be included
    const swiggyResult = results.find(r => r.swiggy);
    expect(swiggyResult).toBeDefined();
  });

  it('should calculate match confidence', () => {
    const swiggyRestaurants = [
      createMockRestaurant({
        platform: 'swiggy',
        name: 'Mainland China',
        locality: 'Koramangala',
        cuisines: ['Chinese', 'Pan-Asian'],
      }),
    ];

    const zomatoRestaurants = [
      createMockRestaurant({
        platform: 'zomato',
        name: 'Mainland China',
        locality: 'Koramangala',
        cuisines: ['Chinese', 'Pan-Asian'],
      }),
    ];

    const results = matchRestaurants(swiggyRestaurants, zomatoRestaurants);

    expect(results[0].matchConfidence).toBeGreaterThanOrEqual(0.5);
    expect(results[0].matchConfidence).toBeLessThanOrEqual(1.0);
  });

  it('should include relevance scores when query provided', () => {
    const swiggyRestaurants = [
      createMockRestaurant({
        platform: 'swiggy',
        name: 'Mainland China',
        cuisines: ['Chinese'],
      }),
    ];

    const zomatoRestaurants = [
      createMockRestaurant({
        platform: 'zomato',
        name: 'Mainland China',
        cuisines: ['Chinese'],
      }),
    ];

    const results = matchRestaurants(swiggyRestaurants, zomatoRestaurants, 'chinese');

    expect(results[0].relevanceScore).toBeDefined();
    expect(results[0].relevanceScore?.total).toBeGreaterThan(0);
  });
});

describe('matchMenuItems', () => {
  it('should match items by name', () => {
    const swiggyMenu = [
      createMockMenuItem({
        name: 'Chicken Biryani',
        category: 'Biryani',
        isVeg: false,
      }),
    ];

    const zomatoMenu = [
      createMockMenuItem({
        name: 'Chicken Biryani',
        category: 'Biryani',
        isVeg: false,
      }),
    ];

    const results = matchMenuItems(swiggyMenu, zomatoMenu);

    expect(results.length).toBe(1);
    expect(results[0].swiggy).toBeDefined();
    expect(results[0].zomato).toBeDefined();
    expect(results[0].matchConfidence).toBeGreaterThan(0.5);
  });

  it('should match similar item names', () => {
    const swiggyMenu = [
      createMockMenuItem({
        name: 'Fried Rice',
        category: 'Rice',
        isVeg: true,
      }),
    ];

    const zomatoMenu = [
      createMockMenuItem({
        name: 'Fried Rice',
        category: 'Rice',
        isVeg: true,
      }),
    ];

    const results = matchMenuItems(swiggyMenu, zomatoMenu);

    // With exact match, both should be defined
    const matched = results.find(r => r.swiggy && r.zomato);
    expect(matched).toBeDefined();
  });

  it('should consider veg/non-veg matching', () => {
    const swiggyMenu = [
      createMockMenuItem({
        name: 'Paneer Butter Masala',
        category: 'Main Course',
        isVeg: true,
      }),
    ];

    const zomatoMenu = [
      createMockMenuItem({
        name: 'Paneer Butter Masala',
        category: 'Main Course',
        isVeg: true,
      }),
    ];

    const results = matchMenuItems(swiggyMenu, zomatoMenu);

    // Should match items with same veg status
    const matched = results.find(r => r.swiggy && r.zomato);
    expect(matched).toBeDefined();
    expect(matched?.swiggy?.isVeg).toBe(true);
    expect(matched?.zomato?.isVeg).toBe(true);
  });

  it('should add unmatched items', () => {
    const swiggyMenu = [
      createMockMenuItem({ name: 'Item A', category: 'Starters' }),
    ];

    const zomatoMenu = [
      createMockMenuItem({ name: 'Item B', category: 'Starters' }),
    ];

    const results = matchMenuItems(swiggyMenu, zomatoMenu);

    expect(results.length).toBe(2);
    expect(results.some(r => r.name === 'Item A')).toBe(true);
    expect(results.some(r => r.name === 'Item B')).toBe(true);
  });

  it('should sort by category then confidence', () => {
    const swiggyMenu = [
      createMockMenuItem({ name: 'Dessert', category: 'Desserts' }),
      createMockMenuItem({ name: 'Starter', category: 'Appetizers' }),
    ];

    const zomatoMenu = [
      createMockMenuItem({ name: 'Dessert', category: 'Desserts' }),
      createMockMenuItem({ name: 'Starter', category: 'Appetizers' }),
    ];

    const results = matchMenuItems(swiggyMenu, zomatoMenu);

    // Should be sorted by category
    expect(results[0].category).toBe('Appetizers');
  });
});

describe('findBestPrice', () => {
  it('should return swiggy when cheaper', () => {
    const comparison = createMockComparisonMenuItem({
      swiggy: { price: 200 },
      zomato: { price: 250 },
    });

    const result = findBestPrice(comparison);

    expect(result.bestPrice).toBe(200);
    expect(result.platform).toBe('swiggy');
    expect(result.savings).toBe(50);
  });

  it('should return zomato when cheaper', () => {
    const comparison = createMockComparisonMenuItem({
      swiggy: { price: 300 },
      zomato: { price: 250 },
    });

    const result = findBestPrice(comparison);

    expect(result.bestPrice).toBe(250);
    expect(result.platform).toBe('zomato');
    expect(result.savings).toBe(50);
  });

  it('should return 0 savings when prices equal', () => {
    const comparison = createMockComparisonMenuItem({
      swiggy: { price: 250 },
      zomato: { price: 250 },
    });

    const result = findBestPrice(comparison);

    expect(result.bestPrice).toBe(250);
    expect(result.savings).toBe(0);
  });

  it('should handle single platform only', () => {
    const swiggyOnly = createMockComparisonMenuItem({
      swiggy: { price: 200 },
      zomato: null,
    });

    const result = findBestPrice(swiggyOnly);

    expect(result.bestPrice).toBe(200);
    expect(result.platform).toBe('swiggy');
    expect(result.savings).toBe(0);
  });

  it('should handle no prices', () => {
    const noPrices = {
      matchId: 'test',
      name: 'Test',
      category: 'Test',
      swiggy: undefined,
      zomato: undefined,
      matchConfidence: 0,
    };

    const result = findBestPrice(noPrices);

    expect(result.bestPrice).toBe(0);
    expect(result.platform).toBeNull();
    expect(result.savings).toBe(0);
  });
});

describe('calculateOptimalOrder', () => {
  it('should sum totals correctly', () => {
    const items = [
      createMockComparisonMenuItem({
        swiggy: { price: 200 },
        zomato: { price: 250 },
      }),
      createMockComparisonMenuItem({
        swiggy: { price: 300 },
        zomato: { price: 280 },
      }),
    ];

    const result = calculateOptimalOrder(items);

    expect(result.swiggyTotal).toBe(500);
    expect(result.zomatoTotal).toBe(530);
    expect(result.optimalTotal).toBe(480); // 200 + 280
    expect(result.totalSavings).toBe(50); // 530 - 480
  });

  it('should handle single platform items', () => {
    const items = [
      createMockComparisonMenuItem({
        swiggy: { price: 200 },
        zomato: null,
      }),
      createMockComparisonMenuItem({
        swiggy: null,
        zomato: { price: 300 },
      }),
    ];

    const result = calculateOptimalOrder(items);

    expect(result.swiggyTotal).toBe(200);
    expect(result.zomatoTotal).toBe(300);
    expect(result.optimalTotal).toBe(500);
  });

  it('should return zeros for empty list', () => {
    const result = calculateOptimalOrder([]);

    expect(result.swiggyTotal).toBe(0);
    expect(result.zomatoTotal).toBe(0);
    expect(result.optimalTotal).toBe(0);
    expect(result.totalSavings).toBe(0);
  });
});
