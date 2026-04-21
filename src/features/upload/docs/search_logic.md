# Search Logic Documentation: Credits Selection

This document outlines the technical implementation of the search and selection logic for "Originals" within the FrameHouse Release Rite (Upload Flow).

## Current Implementation: Client-Side Metadata Filtering

As of the current version, the system utilizes a **Search-First** approach to handle the discovery of library artifacts.

### 1. Data Source
The source of truth is a local mock array (`ORIGINALS`) imported from `src/mock/index.ts`. This mimics a pre-fetched metadata directory that would typically be retrieved from a `GET /api/originals/metadata` endpoint.

### 2. The Search Index
The search is powered by a `useMemo` hook that reactively filters the library whenever the `searchQuery` state changes.

```typescript
const filteredResults = useMemo(() => {
  if (!searchQuery.trim()) return [];
  const query = searchQuery.toLowerCase();
  return originals.filter(o => 
    o.title.toLowerCase().includes(query) || 
    o.id.toLowerCase().includes(query)
  );
}, [originals, searchQuery]);
```

### 3. Selection Persistence
Selections are tracked by an array of IDs (`selectedIds`) passed down from the parent `UploadPage`. This ensures that even when a user clears their search or changes queries, their previously selected items remain "checked" and part of the release.

### 4. Visual Selection Dock
To improve user experience with multi-selection, we implement a **Selected Dock**.
- **Logic**: A filtered subset of the library where `o.id` exists in `selectedIds`.
- **UI**: Displayed as a row of small thumbnails above the search bar.
- **Action**: Users can remove items directly from the dock without having to find them again in the search results.

### 5. Performance Considerations (Current Scale)
- **Time Complexity**: $O(N)$ where $N$ is the number of originals.
- **Latency**: Sub-1ms for up to 1,000 items. 
- **Memory**: The metadata objects are lightweight strings and small image URLs, keeping the impact on browser memory minimal.

## UI States
- **Initial State**: Empty search bar, horizontal selection dock (if items were picked in a previous session), and a "Begin search" placeholder.
- **Active Search**: Real-time grid filtering with Framer Motion layout animations.
- **Zero Results**: A dedicated "No matching artifacts" view to confirm to the user that they didn't just miss the item.
