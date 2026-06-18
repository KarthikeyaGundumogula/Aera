import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ARTISTS_MOCK, PROFILES_DIRECTORY } from "../../../mock";

import { DesktopCanvas } from "../components/desktop/DesktopCanvas";
import { MobileCanvas } from "../components/mobile/MobileCanvas";

import { Logo } from "../../../components/Logo";
import { ProfileNav } from "../../../components/ProfileNav";
import { MobileTopHeader } from "../../navigation/MobileTopHeader";
import { GlobalSearch } from "../../../components/search/GlobalSearch";

import { useHeaderVisibility } from "../hooks/useHeaderVisibility";
import { DesktopHeader } from "../../navigation/DesktopHeader";

interface TheatreLayoutProps {
  isMobile?: boolean;
}

export function TheatreLayout({ isMobile }: TheatreLayoutProps) {
  const { isHeaderVisible, isScrolled, handleScroll } = useHeaderVisibility();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const artistId = searchParams.get("artist");

  // Find the artist/profile name if we are in a profile-specific theatre
  const profileName = useMemo(() => {
    if (!artistId) return null;
    
    // Check Artists
    const artist = ARTISTS_MOCK.find(a => a.id === artistId);
    if (artist) return artist.name;

    // Check Stars/Makers via Profiles Directory
    const profile = PROFILES_DIRECTORY.find(p => p.id === artistId);
    if (profile) return profile.name;

    // Fallback to formatted ID
    return artistId.replace("profile-", "").replace(/-/g, " ").toUpperCase();
  }, [artistId]);

  const getNavClassName = (active: boolean) =>
    `text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${active ? "text-white" : "text-white/60 hover:text-white"}`;

  return (
    <div className="bg-surface-deep h-screen text-white selection:bg-brand-accent/30 overflow-hidden">
      {/* THEATRE HEADER ENGINE */}
      {!artistId && <MobileTopHeader isVisible={isHeaderVisible} />}
      <AnimatePresence mode="wait">
        {artistId ? (
          /* ─── Profile-Specific Theatre Header ─── */
          <motion.header 
            key="profile-header"
            initial={{ y: -100 }}
            animate={{ y: isHeaderVisible ? 0 : -100 }}
            exit={{ y: -100 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-black/30 backdrop-blur-md border-b border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
          >
            <button 
              onClick={() => navigate(`/profile/${artistId}`)}
              className="group flex items-center gap-3 hover:text-white/70 transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1 text-white/40 group-hover:text-white" />
              <div className="flex flex-col items-start">
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">EXIT THEATRE</span>
                <span className="text-xs font-black uppercase tracking-tight">{profileName}</span>
              </div>
            </button>

            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Artist Theatre</span>
               </div>
            </div>
          </motion.header>
        ) : (
          /* ─── Global Theatre Header ─── */
          <DesktopHeader isVisible={isHeaderVisible} isScrolled={isScrolled} />
        )}
      </AnimatePresence>

      <motion.main 
        className="h-full w-full pt-0"
      >
        {isMobile ? (
          <MobileCanvas />
        ) : (
          <DesktopCanvas onScroll={handleScroll} />
        )}
      </motion.main>
    </div>
  );
}
