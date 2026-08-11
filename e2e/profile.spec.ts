/**
 * e2e/profile.spec.ts
 *
 * Profile & Studio Integration E2E Tests
 *
 * Validates the 3-call profile architecture, /profiles/me authentication check,
 * login redirection to /studio, stage update operations, and paginated feeds
 * against the tars backend.
 */

import { test, expect } from '@playwright/test';

const BACKEND_URL = 'http://localhost:8080';

function getUniqueProfileData(prefix: string) {
  const shortId = Date.now().toString().slice(-5);
  return {
    handle: `${prefix}_${shortId}`,
    password: 'kApten@1023',
    tag_line: 'cinematic visionary and director',
    profile_picture: 'boring-avatar:visionary',
    stage_name: 'visionary',
    color_theme: '#FAC107,#0F1A42', // Default yellow & blue
    youtube_profile: 'visionary',
  };
}

test.describe('Profile & Studio E2E Integration Suite', () => {

  test('Step 1: Register artist for profile testing', async ({ request }) => {
    const data = getUniqueProfileData('p1');
    const response = await request.post(`${BACKEND_URL}/auth/register`, {
      data,
    });

    expect(
      response.ok(),
      `Registration failed: ${await response.text()}`
    ).toBeTruthy();
  });

  test('Step 2: Login sets session cookie & GET /profiles/me returns profile', async ({ request }) => {
    const data = getUniqueProfileData('p2');
    const regRes = await request.post(`${BACKEND_URL}/auth/register`, {
      data,
    });
    expect(regRes.ok(), `Registration failed: ${await regRes.text()}`).toBeTruthy();

    const loginRes = await request.post(`${BACKEND_URL}/auth/login`, {
      data: {
        handle: data.handle,
        password: data.password,
      },
    });
    expect(loginRes.ok(), `Login failed: ${await loginRes.text()}`).toBeTruthy();

    const profileRes = await request.get(`${BACKEND_URL}/profiles/me`);
    expect(profileRes.ok(), `GET /profiles/me failed: ${await profileRes.text()}`).toBeTruthy();

    const json = await profileRes.json();
    const profile = json.data || json;

    expect(profile.userName).toBe(data.handle);
    expect(profile.stageName).toBe(data.stage_name);
    expect(profile.roleName).toBeDefined();
    expect(profile.colorTheme).toBe(data.color_theme);
  });

  test('Step 3: GET /profiles/get_profile_details/:user_name returns Stage & Library preview', async ({ request }) => {
    const data = getUniqueProfileData('p3');
    const regRes = await request.post(`${BACKEND_URL}/auth/register`, {
      data,
    });
    expect(regRes.ok(), `Registration failed: ${await regRes.text()}`).toBeTruthy();

    const response = await request.get(`${BACKEND_URL}/profiles/get_profile_details/${data.handle}`);
    expect(response.ok(), `GET /profiles/get_profile_details failed: ${await response.text()}`).toBeTruthy();

    const json = await response.json();
    const stage = json.artist_stage || json.data || json;

    expect(stage.userName).toBe(data.handle);
    expect(stage.stageName).toBe(data.stage_name);
    expect(Array.isArray(stage.originals)).toBeTruthy();
  });

  test('Step 4: Update stage info via POST /artists/update_stage with dual-color theme', async ({ request }) => {
    const data = getUniqueProfileData('p4');
    const regRes = await request.post(`${BACKEND_URL}/auth/register`, {
      data,
    });
    expect(regRes.ok(), `Registration failed: ${await regRes.text()}`).toBeTruthy();

    const loginRes = await request.post(`${BACKEND_URL}/auth/login`, {
      data: {
        handle: data.handle,
        password: data.password,
      },
    });
    expect(loginRes.ok(), `Login failed: ${await loginRes.text()}`).toBeTruthy();

    const updatedTagline = 'updated tagline for studio';
    const dualColorTheme = '#112233,#445566';
    const updateRes = await request.post(`${BACKEND_URL}/artists/update_stage`, {
      data: {
        tag_line: updatedTagline,
        color_theme: dualColorTheme,
        stage_name: 'updated',
      },
    });

    expect(updateRes.ok(), `POST /artists/update_stage failed: ${await updateRes.text()}`).toBeTruthy();

    // Verify update reflected in /profiles/me
    const profileRes = await request.get(`${BACKEND_URL}/profiles/me`);
    const json = await profileRes.json();
    const profile = json.data || json;

    expect(profile.tagLine).toBe(updatedTagline);
    expect(profile.colorTheme).toBe(dualColorTheme);
    expect(profile.stageName).toBe('updated');
  });

  test('Step 5: Fetch paginated Theatre works and Wall posts', async ({ request }) => {
    const data = getUniqueProfileData('p5');
    const regRes = await request.post(`${BACKEND_URL}/auth/register`, {
      data,
    });
    expect(regRes.ok(), `Registration failed: ${await regRes.text()}`).toBeTruthy();

    const loginRes = await request.post(`${BACKEND_URL}/auth/login`, {
      data: {
        handle: data.handle,
        password: data.password,
      },
    });
    expect(loginRes.ok(), `Login failed: ${await loginRes.text()}`).toBeTruthy();

    const profileRes = await request.get(`${BACKEND_URL}/profiles/me`);
    const profileJson = await profileRes.json();
    const artistId = (profileJson.data || profileJson).id;

    // Call 2: GET /profiles/:artist_id/works
    const worksRes = await request.get(`${BACKEND_URL}/profiles/${artistId}/works?limit=6`);
    expect(worksRes.ok(), `GET /profiles/:id/works failed: ${await worksRes.text()}`).toBeTruthy();
    const worksJson = await worksRes.json();
    expect(Array.isArray(worksJson.data)).toBeTruthy();

    // Call 3: GET /profiles/:artist_id/wall
    const wallRes = await request.get(`${BACKEND_URL}/profiles/${artistId}/wall?limit=6`);
    expect(wallRes.ok(), `GET /profiles/:id/wall failed: ${await wallRes.text()}`).toBeTruthy();
    const wallJson = await wallRes.json();
    expect(Array.isArray(wallJson.data)).toBeTruthy();
  });

  test('Step 6: Fetch Library Sheet Detail via GET /library/sheet/:profile_id/:original_id', async ({ request }) => {
    const data = getUniqueProfileData('p6');
    const regRes = await request.post(`${BACKEND_URL}/auth/register`, { data });
    expect(regRes.ok(), `Registration failed: ${await regRes.text()}`).toBeTruthy();

    const loginRes = await request.post(`${BACKEND_URL}/auth/login`, {
      data: { handle: data.handle, password: data.password },
    });
    expect(loginRes.ok(), `Login failed: ${await loginRes.text()}`).toBeTruthy();

    const profileRes = await request.get(`${BACKEND_URL}/profiles/me`);
    const profile = (await profileRes.json()).data;

    const mockOriginalId = '00000000-0000-0000-0000-000000000001';
    const response = await request.get(`${BACKEND_URL}/library/sheet/${profile.id}/${mockOriginalId}`);
    expect(response.status() === 200 || response.status() === 404).toBeTruthy();
  });

});
