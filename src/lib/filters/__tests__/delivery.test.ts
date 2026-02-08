import { describe, it, expect } from 'vitest';
import { filterByDeliveryTime, getAverageDeliveryTime, getDeliveryTimeDistribution, formatDeliveryTime } from '../delivery';
import { createMockComparisonRestaurant } from '@/test/helpers';

describe('filterByDeliveryTime', () => {
  const restaurants = [
    createMockComparisonRestaurant({
      swiggy: { deliveryTime: 20 },
      zomato: { deliveryTime: 25 },
    }),
    createMockComparisonRestaurant({
      swiggy: { deliveryTime: 35 },
      zomato: { deliveryTime: 40 },
    }),
    createMockComparisonRestaurant({
      swiggy: { deliveryTime: 50 },
      zomato: { deliveryTime: 55 },
    }),
    createMockComparisonRestaurant({
      swiggy: { deliveryTime: 70 },
      zomato: { deliveryTime: 65 },
    }),
  ];

  it('should return all restaurants when delivery time is "any"', () => {
    const result = filterByDeliveryTime(restaurants, 'any');
    expect(result).toHaveLength(4);
  });

  it('should filter by max 30 minutes', () => {
    const result = filterByDeliveryTime(restaurants, '30');
    expect(result).toHaveLength(1);
    expect(result[0].swiggy?.deliveryTime).toBe(20);
  });

  it('should filter by max 45 minutes', () => {
    const result = filterByDeliveryTime(restaurants, '45');
    expect(result).toHaveLength(2);
  });

  it('should filter by max 60 minutes', () => {
    const result = filterByDeliveryTime(restaurants, '60');
    expect(result).toHaveLength(3);
  });

  it('should use fastest time from either platform', () => {
    // Restaurant with swiggy: 70, zomato: 65 should use 65
    const result = filterByDeliveryTime(restaurants, '60');
    expect(result).toHaveLength(3);
    // The one with 65/70 should not be included (fastest is 65 > 60)
    expect(result.every(r =>
      Math.min(r.swiggy?.deliveryTime || Infinity, r.zomato?.deliveryTime || Infinity) <= 60
    )).toBe(true);
  });

  it('should include restaurants without delivery time info', () => {
    const restaurantsWithNoTime = [
      ...restaurants,
      createMockComparisonRestaurant({
        swiggy: { deliveryTime: 0 },
        zomato: { deliveryTime: 0 },
      }),
    ];
    const result = filterByDeliveryTime(restaurantsWithNoTime, '30');
    // Restaurants without delivery time are included
    expect(result).toHaveLength(2);
  });
});

describe('getAverageDeliveryTime', () => {
  it('should calculate average delivery time from both platforms', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: { deliveryTime: 30 },
      zomato: { deliveryTime: 40 },
    });
    const avg = getAverageDeliveryTime(restaurant);
    expect(avg).toBe(35);
  });

  it('should return single platform time if only one exists', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: { deliveryTime: 30 },
      zomato: null,
    });
    const avg = getAverageDeliveryTime(restaurant);
    expect(avg).toBe(30);
  });

  it('should return null if no delivery time info', () => {
    const restaurant = createMockComparisonRestaurant({
      swiggy: { deliveryTime: 0 },
      zomato: { deliveryTime: 0 },
    });
    const avg = getAverageDeliveryTime(restaurant);
    expect(avg).toBeNull();
  });
});

describe('getDeliveryTimeDistribution', () => {
  it('should count restaurants by delivery time thresholds', () => {
    const restaurants = [
      createMockComparisonRestaurant({ swiggy: { deliveryTime: 20 }, zomato: null }),
      createMockComparisonRestaurant({ swiggy: { deliveryTime: 35 }, zomato: null }),
      createMockComparisonRestaurant({ swiggy: { deliveryTime: 50 }, zomato: null }),
      createMockComparisonRestaurant({ swiggy: { deliveryTime: 70 }, zomato: null }),
    ];

    const distribution = getDeliveryTimeDistribution(restaurants);
    expect(distribution['any']).toBe(4);
    expect(distribution['30']).toBe(1);
    expect(distribution['45']).toBe(2);
    expect(distribution['60']).toBe(3);
  });
});

describe('formatDeliveryTime', () => {
  it('should format minutes under 60', () => {
    expect(formatDeliveryTime(30)).toBe('30 min');
    expect(formatDeliveryTime(45)).toBe('45 min');
  });

  it('should format exact hours', () => {
    expect(formatDeliveryTime(60)).toBe('1 hr');
    expect(formatDeliveryTime(120)).toBe('2 hr');
  });

  it('should format hours with minutes', () => {
    expect(formatDeliveryTime(75)).toBe('1 hr 15 min');
    expect(formatDeliveryTime(90)).toBe('1 hr 30 min');
  });
});
