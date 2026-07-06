import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, CheckCircle2, Search, X, Users } from "lucide-react";
import { Original } from "../../../../types";
import { OWN_RELEASE_ORIGINAL } from "../../../../constants/originals";
import type { UpdateUploadFormData } from "../../types";

interface CreditsStepProps {
  originals: Original[];
  selectedIds: string[];
  setFormData: UpdateUploadFormData;
  onNext: () => void;
  onBack: () => void;
}

export function CreditsStep({ originals, selectedIds, setFormData, onNext, onBack }: CreditsStepProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const selectedOriginals = useMemo(() => 
    originals.filter(o => selectedIds.includes(o.id)),
  [originals, selectedIds]);

  const allAvailable = useMemo(() => [OWN_RELEASE_ORIGINAL, ...originals], [originals]);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) {
      // Display ONLY OWN RELEASE by default
      return [OWN_RELEASE_ORIGINAL];
    }
    const query = searchQuery.toLowerCase();
    return allAvailable.filter(o => 
      o.title.toLowerCase().includes(query) || 
      o.id.toLowerCase().includes(query)
    );
  }, [allAvailable, searchQuery]);

  const toggleSelection = (id: string) => {
    const newIds = selectedIds.includes(id)
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id];
    setFormData({ originalIds: newIds });
  };

  return (
    <motion.div
      key="step-credits"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="w-4 h-4 text-white/50" />
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white/90">The Credits</h2>
        </div>
        <p className="text-white/40 text-[10px] uppercase tracking-widest text-balance">Associate official FrameHouse projects with this release</p>
      </div>

      <div className="space-y-10 px-4">
        {/* ─── Search Interface ──────────────────────────────────────── */}
        <div className="relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text"
            placeholder="Search local archives by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-base font-medium focus:ring-2 focus:ring-white/20 focus:bg-white/[0.05] outline-none transition-all placeholder:text-white/10"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-1 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ─── Selected Dock ─────────────────────────────────────────── */}
        <AnimatePresence>
          {selectedOriginals.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Current Selection</h3>
              <div className="flex flex-wrap gap-3 p-2">
                {selectedOriginals.map((org) => (
                  <motion.div
                    key={`selected-${org.id}`}
                    layoutId={`org-${org.id}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative group w-16 aspect-square rounded-lg overflow-hidden border border-white/20"
                  >
                    <img
                      loading="lazy"
                      src={org.coverImage}
                      alt={org.title}
                      className="w-full h-full object-cover object-top"
                    />
                    <button 
                      onClick={() => toggleSelection(org.id)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Search Results ────────────────────────────────────────── */}
        <div className="min-h-[200px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-8">
            {filteredResults.map((org) => {
              const isSelected = selectedIds.includes(org.id);
              const isOwnRelease = org.id === "own-release";
              return (
                <motion.button
                  key={org.id}
                  layoutId={`org-${org.id}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleSelection(org.id)}
                  className={`relative aspect-[3/4] group rounded-xl overflow-hidden border transition-all duration-500 ${
                    isSelected ? "border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]" : "border-white/5 hover:border-white/20 bg-white/[0.02]"
                  }`}
                >
                  <img
                    loading="lazy"
                    src={org.coverImage}
                    alt={org.title}
                    className={`w-full h-full object-cover object-top transition-opacity ${isSelected ? "opacity-40" : "opacity-60 group-hover:opacity-100"}`}
                  />
                  {isOwnRelease && (
                    <div className="absolute top-3 left-3 bg-white text-black text-[8px] font-black px-2 py-0.5 rounded-xl uppercase tracking-tighter z-10 shadow-xl">
                      Independent
                    </div>
                  )}
                  <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 transition-all duration-300 ${
                    isSelected ? "bg-black/60 opacity-100" : "bg-black/40 opacity-0 group-hover:opacity-100"
                  }`}>
                      <CheckCircle2 className={`w-8 h-8 mb-3 transition-all duration-500 ${isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">{org.title}</span>
                  </div>
                </motion.button>
              );
            })}
            
            {searchQuery.trim() && filteredResults.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-white/20 border-2 border-dashed border-white/5 rounded-2xl">
                <Search className="w-8 h-8 mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">No matching artifacts found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Footer Navigation ─────────────────────────────────────── */}
      <div className="mt-12 flex items-center justify-between px-4 border-t border-white/5 pt-8">
          <button onClick={onBack} className="text-white/40 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
              <ChevronLeft className="w-4 h-4" /> BACK
          </button>
          
          <button 
            disabled={selectedIds.length === 0}
            onClick={onNext} 
            className="px-10 py-4 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/90 disabled:opacity-30 transition-all flex items-center gap-2 shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
          >
            NEXT <ChevronRight className="w-4 h-4" />
          </button>
      </div>
    </motion.div>
  );
}
