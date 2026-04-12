# Architectural & UX Context Archive 

*This document summarizes the exact state of the UX paradigms, architectural decisions, and layout structuring achieved to date. Any agent modifying the codebase must read this to maintain UI parity and design philosophies.*

## 1. The Design Philosophy ("Living Cinema")
The platform abandons standard "web page" design in favor of an immersive "app" or "environment" experience.
- **Colors:** True extreme dark mode (`#050505`, `#000`) serving as a pitch-black canvas for heavy, vibrant cinematic imagery.
- **Typography:** Deep structural contrast. Huge, heavily compressed titles (`tracking-tighter`, `leading-none`) juxtaposed against microscopic, ultra-spaced metadata labels (e.g. `text-[10px] uppercase tracking-[0.3em] font-bold`).
- **Interactive Depth (Framer Motion):** Standard states do not pop in. Everything must stagger-fade (`opacity: 0, y: 16`), scale smoothly on hover, and rely heavily on backdrop filters (`backdrop-blur-xl`, `bg-black/40`, `bg-white/10`).

## 2. Layout Structuring Strategy
We do not use standard "1 container fits all" responsive logic. Layouts are strictly tailored.
- **Mobile Constraints:** Mobile screens utilize tight padded boxes (e.g., `px-6`), heavy vertical stacking, and clean `rounded-2xl` corners.
- **Desktop Full-Bleed:** The `HomeFeedLayout.tsx` entirely abandons CSS constraints like `max-w-7xl` on desktop (`md:` breakpoints). The desktop view becomes a native edge-to-edge application using `100vw`. Hero banners melt cleanly into the background, and scrolling rails stretch instantly off-screen.

## 3. Core Technical Abstractions
We aggressively decoupled inline JSX bloat to maintain clean Root level Layout (`src/layouts/...`) code. All advanced UI exists entirely in `/src/components/`.
- **`TheatreFeedItem.tsx`:** Standardizes how every piece of media is displayed across the platform. Handles intrinsic Masonry Grid logic and dynamic aspect ratios. It holds three states based on data type:
    - `Script`: Custom off-white premium `#f4f1ea` paper background with monospace typography.
    - `Edit/Video`: Overlays interactive Glassmorphism badges with "Scanning" light glow animations natively built-in.
    - `Poster`: Adds sparkle micro-indicators inside dark blurred glass pills.
- **`ArtistCard.tsx`:** An isolated component that handles scaling via a `variant` property. Automatically blows up the Avatar dimensions on `featured` mode for Home, while keeping `default` tight for nested pages.
- **`TopOriginalsAccordion.tsx`:** Handcrafted massive sliding flex-row. Employs a complex conditional algorithm that automatically triggers native Browser `scrollIntoView()` smooth-centering functions *exclusively* on Mobile screens (`window.innerWidth < 1024`).
- **`SectionHeader.tsx`:** Unified sub-label generation to rip out duplicated `opacity-40` `<divs>`.

## 4. The Feed Modalities
- **The Home & Original Pages (Masonry):** The feed structures found in `HomeFeedLayout.tsx` and `OriginalPage.tsx` ("Wall Of Fame") completely abandoned rigid grid matrices in favor of dynamic CSS masonry scaling up to incredibly dense metrics on desktop (`2xl:columns-6`).
- **The Theatre Page (Infinite Canvas):** The `TheatreLayout.tsx` intentionally avoids vertical Masonry logic. It mounts an advanced 2-Axis interactive infinite layer (`CinepoeticCanvas`) designed uniquely to plot interconnected media visually.

## 5. Interaction Modals
- **`QuickView.tsx`:** The centralized overlay player. Automatically hijacks the root DOM to lock `document.body.style.overflow = "hidden"` while active so the user can interact cleanly without shifting the heavy masonry grid underneath them.

**CRITICAL RULE FOR ALL FUTURE AGENTS:**
DO NOT touch the structural padded geometries on Mobile views. Let Desktop scale infinitely using `100vw` or custom `grid` boundaries using tailwind prefix breakpoints (`md:`, `lg:`, `xl:`), but Mobile viewports must remain completely rigid and curated.
