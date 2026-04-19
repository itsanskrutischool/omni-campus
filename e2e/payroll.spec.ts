import { test, expect } from "@playwright/test"

test.describe("Payroll Module E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto("http://localhost:3000/login")
    
    // Login with credentials (adjust based on actual login flow)
    await page.fill('input[name="email"]', "admin@st-xaviers.com")
    await page.fill('input[name="password"]', "password")
    await page.click('button[type="submit"]')
    
    // Wait for dashboard to load
    await page.waitForURL("**/dashboard")
  })

  test("should navigate to payroll page", async ({ page }) => {
    // Navigate to payroll module
    await page.click('text=Payroll')
    
    // Verify payroll page loads
    await expect(page.locator("h1")).toContainText("Payroll Management")
  })

  test("should display payroll statistics", async ({ page }) => {
    await page.click('text=Payroll')
    
    // Check for statistics cards
    await expect(page.locator("text=Total Staff")).toBeVisible()
    await expect(page.locator("text=Total Payroll")).toBeVisible()
    await expect(page.locator("text=Pending")).toBeVisible()
    await expect(page.locator("text=Paid")).toBeVisible()
  })

  test("should generate bulk payroll", async ({ page }) => {
    await page.click('text=Payroll')
    
    // Click generate payroll button
    await page.click('button:has-text("Generate Payroll")')
    
    // Wait for confirmation or update
    await page.waitForTimeout(2000)
    
    // Verify payroll was generated (check for updated stats or table)
    await expect(page.locator("table")).toBeVisible()
  })

  test("should filter payroll by month and year", async ({ page }) => {
    await page.click('text=Payroll')
    
    // Select month
    await page.click('[role="combobox"]')
    await page.click('text=Month 1')
    
    // Select year
    await page.click('[role="combobox"]:nth-of-type(2)')
    await page.click('text=2026')
    
    // Verify filtered results
    await page.waitForTimeout(1000)
    await expect(page.locator("table")).toBeVisible()
  })

  test("should update payroll status", async ({ page }) => {
    await page.click('text=Payroll')
    
    // Find a pending payroll and approve it
    const approveButton = page.locator('button:has-text("Approve")').first()
    if (await approveButton.isVisible()) {
      await approveButton.click()
      
      // Verify status changed
      await page.waitForTimeout(1000)
      await expect(page.locator('button:has-text("Mark Paid")').first()).toBeVisible()
    }
  })
})
