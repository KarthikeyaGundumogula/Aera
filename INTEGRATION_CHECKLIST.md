# 📋 TARS API Integration & Progress Checklist

> **Workspace**: `Aera` (Frontend) & `tars` (Rust Backend)  
> **Last Updated**: July 28, 2026  
> **Status Overview**: 15 Endpoints Fully Integrated & Verified with E2E Test Suite (100% Pass)

---

## 🔍 1. Required Read / Getter Endpoints (`GET`)

### A. System & Health
- [x] `GET /health_check` — Backend Health Check  
  - **Status**: ✅ Implemented in `tars` & Verified via E2E (`e2e/health.spec.ts`)

### B. Profiles & Artist Stages (`/profiles`)
- [x] `GET /profiles/get_profile_details/{user_name}` — Fetch Artist Stage Details, Branding & Top Works  
  - **Status**: ✅ Implemented in `tars` (`src/routes/profiles.rs`) & Integrated in `Aera` (`src/features/profile/StudioPage.tsx`)
- [ ] `GET /profiles/me` — Fetch Active Authenticated Profile Details & Assigned Role  
  - **Status**: ⏳ Needed for Backend Role Sync
- [ ] `GET /profiles/all` — Fetch Artist Profiles Directory (Foyer / Profiles Directory)  
  - **Status**: ⏳ Needed for Directory Grid

### C. Originals Registry (`/originals`)
- [ ] `GET /originals` — List All Originals Titles (Theatre & Hall feed)  
  - **Status**: ⏳ Needed for Originals Feed
- [ ] `GET /originals/{original_id}` — Fetch Single Original Details, Stars, Makers & Stats  
  - **Status**: ⏳ Needed for Original View Page
- [ ] `GET /originals/{original_id}/releases` — Fetch Original Release History & Asset Binaries  
  - **Status**: ⏳ Needed for Release Player

### D. Sets & Community Hubs (`/sets`)
- [ ] `GET /sets` — List All Set Communities (Set Registry `/sets`)  
  - **Status**: ⏳ Needed for Sets Grid Feed
- [ ] `GET /sets/{set_id}` — Fetch Single Set Details, Curator, Active Festival & Members  
  - **Status**: ⏳ Needed for Set Detail View
- [ ] `GET /sets/{set_id}/discussions` — Fetch Discussion Posts & Comments for a Set  
  - **Status**: ⏳ Needed for Set Wall & Discussions

### E. Festivals & Challenges (`/festivals`)
- [ ] `GET /festivals` — List Active & Upcoming Festivals (Festival Stage Snap Scroller)  
  - **Status**: ⏳ Needed for Festival Stage
- [ ] `GET /festivals/{festival_id}` — Fetch Single Festival Details, Rules, Prizes & Submissions  
  - **Status**: ⏳ Needed for Festival Detail Page

### F. Works & Media (`/works`)
- [ ] `GET /works` — List All Works (Theatre Grid)  
  - **Status**: ⏳ Needed for Theatre Grid
- [ ] `GET /works/{work_id}` — Fetch Single Work Details, Author, Stars & Reactions  
  - **Status**: ⏳ Needed for Work Modal / Page

### G. Cinematic Library (`/library`)
- [ ] `GET /library` — Fetch Cinematic Library Entries & Surge Scores  
  - **Status**: ⏳ Needed for Ledger / Library Page
- [ ] `GET /library/recommendations` — Fetch Community Recommendations  
  - **Status**: ⏳ Needed for Recommendation Feed

### H. System Admin & RBAC (`/admin`)
- [ ] `GET /admin/admins` — List System Admin Accounts (`admins` table)  
  - **Status**: ⏳ Needed for Admin Account List View
- [ ] `GET /admin/roles` — List System Roles & Permissions Matrix  
  - **Status**: ⏳ Needed for RBAC Role Matrix View

---

## 🔐 2. Authentication & Admin Security (`/auth`)

- [x] `GET /health_check` — Backend Health Check  
  - **Status**: ✅ Completed & Verified via E2E (`e2e/health.spec.ts`)
- [x] `POST /auth/register` — Artist Registration  
  - **Status**: ✅ Completed & Verified (`src/features/profile/LoginPage.tsx` & `e2e/auth.spec.ts`)
  - **Rules**: Lowercase handles enforced in UI & backend validation, 8+ char password rules (min 1 uppercase, 1 lowercase, 1 number).
- [x] `POST /auth/login` — Artist Login  
  - **Status**: ✅ Completed & Verified (`src/features/profile/LoginPage.tsx` & `e2e/auth.spec.ts`)
  - **Rules**: Form handles trimmed and lowercased in real-time.
- [x] `POST /auth/logout` — Artist Logout  
  - **Status**: ✅ Completed & Verified (`src/context/AuthContext.tsx`)
