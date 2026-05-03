
### [Profile Page Documentation](file:///Users/karthikeya/.gemini/antigravity/brain/8ad402e9-6e3d-4903-91d1-2ef7cf8347a2/profile_page_documentation.md)

This document serves as the "source of truth" for:
*   **The Identity System:** The minimalist handle format (`- HANDLE -`), the flex-based technical frames, and the glowing identifiers.
*   **Performance Rules:** Use of `useDeferredValue` and the `ProfileSkeleton` for lag-free navigation.
*   **Theming Logic:** How the system handles custom artist palettes (like the classic Red/Black or the experimental Light mode).
*   **Responsive Standards:** How vertical markers and typography scale between desktop and mobile.

### Next Step: Artist Setup Refinement
Now that the Profile Page is fully documented and finalized, we are ready to update the **Artist Setup Page** (The Stage Rite). 

My plan for the Setup Page is to:
1.  **Sync the Aesthetic:** Ensure the setup preview perfectly matches the new `- HANDLE -` and "Flex Frame" rules we just finalized.
2.  **Interactive Fidelity:** Add the same glowing effects to the preview so creators see exactly what their "Stage" will look like in the Archive.
3.  **Real-time Validation:** Ensure the name and tagline inputs provide immediate visual feedback in the cinematic preview.

**Shall we proceed with the Artist Setup Page updates?**

```markdown:profile_page_documentation.md
# Aera: Profile Stage Architecture & Design Documentation

## 1. Overview
The Profile Page (or "The Stage") is the definitive identity record for creators within the Aera Archive. It is designed to feel like a high-fidelity cinematic archive, balancing immersive visual scale with technical metadata markers.

## 2. Core Architecture
### Performance & Responsiveness
- **Deferred Rendering:** Uses `useDeferredValue` for `profileId` lookups. This ensures the UI shell paints instantly upon navigation while the data-heavy grid and metrics resolve in the background.
- **Rules of Hooks:** All `useMemo` and `useState` calls are positioned at the top of the component to ensure stability during high-frequency profile switching.
- **Cinematic Skeleton:** A dedicated `ProfileSkeleton` component mimics the final layout with shimmer effects to prevent layout shift.

### Theming System
The page uses a lookup-based theme system (`THEMES` constant) driven by the profile ID:
- **Default Theme:** Deep Black (`#050505`) with Red cinematic accents (`#EF4444`).
- **Custom Overrides:** Individual profiles can override background, text, and primary identifiers (e.g., "fh-001" for specialized palettes).
- **Dynamic Blending:** The hero section uses a `linear-gradient` to bridge the themed header into the standard dark content feed.

## 3. Visual Language
### Identity Markers
- **Cinematic Handle:** Displayed as `- HANDLE -` (uppercase, wide-tracked monospace) with horizontal technical lines and a soft white glow.
- **Vertical Archive IDs:** Vertical technical labels flanking the portrait.
- **Identity Text:** Massive, low-opacity SVG text in the background showing the creator's name, acting as a structural "watermark."

### Portrait Section (Identity Frame)
- **Flex Anchoring:** Portraits and vertical labels are wrapped in a single Flex container to prevent "drift" on mobile.
- **Fidelity:** Features `object-top` cropping, a `rounded-2xl` frame, and a `white/10` border with deep shadows.

## 4. Interaction Model
### Action Group
- **Follow Stage:** A high-contrast pill button. States toggle between "Follow" (Solid) and "Following" (Glass/Outlined).
- **Favorite:** A minimalist circular button with a red-glow heart activation.
- **Animations:** All interactions utilize `motion/react` with `whileHover` (1.02x scale) and `whileTap` (0.98x scale) for tactile feedback.

### Scroll Behavior
- **Floating Nav:** The `ProfileNav` becomes visible/opaque only after a 20px scroll threshold to maintain the immersive hero experience on initial load.

## 5. Responsive Standards
- **Mobile Grid:** The desktop "Theatre Clusters" are flattened into a single-column stack on mobile.
- **Typography Scaling:** Name titles use `clamp()` for fluid scaling; taglines scale from `text-base` (mobile) to `text-xl` (desktop).
- **Identity Frame:** Labels scale down to `6px` on mobile with reduced padding to maintain composition on narrow screens.
```