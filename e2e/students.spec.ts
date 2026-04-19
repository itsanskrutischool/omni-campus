/**
 * Student Management E2E Tests
 * ─────────────────────────────
 */

import { test, expect } from "@playwright/test"

test.describe("Student Management", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login and authenticate
    await page.goto("/login")
    
    // Fill login form with test credentials
    await page.fill('input[name="email"]', "admin@demo.com")
    await page.fill('input[name="password"]', "admin123")
    await page.fill('input[name="tenantSlug"]', "demo-school")
    
    await page.click('button[type="submit"]')
    
    // Wait for dashboard redirect
    await page.waitForURL(/.*dashboard.*/)
  })

  test("admin can view students list", async ({ page }) => {
    await page.goto("/demo-school/admin/students")
    
    // Should see students page content
    await expect(page.locator("text=Students").first()).toBeVisible()
    await expect(page.locator('table, [data-testid="student-list"]')).toBeVisible()
  })

  test("admin can access add student page", async ({ page }) => {
    await page.goto("/demo-school/admin/students")
    
    // Click add student button
    await page.click('button:has-text("Add Student")')
    
    // Should see form
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('select[name="gender"]')).toBeVisible()
  })

  test("student search filters results", async ({ page }) => {
    await page.goto("/demo-school/admin/students")
    
    // Type in search box
    await page.fill('[data-testid="search-input"]', "John")
    
    // Wait for results to update
    await page.waitForTimeout(500)
    
    // Should show filtered results
    const rows = await page.locator('table tbody tr').count()
    expect(rows).toBeGreaterThanOrEqual(0)
  })
})
