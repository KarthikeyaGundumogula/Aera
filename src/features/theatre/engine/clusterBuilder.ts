import { TheatreItem } from "../../../types";
import {
  isEditWork,
  isPosterWork,
  isScriptWork,
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
  imax: TheatreItem[];
  wide: TheatreItem[];
  vertical: TheatreItem[];
  square: TheatreItem[];
  poster: TheatreItem[];
  script: TheatreItem[];
};

export interface ClusterSlot {
  type: "IMAX" | "WIDE" | "VERTICAL" | "SQUARE" | "WIDE_LG" | "WIDE_SM";
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
    { type: "WIDE", x: 0, y: 0, w: 6, h: 3 },
    { type: "SQUARE", x: 6, y: 0, w: 6, h: 3 },
    { type: "VERTICAL", x: 0, y: 3, w: 3, h: 6 },
    { type: "SQUARE", x: 3, y: 3, w: 3, h: 3 },
    { type: "SQUARE", x: 6, y: 3, w: 6, h: 3 },
    { type: "SQUARE", x: 3, y: 6, w: 3, h: 3 },
    { type: "SQUARE", x: 6, y: 6, w: 6, h: 3 },
  ],
  C: [
    { type: "VERTICAL", x: 0, y: 0, w: 3, h: 6 },
    { type: "VERTICAL", x: 3, y: 0, w: 3, h: 6 },
    { type: "WIDE", x: 6, y: 0, w: 6, h: 3 },
    { type: "SQUARE", x: 6, y: 3, w: 6, h: 3 },
    { type: "SQUARE", x: 0, y: 6, w: 3, h: 3 },
    { type: "SQUARE", x: 3, y: 6, w: 3, h: 3 },
    { type: "SQUARE", x: 6, y: 6, w: 6, h: 3 },
  ],
  D: [ // Poster-heavy template
    { type: "VERTICAL", x: 0, y: 0, w: 3, h: 6 },
    { type: "VERTICAL", x: 3, y: 0, w: 3, h: 6 },
    { type: "VERTICAL", x: 6, y: 0, w: 3, h: 6 },
    { type: "VERTICAL", x: 9, y: 0, w: 3, h: 6 },
    { type: "WIDE", x: 0, y: 6, w: 6, h: 3 },
    { type: "WIDE", x: 6, y: 6, w: 6, h: 3 },
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
    imax: [],
    wide: [],
    vertical: [],
    square: [],
    poster: [],
    script: [],
  };

  for (const item of items) {
    const r = item.aspectRatio || 1;

    if (isScriptWork(item)) {
      bucket.script.push(item);
      continue;
    }

    if (isPosterWork(item)) {
      bucket.poster.push(item);
      continue;
    }

    if (isEditWork(item) || item.category === undefined || item.category === "Edit") {
      if (r >= 2.2) bucket.imax.push(item);
      else if (r >= 1.6) bucket.wide.push(item);
      else if (r <= 0.7) bucket.vertical.push(item);
      else bucket.square.push(item);
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

  if (isFirst && bucket.imax.length > 0) return "A";
  if (bucket.poster.length > 4 && rng() < 0.5) return "D";
  if (bucket.imax.length > 0 && imaxWindowSum < 2 && rng() < 0.3) return "A";
  if (bucket.vertical.length >= 2 || rng() < 0.6) return "C";
  
  return "B";
}

function createFallback(id: string, w: number, h: number, rng: () => number): TheatreItem {
  const isSquare3x3 = w === 3 && h === 3;
  if (isSquare3x3) {
    return {
      id: `fallback-script-${id}`,
      title: "THE VOID: A Cinematic Reflection",
      artist: "FRAMEHOUSE SYSTEM",
      category: "Script" as const,
      image: `https://picsum.photos/seed/${id}/800/1200`,
      aspectRatio: 0.75,
      credits: 1.0,
    };
  }
  return {
    id: `fallback-media-${id}`,
    title: "FRAMEHOUSE SYSTEM // ARCHIVE",
    artist: "FRAMEHOUSE SYSTEM",
    category: "Edit" as const,
    image: `https://picsum.photos/seed/${id}/${w * 200}/${h * 200}`,
    aspectRatio: w / h,
  };
}

function fillCluster(
  type: keyof typeof CLUSTER_TEMPLATES, 
  bucket: Bucket, 
  masterBucket: Bucket,
  rng: () => number
): Cluster {
  const template = CLUSTER_TEMPLATES[type];
  const slots: ClusterSlot[] = template.map(s => ({ ...s, item: undefined })) as ClusterSlot[];
  let editCount = 0;

  const isEdit = (it: TheatreItem) => isEditWork(it);

  // PASS 1: Primary items
  for (const slot of slots) {
    if (editCount >= 6) break; 
    
    let item: TheatreItem | undefined = undefined;
    switch (slot.type) {
      case "IMAX": item = bucket.imax.shift(); break;
      case "WIDE": item = bucket.wide.shift(); break;
      case "WIDE_LG": item = bucket.wide.shift(); break;
      case "WIDE_SM": item = bucket.wide.shift(); break;
      case "VERTICAL": item = bucket.vertical.shift(); break;
      case "SQUARE": item = bucket.square.shift(); break;
    }

    if (item) {
      slot.item = item;
      if (isEdit(item)) editCount++;
    }
  }

  // PASS 2: Posters
  for (const slot of slots) {
    if (slot.item) continue;
    if (slot.type === "VERTICAL" || slot.type === "SQUARE") {
      const item = bucket.poster.shift();
      if (item) {
        slot.item = item;
        if (isEdit(item)) editCount++;
      }
    }
  }

  // PASS 3: Scripts
  for (const slot of slots) {
    if (slot.item) continue;
    if (slot.w === 3 && slot.h === 3) {
      const item = bucket.script.shift();
      if (item) {
        slot.item = item;
      }
    }
  }

  // PASS 4: Strategic Duplication
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (slot.item) continue;

    let repeatedItem: TheatreItem | undefined = undefined;
    const getRandom = (arr: TheatreItem[]) => arr.length > 0 ? arr[Math.floor(rng() * arr.length)] : undefined;

    switch (slot.type) {
      case "IMAX": repeatedItem = getRandom(masterBucket.imax); break;
      case "WIDE": repeatedItem = getRandom(masterBucket.wide); break;
      case "VERTICAL": repeatedItem = getRandom(masterBucket.vertical); break;
      case "SQUARE": repeatedItem = getRandom(masterBucket.square); break;
    }

    if (!repeatedItem) {
      const anyEdits = [...masterBucket.imax, ...masterBucket.wide, ...masterBucket.vertical, ...masterBucket.square];
      repeatedItem = getRandom(anyEdits);
    }

    if (!repeatedItem) {
      const allMedia = [...masterBucket.imax, ...masterBucket.wide, ...masterBucket.vertical, ...masterBucket.square, ...masterBucket.poster, ...masterBucket.script];
      repeatedItem = getRandom(allMedia);
    }

    if (repeatedItem) {
      slots[i].item = { ...repeatedItem, id: `${repeatedItem.id}-dup-${i}-${rng().toString(36).substr(2, 9)}` };
    } else {
      slots[i].item = createFallback(`${type}-${i}-${rng()}`, slots[i].w, slots[i].h, rng);
    }
  }

  return { type, slots: slots as ClusterSlot[] };
}

