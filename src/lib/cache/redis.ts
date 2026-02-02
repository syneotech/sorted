import { Redis } from '@upstash/redis';
import crypto from 'crypto';

// Initialize Redis client - will use UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Check if Redis is configured
export function isRedisConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

// Cache TTLs in seconds
export const CACHE_TTL = {
  SEARCH: 15 * 60, // 15 minutes
  RESTAURANT: 60 * 60, // 1 hour
  MENU: 30 * 60, // 30 minutes
};

// Generate cache key
export function generateCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((k) => `${k}:${params[k]}`)
    .join('|');
  const hash = crypto.createHash('md5').update(sortedParams).digest('hex');
  return `${prefix}:${hash}`;
}

// Get cached data
export async function getFromCache<T>(key: string): Promise<T | null> {
  if (!isRedisConfigured()) {
    return null;
  }

  try {
    const data = await redis.get<T>(key);
    return data;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

// Set cached data
export async function setInCache<T>(
  key: string,
  data: T,
  ttlSeconds: number = CACHE_TTL.SEARCH
): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }

  try {
    await redis.set(key, data, { ex: ttlSeconds });
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

// Delete cached data
export async function deleteFromCache(key: string): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }

  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
  }
}

// Rate limiting
export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 30,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  if (!isRedisConfigured()) {
    return { allowed: true, remaining: maxRequests, resetIn: 0 };
  }

  const key = `ratelimit:${identifier}`;

  try {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    const ttl = await redis.ttl(key);
    const remaining = Math.max(0, maxRequests - current);

    return {
      allowed: current <= maxRequests,
      remaining,
      resetIn: ttl > 0 ? ttl : windowSeconds,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, remaining: maxRequests, resetIn: 0 };
  }
}

// Search cache helpers
export async function getCachedSearch(
  query: string,
  lat: number,
  lng: number
): Promise<{ swiggy: unknown[]; zomato: unknown[] } | null> {
  const key = generateCacheKey('search', { query, lat, lng });
  return getFromCache(key);
}

export async function setCachedSearch(
  query: string,
  lat: number,
  lng: number,
  results: { swiggy: unknown[]; zomato: unknown[] }
): Promise<void> {
  const key = generateCacheKey('search', { query, lat, lng });
  await setInCache(key, results, CACHE_TTL.SEARCH);
}

// Restaurant cache helpers
export async function getCachedRestaurant(
  platform: 'swiggy' | 'zomato',
  platformId: string
): Promise<unknown | null> {
  const key = generateCacheKey('restaurant', { platform, platformId });
  return getFromCache(key);
}

export async function setCachedRestaurant(
  platform: 'swiggy' | 'zomato',
  platformId: string,
  data: unknown
): Promise<void> {
  const key = generateCacheKey('restaurant', { platform, platformId });
  await setInCache(key, data, CACHE_TTL.RESTAURANT);
}

// Menu cache helpers
export async function getCachedMenu(
  platform: 'swiggy' | 'zomato',
  restaurantId: string
): Promise<unknown[] | null> {
  const key = generateCacheKey('menu', { platform, restaurantId });
  return getFromCache(key);
}

export async function setCachedMenu(
  platform: 'swiggy' | 'zomato',
  restaurantId: string,
  menu: unknown[]
): Promise<void> {
  const key = generateCacheKey('menu', { platform, restaurantId });
  await setInCache(key, menu, CACHE_TTL.MENU);
}

export default redis;
