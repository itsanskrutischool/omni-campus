/**
 * Rate Limiting Tests
 * ───────────────────
 */

import { rateLimit } from "../rate-limit"

describe("rateLimit", () => {
  beforeEach(() => {
    // Clear any existing rate limit data between tests
    jest.clearAllMocks()
  })

  it("should allow requests under the limit", () => {
    const result = rateLimit("test-user-1")

    expect(result.success).toBe(true)
    expect(result.limit).toBe(100)
    expect(result.remaining).toBe(99)
  })

  it("should track multiple requests from same user", () => {
    rateLimit("test-user-2")
    rateLimit("test-user-2")
    const result = rateLimit("test-user-2")

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(97)
  })

  it("should block requests over the limit", () => {
    const userId = "test-user-3"

    // Make 100 requests
    for (let i = 0; i < 100; i++) {
      rateLimit(userId)
    }

    // 101st request should be blocked
    const result = rateLimit(userId)
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it("should handle different users independently", () => {
    const result1 = rateLimit("user-a")
    const result2 = rateLimit("user-b")

    expect(result1.remaining).toBe(99)
    expect(result2.remaining).toBe(99)
  })
})
