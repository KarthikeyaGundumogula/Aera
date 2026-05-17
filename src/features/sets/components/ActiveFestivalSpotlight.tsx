import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ChevronRight, Clock } from 'lucide-react';
import { Festival, Set } from '../../../types';
import { SectionHeader } from '../../../components/SectionHeader';

interface ActiveFestivalSpotlightProps {
  festival: Festival;
  set: Set;
}

/**
 * ActiveFestivalSpotlight — Bento-style hero for the currently LIVE festival.
 * Desktop: 8-col main card + 4-col details card in a 12-col grid.
 * Mobile: Stacked full-width.
 */
export const ActiveFestivalSpotlight = memo(function ActiveFestivalSpotlight({
  festival,
  set,
}: ActiveFestivalSpotlightProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const end = new Date(festival.endDate).getTime();
      const diff = Math.max(0, end - now);
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [festival.endDate]);

  const isLive = festival.status === 'LIVE';

  return (
    <section className="px-4 md:px-8 pt-10 pb-4" aria-label={`Active Festival: ${festival.title}`}>
      {/* Section Label */}
      <SectionHeader
        title={isLive ? 'Happening Now' : 'Upcoming Festival'}
        containerClassName="mb-6"
      />

      <div className="flex flex-col gap-3">

        {/* Main Card — Full Width Cover */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full relative group cursor-pointer overflow-hidden rounded-xl border border-white/[0.06] hover:border-white/10 transition-colors"
          style={{ minHeight: '320px' }}
        >
          {/* Background image */}
          <img
            src={festival.coverImage}
            alt={festival.title}
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
          />
          {/* Layered gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

          {/* LIVE Badge */}
          {isLive && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-red-600 rounded-[3px]">
              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-white">Live Now</span>
            </div>
          )}

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 md:p-8 md:pb-16">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40 mb-2">
              {set.title}
            </p>
            <h2
              className="font-black text-white uppercase tracking-tight leading-none"
              style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)', maxWidth: '95%' }}
            >
              {festival.title}
            </h2>
            <p className="text-[11px] md:text-xs text-white/50 mt-4 leading-relaxed max-w-[600px]">
              {festival.description}
            </p>
          </div>

          {/* Bottom Middle Visual Hint */}
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-100 drop-shadow-md transition-opacity duration-300">
             <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">
               {isExpanded ? 'Close Details' : 'View Details'}
             </span>
             <div className="animate-bounce mt-0.5">
               <ChevronRight className={`w-3.5 h-3.5 text-white transition-transform duration-500 ${isExpanded ? '-rotate-90' : 'rotate-90'}`} />
             </div>
          </div>
        </motion.div>

        {/* Dropdown Details Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
                {/* Countdown Block */}
                <div className="md:col-span-5 bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-3.5 h-3.5 text-white/20" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
                      {isLive ? 'Ends In' : 'Starts In'}
                    </span>
                  </div>

                  {/* Digits */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'D', value: timeLeft.days },
                      { label: 'H', value: timeLeft.hours },
                      { label: 'M', value: timeLeft.minutes },
                      { label: 'S', value: timeLeft.seconds },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex flex-col items-center">
                        <span
                          className="font-black text-white leading-none tabular-nums"
                          style={{ fontSize: 'clamp(1.4rem, 2.8vw, 2rem)' }}
                        >
                          {String(value).padStart(2, '0')}
                        </span>
                        <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-white/20 mt-1">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rules Block */}
                {festival.rules && festival.rules.length > 0 && (
                  <div className="md:col-span-4 bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-5">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-3">Rules</p>
                    <ul className="space-y-2">
                      {festival.rules.slice(0, 3).map((rule, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[9px] font-black text-white/10 mt-0.5 flex-shrink-0">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="text-[10px] text-white/40 leading-snug">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Enter CTA */}
                <div className={`flex flex-col justify-end ${festival.rules?.length ? 'md:col-span-3' : 'md:col-span-7'}`}>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => navigate(`/festivals/${festival.id}`)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-white text-black rounded-xl font-black text-[11px] uppercase tracking-[0.25em] hover:bg-white/90 transition-colors h-full md:h-auto"
                  >
                    <span>Enter Festival</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
});
