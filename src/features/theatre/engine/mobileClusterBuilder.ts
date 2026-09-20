import { TheatreItem } from "../../../types";
import {
  isEditWork,
  isPosterWork,
  isStoryboardWork,
  isRecommendationWork,
} from "../../shared/work";

// ─── Types ───────────────────────────────────────────────────────────────────

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

const TEMPLATES: Record<MobileClusterType, Omit<MobileSlot, 'item'>[]> = {
  'A': [{ type: 'Wide' }, { type: 'Square' }, { type: 'Square' }],
  'B': [{ type: 'Vertical' }, { type: 'Square' }, { type: 'Square' }],
  'C': [{ type: 'Square' }, { type: 'Vertical' }, { type: 'Square' }],
  'D': [{ type: 'Square' }, { type: 'Square' }, { type: 'Wide' }],
  'E': [{ type: 'Vertical' }, { type: 'Vertical' }],
};

const SEQUENCE: MobileClusterType[] = ['A', 'C', 'B', 'D', 'E'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createPRNG(seed: number) {
  let state = seed >>> 0;
  return function (): number {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function getSeed(items: TheatreItem[]): number {
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

function findAndRemove(
  items: TheatreItem[],
  predicate: (i: TheatreItem) => boolean,
): TheatreItem | null {
  const idx = items.findIndex(predicate);
  return idx !== -1 ? items.splice(idx, 1)[0] : null;
}

function pickBestItem(
  slotType: MobileSlotType,
  availableItems: TheatreItem[],
  clusterState: { sinceLastRec: number; placedRecThisCluster: boolean }
): TheatreItem | null {
  if (availableItems.length === 0) return null;
  let found: TheatreItem | null = null;

  if (slotType === 'Wide') {
    // Wide slots accept EDITS ONLY. Never posters, storyboards, or recommendations.
    found = findAndRemove(availableItems, isEditWork);
  } else if (slotType === 'Vertical') {
    // Vertical slots prefer Posters -> Storyboards -> Edits -> any item
    found = findAndRemove(availableItems, isPosterWork);
    if (!found) found = findAndRemove(availableItems, isStoryboardWork);
    if (!found) found = findAndRemove(availableItems, isEditWork);
    if (!found && availableItems.length > 0) {
      found = availableItems.splice(0, 1)[0];
    }
  } else {
    // Square slots prefer Recommendations -> Storyboards -> Posters -> Edits -> any item
    if (clusterState.sinceLastRec >= 1 && !clusterState.placedRecThisCluster) {
      found = findAndRemove(availableItems, isRecommendationWork);
      if (found) clusterState.placedRecThisCluster = true;
    }
    
    if (!found) found = findAndRemove(availableItems, isStoryboardWork);
    if (!found) found = findAndRemove(availableItems, isPosterWork);
    
    if (!found && !clusterState.placedRecThisCluster) {
      found = findAndRemove(availableItems, isRecommendationWork);
      if (found) clusterState.placedRecThisCluster = true;
    }
    
    if (!found) found = findAndRemove(availableItems, isEditWork);
    if (!found && availableItems.length > 0) {
      found = availableItems.splice(0, 1)[0];
    }
  }

  return found;
}

// ─── Public Builder ──────────────────────────────────────────────────────────

export interface MobileClusterResult {
  clusters: MobileCluster[];
  stackedItems: TheatreItem[];
}

export function buildMobileClustersWithRemainder(items: TheatreItem[]): MobileClusterResult {
  if (!Array.isArray(items) || items.length === 0) {
    return { clusters: [], stackedItems: [] };
  }

  const seed = getSeed(items);
  const rng = createPRNG(seed);
  const availableItems = [...items];
  const clusters: MobileCluster[] = [];
  let seqIndex = 0;

  const clusterState = { sinceLastRec: 0, placedRecThisCluster: false };

  while (availableItems.length > 0) {
    let selectedCluster: MobileCluster | null = null;
    let selectedAttempt = 0;

    for (let attempt = 0; attempt < SEQUENCE.length; attempt++) {
      const candidateType = SEQUENCE[(seqIndex + attempt) % SEQUENCE.length];
      const template = TEMPLATES[candidateType];

      const itemsCopy = [...availableItems];
      const tempClusterState = { ...clusterState };

      const candidateSlots: MobileSlot[] = template.map(tmpl => ({
        ...tmpl,
        item: pickBestItem(tmpl.type, itemsCopy, tempClusterState),
      }));

      const isFullyFilled = candidateSlots.every(s => s.item !== null);

      if (isFullyFilled) {
        selectedCluster = {
          id: `mc-${clusters.length}-${candidateType}-${seed}`,
          type: candidateType,
          slots: candidateSlots,
        };
        availableItems.length = 0;
        availableItems.push(...itemsCopy);
        clusterState.placedRecThisCluster = tempClusterState.placedRecThisCluster;
        clusterState.sinceLastRec = tempClusterState.sinceLastRec;
        selectedAttempt = attempt;
        break;
      }
    }

    if (selectedCluster) {
      clusters.push(selectedCluster);
      if (clusterState.placedRecThisCluster) {
        clusterState.sinceLastRec = 0;
      } else {
        clusterState.sinceLastRec++;
      }
      seqIndex += selectedAttempt + 1;
    } else {
      break;
    }

    if (clusters.length > 40) break; // Safety ceiling
  }

  return {
    clusters,
    stackedItems: availableItems,
  };
}

export function buildMobileClusters(items: TheatreItem[]): MobileCluster[] {
  const { clusters, stackedItems } = buildMobileClustersWithRemainder(items);
  if (!Array.isArray(stackedItems) || stackedItems.length === 0) return clusters;

  const seed = getSeed(items);
  const remainderClusters: MobileCluster[] = [];

  let i = 0;
  while (i < stackedItems.length) {
    if (i + 1 < stackedItems.length) {
      // Pair 2 items into a 2-column cluster (Template E)
      remainderClusters.push({
        id: `mc-rem-pair-${i}-${seed}`,
        type: "E",
        slots: [
          { type: isPosterWork(stackedItems[i]) ? "Vertical" : "Square", item: stackedItems[i] },
          { type: isPosterWork(stackedItems[i + 1]) ? "Vertical" : "Square", item: stackedItems[i + 1] },
        ],
      });
      i += 2;
    } else {
      // Single leftover item rendered as full-width banner
      remainderClusters.push({
        id: `mc-rem-single-${i}-${seed}`,
        type: "A",
        slots: [
          {
            type: isEditWork(stackedItems[i]) ? "Wide" : isPosterWork(stackedItems[i]) ? "Vertical" : "Square",
            item: stackedItems[i],
          },
        ],
      });
      i += 1;
    }
  }

  return [...clusters, ...remainderClusters];
}

export function getMobileClusterHeight(cluster: MobileCluster): string {
  if (!cluster || !Array.isArray(cluster.slots)) return "auto";
  const filledCount = cluster.slots.filter(s => !!s?.item).length;
  if (filledCount === 0) return "0px";
  if (filledCount === 1) return "auto";
  return "40dvh";
}
