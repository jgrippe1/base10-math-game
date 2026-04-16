/**
 * snapLogic.js
 * Proximity-based grouping detection for Base-10 blocks.
 *
 * On drag-end of a block, call `checkSnap` to determine if a group
 * of 10 same-type blocks is close enough to auto-group.
 */

import { SNAP_RADIUS, BLOCK_DIMS } from './blockFactory';

/**
 * Euclidean distance between the centres of two blocks.
 * @param {{ x: number, y: number, type: string }} a
 * @param {{ x: number, y: number, type: string }} b
 */
function dist(a, b) {
  const da = BLOCK_DIMS[a.type] ?? { w: 36, h: 36 };
  const db = BLOCK_DIMS[b.type] ?? { w: 36, h: 36 };
  const ax = a.x + da.w / 2;
  const ay = a.y + da.h / 2;
  const bx = b.x + db.w / 2;
  const by = b.y + db.h / 2;
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

/**
 * Check whether the just-dragged block should trigger a snap.
 *
 * Rules:
 *  - unit:  if ≥9 other units are within SNAP_RADIUS.unit → group 10 → ten
 *  - ten:   if ≥9 other tens are within SNAP_RADIUS.ten   → group 10 → hundred
 *
 * @param {object} draggedBlock   The block that just finished dragging
 * @param {object[]} allBlocks    Full block list from store
 * @returns {{ shouldSnap: boolean, ids: string[], toType: string,
 *             centroidX: number, centroidY: number } | null}
 */
export function checkSnap(draggedBlock, allBlocks) {
  const { type } = draggedBlock;

  // Only unit→ten and ten→hundred grouping supported
  if (type !== 'unit' && type !== 'ten') return null;

  const toType = type === 'unit' ? 'ten' : 'hundred';
  const radius = SNAP_RADIUS[type];

  // All same-type blocks except dragged
  const candidates = allBlocks.filter(
    (b) => b.type === type && b.id !== draggedBlock.id,
  );

  // Sort by distance from dragged block
  const sorted = candidates
    .map((b) => ({ block: b, d: dist(draggedBlock, b) }))
    .filter(({ d }) => d <= radius)
    .sort((a, b) => a.d - b.d);

  if (sorted.length < 9) return null; // Not enough close blocks

  // Take the 9 closest + the dragged block = 10 total
  const group = [draggedBlock, ...sorted.slice(0, 9).map(({ block }) => block)];
  const ids = group.map((b) => b.id);

  // Centroid of the group (based on block centres)
  const dim = BLOCK_DIMS[type];
  const centroidX =
    group.reduce((sum, b) => sum + b.x + dim.w / 2, 0) / group.length - dim.w / 2;
  const centroidY =
    group.reduce((sum, b) => sum + b.y + dim.h / 2, 0) / group.length - dim.h / 2;

  return { shouldSnap: true, ids, toType, centroidX, centroidY };
}
