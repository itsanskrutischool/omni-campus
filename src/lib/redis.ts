/**
 * Redis Caching Utility
 * ──────────────────────
 * Provides Redis caching functionality for the application.
 * Falls back to in-memory cache if Redis is not configured.
 */

import { Redis } from "@upstash/redis"

// Initialize Redis client (optional)
let redis: Redis | null = null

if (process.env.REDIS_URL) {
  try {
    redis = new Redis({
      url: process.env.REDIS_URL,
    })
  } catch (error) {
    console.warn("Redis initialization failed, falling back to in-memory cache:", error)
  }
}

// In-memory cache fallback
const memoryCache = new Map<string, { value: any; expiry: number }>()

export interface CacheOptions {
  ttl?: number // Time to live in seconds (default: 300 = 5 minutes)
}

/**
 * Get a value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  // Try Redis first
  if (redis) {
    try {
      const value = await redis.get<T>(key)
      return value
    } catch (error) {
      console.warn("Redis get failed, falling back to memory:", error)
    }
  }

  // Fallback to memory cache
  const entry = memoryCache.get(key)
  if (entry && entry.expiry > Date.now()) {
    return entry.value as T
  }

  // Clean up expired entry
  if (entry) {
    memoryCache.delete(key)
  }

  return null
}

/**
 * Set a value in cache
 */
export async function cacheSet<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
  const ttl = options.ttl || 300 // Default 5 minutes
  const expiry = Date.now() + ttl * 1000

  // Try Redis first
  if (redis) {
    try {
      await redis.set(key, value, { ex: ttl })
      return
    } catch (error) {
      console.warn("Redis set failed, falling back to memory:", error)
    }
  }

  // Fallback to memory cache
  memoryCache.set(key, { value, expiry })
}

/**
 * Delete a value from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  if (redis) {
    try {
      await redis.del(key)
      return
    } catch (error) {
      console.warn("Redis delete failed:", error)
    }
  }

  memoryCache.delete(key)
}

/**
 * Clear all cache entries matching a pattern
 */
export async function cacheClear(pattern: string): Promise<void> {
  if (redis) {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
      return
    } catch (error) {
      console.warn("Redis clear failed:", error)
    }
  }

  // Clear matching keys from memory cache
  for (const key of memoryCache.keys()) {
    if (key.match(pattern)) {
      memoryCache.delete(key)
    }
  }
}

/**
 * Cache wrapper function - caches expensive operations
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get from cache first
  const cached = await cacheGet<T>(key)
  if (cached !== null) {
    return cached
  }

  // Execute function and cache result
  const result = await fn()
  await cacheSet(key, result, options)

  return result
}

/**
 * Generate cache key for tenant-specific data
 */
export function tenantCacheKey(tenantId: string, resource: string, identifier?: string): string {
  return identifier
    ? `tenant:${tenantId}:${resource}:${identifier}`
    : `tenant:${tenantId}:${resource}`
}
