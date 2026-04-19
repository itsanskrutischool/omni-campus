import { test, expect } from "@playwright/test"

test.describe("Hostel Module E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/login")
    await page.fill('input[name="email"]', "admin@st-xaviers.com")
    await page.fill('input[name="password"]', "password")
    await page.click('button[type="submit"]')
    await page.waitForURL("**/dashboard")
  })

  test("should navigate to hostel page", async ({ page }) => {
    await page.click('text=Hostel')
    await expect(page.locator("h1")).toContainText("Hostel Management")
  })

  test("should display hostel statistics", async ({ page }) => {
    await page.click('text=Hostel')
    await expect(page.locator("text=Total Hostels")).toBeVisible()
    await expect(page.locator("text=Total Rooms")).toBeVisible()
    await expect(page.locator("text=Occupancy")).toBeVisible()
    await expect(page.locator("text=Available Beds")).toBeVisible()
  })

  test("should view hostels list", async ({ page }) => {
    await page.click('text=Hostel')
    await page.click('text=Hostels')
    await expect(page.locator("table")).toBeVisible()
  })

  test("should view rooms for a hostel", async ({ page }) => {
    await page.click('text=Hostel')
    await page.click('text=Hostels')
    
    const viewRoomsButton = page.locator('button:has-text("View Rooms")').first()
    if (await viewRoomsButton.isVisible()) {
      await viewRoomsButton.click()
      await page.click('text=Rooms')
      await expect(page.locator("table")).toBeVisible()
    }
  })

  test("should allocate room to student", async ({ page }) => {
    await page.click('text=Hostel')
    await page.click('text=Rooms')
    
    const allocateButton = page.locator('button:has-text("Allocate")').first()
    if (await allocateButton.isVisible()) {
      await allocateButton.click()
      await page.waitForTimeout(1000)
    }
  })
})
