# Aera / FrameHouse — Codebase Study & Upload Page Deep-Dive

## 1. RULES.md — Non-Negotiables

| Rule | Detail |
|------|--------|
| **Delegate** | Always invoke specialized agents for domain tasks |
| **Mock data** | Lives in `src/mock/` — one file per data type |
| **Context** | `agents/context/` is the decision-making reference |
| **Design** | Strict checklist in `agents/rules/web/design-quality.md` |
| **Patterns** | Compound components, URL-as-state, separate server/client state — `agents/rules/web/patterns.md` |
| **TypeScript** | No `any`, strong typing on all public APIs — `agents/rules/typescript/coding-style.md` |
| **Refactoring** | `agents/refactor-cleaner.md` for dead-code elimination |
| **Code Review** | `agents/rules/common/code-review.md` always followed |
| **Browser testing** | ⚠️ **NEVER** use browser sub-agent unless explicitly told to |

---

## 2. Agent Roster

| File | Name | When to Use |
|------|------|-------------|
| `planner.md` | planner | Complex feature requests — generates phased implementation plans |
| `code-explorer.md` | code-explorer | Pre-work analysis — traces execution paths & documents architecture |
| `code-reviewer.md` | code-reviewer | After every code change — CRITICAL/HIGH/MEDIUM/LOW severity findings |
| `code-simplifier.md` | code-simplifier | Refactor verbose or complex code |
| `refactor-cleaner.md` | refactor-cleaner | Dead-code removal, duplicate elimination, knip/depcheck/ts-prune |
| `design-ideas.md` | design-ideas | Presence Layer theming system for profiles |
| `doc_updater.md` | doc_updater | Keeping `agents/context/` files in sync after work |
| `build-error-specialist.md` | build-error-specialist | Diagnosing build/type/lint failures |

---

## 3. Agent Skills (in `agents/skills/`)

| File | Purpose |
|------|---------|
| `frontend-design.md` | Design reference & style direction |
| `frontend-patterns.md` | Compound components, URL-as-state, render props, data fetching |

---

## 4. Context Files (decision-making truth)

| File | Summary |
|------|---------|
| `app-overview.md` | Full FrameHouse product vision: Works, Credits, Presence, Sets, Originals, Theatre |
| `fe-context.md` | **Master frontend context**: layout rules, shared work layer, modal system, interaction rules |
| `entities-and-relations.md` | Artist, Regular, Originals, Sets, Works, Origins, Credits |
| `upload-page-ctx.md` | **Dedicated Upload Page context** — 5-step state machine, known modal embed bug |

---

## 5. Product Concepts (What FrameHouse Is)

- **Works**: Edits (video), Posters (image), Theories (text/script)
- **Theatre**: 2D infinite cinematic canvas (desktop 12-col × 9-row clusters; mobile 2-col CSS grid)
- **Originals**: Each movie/series is a curated FrameHouse Original with its own theatre
- **Credits**: Recognition system, higher weight than Likes. Requires Presence to give
- **Presence**: Accumulated Credits received → unlocks giving Credits
- **Presence Layers**: UI config objects created by Originals that users can apply to their profile

---

## 6. Frontend Architecture

### Source Structure
```
src/
├── App.tsx                   # Root router + ScrollToTop + MobileNavBar
├── features/
│   ├── upload/               # The Release Rite (our focus)
│   │   ├── UploadPage.tsx    # 5-step wizard (507 lines)
│   │   └── components/
│   │       └── WorkPreview.tsx  # Live preview card (89 lines)
│   ├── shared/
│   │   ├── work/             # Canonical work renderers
│   │   │   ├── EditWork.tsx
│   │   │   ├── PosterWork.tsx
│   │   │   ├── ScriptWork.tsx
│   │   │   ├── WorkOverlay.tsx
│   │   │   └── types.ts      # BaseWorkProps, getCategoryBadgeVariant
│   │   └── modals/           # Shared modal system
│   │       ├── WorkModal.tsx      # Dispatcher → Edit/Poster/Script modal
│   │       ├── EditModal.tsx      # Video player (YouTube iframe + Twitter embed)
│   │       ├── PosterModal.tsx    # 3D flip card for posters
│   │       ├── ScriptModal.tsx
│   │       └── ModalWrapper.tsx   # Backdrop + escape key handler
│   ├── theatre/              # Desktop/mobile canvas + cluster engine
│   ├── originals/            # Originals page + theatre
│   ├── home/                 # Home feed
│   └── navigation/           # MobileNavBar
├── mock/                     # All mock data
│   ├── works.json
│   ├── originals.json
│   ├── artists.json
│   └── index.ts              # ORIGINALS, WORKS, ARTISTS_MOCK etc.
├── constants/
│   └── formats.ts            # THEATRE_FORMATS (single source of truth for aspect ratios)
└── types/
    ├── theatre.ts            # TheatreItem interface
    └── originals.ts
```

