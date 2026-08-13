import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Quote, Film, Sparkles } from "lucide-react";
import { FoyerSwiper, FoyerArtistGroup } from "./FoyerSwiper";
import { apiFetch } from "@/lib/api";

function AvatarFallback({ className }: { className: string }) {
  // Strip img-specific classes like object-cover to safely apply to the div
  const baseClasses = className.replace(/object-cover|object-top|border-white\/10|shadow-[^ ]+/g, "").trim();
  
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-white/6 border border-white/15 shadow-xl transition-transform ${baseClasses}`}>
      <div className="absolute inset-[12%] rounded-[9px] border border-white/10" />
      <div className="relative flex items-center gap-[2px] text-[11px] font-black uppercase tracking-tight text-white">
        <span>F</span>
        <span className="text-white/45">H</span>
      </div>
    </div>
  );
}

function AvatarImage({ src, alt, className }: { src?: string; alt: string; className: string }) {
  const [error, setError] = useState(!src);
  if (error) return <AvatarFallback className={className} />;
  return <img src={src} alt={alt} className={className} draggable={false} onError={() => setError(true)} />;
}

export function FoyerSection() {
  const [selectedSwiperIndex, setSelectedSwiperIndex] = useState<number | null>(null);
  const [artistGroups, setArtistGroups] = useState<FoyerArtistGroup[]>([]);

  useEffect(() => {
    apiFetch("/wall/foyer")
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          setArtistGroups(json.data || json.groups || []);
        }
      })
      .catch((err) => {
        console.error("[FoyerSection] Failed to fetch foyer wall posts:", err);
      });
  }, []);

  const handleFetchOlder = async (artistId: string) => {
    setArtistGroups(prev => prev.map(group => {
      if (group.artistId !== artistId) return group;
      return {
        ...group,
        hasMore: false,
      };
    }));
  };

  if (artistGroups.length === 0) return null;

  return (
    <section className="mb-6 pt-2">
      
      <div className="overflow-x-auto no-scrollbar pb-6 w-full">
        <div className="flex gap-4 sm:gap-6 w-max px-6 md:px-12 mx-auto">
          {artistGroups.map((group, idx) => {
            const firstPost = group.entries[0]?.post;
            if (!firstPost) return null;
            
            const isLine = firstPost.type === "LINE";
            
            return (
              <motion.button
                key={group.artistId}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSwiperIndex(idx)}
                className="relative flex flex-col items-center gap-3 w-20 md:w-24 cursor-pointer group text-center shrink-0"
              >
                <AvatarImage 
                  src={group.artistImage} 
                  alt={group.artistName} 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border border-white/10 shadow-lg group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-500"
                />
                
                <div className="flex flex-col items-center gap-1.5 w-full">
                  <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] text-white/90 truncate w-full">
                    {group.artistName}
                  </span>
                  
                  {/* Visual Language Badge based on their most recent post */}
                  <div className={`flex items-center justify-center gap-1.5 px-2 py-1 rounded-lg backdrop-blur-md border shadow-sm w-max
                    ${firstPost.type === 'LINE' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : ''}
                    ${firstPost.type === 'PIN_WORK' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : ''}
                    ${firstPost.type === 'PIN_ORIGINAL' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : ''}
                  `}>
                    {firstPost.type === 'LINE' && (
                      <>
                        <Quote size={8} className="fill-amber-500/20" />
                        <span className="text-[6.5px] font-black uppercase tracking-[0.2em]">Line</span>
                      </>
                    )}
                    {firstPost.type === 'PIN_WORK' && (
                      <>
                        <Film size={8} className="fill-blue-500/20" />
                        <span className="text-[6.5px] font-black uppercase tracking-[0.2em]">Work</span>
                      </>
                    )}
                    {firstPost.type === 'PIN_ORIGINAL' && (
                      <>
                        <Sparkles size={8} className="fill-purple-500/20" />
                        <span className="text-[6.5px] font-black uppercase tracking-[0.2em]">Original</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedSwiperIndex !== null && (
          <FoyerSwiper 
            groups={artistGroups} 
            initialGroupIndex={selectedSwiperIndex} 
            onFetchOlder={handleFetchOlder}
            onClose={() => setSelectedSwiperIndex(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
}
