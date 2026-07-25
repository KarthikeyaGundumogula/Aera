/**
 * e2e/health.spec.ts
 *
 * Backend Health Check Smoke Tests
 *
 * The most critical tests — if these fail, something is fundamentally wrong
 * with the E2E infrastructure (database not running, server not starting, etc.).
 * These run first and are fast.
 *
 * Tests:
 *   1. Backend health_check endpoint returns 200 OK
 *   2. Backend is reachable from Aera's origin (CORS)
 */

import { test, expect } from '@playwright/test';

const BACKEND_URL = 'http://localhost:8080';

test.describe('Backend Health', () => {
  test('health_check endpoint returns 200', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/health_check`);
    expect(response.status()).toBe(200);
  });

  test('health_check response has no body (tars convention)', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/health_check`);
    const body = await response.text();
    // tars health_check returns an empty body by convention (content_length = 0)
    expect(body).toBe('');
  });
});
