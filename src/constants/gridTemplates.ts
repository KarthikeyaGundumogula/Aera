
export type CardType = "IMAX" | "WIDE" | "VERTICAL" | "SQUARE";

export interface ClusterBlock {
  type: CardType;
  x: number; // grid units (0-11)
  y: number; // grid units (0-8)
  w: number; // width in units
  h: number; // height in units
}

export interface ClusterTemplate {
  id: string;
  blocks: ClusterBlock[];
}

export const CLUSTER_TEMPLATES: ClusterTemplate[] = [
  {
    id: "A", // Cinematic Anchor
    blocks: [
      { type: "IMAX", x: 0, y: 0, w: 12, h: 6 },
      { type: "WIDE", x: 0, y: 6, w: 6, h: 3 },
      { type: "WIDE", x: 6, y: 6, w: 6, h: 3 },
    ],
  },
  {
    id: "B", // Vertical Balanced
    blocks: [
      { type: "WIDE", x: 0, y: 0, w: 6, h: 3 },
      { type: "WIDE", x: 0, y: 3, w: 6, h: 3 },
      { type: "SQUARE", x: 0, y: 6, w: 3, h: 3 },
      { type: "SQUARE", x: 3, y: 6, w: 3, h: 3 },
      { type: "VERTICAL", x: 6, y: 0, w: 3, h: 6 },
      { type: "SQUARE", x: 6, y: 6, w: 3, h: 3 },
      { type: "VERTICAL", x: 9, y: 0, w: 3, h: 6 },
      { type: "SQUARE", x: 9, y: 6, w: 3, h: 3 },
    ],
  },
  {
    id: "C", // Dual Vertical
    blocks: [
      { type: "VERTICAL", x: 0, y: 0, w: 3, h: 6 },
      { type: "SQUARE", x: 0, y: 6, w: 3, h: 3 },
      { type: "VERTICAL", x: 3, y: 0, w: 3, h: 6 },
      { type: "SQUARE", x: 3, y: 6, w: 3, h: 3 },
      { type: "WIDE", x: 6, y: 0, w: 6, h: 3 },
      { type: "WIDE", x: 6, y: 3, w: 6, h: 3 },
      { type: "SQUARE", x: 6, y: 6, w: 3, h: 3 },
      { type: "SQUARE", x: 9, y: 6, w: 3, h: 3 },
    ],
  },
  {
    id: "D", // Grid Balanced
    blocks: [
      { type: "WIDE", x: 0, y: 0, w: 6, h: 3 },
      { type: "WIDE", x: 6, y: 0, w: 6, h: 3 },
      { type: "SQUARE", x: 0, y: 3, w: 3, h: 3 },
      { type: "SQUARE", x: 3, y: 3, w: 3, h: 3 },
      { type: "SQUARE", x: 6, y: 3, w: 3, h: 3 },
      { type: "SQUARE", x: 9, y: 3, w: 3, h: 3 },
      { type: "WIDE", x: 0, y: 6, w: 6, h: 3 },
      { type: "WIDE", x: 6, y: 6, w: 6, h: 3 },
    ],
  },
  {
    id: "E", // Vertical Edge
    blocks: [
      { type: "VERTICAL", x: 0, y: 0, w: 3, h: 6 },
      { type: "SQUARE", x: 0, y: 6, w: 3, h: 3 },
      { type: "WIDE", x: 3, y: 0, w: 6, h: 3 },
      { type: "WIDE", x: 3, y: 3, w: 6, h: 3 },
      { type: "SQUARE", x: 3, y: 6, w: 3, h: 3 },
      { type: "SQUARE", x: 6, y: 6, w: 3, h: 3 },
      { type: "VERTICAL", x: 9, y: 0, w: 3, h: 6 },
      { type: "SQUARE", x: 9, y: 6, w: 3, h: 3 },
    ],
  },
  {
    id: "F", // Cinematic Mixed
    blocks: [
      { type: "IMAX", x: 0, y: 0, w: 12, h: 6 },
      { type: "SQUARE", x: 0, y: 6, w: 3, h: 3 },
      { type: "SQUARE", x: 3, y: 6, w: 3, h: 3 },
      { type: "WIDE", x: 6, y: 6, w: 6, h: 3 },
    ],
  },
  {
    id: "G", // Vertical Core
    blocks: [
      { type: "VERTICAL", x: 0, y: 0, w: 3, h: 6 },
      { type: "SQUARE", x: 0, y: 6, w: 3, h: 3 },
      { type: "WIDE", x: 3, y: 0, w: 6, h: 3 },
      { type: "SQUARE", x: 3, y: 3, w: 3, h: 3 },
      { type: "SQUARE", x: 6, y: 3, w: 3, h: 3 },
      { type: "WIDE", x: 3, y: 6, w: 6, h: 3 },
      { type: "VERTICAL", x: 9, y: 0, w: 3, h: 6 },
      { type: "SQUARE", x: 9, y: 6, w: 3, h: 3 },
    ],
  },
];
