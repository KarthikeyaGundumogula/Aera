import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Film, BookmarkPlus, Eye, Clock } from "lucide-react";
import { ORIGINALS } from "../../../mock";
import type { LedgerItem } from "../../../mock/ledger";

interface AddLedgerEntryProps {
  existingIds: string[];
  onAdd: (entry: LedgerItem) => void;
  onClose: () => void;
}

type EntryStatus = "want_to_watch" | "watched";

export function AddLedgerEntry({ existingIds, onAdd, onClose }: AddLedgerEntryProps) {
  const [query, setQuery] = useState("");
  const [selectedOriginal, setSelectedOriginal] = useState<typeof ORIGINALS[0] | null>(null);
  const [status, setStatus] = useState<EntryStatus>("want_to_watch");
  const [expectations, setExpectations] = useState("");
  const [afterThoughts, setAfterThoughts] = useState("");
  const [isAdded, setIsAdded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedOriginal) inputRef.current?.focus();
  }, [selectedOriginal]);

  const isSearching = query.trim().length > 0;

  const results = useMemo(() => {
    const pool = ORIGINALS.filter(o => !existingIds.includes(o.id));
    if (!isSearching) {
      // Trending: top 2 by presence
      return [...pool].sort((a, b) => (b.stats?.presence ?? 0) - (a.stats?.presence ?? 0)).slice(0, 2);
    }
    const q = query.toLowerCase();
    return pool.filter(o => o.title.toLowerCase().includes(q)).slice(0, 5);
  }, [query, existingIds, isSearching]);

  const handleSelect = (original: typeof ORIGINALS[0]) => {
    setSelectedOriginal(original);
    setQuery("");
  };

  const handleClear = () => {
    setSelectedOriginal(null);
    setQuery("");
    setStatus("want_to_watch");
    setExpectations("");
    setAfterThoughts("");
  };

  const handleConfirm = () => {
    if (!selectedOriginal) return;
    const newEntry: LedgerItem = {
      id: `wl_${Date.now()}`,
      originalId: selectedOriginal.id,
      originalName: selectedOriginal.title,
      originalPosterUrl: selectedOriginal.coverImage,
      status,
      hypeText: status === "want_to_watch"
        ? (expectations || "On the radar.")
        : (expectations || "Experienced."),
      afterThoughts: status === "watched" ? (afterThoughts || undefined) : undefined,
      taggedWorks: [],
      addedAt: new Date().toISOString(),
    };
    setIsAdded(true);
    setTimeout(() => {
      onAdd(newEntry);
      onClose();
    }, 1200);
  };

  // ─── SEARCH PHASE ────────────────────────────────────────────────
  if (!selectedOriginal) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
      >
        {/* Search Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <Search className="w-4 h-4 text-white/15 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search originals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-white/15 uppercase tracking-widest"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/20 hover:text-white/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inline Results */}
        <div className="max-h-[240px] overflow-y-auto no-scrollbar">
          {!isSearching && results.length > 0 && (
            <div className="px-5 pt-3 pb-1">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/15">Trending this week</span>
            </div>
          )}
          {results.length > 0 ? (
            results.map((original) => (
              <button
                key={original.id}
                onClick={() => handleSelect(original)}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.04] transition-all text-left border-b border-white/[0.03] last:border-b-0"
              >
                <img
                  src={original.coverImage}
                  alt={original.title}
                  className="w-10 h-14 rounded-lg object-cover opacity-60 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-black uppercase tracking-tight text-white/70 truncate">
                    {original.title}
                  </span>
                  <span className="block text-[9px] font-medium text-white/20 uppercase tracking-widest mt-0.5">
                    {original.releaseDate}
                  </span>
                </div>
                <Film className="w-3.5 h-3.5 text-white/8 flex-shrink-0" />
              </button>
            ))
          ) : (
            <div className="py-10 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/15">
                No originals found
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // ─── DETAIL PHASE (Post-Selection) ───────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
    >
      {/* Selected Original Header */}
      <div className="flex items-center gap-4 p-4 sm:p-5 border-b border-white/5">
        <img
          src={selectedOriginal.coverImage}
          alt={selectedOriginal.title}
          className="w-10 h-14 sm:w-12 sm:h-16 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/20 mb-1">
            Logging
          </p>
          <h4 className="text-sm sm:text-base font-black uppercase tracking-tight text-white truncate leading-none">
            {selectedOriginal.title}
          </h4>
          <p className="text-[9px] font-medium text-white/20 uppercase tracking-widest mt-1">
            {selectedOriginal.releaseDate}
          </p>
        </div>
        <button
          onClick={handleClear}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/20 hover:text-white/50 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status + Thoughts */}
      <div className="p-4 sm:p-5 space-y-5">
        {/* Status Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setStatus("want_to_watch")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all ${
              status === "want_to_watch"
                ? "bg-amber-500/10 border-amber-500/25 text-amber-300"
                : "bg-transparent border-white/5 text-white/20 hover:text-white/40 hover:border-white/10"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Want to Watch
          </button>
          <button
            onClick={() => setStatus("watched")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all ${
              status === "watched"
                ? "bg-white/10 border-white/20 text-white"
                : "bg-transparent border-white/5 text-white/20 hover:text-white/40 hover:border-white/10"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Watched
          </button>
        </div>

        {/* Dynamic Text */}
        <AnimatePresence mode="wait">
          {status === "want_to_watch" ? (
            <motion.div
              key="expectations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <label className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/25 pl-1">
                Pre-Screening Expectations
              </label>
              <textarea
                value={expectations}
                onChange={(e) => setExpectations(e.target.value)}
                placeholder="What draws you to this one?..."
                className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-4 text-sm text-white/70 leading-relaxed outline-none focus:border-white/15 transition-all resize-none min-h-[90px] placeholder:text-white/10"
              />
            </motion.div>
          ) : (
            <motion.div
              key="watched-fields"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/25 pl-1">
                  Pre-Screening Expectations
                </label>
                <textarea
                  value={expectations}
                  onChange={(e) => setExpectations(e.target.value)}
                  placeholder="What were your expectations going in?..."
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-4 text-sm text-white/70 leading-relaxed outline-none focus:border-white/15 transition-all resize-none min-h-[70px] placeholder:text-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/25 pl-1">
                  After Thoughts
                </label>
                <textarea
                  value={afterThoughts}
                  onChange={(e) => setAfterThoughts(e.target.value)}
                  placeholder="How did it land? Document your verdict..."
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-4 text-sm text-white/70 leading-relaxed outline-none focus:border-white/15 transition-all resize-none min-h-[70px] placeholder:text-white/10"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/5 text-[9px] font-bold uppercase tracking-widest text-white/20 hover:text-white/40 hover:border-white/10 transition-all"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleConfirm}
            disabled={isAdded}
            className="flex-[2] py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {isAdded ? (
              <span className="text-green-700">✓ Logged</span>
            ) : (
              status === "watched" ? "Seal the Verdict" : "Log to Ledger"
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
