import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Film, Sparkles, Settings, Plus, Heart, Bookmark } from 'lucide-react';
import { SETS, FESTIVALS, GRID_ITEMS, PROFILES_DIRECTORY } from '../../mock';
import { ActiveFestivalSpotlight } from './components/ActiveFestivalSpotlight';
import { FestivalArchive } from './components/FestivalArchive';
import { TheatrePreviewSection } from '../theatre/components/TheatrePreviewSection';
import { CinematicPageHeader } from '../../components/CinematicPageHeader';
import { CommandCenter, CommandItem } from '../../components/CommandCenter';
import { SectionHeader } from '../../components/SectionHeader';

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

  const memberCount = set?.members.length ?? 0;
  const festivalCount = allFestivals.length;
  const worksCount = ((id?.length ?? 0) * 31 + memberCount * 7) % 150 + 12;

  const [showToast, setShowToast] = useState(false);

  const setCommandItems: CommandItem[] = useMemo(() => [
    {
      label: "Follow Set",
      icon: <Heart className="w-4 h-4" />,
      action: () => {
        if (!showToast) {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }
      },
      description: "Join Collective",
    },
    {
      label: "Update Set",
      icon: <Settings className="w-4 h-4" />,
      action: () => console.log("Update Set"),
      description: "Curation & Rules",
      visible: true, // In real app, check permissions
    },
    {
      label: "New Ritual",
      icon: <Plus className="w-4 h-4" />,
      action: () => console.log("New Ritual"),
      description: "Start Festival",
      visible: true,
    },
  ], [showToast]);

  if (!set) {
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
        title={set.title}
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
            className="fixed bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 bg-white text-black rounded-full shadow-[0_0_40px_rgba(255,255,255,0.4)] z-[200] flex items-center gap-2 pointer-events-none"
          >
            <Bookmark size={14} className="fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest mt-0.5">
              Added to Ledger
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Layer I: Atmos Header ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Background atmosphere: desaturated coverImage at low opacity */}
        <div
          className="absolute inset-0 bg-cover bg-top opacity-[0.07] grayscale pointer-events-none select-none"
          style={{ backgroundImage: `url(${set.coverImage})` }}
          aria-hidden="true"
        />
        {/* Vertical gradient blending into page */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/60 to-[#050505] pointer-events-none" aria-hidden="true" />

        {/* Watermark: Set Title */}
        <p
          className="absolute inset-0 flex items-center justify-center font-black uppercase text-white select-none pointer-events-none"
          aria-hidden="true"
          style={{
            fontSize: 'clamp(4rem, 18vw, 14rem)',
            opacity: 0.025,
            letterSpacing: '-0.03em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {set.title}
        </p>

        <div className="relative z-10 px-4 md:px-8 pt-12 md:pt-16 pb-2 md:pb-4">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-end max-w-[1200px]">

            {/* Cover Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex-shrink-0 w-[140px] md:w-[180px] aspect-video md:aspect-[2/3] overflow-hidden rounded-lg border border-white/[0.08] shadow-2xl"
            >
              <img
                src={set.coverImage}
                alt={set.title}
                className="w-full h-full object-cover object-top"
              />
            </motion.div>

            {/* Identity */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-4"
            >
              {/* Monospace handle */}
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-white/25">
                [ SET // {set.id.toUpperCase()} ]
              </p>

              {/* Title */}
              <h1
                className="font-black uppercase leading-none text-white"
                style={{
                  fontSize: 'clamp(2rem, 6vw, 4.5rem)',
                  maxWidth: '95%',
                  letterSpacing: '-0.02em',
                }}
              >
                {set.title}
              </h1>

              {/* Theme Line */}
              {set.themeLine && (
                <p className="text-[12px] md:text-sm text-white/40 font-medium italic tracking-wide">
                  "{set.themeLine}"
                </p>
              )}

              {/* Captain Pill */}
              {captain && (
                <button
                  onClick={() => navigate(`/profile/${captain.id}`)}
                  className="self-start flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/10 rounded-full transition-all duration-300 group"
                >
                  {captain.profilePicture && (
                    <img
                      src={captain.profilePicture}
                      alt={captain.name}
                      className="w-4 h-4 rounded-full object-cover object-top flex-shrink-0"
                    />
                  )}
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white/70 transition-colors">
                    Curated by {captain.name}
                  </span>
                </button>
              )}

              {/* Stats Row */}
              <div className="flex items-center gap-5 pt-1">
                {[
                  { icon: <Users className="w-3 h-3" />, value: memberCount, label: memberCount === 1 ? 'Member' : 'Members' },
                  { icon: <Sparkles className="w-3 h-3" />, value: festivalCount, label: festivalCount === 1 ? 'Festival' : 'Festivals' },
                  { icon: <Film className="w-3 h-3" />, value: worksCount, label: 'Works' },
                ].map(({ icon, value, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-white/25">
                    {icon}
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                      {value} {label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Divider */}


      {/* ─── Layer II: Active Festival Spotlight ────────────────────────────── */}
      {activeFestival ? (
        <ActiveFestivalSpotlight festival={activeFestival} set={set} />
      ) : (
        <section className="px-4 md:px-8 py-10" aria-label="No Active Festival">
          <SectionHeader
            title="No Active Festival"
            containerClassName="mb-6"
          />
          <p className="text-[11px] text-white/20 leading-relaxed">
            The stage is quiet. Next ritual is being prepared by the Captains.
          </p>
        </section>
      )}


      {/* ─── Layer III: Festival Archive ─────────────────────────────────────── */}

      <FestivalArchive festivals={allFestivals} />

      {/* ─── Layer IV: Set Theatre (Y-axis scroll) ───────────────────────────── */}
      <TheatrePreviewSection
        title={`${set.title} Theatre`}
        works={setWorks}
        enterUrl={`/sets/${set.id}/theatre`}
      />
    </div>
  );
}
