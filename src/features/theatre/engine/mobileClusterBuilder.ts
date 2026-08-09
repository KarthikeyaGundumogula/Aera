import { TheatreItem } from "../../../types";
import {
  isEditWork,
  isPosterWork,
  isStoryboardWork,
  isRecommendationWork,
} from "../../shared/work";

// ─── Types ───────────────────────────────────────────────────────────────────

// Unified 3-type slot model (Academy collapsed into Square — identical geometry).
type MobileClusterType = 'A' | 'B' | 'C' | 'D' | 'E';

type MobileSlotType = 'Wide' | 'Vertical' | 'Square';

export interface MobileSlot {
  item: TheatreItem | null;
  type: MobileSlotType;
}

export interface MobileCluster {
  id: string;
  type: MobileClusterType;
  slots: MobileSlot[];
}

// ─── Templates ───────────────────────────────────────────────────────────────
// Slot type → visual shape mapping (grid geometry lives in MobileClusterView):
//   Wide     → col-span-2 row-span-3  (full-width banner)
//   Vertical → col-span-1 row-span-6  (tall portrait)
//   Square   → col-span-1 row-span-3  (half-width square)

const TEMPLATES: Record<MobileClusterType, Omit<MobileSlot, 'item'>[]> = {
  // A: Wide top banner + two squares beneath
  'A': [{ type: 'Wide' }, { type: 'Square' }, { type: 'Square' }],
  // B: Vertical left anchor + two squares right
  'B': [{ type: 'Vertical' }, { type: 'Square' }, { type: 'Square' }],
  // C: Two squares left + vertical right anchor
  'C': [{ type: 'Square' }, { type: 'Vertical' }, { type: 'Square' }],
  // D: Two squares top + wide bottom banner
  'D': [{ type: 'Square' }, { type: 'Square' }, { type: 'Wide' }],
  // E: Two verticals side by side (poster gallery)
  'E': [{ type: 'Vertical' }, { type: 'Vertical' }],
};

const SEQUENCE: MobileClusterType[] = ['A', 'C', 'B', 'D', 'E'];

// ─── PRNG ────────────────────────────────────────────────────────────────────

/**
 * Deterministic LCG PRNG — same algorithm as the desktop clusterBuilder.
 * Replaces Math.random() in the duplication pass so layouts are stable
 * across re-renders and hydration.
 */
function createPRNG(seed: number) {
  let state = seed >>> 0; // ensure unsigned 32-bit
  return function (): number {
    state = ((state * 1664525 + 1013904223) >>> 0);
    return state / 4294967296;
  };
}

