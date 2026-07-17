# FrameHouse Entities & Relations

This document maps out the core entities within FrameHouse, how they interact, and who controls them.

## 1. Profiles

1. **Artist Profiles**: Creators who publish Works (Edits, Posters, Storyboards). Artists own their personal **Wall** and curate their cinematic identity.
2. **Regular Profiles**: Fans who engage with content. They can favorite Artists, Star works, and participate in Set Walls. They do not publish Works.
3. **Originals (Admin/Verified)**: Every Original (movie/series) acts as its own entity and has a verified admin (usually the studio/makers of the original work).

## 2. Core Content Entities

### A. Works
The creative outputs of Artists. 
- **Types**: Edits (video), Posters (images), Storyboards (visual sequences).
- **Distribution**: Works are pushed to the global social feed (The Hall) and the respective Original theatres.
- **Metrics**: Works receive **Stars** (via premium `gold-metal` gradient) and **Recommendation Scores** (via Resonance Hold).
- **Exhibition**: Each Work has a dedicated full-page Exhibition view at `/works/:id`. Three Exhibition types: `EditExhibition`, `PosterExhibition`, `StoryboardExhibition`, all built on `ExhibitionFrame`.

### B. Origins
The source material (movies, series, music) that inspires Works. Every Work must reference an Origin (Attribution).
- **Metric (Peak Presence)**: Origins are measured by their "Peak Presence", reflecting their historical high-water mark of influence on the platform (calculated via the volume/reach of Works crediting it and its gravity in Festivals/Discussions).

## 3. The Interaction Spaces (Walls & Cards)

### A. The Wall (Personal Profile)
A highly curated, persistent "moodboard" or exhibition space on a user's profile.
- **Control**: Only the profile owner can post to their personal Wall.
- **Format**: Users can post **Lines** (text sentences/notes), or **Pin** Works/Originals with an attached **Line**.
- **Distribution**: Wall posts are **NOT** pushed to the global Hall feed. They are only broadcasted to the users who have explicitly *Favorited* the owner. This creates a high-trust, intimate loop.
- **Artist Reactions (The Acknowledgment Seal)**: There are no comment sections on the Wall. Instead, if an audience member Pins an Artist's work to their Wall with a quote, the original Artist can leave a visual reaction (a curated seal or meme/GIF template). This provides a massive "Creator Liked" dopamine hit without the toxicity of open text comments.

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
All three work types (`EditExhibition`, `PosterExhibition`, `StoryboardExhibition`) render inside `ExhibitionFrame`, which provides:
- Floating `ExhibitionNav` (Back + Share + Originals).
- YouTube-style identity block: title, artist avatar, artist name, favourite heart, action row (Star, Pin, Save).
- Double-tap Star mechanic via native touch listener.

### `ArtistContextPanel` (right column)
A tabbed panel with two views:
- **The Wall tab**: Artist's curated Lines and Pinned Works (rendered as full media cards).
- **In Theatre tab**: Other works by the same artist, rendered using the `MobileClusterView` cluster engine (up to 2 clusters).

### `ExhibitionNav` (floating chrome)
- Back button (top-left).
- Share button with `navigator.clipboard` + `execCommand` fallback.
- Originals button (only appears if the work has `originalIds`).
