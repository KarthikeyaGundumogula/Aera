import { memo, useMemo } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Trophy, Calendar } from 'lucide-react';
import { Festival } from '../../../types';
import { PROFILES_DIRECTORY } from '../../../mock';
import { SectionHeader } from '../../../components/SectionHeader';

interface FestivalArchiveProps {
  festivals: Festival[];
}

/**
 * FestivalArchive — Horizontal scroll row of concluded festival cards.
 * Appears between the Active Spotlight and the Set Theatre.
 */
export const FestivalArchive = memo(function FestivalArchive({ festivals }: FestivalArchiveProps) {
  const navigate = useNavigate();
  const concluded = useMemo(
    () => festivals.filter(f => f.status === 'CONCLUDED').sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    ),
    [festivals]
  );

  if (concluded.length === 0) return null;

  return (
    <section className="px-4 md:px-8 pt-6 pb-4" aria-label="Festival Archive">
      {/* Section Label */}
      <SectionHeader
        title="Previous Festivals"
        containerClassName="mb-6"
      />

      {/* Horizontal scroll strip */}
      {/* Negative margin lets cards scroll edge-to-edge while staying aligned with section padding */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 md:-mx-8 px-4 md:px-8 pb-2">
        {concluded.map((festival, i) => {
          const leader = festival.presenceLeader
            ? PROFILES_DIRECTORY.find(p => p.id === festival.presenceLeader)
            : null;

          const start = new Date(festival.startDate);
          const end = new Date(festival.endDate);
          const dateRange = `${start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

          return (
            <motion.div
              key={festival.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => navigate(`/festivals/${festival.id}`)}
              className="flex-shrink-0 w-[240px] md:w-[280px] group cursor-pointer"
            >
              {/* Image */}
              <div className="relative w-full aspect-video overflow-hidden rounded-md mb-3 border border-white/[0.04] group-hover:border-white/10 transition-colors">
                <img
                  src={festival.coverImage}
                  alt={festival.title}
                  className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700 scale-[1.01] group-hover:scale-[1.04]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {/* Concluded badge */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-white/10 backdrop-blur-md rounded-[2px] border border-white/10">
                  <span className="text-[7px] font-black uppercase tracking-widest text-white/60">Concluded</span>
                </div>
                {/* Navigate arrow */}
                <ArrowUpRight className="absolute top-2 right-2 w-3.5 h-3.5 text-white/0 group-hover:text-white/60 transition-colors" />
              </div>

              {/* Meta */}
              <div className="space-y-1.5">
                <p
                  className="text-[11px] font-black uppercase tracking-tight text-white/70 group-hover:text-white transition-colors leading-tight"
                  style={{ maxWidth: '95%' }}
                >
                  {festival.title}
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-2.5 h-2.5 text-white/20" />
                    <span className="text-[9px] text-white/30 font-medium uppercase tracking-[0.1em]">{dateRange}</span>
                  </div>

                  {leader && (
                    <>
                      <div className="w-px h-3 bg-white/10" />
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-2.5 h-2.5 text-white/20" />
                        <span className="text-[9px] text-white/30 font-medium">{leader.name}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
});
