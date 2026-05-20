import { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { FESTIVALS, SETS } from '../../../mock';
import { Activity } from 'lucide-react';

// "Organized Chaos" specific layout definitions. 
// Uses viewport units so they scale flawlessly and dynamically on mobile and desktop.
const SCATTER_LAYOUTS = [
  { w: 'w-[60vw] md:w-[30vw]', aspect: 'aspect-video', top: '10%', left: '5%', rotate: -4 },
  { w: 'w-[45vw] md:w-[22vw]', aspect: 'aspect-[4/5]', top: '5%', left: '35%', rotate: 4 },
  { w: 'w-[55vw] md:w-[28vw]', aspect: 'aspect-video', top: '25%', left: '65%', rotate: -2 },
  { w: 'w-[35vw] md:w-[18vw]', aspect: 'aspect-square', top: '15%', left: '80%', rotate: 8 },
  { w: 'w-[40vw] md:w-[25vw]', aspect: 'aspect-video', top: '45%', left: '-5%', rotate: -6 },
  { w: 'w-[50vw] md:w-[26vw]', aspect: 'aspect-[3/4]', top: '35%', left: '45%', rotate: 5 },
];

export const FestivalCarousel = memo(function FestivalCarousel() {
  const navigate = useNavigate();
  const activeFestivals = FESTIVALS.filter(f => f.status === 'LIVE' || f.status === 'UPCOMING');
  
  if (activeFestivals.length === 0) return null;

  // We want to ensure we have enough items to fill the chaos layout.
  // We multiply the active festivals up to the layout count.
  const displayItems = useMemo(() => {
    let items = [...activeFestivals];
    while (items.length < SCATTER_LAYOUTS.length) {
      items = [...items, ...activeFestivals];
    }
    return items.slice(0, SCATTER_LAYOUTS.length);
  }, [activeFestivals]);

  return (
    <section 
      className="relative w-full h-[45vh] md:h-[50vh] bg-[#050505] overflow-hidden border-b border-white/[0.02]" 
      aria-label="Festival Currents"
    >
      {/* Background Ambient Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[120px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px] mix-blend-screen" 
        />
      </div>

      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-30 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/90 drop-shadow-md">
          Live Energy
        </span>
      </div>

      {/* Floating Canvas */}
      <div className="relative w-full h-full z-10">
        {displayItems.map((festival, i) => {
          const hostSet = SETS.find((s) => s.id === festival.setId);
          const accentColor = hostSet?.accentColor || '#ef4444';
          const layout = SCATTER_LAYOUTS[i];

          return (
            <motion.div
              key={`${festival.id}-${i}`}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, i % 2 === 0 ? -15 : 15, 0]
              }}
              transition={{
                opacity: { delay: i * 0.1, duration: 0.8 },
                scale: { delay: i * 0.1, duration: 0.8, type: "spring" },
                y: {
                  repeat: Infinity,
                  repeatType: "mirror",
                  duration: 6 + (i % 3) * 2,
                  ease: "easeInOut"
                }
              }}
              style={{
                position: 'absolute',
                top: layout.top,
                left: layout.left,
                rotate: layout.rotate,
                transformOrigin: 'center center'
              }}
              className={`group cursor-pointer ${layout.w} ${layout.aspect} rounded-xl md:rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-out z-10 hover:z-50`}
              onClick={() => navigate(`/festivals/${festival.id}`)}
              whileHover={{
                scale: 1.08,
                rotate: 0,
                boxShadow: `0 0 100px -20px ${accentColor}`,
                transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Radiolucent Glow underlay */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-color-dodge z-20"
                style={{ background: `radial-gradient(circle at center, ${accentColor}90 0%, transparent 60%)` }}
              />

              <img
                src={festival.coverImage}
                alt={festival.title}
                className="absolute inset-0 w-full h-full object-cover brightness-[0.7] group-hover:brightness-110 transition-all duration-700 ease-out scale-110 group-hover:scale-100 z-0"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-100 transition-opacity duration-500 z-10" />
              
              <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500 z-30">
                <div className="flex items-center gap-2 mb-2 md:mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  <Activity className="w-3 h-3 md:w-4 md:h-4" style={{ color: accentColor }} />
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white">
                    {hostSet?.title || 'Unknown Source'}
                  </span>
                </div>
                
                <h3 className="text-xl md:text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter leading-[0.9] drop-shadow-2xl">
                  {festival.title}
                </h3>

                <motion.div 
                  className="mt-2 md:mt-4 overflow-hidden max-h-0 group-hover:max-h-[100px] transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100"
                >
                  <p className="text-[9px] md:text-[11px] text-white/80 leading-relaxed font-medium line-clamp-3">
                    {festival.description}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
});
