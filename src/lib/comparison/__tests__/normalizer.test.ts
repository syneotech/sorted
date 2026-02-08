import { describe, it, expect } from 'vitest';
import {
  normalizeRestaurantName,
  normalizeItemName,
  calculateRestaurantComparison,
  calculateMenuItemComparison,
  getBestOption,
  formatPrice,
  formatSavings,
} from '../normalizer';
import { createMockRestaurant, createMockMenuItem } from '@/test/helpers';

describe('normalizeRestaurantName', () => {
  it('should convert to lowercase', () => {
    expect(normalizeRestaurantName('Pizza Hut')).toBe('pizza hut');
  });

  it('should remove special characters', () => {
    expect(normalizeRestaurantName("McDonald's")).toBe('mcdonalds');
    // Non-ASCII characters are removed
    expect(normalizeRestaurantName('Café Express!')).toBe('caf');
  });

  it('should normalize whitespace', () => {
    expect(normalizeRestaurantName('Pizza   Hut')).toBe('pizza hut');
    expect(normalizeRestaurantName('  Dominos  ')).toBe('dominos');
  });

  it('should remove common words', () => {
    // The function removes: the, restaurant, cafe, kitchen, express, delivery
    expect(normalizeRestaurantName('The Pizza Restaurant')).toBe('pizza');
    expect(normalizeRestaurantName('Burger King Express')).toBe('burger king');
    expect(normalizeRestaurantName('Cafe Coffee Day')).toBe('coffee day');
    expect(normalizeRestaurantName('Kitchen Junction Delivery')).toBe('junction');
  });

  it('should handle empty string', () => {
    expect(normalizeRestaurantName('')).toBe('');
  });
});

describe('normalizeItemName', () => {
  it('should convert to lowercase', () => {
    expect(normalizeItemName('Chicken Biryani')).toBe('chicken biryani');
  });

  it('should remove special characters', () => {
    // Parentheses are removed, then "large" is removed as a common modifier
    expect(normalizeItemName('Veg Pizza (Large)')).toBe('veg pizza');
  });

  it('should remove common modifiers', () => {
    // The function removes: special, combo, meal, plate, regular, large, small, medium
    expect(normalizeItemName('Special Biryani Combo')).toBe('biryani');
    expect(normalizeItemName('Regular Fries Meal')).toBe('fries');
    expect(normalizeItemName('Large Pizza Plate')).toBe('pizza');
  });
});

describe('calculateRestaurantComparison', () => {
  it('should calculate price difference correctly', () => {
    const swiggy = createMockRestaurant({
      costForTwoValue: 400,
      rating: 4.2,
      deliveryTime: 30,
    });
    const zomato = createMockRestaurant({
      costForTwoValue: 450,
      rating: 4.0,
      deliveryTime: 35,
    });

    const comparison = calculateRestaurantComparison(swiggy, zomato);

    expect(comparison.priceDifference).toBeDefined();
    expect(comparison.priceDifference?.swiggy).toBe(400);
    expect(comparison.priceDifference?.zomato).toBe(450);
    expect(comparison.priceDifference?.savings).toBe(50);
    expect(comparison.priceDifference?.cheaperPlatform).toBe('swiggy');
  });

  it('should identify zomato as cheaper when applicable', () => {
    const swiggy = createMockRestaurant({ costForTwoValue: 500 });
    const zomato = createMockRestaurant({ costForTwoValue: 400 });

    const comparison = calculateRestaurantComparison(swiggy, zomato);
    expect(comparison.priceDifference?.cheaperPlatform).toBe('zomato');
  });

  it('should identify same price', () => {
    const swiggy = createMockRestaurant({ costForTwoValue: 400 });
    const zomato = createMockRestaurant({ costForTwoValue: 400 });

    const comparison = calculateRestaurantComparison(swiggy, zomato);
    expect(comparison.priceDifference?.cheaperPlatform).toBe('same');
    expect(comparison.priceDifference?.savings).toBe(0);
  });

  it('should calculate rating difference', () => {
    const swiggy = createMockRestaurant({ rating: 4.5 });
    const zomato = createMockRestaurant({ rating: 4.2 });

    const comparison = calculateRestaurantComparison(swiggy, zomato);

    expect(comparison.ratingDifference).toBeDefined();
    expect(comparison.ratingDifference?.swiggy).toBe(4.5);
    expect(comparison.ratingDifference?.zomato).toBe(4.2);
    expect(comparison.ratingDifference?.difference).toBeCloseTo(0.3);
    expect(comparison.ratingDifference?.betterPlatform).toBe('swiggy');
  });

  it('should calculate delivery time difference', () => {
    const swiggy = createMockRestaurant({ deliveryTime: 25 });
    const zomato = createMockRestaurant({ deliveryTime: 35 });

    const comparison = calculateRestaurantComparison(swiggy, zomato);

    expect(comparison.deliveryTimeDifference).toBeDefined();
    expect(comparison.deliveryTimeDifference?.swiggy).toBe(25);
    expect(comparison.deliveryTimeDifference?.zomato).toBe(35);
    expect(comparison.deliveryTimeDifference?.fasterPlatform).toBe('swiggy');
  });

  it('should return empty object when only one platform', () => {
    const swiggy = createMockRestaurant();
    const comparison = calculateRestaurantComparison(swiggy, undefined);

    expect(comparison.priceDifference).toBeUndefined();
    expect(comparison.ratingDifference).toBeUndefined();
    expect(comparison.deliveryTimeDifference).toBeUndefined();
  });
});

