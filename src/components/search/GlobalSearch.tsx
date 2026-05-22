import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useSearch } from './useSearch';
import { SearchDropdown } from './SearchDropdown';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { debouncedQuery, results, loading, error } = useSearch(query);

  const totalResults = results.films.length + results.artists.length;
  // Always visible when the modal is open
  const isVisible = true; 

  // Reset keyboard focus when results change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [results]);

  // Focus input automatically when overlay opens
  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow animation to start
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < totalResults - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < totalResults) {
        // Navigate based on selected item
        const isFilm = focusedIndex < results.films.length;
        if (isFilm) {
          navigate(`/works/${results.films[focusedIndex].id}`);
        } else {
          const artistIndex = focusedIndex - results.films.length;
          navigate(`/profile/${results.artists[artistIndex].id}`);
        }
        handleClose();
      }
    } else if (e.key === 'Escape') {
      handleClose();
    }
  }, [isOpen, totalResults, focusedIndex, results, navigate, handleClose]);

  return (
    <>
      {/* Trigger Button (The original magnifying glass) */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="text-white/60 hover:text-white transition-colors"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Full Screen Overlay via Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-[100] bg-[#030303] flex flex-col"
            >
              {/* Search Header */}
              <div className="w-full max-w-2xl mx-auto px-6 pt-12 pb-6 flex items-center gap-4 border-b border-white/5">
                <div className="flex-1 flex items-center gap-3 bg-white/5 px-5 py-4 rounded-2xl border border-white/10 focus-within:border-white/30 focus-within:bg-white/10 transition-all">
                  <Search className="w-5 h-5 text-white/40 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search films, artists, or sets..."
                    className="bg-transparent border-none outline-none text-sm font-medium text-white placeholder:text-white/30 w-full"
                  />
                  {query.length > 0 && (
                    <button 
                      onClick={() => {
                        setQuery('');
                        inputRef.current?.focus();
                      }}
                      className="text-white/40 hover:text-white shrink-0 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button 
                onClick={handleClose}
                className="text-white/60 hover:text-white shrink-0 p-2 ml-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
              </div>

              {/* Results Body */}
              <SearchDropdown
                query={debouncedQuery} 
                results={results}
                loading={loading}
                error={error}
                isVisible={isVisible}
                onClose={handleClose}
                focusedIndex={focusedIndex}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
