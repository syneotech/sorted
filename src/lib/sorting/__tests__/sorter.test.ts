import { describe, it, expect } from 'vitest';
import { sortRestaurants } from '../sorter';
import { createMockComparisonRestaurant } from '@/test/helpers';

describe('sortRestaurants', () => {
  describe('sortByRelevance', () => {
    it('should sort by relevance score descending', () => {
      const restaurants = [
        createMockComparisonRestaurant({
          swiggy: { name: 'Low Relevance' },
          relevanceScore: { total: 30, breakdown: {} },
        }),
        createMockComparisonRestaurant({
          swiggy: { name: 'High Relevance' },
          relevanceScore: { total: 80, breakdown: {} },
        }),
        createMockComparisonRestaurant({
          swiggy: { name: 'Medium Relevance' },
          relevanceScore: { total: 50, breakdown: {} },
        }),
      ];

      const sorted = sortRestaurants(restaurants, 'relevance');
      expect(sorted[0].name).toBe('High Relevance');
      expect(sorted[1].name).toBe('Medium Relevance');
      expect(sorted[2].name).toBe('Low Relevance');
    });

    it('should handle missing relevance scores', () => {
      const restaurants = [
        createMockComparisonRestaurant({
          swiggy: { name: 'No Score' },
        }),
        createMockComparisonRestaurant({
          swiggy: { name: 'Has Score' },
          relevanceScore: { total: 50, breakdown: {} },
        }),
      ];

      const sorted = sortRestaurants(restaurants, 'relevance');
      expect(sorted[0].name).toBe('Has Score');
      expect(sorted[1].name).toBe('No Score');
    });
  });

  describe('sortByPrice', () => {
    it('should sort by price ascending (low to high)', () => {
      const restaurants = [
        createMockComparisonRestaurant({
          swiggy: { name: 'Expensive', costForTwoValue: 800 },
          zomato: { name: 'Expensive', costForTwoValue: 850 },
        }),
        createMockComparisonRestaurant({
          swiggy: { name: 'Cheap', costForTwoValue: 200 },
          zomato: { name: 'Cheap', costForTwoValue: 250 },
        }),
        createMockComparisonRestaurant({
          swiggy: { name: 'Medium', costForTwoValue: 400 },
          zomato: { name: 'Medium', costForTwoValue: 450 },
        }),
      ];

      const sorted = sortRestaurants(restaurants, 'price-low');
      expect(sorted[0].name).toBe('Cheap');
      expect(sorted[1].name).toBe('Medium');
      expect(sorted[2].name).toBe('Expensive');
    });

    it('should sort by price descending (high to low)', () => {
      const restaurants = [
        createMockComparisonRestaurant({
          swiggy: { name: 'Cheap', costForTwoValue: 200 },
          zomato: { name: 'Cheap', costForTwoValue: 250 },
        }),
        createMockComparisonRestaurant({
          swiggy: { name: 'Expensive', costForTwoValue: 800 },
          zomato: { name: 'Expensive', costForTwoValue: 850 },
        }),
      ];

      const sorted = sortRestaurants(restaurants, 'price-high');
      expect(sorted[0].name).toBe('Expensive');
      expect(sorted[1].name).toBe('Cheap');
    });

    it('should use lowest price from either platform', () => {
      const restaurants = [
        createMockComparisonRestaurant({
          swiggy: { name: 'Lower on Zomato', costForTwoValue: 500 },
          zomato: { name: 'Lower on Zomato', costForTwoValue: 300 },
        }),
        createMockComparisonRestaurant({
          swiggy: { name: 'Lower on Swiggy', costForTwoValue: 200 },
          zomato: { name: 'Lower on Swiggy', costForTwoValue: 400 },
        }),
      ];

      const sorted = sortRestaurants(restaurants, 'price-low');
      // Lower on Swiggy has lowest price of 200
      expect(sorted[0].name).toBe('Lower on Swiggy');
    });

    it('should push restaurants without price to end', () => {
      const restaurants = [
        createMockComparisonRestaurant({
          swiggy: { name: 'Has Price', costForTwoValue: 500 },
          zomato: null,
        }),
        createMockComparisonRestaurant({
          swiggy: { name: 'No Price', costForTwoValue: 0 },
          zomato: { name: 'No Price', costForTwoValue: 0 },
        }),
      ];

      const sorted = sortRestaurants(restaurants, 'price-low');
      expect(sorted[0].name).toBe('Has Price');
      expect(sorted[1].name).toBe('No Price');
    });
  });

  describe('sortByRating', () => {
    it('should sort by rating descending (highest first)', () => {
      const restaurants = [
        createMockComparisonRestaurant({
          swiggy: { name: 'Low Rated', rating: 3.0 },
          zomato: { name: 'Low Rated', rating: 3.2 },
        }),
        createMockComparisonRestaurant({
          swiggy: { name: 'High Rated', rating: 4.8 },
          zomato: { name: 'High Rated', rating: 4.5 },
        }),
        createMockComparisonRestaurant({
          swiggy: { name: 'Medium Rated', rating: 4.0 },
          zomato: { name: 'Medium Rated', rating: 4.2 },
        }),
      ];

      const sorted = sortRestaurants(restaurants, 'rating');
      expect(sorted[0].name).toBe('High Rated');
      expect(sorted[1].name).toBe('Medium Rated');
      expect(sorted[2].name).toBe('Low Rated');
    });

    it('should use best rating from either platform', () => {
      const restaurants = [
        createMockComparisonRestaurant({
          swiggy: { name: 'Better on Zomato', rating: 3.5 },
          zomato: { name: 'Better on Zomato', rating: 4.5 },
        }),
        createMockComparisonRestaurant({
          swiggy: { name: 'Better on Swiggy', rating: 4.8 },
          zomato: { name: 'Better on Swiggy', rating: 4.0 },
        }),
      ];

      const sorted = sortRestaurants(restaurants, 'rating');
      // Better on Swiggy has best rating of 4.8
      expect(sorted[0].name).toBe('Better on Swiggy');
    });

    it('should push restaurants without rating to end', () => {
      const restaurants = [
        createMockComparisonRestaurant({
          swiggy: { name: 'Has Rating', rating: 4.0 },
          zomato: null,
        }),
        createMockComparisonRestaurant({
          swiggy: { name: 'No Rating', rating: 0 },
          zomato: { name: 'No Rating', rating: 0 },
        }),
      ];

      const sorted = sortRestaurants(restaurants, 'rating');
      expect(sorted[0].name).toBe('Has Rating');
      expect(sorted[1].name).toBe('No Rating');
    });
  });

  describe('sortByDeliveryTime', () => {
    it('should sort by delivery time ascending (fastest first)', () => {
      const restaurants = [
        createMockComparisonRestaurant({
          swiggy: { name: 'Slow', deliveryTime: 60 },
          zomato: { name: 'Slow', deliveryTime: 55 },
        }),
        createMockComparisonRestaurant({
          swiggy: { name: 'Fast', deliveryTime: 20 },
          zomato: { name: 'Fast', deliveryTime: 25 },
        }),
        createMockComparisonRestaurant({
          swiggy: { name: 'Medium', deliveryTime: 35 },
          zomato: { name: 'Medium', deliveryTime: 40 },
        }),
      ];

      const sorted = sortRestaurants(restaurants, 'delivery-time');
      expect(sorted[0].name).toBe('Fast');
      expect(sorted[1].name).toBe('Medium');
      expect(sorted[2].name).toBe('Slow');
    });

    it('should use fastest time from either platform', () => {
      const restaurants = [
        createMockComparisonRestaurant({
          swiggy: { name: 'Faster on Zomato', deliveryTime: 40 },
          zomato: { name: 'Faster on Zomato', deliveryTime: 25 },
        }),
        createMockComparisonRestaurant({
          swiggy: { name: 'Faster on Swiggy', deliveryTime: 20 },
          zomato: { name: 'Faster on Swiggy', deliveryTime: 35 },
        }),
      ];

      const sorted = sortRestaurants(restaurants, 'delivery-time');
      // Faster on Swiggy has fastest time of 20
      expect(sorted[0].name).toBe('Faster on Swiggy');
    });

    it('should push restaurants without delivery time to end', () => {
      const restaurants = [
        createMockComparisonRestaurant({
          swiggy: { name: 'Has Time', deliveryTime: 30 },
          zomato: null,
        }),
        createMockComparisonRestaurant({
          swiggy: { name: 'No Time', deliveryTime: 0 },
          zomato: { name: 'No Time', deliveryTime: 0 },
        }),
      ];

      const sorted = sortRestaurants(restaurants, 'delivery-time');
      expect(sorted[0].name).toBe('Has Time');
      expect(sorted[1].name).toBe('No Time');
    });
  });

  describe('sortBySavings', () => {
    it('should sort by savings amount descending (biggest savings first)', () => {
      const r1 = createMockComparisonRestaurant({
        swiggy: { name: 'Small Savings', costForTwoValue: 400 },
        zomato: { name: 'Small Savings', costForTwoValue: 420 },
      });
      r1.priceDifference = { swiggy: 400, zomato: 420, savings: 20, cheaperPlatform: 'swiggy' };

      const r2 = createMockComparisonRestaurant({
        swiggy: { name: 'Big Savings', costForTwoValue: 500 },
        zomato: { name: 'Big Savings', costForTwoValue: 650 },
      });
      r2.priceDifference = { swiggy: 500, zomato: 650, savings: 150, cheaperPlatform: 'swiggy' };

      const r3 = createMockComparisonRestaurant({
        swiggy: { name: 'Medium Savings', costForTwoValue: 300 },
        zomato: { name: 'Medium Savings', costForTwoValue: 380 },
      });
      r3.priceDifference = { swiggy: 300, zomato: 380, savings: 80, cheaperPlatform: 'swiggy' };

      const sorted = sortRestaurants([r1, r2, r3], 'savings');
      expect(sorted[0].name).toBe('Big Savings');
      expect(sorted[1].name).toBe('Medium Savings');
      expect(sorted[2].name).toBe('Small Savings');
    });

    it('should push unmatched restaurants to end', () => {
      const matched = createMockComparisonRestaurant({
        swiggy: { name: 'Matched' },
        zomato: { name: 'Matched' },
      });
      matched.priceDifference = { swiggy: 400, zomato: 450, savings: 50, cheaperPlatform: 'swiggy' };

      const unmatched = createMockComparisonRestaurant({
        swiggy: { name: 'Unmatched' },
        zomato: null,
      });

      const sorted = sortRestaurants([unmatched, matched], 'savings');
      expect(sorted[0].name).toBe('Matched');
      expect(sorted[1].name).toBe('Unmatched');
    });

    it('should handle same savings (no savings)', () => {
      const r1 = createMockComparisonRestaurant({
        swiggy: { name: 'Same Price', costForTwoValue: 400 },
        zomato: { name: 'Same Price', costForTwoValue: 400 },
      });
      r1.priceDifference = { swiggy: 400, zomato: 400, savings: 0, cheaperPlatform: 'same' };

      const r2 = createMockComparisonRestaurant({
        swiggy: { name: 'Some Savings', costForTwoValue: 300 },
        zomato: { name: 'Some Savings', costForTwoValue: 350 },
      });
      r2.priceDifference = { swiggy: 300, zomato: 350, savings: 50, cheaperPlatform: 'swiggy' };

      const sorted = sortRestaurants([r1, r2], 'savings');
      expect(sorted[0].name).toBe('Some Savings');
      expect(sorted[1].name).toBe('Same Price');
    });
  });

  describe('default case', () => {
    it('should return array unchanged for unknown sort option', () => {
      const restaurants = [
        createMockComparisonRestaurant({ swiggy: { name: 'First' } }),
        createMockComparisonRestaurant({ swiggy: { name: 'Second' } }),
      ];

      const sorted = sortRestaurants(restaurants, 'unknown' as never);
      expect(sorted[0].name).toBe('First');
      expect(sorted[1].name).toBe('Second');
    });
  });

  describe('immutability', () => {
    it('should not mutate the original array', () => {
      const restaurants = [
        createMockComparisonRestaurant({
          swiggy: { name: 'Second', rating: 3.0 },
          zomato: null,
        }),
        createMockComparisonRestaurant({
          swiggy: { name: 'First', rating: 4.5 },
          zomato: null,
        }),
      ];

      const originalFirst = restaurants[0].name;
      sortRestaurants(restaurants, 'rating');
      expect(restaurants[0].name).toBe(originalFirst);
    });
  });
});
