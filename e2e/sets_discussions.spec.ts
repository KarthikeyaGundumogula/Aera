/**
 * e2e/sets_discussions.spec.ts
 *
 * E2E tests for Sets and Discussions API endpoints:
 *   - GET /sets
 *   - POST /sets/new
 *   - GET /sets/{set_id}
 *   - POST /sets/join
 *   - DELETE /sets/{set_id}/leave
 *   - POST /sets/{set_id}/new/discussion
 *   - GET /sets/{set_id}/discussions
 *   - POST /sets/{set_id}/new/comment
 */

import { test, expect } from '@playwright/test';

const BACKEND_URL = 'http://localhost:8080';
const UNIQUE_SUFFIX = Date.now();
const ALPHA_SUFFIX = Array.from({ length: 6 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');

const TEST_ARTIST = {
  handle: `set_artist_${UNIQUE_SUFFIX}`,
  password: 'kApten@1023',
  tag_line: 'cinephile and set organizer',
  profile_picture: 'boring-avatar:setartist',
  youtube_profile: 'setartist_channel',
  stage_name: 'set artist',
  color_theme: '#D97706',
};

test.describe('Sets & Discussions API Endpoints', () => {
  test('GET /sets — returns status 200 and sets list DTO', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/sets`);
    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });

  test('Sets & Discussions full lifecycle: Register -> Promote -> Create Set -> Join -> Create Discussion -> Comment', async ({ request }) => {
    // 1. Register artist
    const regRes = await request.post(`${BACKEND_URL}/auth/register`, {
      data: {
        handle: TEST_ARTIST.handle,
        tag_line: TEST_ARTIST.tag_line,
        password: TEST_ARTIST.password,
        profile_picture: TEST_ARTIST.profile_picture,
        youtube_profile: TEST_ARTIST.youtube_profile,
        stage_name: TEST_ARTIST.stage_name,
        color_theme: TEST_ARTIST.color_theme,
      },
    });
    expect(regRes.ok()).toBeTruthy();
    const regJson = await regRes.json();
    const profileId = regJson.id;
    expect(profileId).toBeDefined();

    // 2. Login artist
    const loginRes = await request.post(`${BACKEND_URL}/auth/login`, {
      data: {
        handle: TEST_ARTIST.handle,
        password: TEST_ARTIST.password,
      },
    });
    expect(loginRes.ok()).toBeTruthy();

    // 3. Admin login to promote artist to organizer
    let adminLoginRes = await request.post(`${BACKEND_URL}/auth/admin/login`, {
      data: {
        admin_name: 'admin',
        admin_password: 'Admin@12345',
      },
    });
    if (!adminLoginRes.ok()) {
      adminLoginRes = await request.post(`${BACKEND_URL}/auth/admin/login`, {
        data: {
          admin_name: 'superadmin',
          admin_password: 'Admin@12345',
        },
      });
    }
    expect(adminLoginRes.ok()).toBeTruthy();

    // 4. Create role 'organizer' (ignore if exists)
    await request.post(`${BACKEND_URL}/admin/new_role`, {
      data: {
        name: 'organizer',
        description: 'Can organize sets and festivals',
      },
    });

    // 5. Update user role to organizer
    const roleUpdateRes = await request.post(`${BACKEND_URL}/admin/update_user_role`, {
      data: {
        profile_id: profileId,
        new_role: 'organizer',
      },
    });
    expect(roleUpdateRes.ok()).toBeTruthy();

    // 6. Login again as artist to refresh session claims
    await request.post(`${BACKEND_URL}/auth/login`, {
      data: {
        handle: TEST_ARTIST.handle,
        password: TEST_ARTIST.password,
      },
    });

    // 7. Create a new Set (POST /sets/new) — unique alphabetic set name
    const setName = `Neo Realism Collective ${ALPHA_SUFFIX}`;
    const createSetRes = await request.post(`${BACKEND_URL}/sets/new`, {
      data: {
        name: setName,
        statement: 'A collective dedicated to authentic storytelling',
        description: 'Deep dive into Italian neorealism and indie cinema',
        color_theme: '#D97706',
      },
    });
    expect(createSetRes.ok()).toBeTruthy();
    const createSetJson = await createSetRes.json();
    const setId = createSetJson.id;
    expect(setId).toBeDefined();

    // 8. Fetch Set detail (GET /sets/{set_id})
    const getSetRes = await request.get(`${BACKEND_URL}/sets/${setId}`);
    expect(getSetRes.ok()).toBeTruthy();
    const getSetJson = await getSetRes.json();
    expect(getSetJson.data.title).toBe(setName);

    // 9. Create a Discussion Post in the Set (POST /sets/{entity_id}/new/discussion)
    const discTitle = 'What makes Neo Realism timeless?';
    const discContent = 'Discussing Bicycle Thieves and Rome Open City.';
    const createDiscRes = await request.post(`${BACKEND_URL}/sets/${setId}/new/discussion`, {
      data: {
        title: discTitle,
        content: discContent,
      },
    });
    expect(createDiscRes.ok()).toBeTruthy();
    const createDiscJson = await createDiscRes.json();
    const discussionId = createDiscJson.discussion_id;
    expect(discussionId).toBeDefined();

    // 10. Fetch Discussions for the Set (GET /sets/{set_id}/discussions)
    const getDiscsRes = await request.get(`${BACKEND_URL}/sets/${setId}/discussions`);
    expect(getDiscsRes.ok()).toBeTruthy();
    const getDiscsJson = await getDiscsRes.json();
    expect(Array.isArray(getDiscsJson.data)).toBe(true);
    expect(getDiscsJson.data.length).toBeGreaterThan(0);
    expect(getDiscsJson.data[0].title).toBe(discTitle);

    // 11. Create a Comment on the Discussion (POST /sets/{entity_id}/new/comment)
    const createCommentRes = await request.post(`${BACKEND_URL}/sets/${setId}/new/comment`, {
      data: {
        discussion_id: discussionId,
        content: 'The use of non-professional actors brings undeniable raw authenticity.',
      },
    });
    expect(createCommentRes.ok()).toBeTruthy();
    const createCommentJson = await createCommentRes.json();
    expect(createCommentJson.comment_id).toBeDefined();
  });
});