describe('calculateMenuItemComparison', () => {
  it('should calculate price difference for menu items', () => {
    const swiggy = createMockMenuItem({ price: 299 });
    const zomato = createMockMenuItem({ price: 349 });

    const comparison = calculateMenuItemComparison(swiggy, zomato);

    expect(comparison.priceDifference).toBeDefined();
    expect(comparison.priceDifference?.swiggy).toBe(299);
    expect(comparison.priceDifference?.zomato).toBe(349);
    expect(comparison.priceDifference?.savings).toBe(50);
    expect(comparison.priceDifference?.cheaperPlatform).toBe('swiggy');
  });

  it('should return empty when only one platform', () => {
    const swiggy = createMockMenuItem({ price: 299 });
    const comparison = calculateMenuItemComparison(swiggy, undefined);

    expect(comparison.priceDifference).toBeUndefined();
  });
});

describe('getBestOption', () => {
  it('should return cheaper platform for price preference', () => {
    const comparison = {
      matchId: 'test',
      name: 'Test',
      swiggy: createMockRestaurant({ costForTwoValue: 400 }),
      zomato: createMockRestaurant({ costForTwoValue: 450 }),
      matchConfidence: 0.9,
      priceDifference: { swiggy: 400, zomato: 450, savings: 50, cheaperPlatform: 'swiggy' as const },
    };

    expect(getBestOption(comparison, 'price')).toBe('swiggy');
  });

  it('should return better rated platform for rating preference', () => {
    const comparison = {
      matchId: 'test',
      name: 'Test',
      swiggy: createMockRestaurant({ rating: 4.0 }),
      zomato: createMockRestaurant({ rating: 4.5 }),
      matchConfidence: 0.9,
      ratingDifference: { swiggy: 4.0, zomato: 4.5, difference: 0.5, betterPlatform: 'zomato' as const },
    };

    expect(getBestOption(comparison, 'rating')).toBe('zomato');
  });

  it('should return faster platform for time preference', () => {
    const comparison = {
      matchId: 'test',
      name: 'Test',
      swiggy: createMockRestaurant({ deliveryTime: 25 }),
      zomato: createMockRestaurant({ deliveryTime: 35 }),
      matchConfidence: 0.9,
      deliveryTimeDifference: { swiggy: 25, zomato: 35, difference: 10, fasterPlatform: 'swiggy' as const },
    };

    expect(getBestOption(comparison, 'time')).toBe('swiggy');
  });

  it('should return null when same on both platforms', () => {
    const comparison = {
      matchId: 'test',
      name: 'Test',
      swiggy: createMockRestaurant({ costForTwoValue: 400 }),
      zomato: createMockRestaurant({ costForTwoValue: 400 }),
      matchConfidence: 0.9,
      priceDifference: { swiggy: 400, zomato: 400, savings: 0, cheaperPlatform: 'same' as const },
    };

    expect(getBestOption(comparison, 'price')).toBeNull();
  });

  it('should return available platform when only one exists', () => {
    const swiggyOnly = {
      matchId: 'test',
      name: 'Test',
      swiggy: createMockRestaurant(),
      zomato: undefined,
      matchConfidence: 0,
    };

    expect(getBestOption(swiggyOnly, 'price')).toBe('swiggy');

    const zomatoOnly = {
      matchId: 'test',
      name: 'Test',
      swiggy: undefined,
      zomato: createMockRestaurant(),
      matchConfidence: 0,
    };

    expect(getBestOption(zomatoOnly, 'price')).toBe('zomato');
  });

  it('should return null when neither platform exists', () => {
    const neither = {
      matchId: 'test',
      name: 'Test',
      swiggy: undefined,
      zomato: undefined,
      matchConfidence: 0,
    };

    expect(getBestOption(neither, 'price')).toBeNull();
  });
});

describe('formatPrice', () => {
  it('should format price with rupee symbol', () => {
    expect(formatPrice(400)).toBe('₹400');
    expect(formatPrice(1500)).toBe('₹1,500');
    expect(formatPrice(10000)).toBe('₹10,000');
  });
});

describe('formatSavings', () => {
  it('should format savings with platform name', () => {
    expect(formatSavings(50, 'swiggy')).toBe('Save ₹50 on Swiggy');
    expect(formatSavings(100, 'zomato')).toBe('Save ₹100 on Zomato');
  });

  it('should return same price message when no savings', () => {
    expect(formatSavings(0, 'same')).toBe('Same price on both');
    expect(formatSavings(0, 'swiggy')).toBe('Same price on both');
  });
});
