# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-system-test.spec.ts >> 🔥 OmniCampus ERP - Full System Test >> 2️⃣  Login Page - Renders Correctly
- Location: e2e\full-system-test.spec.ts:62:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[name="email"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('input[name="email"]')

```

# Test source

```ts
  1   | /**
  2   |  * Full System E2E Test Suite
  3   |  * ─────────────────────────────
  4   |  * Automated browser testing for OmniCampus ERP
  5   |  * Run with: npx playwright test e2e/full-system-test.spec.ts --headed
  6   |  */
  7   | 
  8   | import { test, expect, chromium } from "@playwright/test"
  9   | import { execSync } from "child_process"
  10  | 
  11  | // Configuration
  12  | const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000"
  13  | const TEST_CREDENTIALS = {
  14  |   email: "admin@demo.com",
  15  |   password: "admin123",
  16  |   tenantSlug: "demo-school"
  17  | }
  18  | 
  19  | // Helper: Check if server is running
  20  | async function isServerRunning(): Promise<boolean> {
  21  |   try {
  22  |     const response = await fetch(`${BASE_URL}/api/status`)
  23  |     const data = await response.json()
  24  |     return data.status === "healthy"
  25  |   } catch {
  26  |     return false
  27  |   }
  28  | }
  29  | 
  30  | test.describe("🔥 OmniCampus ERP - Full System Test", () => {
  31  |   
  32  |   test.beforeAll(async () => {
  33  |     // Verify server is running
  34  |     const serverRunning = await isServerRunning()
  35  |     if (!serverRunning) {
  36  |       console.log("⚠️  Server not detected. Starting dev server...")
  37  |       try {
  38  |         // Try to start server in background
  39  |         execSync("npm run dev", { 
  40  |           cwd: process.cwd(),
  41  |           stdio: "ignore",
  42  |           detached: true
  43  |         })
  44  |         // Wait for server to start
  45  |         await new Promise(resolve => setTimeout(resolve, 5000))
  46  |       } catch {
  47  |         console.log("⚠️  Could not auto-start server. Please run 'npm run dev' manually.")
  48  |       }
  49  |     }
  50  |   })
  51  | 
  52  |   test("1️⃣  Application Health Check", async () => {
  53  |     const response = await fetch(`${BASE_URL}/api/status`)
  54  |     const data = await response.json()
  55  |     
  56  |     expect(data.status).toBe("healthy")
  57  |     expect(data.database).toBe(true)
  58  |     expect(data.version).toBeDefined()
  59  |     console.log("✅ Server is healthy:", data)
  60  |   })
  61  | 
  62  |   test("2️⃣  Login Page - Renders Correctly", async ({ page }) => {
  63  |     console.log("\n🌐 Opening login page...")
  64  |     
  65  |     await page.goto(`${BASE_URL}/login`)
  66  |     
  67  |     // Take screenshot
  68  |     await page.screenshot({ path: "e2e/screenshots/01-login-page.png" })
  69  |     
  70  |     // Verify all form elements exist
> 71  |     await expect(page.locator('input[name="email"]')).toBeVisible()
      |                                                       ^ Error: expect(locator).toBeVisible() failed
  72  |     await expect(page.locator('input[name="password"]')).toBeVisible()
  73  |     await expect(page.locator('input[name="tenantSlug"]')).toBeVisible()
  74  |     await expect(page.locator('button[type="submit"]')).toBeVisible()
  75  |     
  76  |     console.log("✅ Login page renders correctly")
  77  |   })
  78  | 
  79  |   test("3️⃣  Login - Fill Form", async ({ page }) => {
  80  |     console.log("\n🔐 Testing login form...")
  81  |     
  82  |     await page.goto(`${BASE_URL}/login`)
  83  |     
  84  |     // Fill the form
  85  |     await page.fill('input[name="email"]', TEST_CREDENTIALS.email)
  86  |     await page.fill('input[name="password"]', TEST_CREDENTIALS.password)
  87  |     await page.fill('input[name="tenantSlug"]', TEST_CREDENTIALS.tenantSlug)
  88  |     
  89  |     // Screenshot after filling
  90  |     await page.screenshot({ path: "e2e/screenshots/02-login-filled.png" })
  91  |     
  92  |     // Verify values
  93  |     await expect(page.locator('input[name="email"]')).toHaveValue(TEST_CREDENTIALS.email)
  94  |     await expect(page.locator('input[name="password"]')).toHaveValue(TEST_CREDENTIALS.password)
  95  |     await expect(page.locator('input[name="tenantSlug"]')).toHaveValue(TEST_CREDENTIALS.tenantSlug)
  96  |     
  97  |     console.log("✅ Login form fills correctly")
  98  |   })
  99  | 
  100 |   test("4️⃣  Login - Submit Form", async ({ page }) => {
  101 |     console.log("\n🚀 Submitting login form...")
  102 |     
  103 |     await page.goto(`${BASE_URL}/login`)
  104 |     
  105 |     // Fill and submit
  106 |     await page.fill('input[name="email"]', TEST_CREDENTIALS.email)
  107 |     await page.fill('input[name="password"]', TEST_CREDENTIALS.password)
  108 |     await page.fill('input[name="tenantSlug"]', TEST_CREDENTIALS.tenantSlug)
  109 |     
  110 |     // Click submit
  111 |     await page.click('button[type="submit"]')
  112 |     
  113 |     // Wait for navigation (success or error)
  114 |     await page.waitForTimeout(3000)
  115 |     
  116 |     // Screenshot after submit
  117 |     await page.screenshot({ path: "e2e/screenshots/03-login-submitted.png" })
  118 |     
  119 |     // Check current URL
  120 |     const url = page.url()
  121 |     console.log("📍 Current URL:", url)
  122 |     
  123 |     // Should be redirected to dashboard OR show error
  124 |     if (url.includes("dashboard")) {
  125 |       console.log("✅ Login successful - redirected to dashboard")
  126 |     } else if (url.includes("login")) {
  127 |       // Check for error message
  128 |       const errorVisible = await page.locator("text=/invalid|error|wrong/i").isVisible().catch(() => false)
  129 |       if (errorVisible) {
  130 |         console.log("⚠️  Login failed with error message")
  131 |       } else {
  132 |         console.log("⚠️  Still on login page - credentials may be invalid")
  133 |       }
  134 |     }
  135 |   })
  136 | 
  137 |   test("5️⃣  Dashboard - Access & Verify", async ({ page }) => {
  138 |     console.log("\n📊 Testing dashboard...")
  139 |     
  140 |     // Try to access dashboard directly
  141 |     await page.goto(`${BASE_URL}/${TEST_CREDENTIALS.tenantSlug}/admin/dashboard`)
  142 |     await page.waitForTimeout(2000)
  143 |     
  144 |     // Screenshot
  145 |     await page.screenshot({ path: "e2e/screenshots/04-dashboard.png", fullPage: true })
  146 |     
  147 |     const url = page.url()
  148 |     
  149 |     if (url.includes("dashboard")) {
  150 |       console.log("✅ Dashboard accessible")
  151 |       
  152 |       // Check for common dashboard elements
  153 |       const hasStats = await page.locator("text=/students|revenue|attendance/i").first().isVisible().catch(() => false)
  154 |       const hasNav = await page.locator("nav, [role='navigation']").first().isVisible().catch(() => false)
  155 |       
  156 |       if (hasStats) console.log("✅ Dashboard stats visible")
  157 |       if (hasNav) console.log("✅ Navigation visible")
  158 |       
  159 |     } else if (url.includes("login")) {
  160 |       console.log("⚠️  Redirected to login - authentication required")
  161 |     } else {
  162 |       console.log("⚠️  Unexpected URL:", url)
  163 |     }
  164 |   })
  165 | 
  166 |   test("6️⃣  Students Module - List View", async ({ page }) => {
  167 |     console.log("\n👨‍🎓 Testing students module...")
  168 |     
  169 |     await page.goto(`${BASE_URL}/${TEST_CREDENTIALS.tenantSlug}/admin/students`)
  170 |     await page.waitForTimeout(2000)
  171 |     
```