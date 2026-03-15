import { motion } from "motion/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { PlayCircle, Search, User, Loader2, Calendar } from "lucide-react";
import { TheatreItem, SetSelectedItem } from "../types";
import { GRID_ITEMS } from "../data/mockData";

interface DesktopLayoutProps {
  selectedItem: TheatreItem | null;
  setSelectedItem: SetSelectedItem;
}

export function DesktopLayout({ setSelectedItem }: DesktopLayoutProps) {
  const [items, setItems] = useState<TheatreItem[]>(() => {
    // Start with 3 batches of items
    const initial: TheatreItem[] = [];
    for (let i = 0; i < 3; i++) {
      initial.push(...GRID_ITEMS.map(item => ({ ...item, id: `${i}-${item.id}` })));
    }
    return initial;
  });
  
  const [isLoadingDown, setIsLoadingDown] = useState(false);
  const [isLoadingUp, setIsLoadingUp] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [columns, setColumns] = useState(10);
  
  const topObserverTarget = useRef<HTMLDivElement>(null);
  const bottomObserverTarget = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Calculate columns based on tailwind breakpoints
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1536) setColumns(16); // 2xl
      else if (width >= 1280) setColumns(12); // xl
      else setColumns(10); // default
    };
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Header visibility logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // If we are at the top, always show header
      if (currentScrollY < 20) {
        setIsHeaderVisible(true);
      } else {
        // If we scroll while already away from top, hide it
        setIsHeaderVisible(false);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Show header when mouse is near the top (macOS style)
      if (e.clientY < 60) {
        setIsHeaderVisible(true);
      } else if (window.scrollY > 20) {
        // Hide if mouse leaves the top area and we are scrolled down
        setIsHeaderVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Scroll to middle on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight / 2 - window.innerHeight / 2,
        behavior: "instant"
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

  const loadMoreUp = useCallback(() => {
    if (isLoadingUp) return;
    setIsLoadingUp(true);
    
    const previousHeight = document.documentElement.scrollHeight;
    
    setTimeout(() => {
      const prevItems = GRID_ITEMS.map(item => ({
        ...item,
        id: `up-${Math.random()}`
      }));
      
      setItems(prev => [...prevItems, ...prev]);
      setIsLoadingUp(false);
      
      // Adjust scroll to prevent jumping
      requestAnimationFrame(() => {
        const newHeight = document.documentElement.scrollHeight;
        window.scrollBy(0, newHeight - previousHeight);
      });
    }, 800);
  }, [isLoadingUp]);

  useEffect(() => {
    const bottomObserver = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMoreDown();
        }
      },
      { threshold: 0.1 }
    );

    const topObserver = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMoreUp();
        }
      },
      { threshold: 0.1 }
    );

    if (bottomObserverTarget.current) bottomObserver.observe(bottomObserverTarget.current);
    if (topObserverTarget.current) topObserver.observe(topObserverTarget.current);

    return () => {
      bottomObserver.disconnect();
      topObserver.disconnect();
    };
  }, [loadMoreDown, loadMoreUp]);

  return (
    <div className="bg-brand-dark min-h-screen flex flex-col gradient-bg overflow-x-auto">
      {/* FIXED Header with macOS style auto-hide */}
      <motion.header 
        initial={{ y: 0 }}
        animate={{ y: isHeaderVisible ? 0 : -100 }}
        transition={{ type: "spring", damping: 20, stiffness: 120 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-brand-dark/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl"
      >
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <PlayCircle className="text-brand-accent w-6 h-6" />
            <h1 className="text-lg font-bold tracking-tight uppercase text-white">Theatre</h1>
            <span className="ml-4 text-[10px] font-bold tracking-[0.2em] border border-brand-accent/40 px-2 py-0.5 rounded text-brand-accent">AERA</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button className="text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-widest transition-colors">Explore</button>
            <button className="text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-widest transition-colors">Live</button>
            <button className="text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-widest transition-colors">Trending</button>
          </nav>
        </div>
        <div className="flex items-center gap-5">
          <button className="text-slate-400 hover:text-white transition-colors">
            <Search className="w-6 h-6" />
          </button>
          <button className="text-slate-400 hover:text-white transition-colors">
            <User className="w-6 h-6" />
          </button>
        </div>
      </motion.header>

      {/* 2-Axis Scroll Content Area */}
      <main ref={mainRef} className="flex-1 w-[300vw] px-10 pt-32 pb-20">
        {/* Top Sentinel */}
        <div ref={topObserverTarget} className="h-20 flex items-center justify-center mb-10 w-screen sticky left-0">
          {isLoadingUp && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">Loading previous...</span>
            </div>
          )}
        </div>

        {/* 2D Grid - Vast layout for horizontal and vertical exploration */}
        <div className="grid grid-cols-10 xl:grid-cols-12 2xl:grid-cols-16 gap-8">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              viewport={{ once: true }}
              onClick={() => setSelectedItem(item, items, columns)}
              className="aspect-video spotlight-hover relative rounded-2xl overflow-hidden cursor-pointer group bg-white/5 border border-white/5 shadow-2xl"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title || "Gallery Item"}
                  className={`w-full h-full object-cover ${item.isQuote ? "opacity-60" : ""}`}
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Overlays */}
              {item.isQuote && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <p className="text-sm font-light italic px-8 text-center text-white leading-relaxed">{item.text}</p>
                </div>
              )}

              {item.isPlay && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <PlayCircle className="text-white w-12 h-12 opacity-80" />
                </div>
              )}

              {item.isEvent && (
                <div className="absolute inset-0 bg-brand-accent/10 border border-brand-accent/20 flex flex-col items-center justify-center p-6">
                  <Calendar className="text-brand-accent mb-2 w-8 h-8" />
                  <span className="text-[11px] font-bold text-brand-accent tracking-widest uppercase text-center">{item.title}</span>
                </div>
              )}

              {!item.isQuote && !item.isPlay && !item.isEvent && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                  {item.type && (
                    <span className={`${item.type === "Live Now" ? "bg-red-600" : "bg-brand-accent"} text-[9px] font-bold px-1.5 py-0.5 rounded text-white uppercase tracking-tighter w-fit mb-2`}>
                      {item.type}
                    </span>
                  )}
                  {item.title && <h2 className="text-lg font-bold text-white uppercase tracking-tight">{item.title}</h2>}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom Sentinel */}
        <div ref={bottomObserverTarget} className="h-20 flex items-center justify-center mt-10 w-screen sticky left-0">
          {isLoadingDown && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">Loading more...</span>
            </div>
          )}
        </div>
      </main>

      {/* Desktop Footer */}
      <footer className="px-8 py-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white">© 2026 Theatre by AERA</span>
        </div>
        <div className="flex gap-10">
          <button className="hover:text-brand-accent transition-colors text-[10px] font-bold uppercase tracking-widest text-white">Privacy</button>
          <button className="hover:text-brand-accent transition-colors text-[10px] font-bold uppercase tracking-widest text-white">Terms</button>
          <button className="hover:text-brand-accent transition-colors text-[10px] font-bold uppercase tracking-widest text-white">Credits</button>
        </div>
      </footer>
    </div>
  );
}
