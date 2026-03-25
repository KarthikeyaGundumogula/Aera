import { motion } from "motion/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { PlayCircle, Search, User, Loader2, Sparkles, History, Users } from "lucide-react";
import { TheatreItem, SetSelectedItem } from "../types";
import { GRID_ITEMS, FEATURED_MOMENT, SETS } from "../data/mockData";

interface MobileLayoutProps {
  selectedItem: TheatreItem | null;
  setSelectedItem: SetSelectedItem;
}

export function MobileLayout({ setSelectedItem }: MobileLayoutProps) {
  const [items, setItems] = useState<TheatreItem[]>(() => {
    return [...GRID_ITEMS];
  });
  
  const [isLoadingDown, setIsLoadingDown] = useState(false);
  const bottomObserverTarget = useRef<HTMLDivElement>(null);

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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-black rounded-sm rotate-45" />
          </div>
          <h1 className="text-sm font-bold tracking-[0.2em] uppercase">AERA</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-white/60"><Search className="w-5 h-5" /></button>
          <button className="text-white/60"><User className="w-5 h-5" /></button>
        </div>
      </header>

      <main className="pt-20">
        {/* HERO */}
        <section className="px-4 mb-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedItem(FEATURED_MOMENT, [FEATURED_MOMENT], 1)}
            className="relative h-[60vh] rounded-2xl overflow-hidden"
          >
            <img 
              src={FEATURED_MOMENT.image} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <span className="px-2 py-0.5 bg-white text-black text-[8px] font-bold uppercase tracking-widest rounded-sm mb-4 inline-block">Featured</span>
              <h2 className="text-4xl font-bold tracking-tighter mb-4 uppercase leading-none">{FEATURED_MOMENT.title}</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  <span className="text-[10px] font-bold">{FEATURED_MOMENT.credits} Credits</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">By {FEATURED_MOMENT.artist}</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* SETS */}
        <section className="mb-12">
          <div className="px-6 flex items-center gap-2 mb-6 opacity-40">
            <Users className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Active Sets</h3>
          </div>
          <div className="flex gap-4 px-6 overflow-x-auto no-scrollbar">
            {SETS.map((set) => (
              <div key={set.id} className="min-w-[200px]">
                <div className="aspect-[4/5] rounded-xl overflow-hidden mb-3 relative">
                  <img src={set.image} className="w-full h-full object-cover grayscale" />
                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-white/60">Captain</p>
                    <p className="text-xs font-bold">{set.captain}</p>
                  </div>
                </div>
                <h4 className="text-sm font-bold uppercase tracking-tight">{set.title}</h4>
              </div>
            ))}
          </div>
        </section>

        {/* FEED */}
        <section className="px-6">
          <div className="flex items-center gap-2 mb-8 opacity-40">
            <History className="w-4 h-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Theatre Feed</h3>
          </div>
          
          <div className="space-y-12">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => setSelectedItem(item, items, 1)}
                className="group"
              >
                <div className="relative rounded-xl overflow-hidden bg-white/5 border border-white/5 mb-4">
                  <img
                    src={item.image}
                    className={`w-full aspect-video object-cover ${item.isQuote ? "opacity-40" : ""}`}
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
                    <h5 className="text-sm font-bold uppercase tracking-tight">{item.title}</h5>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Origins: {item.origins || "Original"}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Sentinel */}
          <div ref={bottomObserverTarget} className="h-40 flex items-center justify-center">
            {isLoadingDown && <Loader2 className="w-6 h-6 text-white/20 animate-spin" />}
          </div>
        </section>
      </main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-t border-white/5 px-8 py-6 flex justify-between items-center">
        <button className="text-[9px] font-bold uppercase tracking-widest text-white">Theatre</button>
        <button className="text-[9px] font-bold uppercase tracking-widest text-white/40">Sets</button>
        <button className="text-[9px] font-bold uppercase tracking-widest text-white/40">Calls</button>
        <button className="text-[9px] font-bold uppercase tracking-widest text-white/40">Profile</button>
      </nav>
    </div>
  );
}
