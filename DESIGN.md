---
name: Aera
colors:
  surface: "#050505"
  surface-dim: "#000000"
  surface-bright: "#2D1B14"
  on-surface: "#ffffff"
  on-surface-variant: "rgba(255, 255, 255, 0.45)"
  primary: "#ffffff"
  on-primary: "#000000"
  primary-container: "rgba(255, 255, 255, 0.05)"
  on-primary-container: "#ffffff"
  accent: "#D97706"
  accent-muted: "#A16207"
  background: "#050505"
  outline: "rgba(255, 255, 255, 0.1)"
typography:
  display:
    fontFamily: Londrina Outline
    fontWeight: "400"
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: "900"
    letterSpacing: 0.3em
    textTransform: uppercase
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "900"
    letterSpacing: 0.3em
    textTransform: uppercase
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: "900"
    letterSpacing: 0.2em
    textTransform: uppercase
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
rounded:
  md: 0.5rem
  lg: 0.75rem
  xl: 1rem
  "2xl": 1.5rem
  full: 9999px
spacing:
  sm: 8px
  md: 16px
  lg: 32px
components:
  glass-panel:
    backgroundColor: "rgba(0, 0, 0, 0.8)"
    backdropFilter: "blur(24px)"
    borderTop: "1px solid rgba(255, 255, 255, 0.05)"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: "{spacing.md} {spacing.lg}"
  card-interactive:
    backgroundColor: "{colors.primary-container}"
    border: "1px solid {colors.outline}"
    rounded: "{rounded.xl}"
    padding: "{spacing.md}"
---

## Brand & Style
Aera employs a **Cinematic, Dark-Luxury** design language. The aesthetic evokes the hushed, anticipatory atmosphere of a physical theatre just before a premiere. It balances stark, high-contrast typography with deeply textured, immersive backgrounds. The brand feels exclusive, premium, and inherently tied to the magic of the silver screen.

## Colors
The palette is rooted in deep darkness to make media the undeniable focal point, with warm, theatrical accents.

- **Background:** Core backgrounds utilize a rich, deep grey-black (`#050505` to `#000000`).
- **Accent:** "Theatre Amber" (`#D97706`) is used sparingly for highlights, focus states, and scrollbar thumbs to mimic warm incandescent theatre lighting.
- **Text:** High-contrast white for primary actions and active states. Secondary text aggressively steps down in opacity (`40%` to `45%`) to create dramatic hierarchy.
- **Surfaces:** Floating elements rely on highly translucent blacks (`rgba(0, 0, 0, 0.8)`) rather than solid grays, maintaining the depth of the dark canvas.

## Typography
The typographic system creates tension between geometric modernism and dramatic display.

- **Primary Sans (Inter):** Used for all functional text. Heavily utilizes extreme letter-spacing (`0.2em` to `0.3em`), `uppercase` transformations, and maximum font weights (`900` / `font-black`) for navigational elements, mimicking film credits and clapperboard text.
- **Display (Londrina Outline):** Imported for massive, atmospheric numbers or decorative elements, providing an airy contrast to the dense sans-serif.

## Layout & Spacing
- **Edge-to-Edge Canvas:** The core layout acts as an infinite canvas (Theatre mode), breaking traditional grid constraints to let media breathe.
- **Floating Controls:** Navigation and contextual actions float above the content in glass containers, ensuring the media is never fully obstructed.

## Elevation & Depth
Depth is created through cinematic lighting and lens effects rather than simple drop shadows.

- **The Ambient Layer:** Backgrounds feature subtle radial gradients and a "Cinematic Noise" texture (`mix-blend-overlay` SVG fractal noise) to simulate actual film grain.
- **The Glass Layer:** Modals and navigation bars use intense backdrop blurs (`blur-2xl`, `blur-3xl`) to separate UI from the media underneath, acting as frosted glass lenses.
- **The Glow:** Hover states and active selections utilize highly diffused, colored box-shadows (e.g., a pure white or amber glow) to look like elements are emitting light, not just casting shadows.

## Interaction & Motion
Motion is smooth, deliberate, and dramatic.

- **Spotlight Hover:** Interactive posters scale up, increase brightness, and emit an amber glow, simulating a spotlight hitting the artwork in a dark room.
- **Transitions:** Easing curves (e.g., `cubic-bezier(0.4, 0, 0.2, 1)`) with a generous `400ms` duration make interactions feel weighty and deliberate, avoiding the abruptness of standard web interactions.
