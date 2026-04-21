# Migration & Enhancement Plan: Originals Library Scale

This document serves as a roadmap for evolving the Originals Discovery system as the FrameHouse library transitions from 100s to 10,000s of artifacts.

## Phase 1: Robust Fuzzy Matching (Current to 1,000 items)
**Target**: Improve user error tolerance (typos).
- **Implementation**: Integrate `Fuse.js`.
- **Reasoning**: Standard `.includes()` is strict. A typo like "Inteception" returns zero results. Fuse.js uses Bitap algorithms to handle partial matches and transpositions.
- **Complexity**: Low.

## Phase 2: Live Archive API (1,000 to 5,000 items)
**Target**: Stop bundling data in the client JS bundle.
- **Implementation**:
    - Build a `GET /api/originals/directory` endpoint that returns minimal JSON (id, title, thumb).
    - Use `React Query` on the frontend for stale-while-revalidate caching.
- **Reasoning**: Bundling thousands of objects in the main JS bundle increases initial load time (LCP) for the user.
- **Complexity**: Medium.

## Phase 3: Server-Side Search Orchestration (5,000+ items)
**Target**: Professional-grade high-speed search.
- **Implementation**:
    - Replace client-side filtering with a backend Search Engine (**Typesense**, **Meilisearch**, or **Elasticsearch**).
    - Frontend sends debounced requests (`debounce(300ms)`) to a `/search` endpoint.
- **Reasoning**: Browser memory starts to lag when filtering 10k+ objects in real-time. Specialist search engines handle this in microseconds.
- **Complexity**: High.

## Phase 4: Cinematic Intelligence
**Target**: Premium User Experience.
- **Visual Hints**: Implement "Search Recommendations" based on trending projects or artist history.
- **Voice Search**: "The Identity Rite" via voice commands for tablet/mobile users.
- **Visual Search**: Using neural embeddings to find projects based on visual context or "vibe" (CLIP model integration).

## Future-Proofing Requirements
1. **Debouncing**: All search inputs should be debounced before hitting any API.
2. **Pagination/Infinite Scroll**: Search results should be paginated (e.g., 20 at a time) to keep the DOM light.
3. **Optimistic UI**: Selections should be updated in the "Selected Dock" immediately, even if the backend sync is trailing.
