/**
 * HundredBlock.jsx — A 100-unit flat square (100s block) on the Konva canvas.
 *
 * Visual: 360×360 green square subdivided into a 10×10 grid of unit cells.
 * Behaviour:
 *   - Draggable. No further snap upward (hundreds don't group).
 *   - Double-click / Double-tap: ungroups into 10 ten-blocks.
 */

import { useRef, useCallback } from 'react';
import { Rect, Group, Line } from 'react-konva';
import useBlockStore from '../../store/useBlockStore';

const W = 360;
const H = 360;
const CELL = W / 10; // 36px per cell

const FILL        = '#388E3C';
const FILL_ALT    = '#2E7D32';
const STROKE      = '#1B5E20';
const HIGHLIGHT   = 'rgba(255,255,255,0.10)';
const SHADOW_COLOR = '#0A3D0A';

export default function HundredBlock({ block }) {
  const moveBlock    = useBlockStore((s) => s.moveBlock);
  const ungroupBlock = useBlockStore((s) => s.ungroupBlock);
  const groupRef = useRef(null);

  const handleDragEnd = useCallback(
    (e) => {
      const node = e.target;
      moveBlock(block.id, node.x(), node.y());
    },
    [block.id, moveBlock],
  );

  const handleDblClick = useCallback(() => {
    ungroupBlock(block.id);
  }, [block.id, ungroupBlock]);

  // Build the 10×10 cell grid via alternating rows
  const rows = Array.from({ length: 10 }, (_, r) =>
    Array.from({ length: 10 }, (_, c) => ({ r, c })),
  ).flat();

  // Grid lines
  const vLines = Array.from({ length: 9 }, (_, i) => (i + 1) * CELL);
  const hLines = Array.from({ length: 9 }, (_, i) => (i + 1) * CELL);

  return (
    <Group
      ref={groupRef}
      id={block.id}
      x={block.x}
      y={block.y}
      draggable
      onDragEnd={handleDragEnd}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
    >
      {/* Shadow */}
      <Rect
        x={5}
        y={6}
        width={W}
        height={H}
        fill={SHADOW_COLOR}
        cornerRadius={8}
        opacity={0.45}
      />

      {/* Cell fills — checkerboard-ish pattern for visual richness */}
      {rows.map(({ r, c }) => (
        <Rect
          key={`${r}-${c}`}
          x={c * CELL}
          y={r * CELL}
          width={CELL}
          height={CELL}
          fill={(r + c) % 2 === 0 ? FILL : FILL_ALT}
          listening={false}
        />
      ))}

      {/* Outer border */}
      <Rect
        width={W}
        height={H}
        stroke={STROKE}
        strokeWidth={2.5}
        cornerRadius={8}
        listening={false}
      />

      {/* Vertical grid lines */}
      {vLines.map((x) => (
        <Line
          key={`v${x}`}
          points={[x, 0, x, H]}
          stroke={STROKE}
          strokeWidth={1}
          opacity={0.55}
          listening={false}
        />
      ))}

      {/* Horizontal grid lines */}
      {hLines.map((y) => (
        <Line
          key={`h${y}`}
          points={[0, y, W, y]}
          stroke={STROKE}
          strokeWidth={1}
          opacity={0.55}
          listening={false}
        />
      ))}

      {/* Top-left highlight */}
      <Rect
        x={6}
        y={6}
        width={W - 12}
        height={18}
        fill={HIGHLIGHT}
        cornerRadius={4}
        listening={false}
      />
    </Group>
  );
}