export function buildClusters(items: TheatreItem[], mode: 'canvas' | 'flow' = 'canvas'): Cluster[] {
  if (!items.length) return [];
  
  const seed = getSeedFromItems(items);
  const rng = createPRNG(seed);

  const masterItems = [...items];
  const masterBucket = classify(masterItems);
  const bucket = classify([...items]); 
  const clusters: Cluster[] = [];
  const imaxHistory: number[] = [0, 0]; 

  const shuffle = <T,>(array: T[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  shuffle(bucket.wide);
  shuffle(bucket.poster);
  shuffle(bucket.square);
  shuffle(bucket.vertical);
  shuffle(bucket.script);

  const hasContent = (b: Bucket) => 
    b.imax.length > 0 || b.wide.length > 0 || b.vertical.length > 0 || b.square.length > 0 || b.poster.length > 0 || b.script.length > 0;

  while (hasContent(bucket)) {
    const isFirst = clusters.length === 0;
    const imaxWindowSum = imaxHistory.reduce((a, b) => a + b, 0);
    const type = chooseCluster(bucket, imaxWindowSum, isFirst, mode, rng);
    const cluster = fillCluster(type, bucket, masterBucket, rng);
    
    clusters.push(cluster);
    
    const currentImaxCount = cluster.slots.filter(s => s.type === 'IMAX' && s.item && (isEditWork(s.item))).length;
    imaxHistory.push(currentImaxCount);
    if (imaxHistory.length > 2) imaxHistory.shift();

    if (clusters.length > 100) break; 
  }

  return clusters;
}
