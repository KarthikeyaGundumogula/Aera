import { motion, AnimatePresence } from "motion/react";
import { memo, useState, useEffect, useRef, useCallback } from "react";
import {
  PlayCircle,
  Search,
  User,
  Loader2,
  History,
  Crown,
  ChevronRight,
  Users,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { TheatreItem, SetSelectedItem } from "../types";
import { GRID_ITEMS, FEATURED_ITEMS, ORIGINALS } from "../mock";
import { CategoryIcon, PresenceIcon, ReleasesIcon, EditsIcon, PostersIcon, ScriptsIcon } from "../components/AppIcons";

import { Logo } from "../components/Logo";

interface HomeFeedLayoutProps {
  selectedItem: TheatreItem | null;
  setSelectedItem: SetSelectedItem;
}

const TopOriginalsAccordion = memo(function TopOriginalsAccordion({
  navigate,
}: {
  navigate: (path: string) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Top originals by presence (repeated to mock 15 items for layout testing)
  const baseOriginals = [...ORIGINALS].sort(
    (a, b) => b.stats.presence - a.stats.presence,
  );
  const topOriginals = [
    ...baseOriginals,
    ...baseOriginals.map((org) => ({ ...org, id: `${org.id}-copy2` })),
    ...baseOriginals.map((org) => ({ ...org, id: `${org.id}-copy3` })),
  ];

  return (
    <div className="flex h-[300px] md:h-[400px] w-full gap-2 px-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
      {topOriginals.map((org) => {
        const isActive = activeId === org.id;
        return (
          <div
            key={org.id}
            className={`relative rounded-xl overflow-hidden snap-center cursor-pointer shrink-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isActive ? "w-[360px] md:w-[520px]" : "w-[200px] md:w-[260px]"}`}
            onClick={(e) => {
              if (isActive) {
                navigate(`/originals/${org.id}`);
              } else {
                setActiveId(org.id);
                // Trigger native browser smooth centering alongside the CSS transition instantly
                // Only center on mobile and tablet screens. Desktop expands perfectly in place.
                if (window.innerWidth < 1024) {
                  e.currentTarget.scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "nearest",
                  });
                }
              }
            }}
          >
            <img
              src={org.coverImage}
              alt={org.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 transition-opacity duration-500 ${isActive ? "opacity-80" : "opacity-90"}`}
            />

            <div
              className={`absolute inset-0 p-6 flex flex-col ${isActive ? "justify-end items-start text-left" : "justify-center items-center text-center"}`}
            >
              <h4
                className="font-black uppercase tracking-tighter leading-[0.85] shadow-black drop-shadow-md break-words"
                style={{
                  fontSize: isActive
                    ? `clamp(2rem, ${Math.max(3, 8 - org.title.length * 0.3)}vw, 3.5rem)`
                    : `clamp(1.2rem, ${Math.max(2, 5 - org.title.length * 0.2)}vw, 2rem)`,
                }}
              >
                {org.title}
              </h4>

              <div
                className={`flex items-center gap-2 ${isActive ? "mt-3" : "hidden"}`}
              >
                <PresenceIcon className="w-4 h-4 text-yellow-400" />
                <p className="text-sm font-bold text-white/80">
                  {org.stats.presence} Presence
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Spacer to prevent aggressive CSS cutting off on the right-most edge */}
      <div className="w-2 md:w-6 shrink-0" />
    </div>
  );
});

const FeedListItem = memo(function FeedListItem({ item, items, setSelectedItem }: { item: TheatreItem, items: TheatreItem[], setSelectedItem: SetSelectedItem }) {
  const isScript = item.category === 'Script';
  const isPoster = item.category === 'Poster';
  const isEdit = item.category === 'Edit' || item.type === 'video' || item.isPlay;

  return (
    <div 
      className="group cursor-pointer break-inside-avoid w-full inline-block mb-6 md:mb-8"
      onClick={() => setSelectedItem(item, items, 0)}
    >
      <div className={`relative rounded-xl overflow-hidden bg-white/5 border mb-3 ${isPoster ? 'border-transparent group-hover:border-white/10 ring-1 ring-white/5' : 'border-white/5'}`}>
        
        {isScript ? (
          <div className="w-full min-h-[300px] bg-[#f4f1ea] text-[#2a2a2a] p-6 md:p-8 font-mono text-[10px] md:text-xs leading-tight overflow-hidden shadow-inner border border-black/5 flex flex-col justify-center select-text transition-transform duration-700 group-hover:scale-[1.02]">
            <div className="uppercase mb-2 opacity-40 text-[7px] md:text-[8px] font-bold tracking-widest">Scene {item.id}</div>
            <div className="mb-2 font-bold uppercase tracking-tighter">{item.origins || 'INT. THE CANVAS - DAY'}</div>
            <div className="mb-4 italic opacity-70 leading-relaxed text-sm md:text-base">
              {item.title?.split(':').length > 1 ? item.title.split(':')[1] : (item.text || "A moment of pure cinematic reflection.")}
            </div>
            <div className="text-center w-full mb-1 mt-2 font-bold uppercase text-[8px] md:text-[10px] tracking-[0.2em]">{item.artist || 'DIRECTOR'}</div>
            <div className="text-center w-full px-4 italic opacity-90 text-sm">
              "{item.title?.split(':')[0]}"
            </div>
            <div className="mt-8 pt-4 border-t border-black/5 opacity-30 text-[7px] md:text-[8px] uppercase tracking-widest flex justify-between">
              <span>Draft v2.4</span>
              <span>{item.credits || 0} Credits</span>
            </div>
          </div>
        ) : (
          <div className="relative w-full overflow-hidden flex flex-col">
            <img 
               src={item.image} 
               alt={item.title}
               className={`w-full object-cover transition-transform duration-700 ${isEdit ? 'group-hover:scale-105' : 'group-hover:scale-[1.02]'}`}
               style={{ aspectRatio: item.aspectRatio ? `${item.aspectRatio}` : (isEdit ? '9/16' : 'auto') }}
               referrerPolicy="no-referrer"
            />
            {/* Subtle gradient for visual weight */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        )}

        {/* Video Indicator */}
        {isEdit && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
             <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative group/play pointer-events-auto">
               <div className="absolute inset-0 rounded-full bg-white/10 blur-xl scale-150 group-hover/play:bg-white/30 transition-colors duration-700" />
               <div className="relative w-14 h-14 rounded-full bg-black/40 backdrop-blur-2xl border border-white/20 flex items-center justify-center overflow-hidden shadow-2xl">
                 <EditsIcon className="h-5 w-5 text-white fill-white/10 ml-1 group-hover/play:scale-110 transition-transform duration-500" />
                 <motion.div animate={{ x: [-60, 60] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12" />
               </div>
             </motion.div>
          </div>
        )}

        {/* Poster Indicator */}
        {isPoster && (
          <div className="absolute top-4 right-4 z-10">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative group/sparkle pointer-events-auto">
              <div className="absolute inset-0 rounded-full bg-white/10 blur-sm scale-125 group-hover/sparkle:bg-white/30 transition-colors duration-500" />
              <div className="relative w-8 h-8 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 flex items-center justify-center overflow-hidden">
                 <PostersIcon className="h-3.5 w-3.5 text-white fill-white/10 group-hover/sparkle:rotate-12 transition-transform" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Script Indicator */}
        {isScript && (
          <div className="absolute top-4 right-4 z-10">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative group/pen pointer-events-auto">
              <div className="absolute inset-0 rounded-full bg-black/10 blur-sm scale-125 transition-colors duration-500" />
              <div className="relative w-8 h-8 rounded-full bg-black/80 backdrop-blur-xl border border-black flex items-center justify-center overflow-hidden shadow-xl">
                 <ScriptsIcon className="h-3.5 w-3.5 text-white fill-white/10 group-hover/pen:scale-110 transition-transform duration-500" />
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <div className="px-1 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <CategoryIcon category={item.category} className="w-3.5 h-3.5 fill-white/20" />
            <h5 className="text-sm md:text-[15px] font-bold uppercase tracking-tight leading-none">{item.title}</h5>
          </div>
          <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/40">Origins: {item.origins}</p>
        </div>
      </div>
    </div>
  );
});

export function HomeFeedLayout({ setSelectedItem }: HomeFeedLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState<TheatreItem[]>(() => {
    return [...GRID_ITEMS];
  });

  const getNavItemClassName = (active: boolean) =>
    `flex min-w-0 flex-col items-center justify-center rounded-2xl px-2 py-3 text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${
      active
        ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.08)]"
        : "text-white/45 hover:text-white"
    }`;

  const [heroIndex, setHeroIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoadingDown, setIsLoadingDown] = useState(false);
  const bottomObserverTarget = useRef<HTMLDivElement>(null);

  const SLIDE_DURATION = 5000;
  const PROGRESS_INTERVAL = 50;

    // Timer logic: heroIndex is the single source of truth.
  // We use a time-based approach to ensure precision and prevent skipping.
  useEffect(() => {
    setProgress(0);
    const startTime = Date.now();

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / SLIDE_DURATION) * 100;

      if (newProgress >= 100) {
        setDirection(1);
        setHeroIndex((prev) => (prev + 1) % FEATURED_ITEMS.length);
      } else {
        setProgress(newProgress);
      }
    }, PROGRESS_INTERVAL);

    return () => clearInterval(intervalId);
  }, [heroIndex]);

  const handleIndicatorClick = (idx: number) => {
    if (idx === heroIndex) return;
    setDirection(idx > heroIndex ? 1 : -1);
    setHeroIndex(idx);
  };

  const loadMoreDown = useCallback(() => {
    if (isLoadingDown) return;
    setIsLoadingDown(true);

    setTimeout(() => {
      const nextItems = GRID_ITEMS.map((item) => ({
        ...item,
        id: `down-${Math.random()}`,
      }));
      setItems((prev) => [...prev, ...nextItems]);
      setIsLoadingDown(false);
    }, 800);
  }, [isLoadingDown]);

  useEffect(() => {
    const bottomObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreDown();
        }
      },
      { threshold: 0.1 },
    );

    if (bottomObserverTarget.current)
      bottomObserver.observe(bottomObserverTarget.current);

    return () => {
      bottomObserver.disconnect();
    };
  }, [loadMoreDown]);

  const baseGlobalArtists = Array.from(
    new Map(ORIGINALS.flatMap((org) => org.topArtists).map((a) => [a.id, a])).values()
  ).sort((a, b) => b.presence - a.presence);

  const globalArtistStripItems = Array.from(
    { length: 10 },
    (_, index) => baseGlobalArtists[index % baseGlobalArtists.length]
  );

  return (
    <div className="bg-[#050505] min-h-screen text-white pb-24">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <Logo onClick={() => navigate("/")} />
        <div className="flex items-center gap-4">
          <button className="text-white/60">
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate("/profile")}
            className={
              location.pathname === "/profile" ? "text-white" : "text-white/60"
            }
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-8 py-6 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-12">
          <Logo onClick={() => navigate("/")} />
          <nav className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em]">
            <button
              onClick={() => navigate("/")}
              className={`transition-colors ${location.pathname === "/" ? "text-white" : "text-white/60 hover:text-white"}`}
            >
              Home
            </button>
            <button
              onClick={() => navigate("/theatre")}
              className={`transition-colors ${location.pathname === "/theatre" ? "text-white" : "text-white/60 hover:text-white"}`}
            >
              Theatre
            </button>
            <button
              onClick={() => navigate("/originals")}
              className={`transition-colors ${location.pathname.startsWith("/originals") ? "text-white" : "text-white/60 hover:text-white"}`}
            >
              Originals
            </button>
            <button
              onClick={() => navigate("/sets")}
              className={`transition-colors ${location.pathname === "/sets" ? "text-white" : "text-white/60 hover:text-white"}`}
            >
              Sets
            </button>
            <button
              onClick={() => navigate("/calls")}
              className={`transition-colors ${location.pathname === "/calls" ? "text-white" : "text-white/60 hover:text-white"}`}
            >
              Calls
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-white/60 hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate("/profile")}
            className={`transition-colors ${location.pathname === "/profile" ? "text-white" : "text-white/60 hover:text-white"}`}
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="pt-20 md:pt-24 px-0 md:px-8 max-w-7xl mx-auto">
        {/* HERO - UPCOMING RELEASES */}
        <section className="px-4 mb-12">
          <div className="relative h-[65vh] rounded-2xl overflow-hidden bg-black">
            {/* Background Color Glow */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={`bg-${heroIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  src={FEATURED_ITEMS[heroIndex].image}
                  className="absolute inset-0 w-full h-full object-cover blur-[72px] scale-125"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
            </div>

            <AnimatePresence mode="popLayout">
              <motion.div
                key={heroIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.0, ease: "easeInOut" }}
                onClick={() =>
                  setSelectedItem(
                    FEATURED_ITEMS[heroIndex],
                    FEATURED_ITEMS,
                    heroIndex,
                  )
                }
                className="absolute inset-0 z-10"
              >
                <img
                  src={FEATURED_ITEMS[heroIndex].image}
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest rounded-sm border border-white/10">
                        Original
                      </span>
                      <span className="px-2 py-0.5 bg-yellow-400/20 backdrop-blur-md text-yellow-400 text-[8px] font-bold uppercase tracking-widest rounded-sm border border-yellow-400/20">
                        Coming Soon
                      </span>
                    </div>
                    <h2
                      className="font-black tracking-tighter mb-4 uppercase leading-[0.82] break-words"
                      style={{
                        fontSize: `clamp(2rem, ${Math.max(4, 12 - FEATURED_ITEMS[heroIndex].title.length * 0.3)}vw, 4rem)`,
                      }}
                    >
                      {FEATURED_ITEMS[heroIndex].title}
                    </h2>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <PresenceIcon className="w-3 h-3 text-yellow-400" />
                          <span className="text-[10px] font-bold text-white/80">
                            {FEATURED_ITEMS[heroIndex].presence} Presence
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                          {FEATURED_ITEMS[heroIndex].origins}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/20" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Indicators */}
            <div className="absolute top-1/2 -translate-y-1/2 right-6 flex flex-col gap-3 z-40">
              {FEATURED_ITEMS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIndicatorClick(idx);
                  }}
                  className="group relative w-1 h-10 rounded-full bg-white/10 overflow-hidden transition-all duration-300 hover:w-1.5"
                >
                  <div className="relative w-full h-full">
                    {/* Previous bars: faded white */}
                    {idx < heroIndex && (
                      <div className="absolute inset-0 bg-white/30" />
                    )}
                    {/* Active progress bar: solid white animating */}
                    {idx === heroIndex && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 bg-white"
                        style={{ height: `${progress}%` }}
                        transition={{ type: "linear", duration: 0.05 }}
                      />
                    )}
                    {/* Future bars: remain bg-white/10 from parent */}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* TOP ARTISTS */}
        <section className="mb-12">
          <div className="px-6 flex items-center gap-2 mb-6 opacity-40">
            <Users className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">
              Top Artists
            </h3>
          </div>

          <div className="overflow-x-auto no-scrollbar pb-2 px-6">
            <div className="grid grid-flow-col grid-rows-2 gap-2 auto-cols-[200px] md:auto-cols-[240px] w-max">
              {globalArtistStripItems.map((artist, idx) => (
                <motion.div
                  key={`${artist.id}-${idx}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (idx % 5) * 0.05 }}
                  className="group relative aspect-[3.5/1] overflow-hidden"
                >
                  <div className="flex h-full items-center gap-2 px-1 py-1">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full md:h-9 md:w-9">
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <h4 className="truncate text-xs md:text-sm font-bold uppercase tracking-tight text-white">
                        {artist.name}
                      </h4>

                      <div className="flex items-center gap-3 md:gap-4">
                        <div>
                          <p className="mb-0.5 flex items-center gap-1 text-[7px] md:text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                            <PresenceIcon className="h-2 w-2 md:h-3 md:w-3" />
                            Presence
                          </p>
                          <p className="text-[10px] md:text-xs font-bold text-white">
                            {artist.presence}
                          </p>
                        </div>
                        <div>
                          <p className="mb-0.5 flex items-center gap-1 text-[7px] md:text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                            <ReleasesIcon className="h-2 w-2 md:h-3 md:w-3" />
                            Releases
                          </p>
                          <p className="text-[10px] md:text-xs font-bold text-white">
                            {artist.releases}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* TOP ORIGINALS */}
        <section className="mb-12">
          <div className="px-6 flex items-center gap-2 mb-6 opacity-40">
            <Crown className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">
              Originals
            </h3>
          </div>
          <TopOriginalsAccordion navigate={navigate} />
        </section>

        {/* FEED */}
        <section className="px-6">
          <div className="flex items-center gap-2 mb-8 opacity-40">
            <History className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">
              For You
            </h3>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6 mb-8">
            {items.map((item) => (
              <FeedListItem
                key={item.id}
                item={item}
                items={items}
                setSelectedItem={setSelectedItem}
              />
            ))}
          </div>

          {/* Bottom Sentinel */}
          <div
            ref={bottomObserverTarget}
            className="h-40 flex items-center justify-center"
          >
            {isLoadingDown && (
              <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
            )}
          </div>
        </section>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-black/80 px-4 py-4 backdrop-blur-2xl">
        <div className="grid grid-cols-5 gap-1">
          <button
            onClick={() => navigate("/")}
            className={getNavItemClassName(location.pathname === "/")}
          >
            Home
          </button>
          <button
            onClick={() => navigate("/theatre")}
            className={getNavItemClassName(location.pathname === "/theatre")}
          >
            Theatre
          </button>
          <button
            onClick={() => navigate("/originals")}
            className={getNavItemClassName(
              location.pathname.startsWith("/originals"),
            )}
          >
            Originals
          </button>
          <button
            onClick={() => navigate("/sets")}
            className={getNavItemClassName(location.pathname === "/sets")}
          >
            Sets
          </button>
          <button
            onClick={() => navigate("/calls")}
            className={getNavItemClassName(location.pathname === "/calls")}
          >
            Calls
          </button>
        </div>
      </nav>
    </div>
  );
}
