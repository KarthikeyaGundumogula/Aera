# FrameHouse Backend PRD & Core Schema

## 1. Product Scope & Objective

This PRD defines the backend requirements to power **FrameHouse**, a highly cinematic, deterministic spatial platform where fans share edits, posters, and theories.

The backend must be built for **Performance** and **Deterministic Paging** because the frontend utilizes structured layout engines (virtualized CSS Grids/Clusters) that rely on precision payload structures.

## 2. Core Entities & Database Models

### 2.1 Profiles (Users / Artists)

- Regular users authenticate and build "Presence" over time by securing Credits.
- Once enough Presence is met, they upgrade to "Artist" status.

### 2.2 Works

Works are the assets. They break down perfectly into categories defining dimensions for the frontend:

- `Edit`/`video` (requires `platform` and `platformId` like YouTube UUID)
- `Poster` (requires `image`)
- `Script` (requires `image` context and long-form data)

### 2.3 Originals

The "Movie" or "Series" that acts as the focal anchor for works (e.g., _RRR_, _OG_).

---

## 3. API Route Specifications & JSON Schemas

### A. Works Engine

#### `GET /api/works`

**Purpose:** Fetches global works for the home theatre layout. For mobile, it must populate deterministic layout rules (e.g., making sure IMAX slots get `aspectRatio: 1.77` edits contextually).
**Query Params:** `?page=1&limit=5&category=Edit&clientPlatform=mobile` (use `limit=12` for desktop clusters)
**Expected JSON Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "w-uuid-xyz",
      "title": "OG Intro Blast",
      "category": "Edit",
      "type": "video",
      "aspectRatio": 1.77,
      "credits": 2480,
      "artist": "PowerStar_FC",
      "artistId": "art-uuid-1",
      "originalIds": ["og-uuid-1", "og-uuid-2"],
      "image": "https://cloudfront.net/posters/poster1.jpg",
      "platform": "youtube",
      "srcId": "dQw4w9WgXcQ"
    }
  ],
  "meta": {
    "totalCount": 12040,
    "nextCursor": "uuid-cursor-hash"
  }
}
```

#### `GET /api/works/upload-url`

**Purpose:** Generates a secure, short-lived Presigned URL for direct client-to-cloud upload.
**Query Params:** `?fileName=poster.png&fileType=image/png`
**Expected JSON Response:**

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/framehouse-assets/tmp-uuid?signature=...",
    "downloadUrl": "https://cdn.framehouse.com/works/uuid.png"
  }
}
```

#### `POST /api/works`

**Purpose:** Finalizes the transmission of new cinematic artifacts.
**Content-Type:** `application/json`

**Polymorphic JSON Body Examples:**

**1. Cinematic Edit (Motion Art)**
```json
{
  "title": "OG Intro Blast",
  "category": "Edit",
  "originalIds": ["og-uuid-1"],
  "aspectRatio": 1.77,
  "platform": "youtube",
  "srcId": "dQw4w9WgXcQ",
  "image": "https://cdn.framehouse.com/works/thumb-uuid.png"
}
```

**2. Cinematic Poster (Static Visual)**
```json
{
  "title": "FrameHouse Official Poster",
  "category": "Poster",
  "originalIds": ["og-uuid-1"],
  "aspectRatio": 0.666,
  "image": "https://cdn.framehouse.com/works/poster-uuid.png"
}
```

**3. Cinematic Script (Narrative Arc / Storyboard)**
```json
{
  "title": "FrameHouse Narrative Arc",
  "category": "Script",
  "originalIds": ["og-uuid-1"],
  "aspectRatio": 1.0,
  "images": [
    "https://cdn.framehouse.com/works/page1.png",
    "https://cdn.framehouse.com/works/page2.png"
  ],
  "captions": [
    "The first act begins in silence — before the storm finds its name.",
    "A single frame can hold the weight of a thousand unspoken lines."
  ]
}
```

**Behavioral Logic:**
- **Edits:** If `image` is omitted, the backend derives it from the `srcId` via `buildThumbnail` (YouTube/Twitter).
- **Posters:** The `image` field is mandatory and must point to a finalized S3/CDN URL.
- **Scripts:** Requires the `images` array (max 10) and an optional `captions` array of matching length. The `image` field (cover) defaults to `images[0]` if not explicitly provided.
- **Aspect Ratio:** Must be provided dynamically by the client (`width / height`) to inform the deterministic grid layout.

### B. Original (Theatres) Engine

#### `GET /api/originals`

**Purpose:** Fetches the anchored movies for the home navigation loops.
**Expected JSON Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "og-original",
      "title": "OG",
      "description": "They call him OG. Pawan Kalyan's most raw avatar.",
      "coverImage": "https://cdn.framehouse.com/covers/og.png",
      "stats": {
        "presence": 2480,
        "members": 1620,
        "releases": 18
      },
      "releaseDate": "2025"
    }
  ]
}
```

### C. Artist Vault & Presence Engine

#### `GET /api/artists/:artistId`

**Purpose:** Serves the 3D Profile Talent HUDs. Must return an array of `workedOn` records (origins) for flip-card validation.
**Expected JSON Response:**

```json
{
  "success": true,
  "data": {
    "id": "fh-001",
    "name": "Karthik G",
    "bio": "Cinematic visualist...",
    "presence": 1540,
    "works": 24,
    "image": "https://cdn.framehouse.com/artists/pic.jpg",
    "socials": {
      "instagram": "@karthik_g",
      "youtube": "KarthikGVisuals"
    },
    "workedOn": [
      { "id": "og-original", "title": "OG" },
      { "id": "rrr-original", "title": "RRR" }
    ]
  }
}
```

### D. Watchlist Engine

#### `GET /api/watchlist`

**Purpose:** Fetches the user's curated cinematic ledger.
**Query Params:** `?filter=all|want_to_watch|watched`
**Expected JSON Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "wl-uuid-1",
      "workId": "w-uuid-xyz",
      "status": "want_to_watch",
      "addedAt": "2024-04-24T10:00:00Z",
      "work": {
        "title": "OG Intro Blast",
        "category": "Edit",
        "image": "..."
      }
    }
  ]
}
```

#### `POST /api/watchlist`

**Purpose:** Adds a work or original to the user's watchlist.
**Body:** `{ "targetId": "w-uuid-xyz", "targetType": "work" | "original" }`

#### `DELETE /api/watchlist/:id`

**Purpose:** Removes an item from the ledger.

---

## 4. Systems, Performance & Reliability

1. **CDN Delivery & Edge Caching:**
   Because all images represent _art_, lossy compression should be minimized. Deliver WEBP/AVIF formatted outputs over an Edge CDN to strictly enforce fast Largest Contentful Paint (LCP) in theatre layouts.
2. **Deterministic Layout Generation (Optional Backend Overdrive):**
   Ideally, `/api/layout/mobile` explicitly provides grid placement sequences: `{ type: 'IMAX', work: {...} }, { type: 'Vertical', work: {...} }` rather than the frontend rolling the dice. This stabilizes layout thrashing upon hydration.
3. **Optimistic UI Updates:**
   The backend must support idempotency on `/credit` endpoints so the client app can confidently update local variables prior to receiving HTTP 200 validations without fear of duplicate credit allocations.
4. **Data Isolation (Security):**
   Since videos are constructed on the client, the backend must strictly validate the `platformId` format (e.g., alphanumeric regex for YouTube UUIDs, numeric for Twitter constraints) to prevent injection risks locally.
