/**
 * Authentication E2E Tests
 * ─────────────────────────
 */

import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("user can view login page", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('input[name="tenantSlug"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login")
    
    await page.fill('input[name="email"]', "invalid@example.com")
    await page.fill('input[name="password"]', "wrongpassword")
    await page.fill('input[name="tenantSlug"]', "demo-school")
    
    await page.click('button[type="submit"]')
    
    // Should show error or redirect back
    await expect(page.locator("text=Invalid")).toBeVisible()
  })

  test("unauthorized access redirects to login", async ({ page }) => {
    await page.goto("/demo-school/admin/dashboard")
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login.*/)
  })
})
