import { create } from 'zustand';
import { createBlock } from '../utils/blockFactory';

/**
 * Zustand store — single source of truth for all blocks on the canvas.
 *
 * Block shape: { id: string, type: 'unit'|'ten'|'hundred', x: number, y: number }
 */
const useBlockStore = create((set, get) => ({
  blocks: [],

  // ── Initialise canvas with N unit blocks ──────────────────────────────────
  initBlocks: (canvasWidth, canvasHeight) => {
    const blocks = [];
    const cols = 5;
    const startX = 60;
    const startY = 60;
    const gap = 56;
    for (let i = 0; i < 20; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      blocks.push(createBlock('unit', startX + col * gap, startY + row * gap));
    }
    set({ blocks });
  },

  // ── Add a single block (from toolbar) ─────────────────────────────────────
  addBlock: (type, x, y) => {
    const block = createBlock(type, x ?? 100 + Math.random() * 200, y ?? 80 + Math.random() * 200);
    set((state) => ({ blocks: [...state.blocks, block] }));
  },

  // ── Move a block ──────────────────────────────────────────────────────────
  moveBlock: (id, x, y) => {
    set((state) => ({
      blocks: state.blocks.map((b) => (b.id === id ? { ...b, x, y } : b)),
    }));
  },

  // ── Group N blocks of one type → 1 block of next type ─────────────────────
  // fromType: 'unit' → toType: 'ten'  |  fromType: 'ten' → toType: 'hundred'
  groupBlocks: (ids, toType, centroidX, centroidY) => {
    set((state) => {
      const remaining = state.blocks.filter((b) => !ids.includes(b.id));
      const newBlock = createBlock(toType, centroidX, centroidY);
      return { blocks: [...remaining, newBlock] };
    });
  },

  // ── Ungroup 1 block → 10 blocks of previous type ─────────────────────────
  ungroupBlock: (id) => {
    set((state) => {
      const block = state.blocks.find((b) => b.id === id);
      if (!block) return state;

      const childType = block.type === 'hundred' ? 'ten' : 'unit';
      const remaining = state.blocks.filter((b) => b.id !== id);
      const children = [];

      // Spread children in a 2-column grid originating from the parent's position
      for (let i = 0; i < 10; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const offsetX = col * 44;
        const offsetY = row * 44;
        children.push(createBlock(childType, block.x + offsetX + 4, block.y + offsetY + 4));
      }

      return { blocks: [...remaining, ...children] };
    });
  },

  // ── Clear canvas ─────────────────────────────────────────────────────────
  clearCanvas: () => set({ blocks: [] }),

  // ── Place value chart visibility ────────────────────────────────────────────
  chartVisible:    false,
  toggleChart:     () => set((s) => ({ chartVisible: !s.chartVisible })),

  // ── Column counter visibility (only relevant when chart is on) ──────────
  countersVisible: true,
  toggleCounters:  () => set((s) => ({ countersVisible: !s.countersVisible })),

  // ── Computed: total value ─────────────────────────────────────────────────
  getTotals: () => {
    const { blocks } = get();
    const hundreds = blocks.filter((b) => b.type === 'hundred').length;
    const tens     = blocks.filter((b) => b.type === 'ten').length;
    const units    = blocks.filter((b) => b.type === 'unit').length;
    return { hundreds, tens, units, total: hundreds * 100 + tens * 10 + units };
  },
}));

export default useBlockStore;
