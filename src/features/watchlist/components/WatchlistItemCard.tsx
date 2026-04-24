import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { WatchlistItem } from "../../../mock/watchlist";
import { TaggedWorksStack } from "./TaggedWorksStack";

export function WatchlistItemCard({ item }: { item: WatchlistItem }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      className="relative flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Top Section (Horizontal Split) */}
      <div 
        className="flex flex-row cursor-pointer stretch" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Left: Poster */}
        <div className="w-20 sm:w-24 flex-shrink-0 relative overflow-hidden bg-black">
          <img 
            src={item.originalPosterUrl} 
            alt={item.originalName} 
            className="w-full h-full object-cover transition-transform duration-1000 opacity-90 group-hover:scale-105 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/80" />
        </div>

        {/* Right: Info */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center relative">
          <div className="flex justify-between items-start mb-3">
            <div>
              {item.status === 'want_to_watch' && (
                <span className="inline-block px-2 py-1 mb-2 text-[8px] font-bold uppercase tracking-[0.2em] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  Want to Watch
                </span>
              )}
              {item.status === 'watched' && (
                <span className="inline-block px-2 py-1 mb-2 text-[8px] font-bold uppercase tracking-[0.2em] bg-white/10 text-white/70 border border-white/20 rounded">
                  Watched
                </span>
              )}
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-white leading-none drop-shadow-lg">
                {item.originalName}
              </h2>
            </div>
            
            <button 
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors shrink-0 ml-4"
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            >
              <ChevronDown className={`w-5 h-5 text-white/60 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          <p className="text-white/80 font-medium leading-relaxed italic border-l-2 border-white/20 pl-3 text-xs sm:text-sm max-w-2xl line-clamp-3">
            "{item.hypeText}"
          </p>
        </div>
      </div>

      {/* Accordion Expanded Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden border-t border-white/5 bg-black/60 backdrop-blur-md"
          >
            <div className="p-4 sm:p-6 sm:pl-32 space-y-6">
              {item.afterThoughts && (
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">
                    After Thoughts
                  </span>
                  <p className="text-sm text-white/70 leading-relaxed max-w-3xl">
                    {item.afterThoughts}
                  </p>
                </div>
              )}

              {item.taggedWorks.length > 0 && (
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">
                    Inspired By
                  </div>
                  <TaggedWorksStack works={item.taggedWorks} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