### Shared Work Layer (Critical Rule)
> **Layout owns sizing, not the work component.** `EditWork`, `PosterWork`, `ScriptWork` never control their own dimensions. Parent surfaces set aspect-ratio, slot dimensions, and container choice.

### Work Classification (Canonical)
- `Edit` = `category === "Edit"` OR `type === "video"` OR `isPlay`
- `Poster` = `category === "Poster"`
- `Script` = `category === "Script"`

### Interaction Routing
- **Video/Edits** → `QuickView` (on Theatre surfaces) OR `EditModal` (via `WorkModal`)
- **Poster/Script** → `WorkModal` → `PosterModal` / `ScriptModal`

---

## 7. The Upload Page (Release Rite) — Full Architecture

### Path
`src/features/upload/UploadPage.tsx` (507 lines)

### State Machine — 5 Steps

```
INTEL → TRANSMISSION → PROJECT → GEOMETRY → SEAL
```

| Step | Internal Name | User Sees | Key Field |
|------|--------------|-----------|-----------|
| 1 | INTEL | "The Identity" | `title`, `category` (Edit or Poster) |
| 2 | TRANSMISSION | "The Transmission" | `platform` (YouTube/Twitter), `contentUrl` |
| 3 | PROJECT | "The Canvas" | `originalId` (from ORIGINALS list) |
| 4 | GEOMETRY | "The Geometry" | `aspectRatio` (from THEATRE_FORMATS) |
| 5 | SEAL | "Mastering Ready" | Review + final "Release Artifact" trigger |

### Form State Shape
```typescript
{
  originalId: string;        // Selected Original's ID
  title: string;             // Release title
  category: "Edit" | "Poster";
  contentUrl: string;        // Raw user URL (YouTube/Twitter)
  aspectRatio: number;       // From THEATRE_FORMATS (e.g. 1.77 for IMAX)
  platform: "youtube" | "twitter";
}
```

### THEATRE_FORMATS (`src/constants/formats.ts`)
```
IMAX:             16:9 → ratio 1.77   (Video)
ACADEMY:          4:3  → ratio 1.33   (Video)
VERTICAL_VIDEO:   9:16 → ratio 0.56   (Video)
SQUARE_VIDEO:     1:1  → ratio 1.0    (Video)
STANDARD_POSTER:  2:3  → ratio 0.66   (Poster)
SQUARE_POSTER:    1:1  → ratio 1.0    (Poster)
VERTICAL_POSTER:  9:16 → ratio 0.56   (Poster)
```

### WorkPreview Component (`components/WorkPreview.tsx`)
- Builds a **mock `TheatreItem`** on every form change using `useMemo`
- Handles YouTube ID extraction → thumbnail + embed URL derivation
- Handles Twitter ID extraction → `twitterId` field
- Renders `EditWork` (variant="feed") or `PosterWork` (variant="feed")
- `onSelect` prop wired to `setSelectedItem` in parent → opens `WorkModal`

### WorkModal Dispatch Chain (when preview card is clicked)
```
WorkPreview.onSelect(mockItem)
  → UploadPage.setSelectedItem(mockItem)
  → <WorkModal item={selectedItem} onClose={...} />
  → WorkModal dispatches by category:
      "Edit"   → EditModal
      "Poster" → PosterModal
      "Script" → ScriptModal
```

### EditModal — Embed Logic
| Platform | Mechanism |
|----------|-----------|
| YouTube | `<iframe src={embedUrl + "?enablejsapi=1"}>` — `onLoad` sets `isLoaded` |
| Twitter | `<blockquote class="twitter-tweet">` + dynamic `widgets.js` script loading |

