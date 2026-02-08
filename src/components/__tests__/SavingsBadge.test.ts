import { describe, it, expect } from 'vitest';
import { calculateSavings } from '../SavingsBadge';

describe('calculateSavings', () => {
  it('should return null when swiggy price is missing', () => {
    expect(calculateSavings(undefined, 400)).toBeNull();
  });

  it('should return null when zomato price is missing', () => {
    expect(calculateSavings(400, undefined)).toBeNull();
  });

  it('should return null when both prices are missing', () => {
    expect(calculateSavings(undefined, undefined)).toBeNull();
  });

  it('should return null when prices are zero', () => {
    expect(calculateSavings(0, 400)).toBeNull();
    expect(calculateSavings(400, 0)).toBeNull();
    expect(calculateSavings(0, 0)).toBeNull();
  });

  it('should return null when prices are equal', () => {
    expect(calculateSavings(400, 400)).toBeNull();
    expect(calculateSavings(100, 100)).toBeNull();
  });

  it('should return correct savings when swiggy is cheaper', () => {
    const result = calculateSavings(300, 400);

    expect(result).not.toBeNull();
    expect(result?.savings).toBe(100);
    expect(result?.cheaperPlatform).toBe('swiggy');
    expect(result?.percentage).toBe(25); // 100/400 = 25%
  });

  it('should return correct savings when zomato is cheaper', () => {
    const result = calculateSavings(500, 400);

    expect(result).not.toBeNull();
    expect(result?.savings).toBe(100);
    expect(result?.cheaperPlatform).toBe('zomato');
    expect(result?.percentage).toBe(20); // 100/500 = 20%
  });

  it('should calculate percentage correctly', () => {
    // 10% savings
    const result1 = calculateSavings(90, 100);
    expect(result1?.percentage).toBe(10);

    // 50% savings
    const result2 = calculateSavings(100, 200);
    expect(result2?.percentage).toBe(50);

    // Small savings
    const result3 = calculateSavings(380, 400);
    expect(result3?.percentage).toBe(5); // 20/400 = 5%
  });

  it('should handle large price differences', () => {
    const result = calculateSavings(200, 800);

    expect(result).not.toBeNull();
    expect(result?.savings).toBe(600);
    expect(result?.cheaperPlatform).toBe('swiggy');
    expect(result?.percentage).toBe(75); // 600/800 = 75%
  });

  it('should handle small price differences', () => {
    const result = calculateSavings(395, 400);

    expect(result).not.toBeNull();
    expect(result?.savings).toBe(5);
    expect(result?.cheaperPlatform).toBe('swiggy');
    expect(result?.percentage).toBe(1.25); // 5/400 = 1.25%
  });
});
