# AGENTS.md - Aera (FrameHouse)

## Commands
- `npm run dev` - Dev server on port 3000
- `npm run lint` - TypeScript check (`tsc --noEmit`)

## Architecture
- Routing: `src/app/App.tsx`
- Features: `src/features/{feature}/` (home, theatre, originals, navigation, shared)
- Mock data: `src/mock/*.json` (one file per type)
- Icons: `src/components/icons/AppIcons.tsx`

## Mobile vs Desktop
- `useMediaQuery()` in `src/hooks/useMediaQuery.ts` - defaults to 767px breakpoint
- Desktop redirects from `/` to `/theatre` on first visit (sessionStorage key: `hasVisitedDesktop`)

## Domain Conventions
- `presence` = reputation for profiles (artists/originals)
- `credits` = recognition for individual works (edits, posters, scripts)
- Content containers: `IMAX`, `WIDE`, `VERTICAL`, `SQUARE`
- Likes/comments = discovery; Credits define identity