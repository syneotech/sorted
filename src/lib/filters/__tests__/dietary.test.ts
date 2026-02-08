import { describe, it, expect } from 'vitest';
import { filterByDietary } from '../dietary';
import { createMockComparisonRestaurant } from '@/test/helpers';

describe('filterByDietary', () => {
  const restaurants = [
    createMockComparisonRestaurant({
      swiggy: { name: 'Pure Veg Restaurant', cuisines: ['South Indian', 'Vegetarian'] },
      zomato: { name: 'Pure Veg Restaurant', cuisines: ['South Indian'] },
    }),
    createMockComparisonRestaurant({
      swiggy: { name: 'Chicken Corner', cuisines: ['North Indian', 'Biryani'] },
      zomato: { name: 'Chicken Corner', cuisines: ['Mughlai', 'Biryani'] },
    }),
    createMockComparisonRestaurant({
      swiggy: { name: 'Mixed Restaurant', cuisines: ['Chinese', 'Fast Food'] },
      zomato: { name: 'Mixed Restaurant', cuisines: ['Chinese'] },
    }),
    createMockComparisonRestaurant({
      swiggy: { name: 'Udupi Kitchen', cuisines: ['South Indian', 'Udupi'] },
      zomato: { name: 'Udupi Kitchen', cuisines: ['South Indian'] },
    }),
  ];

  it('should return all restaurants when dietary is "all"', () => {
    const result = filterByDietary(restaurants, 'all');
    expect(result).toHaveLength(4);
  });

  it('should filter veg-only restaurants correctly', () => {
    const result = filterByDietary(restaurants, 'veg');
    // Pure Veg Restaurant and Udupi Kitchen should pass
    expect(result.length).toBeGreaterThanOrEqual(2);
    const names = result.map(r => r.name);
    expect(names).toContain('Pure Veg Restaurant');
    expect(names).toContain('Udupi Kitchen');
  });

  it('should filter non-veg restaurants correctly', () => {
    const result = filterByDietary(restaurants, 'non-veg');
    // Chicken Corner has non-veg indicators
    expect(result.length).toBeGreaterThanOrEqual(1);
    const names = result.map(r => r.name);
    expect(names).toContain('Chicken Corner');
  });

  it('should detect veg indicators in name', () => {
    const vegRestaurant = createMockComparisonRestaurant({
      swiggy: { name: 'Pure Veg Meals', cuisines: ['North Indian'] },
      zomato: { name: 'Pure Veg Meals', cuisines: ['North Indian'] },
    });
    const result = filterByDietary([vegRestaurant], 'veg');
    expect(result).toHaveLength(1);
  });

  it('should detect non-veg indicators in cuisines', () => {
    const nonVegRestaurant = createMockComparisonRestaurant({
      swiggy: { name: 'Biryani House', cuisines: ['Hyderabadi', 'Biryani'] },
      zomato: { name: 'Biryani House', cuisines: ['Biryani'] },
    });
    const result = filterByDietary([nonVegRestaurant], 'non-veg');
    expect(result).toHaveLength(1);
  });
});
