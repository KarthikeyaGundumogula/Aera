import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Film, Sparkles, Settings, Plus, Heart, Bookmark, Upload, LogOut, MessageSquare } from 'lucide-react';
import { SETS, FESTIVALS, GRID_ITEMS, PROFILES_DIRECTORY, THOUGHTS_MOCK } from '../../mock';
import { ThoughtCard } from '../shared/thoughts/ThoughtCard';
import { ActiveFestivalSpotlight } from './components/ActiveFestivalSpotlight';
import { FestivalArchive } from './components/FestivalArchive';
import { TheatrePreviewSection } from '../theatre/components/TheatrePreviewSection';
import { CinematicPageHeader } from '../../components/CinematicPageHeader';
import { CommandCenter, CommandItem } from '../../components/CommandCenter';
import { SectionHeader } from '../../components/SectionHeader';
import { UpdateSetModal } from './components/UpdateSetModal';
import { CreateFestivalModal } from './components/CreateFestivalModal';

/**
 * SetDetailPage — /sets/:id
 *
 * Layer Architecture:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ I   — Atmos Header (Identity + Captain + Stats)             │
 * ├─────────────────────────────────────────────────────────────┤
 * │ II  — Active Festival Spotlight (Bento + Countdown)         │
 * ├─────────────────────────────────────────────────────────────┤
 * │ III — Festival Archive (Horizontal scroll, CONCLUDED only)  │
 * ├─────────────────────────────────────────────────────────────┤
 * │ IV  — Set Theatre (Y-axis, cluster-based, filtered works)   │
 * └─────────────────────────────────────────────────────────────┘
 */
