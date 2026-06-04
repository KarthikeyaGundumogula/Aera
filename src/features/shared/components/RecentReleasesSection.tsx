import { memo, useState, useEffect, useRef, useMemo, ElementType } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../../../components/SectionHeader';
import { FHLoader } from '../../../components/FHLoader';
import { buildEmbedUrl } from '../../../utils/embed';
import { GRID_ITEMS, ORIGINALS } from '../../../mock';

interface RecentReleasesSectionProps {
  title?: string;
  icon?: ElementType;
  className?: string;
  headerClassName?: string;
}

export const RecentReleasesSection = memo(function RecentReleasesSection({ 
  title = "Releases",
  icon,
  className = "pt-8 pb-12",
  headerClassName = "mb-8"
}: RecentReleasesSectionProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Filter top 5 YouTube releases based on credits
  const recentReleases = useMemo(() => {
    return GRID_ITEMS
      .filter(w => w.platform === 'youtube')
      .sort((a, b) => (b.credits || 0) - (a.credits || 0))
      .slice(0, 5);
  }, []);

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

  const currentWork = recentReleases[currentIndex];

  const currentOriginal = useMemo(() => {
    if (!currentWork) return null;
    return ORIGINALS.find(o => currentWork.originalIds?.includes(o.id) || (currentWork as any).originalId === o.id) || null;
  }, [currentWork]);

  if (!recentReleases.length) return null;

  const embedUrl = currentWork?.srcId ? buildEmbedUrl('youtube', currentWork.srcId) : '';

  const handleNext = () => setCurrentIndex(i => Math.min(i + 1, recentReleases.length - 1));
  const handlePrev = () => setCurrentIndex(i => Math.max(i - 1, 0));

  return (
    <section className={className} ref={mainContainerRef} aria-label="Releases">
      <div className="px-6 md:px-12 w-full">
        <SectionHeader title={title} icon={icon} containerClassName={headerClassName} />
        
        {/* DESKTOP LAYOUT (hidden md:block) */}
        <div className="hidden md:flex flex-col gap-8">
          {/* Neumorphic Player Container */}
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-[#050505] border border-white/[0.03] shadow-[10px_10px_30px_#000000,-10px_-10px_30px_rgba(255,255,255,0.02),inset_0_1px_0_rgba(255,255,255,0.05)]">
             {(!isIntersecting || !isIframeLoaded) && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]/60 backdrop-blur-sm z-20">
                 <FHLoader label="Loading" />
               </div>
             )}

             {isIntersecting && embedUrl && (
               <iframe
                 key={`yt-desktop-${currentWork.id}`}
                 src={embedUrl}
                 className="absolute inset-0 w-full h-full border-none z-10"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowFullScreen
                 onLoad={() => setIsIframeLoaded(true)}
               />
             )}
          </div>

          {/* Controls & Metadata */}
          <div className="flex items-center justify-between px-2 gap-6">
             <div className="flex flex-col text-left">
                <h3 className="text-xl font-black uppercase tracking-tight text-white">{currentWork.title}</h3>
                {currentOriginal ? (
                  <div className="text-[10px] text-white/40 font-bold tracking-[0.25em] uppercase mt-1.5 flex items-center gap-1.5">
                    <span>From:</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/originals/${currentOriginal.id}`); }} 
                      className="text-white hover:underline font-black tracking-widest"
                    >
                      {currentOriginal.title}
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-white/40 font-bold tracking-[0.25em] uppercase mt-1.5">By. {currentWork.artist}</p>
                )}
             </div>

             {/* Neumorphic Buttons */}
             <div className="flex items-center gap-4">
                <button 
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`w-14 h-14 rounded-full bg-[#050505] flex items-center justify-center border border-white/5 shadow-[6px_6px_12px_#030303,-6px_-6px_12px_rgba(255,255,255,0.03)] transition-all duration-300 ${
                    currentIndex === 0 
                      ? 'opacity-20 cursor-not-allowed text-white/50' 
                      : 'hover:shadow-[inset_4px_4px_8px_#030303,inset_-4px_-4px_8px_rgba(255,255,255,0.03)] active:scale-95 text-white/50 hover:text-white'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5 -ml-0.5" />
                </button>
                <div className="text-[10px] font-black tracking-widest text-white/20 w-16 text-center">
                  {currentIndex + 1} / {recentReleases.length}
                </div>
                <button 
                  onClick={handleNext}
                  disabled={currentIndex === recentReleases.length - 1}
                  className={`w-14 h-14 rounded-full bg-[#050505] flex items-center justify-center border border-white/5 shadow-[6px_6px_12px_#030303,-6px_-6px_12px_rgba(255,255,255,0.03)] transition-all duration-300 ${
                    currentIndex === recentReleases.length - 1 
                      ? 'opacity-20 cursor-not-allowed text-white/50' 
                      : 'hover:shadow-[inset_4px_4px_8px_#030303,inset_-4px_-4px_8px_rgba(255,255,255,0.03)] active:scale-95 text-white/50 hover:text-white'
                  }`}
                >
                  <ChevronRight className="w-5 h-5 -mr-0.5" />
                </button>
             </div>
          </div>
        </div>

        {/* MOBILE LAYOUT (block md:hidden) */}
        <div className="block md:hidden">
          <div className="px-2">
            {/* Neumorphic Player Container */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#050505] border border-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
               {(!isIntersecting || !isIframeLoaded) && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]/60 backdrop-blur-sm z-20">
                   <FHLoader label="Loading Celebration" />
                 </div>
               )}

               {isIntersecting && embedUrl && (
                 <iframe
                   key={`yt-mobile-${currentWork.id}`}
                   src={embedUrl}
                   className="absolute inset-0 w-full h-full border-none z-10"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   allowFullScreen
                   onLoad={() => setIsIframeLoaded(true)}
                 />
               )}
            </div>
          </div>

          {/* Navigation arrows and Title/From text in the same row */}
          <div className="mt-4 flex items-center justify-between px-2 gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`w-10 h-10 shrink-0 rounded-full bg-[#050505] flex items-center justify-center border border-white/10 shadow-lg transition-all duration-300 ${
                currentIndex === 0 
                  ? 'opacity-20 cursor-not-allowed text-white/50' 
                  : 'text-white/80 hover:text-white active:scale-95'
              }`}
              aria-label="Previous Release"
            >
              <ChevronLeft className="w-5 h-5 -ml-0.5" />
            </button>

            <div className="flex flex-col items-center text-center min-w-0 flex-1 px-1">
              <h4 className="text-sm sm:text-base font-black uppercase tracking-tight text-white drop-shadow-md truncate w-full">
                {currentWork.title}
              </h4>
              {currentOriginal ? (
                <div className="text-[10px] text-white/40 font-bold tracking-[0.25em] uppercase mt-1 flex items-center gap-1.5 justify-center truncate w-full">
                  <span>From:</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/originals/${currentOriginal.id}`); }} 
                    className="text-white hover:underline font-black tracking-widest truncate"
                  >
                    {currentOriginal.title}
                  </button>
                </div>
              ) : (
                <p className="text-[10px] text-white/40 font-bold tracking-[0.25em] uppercase mt-1 truncate w-full">By. {currentWork.artist}</p>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === recentReleases.length - 1}
              className={`w-10 h-10 shrink-0 rounded-full bg-[#050505] flex items-center justify-center border border-white/10 shadow-lg transition-all duration-300 ${
                currentIndex === recentReleases.length - 1 
                  ? 'opacity-20 cursor-not-allowed text-white/50' 
                  : 'text-white/80 hover:text-white active:scale-95'
              }`}
              aria-label="Next Release"
            >
              <ChevronRight className="w-5 h-5 -mr-0.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});

