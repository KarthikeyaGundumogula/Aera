import { TheatreItem } from "../../../types";
import {
  isEditWork,
  isPosterWork,
  isStoryboardWork,
  isRecommendationWork,
} from "../../shared/work/types";

/**
 * Deterministic PRNG to ensure layout stability across re-renders.
 * Standard LCG (Linear Congruential Generator).
 */
function createPRNG(seed: number) {
  let state = seed;
  return function() {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Generates a stable numeric seed from an array of TheatreItems.
 */
function getSeedFromItems(items: TheatreItem[]): number {
  const str = items.map(it => it.id).join("");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

type Bucket = {
  edits: TheatreItem[];
  poster: TheatreItem[];
  storyboard: TheatreItem[];
  recommendation: TheatreItem[];
};

export interface ClusterSlot {
  type: "IMAX" | "WIDE" | "VERTICAL" | "SQUARE";
  x: number;
  y: number;
  w: number;
  h: number;
  item?: TheatreItem;
}

export interface Cluster {
  id?: string;
  type: string;
  slots: ClusterSlot[];
}

const CLUSTER_TEMPLATES = {
  A: [
    { type: "IMAX", x: 0, y: 0, w: 12, h: 6 },
    { type: "WIDE", x: 0, y: 6, w: 6, h: 3 },
    { type: "WIDE", x: 6, y: 6, w: 6, h: 3 },
  ],
  B: [
    { type: "WIDE",     x: 0, y: 0, w: 6, h: 3 },
    { type: "WIDE",     x: 6, y: 0, w: 6, h: 3 },
    { type: "VERTICAL", x: 0, y: 3, w: 3, h: 6 },
    { type: "SQUARE",   x: 3, y: 3, w: 3, h: 3 },
    { type: "SQUARE",   x: 6, y: 3, w: 3, h: 3 },
    { type: "SQUARE",   x: 9, y: 3, w: 3, h: 3 },
    { type: "SQUARE",   x: 3, y: 6, w: 3, h: 3 },
    { type: "WIDE",     x: 6, y: 6, w: 6, h: 3 },
  ],
  C: [
    { type: "VERTICAL", x: 0, y: 0, w: 3, h: 6 },
    { type: "VERTICAL", x: 3, y: 0, w: 3, h: 6 },
    { type: "WIDE",     x: 6, y: 0, w: 6, h: 3 },
    { type: "SQUARE",   x: 6, y: 3, w: 3, h: 3 },
    { type: "SQUARE",   x: 9, y: 3, w: 3, h: 3 },
    { type: "SQUARE",   x: 0, y: 6, w: 3, h: 3 },
    { type: "SQUARE",   x: 3, y: 6, w: 3, h: 3 },
    { type: "WIDE",     x: 6, y: 6, w: 6, h: 3 },
  ],
  D: [ // Poster-heavy template
    { type: "VERTICAL", x: 0, y: 0, w: 3, h: 6 },
    { type: "VERTICAL", x: 3, y: 0, w: 3, h: 6 },
    { type: "VERTICAL", x: 6, y: 0, w: 3, h: 6 },
    { type: "VERTICAL", x: 9, y: 0, w: 3, h: 6 },
    { type: "WIDE",     x: 0, y: 6, w: 6, h: 3 },
    { type: "WIDE",     x: 6, y: 6, w: 6, h: 3 },
  ],
  F: [ // Vertical Anchor — VERTICAL + SQUARE (16×8)
    { type: "VERTICAL", x: 0, y: 0, w: 4, h: 8 },
    { type: "SQUARE",   x: 4, y: 0, w: 4, h: 4 },
    { type: "SQUARE",   x: 8, y: 0, w: 4, h: 4 },
    { type: "SQUARE",   x: 12, y: 0, w: 4, h: 4 },
    { type: "SQUARE",   x: 4, y: 4, w: 4, h: 4 },
    { type: "SQUARE",   x: 8, y: 4, w: 4, h: 4 },
    { type: "SQUARE",   x: 12, y: 4, w: 4, h: 4 },
  ],
  G: [ // IMAX Spotlight — IMAX + SQUARE (16×8)
    { type: "SQUARE", x: 0, y: 0, w: 4, h: 4 },
    { type: "IMAX",   x: 4, y: 0, w: 8, h: 8 },
    { type: "SQUARE", x: 12, y: 0, w: 4, h: 4 },
    { type: "SQUARE", x: 0, y: 4, w: 4, h: 4 },
    { type: "SQUARE", x: 12, y: 4, w: 4, h: 4 },
  ],
  H: [ // Wide Zig-Zag — WIDE + SQUARE (16×8)
    { type: "WIDE",   x: 0, y: 0, w: 8, h: 4 },
    { type: "SQUARE", x: 8, y: 0, w: 4, h: 4 },
    { type: "SQUARE", x: 12, y: 0, w: 4, h: 4 },
    { type: "SQUARE", x: 0, y: 4, w: 4, h: 4 },
    { type: "SQUARE", x: 4, y: 4, w: 4, h: 4 },
    { type: "WIDE",   x: 8, y: 4, w: 8, h: 4 },
  ],
  I: [ // Anchor Wide — VERTICAL + WIDE + SQUARE (16×8)
    { type: "VERTICAL", x: 0, y: 0, w: 4, h: 8 },
    { type: "WIDE",     x: 4, y: 0, w: 8, h: 4 },
    { type: "SQUARE",   x: 12, y: 0, w: 4, h: 4 },
    { type: "SQUARE",   x: 4, y: 4, w: 4, h: 4 },
    { type: "SQUARE",   x: 8, y: 4, w: 4, h: 4 },
    { type: "SQUARE",   x: 12, y: 4, w: 4, h: 4 },
  ],
  J: [ // Quad Grid — SQUARE only, max density (16×8)
    { type: "SQUARE", x: 0, y: 0, w: 4, h: 4 },
    { type: "SQUARE", x: 4, y: 0, w: 4, h: 4 },
    { type: "SQUARE", x: 8, y: 0, w: 4, h: 4 },
    { type: "SQUARE", x: 12, y: 0, w: 4, h: 4 },
    { type: "SQUARE", x: 0, y: 4, w: 4, h: 4 },
    { type: "SQUARE", x: 4, y: 4, w: 4, h: 4 },
    { type: "SQUARE", x: 8, y: 4, w: 4, h: 4 },
    { type: "SQUARE", x: 12, y: 4, w: 4, h: 4 },
  ],
};

function classify(items: TheatreItem[]): Bucket {
  const bucket: Bucket = {
    edits: [],
    poster: [],
    storyboard: [],
    recommendation: [],
  };

  for (const item of items) {
    if (isRecommendationWork(item)) {
      bucket.recommendation.push(item);
    } else if (isStoryboardWork(item)) {
      bucket.storyboard.push(item);
    } else if (isPosterWork(item)) {
      bucket.poster.push(item);
    } else {
      bucket.edits.push(item);
    }
  }

  return bucket;
}

function chooseCluster(
  bucket: Bucket, 
  imaxWindowSum: number, 
  isFirst: boolean = false,
  mode: 'canvas' | 'flow' = 'canvas',
  rng: () => number
): keyof typeof CLUSTER_TEMPLATES {
  if (mode === 'flow') {
    const flowOptions: (keyof typeof CLUSTER_TEMPLATES)[] = ["F", "G", "H", "I", "J"];
    return flowOptions[Math.floor(rng() * flowOptions.length)];
  }

  if (isFirst && bucket.edits.length > 0) return "A";
  if (bucket.poster.length > 4 && rng() < 0.5) return "D";
  if (bucket.edits.length > 0 && imaxWindowSum < 2 && rng() < 0.3) return "A";
  if (bucket.poster.length + bucket.storyboard.length >= 2 || rng() < 0.6) return "C";
  
  return "B";
}

interface ClusterState {
  sinceLastRec: number;
}

function fillCluster(
  type: keyof typeof CLUSTER_TEMPLATES, 
  bucket: Bucket, 
  masterBucket: Bucket,
  rng: () => number,
  _clusterState: ClusterState
): Cluster {
  const template = CLUSTER_TEMPLATES[type];
  const slots: ClusterSlot[] = template.map(s => ({ ...s, item: undefined })) as ClusterSlot[];

  // PASS 1: Primary assignment based on slot category rules
  for (const slot of slots) {
    if (slot.item) continue;
    let item: TheatreItem | undefined = undefined;

    switch (slot.type) {
      case "IMAX":
      case "WIDE":
        // IMAX and WIDE (Academy) take EDITS only
        item = bucket.edits.shift();
        break;

      case "VERTICAL":
        // VERTICAL takes Posters first, then Storyboards, then Edits as fallback
        item = bucket.poster.shift() || bucket.storyboard.shift() || bucket.edits.shift();
        break;

      case "SQUARE":
        // SQUARE takes everything: Storyboards, Posters, Edits, Recommendations
        item = bucket.storyboard.shift() || bucket.poster.shift() || bucket.edits.shift() || bucket.recommendation.shift();
        break;
    }

    if (item) {
      slot.item = item;
    }
  }

  // PASS 2: Secondary assignment for remaining unfilled slots if pools still have items
  for (const slot of slots) {
    if (slot.item) continue;
    let item: TheatreItem | undefined = undefined;

    switch (slot.type) {
      case "IMAX":
      case "WIDE":
        item = bucket.edits.shift();
        break;

      case "VERTICAL":
        item = bucket.poster.shift() || bucket.storyboard.shift() || bucket.edits.shift();
        break;

      case "SQUARE":
        item = bucket.storyboard.shift() || bucket.poster.shift() || bucket.edits.shift() || bucket.recommendation.shift();
        break;
    }

    if (item) {
      slot.item = item;
    }
  }

  // PASS 3: Fallback pass recycling from masterBucket so no slots remain empty/black
  const pickFallback = (pool: TheatreItem[]) => {
    if (!pool.length) return undefined;
    const idx = Math.floor(rng() * pool.length);
    return pool[idx];
  };

  const allMasterItems = [
    ...masterBucket.edits,
    ...masterBucket.poster,
    ...masterBucket.storyboard,
    ...masterBucket.recommendation,
  ];

  for (const slot of slots) {
    if (slot.item) continue;
    let item: TheatreItem | undefined = undefined;

    switch (slot.type) {
      case "IMAX":
      case "WIDE":
        // IMAX and WIDE (Academy) take EDITS ONLY
        item = pickFallback(masterBucket.edits);
        break;

      case "VERTICAL":
        item = pickFallback(masterBucket.poster) || pickFallback(masterBucket.storyboard) || pickFallback(masterBucket.edits);
        break;

      case "SQUARE":
        item = pickFallback(masterBucket.storyboard) || pickFallback(masterBucket.poster) || pickFallback(masterBucket.edits) || pickFallback(masterBucket.recommendation);
        break;
    }

    if (item) {
      slot.item = item;
    }
  }

  return { type, slots };
}

export function buildClusters(items: TheatreItem[], mode: 'canvas' | 'flow' = 'canvas'): Cluster[] {
  if (!items.length) return [];

  const seed = getSeedFromItems(items);
  const rng  = createPRNG(seed);

  const masterBucket = classify([...items]);
  const bucket: Bucket = {
    edits:          [...masterBucket.edits],
    poster:         [...masterBucket.poster],
    storyboard:     [...masterBucket.storyboard],
    recommendation: [...masterBucket.recommendation],
  };

  const clusters: Cluster[] = [];
  let imaxPrev = 0;
  let imaxCurr = 0;

  const shuffle = <T,>(array: T[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  shuffle(bucket.edits);
  shuffle(bucket.poster);
  shuffle(bucket.storyboard);

  const hasContent = (b: Bucket) =>
    b.edits.length > 0 || b.poster.length > 0 || b.storyboard.length > 0 || b.recommendation.length > 0;

  const clusterState: ClusterState = { sinceLastRec: 0 };

  while (hasContent(bucket)) {
    const isFirst       = clusters.length === 0;
    const imaxWindowSum = imaxPrev + imaxCurr;
    const type    = chooseCluster(bucket, imaxWindowSum, isFirst, mode, rng);
    const cluster = fillCluster(type, bucket, masterBucket, rng, clusterState);

    // Only add the cluster if at least one slot was filled with a real item.
    const hasRealItems = cluster.slots.some(s => !!s.item);
    if (hasRealItems) {
      clusters.push(cluster);
    }

    imaxPrev = imaxCurr;
    imaxCurr = cluster.slots.filter(s => s.type === 'IMAX' && s.item && isEditWork(s.item)).length;

    if (clusters.length > 100) break; // Safety ceiling
  }

  return clusters;
}
