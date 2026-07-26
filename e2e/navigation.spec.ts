/**
 * e2e/navigation.spec.ts
 *
 * UI Navigation Smoke Tests
 *
 * These tests drive the Aera React frontend in a real browser (Chromium)
 * against the E2E backend. They verify the app loads, renders correctly,
 * and navigates between key routes without crashing.
 *
 * Tests:
 *   1. Home page (Hall) loads and renders
 *   2. Login page is accessible
 *   3. Sets page loads
 *   4. 404 fallback renders for unknown routes
 */

import { test, expect } from '@playwright/test';

test.describe('UI Navigation Smoke Tests', () => {
  test('Hall page (/) loads and shows content', async ({ page }) => {
    await page.goto('/');

    // Page should not crash (no error boundary fallback shown)
    await expect(page.locator('text=Scene not found')).not.toBeVisible();

    // Page should have a title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('Login page (/profile/login) loads', async ({ page }) => {
    await page.goto('/profile/login');

    // Should render without error — the "Loading Scene" fallback should disappear
    await expect(page.locator('text=Loading Scene')).not.toBeVisible({ timeout: 5000 });
  });

  test('Sets page (/sets) loads', async ({ page }) => {
    await page.goto('/sets');

    await expect(page.locator('text=Loading Scene')).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Scene not found')).not.toBeVisible();
  });

  test('Command Center (ProfileNav) shows Create Profile and Sign In when logged out', async ({ page }) => {
    await page.goto('/');

    // Click the Command Center (ProfileNav) button
    const profileBtn = page.getByRole('button', { name: 'Command Center' });
    await expect(profileBtn).toBeVisible();
    await profileBtn.click();

    // Verify Create Profile and Sign In options appear in the dropdown
    await expect(page.locator('text=Create Profile')).toBeVisible();
    await expect(page.locator('text=Sign In')).toBeVisible();
  });
});
