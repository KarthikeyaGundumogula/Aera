/**
 * e2e/upload.spec.ts
 *
 * E2E tests for all work upload flows:
 *   - Standard upload: POST /works/new/{work_type}
 *   - Set upload: POST /sets/{set_id}/new/work/{work_type}
 *   - Festival panelist upload: POST /festivals/{festival_id}/panelist/new/{work_type}
 *   - Festival member upload: POST /festivals/{festival_id}/member/new/{work_type}
 */

import { test, expect } from '@playwright/test';

const BACKEND_URL = 'http://localhost:8080';
const UNIQUE_SUFFIX = Date.now();
const ALPHA_SUFFIX = Array.from({ length: 6 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');

const TEST_UPLOADER = {
  handle: `uploader_${UNIQUE_SUFFIX}`,
  password: 'kApten@1023',
  tag_line: 'director and content creator',
  profile_picture: 'boring-avatar:uploader',
  youtube_profile: 'uploader_channel',
  stage_name: 'uploader artist',
  color_theme: '#D97706',
};

const TEST_PANELIST = {
  handle: `panelist_${UNIQUE_SUFFIX}`,
  password: 'kApten@1023',
  tag_line: 'expert critic',
  profile_picture: 'boring-avatar:panelist',
  youtube_profile: 'panelist_channel',
  stage_name: 'panelist artist',
  color_theme: '#3B82F6',
};

test.describe('Work Upload Flow Integration Tests', () => {
  test('Full Upload Lifecycle: Standard, Set-Specific, Festival Panelist, and Festival Member Uploads', async ({ request }) => {
    // 1. Register and login uploader
    const regUploaderRes = await request.post(`${BACKEND_URL}/auth/register`, {
      data: TEST_UPLOADER,
    });
    expect(regUploaderRes.ok()).toBeTruthy();
    const uploaderJson = await regUploaderRes.json();
    const uploaderId = uploaderJson.id;
    expect(uploaderId).toBeDefined();

    const loginUploaderRes = await request.post(`${BACKEND_URL}/auth/login`, {
      data: {
        handle: TEST_UPLOADER.handle,
        password: TEST_UPLOADER.password,
      },
    });
    expect(loginUploaderRes.ok()).toBeTruthy();

    // 2. Register panelist
    const regPanelistRes = await request.post(`${BACKEND_URL}/auth/register`, {
      data: TEST_PANELIST,
    });
    expect(regPanelistRes.ok()).toBeTruthy();
    const panelistJson = await regPanelistRes.json();
    const panelistId = panelistJson.id;
    expect(panelistId).toBeDefined();

    // 3. Admin login to promote uploader to organizer
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

    // Ensure role 'organizer' exists and assign to uploader
    await request.post(`${BACKEND_URL}/admin/new_role`, {
      data: {
        name: 'organizer',
        description: 'Can organize sets and festivals',
      },
    });

    const roleUpdateRes = await request.post(`${BACKEND_URL}/admin/update_user_role`, {
      data: {
        profile_id: uploaderId,
        new_role: 'organizer',
      },
    });
    expect(roleUpdateRes.ok()).toBeTruthy();

    // 4. Log back in as uploader to refresh claims
    const reloginUploaderRes = await request.post(`${BACKEND_URL}/auth/login`, {
      data: {
        handle: TEST_UPLOADER.handle,
        password: TEST_UPLOADER.password,
      },
    });
    expect(reloginUploaderRes.ok()).toBeTruthy();

    // ─── Test 1: Standard Upload (POST /works/new/EDIT) ───
    const editPayload = {
      title: 'Timeless Motion',
      work_type: 'EDIT',
      src_id: 'GG1_DsScm6U',
      platform: 'YOUTUBE',
      format: 'IMAX',
    };

    const stdUploadRes = await request.post(`${BACKEND_URL}/works/new/EDIT`, {
      data: editPayload,
    });
    expect(stdUploadRes.ok()).toBeTruthy();
    const stdUploadJson = await stdUploadRes.json();
    expect(stdUploadJson.id).toBeDefined();

    // 5. Create a Set
    const setName = `Film School Collective ${ALPHA_SUFFIX}`;
    const createSetRes = await request.post(`${BACKEND_URL}/sets/new`, {
      data: {
        name: setName,
        statement: 'Analyzing film craft and editing style',
        description: 'Practical film production and analysis',
        color_theme: '#D97706',
      },
    });
    expect(createSetRes.ok()).toBeTruthy();
    const createSetJson = await createSetRes.json();
    const setId = createSetJson.id;
    expect(setId).toBeDefined();

    // ─── Test 2: Set-Specific Upload (POST /sets/{set_id}/new/work/EDIT) ───
    const setUploadRes = await request.post(`${BACKEND_URL}/sets/${setId}/new/work/EDIT`, {
      data: editPayload,
    });
    expect(setUploadRes.ok()).toBeTruthy();
    const setUploadJson = await setUploadRes.json();
    expect(setUploadJson.id || setUploadJson.workId || setUploadJson.work_id).toBeDefined();

    // 6. Create a Festival (under the Set, listing TEST_PANELIST as a panelist)
    const festName = `Visual Vision Film Festival ${ALPHA_SUFFIX}`;
    // Festival start_date must be <= now, end_date must be >= now for it to be active
    const now = new Date();
    const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(); // 1 day ago
    const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // 1 day from now

    const createFestRes = await request.post(`${BACKEND_URL}/sets/${setId}/new_festival`, {
      data: {
        name: festName,
        description: 'Immersive screen arts and vision',
        rules: '1. No plagiarism',
        set_id: setId,
        start_date: startDate,
        end_date: endDate,
        panelists: [panelistId],
      },
    });
    expect(createFestRes.ok()).toBeTruthy();
    const createFestJson = await createFestRes.json();
    const festivalId = createFestJson.id;
    expect(festivalId).toBeDefined();

    // ─── Test 3: Festival Panelist Upload (POST /festivals/{festival_id}/panelist/new/EDIT) ───
    // Log in as panelist first
    const loginPanelistRes = await request.post(`${BACKEND_URL}/auth/login`, {
      data: {
        handle: TEST_PANELIST.handle,
        password: TEST_PANELIST.password,
      },
    });
    expect(loginPanelistRes.ok()).toBeTruthy();

    const panelistUploadRes = await request.post(
      `${BACKEND_URL}/festivals/${festivalId}/panelist/new/EDIT`,
      {
        data: editPayload,
      }
    );
    expect(panelistUploadRes.ok()).toBeTruthy();
    const panelistUploadJson = await panelistUploadRes.json();
    expect(panelistUploadJson.id).toBeDefined();

    // ─── Test 4: Festival Member Upload (POST /festivals/{festival_id}/member/new/EDIT) ───
    // Log back in as uploader (who is the set owner, therefore a member of the set)
    const reloginUploaderRes2 = await request.post(`${BACKEND_URL}/auth/login`, {
      data: {
        handle: TEST_UPLOADER.handle,
        password: TEST_UPLOADER.password,
      },
    });
    expect(reloginUploaderRes2.ok()).toBeTruthy();

    const memberUploadRes = await request.post(
      `${BACKEND_URL}/festivals/${festivalId}/member/new/EDIT`,
      {
        data: editPayload,
      }
    );
    expect(memberUploadRes.ok()).toBeTruthy();
    const memberUploadJson = await memberUploadRes.json();
    expect(memberUploadJson.id || memberUploadJson.workId || memberUploadJson.work_id).toBeDefined();
  });
});