- [x] `POST /auth/reset-password` — Artist Reset Password  
  - **Status**: ✅ Completed & Verified (`src/features/profile/components/PasswordResetModal.tsx`)
  - **Rules**: Real-time password rules checklist, client-side validation & error payload guidance.
- [x] `POST /auth/admin/login` — System Admin Login (`admins` table)  
  - **Status**: ✅ Completed & Verified (`src/features/admin/AdminPage.tsx` & `AdminRoleForm.tsx`)
  - **Rules**: Lock screen blocks administrative panel until logged in.
- [x] `POST /auth/admin/logout` — System Admin Logout  
  - **Status**: ✅ Completed & Verified (`src/features/admin/AdminPage.tsx`)
- [x] `POST /auth/admin/register` — Register New Admin Account (`admins` table)  
  - **Status**: ✅ Completed & Verified (`src/features/admin/components/AdminRoleForm.tsx`)
  - **Rules**: Requires active `AdminUser` session, strict password rules checklist displayed during admin creation.
- [x] `DELETE /auth/admin/delete/{admin_id}` — Delete Admin Account (`admins` table)  
  - **Status**: ✅ Completed & Verified (`src/features/admin/components/AdminRoleForm.tsx`)
  - **Rules**: Requires `AdminUser` auth, client-side UUID regex validation, single-admin deletion safeguard (`COUNT(*) > 1`).

---

## 👑 3. Admin & RBAC Protocol (`/admin`)

- [x] `POST /admin/update_user_role` — Promote/Demote Profile Role (`profiles` table)  
  - **Status**: ✅ Completed & Verified (`src/features/admin/components/AdminRoleForm.tsx`)
  - **Rules**: Accepts `organizer` or `artist` roles, enforces 36-character UUID validation, syncs client session in real-time.
- [x] `POST /admin/new_role` — Create Custom System Role  
  - **Status**: ✅ Completed & Verified (`src/features/admin/components/AdminRoleForm.tsx`)
- [x] `POST /admin/new_permission` — Create Custom System Permission  
  - **Status**: ✅ Completed & Verified (`src/features/admin/components/AdminRoleForm.tsx`)
- [x] `POST /admin/assign_permission` — Assign Permission to System Role  
  - **Status**: ✅ Completed (`src/features/admin/components/AdminRoleForm.tsx`)
- [x] `POST /admin/revoke_permission` — Revoke Permission from System Role  
  - **Status**: ✅ Completed (`src/features/admin/components/AdminRoleForm.tsx`)

---

## 👤 4. Profiles & Artist Stages (`/profiles` & `/artists`)

- [x] `GET /profiles/get_profile_details/{user_name}` — Fetch Profile Stage Details  
  - **Status**: ✅ Completed (`src/lib/api.ts` & `src/features/profile/StudioPage.tsx`)
- [x] `POST /artists/update_stage` — Update Profile Stage & Branding  
  - **Status**: ✅ Completed (`src/features/profile/StudioPage.tsx`)
- [ ] `POST /artists/favorite_artist` — Favorite an Artist Profile  
  - **Status**: ⏳ Pending
- [ ] `POST /artists/unfavorite_artist` — Unfavorite an Artist Profile  
  - **Status**: ⏳ Pending
- [ ] `POST /artists/save_work` — Save Work to Artist Library  
  - **Status**: ⏳ Pending
- [ ] `DELETE /artists/unsave_work` — Remove Saved Work from Library  
  - **Status**: ⏳ Pending
- [ ] `POST /artists/star_work` — Star/Like a Work  
  - **Status**: ⏳ Pending
- [ ] `DELETE /artists/unstar_work` — Unstar/Dislike a Work  
  - **Status**: ⏳ Pending
- [ ] `POST /artists/boost_recommendation` — Boost Recommendation Score  
  - **Status**: ⏳ Pending
- [ ] `DELETE /artists/remove_recommendation_boost` — Remove Boost  
  - **Status**: ⏳ Pending
- [ ] `POST /artists/save_recommendation` — Save Recommendation  
  - **Status**: ⏳ Pending
- [ ] `DELETE /artists/unsave_recommendation` — Unsave Recommendation  
  - **Status**: ⏳ Pending
- [ ] `POST /artists/new/wall_post` — Publish Artist Wall Post  
  - **Status**: ⏳ Pending
- [ ] `DELETE /artists/delete/wall_post/{resource_id}` — Delete Wall Post  
  - **Status**: ⏳ Pending
- [ ] `POST /artists/add_reaction` — React to Wall Post  
  - **Status**: ⏳ Pending
- [ ] `POST /artists/remove_reaction` — Remove Wall Post Reaction  
  - **Status**: ⏳ Pending

---

## 🎬 5. Originals Registry (`/originals`)

