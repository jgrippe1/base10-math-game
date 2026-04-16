/**
 * PlaceValueChart.jsx
 *
 * A Konva Layer rendered below the blocks that draws an interactive
 * place-value chart with three columns: Hundreds | Tens | Ones.
 *
 * Each column:
 *  - Coloured header band with label
 *  - Subtle tinted body fill
 *  - Vertical dashed dividers
 *  - Counter badge at the bottom showing how many native blocks are in the column
 *  - Counter turns RED when count > 9 (place-value overflow)
 *
 * Block assignment: a block belongs to the column whose x-range contains
 * the block's horizontal centre.
 */

import { Layer, Rect, Text, Line, Group } from 'react-konva';
import useBlockStore from '../store/useBlockStore';
import { BLOCK_DIMS } from '../utils/blockFactory';

// ── Column definitions ────────────────────────────────────────────────────────
const COLUMN_DEFS = [
  {
    key:         'hundreds',
    label:       'Hundreds',
    validType:   'hundred',
    headerFill:  '#1B5E20',         // dark green
    bodyFill:    'rgba(46,125,50,0.10)',
    accentColor: '#4CAF50',
  },
  {
    key:         'tens',
    label:       'Tens',
    validType:   'ten',
    headerFill:  '#BF360C',         // dark orange
    bodyFill:    'rgba(239,108,0,0.10)',
    accentColor: '#FF8C00',
  },
  {
    key:         'ones',
    label:       'Ones',
    validType:   'unit',
    headerFill:  '#0D47A1',         // dark blue
    bodyFill:    'rgba(30,136,229,0.10)',
    accentColor: '#42A5F5',
  },
];

const HEADER_H   = 64;   // px — top header band
const COUNTER_H  = 56;   // px — bottom counter area height
const MAX_COUNT  = 9;    // anything above this turns red

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Horizontal centre of a block */
function blockCentreX(block) {
  const dim = BLOCK_DIMS[block.type] ?? { w: 36 };
  return block.x + dim.w / 2;
}

/**
 * Given the full blocks array and a column zone, return the count of
 * native (valid) blocks whose centre falls within the column.
 */
function countInColumn(blocks, colX, colWidth, validType) {
  return blocks.filter((b) => {
    if (b.type !== validType) return false;
    const cx = blockCentreX(b);
    return cx >= colX && cx < colX + colWidth;
  }).length;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PlaceValueChart({ width, height }) {
  const blocks = useBlockStore((s) => s.blocks);

  const colWidth   = width / 3;
  const bodyHeight = height - HEADER_H - COUNTER_H;

  return (
    <Layer listening={false}>
      {COLUMN_DEFS.map((col, i) => {
        const x     = i * colWidth;
        const count = countInColumn(blocks, x, colWidth, col.validType);
        const over  = count > MAX_COUNT;

        // Counter badge geometry
        const badgeW = 90;
        const badgeH = 38;
        const badgeX = x + colWidth / 2 - badgeW / 2;
        const badgeY = height - COUNTER_H / 2 - badgeH / 2;

        return (
          <Group key={col.key}>
            {/* ── Body fill ──────────────────────────────────────────── */}
            <Rect
              x={x}
              y={HEADER_H}
              width={colWidth}
              height={bodyHeight + COUNTER_H}
              fill={col.bodyFill}
            />

            {/* ── Header band ────────────────────────────────────────── */}
            <Rect
              x={x}
              y={0}
              width={colWidth}
              height={HEADER_H}
              fill={col.headerFill}
              opacity={0.85}
            />

            {/* ── Header label ───────────────────────────────────────── */}
            <Text
              x={x}
              y={0}
              width={colWidth}
              height={HEADER_H}
              text={col.label}
              align="center"
              verticalAlign="middle"
              fontSize={22}
              fontFamily="'Nunito', sans-serif"
              fontStyle="800"
              fill="#FFFFFF"
              shadowColor="rgba(0,0,0,0.4)"
              shadowBlur={4}
              shadowOffsetY={2}
            />

            {/* ── Vertical divider (right edge, skip last column) ──── */}
            {i < 2 && (
              <Line
                points={[x + colWidth, HEADER_H, x + colWidth, height]}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={2}
                dash={[10, 8]}
              />
            )}

            {/* ── Header bottom border ────────────────────────────── */}
            <Line
              points={[x, HEADER_H, x + colWidth, HEADER_H]}
              stroke={col.accentColor}
              strokeWidth={2}
              opacity={0.6}
            />

            {/* ── Counter badge background ─────────────────────────── */}
            <Rect
              x={badgeX}
              y={badgeY}
              width={badgeW}
              height={badgeH}
              fill={over ? '#C62828' : 'rgba(0,0,0,0.55)'}
              cornerRadius={10}
              shadowColor={over ? 'rgba(200,0,0,0.6)' : 'rgba(0,0,0,0.4)'}
              shadowBlur={over ? 14 : 6}
              shadowOffsetY={2}
            />

            {/* ── Counter number ───────────────────────────────────── */}
            <Text
              x={badgeX}
              y={badgeY}
              width={badgeW}
              height={badgeH}
              text={String(count)}
              align="center"
              verticalAlign="middle"
              fontSize={20}
              fontFamily="'Nunito', sans-serif"
              fontStyle="900"
              fill={over ? '#FFCDD2' : '#FFFFFF'}
            />

            {/* ── Overflow warning label ───────────────────────────── */}
            {over && (
              <Text
                x={x}
                y={badgeY - 22}
                width={colWidth}
                text="Too many!"
                align="center"
                fontSize={12}
                fontFamily="'Nunito', sans-serif"
                fontStyle="700"
                fill="#EF9A9A"
              />
            )}
          </Group>
        );
      })}

      {/* ── Outer border around entire chart ─────────────────────────────── */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={1}
        listening={false}
      />
    </Layer>
  );
}
