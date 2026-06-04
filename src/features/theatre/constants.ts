/**
 * Shared dimensional constants for the desktop infinite canvas.
 *
 * The canvas is a virtual 2D grid of "clusters". Each cluster is a
 * 12-column × 9-row CSS Grid. These constants define the pixel
 * dimensions used to position clusters absolutely in world-space.
 *
 * ┌─────────────────────────────────┐
 * │  12 cols × UNIT = CLUSTER_W     │
 * │  9 rows  × UNIT = CLUSTER_H    │
 * └─────────────────────────────────┘
 */

/** Pixel size of one grid unit (1 col-width = 1 row-height). */
export const UNIT_SIZE = 62;

/** Pixel gap between adjacent clusters in world-space. */
export const CLUSTER_GAP = 0;

/** Total pixel width of a single cluster block. */
export const CLUSTER_WIDTH = 12 * UNIT_SIZE;

/** Total pixel height of a single cluster block. */
export const CLUSTER_HEIGHT = 9 * UNIT_SIZE;
