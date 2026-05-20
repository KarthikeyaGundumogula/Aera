import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Bookmark, Settings, Plus } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useDeferredValue } from "react";
import { ORIGINALS_DATA, STARS_MOCK, MAKERS_MOCK } from "../../mock";
import { ArtistProfile, PersonProfile, MakerProfile } from "../shared/profile";
import { SectionHeader } from "../../components/SectionHeader";
import { CinematicPageHeader } from "../../components/CinematicPageHeader";

import { useMediaQuery } from "../../hooks/useMediaQuery";
import { TheatrePreviewSection } from "../theatre/components/TheatrePreviewSection";
import { ArtistSpotlightGrid } from "../../components/ArtistSpotlightGrid";
import { OriginalStats } from "./components/OriginalStats";
import { CommandCenter, CommandItem } from "../../components/CommandCenter";
import { OriginalManagementModal } from "./components/OriginalManagementModal";
import { RecentReleasesSection } from "../shared/components/RecentReleasesSection";

interface OriginalClaims {
  canUpdateMeta: boolean;
  canCreateRelease: boolean;
}


export function OriginalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [showToast, setShowToast] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const isMobile = useMediaQuery();
  const baseOriginal = id ? ORIGINALS_DATA[id] : null;
  const [localOriginal, setLocalOriginal] = useState(baseOriginal);

  const userClaims: OriginalClaims = {
    canUpdateMeta: true,
    canCreateRelease: true,
  };

  useEffect(() => {
    setLocalOriginal(baseOriginal);
    setShowManagement(false);
  }, [baseOriginal]);

  const original = localOriginal;

  const commandItems: CommandItem[] = useMemo(() => [
    {
      label: "Save to Watchlist",
      icon: <Bookmark className="w-4 h-4" />,
      action: () => {
        if (!showToast) {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }
      },
      description: "Log to Ledger",
    },
    {
      label: "Update Original",
      icon: <Settings className="w-4 h-4" />,
      action: () => setShowManagement(true),
      description: "Curation & Metadata",
      visible: userClaims.canUpdateMeta,
    },
    {
      label: "New Release",
      icon: <Plus className="w-4 h-4" />,
      action: () => navigate(`/originals/${original?.id}/releases/new`),
      description: "Drop an Update",
      visible: userClaims.canCreateRelease,
    },
  ], [navigate, original?.id, showToast, userClaims.canCreateRelease, userClaims.canUpdateMeta]);

  // Defer expensive secondary data so the page paints immediately on navigation
  const deferredOriginal = useDeferredValue(original);

  const artistStripItems = useMemo(() => {
    if (!deferredOriginal) return [];
    return Array.from(
      { length: Math.max(15, deferredOriginal.topArtists.length) },
      (_, index) => deferredOriginal.topArtists[index % deferredOriginal.topArtists.length]
    );
  }, [deferredOriginal]);



  if (!original) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Original not found</h1>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-white text-black rounded-full font-bold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] overflow-y-auto no-scrollbar transition-all duration-300 pt-[68px] md:pt-[72px]">
      {/* Hero Header Transformation */}
      <motion.div 
        animate={{ 
          height: isMobile ? "65vh" : "75vh"
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="relative w-full overflow-hidden"
      >
        <div className="absolute inset-0">
          <img loading="lazy"
            src={original.coverImage}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
          
          {/* Initial Info Overlay */}
          <div className="absolute bottom-20 md:bottom-24 left-0 px-8 py-6 w-full max-w-[95vw]">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest rounded-sm border border-white/10">
                    Original Spotlight
                </span>
                <div className="h-px w-8 bg-white/20" />
              </div>
              <h1
                className="font-black tracking-tighter mb-2 uppercase leading-[0.82] whitespace-pre-wrap drop-shadow-2xl"
                style={{
                  fontSize: !original.title.includes(" ") 
                    ? `clamp(2.5rem, ${Math.min(14, 90 / (original.title.length * 0.8))}vw, 7rem)`
                    : `clamp(2.5rem, ${Math.max(5, 15 - original.title.length * 0.3)}vw, 7rem)`,
                  wordBreak: "normal",
                  overflowWrap: "normal"
                }}
              >
                {original.title}
              </h1>
              <p className="text-sm md:text-base text-white/80 font-medium leading-relaxed drop-shadow-md mt-4 max-w-2xl">
                {original.description}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Sticky Header */}
        <CinematicPageHeader
          title={original.title}
          onBack={() => navigate('/')}
          onTitleClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          rightActions={
            <>
              <CommandCenter
                contextTitle="Original Studio"
                items={commandItems}
              />
              <div className="hidden sm:block h-4 w-px bg-white/10" />
              <button
                onClick={() => navigate(`/originals/${original.id}/releases`)}
                className="group flex items-center gap-2 transition-all hover:text-white/70 active:scale-95 text-white"
              >
                <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-[0.2em] pt-0.5">Releases</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </>
          }
        />

        <OriginalStats stats={original.stats} />
      </motion.div>

      {/* RECENT RELEASES */}
      <RecentReleasesSection />

      {/* Star Spotlight */}
      <section className="px-8 pt-10 pb-4">
        <SectionHeader 
           title="Stars" 
           containerClassName="mb-6" 
        />

        <div className="overflow-x-auto no-scrollbar pb-6 -mx-8 px-8">
          <div className="flex gap-4 sm:gap-6 w-max">
            {STARS_MOCK.map((star, index) => (
              <PersonProfile 
                key={star.actorName} 
                person={star} 
                delay={index * 0.15}
                type="Star"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Makers Spotlight */}
      <section className="px-8 pt-6 pb-4">
        <SectionHeader 
           title="Makers" 
           containerClassName="mb-6" 
        />

        <div className="overflow-x-auto no-scrollbar pb-6 -mx-8 px-8">
          <div className="flex gap-4 sm:gap-6 w-max">
            {MAKERS_MOCK.map((maker, index) => (
              <MakerProfile 
                key={maker.actorName} 
                person={maker} 
                delay={index * 0.15}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Top Artists */}
      <ArtistSpotlightGrid
        title="Artist Spotlight"
        artists={artistStripItems}
        rows={3}
        variant="default"
        containerClassName="pt-4 pb-4"
      />

      {/* Originals Theatre Section */}
      <TheatrePreviewSection 
        title="Theatre"
        works={original.works} 
        enterUrl={`/originals/${original.id}/theatre`} 
      />


      {/* Detailed Information */}
      <div className="p-8 pt-0">
        <SectionHeader 
           iconNode={<div className="w-4 h-px bg-white" />} 
           title="Detailed Information"
           containerClassName="mb-8" 
        />

        <div className="space-y-8">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
              Full Description
            </h4>
            <p className="text-sm text-white/80 leading-relaxed">
              {original.description} This curated original represents a pinnacle of
              cinematic achievement, bringing together the most impactful visual
              and narrative elements from the {original.title} universe.
            </p>
          </div>

          {original.releaseDate && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
                Release Date
              </h4>
              <p className="text-sm text-white/80 font-mono tracking-tighter">
                {original.releaseDate}
              </p>
            </div>
          )}
        </div>
      </div>



      {/* Footer Space */}
      <div className="h-24" />

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

      {/* Management Modal */}
      <AnimatePresence>
        {showManagement && (
          <OriginalManagementModal
            original={original}
            onClose={() => setShowManagement(false)}
            onSave={(updated) =>
              setLocalOriginal((prev) => (prev ? { ...prev, ...updated } : prev))
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
