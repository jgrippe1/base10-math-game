/**
 * TenBlock.jsx — A 10-unit rod (10s block) rendered on the Konva canvas.
 *
 * Visual: 36×360 orange vertical rod subdivided into 10 visible unit cells.
 * Behaviour:
 *   - Draggable. On drag-end, triggers snap check (ten→hundred grouping).
 *   - Double-click / Double-tap: ungroups into 10 unit blocks.
 */

import { useRef, useCallback } from 'react';
import { Rect, Group, Line } from 'react-konva';
import useBlockStore from '../../store/useBlockStore';
import { checkSnap } from '../../utils/snapLogic';

const W = 36;
const H = 360;
const CELL_H = H / 10; // 36px per cell

const FILL        = '#EF6C00';
const FILL_ALT    = '#E65100';  // alternating cell shade
const STROKE      = '#BF360C';
const HIGHLIGHT   = 'rgba(255,255,255,0.15)';
const SHADOW_COLOR = '#7B3200';

export default function TenBlock({ block }) {
  const moveBlock    = useBlockStore((s) => s.moveBlock);
  const groupBlocks  = useBlockStore((s) => s.groupBlocks);
  const ungroupBlock = useBlockStore((s) => s.ungroupBlock);
  const allBlocks    = useBlockStore((s) => s.blocks);
  const groupRef = useRef(null);

  const handleDragEnd = useCallback(
    (e) => {
      const node = e.target;
      const newX = node.x();
      const newY = node.y();
      moveBlock(block.id, newX, newY);

      const updatedBlock = { ...block, x: newX, y: newY };
      const updatedBlocks = allBlocks.map((b) =>
        b.id === block.id ? updatedBlock : b,
      );
      const snap = checkSnap(updatedBlock, updatedBlocks);
      if (snap) {
        groupBlocks(snap.ids, snap.toType, snap.centroidX, snap.centroidY);
      }
    },
    [block, allBlocks, moveBlock, groupBlocks],
  );

  const handleDblClick = useCallback(() => {
    ungroupBlock(block.id);
  }, [block.id, ungroupBlock]);

  // Build the 10 alternating cell rects
  const cells = Array.from({ length: 10 }, (_, i) => i);

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
        x={3}
        y={4}
        width={W}
        height={H}
        fill={SHADOW_COLOR}
        cornerRadius={6}
        opacity={0.4}
      />

      {/* Alternating cell fills */}
      {cells.map((i) => (
        <Rect
          key={i}
          x={0}
          y={i * CELL_H}
          width={W}
          height={CELL_H}
          fill={i % 2 === 0 ? FILL : FILL_ALT}
        />
      ))}

      {/* Outer border */}
      <Rect
        width={W}
        height={H}
        stroke={STROKE}
        strokeWidth={2}
        cornerRadius={6}
        listening={false}
      />

      {/* Grid lines between cells */}
      {cells.slice(1).map((i) => (
        <Line
          key={`line-${i}`}
          points={[2, i * CELL_H, W - 2, i * CELL_H]}
          stroke={STROKE}
          strokeWidth={1}
          opacity={0.6}
          listening={false}
        />
      ))}

      {/* Top highlight */}
      <Rect
        x={4}
        y={4}
        width={W - 8}
        height={14}
        fill={HIGHLIGHT}
        cornerRadius={3}
        listening={false}
      />
    </Group>
  );
}
