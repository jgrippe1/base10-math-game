/**
 * UnitBlock.jsx — A single 1s block rendered on the Konva canvas.
 *
 * Visual: 36×36 blue square with a subtle inner highlight and drop shadow.
 * Behaviour: Draggable. On drag-end, triggers snap check.
 *            Double-click/tap: nothing (units don't ungroup further).
 */

import { useRef, useCallback } from 'react';
import { Rect, Group, Line } from 'react-konva';
import useBlockStore from '../../store/useBlockStore';
import { checkSnap } from '../../utils/snapLogic';

const W = 36;
const H = 36;
const FILL   = '#1E88E5';
const STROKE = '#1565C0';
const HIGHLIGHT = 'rgba(255,255,255,0.18)';
const SHADOW_COLOR = '#0D47A1';

export default function UnitBlock({ block }) {
  const moveBlock   = useBlockStore((s) => s.moveBlock);
  const groupBlocks = useBlockStore((s) => s.groupBlocks);
  const allBlocks   = useBlockStore((s) => s.blocks);
  const groupRef = useRef(null);

  const handleDragEnd = useCallback(
    (e) => {
      const node = e.target;
      const newX = node.x();
      const newY = node.y();

      // Commit position to store first
      moveBlock(block.id, newX, newY);

      // Check if snap should fire
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

  return (
    <Group
      ref={groupRef}
      id={block.id}
      x={block.x}
      y={block.y}
      draggable
      onDragEnd={handleDragEnd}
    >
      {/* Shadow layer */}
      <Rect
        x={2}
        y={3}
        width={W}
        height={H}
        fill={SHADOW_COLOR}
        cornerRadius={5}
        opacity={0.45}
      />
      {/* Main body */}
      <Rect
        width={W}
        height={H}
        fill={FILL}
        stroke={STROKE}
        strokeWidth={1.5}
        cornerRadius={5}
      />
      {/* Inner highlight */}
      <Rect
        x={3}
        y={3}
        width={W - 6}
        height={10}
        fill={HIGHLIGHT}
        cornerRadius={3}
      />
    </Group>
  );
}
