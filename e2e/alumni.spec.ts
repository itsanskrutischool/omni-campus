import { test, expect } from "@playwright/test"

test.describe("Alumni Module E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/login")
    await page.fill('input[name="email"]', "admin@st-xaviers.com")
    await page.fill('input[name="password"]', "password")
    await page.click('button[type="submit"]')
    await page.waitForURL("**/dashboard")
  })

  test("should navigate to alumni page", async ({ page }) => {
    await page.click('text=Alumni')
    await expect(page.locator("h1")).toContainText("Alumni Network")
  })

  test("should display alumni statistics", async ({ page }) => {
    await page.click('text=Alumni')
    await expect(page.locator("text=Total Alumni")).toBeVisible()
    await expect(page.locator("text=Verified")).toBeVisible()
    await expect(page.locator("text=Total Donations")).toBeVisible()
    await expect(page.locator("text=Upcoming Events")).toBeVisible()
  })

  test("should view alumni directory", async ({ page }) => {
    await page.click('text=Alumni')
    await page.click('text=Directory')
    await expect(page.locator("table")).toBeVisible()
  })

  test("should verify alumni member", async ({ page }) => {
    await page.click('text=Alumni')
    await page.click('text=Directory')
    
    const verifyButton = page.locator('button:has-text("Verify")').first()
    if (await verifyButton.isVisible()) {
      await verifyButton.click()
      await page.waitForTimeout(1000)
    }
  })

  test("should view alumni events", async ({ page }) => {
    await page.click('text=Alumni')
    await page.click('text=Events')
    await expect(page.locator("table")).toBeVisible()
  })

  test("should view donations", async ({ page }) => {
    await page.click('text=Alumni')
    await page.click('text=Donations')
    await expect(page.locator("text=Select an alumni member")).toBeVisible()
  })

  test("should view achievements", async ({ page }) => {
    await page.click('text=Alumni')
    await page.click('text=Achievements')
    await expect(page.locator("text=Select an alumni member")).toBeVisible()
  })
})
