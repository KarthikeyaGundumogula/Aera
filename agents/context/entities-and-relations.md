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
- **Metrics**: Works receive **Stars** and **Recommendation Scores** (via Resonance Hold).

### B. Origins
The source material (movies, series, music) that inspires Works. Every Work must reference an Origin (Attribution).

## 3. The Interaction Spaces (Walls & Cards)

### A. The Artist Wall (Personal Profile)
A highly curated, persistent "moodboard" or exhibition space on an Artist's profile.
- **Control**: Only the Artist can post to their personal Wall.
- **Format**: Artists can post raw text, or **Pin** Works/Originals with a "Director's Note".
- **Distribution**: Wall posts are **NOT** pushed to the global Hall feed. They are only broadcasted to the users who have explicitly *Favorited* the Artist. This creates a high-trust, intimate loop (bragging privilege).

### B. The Set Wall (Communal Space)
A micro-community space created around themes or movies.
- **Control**: Any member of the Set can post to the Set Wall.
- **Format Constraint**: **Raw text is strictly banned** to prevent toxicity, hate reviews, and mob mentality.
- **Cards (Visual Reactions)**: All engagement on the Set Wall must happen via **Cards**. These are high-fidelity, cinematic visual templates (using GIFs or beautifully typography-driven stills). This enforces a visual-first dialogue while maintaining the Dark-Luxury aesthetic.
