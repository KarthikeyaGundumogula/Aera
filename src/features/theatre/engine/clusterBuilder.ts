import { TheatreItem } from "../../../types";
import {
  isEditWork,
  isPosterWork,
  isScriptWork,
} from "../../shared/work";

export type Bucket = {
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

export function classify(items: TheatreItem[]): Bucket {
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

    if (isEditWork(item) || item.category === undefined) {
      if (r >= 2.2) bucket.imax.push(item);
      else if (r >= 1.6) bucket.wide.push(item);
      else if (r <= 0.7) bucket.vertical.push(item);
      else bucket.square.push(item);
    } else {
      // Fallback for other types if any
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
  mode: 'canvas' | 'flow' = 'canvas'
): keyof typeof CLUSTER_TEMPLATES {
  if (mode === 'flow') {
    const flowOptions: (keyof typeof CLUSTER_TEMPLATES)[] = ["F", "G", "H", "I", "J"];
    // Simply cycle or randomly pick for flow
    return flowOptions[Math.floor(Math.random() * flowOptions.length)];
  }

  // Force IMAX for the hero section if available
  if (isFirst && bucket.imax.length > 0) return "A";

  // If we have many posters, favor Template D
  if (bucket.poster.length > 4 && Math.random() < 0.5) return "D";

  // Limit Template A (Ultra Wide) to 30% chance even if available
  if (bucket.imax.length > 0 && imaxWindowSum < 2 && Math.random() < 0.3) return "A";
  
  // Favor Template C (Vertical/Square) over Template B (Wide)
  if (bucket.vertical.length >= 2 || Math.random() < 0.6) return "C";
  
  return "B";
}

function createFallback(id: string, w: number, h: number): TheatreItem {
  const isSquare3x3 = w === 3 && h === 3;
  if (isSquare3x3) {
    return {
      id: `fallback-script-${id}`,
      title: "THE VOID: A Cinematic Reflection",
      artist: "FRAMEHOUSE SYSTEM",
      category: "Script",
      type: "image",
      image: "https://picsum.photos/seed/script/800/1200",
      aspectRatio: 0.75,
      origins: "INT. THE GRID - NIGHT",
      credits: 1.0,
      isPlay: false
    };
  }
  return {
    id: `fallback-media-${id}`,
    title: "FRAMEHOUSE SYSTEM // ARCHIVE",
    artist: "FRAMEHOUSE SYSTEM",
    category: "Edit",
    type: "image",
    image: `https://picsum.photos/seed/media-${id}/${w * 200}/${h * 200}`,
    aspectRatio: w / h,
    isPlay: false
  };
}

function fillCluster(type: keyof typeof CLUSTER_TEMPLATES, bucket: Bucket): Cluster {
  const template = CLUSTER_TEMPLATES[type];
  const slots: ClusterSlot[] = template.map(s => ({ ...s, item: undefined })) as ClusterSlot[];
  let editCount = 0;

  // Helper to check if item is an edit
  const isEdit = (it: TheatreItem) => isEditWork(it);

  // PASS 1: Primary Edits/Images (Highest Priority)
  for (const slot of slots) {
    // Density control: Max 6 edits per cluster
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

  // PASS 2: Posters (Secondary Priority for Vertical/Square)
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

  // PASS 3: Scripts (Lower Priority - "Extra Chance" - ONLY in 3x3)
  for (const slot of slots) {
    if (slot.item) continue;
    // Rule: Scripts only in 3x3 square cards
    if (slot.w === 3 && slot.h === 3) {
      const item = bucket.script.shift();
      if (item) {
        slot.item = item;
      }
    }
  }

  // PASS 4: Fallbacks (Absolute Last Resort)
  for (let i = 0; i < slots.length; i++) {
    if (!slots[i].item) {
      slots[i].item = createFallback(`${type}-${i}-${Math.random()}`, slots[i].w, slots[i].h);
    }
  }

  return { type, slots: slots as ClusterSlot[] };
}

export function buildClusters(items: TheatreItem[], mode: 'canvas' | 'flow' = 'canvas'): Cluster[] {
  const bucket = classify([...items]); // Clone to avoid mutation
  const clusters: Cluster[] = [];
  const imaxHistory: number[] = [0, 0]; // Track IMAX count of last 2 clusters

  // Shuffle for variety
  const shuffle = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
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
    const type = chooseCluster(bucket, imaxWindowSum, isFirst, mode);
    const cluster = fillCluster(type, bucket);
    
    clusters.push(cluster);
    
    // Update history for density control (Max 2 IMAX in 3 clusters)
    const currentImaxCount = cluster.slots.filter(s => s.type === 'IMAX' && s.item && (s.item.type === 'video' || s.item.category === 'Edit')).length;
    imaxHistory.push(currentImaxCount);
    if (imaxHistory.length > 2) imaxHistory.shift();

    // Safety break to prevent infinite loop if bucket isn't shrinking
    if (clusters.length > 100) break; 
  }

  return clusters;
}
