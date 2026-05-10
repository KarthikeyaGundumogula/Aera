import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown, Shield, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface CommandItem {
  label: string;
  icon: ReactNode;
  action?: () => void;
  description: string;
  visible?: boolean;
}

interface CommandCenterProps {
  /** The title shown at the top of the dropdown (e.g., "Original Studio", "Set Control") */
  contextTitle: string;
  /** The list of menu items to display */
  items: CommandItem[];
  /** Optional extra classes for the container */
  className?: string;
  /** Accessible label for the trigger button */
  ariaLabel?: string;
}

/**
 * CommandCenter — A shared, cinematic dropdown for high-level page actions.
 * Used for managing Originals, Sets, and other major entities.
 */
export function CommandCenter({
  contextTitle,
  items,
  className = "",
  ariaLabel = "Command Center",
}: CommandCenterProps) {
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

  const visibleItems = items.filter(item => item.visible !== false);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center gap-2 transition-all"
        aria-label={ariaLabel}
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
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{contextTitle}</span>
              <Shield className="w-3 h-3 text-white/20" />
            </div>
            
            <div className="space-y-1">
              {visibleItems.map((item) => (
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
                  <div className="flex flex-col items-start min-w-0 text-left">
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
