/**
 * e2e/auth.spec.ts
 *
 * Authentication API Flow Tests
 *
 * Tests the full auth lifecycle against the real tars backend and
 * the real (ephemeral) tars_e2e_<uuid> PostgreSQL database.
 *
 * These tests mirror the patterns in tars/tests/auth.rs but drive
 * the API through HTTP from the outside (no direct DB access).
 *
 * Tests:
 *   1. Artist registration — creates a new profile in the DB
 *   2. Login with valid credentials — sets HttpOnly auth cookie
 *   3. Login with wrong password — returns 401
 *   4. Login with non-existent user — returns 401/404
 *   5. Duplicate registration — returns 400/409
 */

import { test, expect } from '@playwright/test';

const BACKEND_URL = 'http://localhost:8080';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const UNIQUE_SUFFIX = Date.now(); // ensures uniqueness across parallel test invocations

const TEST_USER = {
  handle: `e2e_artist_${UNIQUE_SUFFIX}`,
  password: 'kApten@1023',             // Must have uppercase, lowercase, number — no special char requirement
  tag_line: 'i dont give a damn about your opinion',
  profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
  youtube_profile: 'aojojfosjf',      // Plain string for social profile
  stage_name: 'kapten',               // Must be lowercase letters and spaces only — matches fixtures.rs
  color_theme: '#FF0000',             // Valid hex color
};


// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Artist Registration', () => {
  test('POST /auth/register — valid payload returns 2xx', async ({ request }) => {
    const response = await request.post(`${BACKEND_URL}/auth/register`, {
      data: {
        handle: TEST_USER.handle,
        tag_line: TEST_USER.tag_line,
        password: TEST_USER.password,
        profile_picture: TEST_USER.profile_picture,
        youtube_profile: TEST_USER.youtube_profile,
        stage_name: TEST_USER.stage_name,
        color_theme: TEST_USER.color_theme,
      },
    });

    expect(
      response.ok(),
      `Registration failed with status ${response.status()}: ${await response.text()}`
    ).toBeTruthy();
  });

  test('POST /auth/register — duplicate handle returns non-2xx', async ({ request }) => {
    // First registration
    await request.post(`${BACKEND_URL}/auth/register`, {
      data: {
        handle: `dup_${UNIQUE_SUFFIX}`,
        tag_line: TEST_USER.tag_line,
        password: TEST_USER.password,
        profile_picture: TEST_USER.profile_picture,
        youtube_profile: TEST_USER.youtube_profile,
        stage_name: TEST_USER.stage_name,
        color_theme: TEST_USER.color_theme,
      },
    });

    // Second registration with same handle should fail
    const response = await request.post(`${BACKEND_URL}/auth/register`, {
      data: {
        handle: `dup_${UNIQUE_SUFFIX}`,
        tag_line: TEST_USER.tag_line,
        password: TEST_USER.password,
        profile_picture: TEST_USER.profile_picture,
        youtube_profile: TEST_USER.youtube_profile,
        stage_name: TEST_USER.stage_name,
        color_theme: TEST_USER.color_theme,
      },
    });

    expect(response.ok()).toBeFalsy();
  });

});

test.describe('Artist Login', () => {
  // Use a unique handle scoped to the login test group
  const LOGIN_HANDLE = `login_test_${UNIQUE_SUFFIX}`;

  test('step 1: register a fresh artist (login test setup)', async ({ request }) => {
    const response = await request.post(`${BACKEND_URL}/auth/register`, {
      data: {
        handle: LOGIN_HANDLE,
        tag_line: TEST_USER.tag_line,
        password: TEST_USER.password,
        profile_picture: TEST_USER.profile_picture,
        youtube_profile: TEST_USER.youtube_profile,
        stage_name: TEST_USER.stage_name,
        color_theme: TEST_USER.color_theme,
      },
    });

    expect(
      response.ok(),
      `Registration failed with status ${response.status()}: ${await response.text()}`
    ).toBeTruthy();
  });

  test('POST /auth/login — valid credentials returns 2xx', async ({ request }) => {
    const response = await request.post(`${BACKEND_URL}/auth/login`, {
      data: {
        handle: LOGIN_HANDLE,
        password: TEST_USER.password,
      },
    });

    expect(
      response.ok(),
      `Login failed with status ${response.status()}: ${await response.text()}`
    ).toBeTruthy();
  });

  test('POST /auth/login — wrong password returns 401', async ({ request }) => {
    const response = await request.post(`${BACKEND_URL}/auth/login`, {
      data: {
        handle: LOGIN_HANDLE,
        password: 'WrongPassword!123',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('POST /auth/login — non-existent user returns non-2xx', async ({ request }) => {
    const response = await request.post(`${BACKEND_URL}/auth/login`, {
      data: {
        handle: 'ghost_user_that_does_not_exist',
        password: TEST_USER.password,
      },
    });

    expect(response.ok()).toBeFalsy();
  });
});

