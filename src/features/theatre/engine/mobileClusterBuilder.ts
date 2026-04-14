import { TheatreItem } from "../../../types";

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

function pickBestItem(slotType: string, availableItems: TheatreItem[]): TheatreItem {
  let found: TheatreItem | null = null;
  
  const isVideo = (i: TheatreItem) => i.category === 'Edit' || i.type === 'video' || !!i.isPlay;
  const isPoster = (i: TheatreItem) => i.category === 'Poster';
  const isScript = (i: TheatreItem) => i.category === 'Script';
  
  const getAspect = (i: TheatreItem) => i.aspectRatio || 1;
  const isImaxRatio = (i: TheatreItem) => getAspect(i) > 1.6; // ~16:9
  const isAcademyRatio = (i: TheatreItem) => getAspect(i) > 1.1 && getAspect(i) <= 1.6; // ~4:3
  const isSquareRatio = (i: TheatreItem) => getAspect(i) >= 0.9 && getAspect(i) <= 1.1; // ~1:1

  if (slotType === 'IMAX') {
    // IMAX Container Populating Rules
    // 1. IMAX video
    found = findAndRemove(availableItems, (i) => isVideo(i) && isImaxRatio(i));
    // 2. Academy video fallback
    if (!found) found = findAndRemove(availableItems, (i) => isVideo(i) && isAcademyRatio(i));
    // 3. Square video fallback
    if (!found) found = findAndRemove(availableItems, (i) => isVideo(i) && isSquareRatio(i));
    // 4. Any Video
    if (!found) found = findAndRemove(availableItems, isVideo);
  } else if (slotType === 'Academy') {
    // 1. Academy video
    found = findAndRemove(availableItems, (i) => isVideo(i) && isAcademyRatio(i));
    // 2. IMAX video (Overflow rule: if IMAX videos are more, use academy)
    if (!found) found = findAndRemove(availableItems, (i) => isVideo(i) && isImaxRatio(i));
    // 3. Any Video
    if (!found) found = findAndRemove(availableItems, isVideo);
  } else if (slotType === 'Vertical') {
    found = findAndRemove(availableItems, (i) => isVideo(i) && getAspect(i) < 0.9);
    if (!found) found = findAndRemove(availableItems, isVideo);
  } else if (slotType === 'Poster') {
    found = findAndRemove(availableItems, isPoster);
    if (!found) found = findAndRemove(availableItems, (i) => !isVideo(i)); // Any non-video
  } else if (slotType === 'Square') {
    found = findAndRemove(availableItems, isScript); // Give scripts a home first
    if (!found) found = findAndRemove(availableItems, (i) => isVideo(i) && isSquareRatio(i));
    if (!found) found = findAndRemove(availableItems, isPoster);
  }

  // Absolute fallback: just take the first item if we fail to find a perfect match
  if (!found && availableItems.length > 0) {
    // Strict IMAX Rule: try to force a video if we randomly fallback
    if (slotType === 'IMAX') {
      found = findAndRemove(availableItems, isVideo);
    }
    if (!found) {
      found = availableItems.splice(0, 1)[0];
    }
  }

  return found!;
}

export function buildMobileClusters(items: TheatreItem[]): MobileCluster[] {
  const availableItems = [...items];
  let seqIndex = 0;
  const clusters: MobileCluster[] = [];

  while (availableItems.length > 0) {
    const clusterType = SEQUENCE[seqIndex % SEQUENCE.length];
    const template = TEMPLATES[clusterType];
    
    // Check if we have enough items for this template
    if (availableItems.length < template.length) {
      break; 
    }

    const slots: MobileSlot[] = template.map((tmpl) => ({
      ...tmpl,
      item: pickBestItem(tmpl.type, availableItems)
    }));

    if (slots.some(s => !s.item)) {
       break;
    }

    clusters.push({
      id: `mcluster-${clusters.length}`,
      type: clusterType,
      slots
    });

    seqIndex++;
  }
  return clusters;
}
