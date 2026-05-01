import { useState, useRef, useEffect } from "react";
import { Settings, Plus, Users, Calendar, Info, ChevronDown, Shield, Bookmark, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface OriginalClaims {
  canUpdateMeta: boolean;
  canCreateRelease: boolean;
}

interface OriginalCommandCenterProps {
  originalId: string;
  claims: OriginalClaims;
  onEditInfo?: () => void;
  onManageArtists?: () => void;
  onNewRelease?: () => void;
  onAddToWatchlist?: () => void;
  className?: string;
}

/**
 * OriginalCommandCenter — A specialized dropdown for Original managers
 * and users to interact with the Stage.
 */
export function OriginalCommandCenter({
  originalId,
  claims,
  onEditInfo,
  onManageArtists,
  onNewRelease,
  onAddToWatchlist,
  className = "",
}: OriginalCommandCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    {
      label: "Save to Watchlist",
      icon: <Bookmark className="w-4 h-4" />,
      action: onAddToWatchlist,
      description: "Log to Ledger",
      visible: true,
    },
    {
      label: "Update Original",
      icon: <Settings className="w-4 h-4" />,
      action: onEditInfo,
      description: "Curation & Metadata",
      visible: claims.canUpdateMeta,
    },
    {
      label: "New Release",
      icon: <Plus className="w-4 h-4" />,
      action: onNewRelease,
      description: "Drop an Update",
      visible: claims.canCreateRelease,
    },
  ].filter(item => item.visible);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center gap-2 transition-all"
        aria-label="Original Command Center"
      >
        <div className={`
          relative p-2 rounded-xl border transition-all duration-300 flex items-center gap-2
          ${isOpen 
            ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            : "bg-white/5 text-white/60 border-white/5 hover:border-white/20 hover:text-white"
          }
        `}>
          <Zap className={`w-4 h-4 transition-transform duration-500 ${isOpen ? "fill-current" : "group-hover:fill-current"}`} />
          <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-white/10 bg-black/80 backdrop-blur-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[110] overflow-hidden"
          >
            <div className="px-3 py-2 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Original Studio</span>
              <Shield className="w-3 h-3 text-white/20" />
            </div>
            
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    item.action?.();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 text-white/60 hover:bg-white/5 hover:text-white group/item"
                >
                  <div className="p-2 rounded-lg bg-white/5 group-hover/item:bg-white/10 transition-colors">
                    {item.icon}
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                    <span className="text-[9px] font-medium text-white/30 uppercase tracking-widest truncate">{item.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
