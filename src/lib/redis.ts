/**
 * Redis Caching Utility
 * ──────────────────────
 * Provides Redis caching functionality for the application.
 * Falls back to in-memory cache if Redis is not configured.
 */

// Initialize Redis client (optional)
let redis: any = null

try {
  if (process.env.REDIS_URL) {
    const { Redis } = require("@upstash/redis")
    redis = new Redis({
      url: process.env.REDIS_URL,
    })
  }
} catch (error) {
  // Redis not installed or not configured, use in-memory cache
  console.log("Redis not available, using in-memory cache")
}

// In-memory cache fallback
const memoryCache = new Map<string, { value: any; expiry: number }>()

// Helper functions
export function getRedis() {
  return redis
}

export async function redisSet(key: string, value: string, ttl?: number) {
  if (!redis) return false
  try {
    if (ttl) {
      await redis.set(key, value, { ex: ttl })
    } else {
      await redis.set(key, value)
    }
    return true
  } catch (error) {
    return false
  }
}

export async function redisGet(key: string) {
  if (!redis) return null
  try {
    return await redis.get(key)
  } catch (error) {
    return null
  }
}

export async function redisDelete(key: string) {
  if (!redis) return false
  try {
    await redis.del(key)
    return true
  } catch (error) {
    return false
  }
}

export function memorySet(key: string, value: string, ttlSeconds: number) {
  memoryCache.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000,
  })
}

export function memoryGet(key: string) {
  const item = memoryCache.get(key)
  if (!item) return null
  if (item.expiry < Date.now()) {
    memoryCache.delete(key)
    return null
  }
  return item.value
}

export function memoryDelete(key: string) {
  memoryCache.delete(key)
}

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
      const value = await redis.get(key)
      return value as T
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

  // Try Redis first
  if (await redisSet(key, JSON.stringify(value), ttl)) {
    return
  }

  // Fallback to memory cache
  memorySet(key, JSON.stringify(value), ttl)
}

/**
 * Delete a value from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  // Try Redis first
  if (await redisDelete(key)) {
    return
  }

  // Fallback to memory cache
  memoryDelete(key)
}

/**
 * Clear all cache entries matching a pattern
 */
export async function cacheClear(pattern: string): Promise<void> {
  // Try Redis first
  const client = getRedis()
  if (client) {
    try {
      const keys = await client.keys(pattern)
      if (keys.length > 0) {
        await client.del(...keys)
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
