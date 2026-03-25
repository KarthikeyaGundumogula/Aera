import { motion } from "motion/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { PlayCircle, Search, User, Loader2, Sparkles, History, Users, MessageSquare, FileText, Image as ImageIcon, Film } from "lucide-react";
import { TheatreItem, SetSelectedItem } from "../types";
import { GRID_ITEMS, FEATURED_MOMENT, SETS } from "../data/mockData";

import { CinepoeticCanvas } from "./CinepoeticCanvas";

interface DesktopLayoutProps {
  selectedItem: TheatreItem | null;
  setSelectedItem: SetSelectedItem;
}

export function DesktopLayout({ setSelectedItem }: DesktopLayoutProps) {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  
  // Header visibility logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 60) setIsHeaderVisible(true);
      else setIsHeaderVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="bg-[#050505] h-screen text-white selection:bg-brand-accent/30 overflow-hidden">
      {/* FIXED Header */}
      <motion.header 
        initial={{ y: 0 }}
        animate={{ y: isHeaderVisible ? 0 : -100 }}
        transition={{ type: "spring", damping: 20, stiffness: 120 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-black/40 backdrop-blur-xl border-b border-white/5"
      >
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-black rounded-sm rotate-45" />
            </div>
            <h1 className="text-xl font-bold tracking-[0.2em] uppercase">AERA</h1>
          </div>
          <nav className="hidden lg:flex items-center gap-8">
            <button className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors">Theatre</button>
            <button className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors">Sets</button>
            <button className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors">Calls</button>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-white/60 hover:text-white transition-colors"><Search className="w-5 h-5" /></button>
          <button className="text-white/60 hover:text-white transition-colors"><User className="w-5 h-5" /></button>
        </div>
      </motion.header>

      <main className="h-full w-full">
        <CinepoeticCanvas setSelectedItem={setSelectedItem} />
      </main>
    </div>
  );
}
