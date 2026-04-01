<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# FrameHouse

A cinematic gallery experience for screens, edits, posters, and scripts.

## Overview

FrameHouse is a React + Vite app for exploring cinematic screens, featured artists, posters, edits, and scripts across mobile and desktop layouts.

## Current Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS v4
- Motion
- React Router

## Project Notes

- Mobile and desktop layouts are separated under [`src/layouts`](/Users/karthikeya/Documents/The creatorz/Aera/src/layouts).
- Screen-specific views live under [`src/pages`](/Users/karthikeya/Documents/The creatorz/Aera/src/pages).
- Mock data is organized as JSON under [`src/mock`](/Users/karthikeya/Documents/The creatorz/Aera/src/mock) to stay closer to future backend payloads.
- Shared UI icon mappings live in [`src/components/AppIcons.tsx`](/Users/karthikeya/Documents/The creatorz/Aera/src/components/AppIcons.tsx).

## Data Rule

- Profiles such as artists and screens use `presence`.
- Individual works such as edits, posters, and scripts use `credits`.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
3. Type-check the app:
   `npm run lint`
