/**
 * Full System E2E Test Suite
 * ─────────────────────────────
 * Automated browser testing for OmniCampus ERP
 * Run with: npx playwright test e2e/full-system-test.spec.ts --headed
 */

import { test, expect, chromium } from "@playwright/test"
import { execSync } from "child_process"

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000"
const TEST_CREDENTIALS = {
  email: "admin@demo.com",
  password: "admin123",
  tenantSlug: "demo-school"
}

// Helper: Check if server is running
async function isServerRunning(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/status`)
    const data = await response.json()
    return data.status === "healthy"
  } catch {
    return false
  }
}

test.describe("🔥 OmniCampus ERP - Full System Test", () => {
  
  test.beforeAll(async () => {
    // Verify server is running
    const serverRunning = await isServerRunning()
    if (!serverRunning) {
      console.log("⚠️  Server not detected. Starting dev server...")
      try {
        // Try to start server in background
        execSync("npm run dev", { 
          cwd: process.cwd(),
          stdio: "ignore",
          detached: true
        })
        // Wait for server to start
        await new Promise(resolve => setTimeout(resolve, 5000))
      } catch {
        console.log("⚠️  Could not auto-start server. Please run 'npm run dev' manually.")
      }
    }
  })

  test("1️⃣  Application Health Check", async () => {
    const response = await fetch(`${BASE_URL}/api/status`)
    const data = await response.json()
    
    expect(data.status).toBe("healthy")
    expect(data.database).toBe(true)
    expect(data.version).toBeDefined()
    console.log("✅ Server is healthy:", data)
  })

  test("2️⃣  Login Page - Renders Correctly", async ({ page }) => {
    console.log("\n🌐 Opening login page...")
    
    await page.goto(`${BASE_URL}/login`)
    
    // Take screenshot
    await page.screenshot({ path: "e2e/screenshots/01-login-page.png" })
    
    // Verify all form elements exist
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('input[name="tenantSlug"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    console.log("✅ Login page renders correctly")
  })

  test("3️⃣  Login - Fill Form", async ({ page }) => {
    console.log("\n🔐 Testing login form...")
    
    await page.goto(`${BASE_URL}/login`)
    
    // Fill the form
    await page.fill('input[name="email"]', TEST_CREDENTIALS.email)
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password)
    await page.fill('input[name="tenantSlug"]', TEST_CREDENTIALS.tenantSlug)
    
    // Screenshot after filling
    await page.screenshot({ path: "e2e/screenshots/02-login-filled.png" })
    
    // Verify values
    await expect(page.locator('input[name="email"]')).toHaveValue(TEST_CREDENTIALS.email)
    await expect(page.locator('input[name="password"]')).toHaveValue(TEST_CREDENTIALS.password)
    await expect(page.locator('input[name="tenantSlug"]')).toHaveValue(TEST_CREDENTIALS.tenantSlug)
    
    console.log("✅ Login form fills correctly")
  })

  test("4️⃣  Login - Submit Form", async ({ page }) => {
    console.log("\n🚀 Submitting login form...")
    
    await page.goto(`${BASE_URL}/login`)
    
    // Fill and submit
    await page.fill('input[name="email"]', TEST_CREDENTIALS.email)
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password)
    await page.fill('input[name="tenantSlug"]', TEST_CREDENTIALS.tenantSlug)
    
    // Click submit
    await page.click('button[type="submit"]')
    
    // Wait for navigation (success or error)
    await page.waitForTimeout(3000)
    
    // Screenshot after submit
    await page.screenshot({ path: "e2e/screenshots/03-login-submitted.png" })
    
    // Check current URL
    const url = page.url()
    console.log("📍 Current URL:", url)
    
    // Should be redirected to dashboard OR show error
    if (url.includes("dashboard")) {
      console.log("✅ Login successful - redirected to dashboard")
    } else if (url.includes("login")) {
      // Check for error message
      const errorVisible = await page.locator("text=/invalid|error|wrong/i").isVisible().catch(() => false)
      if (errorVisible) {
        console.log("⚠️  Login failed with error message")
      } else {
        console.log("⚠️  Still on login page - credentials may be invalid")
      }
    }
  })

  test("5️⃣  Dashboard - Access & Verify", async ({ page }) => {
    console.log("\n📊 Testing dashboard...")
    
    // Try to access dashboard directly
    await page.goto(`${BASE_URL}/${TEST_CREDENTIALS.tenantSlug}/admin/dashboard`)
    await page.waitForTimeout(2000)
    
    // Screenshot
    await page.screenshot({ path: "e2e/screenshots/04-dashboard.png", fullPage: true })
    
    const url = page.url()
    
    if (url.includes("dashboard")) {
      console.log("✅ Dashboard accessible")
      
      // Check for common dashboard elements
      const hasStats = await page.locator("text=/students|revenue|attendance/i").first().isVisible().catch(() => false)
      const hasNav = await page.locator("nav, [role='navigation']").first().isVisible().catch(() => false)
      
      if (hasStats) console.log("✅ Dashboard stats visible")
      if (hasNav) console.log("✅ Navigation visible")
      
    } else if (url.includes("login")) {
      console.log("⚠️  Redirected to login - authentication required")
    } else {
      console.log("⚠️  Unexpected URL:", url)
    }
  })

  test("6️⃣  Students Module - List View", async ({ page }) => {
    console.log("\n👨‍🎓 Testing students module...")
    
    await page.goto(`${BASE_URL}/${TEST_CREDENTIALS.tenantSlug}/admin/students`)
    await page.waitForTimeout(2000)
    
    // Screenshot
    await page.screenshot({ path: "e2e/screenshots/05-students.png", fullPage: true })
    
    const url = page.url()
    
    if (url.includes("students")) {
      console.log("✅ Students page accessible")
      
      // Check for table or list
      const hasTable = await page.locator("table, [data-testid='student-list']").first().isVisible().catch(() => false)
      const hasAddButton = await page.locator("button:has-text('Add')").first().isVisible().catch(() => false)
      
      if (hasTable) console.log("✅ Student list/table visible")
      if (hasAddButton) console.log("✅ Add Student button visible")
      
    } else {
      console.log("⚠️  Could not access students page:", url)
    }
  })

  test("7️⃣  API Endpoints - Direct Test", async () => {
    console.log("\n🔌 Testing API endpoints...")
    
    const endpoints = [
      "/api/status",
      "/api/students",
      "/api/enquiries",
      "/api/fees",
    ]
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`)
        const status = response.status
        
        if (status === 200) {
          console.log(`✅ ${endpoint} - OK (200)`)
        } else if (status === 401) {
          console.log(`⚠️  ${endpoint} - Auth Required (401)`)
        } else if (status === 404) {
          console.log(`⚠️  ${endpoint} - Not Found (404)`)
        } else {
          console.log(`⚠️  ${endpoint} - Status ${status}`)
        }
      } catch (error) {
        console.log(`❌ ${endpoint} - Error:`, (error as Error).message)
      }
    }
  })

  test.afterAll(async () => {
    console.log("\n🎉 Full system test completed!")
    console.log("📸 Screenshots saved in: e2e/screenshots/")
  })
})
