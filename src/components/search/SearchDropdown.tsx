import React, { memo } from 'react';
import { SearchResults } from './useSearch';
import { Film, User, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

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

  const totalResults = results.films.length + results.artists.length;
  const hasNoResults = !loading && !error && totalResults === 0 && query.length >= 2;

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto overflow-y-auto no-scrollbar flex flex-col pb-24">
      
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-12 text-white/40 gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Searching the Archive...</span>
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
          className="py-4"
        >
          
          {/* Films Section */}
          {results.films.length > 0 && (
            <div className="mb-6">
              <div className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                <Film className="w-3.5 h-3.5" /> Films
              </div>
              {results.films.map((film, idx) => {
                const globalIndex = idx;
                const isFocused = focusedIndex === globalIndex;
                return (
                  <button
                    key={film.id}
                    onMouseDown={(e) => {
                      e.preventDefault(); 
                      navigate(`/works/${film.id}`);
                      onClose();
                    }}
                    className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-colors ${isFocused ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="w-10 h-14 bg-white/5 rounded-md overflow-hidden shrink-0 border border-white/5">
                       {film.image ? (
                         <img src={film.image} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover object-top" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-white/10">
                           <Film size={14} />
                         </div>
                       )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-medium truncate">
                        <HighlightText text={film.title || 'Untitled'} highlight={query} />
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-white/30 truncate mt-1">
                         By {film.artist || 'Unknown Maker'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Artists Section */}
          {results.artists.length > 0 && (
            <div>
              <div className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2 border-t border-white/5 mt-2 pt-6">
                <User className="w-3.5 h-3.5" /> Artists
              </div>
              {results.artists.map((artist, idx) => {
                const globalIndex = results.films.length + idx;
                const isFocused = focusedIndex === globalIndex;
                return (
                  <button
                    key={artist.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigate(`/profile/${artist.id}`);
                      onClose();
                    }}
                    className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-colors ${isFocused ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden shrink-0 border border-white/5">
                       {artist.profilePicture ? (
                         <img src={artist.profilePicture} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover object-top" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-white/10">
                           <User size={16} />
                         </div>
                       )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-medium truncate">
                        <HighlightText text={artist.name} highlight={query} />
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-white/30 truncate mt-1">
                         {artist.profileType}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
});
