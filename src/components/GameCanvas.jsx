/**
 * GameCanvas.jsx — The main Konva Stage that hosts all block layers.
 *
 * Layers (bottom → top):
 *   1. Block layer   — all unit / ten / hundred blocks
 *   2. Lasso layer   — freehand selection path drawn on empty canvas space
 *
 * Lasso rules:
 *   - Draw starts when pointer-down lands on empty Stage (not a block)
 *   - If a path already exists (paused), pointer-down RESUMES it
 *   - Lifting a finger / releasing mouse PAUSES the lasso — path persists on screen
 *   - Path auto-evaluates the moment the tip comes within 80 px of the start
 *   - Exactly 10 blocks enclosed → green flash + snap
 *   - Any other count     → red flash, no snap
 *   - Flash clears the lasso after FLASH_DURATION ms
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import useBlockStore from '../store/useBlockStore';
import UnitBlock       from './blocks/UnitBlock';
import TenBlock        from './blocks/TenBlock';
import HundredBlock    from './blocks/HundredBlock';
import PlaceValueChart from './PlaceValueChart';
import {
  isPathClosed,
  getBlocksInLasso,
  countAllBlocksInLasso,
  computeCentroid,
  appendPoint,
} from '../utils/lassoLogic';

// Lasso colours
const LASSO_STROKE_IDLE    = 'rgba(180, 210, 255, 0.85)';
const LASSO_STROKE_SUCCESS = 'rgba(100, 255, 140, 0.95)';
const LASSO_STROKE_FAIL    = 'rgba(255,  80,  80, 0.95)';
const LASSO_FILL_IDLE      = 'rgba(120, 180, 255, 0.08)';
const LASSO_FILL_SUCCESS   = 'rgba(100, 255, 140, 0.18)';
const LASSO_FILL_FAIL      = 'rgba(255,  80,  80, 0.14)';

const FLASH_DURATION = 450; // ms the result colour is shown before clearing

export default function GameCanvas() {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ width: 800, height: 600 });

  const blocks       = useBlockStore((s) => s.blocks);
  const initBlocks   = useBlockStore((s) => s.initBlocks);
  const groupBlocks  = useBlockStore((s) => s.groupBlocks);
  const chartVisible = useBlockStore((s) => s.chartVisible);
  const initialized  = useRef(false);

  // ── Lasso state ──────────────────────────────────────────────────────────
  const [lassoPoints, setLassoPoints] = useState([]);   // drives Konva Line
  const [lassoResult, setLassoResult] = useState(null); // null | 'success' | 'fail'

  // Refs hold the authoritative values inside callbacks (avoid stale closure)
  const lassoRef  = useRef({ points: [], active: false });
  const flashTimer = useRef(null);
  const inFlash    = useRef(false); // true while result flash is showing

  // ── Canvas sizing ─────────────────────────────────────────────────────────
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      setDims({ width: clientWidth, height: clientHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Init 20 units once ────────────────────────────────────────────────────
  useEffect(() => {
    if (!initialized.current && dims.width > 100) {
      initBlocks(dims.width, dims.height);
      initialized.current = true;
    }
  }, [dims, initBlocks]);

  // ── Prevent native touch pan/zoom ─────────────────────────────────────────
  const preventDefaultTouch = useCallback((e) => e.preventDefault(), []);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('touchstart', preventDefaultTouch, { passive: false });
    el.addEventListener('touchmove',  preventDefaultTouch, { passive: false });
    return () => {
      el.removeEventListener('touchstart', preventDefaultTouch);
      el.removeEventListener('touchmove',  preventDefaultTouch);
    };
  }, [preventDefaultTouch]);

  // ── Helper: stage-relative pointer position ───────────────────────────────
  const getPos = (e) => e.target.getStage().getPointerPosition();

  // ── Evaluate the completed lasso path ────────────────────────────────────
  // Called when the path closes (during draw or on release near origin).
  const evaluateLasso = useCallback(
    (points) => {
      inFlash.current = true;
      const currentBlocks = useBlockStore.getState().blocks;

      // Count EVERY block inside the lasso (all types).
      // A mixed selection (e.g. 10 tens + 1 unit) must fail even if one
      // type alone has exactly 10 — the total must also equal 10.
      const totalInside = countAllBlocksInLasso(points, currentBlocks);
      let snapped = false;

      for (const type of ['unit', 'ten']) {
        const toType = type === 'unit' ? 'ten' : 'hundred';
        const inside = getBlocksInLasso(points, currentBlocks, type);

        if (inside.length === 10 && totalInside === 10) {
          // Exactly 10 of this type and nothing else enclosed — snap
          const ids = inside.map((b) => b.id);
          const { centroidX, centroidY } = computeCentroid(inside, type);
          groupBlocks(ids, toType, centroidX, centroidY);
          snapped = true;
          break;
        }
      }

      setLassoResult(snapped ? 'success' : 'fail');

      flashTimer.current = setTimeout(() => {
        // Clear lasso after flash
        lassoRef.current = { points: [], active: false };
        setLassoPoints([]);
        setLassoResult(null);
        inFlash.current = false;
      }, FLASH_DURATION);
    },
    [groupBlocks],
  );

  // ── Pointer down — start fresh OR resume paused lasso ────────────────────
  const handleStagePointerDown = useCallback(
    (e) => {
      // Only act on empty Stage (not a block shape)
      if (e.target !== e.target.getStage()) return;
      // Ignore during result flash
      if (inFlash.current) return;

      const pos = getPos(e);
      if (!pos) return;

      if (lassoRef.current.points.length >= 2) {
        // ── Resume: bridge from last point to new touch position ──────────
        const bridged = [...lassoRef.current.points, pos.x, pos.y];
        lassoRef.current.points  = bridged;
        lassoRef.current.active  = true;
        // maxExcursion is preserved from before the pause
        setLassoPoints([...bridged]);
      } else {
        // ── Fresh start ───────────────────────────────────────────────────
        if (flashTimer.current) clearTimeout(flashTimer.current);
        lassoRef.current = { points: [pos.x, pos.y], active: true, maxExcursion: 0 };
        setLassoPoints([pos.x, pos.y]);
        setLassoResult(null);
      }
    },
    [],
  );

  // Minimum loop size — tip must travel this far from origin before closure
  // is even considered. Prevents early false-closes on small starting wobbles.
  const MIN_EXCURSION = 120;

  // ── Pointer move — append points, check for auto-close ───────────────────
  const handleStagePointerMove = useCallback(
    (e) => {
      if (!lassoRef.current.active) return;
      const pos = getPos(e);
      if (!pos) return;

      const next = appendPoint(lassoRef.current.points, pos.x, pos.y);
      lassoRef.current.points = next;
      setLassoPoints([...next]);

      // Track how far the tip has ever been from the starting point
      const startX = next[0];
      const startY = next[1];
      const dx = pos.x - startX;
      const dy = pos.y - startY;
      const distFromStart = Math.sqrt(dx * dx + dy * dy);
      if (distFromStart > lassoRef.current.maxExcursion) {
        lassoRef.current.maxExcursion = distFromStart;
      }

      // Auto-close ONLY if the path has genuinely looped far enough away
      // from the origin — prevents stray early-stroke wobbles from firing.
      if (
        next.length >= 24 &&
        lassoRef.current.maxExcursion >= MIN_EXCURSION &&
        isPathClosed(next, 80)
      ) {
        lassoRef.current.active = false;
        evaluateLasso(next);
      }
    },
    [evaluateLasso],
  );

  // ── Pointer up — PAUSE if not closed, evaluate if closed ─────────────────
  const handleStagePointerUp = useCallback(
    () => {
      if (!lassoRef.current.active) return;
      lassoRef.current.active = false;

      const points = lassoRef.current.points;
      if (points.length < 8) {
        // Too short to be a real lasso — discard
        lassoRef.current = { points: [], active: false };
        setLassoPoints([]);
        return;
      }

      // Closed on release? Only evaluate if the loop genuinely travelled far.
      // Same MIN_EXCURSION guard as during drawing.
      if (
        (lassoRef.current.maxExcursion ?? 0) >= 120 &&
        isPathClosed(points, 80)
      ) {
        evaluateLasso(points);
      }
      // If not closed: do nothing — path persists for the student to resume
    },
    [evaluateLasso],
  );

  // Derive lasso colours
  const lassoStroke = lassoResult === 'success' ? LASSO_STROKE_SUCCESS
    : lassoResult === 'fail' ? LASSO_STROKE_FAIL
    : LASSO_STROKE_IDLE;
  const lassoFill = lassoResult === 'success' ? LASSO_FILL_SUCCESS
    : lassoResult === 'fail' ? LASSO_FILL_FAIL
    : LASSO_FILL_IDLE;

  return (
    <div
      ref={containerRef}
      className="canvas-area"
      style={{ touchAction: 'none', WebkitUserSelect: 'none' }}
    >
      <Stage
        width={dims.width}
        height={dims.height}
        onMouseDown={handleStagePointerDown}
        onMouseMove={handleStagePointerMove}
        onMouseUp={handleStagePointerUp}
        onTouchStart={handleStagePointerDown}
        onTouchMove={handleStagePointerMove}
        onTouchEnd={handleStagePointerUp}
      >
        {/* Layer 0 — place value chart (optional background) */}
        {chartVisible && <PlaceValueChart width={dims.width} height={dims.height} />}

        {/* Layer 1 — blocks */}
        <Layer>
          {blocks
            .filter((b) => b.type === 'hundred')
            .map((b) => <HundredBlock key={b.id} block={b} />)}
          {blocks
            .filter((b) => b.type === 'ten')
            .map((b) => <TenBlock key={b.id} block={b} />)}
          {blocks
            .filter((b) => b.type === 'unit')
            .map((b) => <UnitBlock key={b.id} block={b} />)}
        </Layer>

        {/* Layer 2 — lasso overlay */}
        <Layer listening={false}>
          {lassoPoints.length >= 4 && (
            <Line
              points={lassoPoints}
              stroke={lassoStroke}
              strokeWidth={2.5}
              dash={lassoResult ? [] : [10, 6]}
              fill={lassoFill}
              closed={true}
              tension={0.3}
              lineCap="round"
              lineJoin="round"
              opacity={lassoResult ? 1 : 0.9}
            />
          )}
        </Layer>
      </Stage>

      <p className="canvas-hint">
        Drag blocks to snap · Circle exactly 10 to group · Lift and resume lasso freely · Double-tap to break apart
      </p>
    </div>
  );
}
