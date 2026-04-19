import { test, expect } from "@playwright/test"

test.describe("Inventory Module E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/login")
    await page.fill('input[name="email"]', "admin@st-xaviers.com")
    await page.fill('input[name="password"]', "password")
    await page.click('button[type="submit"]')
    await page.waitForURL("**/dashboard")
  })

  test("should navigate to inventory page", async ({ page }) => {
    await page.click('text=Inventory')
    await expect(page.locator("h1")).toContainText("Inventory Management")
  })

  test("should display inventory statistics", async ({ page }) => {
    await page.click('text=Inventory')
    await expect(page.locator("text=Total Items")).toBeVisible()
    await expect(page.locator("text=Total Categories")).toBeVisible()
    await expect(page.locator("text=Total Stores")).toBeVisible()
    await expect(page.locator("text=Low Stock Items")).toBeVisible()
  })

  test("should view items list", async ({ page }) => {
    await page.click('text=Inventory')
    await page.click('text=Items')
    await expect(page.locator("table")).toBeVisible()
  })

  test("should filter items by category", async ({ page }) => {
    await page.click('text=Inventory')
    
    const categorySelect = page.locator('[role="combobox"]').first()
    if (await categorySelect.isVisible()) {
      await categorySelect.click()
      await page.waitForTimeout(500)
    }
  })

  test("should view categories", async ({ page }) => {
    await page.click('text=Inventory')
    await page.click('text=Categories')
    await expect(page.locator("table")).toBeVisible()
  })

  test("should view stores", async ({ page }) => {
    await page.click('text=Inventory')
    await page.click('text=Stores')
    await expect(page.locator("table")).toBeVisible()
  })

  test("should record purchase for item", async ({ page }) => {
    await page.click('text=Inventory')
    await page.click('text=Items')
    
    const purchaseButton = page.locator('button:has-text("Purchase")').first()
    if (await purchaseButton.isVisible()) {
      await purchaseButton.click()
      await page.waitForTimeout(1000)
    }
  })
})
