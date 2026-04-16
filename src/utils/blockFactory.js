/**
 * blockFactory.js
 * Creates typed block descriptor objects with unique IDs.
 * Using a simple incrementing counter for IDs (no extra dep required).
 */

let _counter = 0;

/**
 * @param {'unit'|'ten'|'hundred'} type
 * @param {number} x
 * @param {number} y
 * @returns {{ id: string, type: string, x: number, y: number }}
 */
export function createBlock(type, x = 0, y = 0) {
  return {
    id: `${type}-${++_counter}-${Date.now()}`,
    type,
    x,
    y,
  };
}

/** Visual dimensions for each block type (in pixels) */
export const BLOCK_DIMS = {
  unit:    { w: 36, h: 36 },
  ten:     { w: 36, h: 360 },
  hundred: { w: 360, h: 360 },
};

/** Snap radius (px) — distance within which blocks trigger grouping */
export const SNAP_RADIUS = {
  unit: 72,   // units snap when 10 are within 72px of each other
  ten:  130,  // tens snap when 10 are within 130px of each other
};
