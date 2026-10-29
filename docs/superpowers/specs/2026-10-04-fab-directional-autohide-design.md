# FAB Reading Mode & Directional Auto-Hide Design

**Date:** 2026-10-04  
**Feature:** Global Action FAB reading mode auto-hide and directional scroll behavior  
**Target File:** `src/components/GlobalActionFAB.tsx`

---

## 1. Problem Statement
When viewing long script works or storyboards on mobile devices, the floating action button (`GlobalActionFAB`) remains permanently fixed at the bottom-right of the viewport. This obstructs reading text and viewing full-screen vertical artwork. 

Root causes in the current implementation:
1. `isAtTop()` check (`window.scrollY <= 10`) permanently disabled the idle auto-hide timer whenever the user was at the top of a page or viewing full-viewport media.
2. `handleTouchStart` unconditionally called `setIsVisible(true)` on every touch, forcing the FAB to reappear even when tapping to read or flipping storyboard pages.
3. The idle timer threshold was long (3500ms) and ineffective.

---

## 2. Solution & Desired Behavior
1. **Unconditional 2.5s Idle Timer**:
   - The FAB will automatically fade out and slide downwards after 2.5 seconds of inactivity on any page, including script and storyboard viewers.
   - The `isAtTop()` check blocking idle hiding is removed.
2. **Intentional Scroll-Up to Reveal**:
   - Swiping down to scroll content up (`deltaY < -25` on mobile, negative wheel delta on desktop) immediately reveals the FAB and resets the 2.5s idle timer.
3. **Scroll-Down to Dismiss**:
   - Swiping up to scroll content down (`deltaY > 25` on mobile, positive wheel delta on desktop) immediately dismisses the FAB without waiting for the timer.
4. **Non-Intrusive Touch Gestures**:
   - `handleTouchStart` will record the start position without forcibly calling `setIsVisible(true)`. Standard reading taps and horizontal page turns will not awaken the FAB.
5. **Modal & Radial Menu Safety**:
   - When the radial action menu (`isMenuOpen`), recommendation modal (`isModalOpen`), or any other active dialog is open, the FAB remains visible and interactive until dismissed.

---

## 3. Component Architecture & State

### 3.1 State Changes in `GlobalActionFAB.tsx`
- `isVisible: boolean`: controls visibility and animated transform.
- `idleTimerRef: useRef<NodeJS.Timeout | null>`: 2500ms idle countdown.
- `lastTouchYRef`: tracks touch movement delta.
- `accumulatedDelta`: accumulator for swipe threshold.

### 3.2 Motion Styling
```tsx
<motion.div
  animate={{
    opacity: isVisible ? 1 : 0,
    y: isVisible ? 0 : 70,
    scale: isVisible ? 1 : 0.9,
    pointerEvents: isVisible ? "auto" : "none",
  }}
  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
/>
```

---

## 4. Verification Plan
1. Open a long script work / storyboard on mobile viewport.
2. Confirm the FAB smoothly disappears after 2.5 seconds of idle reading.
3. Confirm tapping on the script or flipping storyboard pages does NOT summon the FAB.
4. Confirm scrolling down dismisses the FAB immediately.
5. Confirm scrolling up smoothly brings the FAB back.
6. Confirm holding or tapping the FAB opens menus normally and does not auto-hide while open.
7. Run `npm run lint` and `npm run build` to verify clean build.
