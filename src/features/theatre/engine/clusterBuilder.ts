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
  let state = seed >>> 0;
  return function(): number {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * Generates a stable numeric seed from an array of TheatreItems.
 */
function getSeedFromItems(items: TheatreItem[]): number {
  if (!Array.isArray(items) || items.length === 0) return 1;
  let hash = 0;
  for (let i = 0; i < items.length; i++) {
    const id = String(items[i]?.id ?? i);
    for (let j = 0; j < id.length; j++) {
      hash = (hash << 5) - hash + id.charCodeAt(j);
      hash |= 0;
    }
  }
  return Math.abs(hash) || 1;
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
    if (!item) continue;
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

function fillCluster(
  type: keyof typeof CLUSTER_TEMPLATES, 
  bucket: Bucket
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

  return { type, slots };
}

function buildAdaptivePartialCluster(items: TheatreItem[], seed: number): Cluster | null {
  if (!Array.isArray(items) || items.length === 0) return null;
  const count = items.length;

  const edits = items.filter(isEditWork);
  const nonEdits = items.filter(i => !isEditWork(i));

  let templateSlots: ClusterSlot[] = [];

  if (count === 1) {
    if (edits.length === 1) {
      templateSlots = [{ type: "WIDE", x: 0, y: 0, w: 16, h: 6, item: edits[0] }];
    } else {
      templateSlots = [{ type: "VERTICAL", x: 6, y: 0, w: 4, h: 8, item: nonEdits[0] }];
    }
  } else if (count === 2) {
    if (edits.length >= 2) {
      templateSlots = [
        { type: "WIDE", x: 0, y: 0, w: 8, h: 4, item: edits[0] },
        { type: "WIDE", x: 8, y: 0, w: 8, h: 4, item: edits[1] },
      ];
    } else if (nonEdits.length >= 2) {
      templateSlots = [
        { type: "VERTICAL", x: 4, y: 0, w: 4, h: 8, item: nonEdits[0] },
        { type: "VERTICAL", x: 8, y: 0, w: 4, h: 8, item: nonEdits[1] },
      ];
    } else {
      templateSlots = [
        { type: "VERTICAL", x: 2, y: 0, w: 4, h: 8, item: nonEdits[0] },
        { type: "WIDE", x: 6, y: 2, w: 8, h: 4, item: edits[0] },
      ];
    }
  } else if (count === 3) {
    if (edits.length >= 1 && nonEdits.length >= 2) {
      // 1 Hero Edit in center (8x8), flanked by 2 Vertical Posters/Scripts (4x8 left, 4x8 right)
      templateSlots = [
        { type: "VERTICAL", x: 0, y: 0, w: 4, h: 8, item: nonEdits[0] },
        { type: "IMAX", x: 4, y: 0, w: 8, h: 8, item: edits[0] },
        { type: "VERTICAL", x: 12, y: 0, w: 4, h: 8, item: nonEdits[1] },
      ];
    } else if (edits.length >= 2) {
      templateSlots = [
        { type: "WIDE", x: 0, y: 0, w: 8, h: 4, item: edits[0] },
        { type: "WIDE", x: 8, y: 0, w: 8, h: 4, item: edits[1] },
        { type: "VERTICAL", x: 6, y: 4, w: 4, h: 8, item: nonEdits[0] || edits[2] },
      ];
    } else {
      templateSlots = [
        { type: "VERTICAL", x: 0, y: 0, w: 5, h: 8, item: nonEdits[0] },
        { type: "VERTICAL", x: 5, y: 0, w: 6, h: 8, item: nonEdits[1] },
        { type: "VERTICAL", x: 11, y: 0, w: 5, h: 8, item: nonEdits[2] },
      ];
    }
  } else if (count === 4) {
    if (edits.length >= 1) {
      const remaining = [...nonEdits, ...edits.slice(1)];
      templateSlots = [
        { type: "VERTICAL", x: 0, y: 0, w: 4, h: 8, item: remaining[0] },
        { type: "IMAX", x: 4, y: 0, w: 8, h: 8, item: edits[0] },
        { type: "VERTICAL", x: 12, y: 0, w: 4, h: 4, item: remaining[1] },
        { type: "VERTICAL", x: 12, y: 4, w: 4, h: 4, item: remaining[2] },
      ];
    } else {
      templateSlots = [
        { type: "VERTICAL", x: 0, y: 0, w: 4, h: 8, item: nonEdits[0] },
        { type: "VERTICAL", x: 4, y: 0, w: 4, h: 8, item: nonEdits[1] },
        { type: "VERTICAL", x: 8, y: 0, w: 4, h: 8, item: nonEdits[2] },
        { type: "VERTICAL", x: 12, y: 0, w: 4, h: 8, item: nonEdits[3] },
      ];
    }
  } else if (count >= 5) {
    if (edits.length >= 1) {
      const remaining = [...nonEdits, ...edits.slice(1)];
      templateSlots = [
        { type: "SQUARE", x: 0, y: 0, w: 4, h: 4, item: remaining[0] },
        { type: "IMAX", x: 4, y: 0, w: 8, h: 8, item: edits[0] },
        { type: "SQUARE", x: 12, y: 0, w: 4, h: 4, item: remaining[1] },
        { type: "SQUARE", x: 0, y: 4, w: 4, h: 4, item: remaining[2] },
        { type: "SQUARE", x: 12, y: 4, w: 4, h: 4, item: remaining[3] },
      ];
    } else {
      templateSlots = items.slice(0, 5).map((item, idx) => ({
        type: "VERTICAL",
        x: (idx % 4) * 4,
        y: Math.floor(idx / 4) * 8,
        w: 4,
        h: 8,
        item,
      }));
    }
  }

  return { id: `pc-${count}-${seed}`, type: `PARTIAL_${count}`, slots: templateSlots };
}

export interface ClusterResult {
  clusters: Cluster[];
  stackedItems: TheatreItem[];
}

export function buildClustersWithRemainder(
  items: TheatreItem[], 
  mode: 'canvas' | 'flow' = 'canvas'
): ClusterResult {
  if (!Array.isArray(items) || items.length === 0) {
    return { clusters: [], stackedItems: [] };
  }

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

  while (hasContent(bucket)) {
    const isFirst       = clusters.length === 0;
    const imaxWindowSum = imaxPrev + imaxCurr;

    const bucketCopy: Bucket = {
      edits: [...bucket.edits],
      poster: [...bucket.poster],
      storyboard: [...bucket.storyboard],
      recommendation: [...bucket.recommendation],
    };

    const type    = chooseCluster(bucketCopy, imaxWindowSum, isFirst, mode, rng);
    const candidateCluster = fillCluster(type, bucketCopy);

    const isFullyFilled = candidateCluster.slots.every(s => !!s.item);
    if (isFullyFilled) {
      bucket.edits = bucketCopy.edits;
      bucket.poster = bucketCopy.poster;
      bucket.storyboard = bucketCopy.storyboard;
      bucket.recommendation = bucketCopy.recommendation;

      clusters.push(candidateCluster);

      imaxPrev = imaxCurr;
      imaxCurr = candidateCluster.slots.filter(s => s.type === 'IMAX' && s.item && isEditWork(s.item)).length;
    } else {
      const remainingItems = [
        ...bucket.edits,
        ...bucket.poster,
        ...bucket.storyboard,
        ...bucket.recommendation,
      ];
      const partialCluster = buildAdaptivePartialCluster(remainingItems, seed);
      if (partialCluster) {
        clusters.push(partialCluster);
      }
      bucket.edits = [];
      bucket.poster = [];
      bucket.storyboard = [];
      bucket.recommendation = [];
      break;
    }

    if (clusters.length > 100) break; // Safety ceiling
  }

  return { clusters, stackedItems: [] };
}

export function buildClusters(items: TheatreItem[], mode: 'canvas' | 'flow' = 'canvas'): Cluster[] {
  return buildClustersWithRemainder(items, mode).clusters;
}
