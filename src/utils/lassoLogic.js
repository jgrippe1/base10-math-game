/**
 * lassoLogic.js
 * Utilities for the freehand lasso selection feature.
 *
 * Uses the ray-casting algorithm for point-in-polygon testing.
 */

import { BLOCK_DIMS } from './blockFactory';

/**
 * Ray-casting point-in-polygon test.
 * polygon: flat array [x0, y0, x1, y1, ...]
 * Returns true if (px, py) is inside the polygon.
 */
export function pointInPolygon(px, py, polygon) {
  const n = polygon.length / 2;
  if (n < 3) return false;
  let inside = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i * 2];
    const yi = polygon[i * 2 + 1];
    const xj = polygon[j * 2];
    const yj = polygon[j * 2 + 1];
    const intersect =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Returns the centre point (cx, cy) of a block based on its type.
 */
function blockCentre(block) {
  const dim = BLOCK_DIMS[block.type] ?? { w: 36, h: 36 };
  return { cx: block.x + dim.w / 2, cy: block.y + dim.h / 2 };
}

/**
 * Returns the distance between two points.
 */
function ptDist(ax, ay, bx, by) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

/**
 * Check whether the lasso path is closed (end point ≈ start point).
 * @param {number[]} points  Flat array [x0, y0, x1, y1, ...]
 * @param {number}   threshold  Max distance in px to consider "closed"
 */
export function isPathClosed(points, threshold = 60) {
  if (points.length < 8) return false; // Need at least 4 points to form a shape
  const x0 = points[0];
  const y0 = points[1];
  const xN = points[points.length - 2];
  const yN = points[points.length - 1];
  return ptDist(x0, y0, xN, yN) <= threshold;
}

/**
 * Find blocks whose centres are inside the lasso polygon.
 *
 * @param {number[]}  polygon   Flat array [x0, y0, x1, y1, ...]
 * @param {object[]}  blocks    Full blocks array from store
 * @param {string}    type      'unit' | 'ten'  — which type to test
 * @returns {object[]}          Matching blocks inside the lasso
 */
export function getBlocksInLasso(polygon, blocks, type) {
  return blocks.filter((b) => {
    if (b.type !== type) return false;
    const { cx, cy } = blockCentre(b);
    return pointInPolygon(cx, cy, polygon);
  });
}

/**
 * Given a set of blocks, compute the centroid of their centres.
 * Returns position suitable for placing the new grouped block.
 */
export function computeCentroid(blocks, type) {
  const dim = BLOCK_DIMS[type] ?? { w: 36, h: 36 };
  const centres = blocks.map(blockCentre);
  const cx = centres.reduce((s, { cx }) => s + cx, 0) / centres.length;
  const cy = centres.reduce((s, { cy }) => s + cy, 0) / centres.length;
  return { centroidX: cx - dim.w / 2, centroidY: cy - dim.h / 2 };
}

/**
 * Down-sample a path array to avoid excessive points while drawing.
 * Only appends a new point if it's at least `minDist` px from the last.
 */
export function appendPoint(points, x, y, minDist = 8) {
  if (points.length >= 2) {
    const lx = points[points.length - 2];
    const ly = points[points.length - 1];
    if (ptDist(lx, ly, x, y) < minDist) return points;
  }
  return [...points, x, y];
}
