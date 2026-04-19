import { test, expect } from "@playwright/test"

test.describe("Recruitment Module E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/login")
    await page.fill('input[name="email"]', "admin@st-xaviers.com")
    await page.fill('input[name="password"]', "password")
    await page.click('button[type="submit"]')
    await page.waitForURL("**/dashboard")
  })

  test("should navigate to recruitment page", async ({ page }) => {
    await page.click('text=Recruitment')
    await expect(page.locator("h1")).toContainText("Recruitment Management")
  })

  test("should display recruitment statistics", async ({ page }) => {
    await page.click('text=Recruitment')
    await expect(page.locator("text=Open Vacancies")).toBeVisible()
    await expect(page.locator("text=Total Applications")).toBeVisible()
    await expect(page.locator("text=Pending Review")).toBeVisible()
    await expect(page.locator("text=Hired")).toBeVisible()
  })

  test("should view vacancies list", async ({ page }) => {
    await page.click('text=Recruitment')
    await page.click('text=Vacancies')
    await expect(page.locator("table")).toBeVisible()
  })

  test("should view applications for a vacancy", async ({ page }) => {
    await page.click('text=Recruitment')
    await page.click('text=Vacancies')
    
    const viewApplicationsButton = page.locator('button:has-text("View Applications")').first()
    if (await viewApplicationsButton.isVisible()) {
      await viewApplicationsButton.click()
      await page.click('text=Applications')
      await expect(page.locator("table")).toBeVisible()
    }
  })

  test("should shortlist application", async ({ page }) => {
    await page.click('text=Recruitment')
    await page.click('text=Applications')
    
    const shortlistButton = page.locator('button:has-text("Shortlist")').first()
    if (await shortlistButton.isVisible()) {
      await shortlistButton.click()
      await page.waitForTimeout(1000)
    }
  })

  test("should hire candidate", async ({ page }) => {
    await page.click('text=Recruitment')
    await page.click('text=Applications')
    
    const hireButton = page.locator('button:has-text("Hire")').first()
    if (await hireButton.isVisible()) {
      await hireButton.click()
      await page.waitForTimeout(1000)
    }
  })
})
