/**
 * OriginalsSearch.tsx
 *
 * Searchable panel for selecting an Original within the recommendation modal.
 * Shows trending originals by default; filters by title query on input.
 */
import { useState, useRef, useEffect, useMemo } from "react";
import { X, Film, Search } from "lucide-react";
import { ORIGINALS } from "@/mock";

type Original = (typeof ORIGINALS)[0];

interface OriginalsSearchProps {
  onSelect: (original: Original) => void;
  onClose: () => void;
}

export function OriginalsSearch({ onSelect, onClose }: OriginalsSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) {
      return [...ORIGINALS]
        .sort((a, b) => (b.stats?.presence ?? 0) - (a.stats?.presence ?? 0))
        .slice(0, 5);
    }
    const q = query.toLowerCase();
    return ORIGINALS.filter((o) => o.title.toLowerCase().includes(q)).slice(0, 5);
  }, [query]);

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
        <Search className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search originals…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/20 outline-none font-light"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          onClick={onClose}
          aria-label="Close search"
          className="p-1.5 rounded-xl text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors focus:outline-none"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Section label */}
      {!query.trim() && (
        <div className="px-5 pt-3 pb-1">
          <span className="text-[8px] font-black uppercase tracking-[0.35em] text-white/20">
            Trending on FrameHouse
          </span>
        </div>
      )}

      {/* Results */}
      <div className="overflow-y-auto flex-1">
        {results.length > 0 ? (
          results.map((original) => (
            <button
              key={original.id}
              onClick={() => onSelect(original)}
              className="w-full flex items-center gap-4 px-5 py-3 hover:bg-white/[0.03] transition-colors text-left border-b border-white/[0.03] last:border-0 focus:outline-none"
            >
              <img
                loading="lazy"
                src={original.coverImage}
                alt={original.title}
                className="w-9 h-13 rounded-lg object-cover object-top opacity-70 flex-shrink-0"
                style={{ aspectRatio: "2/3" }}
              />
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-semibold text-white/80 truncate">
                  {original.title}
                </span>
                <span className="block text-[9px] text-white/25 mt-0.5 tracking-wider">
                  {original.releaseDate}
                </span>
              </div>
              <Film className="w-3 h-3 text-white/10 flex-shrink-0" />
            </button>
          ))
        ) : (
          <div className="py-10 text-center">
            <p className="text-[10px] text-white/20 uppercase tracking-widest">
              No originals found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
