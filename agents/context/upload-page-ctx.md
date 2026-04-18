# Context Outline: The Release Rite (Work Upload Experience)

**Topic**: The FrameHouse "Upload Page" (referred to internally as the *Release Rite*).
**Path**: `src/features/upload/UploadPage.tsx`
**Current Status**: Fully functional with decentralized modal architecture. All embeds (YouTube/Twitter) and aspect-ratio previews are stable.

## 1. Architectural Philosophy
Rather than a traditional web form, submitting work is treated as a premium "Post Production" calibration and transmission process. 
- **Terminology**: Instead of "Upload", "Submit", or "Save", the UI uses **"Release"**, **"Archive"**, and **"Transmission"**. "Static Art" is termed **"Cinematic Poster"**.
- **Aesthetic**: The layout uses an obsidian background, glassmorphic panels (`bg-white/[0.02]`), floating blurred glow orbs, subtle SVG grain, and highly choreographed `framer-motion` transitions.

## 2. The 5-Step State Machine
The submission flow operates in a strict sequence:
1. **The Identity (`INTEL`)**: Select category (Cinematic Edit vs Cinematic Poster) and enter the Release Title.
2. **The Transmission (`TRANSMISSION`)**: Select the source network (YouTube / Twitter) and provide the absolute link to the content.
3. **The Canvas (`PROJECT`)**: Assign the release to an existing official Original project (e.g., OG, RRR).
4. **The Geometry (`GEOMETRY`)**: Select the layout aspect ratio from the global constants. Renders a 1:1 Live Preview card.
5. **The Seal (`SEAL`)**: Final verification showing identical theatre container and triggering a simulated "Post Production" sync state.

## 3. Global Container Formats (`src/constants/formats.ts`)
To ensure consistency across the platform, grid container formats are centralized in `THEATRE_FORMATS`:
- **Video/Edits**: IMAX (16:9), Academy (4:3), Vertical Reel (9:16), Social Square (1:1).
- **Posters**: Standard Poster (2:3), Square Gallery (1:1), Digital Vertical (9:16).

## 4. Decentralized Modal Architecture
We successfully de-coupled the modal state from the parent pages (`UploadPage`, `TheatrePage`, `OriginalsTheatrePage`).
- **Mechanism**: The `EditWork`, `PosterWork`, and `ScriptWork` components now manage their own internal `isModalOpen` state. 
- **Benefit**: Clicking a card anywhere in the app (including the Upload Preview) automatically triggers the correct `WorkModal` without requiring the parent to implement any prop-drilling or `onSelect` handlers.
- **Preview Stability**: This resolved the "Blank Embed" issue in the upload flow, as the preview card now uses the exact same production logic as the main Theatre.

## 5. Resolved Issues & Current State

### ✅ Platform + srcId Contract (DONE)
`src/utils/embed.ts` is the single source of truth for all URL construction:
- `buildEmbedUrl(platform, srcId)` — player/embed URLs
- `buildThumbnail(platform, srcId)` — YouTube thumbnails  
- `extractSrcId(platform, url)` — parses pasted URLs in the upload flow

### ✅ TheatreItem Evolution
- `originalId` (singular) was migrated to `originalIds` (string[]) to allow a single work to be linked to multiple Archive Projects.
- `srcId` and `platform` are now the primary identifiers for all media content.

### ✅ Twitter Embed (STABILIZED)
Switched to the high-compliance `blockquote` + `widgets.load(container)` strategy in `EditModal.tsx`. 
- **Config**: Uses `data-media-max-width="560"`, `data-theme="dark"`, and `data-dnt="true"`.
- **Race Condition Guard**: Implemented `renderGenRef` to ensure that fast re-renders (like flipping the card back and forth) don't trigger overlapping script injections or DOM corruption.

### ✅ GEOMETRY Step Mobile Layout (FIXED)
Preview card renders above format selectors on mobile (`lg:hidden`). Desktop column layout unchanged.

## 6. Remaining Work
- **Backend Integration**: Replace `handleRelease()` stub (3.5s fake delay) with actual API mutation: `POST /works` with `{ platform, srcId, title, category, originalIds: [originalId], aspectRatio }`.
- **Validation**: Improve the error handling in `WorkPreview` if a user pastes a completely invalid non-YouTube/Twitter URL.
