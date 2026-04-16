/**
 * ValueDisplay.jsx — Live HUD showing the current total and breakdown.
 * Rendered inside the Toolbar (DOM, not Konva).
 */

import { useEffect, useRef, useState } from 'react';
import useBlockStore from '../store/useBlockStore';

const DOT_COLORS = {
  hundreds: '#2E7D32',
  tens:     '#EF6C00',
  units:    '#1E88E5',
};

export default function ValueDisplay() {
  const getTotals = useBlockStore((s) => s.getTotals);
  const blocks    = useBlockStore((s) => s.blocks); // subscribe to re-render on change

  const totals = getTotals();
  const prevTotal = useRef(totals.total);
  const [bump, setBump] = useState(false);

  // Animate value bump on change
  useEffect(() => {
    if (totals.total !== prevTotal.current) {
      prevTotal.current = totals.total;
      setBump(true);
      const t = setTimeout(() => setBump(false), 250);
      return () => clearTimeout(t);
    }
  }, [totals.total]);

  const rows = [
    { key: 'hundreds', label: '× 100', count: totals.hundreds },
    { key: 'tens',     label: '× 10',  count: totals.tens },
    { key: 'units',    label: '× 1',   count: totals.units },
  ];

  return (
    <div className="value-display">
      <div className={`value-total${bump ? ' bump' : ''}`}>
        {totals.total}
      </div>

      <div className="value-breakdown">
        {rows.map(({ key, label, count }) => (
          <div className="value-row" key={key}>
            <div
              className="value-row-dot"
              style={{ background: DOT_COLORS[key] }}
            />
            <span className="value-row-label">{label}</span>
            <span className="value-row-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
