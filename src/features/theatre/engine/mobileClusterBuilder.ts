import { TheatreItem } from "../../../types";
import {
  isEditWork,
  isPosterWork,
  isScriptWork,
  isRecommendationWork,
} from "../../shared/work";

// ─── Types ───────────────────────────────────────────────────────────────────

// Unified 3-type slot model (Academy collapsed into Square — identical geometry).
type MobileClusterType = 'A' | 'B' | 'C' | 'D' | 'E';

export type MobileSlotType = 'Wide' | 'Vertical' | 'Square';

export interface MobileSlot {
  item: TheatreItem;
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
    // Recommendations first, then scripts, posters, square-ratio edits
    square:   items.filter(i => isRecommendationWork(i) || isScriptWork(i) || isPosterWork(i) || (isEditWork(i) && getAspect(i) >= 0.9 && getAspect(i) < 1.1)),
    any:      items,
  };
}

function pickBestItem(
  slotType: MobileSlotType,
  availableItems: TheatreItem[],
  pools: MasterPools,
  rng: () => number,
  clusterState: { sinceLastRec: number; placedRecThisCluster: boolean }
): TheatreItem {
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
      if (!found) found = findAndRemove(availableItems, isScriptWork);
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

  // ── Secondary pass: deterministic duplication from pre-built pools ────────
  if (!found) {
    const pool =
      slotType === 'Wide'     ? pools.wide :
      slotType === 'Vertical' ? pools.vertical :
                                pools.square;

    const src = pool.length > 0 ? pool : pools.any;
    if (src.length > 0) {
      const base = src[Math.floor(rng() * src.length)];
      // Give duplicate a unique ID to prevent React key collisions
      found = { ...base, id: `${base.id}-mdup-${rng().toString(36).substring(2, 9)}` };
    }
  }

  return found!;
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

  // Produce clusters until the available pool is empty AND we have at least 5
  // (minimum cinematic rhythm requirement).
  while (availableItems.length > 0 || clusters.length < 5) {
    clusterState.placedRecThisCluster = false;
    const clusterType = SEQUENCE[seqIndex % SEQUENCE.length];
    const template    = TEMPLATES[clusterType];

    const slots: MobileSlot[] = template.map(tmpl => ({
      ...tmpl,
      item: pickBestItem(tmpl.type, availableItems, pools, rng, clusterState),
    }));

    // Bail if any slot couldn't be filled (should only happen on empty pool)
    if (slots.some(s => !s.item)) break;

    // Use a deterministic ID: no Math.random() here either
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
