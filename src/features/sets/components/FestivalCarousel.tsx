import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { FESTIVALS, SETS } from '../../../mock';
import { ArrowRight } from 'lucide-react';

export const FestivalCarousel = memo(function FestivalCarousel() {
  const navigate = useNavigate();
  const activeFestivals = FESTIVALS.filter(f => f.status === 'LIVE' || f.status === 'UPCOMING');
  
  if (activeFestivals.length === 0) return null;

  // Double the items for a seamless loop
  const marqueeItems = [...activeFestivals, ...activeFestivals, ...activeFestivals];

  return (
    <section className="w-full pt-5 pb-4 bg-[#050505] overflow-hidden" aria-label="Festival Marquee">
      {/* Section Heading */}
      <div className="px-4 md:px-8 mb-6 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">
          Happening Now
        </h2>
      </div>

      <div className="relative flex items-center">
        <motion.div 
          className="flex gap-4 px-4"
          animate={{
            x: [0, -1200], // Adjust based on item count/width
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 35,
              ease: "linear",
            },
          }}
          style={{ width: 'fit-content' }}
          whileHover={{ animationPlayState: 'paused' }}
        >
          {marqueeItems.map((festival, i) => {
            const hostSet = SETS.find((s) => s.id === festival.setId);
            const isLive = festival.status === 'LIVE';

            return (
              <div
                key={`${festival.id}-${i}`}
                onClick={() => navigate(`/festivals/${festival.id}`)}
                className="w-[280px] md:w-[320px] h-[140px] flex-shrink-0 relative group cursor-pointer overflow-hidden rounded-xl bg-[#0a0a0a] border border-white/[0.05] hover:border-white/10 transition-all duration-500"
              >
                <img
                  src={festival.coverImage}
                  alt={festival.title}
                  className="absolute inset-0 w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-2">
                    {isLive && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-600 rounded-[2px] animate-pulse">
                        <span className="text-[7px] font-black uppercase text-white tracking-widest">Live</span>
                      </div>
                    )}
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                      {hostSet?.title || 'Registry'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight truncate">
                    {festival.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
});
