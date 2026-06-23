# FrameHouse

A cinematic gallery experience for originals, edits, posters, and scripts.

## Overview

FrameHouse is a React-based web application that serves as a cinematic gallery, showcasing originals, edits, posters, and scripts. The app is designed to provide an immersive experience for users to explore and discover various cinematic works.

## Current Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS v4
- Motion
- React Router

## Project Notes

- Mobile and desktop layouts are separated under [`src/layouts`](/Users/karthikeya/Documents/The creatorz/FrameHouse/src/layouts).
- Original-specific views live under [`src/pages`](/Users/karthikeya/Documents/The creatorz/FrameHouse/src/pages).
- Mock data is organized as JSON under [`src/mock`](/Users/karthikeya/Documents/The creatorz/FrameHouse/src/mock) to stay closer to future backend payloads.
- Shared UI icon mappings live in [`src/components/AppIcons.tsx`](/Users/karthikeya/Documents/The creatorz/FrameHouse/src/components/AppIcons.tsx).

## Data Rule

- Profiles such as artists and originals use `presence`.
- Individual works such as edits, posters, and scripts use `credits`.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
3. Type-check the app:
   `npm run lint`

## Usage Credits

- **Agents:** All the Agents configs and skills are taken from the [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) repository.