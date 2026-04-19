import IORedis from "ioredis"

// Redis connection configuration
const redis = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
})

// Cache helper functions
export class CacheService {
  /**
   * Get a value from cache
   */
  static async get(key: string): Promise<string | null> {
    try {
      return await redis.get(key)
    } catch (error) {
      console.error("Cache get error:", error)
      return null
    }
  }

  /**
   * Set a value in cache with optional expiration (in seconds)
   */
  static async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await redis.setex(key, ttl, value)
      } else {
        await redis.set(key, value)
      }
      return true
    } catch (error) {
      console.error("Cache set error:", error)
      return false
    }
  }

  /**
   * Delete a key from cache
   */
  static async del(key: string): Promise<boolean> {
    try {
      await redis.del(key)
      return true
    } catch (error) {
      console.error("Cache delete error:", error)
      return false
    }
  }

  /**
   * Delete multiple keys from cache
   */
  static async delPattern(pattern: string): Promise<boolean> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
      return true
    } catch (error) {
      console.error("Cache delete pattern error:", error)
      return false
    }
  }

  /**
   * Get JSON value from cache
   */
  static async getJson<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key)
      if (!value) return null
      return JSON.parse(value) as T
    } catch (error) {
      console.error("Cache get JSON error:", error)
      return null
    }
  }

  /**
   * Set JSON value in cache with optional expiration (in seconds)
   */
  static async setJson<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value)
      return await this.set(key, serialized, ttl)
    } catch (error) {
      console.error("Cache set JSON error:", error)
      return false
    }
  }

  /**
   * Check if a key exists in cache
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.error("Cache exists error:", error)
      return false
    }
  }

  /**
   * Set expiration time for a key (in seconds)
   */
  static async expire(key: string, ttl: number): Promise<boolean> {
    try {
      await redis.expire(key, ttl)
      return true
    } catch (error) {
      console.error("Cache expire error:", error)
      return false
    }
  }

  /**
   * Get TTL (time to live) of a key (in seconds)
   */
  static async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key)
    } catch (error) {
      console.error("Cache TTL error:", error)
      return -1
    }
  }

  /**
   * Increment a numeric value in cache
   */
  static async increment(key: string): Promise<number> {
    try {
      return await redis.incr(key)
    } catch (error) {
      console.error("Cache increment error:", error)
      return 0
    }
  }

  /**
   * Decrement a numeric value in cache
   */
  static async decrement(key: string): Promise<number> {
    try {
      return await redis.decr(key)
    } catch (error) {
      console.error("Cache decrement error:", error)
      return 0
    }
  }

  /**
   * Clear all cache (use with caution)
   */
  static async flush(): Promise<boolean> {
    try {
      await redis.flushdb()
      return true
    } catch (error) {
      console.error("Cache flush error:", error)
      return false
    }
  }

  /**
   * Get cache statistics
   */
  static async getStats(): Promise<any> {
    try {
      const info = await redis.info("stats")
      return info
    } catch (error) {
      console.error("Cache stats error:", error)
      return null
    }
  }
}

// Cache key generators
export const CacheKeys = {
  // User session
  userSession: (userId: string) => `session:${userId}`,
  
  // Dashboard data
  dashboardStats: (tenantId: string, role: string) => `dashboard:${tenantId}:${role}`,
  
  // Student data
  student: (id: string) => `student:${id}`,
  studentsList: (tenantId: string, page: number) => `students:${tenantId}:${page}`,
  
  // Fee data
  feeStats: (tenantId: string) => `fees:${tenantId}:stats`,
  feeRecords: (tenantId: string, page: number) => `fees:${tenantId}:${page}`,
  
  // Exam data
  examStats: (tenantId: string) => `exams:${tenantId}:stats`,
  
  // Attendance data
  attendanceStats: (tenantId: string, date: string) => `attendance:${tenantId}:${date}`,
  
  // Report data
  report: (tenantId: string, type: string, params: string) => `report:${tenantId}:${type}:${params}`,
  
  // API rate limiting
  rateLimit: (identifier: string) => `ratelimit:${identifier}`,
  
  // Gate pass OTP
  gatePassOTP: (studentId: string) => `gatepass:otp:${studentId}`,
  
  // General cache
  tenantConfig: (tenantId: string) => `config:${tenantId}`,
}

// Close Redis connection
export async function closeCache() {
  await redis.quit()
}
