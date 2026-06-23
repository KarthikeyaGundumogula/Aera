# FrameHouse (FrameHouse) Codebase Wiki

## 1. Project Vision & Core Philosophy

**FrameHouse** is a digital theatre for cinematic expressions—a space where audiences evolve into Artists, and works become expression. It is a "Living Cinema" where discovery begins with interaction, and identity is defined by recognition.

- **Philosophy:** Consistency over novelty, Expression over content, Identity over engagement, Space over density.
- **Layers:** 
  - **Interaction Layer:** Likes & Comments. Low-friction, drives discovery.
  - **Recognition Layer:** Credits. High-weight, requires "Presence" to give, defines an artist's reputation.

## 2. Core Entities

1. **Artists / Profiles:** Creators who publish Works. Regular users can view, like, and comment, but eventually earn enough "Presence" to grant Credits. "Star" and "Maker" profiles use immersive 3D film-strip representations.
2. **Works:** The creative outputs from Artists. These come in multiple forms:
   - *Edits:* Video sequences (16:9 IMAX, WIDE, VERTICAL).
   - *Posters:* Visual redesigns / static images (SQUARE, 2:3).
   - *Scripts/Theories:* Textual expansions / narrative essays.
3. **Origins:** The source material (e.g., movies like OG, RRR, KGF). Every Work is tied to an Original.
4. **Presence:** A reputation score defined *only* by the accumulation of Credits received. It acts as an unlock mechanism for the platform's social economy.
5. **Thoughts & Sequences (The Lobby):** A parallel communication layer distinct from Works. "Thoughts" are script-fragment notes tagged to Originals/Works. They earn "Hits" (Palms) instead of standard upvotes. When a threshold is met, the author can "Unlock" it into a "Sequence"—a deep, community-owned discussion thread housed inside Sets.
6. **The Hall (formerly Lounge):** The personalized, curated timeline for the user. It functions not as a generic scroll feed, but as a series of cinematic scenes blending Works, Festivals, Discussions, and Ledger entries.

## 3. Web Development Rules & Architecture

As outlined in `RULES.md` and the frontend guidelines:

- **Strict Type Safety:** TypeScript is mandatory. `any` must never be used. Public APIs and components must be strongly typed.
- **State Management:** URL-as-state is preferred. Perfect separation of server state and client state. Immutable updates over mutating shared state.
- **Component Pattern:** Compound components are favored for flexible, headless UI structures.
- **Mock Data Handling:** All mock data resides explicitly in `src/mock/*.json` / `src/mock/*.ts`.
- **Domain-Based Architecture:** Functionality is segregated into `src/features` (`home`, `navigation`, `originals`, `shared`, `theatre`).
- **Agent Enforcement:** Code reviews and structural refactors must strictly respect AI agent guidelines found in `agents/`. Always use specialized agents for domain tasks.

## 4. Frontend Layout Engine & Modals

The UI relies heavily on a determinative "Theatrical" layout engine.

### **Desktop Theatre (Grid Systems)**
- An "infinite" 2D cinematic canvas with multidirectional axes.
- A 12-column structure with fixed clusters (e.g., templates F-J) ensuring max 2 edits per cluster and at least 1 theory to provide breathing room.

### **Mobile Theatre (Vertical Cinema)**
- Pure vertical alignment using mathematically strict `2 columns x 6 rows` CSS Grids (`MobileClusterView.tsx`).
- The entire cluster container's height is bound to `40dvh` (or a `1:1` aspect ratio), which mathematically guarantees that the internal grid cells output perfect intrinsic geometries without complex height mapping:
  - **Squares (1-col, 3-rows):** Perfect 1:1 aspect ratio.
  - **Verticals (1-col, 6-rows):** Perfect 1:2 cinematic poster ratio.
  - **IMAX (2-col, 3-rows):** Perfect 2:1 widescreen panorama.
- Ensures exactly two clusters fit gracefully onto a mobile viewport with a slight tease of a third.

### **Immersive Modals (`WorkModal` & `QuickView`)**
- `WorkModal` uses the maximum 95% threshold rules for width/containment. Pixel-perfect shrink-wrapping without distortion (aspect preservation). 
- Modals avoid intrusive UI. Clutter is toggled off completely via interactive controls to prioritize the art piece.
- Artists' identity/portfolio cards display via "3D Flips", utilizing `backface-visibility: hidden` and native gesture management.

## 5. Security & Browser Integrity

- All `<video>` playback utilizes `crossOrigin="anonymous"` via nested `<source type="video/mp4" />` logic.
- Graceful fallbacks using `onError` tracking to downgrade blockages into static posters instantly.
- Strict separation of backdrop triggers and modal interaction paths (to prevent nested modals from force-closing parents by bubbling).

## 6. Third-Party Embeds & Compliance

To drastically lower bandwidth usage and maintain strict compliance with third-party service policies, the backend only transmits a `platform` and `platformId` per video work. The frontend constructs the embedded players dynamically. No custom scripts are run without consent.

**Example Constructions:**
- **YouTube:** Given `platform: "youtube"` and `platformId: "GG1_DsScm6U"`, the client securely maps to an iframe src: `https://www.youtube.com/embed/GG1_DsScm6U`.
- **Twitter:** Given `platform: "twitter"` and `platformId: "2044620780550427076"`, the client maps to the canonical UI player using libraries like `react-tweet` tied purely to the status ID. This ensures complete compliance with X's terms of service by fetching native cards safely without mutating their frame restrictions.
