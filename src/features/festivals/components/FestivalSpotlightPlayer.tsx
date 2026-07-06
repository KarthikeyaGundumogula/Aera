import { memo, useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TheatreItem, OriginalArtist } from '../../../types';
import { SectionHeader } from '../../../components/SectionHeader';
import { FHLoader } from '../../../components/FHLoader';
import { ArtistProfile } from '../../shared/profile';
import { ARTISTS_MOCK } from '../../../mock';

import { buildEmbedUrl } from '../../../utils/embed';
import { useTwitterWidgets } from '../../../hooks/useTwitterWidgets';

interface FestivalSpotlightPlayerProps {
  works: TheatreItem[];
}

export const FestivalSpotlightPlayer = memo(function FestivalSpotlightPlayer({ works }: FestivalSpotlightPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<OriginalArtist | null>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { rootMargin: '200px' }
    );
    if (mainContainerRef.current) observer.observe(mainContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Reset iframe loading state when switching videos
  useEffect(() => {
    setIsIframeLoaded(false);
  }, [currentIndex]);

  const currentWork = works[currentIndex];
  
  const isYoutube = currentWork?.platform === 'youtube';
  const isTwitter = currentWork?.platform === 'twitter';
  const embedUrl = isYoutube && currentWork?.srcId ? buildEmbedUrl('youtube', currentWork.srcId) : '';

  const { containerRef: twitterContainerRef, isLoaded: isTwitterLoaded } = useTwitterWidgets(
    isTwitter && isIntersecting ? currentWork.srcId : undefined
  );

  if (!works.length) return null;

  const handleNext = () => setCurrentIndex(i => (i + 1) % works.length);
  const handlePrev = () => setCurrentIndex(i => (i - 1 + works.length) % works.length);

  const handleArtistClick = () => {
    if (!currentWork?.artist) return;
    const found = ARTISTS_MOCK.find(a => a.name.toLowerCase() === currentWork.artist?.toLowerCase()) || {
      ...ARTISTS_MOCK[0],
      name: currentWork.artist
    };
    setSelectedArtist(found);
  };

  const isFullyLoaded = isYoutube ? isIframeLoaded : (isTwitter ? isTwitterLoaded : true);

  return (
    <section className="pt-4 pb-12" ref={mainContainerRef} aria-label="Panelist Spotlight">
      <div className="px-4 md:px-8">
        <SectionHeader title="Panelist Spotlight" containerClassName="mb-8" />
        
        <div className="relative max-w-6xl mx-auto flex flex-col gap-8">
          {/* Neumorphic Player Container */}
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-surface-deep border border-white/[0.03] shadow-[10px_10px_30px_#000000,-10px_-10px_30px_rgba(255,255,255,0.02),inset_0_1px_0_rgba(255,255,255,0.05)]">
             {/* Loading State Overlay */}
             {(!isIntersecting || !isFullyLoaded) && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-deep/60 backdrop-blur-sm z-20">
                 <FHLoader label="Loading " />
               </div>
             )}

             {/* YouTube Embed */}
             {isIntersecting && isYoutube && embedUrl && (
               <iframe
                 key={`yt-${currentWork.id}`}
                 src={embedUrl}
                 className="absolute inset-0 w-full h-full border-none z-10"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowFullScreen
                 onLoad={() => setIsIframeLoaded(true)}
               />
             )}

             {/* Twitter Embed */}
             {isIntersecting && isTwitter && (
               <div className="absolute inset-0 flex items-center justify-center bg-black overflow-y-auto overflow-x-hidden no-scrollbar z-10 p-2">
                 <div ref={twitterContainerRef} className="w-full max-w-[560px] flex justify-center scale-95" />
               </div>
             )}
          </div>
          {/* Controls & Metadata (External to not conflict with player) */}
          <div className="flex items-center justify-between px-2 gap-4 md:gap-6">
             {/* Left Arrow */}
             <div className="flex items-center gap-3">
                <button 
                  onClick={handlePrev}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-surface-deep flex items-center justify-center border border-white/5 shadow-[6px_6px_12px_#030303,-6px_-6px_12px_rgba(255,255,255,0.03)] hover:shadow-[inset_4px_4px_8px_#030303,inset_-4px_-4px_8px_rgba(255,255,255,0.03)] transition-all duration-300 active:scale-95 text-white/50 hover:text-white flex-shrink-0"
                >
                  <ChevronLeft className="w-5 h-5 -ml-0.5" />
                </button>
             </div>

             {/* Centered Title & Artist */}
             <div className="flex flex-col items-center text-center flex-1 px-2 overflow-hidden">
                <h3 className="text-base md:text-xl font-black uppercase tracking-tight text-white truncate w-full">{currentWork.title}</h3>
                <button 
                  onClick={handleArtistClick}
                  className="text-[9px] md:text-[10px] text-white/40 hover:text-white font-bold tracking-[0.25em] uppercase mt-1 truncate max-w-full hover:underline transition-colors cursor-pointer"
                >
                  By. {currentWork.artist}
                </button>
             </div>

             {/* Right Arrow */}
             <div className="flex items-center gap-3">
                <button 
                  onClick={handleNext}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-surface-deep flex items-center justify-center border border-white/5 shadow-[6px_6px_12px_#030303,-6px_-6px_12px_rgba(255,255,255,0.03)] hover:shadow-[inset_4px_4px_8px_#030303,inset_-4px_-4px_8px_rgba(255,255,255,0.03)] transition-all duration-300 active:scale-95 text-white/50 hover:text-white flex-shrink-0"
                >
                  <ChevronRight className="w-5 h-5 -mr-0.5" />
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Artist Profile Modal */}
      <ArtistProfile artist={selectedArtist} onClose={() => setSelectedArtist(null)} />
    </section>
  );
});
