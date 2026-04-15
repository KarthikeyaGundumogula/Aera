# Frontend Context: FrameHouse

## Role
You are acting as a **Senior Frontend Designer/Developer**.

## Project Vision
You are building **FrameHouse**, a digital theatre for cinematic expressions—where Cinema lives digitally through fans' interpretations, a fan take on the originals. The goal is to make the design feel **fresh, cinematic, and minimal**. The UI should feel **private** to the user, giving them a close, immersive feel.

## Global Rules
1. **Mock Data**: If you are creating any mock data, always create that in the `src/mock` folder and create a different file for each type of data.

## Core Design Philosophy
- **Consistency over novelty**
- **Expression over content**
- **Identity over engagement**
- **Space over density**
- **Visual Philosophy**: Structured chaos, cinematic rhythm, and intentional silence.

## Typography & Title Rules
- **Name & Title Integrity**: Names (Originals, Artists, Persons) must never be split/hyphenated and must never overflow their parent container.
- **Adaptive Containment (The 95% Rule)**: Title containers are restricted to a maximum of 95% of the viewport/parent width.
  - **Single-Word Titles**: If a single word title is too long for the regular font size, the font size must dynamically decrease (shrink-to-fit) to ensure it stays within the 95% boundary without wrapping or overflowing.
  - **Multi-Word Titles**: If a multi-word title exceeds the 95% width, it must wrap to new lines, expanding the container height upwards rather than shrinking the font size aggressively.

## Core Concepts & Mechanics
- **Interaction & Recognition**:
  - *Interaction* (Likes, Comments): Drives discovery and visibility. Low friction.
  - *Recognition* (Credits): Defines identity and reputation. Intentional, carries high weight, and requires "Presence" (accumulated Credits) to give.
- **Content Types**:
  - Edits (video sequences)
  - Posters (visual redesigns)
  - Theories (text/narrative expansions)
- **Content Cards (No distortion, no padding, immersive)**:
  - **IMAX**: cinematic hero
  - **WIDE**: standard edits
  - **VERTICAL**: mobile edits
  - **SQUARE**: theories/posters

## UX / UI & Theatre Layout
- **The Canvas (Desktop)**: The desktop experience is a 2D "infinite" cinematic canvas emphasizing multidirectional (2-axis) exploration and spatial navigation.
- **Grid System (Desktop)**: 12-column structure with 9-row fixed clusters that tile seamlessly, creating an infinite cinematic space with no gaps.
- **The Canvas (Mobile)**: The mobile experience is a Y-axis scrolling theatre utilizing a strict 2-column CSS grid. It explicitly avoids dynamic masonry in favor of rigid row spans to guarantee visual rhythm and precise alignment.
- **Mobile Containers**:
  - **IMAX** (Span 2 cols, 16:9, Video)
  - **Academy** (1 col, ~4:3, Video)
  - **Square** (1 col, 1:1, Video/Poster/Script)
  - **Vertical** (1 col, 9:16, Video) - *Strict Rule: One Vertical container height must exactly match the sum of two stacked Academy or Square containers (+ gap).*
  - **2:3 Poster** (1 col, 2:3, Poster)
  - **Mobile Container Populating Rules**:
  1. **IMAX Restrictions**: IMAX containers can *only* hold video works. No posters or scripts.
  2. **IMAX Video Fallbacks**: If no 16:9 (IMAX) aspect ratio video is available for an IMAX container, priority falls to Academy ratio videos, and lastly Square videos.
  3. **IMAX Overflow**: IMAX videos *always* prioritize IMAX containers. If there are more IMAX videos than IMAX containers, overflow IMAX videos are placed into Academy containers.
- **Mobile Cluster Sequencing**: Handled mostly by the backend. The layout engine provides a repeating, non-duplicate rhythm of cluster blocks (e.g., pattern A -> C -> B -> D -> E). The frontend strictly consumes and renders this sequence to ensure flawless stacking without complex calculation overhead.
- **Layout Engine Focus**: Both platforms rely on deterministic cluster rules emphasizing *visual rhythm over density*.
- **Theme System**: Each "Original" (movie/series) applies a specific background, color palette, and typography. The *structure remains constant*, only the *mood changes*.
- **Interaction Model**: Users enter space organically (entering a space, not scrolling a feed) and gradually discover deeper mechanics.

## Originals Experience
- **Interactive Hero Carousel**: The top of the Original page functions as a seamless entry point. It starts as an immersive, full-width static "anchor" poster and smoothly transitions into a 10s auto-rotating video carousel highlighting featured releases.
- **Context Preservation**: The main static poster is intrinsically injected into the carousel's rotation loop to preserve context across interactions and populate the unified `QuickView` player.
- **Video Fallbacks & Security**:
  - **CORB/CSP Resolution**: All `<video>` tags explicitly use `crossOrigin="anonymous"` and the `<source type="video/mp4" />` sub-element to bypass browser security intercepts on cross-origin media.
  - **Error Tracking**: Browser-native `<video poster={...}>` combined with `onError` DOM tracking to gracefully downgrade failed or blocked auto-playing media into high-quality static previews.
- **Cinematic UI**: Navigation avoids bulky UI controls in favor of minimalist dashed paginators and invisible multi-directional swiping gestures driven by `framer-motion`.