Twitter hydration flow in EditModal:
1. Checks for existing `<script src="…widgets.js">` to avoid duplication
2. If not found, appends script tag dynamically with `onload = loadTwitter()`
3. `loadTwitter()` calls `twttr.widgets.load()` then sets `isLoaded(true)`
4. Safety fallback: 3.5s timeout that sets `isLoaded(true)` regardless

---

## 8. Known Bug — The Open Issue

> **Status**: Open. Documented in `agents/context/upload-page-ctx.md`.

**What**: Clicking on a Twitter upload in `WorkPreview` opens `EditModal`, but the Twitter embed renders blank.

**Root Cause (suspected)**: 
- The `<blockquote>` is keyed on `${item.id}-twitter` which is always `"preview-id-twitter"` — widgets.js may already have loaded and won't re-process unless explicitly called
- `twttr.widgets.load()` is called but the target element may not be in the DOM at the exact moment of hydration (React rendering timing)
- The `item.embedUrl` for Twitter needs to be the canonical tweet URL (not the embed API URL) for the blockquote `<a>` href

**What was done**:
- `WorkPreview.tsx` was updated to correctly parse `twitterId` from the URL
- `embedUrl` is set to the full URL for Twitter (blockquote `<a>` href source)

**Remaining suspect**: `EditModal` hydration timing — `twttr.widgets.load()` may fire before the blockquote DOM node is available after React's render commit.

---

## 9. TypeScript Type: `TheatreItem`

```typescript
interface TheatreItem {
  id: string | number;
  title?: string;
  description?: string;
  category?: 'Edit' | 'Poster' | 'Script' | 'Call' | 'Original';
  origins?: string;
  credits?: number;
  presence?: number;
  artist?: string;
  artistAvatar?: string;
  image?: string;
  videoUrl?: string;
  platform?: 'youtube' | 'twitter';
  embedUrl?: string;
  twitterId?: string;
  text?: string;
  isPlay?: boolean;
  aspectRatio?: number;
  originalId?: string;
  // ... more optional fields
}
```

The mock `TheatreItem` built in `WorkPreview` must map all critical fields:
- `platform` → drives modal embed type selection
- `embedUrl` → YouTube iframe src / Twitter blockquote href
- `twitterId` → Twitter embed identifier
- `image` → preview thumbnail (YouTube maxresdefault.jpg or originalCover)

---

## 10. Design Standards (Upload Page Aesthetic)

From `upload-page-ctx.md`:
- **Background**: Obsidian `#050505`
- **Panels**: `bg-white/[0.02]` glassmorphic
- **Glow orbs**: blurred floating `bg-white/[0.03]` circles
- **Grain**: SVG noise overlay at `opacity-[0.03]`
- **Motion**: `framer-motion` AnimatePresence with `y: ±30` slide transitions
- **Typography**: Font-black uppercase, wide tracking, no hyphens
- **Buttons**: White pill (primary), ghost text (secondary/back)
- **Terminology**: Release, Archive, Transmission, Cinematic Poster (not Upload/Submit/Image)

---

## 11. Next Steps (from `upload-page-ctx.md`)

1. **Debug the Preview Modal embed** — trace Twitter/YouTube iframes through `WorkModal → EditModal`, fix hydration timing
2. **Backend integration** — wire actual API mutations on the SEAL step payload
3. **Responsive cleanup** — GEOMETRY step split-screen on mobile

---

## 12. Key Files Quick Reference

| File | Role |
|------|------|
| `src/features/upload/UploadPage.tsx` | Main 5-step Release Rite wizard |
| `src/features/upload/components/WorkPreview.tsx` | Live preview card (mock TheatreItem builder) |
| `src/features/shared/modals/WorkModal.tsx` | Modal dispatcher |
| `src/features/shared/modals/EditModal.tsx` | YouTube/Twitter embed player modal |
| `src/features/shared/modals/PosterModal.tsx` | 3D flip poster modal |
| `src/features/shared/work/EditWork.tsx` | Canonical video work renderer |
| `src/features/shared/work/PosterWork.tsx` | Canonical poster renderer |
| `src/constants/formats.ts` | THEATRE_FORMATS — single source of truth |
| `src/types/theatre.ts` | TheatreItem interface |
| `src/mock/index.ts` | All mock data exports |
| `agents/context/upload-page-ctx.md` | Upload page context (keep updated) |
| `agents/context/fe-context.md` | Main frontend context (keep updated) |
