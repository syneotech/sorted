// Delivery time filter implementation

import type { ComparisonRestaurant } from '../comparison/normalizer';
import type { DeliveryTimeFilter } from './types';
import { DELIVERY_TIME_VALUES } from './types';

/**
 * Filter restaurants by maximum delivery time
 * Uses the faster delivery time from either platform
 */
export function filterByDeliveryTime(
  restaurants: ComparisonRestaurant[],
  maxTime: DeliveryTimeFilter
): ComparisonRestaurant[] {
  if (maxTime === 'any') {
    return restaurants;
  }

  const threshold = DELIVERY_TIME_VALUES[maxTime];

  return restaurants.filter(restaurant => {
    const time = getFastestDeliveryTime(restaurant);
    if (time === null) return true; // Include if no delivery time info
    return time <= threshold;
  });
}

/**
 * Get the fastest delivery time from either platform
 */
function getFastestDeliveryTime(restaurant: ComparisonRestaurant): number | null {
  const times: number[] = [];

  if (restaurant.swiggy?.deliveryTime && restaurant.swiggy.deliveryTime > 0) {
    times.push(restaurant.swiggy.deliveryTime);
  }

  if (restaurant.zomato?.deliveryTime && restaurant.zomato.deliveryTime > 0) {
    times.push(restaurant.zomato.deliveryTime);
  }

  if (times.length === 0) return null;
  return Math.min(...times);
}

/**
 * Get average delivery time from both platforms
 */
export function getAverageDeliveryTime(restaurant: ComparisonRestaurant): number | null {
  const times: number[] = [];

  if (restaurant.swiggy?.deliveryTime && restaurant.swiggy.deliveryTime > 0) {
    times.push(restaurant.swiggy.deliveryTime);
  }

  if (restaurant.zomato?.deliveryTime && restaurant.zomato.deliveryTime > 0) {
    times.push(restaurant.zomato.deliveryTime);
  }

  if (times.length === 0) return null;
  return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
}

/**
 * Get delivery time distribution for filter UI
 */
export function getDeliveryTimeDistribution(
  restaurants: ComparisonRestaurant[]
): Record<DeliveryTimeFilter, number> {
  const distribution: Record<DeliveryTimeFilter, number> = {
    'any': restaurants.length,
    '30': 0,
    '45': 0,
    '60': 0,
  };

  for (const restaurant of restaurants) {
    const time = getFastestDeliveryTime(restaurant);
    if (time === null) continue;

    if (time <= 30) distribution['30']++;
    if (time <= 45) distribution['45']++;
    if (time <= 60) distribution['60']++;
  }

  return distribution;
}

/**
 * Format delivery time for display
 */
export function formatDeliveryTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${mins} min`;
}