## Technical Implementation Notes
- **Navigation Architecture**: The mobile bottom navigation (`MobileNavBar`) is a universally mounted global component overlaying the root router (`App.tsx`). It floats above all routes for mobile users while naturally hiding on desktop viewports. The "Calls" feature has been globally deprecated.
- **Mobile Theatre Layout**: The `MobileTheatreCanvas` maps sequences of layout clusters onto a rigid Y-axis grid, utilizing robust flexbox/CSS grid stretching rules instead of fragile masonry libraries.
- **Performance & Virtualization**: 
  - Off-screen layout parsing and rendering is blocked natively using CSS `content-visibility: auto` paired with `contain-intrinsic-size` on clusters. This mimics robust list virtualization with virtually zero JS computation overhead.
  - Infinite scroll utilizes a pre-emptive `IntersectionObserver` sentinel to trigger lazy background hydration without user blocking.
- **Media**: Relies on `object-fit: cover` and native HTML `loading="lazy"`.
- **Data Flow**: classify → bucket → cluster → render.

## Recent Frontend Additions
- **Reusable Work Rendering Layer**:
  - Work rendering is now centralized into exactly three shared components under `src/features/shared/work/`:
    - `EditWork`
    - `PosterWork`
    - `ScriptWork`
  - These components are now the canonical rendering source for Home feed, Theatre, Originals Theatre, and future work surfaces.
  - **Important Rule**: layout owns sizing, not the work component. Aspect ratio, slot dimensions, grid span, and container choice are always controlled by the parent surface or cluster layout.
- **Shared Work Classification**:
  - Work type classification has been centralized in the shared work layer instead of being reimplemented per surface.
  - Canonical classification:
    - `Edit` = `category === "Edit"` or `type === "video"` or `isPlay`
    - `Poster` = `category === "Poster"`
    - `Script` = `category === "Script"`
- **Surface Integration**:
  - `MobileCard`, `DesktopCanvasCard`, and `TheatreFeedItem` are now thin wrappers that apply layout/frame behavior and delegate rendering to the shared work components.
  - Cluster builders remain untouched architecturally and still decide placement/container selection.
- **Category Visual Hints**:
  - Category badges are still a separate reusable system, but their placement is now owned by the shared work components instead of page/surface wrappers.
  - `CategoryBadge` now supports:
    - `mobile`
    - `desktop`
    - `feed`

## Work Interaction Rules
- **Video Works**:
  - Only video/edit works open `QuickView`.
  - `QuickView` should receive only video-compatible items so poster/script works do not appear in queue navigation or arrow-key traversal.
- **Poster and Script Works**:
  - Posters and scripts now open a dedicated `WorkModal` instead of `QuickView`.
  - This interaction split is enforced at the page/container level, not inside the low-level work rendering components.
- **Selection Handling**:
  - Page-level selectors in Home, Theatre, Original Page, and Originals Theatre now route selected works by type:
    - video -> `QuickView`
    - poster/script -> `WorkModal`

## Work Modal Design & Immersive UX
- **Pixel-Perfect Adaptive Display**:
  - Posters must be shown in their **exact native dimensions** without cropping or stretching.
  - The modal container utilizes real-time `naturalWidth` / `naturalHeight` detection of the image to snap the UI perfectly to the artwork's geometry.
  - Sizing is adaptive: it scales to the tightly-bound viewport limits (`~75vh` height / `92vw` width) while strictly honoring the image's original aspect ratio.
- **Interactivity & Flip Mechanic**:
  - **The 3D Flip**: Posters use a "physical" card metaphor. The front is pure art; the back (triggered via an "i" button) is a cinematic info panel.
  - **Clutter-Free Logic**: A dedicated toggle hides all UI overlays (names, badges, titles) to allow uninterrupted viewing of the artwork.
- **Unified Button Placement**:
  - Control buttons (Clutter-toggle, Info-flip) are unified into a centered horizontal bar **below** the artwork for both mobile and desktop.
  - This prevents UI elements from overlapping the art and guarantees visibility regardless of viewport width or poster aspect ratio.
- **Simplified Navigation**:
  - For posters, the close interaction is purely backdrop-driven (click outside) or key-driven (Esc). Decorative "X" buttons are removed to maximize visual immersion.
- **Backside Details**:
  - The "Info" side of the flip utilizes a blurred, high-ambient version of the poster as its background, maintaining an emotional connection to the work while displaying metadata (Artist, Origins, Credits, Description).

## Visual Identity Standards (Modal)
- **Backdrop**: Uses an ultra-dark cinematic canvas (`bg-black/90`) with a subtle grain/noise texture overlay and high-strength backdrop blur.
- **Interaction**: Buttons use a consistent glass-morphism style (`backdrop-blur-xl`, `border-white/20`, 10% white background).
- **Hierarchy**: Art is the primary focus. Title and metadata are secondary elements placed strictly below the card boundary.

## Theatre Layout Orchestration (Home Feed)
- **Dual-Mode Rendering**:
  - **Desktop**: Leverages the Cluster Engine in `flow` mode. This uses 16x8 templates (F-J) specifically designed for vertical page flow, emphasizing asymmetric variety and cinematic rhythm.
  - **Mobile**: Strictly enforced 1-column cinematic stack. Every card is full-width, bypassing clusters to guarantee maximum impact on small screens.
- **Native Interaction Pattern**:
  - **Navigation**: Landing pages (Originals) are wrapped in the `OriginalLink` component, which handles its own `navigate` logic.
  - **Viewers**: Works (Posters/Scripts/Edits) signal their selection to the page, which chooses between the `WorkModal` (static art) and `QuickView` (video).
- **Immersive Modal (Precision Fit)**:
  - Container sizing logic: `width: min(92vw, calc(75vh * aspect))`.
  - Zero-Gaps Policy: The modal card perfectly shrink-wraps the artwork, eliminating black bars (letterboxing) while ensuring zero cropping and zero stretching.
