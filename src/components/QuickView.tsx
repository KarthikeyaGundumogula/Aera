import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Info, List, X, Calendar, PlayCircle, ExternalLink } from "lucide-react";
import { TheatreItem } from "../types";
import { LIVE_NOW, FEED_ITEMS, GRID_ITEMS } from "../data/mockData";

declare global {
  interface Window {
    twttr: any;
  }
}

interface QuickViewProps {
  selectedItem: TheatreItem | null;
  setSelectedItem: (item: TheatreItem | null) => void;
  isMobile: boolean;
  items: TheatreItem[];
  columns: number;
}

export function QuickView({ selectedItem, setSelectedItem, isMobile, items, columns }: QuickViewProps) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showControls, setShowControls] = useState(true);
  const [showQueue, setShowQueue] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [twitterReady, setTwitterReady] = useState(false);
  const twitterContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    if (selectedItem) {
      const index = items.findIndex(item => item.id === selectedItem.id);
      setCurrentIndex(index !== -1 ? index : 0);
    } else {
      setCurrentIndex(-1);
      setShowQueue(false);
      setShowInfo(false);
    }
  }, [selectedItem, items]);

  const handleMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (currentIndex === -1) return;

    const row = Math.floor(currentIndex / columns);
    const col = currentIndex % columns;
    const totalRows = Math.ceil(items.length / columns);

    let nextIndex = currentIndex;

    switch (direction) {
      case 'left':
        if (col > 0) nextIndex = currentIndex - 1;
        break;
      case 'right':
        if (col < columns - 1 && currentIndex + 1 < items.length) nextIndex = currentIndex + 1;
        break;
      case 'up':
        if (row > 0) nextIndex = currentIndex - columns;
        break;
      case 'down':
        if (row < totalRows - 1 && currentIndex + columns < items.length) nextIndex = currentIndex + columns;
        break;
    }

    if (nextIndex !== currentIndex) {
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, columns, items]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItem) return;
      if (e.key === "ArrowDown") handleMove('down');
      if (e.key === "ArrowUp") handleMove('up');
      if (e.key === "ArrowLeft") handleMove('left');
      if (e.key === "ArrowRight") handleMove('right');
      if (e.key === "Escape") setSelectedItem(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem, handleMove, setSelectedItem]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    resetTimer();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (Math.max(absX, absY) > 50) { // Threshold
      if (absX > absY) {
        handleMove(deltaX > 0 ? 'left' : 'right');
      } else {
        handleMove(deltaY > 0 ? 'up' : 'down');
      }
    }
    touchStartRef.current = null;
  };

  const resetTimer = useCallback(() => {
    setShowControls(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Longer timeout for mobile to help with mute/controls interaction
    const timeout = isMobile ? 5000 : 3000;
    timeoutRef.current = setTimeout(() => {
      // Don't hide if queue or info is open
      if (!showQueue && !showInfo) {
        setShowControls(false);
      }
    }, timeout);
  }, [isMobile, showQueue, showInfo]);

  useEffect(() => {
    if (selectedItem) {
      resetTimer();
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [selectedItem, resetTimer]);

  const currentVideo = items[currentIndex];

  // Load Twitter Widgets script
  useEffect(() => {
    if (window.twttr) {
      setTwitterReady(true);
    } else {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = () => {
        window.twttr.ready(() => setTwitterReady(true));
      };
      document.body.appendChild(script);
    }
  }, []);

  // Trigger Twitter widget load when ID changes
  useEffect(() => {
    if (currentVideo?.twitterId && twitterReady && window.twttr?.widgets) {
      if (twitterContainerRef.current) {
        // Clear previous content
        twitterContainerRef.current.innerHTML = '';
        
        // Create the blockquote structure requested by the user
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'twitter-tweet';
        blockquote.setAttribute('data-media-max-width', '560');
        blockquote.setAttribute('data-theme', 'dark');
        blockquote.setAttribute('data-align', 'center');
        blockquote.setAttribute('data-dnt', 'true');
        
        const link = document.createElement('a');
        link.href = `https://twitter.com/x/status/${currentVideo.twitterId}/video/1`;
        blockquote.appendChild(link);
        
        twitterContainerRef.current.appendChild(blockquote);
        
        // Tell Twitter to process the new element
        window.twttr.widgets.load(twitterContainerRef.current);
      }
    }
  }, [currentVideo?.twitterId, twitterReady]);

  return (
    <AnimatePresence>
      {selectedItem && currentVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          onMouseMove={resetTimer}
        >
          <div className="relative w-full h-full flex flex-col md:flex-row overflow-hidden">
            {/* Main Video Stage */}
            <div 
              className="relative flex-1 bg-black flex items-center justify-center group"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {currentVideo.twitterId ? (
                <div 
                  ref={twitterContainerRef}
                  className="w-full h-full flex items-center justify-center p-4"
                >
                  {/* Twitter programmatic widget will be injected here */}
                </div>
              ) : (
                <video 
                  key={currentVideo.id}
                  src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
                  controls={showControls}
                  controlsList="nodownload noplaybackrate noremoteplayback"
                  disablePictureInPicture
                  autoPlay 
                  className="w-full h-full object-contain pointer-events-auto"
                  poster={currentVideo.image || ''}
                  onEnded={() => handleMove('down')}
                  onClick={(e) => {
                    // If controls are hidden, show them on first click
                    if (!showControls) {
                      e.preventDefault();
                      resetTimer();
                    }
                  }}
                />
              )}
              
              {/* Transparent Touch Layer to bring back controls when hidden */}
              {!showControls && (
                <div 
                  className="absolute inset-0 z-10 cursor-pointer" 
                  onClick={resetTimer}
                />
              )}
              
              {/* Overlay Controls */}
              <AnimatePresence>
                {showControls && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-12"
                  >
                    <div className="flex justify-between items-start pointer-events-auto">
                      <div className="space-y-1 md:space-y-2">
                        <h2 className="text-xl md:text-5xl font-black text-white uppercase tracking-tighter">
                          {currentVideo.title || 'Untitled'}
                        </h2>
                        <div className="flex items-center gap-2 md:gap-4">
                          <span className="px-2 md:px-3 py-0.5 md:py-1 bg-brand-accent text-white text-[8px] md:text-[10px] font-bold rounded-full uppercase tracking-widest">
                            {currentVideo.watching || currentVideo.meta || 'AERA'}
                          </span>
                          <div className="flex items-center gap-1 md:gap-2">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/40"></span>
                            <span className="text-[8px] md:text-[10px] font-bold text-white/60 uppercase tracking-widest">4K HDR</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 md:gap-4">
                        {/* Info Toggle */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); setShowQueue(false); }}
                          className={`p-2 md:p-3 rounded-full text-white transition-all border border-white/10 ${showInfo ? 'bg-brand-accent' : 'bg-white/10 backdrop-blur-xl hover:bg-white/20'}`}
                        >
                          <Info className="w-4 h-4 md:w-6 md:h-6" />
                        </button>

                        {/* Queue Toggle (Desktop Only) */}
                        {!isMobile && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowQueue(!showQueue); setShowInfo(false); }}
                            className={`p-2 md:p-3 rounded-full text-white transition-all border border-white/10 ${showQueue ? 'bg-brand-accent' : 'bg-white/10 backdrop-blur-xl hover:bg-white/20'}`}
                          >
                            <List className="w-4 h-4 md:w-6 md:h-6" />
                          </button>
                        )}

                        {currentVideo.twitterId && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); window.open(`https://twitter.com/x/status/${currentVideo.twitterId}`, '_blank'); }}
                            className="p-2 md:p-3 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-white/20 transition-all border border-white/10"
                            title="Open in New Tab"
                          >
                            <ExternalLink className="w-4 h-4 md:w-6 md:h-6" />
                          </button>
                        )}

                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}
                          className="p-2 md:p-3 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-white/20 transition-all border border-white/10"
                        >
                          <X className="w-4 h-4 md:w-6 md:h-6" />
                        </button>
                      </div>
                    </div>

                    {/* Navigation Hints */}
                    <div className="flex justify-center gap-4 md:gap-8 pointer-events-auto">
                      <button onClick={(e) => { e.stopPropagation(); handleMove('up'); }} className="p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all">
                        <Calendar className="w-4 h-4 md:w-6 md:h-6 rotate-180" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleMove('down'); }} className="p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all">
                        <Calendar className="w-4 h-4 md:w-6 md:h-6" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleMove('left'); }} className="p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all">
                        <Calendar className="w-4 h-4 md:w-6 md:h-6 -rotate-90" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleMove('right'); }} className="p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all">
                        <Calendar className="w-4 h-4 md:w-6 md:h-6 rotate-90" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Side Panels */}
            <AnimatePresence>
              {showQueue && !isMobile && (
                <motion.div
                  initial={{ x: 400 }}
                  animate={{ x: 0 }}
                  exit={{ x: 400 }}
                  className="w-full md:w-[400px] absolute md:relative right-0 h-full bg-brand-dark/90 backdrop-blur-3xl border-l border-white/10 p-6 md:p-8 overflow-y-auto no-scrollbar z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xs font-bold text-white uppercase tracking-[0.4em] opacity-40">Up Next</h3>
                    <button onClick={() => setShowQueue(false)} className="md:hidden text-white/40"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-6">
                    {items.slice(currentIndex + 1, currentIndex + 15).map((item, idx) => (
                      <div 
                        key={`${item.id}-${idx}`}
                        onClick={() => { setCurrentIndex(items.indexOf(item)); if (isMobile) setShowQueue(false); }}
                        className="group cursor-pointer flex gap-4 items-center"
                      >
                        <div className="relative w-24 md:w-32 aspect-video rounded-lg overflow-hidden border border-white/5">
                          <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlayCircle className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[10px] font-bold text-white uppercase tracking-wider line-clamp-1">{item.title}</h4>
                          <p className="text-[8px] text-white/30 uppercase tracking-widest mt-1">AERA Original</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {showInfo && (
                <motion.div
                  initial={{ x: 400 }}
                  animate={{ x: 0 }}
                  exit={{ x: 400 }}
                  className="w-full md:w-[400px] absolute md:relative right-0 h-full bg-brand-dark/90 backdrop-blur-3xl border-l border-white/10 p-6 md:p-8 overflow-y-auto no-scrollbar z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xs font-bold text-white uppercase tracking-[0.4em] opacity-40">Production Info</h3>
                    <button onClick={() => setShowInfo(false)} className="md:hidden text-white/40"><X className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-2xl font-bold text-white">{currentVideo.title || 'Untitled'}</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[8px] font-bold text-white/60 uppercase tracking-widest">4K Ultra HD</span>
                        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[8px] font-bold text-white/60 uppercase tracking-widest">Spatial Audio</span>
                        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[8px] font-bold text-white/60 uppercase tracking-widest">Dolby Vision</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">Credits</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[8px] text-white/40 uppercase tracking-widest">Director</p>
                          <p className="text-xs text-white font-medium">Elena Vance</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] text-white/40 uppercase tracking-widest">Choreography</p>
                          <p className="text-xs text-white font-medium">Marcus Chen</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] text-white/40 uppercase tracking-widest">Sound Design</p>
                          <p className="text-xs text-white font-medium">AERA Labs</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] text-white/40 uppercase tracking-widest">Visual Effects</p>
                          <p className="text-xs text-white font-medium">Lumina Studios</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">Tags</h5>
                      <div className="flex flex-wrap gap-2">
                        {['Contemporary', 'Immersive', 'Experimental', 'Digital Theatre'].map(tag => (
                          <span key={tag} className="text-[10px] text-white/60 hover:text-white transition-colors cursor-pointer">#{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 space-y-4">
                      <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white uppercase tracking-widest transition-all">
                        Add to Watchlist
                      </button>
                      <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white uppercase tracking-widest transition-all">
                        Share Production
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Scroll Hint */}
          {isMobile && showControls && !showQueue && !showInfo && (
            <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none">
              <span className="text-[8px] font-bold text-white/40 uppercase tracking-[0.3em]">Scroll for next</span>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <div className="w-px h-8 bg-gradient-to-b from-brand-accent to-transparent"></div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
