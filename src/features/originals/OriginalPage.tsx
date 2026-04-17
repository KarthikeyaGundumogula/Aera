import { motion, AnimatePresence } from "motion/react";
import { Users, Film, ArrowRight } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { TheatreItem } from "../../types";
import { ORIGINALS_DATA, STARS_MOCK, MAKERS_MOCK } from "../../mock";
import { PresenceIcon } from "../../components/icons/AppIcons";
import { Logo } from "../../components/Logo";
import { ArtistProfile, PersonProfile, MakerProfile } from "../shared/profile";
import { SectionHeader } from "../../components/SectionHeader";

import { useMediaQuery } from "../../hooks/useMediaQuery";
import { ReleasesCarousel } from "./components/ReleasesCarousel";
import { OriginalTheatreSection } from "./components/OriginalTheatreSection";
import { OriginalStats } from "./components/OriginalStats";
import { WorkModal } from "../shared/modals";


export function OriginalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<TheatreItem | null>(null);

  const [isCatalogueActive, setIsCatalogueActive] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const isMobile = useMediaQuery();

  const original = id ? ORIGINALS_DATA[id] : null;

  // Reveal interactive catalogue after 3 seconds
  useEffect(() => {
    if (!original?.heroHighlights?.length) return;
    
    const timer = setTimeout(() => {
      setIsCatalogueActive(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [original]);

  const catalogueItems: TheatreItem[] = useMemo(() => {
    if (!original) return [];
    return original.heroHighlights || [];
  }, [original]);

  const artistStripItems = useMemo(() => {
    if (!original) return [];
    return Array.from(
      { length: Math.max(15, original.topArtists.length) },
      (_, index) => original.topArtists[index % original.topArtists.length]
    );
  }, [original]);

  const handleSelectWork = (item: TheatreItem | null) => {
    setSelectedItem(item);
  };

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

  const heroHeight = isTheaterMode 
    ? (isMobile ? "h-[56.25vw]" : "h-[85vh]") 
    : (isMobile ? "h-[65vh]" : "h-[75vh]");

  return (
    <div className="min-h-screen bg-[#050505] overflow-y-auto no-scrollbar">
      {/* Hero Header Transformation */}
      <motion.div 
        animate={{ height: isTheaterMode ? (isMobile ? "56.25vw" : "85vh") : (isMobile ? "65vh" : "75vh") }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="relative w-full overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!isCatalogueActive ? (
            <motion.div
              key="static-poster"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img
                src={original.coverImage}
                className="w-full h-full object-cover"
                
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
              
              {/* Initial Info Overlay (disappears on catalogue reveal) */}
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
            </motion.div>
          ) : (
            <motion.div
              key="interactive-catalogue"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.0 }}
              className="absolute inset-0 h-full w-full"
            >
              <ReleasesCarousel 
                items={catalogueItems} 
                initialIndex={catalogueItems.length > 1 ? 1 : 0}
                onSelect={handleSelectWork} 
                isTheaterMode={isTheaterMode}
                onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Persistent UI */}
        <AnimatePresence>
          {!isTheaterMode && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 pointer-events-none"
            >
              <div className="pointer-events-auto">
                <Logo onClick={() => navigate("/")} showText={false} />
              </div>
              
              <button 
                onClick={() => navigate(`/originals/${original.id}/releases`)}
                className="group absolute right-8 top-8 flex items-center gap-3 transition-all hover:text-white/70 active:scale-95 z-50 text-white pointer-events-auto"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] pt-0.5">Releases</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <OriginalStats stats={original.stats} isTheaterMode={isTheaterMode} />
      </motion.div>

      {/* Star Spotlight */}
      <section className="px-8 pt-10 pb-4">
        <SectionHeader 
           iconNode={<div className="w-4 h-px bg-white" />} 
           title="Stars" 
           containerClassName="mb-6" 
        />

        <div className="overflow-x-auto no-scrollbar pb-6 -mx-8 px-8">
          <div className="flex gap-4 sm:gap-6 w-max">
            {STARS_MOCK.map((star) => (
              <PersonProfile 
                key={star.actorName} 
                person={star} 
                delay={STARS_MOCK.indexOf(star) * 0.15}
                type="Star"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Makers Spotlight */}
      <section className="px-8 pt-6 pb-4">
        <SectionHeader 
           iconNode={<div className="w-4 h-px bg-white" />} 
           title="Makers" 
           containerClassName="mb-6" 
        />

        <div className="overflow-x-auto no-scrollbar pb-6 -mx-8 px-8">
          <div className="flex gap-4 sm:gap-6 w-max">
            {MAKERS_MOCK.map((maker) => (
              <MakerProfile 
                key={maker.actorName} 
                person={maker} 
                delay={MAKERS_MOCK.indexOf(maker) * 0.15}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Top Artists */}
      <section className="px-8 pt-4 pb-4">
        <SectionHeader 
           iconNode={<div className="w-4 h-px bg-white" />} 
           title="Artist Spotlight" 
           containerClassName="mb-6" 
        />

        <div className="overflow-x-auto no-scrollbar pb-2">
          <div className="grid grid-flow-col grid-rows-3 gap-2 auto-cols-[250px] md:auto-cols-[300px] w-max">
            {artistStripItems.map((artist, idx) => (
              <ArtistProfile key={`${artist.id}-${idx}`} artist={artist} index={idx} variant="default" />
            ))}
          </div>
        </div>
      </section>

      {/* Originals Theatre Section */}
      <OriginalTheatreSection original={original} setSelectedItem={handleSelectWork} />


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

      <WorkModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />

      {/* Footer Space */}
      <div className="h-24" />


    </div>
  );
}
