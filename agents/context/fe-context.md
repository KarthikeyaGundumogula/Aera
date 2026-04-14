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
  - **Vertical** (1 col, 9:16, Video)
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
- **Video Fallbacks**: Browser-native `<video poster={...}>` implementation combined with explicit `onError` DOM tracking to gracefully downgrade failed or blocked auto-playing media into high-quality static previews instantly.
- **Cinematic UI**: Navigation avoids bulky UI controls in favor of minimalist dashed paginators and invisible multi-directional swiping gestures driven by `framer-motion`.

## Technical Implementation Notes
- **Navigation Architecture**: The mobile bottom navigation (`MobileNavBar`) is a universally mounted global component overlaying the root router (`App.tsx`). It floats above all routes for mobile users while naturally hiding on desktop viewports. The "Calls" feature has been globally deprecated.
- **Mobile Theatre Layout**: The `MobileTheatreCanvas` maps sequences of layout clusters onto a rigid Y-axis grid, utilizing robust flexbox/CSS grid stretching rules instead of fragile masonry libraries.
- **Performance & Virtualization**: 
  - Off-screen layout parsing and rendering is blocked natively using CSS `content-visibility: auto` paired with `contain-intrinsic-size` on clusters. This mimics robust list virtualization with virtually zero JS computation overhead.
  - Infinite scroll utilizes a pre-emptive `IntersectionObserver` sentinel to trigger lazy background hydration without user blocking.
- **Media**: Relies on `object-fit: cover` and native HTML `loading="lazy"`.
- **Data Flow**: classify → bucket → cluster → render.
