import { memo } from 'react';
import { Plus } from 'lucide-react';
import { SETS } from '../../../mock';
import { SetCard } from './SetCard';

interface SetsGridProps {
  onCreateSetClick?: () => void;
}

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
export const SetsGrid = memo(function SetsGrid({ onCreateSetClick }: SetsGridProps) {
  if (SETS.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 pt-4 pb-24" aria-label="Sets Registry">
      {/* Section label */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-4 h-px bg-white/25" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
            Sets
          </span>
        </div>

        {onCreateSetClick && (
          <button 
            onClick={onCreateSetClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all active:scale-95"
          >
            <Plus className="w-3 h-3" />
            <span>Create Set</span>
          </button>
        )}
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
