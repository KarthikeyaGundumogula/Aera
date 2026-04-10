import { motion, AnimatePresence } from "motion/react";
import { memo, useState, useEffect, useRef, useCallback } from "react";
import { PlayCircle, Search, User, Loader2, History, Crown, ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { TheatreItem, SetSelectedItem } from "../types";
import { GRID_ITEMS, FEATURED_ITEMS, ORIGINALS } from "../mock";
import { CategoryIcon, PresenceIcon } from "../components/AppIcons";

import { Logo } from "../components/Logo";

interface HomeFeedLayoutProps {
  selectedItem: TheatreItem | null;
  setSelectedItem: SetSelectedItem;
}

const TopOriginalsAccordion = memo(function TopOriginalsAccordion({ navigate }: { navigate: (path: string) => void }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Top originals by presence (repeated to mock 15 items for layout testing)
  const baseOriginals = [...ORIGINALS].sort((a, b) => b.stats.presence - a.stats.presence);
  const topOriginals = [
    ...baseOriginals,
    ...baseOriginals.map(org => ({ ...org, id: `${org.id}-copy2` })),
    ...baseOriginals.map(org => ({ ...org, id: `${org.id}-copy3` }))
  ];

  return (
    <div className="flex h-[300px] md:h-[400px] w-full gap-2 px-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
      {topOriginals.map((org) => {
        const isActive = activeId === org.id;
        return (
          <div
            key={org.id}
            className={`relative rounded-xl overflow-hidden snap-center cursor-pointer shrink-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isActive ? 'w-[360px] md:w-[520px]' : 'w-[200px] md:w-[260px]'}`}
            onClick={(e) => {
              if (isActive) {
                navigate(`/originals/${org.id}`);
              } else {
                setActiveId(org.id);
                // Trigger native browser smooth centering alongside the CSS transition instantly
                e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
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
            <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 transition-opacity duration-500 ${isActive ? 'opacity-80' : 'opacity-90'}`} />
            
            <div className={`absolute inset-0 p-6 flex flex-col ${isActive ? 'justify-end items-start text-left' : 'justify-center items-center text-center'}`}>
              <h4 
                className="font-black uppercase tracking-tighter leading-[0.85] shadow-black drop-shadow-md break-words"
                style={{ 
                  fontSize: isActive 
                    ? `clamp(2rem, ${Math.max(3, 8 - (org.title.length * 0.3))}vw, 3.5rem)`
                    : `clamp(1.2rem, ${Math.max(2, 5 - (org.title.length * 0.2))}vw, 2rem)` 
                }}
              >
                {org.title}
              </h4>
              
              <div className={`flex items-center gap-2 ${isActive ? 'mt-3' : 'hidden'}`}>
                <PresenceIcon className="w-4 h-4 text-yellow-400" />
                <p className="text-sm font-bold text-white/80">{org.stats.presence} Presence</p>
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

const FeedListItem = memo(function FeedListItem({
  item,
  items,
  setSelectedItem,
}: {
  item: TheatreItem;
  items: TheatreItem[];
  setSelectedItem: SetSelectedItem;
}) {
  return (
    <div
      onClick={() => setSelectedItem(item, items, 1)}
      className="group"
      style={{ contentVisibility: "auto", containIntrinsicSize: "320px" }}
    >
      <div className="relative rounded-xl overflow-hidden bg-white/5 border border-white/5 mb-4">
        <img
          src={item.image}
          alt={item.title || "Feed item"}
          className={`w-full aspect-video object-cover ${item.isQuote ? "opacity-40" : ""}`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
        {item.isPlay && (
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-white/80" />
          </div>
        )}
        {item.isQuote && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-sm font-light italic leading-relaxed text-white/80">{item.text}</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CategoryIcon category={item.category} className="w-3 h-3 fill-white/20" />
            <h5 className="text-sm font-bold uppercase tracking-tight">{item.title}</h5>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Origins: {item.origins || "Original"}</p>
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
      const nextItems = GRID_ITEMS.map(item => ({
        ...item,
        id: `down-${Math.random()}`
      }));
      setItems(prev => [...prev, ...nextItems]);
      setIsLoadingDown(false);
    }, 800);
  }, [isLoadingDown]);

  useEffect(() => {
    const bottomObserver = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMoreDown();
        }
      },
      { threshold: 0.1 }
    );

    if (bottomObserverTarget.current) bottomObserver.observe(bottomObserverTarget.current);

    return () => {
      bottomObserver.disconnect();
    };
  }, [loadMoreDown]);

  return (
    <div className="bg-[#050505] min-h-screen text-white pb-24">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <Logo onClick={() => navigate("/")} />
        <div className="flex items-center gap-4">
          <button className="text-white/60"><Search className="w-5 h-5" /></button>
          <button onClick={() => navigate("/profile")} className={location.pathname === "/profile" ? "text-white" : "text-white/60"}>
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-8 py-6 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-12">
          <Logo onClick={() => navigate("/")} />
          <nav className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em]">
            <button onClick={() => navigate("/")} className={`transition-colors ${location.pathname === "/" ? "text-white" : "text-white/60 hover:text-white"}`}>Home</button>
            <button onClick={() => navigate("/theatre")} className={`transition-colors ${location.pathname === "/theatre" ? "text-white" : "text-white/60 hover:text-white"}`}>Theatre</button>
            <button onClick={() => navigate("/originals")} className={`transition-colors ${location.pathname.startsWith("/originals") ? "text-white" : "text-white/60 hover:text-white"}`}>Originals</button>
            <button onClick={() => navigate("/sets")} className={`transition-colors ${location.pathname === "/sets" ? "text-white" : "text-white/60 hover:text-white"}`}>Sets</button>
            <button onClick={() => navigate("/calls")} className={`transition-colors ${location.pathname === "/calls" ? "text-white" : "text-white/60 hover:text-white"}`}>Calls</button>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-white/60 hover:text-white transition-colors"><Search className="w-5 h-5" /></button>
          <button onClick={() => navigate("/profile")} className={`transition-colors ${location.pathname === "/profile" ? "text-white" : "text-white/60 hover:text-white"}`}>
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="pt-20 md:pt-32 px-0 md:px-8 max-w-7xl mx-auto">
        {/* HERO */}
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
                onClick={() => setSelectedItem(FEATURED_ITEMS[heroIndex], FEATURED_ITEMS, heroIndex)}
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
                    <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest rounded-sm mb-4 inline-block border border-white/10">Original</span>
                    <h2 
                      className="font-black tracking-tighter mb-4 uppercase leading-[0.82] break-words"
                      style={{ 
                        fontSize: `clamp(2rem, ${Math.max(4, 12 - (FEATURED_ITEMS[heroIndex].title.length * 0.3))}vw, 4rem)` 
                      }}
                    >
                      {FEATURED_ITEMS[heroIndex].title}
                    </h2>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <PresenceIcon className="w-3 h-3 text-yellow-400" />
                          <span className="text-[10px] font-bold text-white/80">{FEATURED_ITEMS[heroIndex].presence} Presence</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{FEATURED_ITEMS[heroIndex].origins}</span>
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

        {/* TOP ORIGINALS */}
        <section className="mb-12">
          <div className="px-6 flex items-center gap-2 mb-6 opacity-40">
            <Crown className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Top Originals</h3>
          </div>
          <TopOriginalsAccordion navigate={navigate} />
        </section>

        {/* FEED */}
        <section className="px-6">
          <div className="flex items-center gap-2 mb-8 opacity-40">
            <History className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Theatre Feed</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <FeedListItem key={item.id} item={item} items={items} setSelectedItem={setSelectedItem} />
            ))}
          </div>

          {/* Bottom Sentinel */}
          <div ref={bottomObserverTarget} className="h-40 flex items-center justify-center">
            {isLoadingDown && <Loader2 className="w-6 h-6 text-white/20 animate-spin" />}
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
          className={getNavItemClassName(location.pathname.startsWith("/originals"))}
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
