# FAB Reading Mode & Directional Auto-Hide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable automatic 2.5-second idle hiding and directional scroll awareness on GlobalActionFAB so reading scripts and storyboards on mobile is completely unobstructed.

**Architecture:** Refactor scroll, wheel, and touch event tracking in `src/components/GlobalActionFAB.tsx` to remove the top-of-page lock, eliminate intrusive touchstart wakeups, and enforce true directional scroll hiding.

**Tech Stack:** React, TypeScript, Framer Motion (`motion/react`), React Router DOM.

## Global Constraints
- **Zero Git Commits**: Never execute `git add`, `git commit`, or `git push` without explicit user command. Leave all changes unstaged.
- **No Database Migrations**: Do not modify any database files or schemas.

---

### Task 1: Update GlobalActionFAB Visibility and Gesture Engine

**Files:**
- Modify: `src/components/GlobalActionFAB.tsx:65-175`

**Interfaces:**
- Consumes: `isMenuOpen: boolean`, `isModalOpen: boolean`
- Produces: `isVisible: boolean`, updated event listeners for `wheel`, `touchstart`, `touchmove`, `scroll`

- [ ] **Step 1: Update idle timer and remove `isAtTop` lock**
  - Set idle timeout duration to `2500ms`.
  - Remove `isAtTop()` check from the idle timeout callback so it auto-hides even when viewing scripts at `scrollY === 0`.
  - Pause idle countdown only when `isMenuOpen || isModalOpen`.

- [ ] **Step 2: Update touch handlers (`handleTouchStart` and `handleTouchMove`)**
  - In `handleTouchStart`: Record `lastTouchY = e.touches[0].clientY` and reset `accumulatedDelta = 0`. Do NOT call `setIsVisible(true)`.
  - In `handleTouchMove`: Calculate `deltaY = lastTouchY - currentTouchY`.
    - If `accumulatedDelta > 25` (swiping up / scrolling down): `setIsVisible(false)`, `setShowHint(false)`, reset `accumulatedDelta = 0`.
    - If `accumulatedDelta < -25` (swiping down / scrolling up): `setIsVisible(true)`, reset `accumulatedDelta = 0`, restart idle timer.

- [ ] **Step 3: Update wheel handler (`handleWheel`)**
  - If `accumulatedDelta > 25` (scrolling down): `setIsVisible(false)`, `setShowHint(false)`, reset `accumulatedDelta = 0`.
  - If `accumulatedDelta < -25` (scrolling up): `setIsVisible(true)`, reset `accumulatedDelta = 0`, restart idle timer.

- [ ] **Step 4: Update document / scroll container listener (`handleScroll`)**
  - When scrolling downwards: set `setIsVisible(false)`.
  - When scrolling upwards: set `setIsVisible(true)` and restart idle timer.

- [ ] **Step 5: Verify build and TypeScript lint**
  - Run `npm run lint` (`tsc --noEmit`) to verify 0 errors.
  - Run `npm run build` (`vite build`) to verify successful compilation.
