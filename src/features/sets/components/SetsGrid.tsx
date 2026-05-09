import { memo } from 'react';
import { SETS } from '../../../mock';
import { SetCard } from './SetCard';

/**
 * SetsGrid — Responsive editorial grid for the Set Registry.
 *
 * Layout:
 * - Mobile (< 768px): 1 column — full-width cards stack vertically
 * - md (≥ 768px): 2 columns — side-by-side pairs
 * - lg (≥ 1024px): 3 columns — compact grid, prevents overstretching
 *
 * No "featured" full-width first card on desktop — a uniform grid
 * respects the 16:9 aspect ratio and keeps cards proportional.
 */
export const SetsGrid = memo(function SetsGrid() {
  if (SETS.length === 0) return null;

  return (
    <section className="px-5 sm:px-8 pb-24" aria-label="Sets Registry">
      {/* Section label */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-4 h-px bg-white/25" />
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
          Sets
        </span>
      </div>

      {/* Uniform responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SETS.map((set, i) => (
          <SetCard key={set.id} set={set} index={i} />
        ))}
      </div>
    </section>
  );
});
