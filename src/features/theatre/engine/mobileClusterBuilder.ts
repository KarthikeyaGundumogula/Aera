import { TheatreItem } from "../../../types";
import {
  isEditWork,
  isPosterWork,
  isScriptWork,
} from "../../shared/work";

export type MobileClusterType = 'A' | 'B' | 'C' | 'D' | 'E';

export interface MobileSlot {
  item: TheatreItem;
  type: 'IMAX' | 'Academy' | 'Square' | 'Vertical' | 'Poster';
  span: number; 
  aspectClass: string; 
}

export interface MobileCluster {
  id: string;
  type: MobileClusterType;
  slots: MobileSlot[];
}

const TEMPLATES: Record<MobileClusterType, Omit<MobileSlot, 'item'>[]> = {
  'A': [
    { type: 'IMAX', span: 2, aspectClass: 'aspect-video' },
    { type: 'Square', span: 1, aspectClass: 'aspect-square' },
    { type: 'Square', span: 1, aspectClass: 'aspect-square' },
  ],
  'B': [
    { type: 'Vertical', span: 1, aspectClass: 'aspect-[9/16]' },
    { type: 'Academy', span: 1, aspectClass: 'aspect-[4/3]' },
    { type: 'Square', span: 1, aspectClass: 'aspect-square' },
  ],
  'C': [
    { type: 'Square', span: 1, aspectClass: 'aspect-square' },
    { type: 'Vertical', span: 1, aspectClass: 'aspect-[9/16]' },
    { type: 'Academy', span: 1, aspectClass: 'aspect-[4/3]' },
  ],
  'D': [
    { type: 'Academy', span: 1, aspectClass: 'aspect-[4/3]' },
    { type: 'Square', span: 1, aspectClass: 'aspect-square' },
    { type: 'IMAX', span: 2, aspectClass: 'aspect-video' },
  ],
  'E': [
    { type: 'Poster', span: 1, aspectClass: 'aspect-[2/3]' },
    { type: 'Poster', span: 1, aspectClass: 'aspect-[2/3]' },
  ]
};

const SEQUENCE: MobileClusterType[] = ['A', 'C', 'B', 'D', 'E'];

function findAndRemove(items: TheatreItem[], predicate: (i: TheatreItem) => boolean): TheatreItem | null {
  const index = items.findIndex(predicate);
  if (index !== -1) {
    return items.splice(index, 1)[0];
  }
  return null;
}

function pickBestItem(slotType: string, availableItems: TheatreItem[], masterItems: TheatreItem[]): TheatreItem {
  let found: TheatreItem | null = null;
  
  const getAspect = (i: TheatreItem) => i.aspectRatio || 1;
  const isImaxRatio = (i: TheatreItem) => getAspect(i) > 1.6; // ~16:9
  const isAcademyRatio = (i: TheatreItem) => getAspect(i) > 1.1 && getAspect(i) <= 1.6; // ~4:3
  const isSquareRatio = (i: TheatreItem) => getAspect(i) >= 0.9 && getAspect(i) <= 1.1; // ~1:1

  // Primary Pass: Exhaust the available pool first
  if (availableItems.length > 0) {
    if (slotType === 'IMAX') {
      found = findAndRemove(availableItems, (i) => isEditWork(i) && isImaxRatio(i));
      if (!found) found = findAndRemove(availableItems, (i) => isEditWork(i) && isAcademyRatio(i));
      if (!found) found = findAndRemove(availableItems, (i) => isEditWork(i) && isSquareRatio(i));
      if (!found) found = findAndRemove(availableItems, isEditWork);
    } else if (slotType === 'Academy') {
      found = findAndRemove(availableItems, (i) => isEditWork(i) && isAcademyRatio(i));
      if (!found) found = findAndRemove(availableItems, (i) => isEditWork(i) && isImaxRatio(i));
      if (!found) found = findAndRemove(availableItems, isEditWork);
    } else if (slotType === 'Vertical') {
      found = findAndRemove(availableItems, (i) => isEditWork(i) && getAspect(i) < 0.9);
      if (!found) found = findAndRemove(availableItems, isEditWork);
    } else if (slotType === 'Poster') {
      found = findAndRemove(availableItems, isPosterWork);
      if (!found) found = findAndRemove(availableItems, (i) => !isEditWork(i)); 
    } else if (slotType === 'Square') {
      found = findAndRemove(availableItems, isScriptWork); 
      if (!found) found = findAndRemove(availableItems, (i) => isEditWork(i) && isSquareRatio(i));
      if (!found) found = findAndRemove(availableItems, isPosterWork);
    }

    if (!found && availableItems.length > 0) {
      if (slotType === 'IMAX') found = findAndRemove(availableItems, isEditWork);
      if (!found) found = availableItems.splice(0, 1)[0];
    }
  }

  // Secondary Pass: Strategic Duplication from master pool if availableItems exhausted
  if (!found && masterItems.length > 0) {
    const getRandom = (arr: TheatreItem[]) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;
    
    if (slotType === 'IMAX') {
      found = getRandom(masterItems.filter(i => isEditWork(i) && isImaxRatio(i)));
      if (!found) found = getRandom(masterItems.filter(isEditWork));
    } else if (slotType === 'Academy') {
      found = getRandom(masterItems.filter(i => isEditWork(i) && isAcademyRatio(i)));
      if (!found) found = getRandom(masterItems.filter(isEditWork));
    } else if (slotType === 'Vertical') {
      found = getRandom(masterItems.filter(i => isEditWork(i) && getAspect(i) < 0.9));
      if (!found) found = getRandom(masterItems.filter(isEditWork));
    } else if (slotType === 'Poster') {
      found = getRandom(masterItems.filter(isPosterWork));
    } else if (slotType === 'Square') {
      found = getRandom(masterItems.filter(isScriptWork));
      if (!found) found = getRandom(masterItems.filter(i => isEditWork(i) && isSquareRatio(i)));
    }

    // Ultimate fallback for duplication
    if (!found) found = masterItems[Math.floor(Math.random() * masterItems.length)];
    
    // Assign unique ID to prevent React key collisions for duplicates
    if (found) {
      found = { ...found, id: `${found.id}-mdup-${Math.random().toString(36).substr(2, 9)}` };
    }
  }

  return found!;
}

export function buildMobileClusters(items: TheatreItem[]): MobileCluster[] {
  const masterItems = [...items];
  const availableItems = [...items];
  let seqIndex = 0;
  const clusters: MobileCluster[] = [];

  if (masterItems.length === 0) return [];

  // Goal: Ensure at least 5 clusters exist to maintain cinematic rhythm
  // Continue until we've exhausted original items AND met minimum cluster count
  while (availableItems.length > 0 || clusters.length < 5) {
    const clusterType = SEQUENCE[seqIndex % SEQUENCE.length];
    const template = TEMPLATES[clusterType];
    
    const slots: MobileSlot[] = template.map((tmpl) => ({
      ...tmpl,
      item: pickBestItem(tmpl.type, availableItems, masterItems)
    }));

    if (slots.some(s => !s.item)) break;

    clusters.push({
      id: `mcluster-${clusters.length}-${Math.random().toString(36).substr(2, 5)}`,
      type: clusterType,
      slots
    });

    seqIndex++;

    if (clusters.length > 40) break; // Safety break
  }
  return clusters;
}
