import { motion, AnimatePresence } from "motion/react";
import { Users, Film, ArrowRight } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { TheatreItem } from "../../types";
import { ORIGINALS_DATA, STARS_MOCK, MAKERS_MOCK } from "../../mock";
import { QuickView } from "../shared/QuickView";
import { CategoryIcon, PresenceIcon, ReleasesIcon } from "../../components/icons/AppIcons";
import { Logo } from "../../components/Logo";
import { ArtistCard } from "./components/ArtistCard";
import { TheatreFeedItem } from "../theatre/components/TheatreFeedItem";
import { SectionHeader } from "../../components/SectionHeader";
import { StarProfileCard, StarProfileCardProps } from "./components/StarProfileCard";
import { StarModal } from "./components/StarModal";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { ReleaseCatalogue } from "./components/ReleaseCatalogue";

export function OriginalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<TheatreItem | null>(null);
  const [selectedStar, setSelectedStar] = useState<StarProfileCardProps | null>(null);
  const [isCatalogueActive, setIsCatalogueActive] = useState(false);
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

  const catalogueItems: TheatreItem[] = useMemo(() => [
    {
      id: `${original.id}-main-poster`,
      title: original.title,
      image: original.coverImage,
    } as TheatreItem,
    ...(original.heroHighlights || [])
  ], [original.id, original.title, original.coverImage, original.heroHighlights]);

  const artistStripItems = useMemo(() => Array.from(
    { length: Math.max(15, original.topArtists.length) },
    (_, index) => original.topArtists[index % original.topArtists.length]
  ), [original.topArtists]);

  const quickViewItems = useMemo(() => [...catalogueItems, ...original.wallOfFame], [catalogueItems, original.wallOfFame]);

  return (
    <div className="min-h-screen bg-[#050505] overflow-y-auto no-scrollbar">
      {/* Hero Header Transformation */}
      <div className="relative h-[65vh] md:h-[60vh] w-full overflow-hidden">
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
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
              
              {/* Initial Info Overlay (disappears on catalogue reveal) */}
              <div className="absolute bottom-0 left-0 p-8 w-full">
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
                    className="font-black tracking-tighter mb-4 uppercase leading-[0.82] break-words"
                    style={{
                      fontSize: `clamp(2.5rem, ${Math.max(5, 15 - original.title.length * 0.3)}vw, 7rem)`,
                    }}
                  >
                    {original.title}
                  </h1>
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
              <ReleaseCatalogue 
                items={catalogueItems} 
                onSelect={(item) => setSelectedItem(item)} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Persistent UI */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
          <Logo onClick={() => navigate("/")} showText={false} />
          
          <button 
            onClick={() => navigate(`/originals/${original.id}/releases`)}
            className="group absolute right-8 top-8 flex items-center gap-3 transition-all hover:text-white/70 active:scale-95 z-50 text-white"
          >
             <span className="text-[10px] font-black uppercase tracking-[0.2em] pt-0.5">Releases</span>
             <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Stats Container (Moved below hero for clarity when catalogue is active) */}
      <div className="px-8 -mt-6 relative z-20">
        <div className="flex items-center gap-8 md:gap-12 py-6 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md rounded-t-3xl sm:rounded-none">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <PresenceIcon className="w-3 h-3 text-yellow-400" />
              <span className="text-lg font-bold">
                {original.stats.presence}
              </span>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">
              Presence
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-3 h-3 text-blue-400" />
              <span className="text-lg font-bold">
                {original.stats.members}
              </span>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">
              Artists
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <Film className="w-3 h-3 text-purple-400" />
              <span className="text-lg font-bold">
                {original.stats.releases}
              </span>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">
              Releases
            </span>
          </div>
          
          <div className="hidden md:block ml-auto max-w-sm">
            <p className="text-[10px] leading-relaxed text-white/40 uppercase font-bold tracking-wider">
              {original.description}
            </p>
          </div>
        </div>
      </div>

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
            <StarProfileCard 
              key={star.actorName} 
              actorName={star.actorName} 
              characterName={star.characterName} 
              imageUrl={star.imageUrl} 
              delay={STARS_MOCK.indexOf(star) * 0.15}
              onClick={() => setSelectedStar(star)}
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
            <StarProfileCard 
              key={maker.actorName} 
              actorName={maker.actorName} 
              characterName={maker.characterName} 
              imageUrl={maker.imageUrl} 
              delay={MAKERS_MOCK.indexOf(maker) * 0.15}
              onClick={() => setSelectedStar(maker)}
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
              <ArtistCard key={`${artist.id}-${idx}`} artist={artist} index={idx} variant="default" />
            ))}
          </div>
        </div>
      </section>

      {/* Wall of Fame */}
      <div className="px-8 pt-3 pb-8">
        <SectionHeader 
           iconNode={<div className="w-4 h-px bg-white" />} 
           title={`${original.title} Wall`}
           containerClassName="mb-8" 
        />

        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
          {original.wallOfFame.map((item) => (
             <TheatreFeedItem
               key={item.id}
               item={item}
               items={original.wallOfFame}
               setSelectedItem={setSelectedItem}
             />
          ))}
        </div>
      </div>

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

      <QuickView
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        isMobile={isMobile}
        items={quickViewItems}
        columns={1}
      />

      {/* Footer Space */}
      <div className="h-24" />

      {/* Cinematic Star Modal Overlay */}
      <StarModal 
        star={selectedStar} 
        onClose={() => setSelectedStar(null)} 
      />
    </div>
  );
}
