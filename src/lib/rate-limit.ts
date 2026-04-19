/**
 * Rate Limiting Middleware
 * ────────────────────────
 * Prevents API abuse and DDoS attacks using in-memory store.
 * For production with multiple instances, use Redis.
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100 // 100 requests per minute

export function rateLimit(identifier: string): {
  success: boolean
  limit: number
  remaining: number
  reset: number
} {
  const now = Date.now()
  const key = identifier

  // Clean expired entries
  for (const [k, v] of store.entries()) {
    if (v.resetTime < now) {
      store.delete(k)
    }
  }

  const entry = store.get(key)

  if (!entry || entry.resetTime < now) {
    // New window
    store.set(key, {
      count: 1,
      resetTime: now + WINDOW_MS,
    })
    return {
      success: true,
      limit: MAX_REQUESTS,
      remaining: MAX_REQUESTS - 1,
      reset: now + WINDOW_MS,
    }
  }

  // Within window
  if (entry.count >= MAX_REQUESTS) {
    return {
      success: false,
      limit: MAX_REQUESTS,
      remaining: 0,
      reset: entry.resetTime,
    }
  }

  entry.count++
  return {
    success: true,
    limit: MAX_REQUESTS,
    remaining: MAX_REQUESTS - entry.count,
    reset: entry.resetTime,
  }
}

export function getRateLimitHeaders(result: ReturnType<typeof rateLimit>) {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  }
}
