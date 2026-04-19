import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

test.describe('OmniCampus Smoke Suite', () => {
  
  test('Critical Path: Login & Dashboard Access', async ({ page }) => {
    // 1. Navigate to Login
    await page.goto(`${BASE_URL}/login`);
    await expect(page).toHaveTitle(/OmniCampus/);

    // 2. Enter Tenant Slug
    await page.fill('input[name="tenantSlug"]', 'delhi-public');
    await page.click('button:has-text("Continue")');

    // 3. Enter Credentials (from Seed)
    await page.fill('input[name="email"]', 'admin@delhi-public.edu.in');
    await page.fill('input[name="password"]', 'OmniCampus@123');
    await page.click('button:has-text("Access Dashboard")');

    // 4. Verify Dashboard Landing
    await expect(page).toHaveURL(/.*\/delhi-public\/admin\/dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('Module Navigation: Student Management', async ({ page }) => {
    // Login first (or use storageState in a full suite)
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="tenantSlug"]', 'delhi-public');
    await page.click('button:has-text("Continue")');
    await page.fill('input[name="email"]', 'admin@delhi-public.edu.in');
    await page.fill('input[name="password"]', 'OmniCampus@123');
    await page.click('button:has-text("Access Dashboard")');

    // Navigate to Students
    await page.click('a:has-text("Students")');
    await expect(page).toHaveURL(/.*\/students/);
    await expect(page.locator('h2')).toContainText('Student Directory');
  });

});