function getSeed(items: TheatreItem[]): number {
  const str = items.map(i => i.id).join('');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

// ─── Item selection ──────────────────────────────────────────────────────────

function findAndRemove(
  items: TheatreItem[],
  predicate: (i: TheatreItem) => boolean,
): TheatreItem | null {
  const idx = items.findIndex(predicate);
  return idx !== -1 ? items.splice(idx, 1)[0] : null;
}

/**
 * Pre-computed, slot-type-keyed views into the master pool.
 * Built once per buildMobileClusters call — avoids repeated .filter() inside the hot loop.
 */
interface MasterPools {
  wide:     TheatreItem[]; // edits with ratio ≥ 1.1 (wide/imax)
  vertical: TheatreItem[]; // edits with ratio < 0.9
  square:   TheatreItem[]; // scripts + square edits + posters (in priority order)
  any:      TheatreItem[]; // all items — ultimate fallback
}

function buildMasterPools(items: TheatreItem[]): MasterPools {
  const getAspect = (i: TheatreItem) => i.aspectRatio || 1;
  return {
    wide:     items.filter(i => isEditWork(i) && getAspect(i) >= 1.1),
    vertical: items.filter(i => isEditWork(i) && getAspect(i) < 0.9),
    // Recommendations first, then storyboards, posters, square-ratio edits
    square:   items.filter(i => isRecommendationWork(i) || isStoryboardWork(i) || isPosterWork(i) || (isEditWork(i) && getAspect(i) >= 0.9 && getAspect(i) < 1.1)),
    any:      items,
  };
}

function pickBestItem(
  slotType: MobileSlotType,
  availableItems: TheatreItem[],
  pools: MasterPools,
  rng: () => number,
  clusterState: { sinceLastRec: number; placedRecThisCluster: boolean }
): TheatreItem | null {
  const getAspect = (i: TheatreItem) => i.aspectRatio || 1;
  let found: TheatreItem | null = null;

  // ── Primary pass: consume available pool ─────────────────────────────────
  if (availableItems.length > 0) {
    if (slotType === 'Wide') {
      found = findAndRemove(availableItems, i => isEditWork(i) && getAspect(i) >= 1.6);
      if (!found) found = findAndRemove(availableItems, i => isEditWork(i) && getAspect(i) >= 1.1);
      if (!found) found = findAndRemove(availableItems, i => isEditWork(i) && getAspect(i) >= 0.9);
      if (!found) found = findAndRemove(availableItems, isEditWork);
    } else if (slotType === 'Vertical') {
      found = findAndRemove(availableItems, i => isEditWork(i) && getAspect(i) < 0.9);
      if (!found) found = findAndRemove(availableItems, isEditWork);
    } else {
      // Square
      // If we are starved of recommendations, pull one first
      if (clusterState.sinceLastRec >= 1 && !clusterState.placedRecThisCluster) {
        found = findAndRemove(availableItems, isRecommendationWork);
        if (found) clusterState.placedRecThisCluster = true;
      }
      
      // Standard priority
      if (!found) found = findAndRemove(availableItems, isStoryboardWork);
      if (!found) found = findAndRemove(availableItems, isPosterWork);
      
      // Fallback: low priority recommendation
      if (!found && !clusterState.placedRecThisCluster) {
        found = findAndRemove(availableItems, isRecommendationWork);
        if (found) clusterState.placedRecThisCluster = true;
      }
      
      // Fallback: edit
      if (!found) found = findAndRemove(availableItems, i => isEditWork(i) && getAspect(i) >= 0.9 && getAspect(i) < 1.1);
    }

    // Drain any remaining item rather than falling through to duplication
    if (!found && availableItems.length > 0) {
      found = availableItems.splice(0, 1)[0];
    }
  }

  return found;
}

// ─── Public builder ──────────────────────────────────────────────────────────

export function buildMobileClusters(items: TheatreItem[]): MobileCluster[] {
  if (items.length === 0) return [];

  const rng            = createPRNG(getSeed(items));
  const pools          = buildMasterPools(items);
  const availableItems = [...items];
  const clusters: MobileCluster[] = [];
  let seqIndex = 0;

  const clusterState = { sinceLastRec: 0, placedRecThisCluster: false };

  // Produce clusters only while real items remain in the pool.
  while (availableItems.length > 0) {
    clusterState.placedRecThisCluster = false;
    const clusterType = SEQUENCE[seqIndex % SEQUENCE.length];
    const template    = TEMPLATES[clusterType];

    const slots: MobileSlot[] = template.map(tmpl => ({
      ...tmpl,
      item: pickBestItem(tmpl.type, availableItems, pools, rng, clusterState),
    }));

    // Skip the cluster entirely if no real items were placed.
    const hasRealItems = slots.some(s => s.item !== null);
    if (!hasRealItems) break;

    clusters.push({
      id: `mc-${clusters.length}-${clusterType}-${rng().toString(36).substring(2, 7)}`,
      type: clusterType,
      slots,
    });

    if (clusterState.placedRecThisCluster) {
      clusterState.sinceLastRec = 0;
    } else {
      clusterState.sinceLastRec++;
    }

    seqIndex++;
    if (clusters.length > 40) break; // Safety ceiling
  }

  return clusters;
}

export function getMobileClusterHeight(cluster: MobileCluster): string {
  const [s0, s1, s2] = cluster.slots;
  const hasItem = (s?: MobileSlot) => !!s?.item;

  let topOccupied = false;
  let bottomOccupied = false;

  switch (cluster.type) {
    case "A":
      topOccupied = hasItem(s0);
      bottomOccupied = hasItem(s1) || hasItem(s2);
      break;
    case "B":
      topOccupied = hasItem(s0) || hasItem(s1);
      bottomOccupied = hasItem(s0) || hasItem(s2);
      break;
    case "C":
      topOccupied = hasItem(s0) || hasItem(s1);
      bottomOccupied = hasItem(s2) || hasItem(s1);
      break;
    case "D":
      topOccupied = hasItem(s0) || hasItem(s1);
      bottomOccupied = hasItem(s2);
      break;
    case "E":
      topOccupied = hasItem(s0) || hasItem(s1);
      bottomOccupied = hasItem(s0) || hasItem(s1);
      break;
  }

  if (topOccupied && bottomOccupied) return "40dvh";
  if (topOccupied || bottomOccupied) return "22dvh";
  return "0px";
}
