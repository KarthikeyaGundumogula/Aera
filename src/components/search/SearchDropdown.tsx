import React, { memo } from 'react';
import { SearchResults } from './useSearch';
import { Film, User, Loader2, AlertCircle, Sparkles, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArtistAvatar } from "@/components/ArtistAvatar";

interface SearchDropdownProps {
  query: string;
  results: SearchResults;
  loading: boolean;
  error: string | null;
  isVisible: boolean;
  onClose: () => void;
  focusedIndex: number;
}

// Helper to highlight matching text
const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) return <span>{text}</span>;

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? <span key={i} className="text-white font-black">{part}</span> : <span key={i} className="text-white/60">{part}</span>
      )}
    </span>
  );
};

export const SearchDropdown = memo(function SearchDropdown({
  query,
  results,
  loading,
  error,
  isVisible,
  onClose,
  focusedIndex
}: SearchDropdownProps) {
  const navigate = useNavigate();

  if (!isVisible) return null;

  const totalResults =
    (results.works?.length || 0) +
    (results.originals?.length || 0) +
    (results.sets?.length || 0) +
    (results.artists?.length || 0);

  const isQuerying = query.trim().length >= 2;
  const hasNoResults = !loading && !error && totalResults === 0 && isQuerying;

  let globalIndexCounter = 0;

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto overflow-y-auto no-scrollbar flex flex-col pb-24">
      
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-12 text-white/40 gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Searching ParadeDB Archive...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center p-6 mt-8 mx-4 text-red-400 gap-2 bg-red-950/20 border border-red-500/20 rounded-2xl">
          <AlertCircle className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{error}</span>
        </div>
      )}

      {/* No Results State */}
      {hasNoResults && (
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <span className="text-white/20 mb-4 text-3xl">🎬</span>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">No records found for "{query}"</p>
        </div>
      )}

      {/* Results List */}
      {!loading && !error && totalResults > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-4 space-y-6"
        >
          {/* 1. Works / Films Section */}
          {results.works && results.works.length > 0 && (
            <div>
              <div className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/80 flex items-center gap-2">
                <Film className="w-3.5 h-3.5" /> Works ({results.works.length})
              </div>
              {results.works.map((work) => {
                const currentIndex = globalIndexCounter++;
                const isFocused = focusedIndex === currentIndex;
                return (
                  <button
                    key={work.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigate(`/works/${work.id}`);
                      onClose();
                    }}
                    className={`w-full text-left px-6 py-3.5 flex items-center gap-4 transition-colors ${isFocused ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-amber-400 shrink-0 border border-white/10">
                      <Film size={18} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        <HighlightText text={work.title || 'Untitled Work'} highlight={query} />
                      </p>
                      <span className="text-[9px] uppercase tracking-widest text-white/40 truncate mt-0.5">
                        Category: {work.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. Originals Section */}
          {results.originals && results.originals.length > 0 && (
            <div>
              <div className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-purple-400/80 flex items-center gap-2 border-t border-white/5 pt-4">
                <Sparkles className="w-3.5 h-3.5" /> Cinematic Originals ({results.originals.length})
              </div>
              {results.originals.map((original) => {
                const currentIndex = globalIndexCounter++;
                const isFocused = focusedIndex === currentIndex;
                return (
                  <button
                    key={original.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigate(`/originals/${original.id}`);
                      onClose();
                    }}
                    className={`w-full text-left px-6 py-3.5 flex items-center gap-4 transition-colors ${isFocused ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="w-10 h-14 bg-white/5 rounded-lg overflow-hidden shrink-0 border border-white/10">
                      {original.coverImg ? (
                        <img src={original.coverImg} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-400">
                          <Sparkles size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        <HighlightText text={original.title} highlight={query} />
                      </p>
                      <span className="text-[9px] uppercase tracking-widest text-purple-300/60 truncate mt-0.5">
                        Official Original Title
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. Sets Section */}
          {results.sets && results.sets.length > 0 && (
            <div>
              <div className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/80 flex items-center gap-2 border-t border-white/5 pt-4">
                <Layers className="w-3.5 h-3.5" /> Sets & Banners ({results.sets.length})
              </div>
              {results.sets.map((set) => {
                const currentIndex = globalIndexCounter++;
                const isFocused = focusedIndex === currentIndex;
                return (
                  <button
                    key={set.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigate(`/sets/${set.id}`);
                      onClose();
                    }}
                    className={`w-full text-left px-6 py-3.5 flex items-center gap-4 transition-colors ${isFocused ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 shrink-0 border border-cyan-500/20">
                      <Layers size={18} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        <HighlightText text={set.name} highlight={query} />
                      </p>
                      <p className="text-[9px] text-white/40 truncate mt-0.5">
                        <HighlightText text={set.statement || 'Set Community Hub'} highlight={query} />
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 4. Artists Section */}
          {results.artists && results.artists.length > 0 && (
            <div>
              <div className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/80 flex items-center gap-2 border-t border-white/5 pt-4">
                <User className="w-3.5 h-3.5" /> Artists & Profiles ({results.artists.length})
              </div>
              {results.artists.map((artist) => {
                const currentIndex = globalIndexCounter++;
                const isFocused = focusedIndex === currentIndex;
                const displayName = artist.stageName || artist.userName;
                return (
                  <button
                    key={artist.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigate(`/profile/${artist.userName}`);
                      onClose();
                    }}
                    className={`w-full text-left px-6 py-3.5 flex items-center gap-4 transition-colors ${isFocused ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-white/5 overflow-hidden shrink-0 border border-white/10">
                      <ArtistAvatar
                        src={artist.profilePicture}
                        name={artist.stageName || artist.userName}
                        size={44}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        <HighlightText text={displayName} highlight={query} />
                      </p>
                      <p className="text-[9px] uppercase tracking-wider text-white/40 truncate mt-0.5">
                        @{artist.userName} • <HighlightText text={artist.tagLine || 'Artist Stage'} highlight={query} />
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
});
