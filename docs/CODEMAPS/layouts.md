# Theatre Layouts Codemap

**Last Updated:** 2026-04-15
**Key Files:** 
- `clusterBuilder.ts` (Logic Engine)
- `HomeFeedLayout.tsx` (Entry Point)
- `StaticDesktopCluster.tsx` (Desktop Grid)

## Architecture Overview

The FrameHouse layout system is a **Deterministic Cluster Engine**. It handles data flow from raw items to cinematic grids through a pipeline that ensures visual variety without randomness.

```text
[ Data Flow Pipeline ]

   Raw Items         classify()         Buckets          buildClusters()
 +-----------+     +------------+    +-----------+      +----------------+
 | works.json| --> | Logic Gate | -->| imax,wide | ---> | Choose Template|
 +-----------+     +------------+    | vertical  |      | Fill Slots     |
                                     | posters   |      +--------+-------+
                                     +-----------+               |
                                                                 v
   Render UI       StaticCluster       Cluster[]         Final Selection
 +-----------+     +------------+    +-----------+      +----------------+
 | Cinematic | <---| React Grid | <---|  A - J    | <--- | (Canvas/Flow)  |
 |   Feed    |     +------------+    +-----------+      +----------------+
 +-----------+
```

## 1. Desktop Cluster Engine

### Flow Mode (Home Feed)
Used for the infinite vertical scroll on the Home Page. Focuses on high-density, asymmetric variety using 16x8 grids.

| Template | Type | Layout Ratio | Description |
| :--- | :--- | :--- | :--- |
| **Template F** | Vertical Anchor | 16×8 | Large vertical slot on the left, flanked by a 2x3 square grid. |
| **Template G** | IMAX Spotlight | 16×8 | Massive IMAX center slot with square fragments on the corners. |
| **Template H** | Wide Zig-Zag | 16×8 | Two wide slots in a diagonal pattern, balanced by square shards. |
| **Template I** | Anchor Wide | 16×8 | Vertical pillar with wide horizontal emphasis. |
| **Template J** | Quad Grid | 16×8 | Pure high-density square grid (the "Archive" look). |

### Canvas Mode (Theatre)
Standard 12x9 units used in the full Theatre Canvas for infinite 2D exploration (Templates A-D).

## 2. Mobile Cinematic Stack

To maintain visual focus on mobile, the layout avoids clusters in favor of a **Strict Single-Column Stack**.

- **Width**: `100%` viewport width.
- **Rhythm**: One work per row (Poster, Edit, or Script).
- **Aspect Ratio**: Naturally preserved (no cropping or stretching).

## 3. The Native Interaction Model

We use a decentralized "Native" click model where the component itself is responsible for identifying its intent.

```text
[ Interaction Flow ]

 USER CLICK
    |
    v
 Component (Source of Truth)
    |
    +---- [Original Card] ----> Navigate to /originals/:id
    |
    +---- [Work Card] --------> Signal onSelect(item)
                                    |
                                    v
                                 Page Handler
                                    |
                                    +--- [Edit]   ---> Open QuickView
                                    +--- [Poster] ---> Open WorkModal
                                    +--- [Script] ---> Open WorkModal
```

## Related Documentation
- [Theatre Layout Engine (Backend Guide)](file:///Users/karthikeya/Documents/The%20creatorz/Aera/docs/theatre-layout-engine.md)
- [Frontend Context](file:///Users/karthikeya/Documents/The%20creatorz/Aera/agents/context/fe-context.md)
