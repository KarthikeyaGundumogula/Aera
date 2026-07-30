import { memo } from 'react';
import { Plus, Layers } from 'lucide-react';
import { SETS } from '../../../mock';
import { SetCard } from './SetCard';
import { useAuth } from '../../../context/AuthContext';
import { EmptyState } from '../../../components/EmptyState';

interface SetsGridProps {
  onCreateSetClick?: () => void;
}

export const SetsGrid = memo(function SetsGrid({ onCreateSetClick }: SetsGridProps) {
  const { currentArtist } = useAuth();
  const role = currentArtist?.role?.toLowerCase();
  const isOrganizer = !!currentArtist && (role === "organizer" || role === "admin");

  if (SETS.length === 0) {
    return (
      <section className="px-6 pt-12 pb-32 max-w-xl mx-auto" aria-label="Sets Registry">
        <EmptyState
          sectionTitle="ALL SETS"
          sectionIcon={Layers}
          icon={Layers}
          title="No Sets Established Yet"
          description={
            isOrganizer
              ? "Be the first organizer to establish a new Set community."
              : "Set community creation is reserved exclusively for profiles with the 'organizer' role."
          }
          badge="SET REGISTRY EMPTY"
          actionLabel={isOrganizer ? "Establish First Set" : undefined}
          onAction={isOrganizer ? onCreateSetClick : undefined}
        />
      </section>
    );
  }

  return (
    <section className="px-6 pt-4 pb-32" aria-label="Sets Registry">
      {/* Section label */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-4 h-px bg-white/25" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">
            All Sets
          </span>
        </div>

        {isOrganizer && onCreateSetClick && (
          <button 
            onClick={onCreateSetClick}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-black hover:bg-transparent hover:text-white transition-all active:scale-95"
          >
            <Plus className="w-3 h-3" />
            <span>Create Set</span>
          </button>
        )}
      </div>

      {/* App-like feed grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SETS.map((set, i) => (
          <SetCard key={set.id} set={set} index={i} />
        ))}
      </div>
    </section>
  );
});
