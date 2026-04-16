/**
 * Toolbar.jsx — Left-side panel with spawn buttons and value display.
 * Pure DOM/React — no Konva involved.
 */

import useBlockStore from '../store/useBlockStore';
import ValueDisplay from './ValueDisplay';

// SVG icon previews for buttons
function UnitIcon() {
  return (
    <svg className="btn-icon" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="5" fill="#1565C0" />
      <rect x="3" y="3" width="30" height="10" rx="3" fill="rgba(255,255,255,0.18)" />
    </svg>
  );
}

function TenIcon() {
  return (
    <svg className="btn-icon" viewBox="0 0 36 36" fill="none">
      <rect x="10" width="16" height="36" rx="4" fill="#EF6C00" />
      {[9, 18, 27].map((y) => (
        <line key={y} x1="10" y1={y} x2="26" y2={y} stroke="#BF360C" strokeWidth="1" opacity="0.6" />
      ))}
    </svg>
  );
}

function HundredIcon() {
  return (
    <svg className="btn-icon" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="5" fill="#2E7D32" />
      {[9, 18, 27].map((v) => (
        <g key={v}>
          <line x1={v} y1="0" x2={v} y2="36" stroke="#1B5E20" strokeWidth="0.8" opacity="0.6" />
          <line x1="0" y1={v} x2="36" y2={v} stroke="#1B5E20" strokeWidth="0.8" opacity="0.6" />
        </g>
      ))}
    </svg>
  );
}

export default function Toolbar() {
  const addBlock    = useBlockStore((s) => s.addBlock);
  const clearCanvas = useBlockStore((s) => s.clearCanvas);

  // Spawn near top-left of canvas with some randomness
  const spawnX = () => 60 + Math.random() * 120;
  const spawnY = () => 60 + Math.random() * 120;

  return (
    <aside className="toolbar" role="complementary" aria-label="Block controls">
      <div className="toolbar-title">Base-10 Blocks</div>

      {/* Value display */}
      <div className="toolbar-section-label">Total Value</div>
      <ValueDisplay />

      {/* Spawn buttons */}
      <div className="toolbar-section-label">Add Blocks</div>

      <button
        id="btn-spawn-unit"
        className="btn-spawn btn-unit"
        onClick={() => addBlock('unit', spawnX(), spawnY())}
        aria-label="Add one unit block"
      >
        <UnitIcon />
        Unit (1)
      </button>

      <button
        id="btn-spawn-ten"
        className="btn-spawn btn-ten"
        onClick={() => addBlock('ten', spawnX(), spawnY())}
        aria-label="Add one ten block"
      >
        <TenIcon />
        Ten (10)
      </button>

      <button
        id="btn-spawn-hundred"
        className="btn-spawn btn-hundred"
        onClick={() => addBlock('hundred', spawnX(), spawnY())}
        aria-label="Add one hundred block"
      >
        <HundredIcon />
        Hundred (100)
      </button>

      {/* Clear */}
      <div className="toolbar-section-label">Canvas</div>
      <button
        id="btn-clear"
        className="btn-clear"
        onClick={clearCanvas}
        aria-label="Clear all blocks from canvas"
      >
        🗑 Clear All
      </button>
    </aside>
  );
}