export function SetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const set = useMemo(() => SETS.find(s => s.id === id), [id]);
  const allFestivals = useMemo(() => FESTIVALS.filter(f => f.setId === id), [id]);
  const activeFestival = useMemo(
    () => allFestivals.find(f => f.status === 'LIVE' || f.status === 'UPCOMING') ?? null,
    [allFestivals]
  );
  const captain = useMemo(
    () => set ? PROFILES_DIRECTORY.find(p => p.id === set.captainId) : null,
    [set]
  );
  // Works filtered for this set — using all works as proxy since mock works don't have setId yet
  // In production this will be a real backend filter
  const setWorks = useMemo(() => GRID_ITEMS.slice(0, 18), []);

  const setThoughts = useMemo(
    () => THOUGHTS_MOCK.filter(t => t.setId === id),
    [id]
  );

  const [isJoined, setIsJoined] = useState(false);
  const memberCount = (set?.members.length ?? 0) + (isJoined ? 1 : 0);
  const festivalCount = allFestivals.length;
  const worksCount = ((id?.length ?? 0) * 31 + memberCount * 7) % 150 + 12;

  const [showToast, setShowToast] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCreateFestivalModalOpen, setIsCreateFestivalModalOpen] = useState(false);
  
  // Local state for immediate updates
  const [localSet, setLocalSet] = useState(set);

  useEffect(() => {
    setLocalSet(set);
  }, [set]);

  const setCommandItems: CommandItem[] = useMemo(() => [
    {
      label: "Update Set",
      icon: <Settings className="w-4 h-4" />,
      action: () => setIsUpdateModalOpen(true),
      description: "Curation & Rules",
      visible: true, // In real app, check if user is curator
    },
    {
      label: "Upload Work",
      icon: <Upload className="w-4 h-4" />,
      action: () => navigate(`/works/new?setId=${id}`),
      description: "Contribute to Set",
      visible: true,
    },
    {
      label: "Leave Set",
      icon: <LogOut className="w-4 h-4 text-red-500" />,
      action: () => {
        if (window.confirm("Are you sure you want to leave this set?")) {
          setIsJoined(false);
        }
      },
      description: "Exit Collective",
      visible: isJoined,
    },
    {
      label: "Create Festival",
      icon: <Plus className="w-4 h-4" />,
      action: () => setIsCreateFestivalModalOpen(true),
      description: "Start New Festival (Curator)",
      visible: true, // In real app, check if user is curator
    },
  ], [isJoined, id, navigate]);

  if (!localSet) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-[11px] uppercase tracking-[0.4em] text-white/30">Set Not Found</p>
        <button
          onClick={() => navigate('/sets')}
          className="text-[10px] uppercase tracking-[0.3em] text-white/20 hover:text-white transition-colors"
        >
          ← Back to Sets
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden pt-[68px] md:pt-[72px]">

      {/* ─── Sticky Header ───────────────────────────────────────────────────── */}
      <CinematicPageHeader
        title={localSet.title}
        onBack={() => navigate('/sets')}
        backLabel="Sets"
        onTitleClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        rightActions={
          <CommandCenter
            contextTitle="Set Control"
            items={setCommandItems}
          />
        }
      />

      {/* Visual Hit Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 bg-white text-black rounded-full z-[200] flex items-center gap-2 pointer-events-none"
          >
            <Bookmark size={14} className="fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest mt-0.5">
              Added to Ledger
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Layer I: Atmos Header ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden w-full min-h-[35vh] flex flex-col justify-center items-center pt-8 pb-8 md:pt-10 md:pb-10 bg-[#030303] border-b border-white/[0.02]">
        
        {/* Cinematic Background Design */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" />
        
        {/* Massive SVG Typography Container */}
        <div className="w-full max-w-[1400px] flex items-center justify-center px-4 md:px-8 relative z-10 pointer-events-none mt-8">
          <svg
            className="w-full"
            viewBox="0 0 1000 200"
            preserveAspectRatio="xMidYMid meet"
          >
            <text
              x="500"
              y="150"
              fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              fontSize="160"
              fontWeight="900"
              fill={localSet.accentColor || '#ffffff'}
              textAnchor="middle"
              textLength="900"
              lengthAdjust="spacingAndGlyphs"
              className="uppercase select-none drop-shadow-2xl"
            >
              {localSet.title}
            </text>
          </svg>
        </div>

        {/* Central Identity Dock */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-center gap-6 mt-2 max-w-2xl px-6 text-center"
        >
          {/* Theme Line */}
          {localSet.themeLine && (
            <p className="text-[12px] md:text-[15px] font-medium italic text-white/50 tracking-[0.25em] uppercase drop-shadow-md">
              "{localSet.themeLine}"
            </p>
          )}



          {/* Captain Pill */}
          {captain && (
            <button
              onClick={() => navigate(`/profile/${captain.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/10 rounded-full transition-all duration-300 group"
            >
              {captain.profilePicture && (
                <img
                  src={captain.profilePicture}
                  alt={captain.name}
                  className="w-5 h-5 rounded-full object-cover object-top flex-shrink-0"
                />
              )}
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white/70 transition-colors">
                Curated by {captain.name}
              </span>
            </button>
          )}

          {/* Dynamic Join Button */}
          <div className="flex items-center pt-2">
            <button
              onClick={() => setIsJoined(!isJoined)}
              className={`px-8 py-3.5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${
                isJoined
                  ? "bg-white/5 text-white/40 border border-white/5"
                  : "bg-white text-black hover:bg-white/90 hover:scale-105"
              }`}
            >
              {isJoined ? "Joined" : "Join"}
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 pt-4">
            {[
              { icon: <Users className="w-3.5 h-3.5" />, value: memberCount, label: memberCount === 1 ? 'Member' : 'Members' },
              { icon: <Sparkles className="w-3.5 h-3.5" />, value: festivalCount, label: festivalCount === 1 ? 'Festival' : 'Festivals' },
              { icon: <Film className="w-3.5 h-3.5" />, value: worksCount, label: 'Works' },
            ].map(({ icon, value, label }, idx) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-white/20">
                  {icon}
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-white/40">
                    <span className="text-white/80 mr-1">{value}</span>
                    {label}
                  </span>
                </div>
                {idx < 2 && <div className="h-3 w-px bg-white/10 hidden md:block ml-4" />}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Divider */}


      {/* ─── Layer I.V: Open Discussions ───────────────────────────────────────── */}
      {setThoughts.length > 0 && (
        <section className="px-4 md:px-8 py-6 border-b border-white/[0.04] bg-[#050505]">
          <SectionHeader
            icon={MessageSquare}
            title="Open Discussions"
            containerClassName="mb-6"
          />
          <div className="overflow-x-auto no-scrollbar pb-4">
            <div className="flex gap-4 sm:gap-6 w-max">
              {setThoughts.map((thought) => (
                <ThoughtCard
                  key={thought.id}
                  thought={thought}
                  onCardClick={() => navigate(`/sets/${id}/discussions/${thought.id}`)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Layer II: Active Festival Spotlight ────────────────────────────── */}
      {activeFestival ? (
        <ActiveFestivalSpotlight festival={activeFestival} set={localSet} />
      ) : (
        <section className="px-4 md:px-8 py-6" aria-label="No Active Festival">
          <SectionHeader
            title="No Active Festival"
            containerClassName="mb-6"
          />
          <p className="text-[11px] text-white/20 leading-relaxed">
            The stage is quiet. Next festival is being prepared by the Captains.
          </p>
        </section>
      )}


      {/* ─── Layer III: Festival Archive ─────────────────────────────────────── */}

      <FestivalArchive festivals={allFestivals} />

      {/* ─── Layer IV: Set Theatre (Y-axis scroll) ───────────────────────────── */}
      <TheatrePreviewSection
        title={`${localSet.title} Theatre`}
        works={setWorks}
        enterUrl={`/sets/${localSet.id}/theatre`}
      />

      {/* Modals */}
      {isUpdateModalOpen && localSet && (
        <UpdateSetModal
          isOpen={isUpdateModalOpen}
          set={localSet}
          onClose={() => setIsUpdateModalOpen(false)}
          onSave={(updates) => setLocalSet(prev => prev ? { ...prev, ...updates } : prev)}
        />
      )}

      {isCreateFestivalModalOpen && (
        <CreateFestivalModal
          setId={localSet.id}
          isOpen={isCreateFestivalModalOpen}
          onClose={() => setIsCreateFestivalModalOpen(false)}
          onCreate={() => undefined}
        />
      )}
    </div>
  );
}
