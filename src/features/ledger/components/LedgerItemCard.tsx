import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Edit3, Check, X } from "lucide-react";
import type { LedgerItem } from "../../../mock/ledger";
import { LedgerTaggedWorksStack } from "./LedgerTaggedWorksStack";

export function LedgerItemCard({ item, onUpdate }: { item: LedgerItem, onUpdate: (item: LedgerItem) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hypeText, setHypeText] = useState(item.hypeText);
  const [afterThoughts, setAfterThoughts] = useState(item.afterThoughts || "");

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({
      ...item,
      hypeText,
      afterThoughts: afterThoughts || undefined
    });
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHypeText(item.hypeText);
    setAfterThoughts(item.afterThoughts || "");
    setIsEditing(false);
  };

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
            
            <div className="flex items-center gap-2 shrink-0 ml-4">
              {!isEditing ? (
                <button 
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setIsEditing(true); setIsExpanded(true); }}
                  title="Edit Thoughts"
                >
                  <Edit3 className="w-4 h-4 text-white/60" />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    className="p-2 rounded-full bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 transition-colors"
                    onClick={handleSave}
                    title="Save Changes"
                  >
                    <Check className="w-4 h-4 text-green-400" />
                  </button>
                  <button 
                    className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                    onClick={handleCancel}
                    title="Cancel Edit"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              )}
              
              <button 
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              >
                <ChevronDown className={`w-5 h-5 text-white/60 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          
          {isEditing ? (
            <div className="space-y-1 mt-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Hype Text / Expectations</span>
              <textarea
                value={hypeText}
                onChange={(e) => setHypeText(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white/90 focus:outline-none focus:border-white/30 transition-colors min-h-[80px] resize-none"
                placeholder="What are your expectations?"
              />
            </div>
          ) : (
            <p className="text-white/80 font-medium leading-relaxed italic border-l-2 border-white/20 pl-3 text-xs sm:text-sm max-w-2xl line-clamp-3">
              "{item.hypeText}"
            </p>
          )}
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
              {(item.afterThoughts || isEditing) && (
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">
                    After Thoughts
                  </span>
                  {isEditing ? (
                    <textarea
                      value={afterThoughts}
                      onChange={(e) => setAfterThoughts(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/70 focus:outline-none focus:border-white/30 transition-colors min-h-[120px] resize-none"
                      placeholder="Document your experience after watching..."
                    />
                  ) : (
                    <p className="text-sm text-white/70 leading-relaxed max-w-3xl">
                      {item.afterThoughts}
                    </p>
                  )}
                </div>
              )}

              {item.taggedWorks.length > 0 && (
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">
                    Inspired By
                  </div>
                  <LedgerTaggedWorksStack works={item.taggedWorks} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
