# FrameHouse Entities & Relations

This document maps out the core entities within FrameHouse, how they interact, and who controls them.

## 1. Profiles

1. **Artist Profiles**: Creators who publish Works (Edits, Posters, Scripts). Artists own their personal **Wall** and curate their cinematic identity.
2. **Regular Profiles**: Fans who engage with content. They can favorite Artists, Star works, and participate in Set Walls. They do not publish Works.
3. **Originals (Admin/Verified)**: Every Original (movie/series) acts as its own entity and has a verified admin (usually the studio/makers of the original work).

## 2. Core Content Entities

### A. Works
The creative outputs of Artists. 
- **Types**: Edits (video), Posters (images), Scripts (visual storyboards).
- **Distribution**: Works are pushed to the global social feed (The Hall) and the respective Original theatres.
- **Metrics**: Works receive **Honours** (formerly Stars, via `HonourIcon`) and **Recommendation Scores** (via Resonance Hold).
- **Exhibition**: Each Work has a dedicated full-page Exhibition view at `/works/:id`. Three Exhibition types: `EditExhibition`, `PosterExhibition`, `ScriptExhibition`, all built on `ExhibitionFrame`.

### B. Origins
The source material (movies, series, music) that inspires Works. Every Work must reference an Origin (Attribution).

## 3. The Interaction Spaces (Walls & Cards)

### A. The Artist Wall (Personal Profile)
A highly curated, persistent "moodboard" or exhibition space on an Artist's profile.
- **Control**: Only the Artist can post to their personal Wall.
- **Format**: Artists can post **Lines** (text sentences/notes), or **Pin** Works/Originals with an attached **Line**.
- **Distribution**: Wall posts are **NOT** pushed to the global Hall feed. They are only broadcasted to the users who have explicitly *Favorited* the Artist. This creates a high-trust, intimate loop (bragging privilege).

### B. The Set Wall (Communal Space)
A micro-community space created around themes or movies.
- **Control**: Any member of the Set can post to the Set Wall.
- **Format Constraint**: **Lines (pure text) are strictly banned** to prevent toxicity, hate reviews, and mob mentality.
- **Cards (Visual Reactions)**: All engagement on the Set Wall must happen via **Cards**. These are high-fidelity, cinematic visual templates (using GIFs or beautifully typography-driven stills). This enforces a visual-first dialogue while maintaining the Dark-Luxury aesthetic.

## 4. The Exhibition System

When a user opens a Work, they enter the **Exhibition** — a dedicated full-page cinematic view.

### Layout
- **Desktop**: Two-column grid. Left = media, Right = `ArtistContextPanel` (380px).
- **Mobile**: Stacked. Media on top, identity block below, Artist Context Panel scrolls below that.

### `ExhibitionFrame` (shared wrapper)
All three work types (`EditExhibition`, `PosterExhibition`, `ScriptExhibition`) render inside `ExhibitionFrame`, which provides:
- Floating `ExhibitionNav` (Back + Share + Originals).
- YouTube-style identity block: title, artist avatar, artist name, favourite heart, action row (Honour, Pin, Wall, Save).
- Double-tap Honour mechanic via native touch listener.

### `ArtistContextPanel` (right column)
A tabbed panel with two views:
- **The Wall tab**: Artist's curated Lines and Pinned Works (rendered as full media cards).
- **In Theatre tab**: Other works by the same artist, rendered using the `MobileClusterView` cluster engine (up to 2 clusters).

### `ExhibitionNav` (floating chrome)
- Back button (top-left).
- Share button with `navigator.clipboard` + `execCommand` fallback.
- Originals button (only appears if the work has `originalIds`).
