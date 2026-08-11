/**
 * OriginalsSearch.tsx
 *
 * Searchable panel for selecting an Original within the recommendation modal.
 * Shows trending originals by default; filters by title query on input.
 */
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, Loader2, X, Film } from "lucide-react";
import type { Original } from "@/types/originals";
import { useSearchQuery } from "@/lib/search";
import { apiFetch } from "@/lib/api";

interface OriginalsSearchProps {
  onSelect: (original: Original) => void;
  onClose: () => void;
}

export function OriginalsSearch({ onSelect, onClose }: OriginalsSearchProps) {
  const [query, setQuery] = useState("");
  const [originals, setOriginals] = useState<Original[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch("/originals")
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          const items = json.items || json.data || [];
          setOriginals(items);
        }
      })
      .catch(() => {});
  }, []);

  const { results: liveResults, loading: isSearching } = useSearchQuery('originals', query);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [...originals]
        .sort((a, b) => (b.stats?.presence ?? 0) - (a.stats?.presence ?? 0))
        .slice(0, 5);
    }

    // Convert live hits to Original format
    const remoteMapped: Original[] = liveResults.originals.map((h) => ({
      id: h.id,
      title: h.title,
      description: "",
      coverImage: h.coverImg || "https://images.unsplash.com/photo-1536440136628-849c177e76a1",
      stats: { presence: 0, members: 0, releases: 0 },
      topArtists: [],
      works: [],
    }));

    // Merge static + live, deduplicating by ID
    const map = new Map<string, Original>();
    originals.filter((o: Original) => o.title.toLowerCase().includes(q)).forEach((o: Original) => map.set(o.id, o));
    remoteMapped.forEach((o: Original) => map.set(o.id, o));

    return Array.from(map.values()).slice(0, 8);
  }, [query, liveResults.originals]);

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
        {isSearching ? <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin flex-shrink-0" /> : <Search className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />}
        <input
          ref={inputRef}
          type="text"
          placeholder="Search ParadeDB originals archive…"
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
          results.map((original: Original) => (
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