- [ ] `POST /originals/new` — Create New Original Title  
  - **Status**: ⏳ Pending (`src/features/admin/components/AdminOriginalModal.tsx`)
- [ ] `POST /originals/{original_id}/update` — Update Original Metadata  
  - **Status**: ⏳ Pending
- [ ] `POST /originals/{original_id}/new_role` — Add Star/Maker Role to Original  
  - **Status**: ⏳ Pending
- [ ] `DELETE /originals/{original_id}/delete_role` — Remove Role from Original  
  - **Status**: ⏳ Pending
- [ ] `DELETE /originals/{original_id}/delete` — Delete Original Title  
  - **Status**: ⏳ Pending
- [ ] `POST /originals/{resource_id}/new_release/{release_type}` — Upload Release Binary/Asset  
  - **Status**: ⏳ Pending

---

## 🎪 6. Sets & Community Hubs (`/sets`)

- [x] `POST /sets/new` — Establish New Set Community  
  - **Status**: ✅ Completed (`src/features/sets/components/CreateSetModal.tsx` & `SetsGrid.tsx`)
  - **Rules**: Restricted to logged-in user profiles with `role == 'organizer'` or `role == 'admin'`, binds `curator` to active profile ID.
- [ ] `POST /sets/{resource_id}/new_festival` — Launch Festival Event inside Set  
  - **Status**: ⏳ Pending
- [ ] `POST /sets/{resource_id}/update` — Update Set Details & Aesthetic  
  - **Status**: ⏳ Pending
- [ ] `POST /sets/join` — Join Set as Member  
  - **Status**: ⏳ Pending
- [ ] `DELETE /sets/{entity_id}/leave` — Leave Set Community  
  - **Status**: ⏳ Pending
- [ ] `POST /sets/{entity_id}/new/discussion` — Publish Set Discussion Post  
  - **Status**: ⏳ Pending
- [ ] `POST /sets/{entity_id}/new/comment` — Post Discussion Comment  
  - **Status**: ⏳ Pending
- [ ] `POST /sets/update/discussion_post/{resource_id}` — Edit Discussion Post  
  - **Status**: ⏳ Pending
- [ ] `POST /sets/update/comment/{resource_id}` — Edit Comment  
  - **Status**: ⏳ Pending
- [ ] `DELETE /sets/delete/discussion_post/{resource_id}` — Delete Discussion Post  
  - **Status**: ⏳ Pending
- [ ] `DELETE /sets/delete/comment/{resource_id}` — Delete Comment  
  - **Status**: ⏳ Pending

---

## 🏆 7. Festivals & Challenges (`/festivals`)

- [ ] `POST /festivals/{resource_id}/update` — Update Festival Event Details  
  - **Status**: ⏳ Pending
- [ ] `POST /festivals/{resource_id}/panelists/update` — Update Jury/Panelists  
  - **Status**: ⏳ Pending
- [ ] `POST /festivals/{entity_id}/panelist/new/{work_type}` — Submit Panelist Work  
  - **Status**: ⏳ Pending
- [ ] `POST /festivals/{entity_id}/member/new/{work_type}` — Submit Member Challenge Work  
  - **Status**: ⏳ Pending

---

## 🎥 8. Works & Media Submissions (`/works`)

- [ ] `POST /works/new/{work_type}` — Upload New Work  
  - **Status**: ⏳ Pending (`src/features/upload/components/UploadStudioFlow.tsx`)
- [ ] `POST /works/{resource_id}/update` — Update Work Details  
  - **Status**: ⏳ Pending
- [ ] `DELETE /works/{resource_id}/delete` — Delete Work  
  - **Status**: ⏳ Pending

---

## 📚 9. Cinematic Library & Recommendations (`/library`)

- [ ] `POST /library/new` — Create Library Entry  
  - **Status**: ⏳ Pending
- [ ] `POST /library/{resource_id}/update` — Update Library Entry  
  - **Status**: ⏳ Pending
- [ ] `POST /library/{resource_id}/tag_work` — Tag Work in Library Entry  
  - **Status**: ⏳ Pending
- [ ] `DELETE /library/{resource_id}/delete` — Delete Library Entry  
  - **Status**: ⏳ Pending
- [ ] `POST /library/recommendations/new` — Create Recommendation  
  - **Status**: ⏳ Pending
- [ ] `POST /library/recommendations/{resource_id}/update` — Update Recommendation  
  - **Status**: ⏳ Pending
- [ ] `DELETE /library/recommendations/{resource_id}/delete` — Delete Recommendation  
  - **Status**: ⏳ Pending

---

## 🧪 E2E Test Suite Status

Run E2E verification anytime:
```bash
npx playwright test
```
- **Total Specs**: 12 / 12 **PASSED** (100%)
- **TypeScript Check**: `npx tsc --noEmit` — **0 Errors**
