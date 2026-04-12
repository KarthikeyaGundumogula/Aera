# Theatre Layout Engine: Backend Migration Guide

This document explains the core logic of the `CinepoeticCanvas` and its layout construction engine (`clusterBuilder.ts`). When migrating this construction logic to the backend, the backend should ideally assume the responsibility of classifying media, selecting clusters, and passing down pre-calculated clusters (`Cluster[]`) to the frontend for simple mapping and rendering. 

## 1. The Core Concepts

The infinite grid is based on a **Cluster** system.
- A **Cluster** is a predefined grid template (`12` columns wide, `9` rows high).
- The frontend renders an infinite 2D canvas by tiling these clusters infinitely. Currently, it loops over an array of pre-built clusters (`clusterPool`) generated from mock data.
- Each Cluster has predefined **Slots**. A **Slot** has an `x, y` coordinate and `w, h` dimensions.

## 2. Classification Phase (Bucketing)

Before any layout construction begins, incoming `TheatreItems` are sorted into a `Bucket` object based on their `category` and `aspectRatio`. 

The classification rules are:
- **Scripts:** Go to the `script` bucket.
- **Posters:** Go to the `poster` bucket.
- **Edits/Media (Video/Images):** Handled by aspect ratio (`r = width / height`):
  - `r >= 2.2`: `imax` bucket
  - `r >= 1.6`: `wide` bucket
  - `r <= 0.7`: `vertical` bucket
  - Anything else: `square` bucket

## 3. The Cluster Templates

The engine uses four main templates (defined in `CLUSTER_TEMPLATES`), each serving a distinct rhythm/mood:

1. **Template A (Hero/IMAX):** Designed for huge cinematic shots. Features a massive 12x6 `IMAX` slot with two `WIDE` slots underneath.
2. **Template B (Mixed Standard):** A highly modular mix of `WIDE`, `VERTICAL`, and `SQUARE` slots. Good for standard media consumption.
3. **Template C (Vertical-Heavy):** Favors `VERTICAL` slots up top and right, with `SQUARE` slots scattered throughout. Excellent for TikTok/Reel styled edits.
4. **Template D (Poster-Heavy):** Composed almost entirely of strict `VERTICAL` bounds, designed to stack posters perfectly similar to a movie display.

## 4. The Selection Algorithm (`chooseCluster`)

The backend must decide which template to use dynamically relying on the current state of the buckets. The system uses randomness mixed with deterministic rules to maintain visual rhythm.

When iterating through construction:
1. **Hero Priority:** If it's the very first cluster and the `imax` bucket has content, forcefully return **Template A**.
2. **Poster Blocks:** If there are > 4 items in the `poster` bucket, there is a 50% chance to return **Template D** to create a focused poster wall.
3. **IMAX Density Control:** The engine tracks history (`imaxWindowSum`) to prevent overcrowding. It ensures no more than two IMAX-heavy blocks appear back-to-back. If safe, and `imax` items exist, there's a 30% chance for **Template A**.
4. **Vertical Bias:** If there are >= 2 vertical items left, or by a 60% chance, return **Template C**.
5. **Fallback:** Otherwise, return **Template B**.

## 5. The Fill Algorithm (`fillCluster`)

Once a template is chosen, the backend must assign items from the buckets into the template `slots`. This happens via a priority-based multi-pass system:

- **Pass 1 (Primary Priority):** Items from `imax`, `wide`, `vertical`, and `square` buckets are cleanly pulled to match the exact slot types. *Crucially, there is a hard stop: no more than 6 Edits (video) per cluster to manage UI thread loading and visual density.*
- **Pass 2 (Secondary Priority - Posters):** Any empty `VERTICAL` or `SQUARE` slots are back-filled using available items from the `poster` bucket.
- **Pass 3 (Tertiary Priority - Scripts):** Any remaining `SQUARE` slots that are exactly `3x3` in size are filled with items from the `script` bucket. Scripts *only* render cleanly in `3x3` containers.
- **Pass 4 (Fallbacks):** Any slots still empty generate dummy representations (Fallback Media or Systems Nodes).

## 6. Migration Summary

To move this to the backend:
1. The backend implements the categorization and cluster generation logic.
2. An endpoint (e.g. `GET /api/feed/theatre`) returns the JSON array representing `Cluster[]`.
3. The frontend `CinepoeticCanvas` receives this `Cluster[]` and simply applies the `clusterData.slots` to its CSS grid logic.
4. Optionally, the frontend's procedural coordinates `(x * 31 + y * 17)` that loop the array to simulate infinity can be kept client-side if a small set of clusters is sent, or the backend can implement standard pagination.
