import { motion } from "motion/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, User } from "lucide-react";
import { TheatreItem, SetSelectedItem } from "../types";

import { CinepoeticCanvas } from "../components/CinepoeticCanvas";

import { Logo } from "../components/Logo";

interface DesktopLayoutProps {
  selectedItem: TheatreItem | null;
  setSelectedItem: SetSelectedItem;
}

export function DesktopLayout({ setSelectedItem }: DesktopLayoutProps) {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const scrollYRef = useRef(0);
  
  const lastYRef = useRef(0);
  
  const handleScroll = useCallback((y: number) => {
    const dy = y - lastYRef.current;
    lastYRef.current = y;
    scrollYRef.current = y;

    // Show header if we're near the top or scrolling up
    if (y > -10) {
      setIsHeaderVisible(true);
    } else if (dy > 2) {
      setIsHeaderVisible(true);
    } else if (dy < -2) {
      setIsHeaderVisible(false);
    }
  }, []);

  // Header visibility logic via mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // If mouse is near top, show header
      if (e.clientY < 60) {
        setIsHeaderVisible(true);
      } else if (Math.abs(scrollYRef.current) > 10) {
        // Only hide if we're not at the top
        setIsHeaderVisible(false);
      }
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
          <Logo onClick={() => setSelectedItem(null)} />
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

      <motion.main 
        initial={false}
        animate={{ paddingTop: isHeaderVisible ? 80 : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 150 }}
        className="h-full w-full"
      >
        <CinepoeticCanvas setSelectedItem={setSelectedItem} onScroll={handleScroll} />
      </motion.main>
    </div>
  );
}
