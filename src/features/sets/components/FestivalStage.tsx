import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';
import { FESTIVALS, SETS } from '../../../mock';

export const FestivalStage = memo(function FestivalStage() {
  const navigate = useNavigate();
  const activeFestivals = FESTIVALS.filter(f => f.status === 'LIVE' || f.status === 'UPCOMING');
  
  if (activeFestivals.length === 0) return null;

  return (
    <section className="w-full pt-6 pb-8 border-b border-white/[0.02] bg-[#050505]" aria-label="Live Festival Stage">
      <div className="px-6 flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/90 drop-shadow-md">
          Live Stage
        </span>
      </div>

      <div className="w-full overflow-x-auto no-scrollbar snap-x snap-mandatory flex gap-4 px-6 pb-4">
        {activeFestivals.map((festival) => {
          const hostSet = SETS.find((s) => s.id === festival.setId);
          const accentColor = hostSet?.accentColor || '#ef4444';

          return (
            <article
              key={festival.id}
              onClick={() => navigate(`/festivals/${festival.id}`)}
              className="group relative flex-none w-[85vw] md:w-[50vw] lg:w-[40vw] max-w-[600px] aspect-video snap-center cursor-pointer rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/5 hover:border-white/20 transition-all duration-500 shadow-2xl"
            >
              {/* Image & Overlay */}
              <img
                src={festival.coverImage}
                alt={festival.title}
                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 group-hover:opacity-70 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/40 to-transparent pointer-events-none" />
              
              <div className="absolute inset-0 p-5 flex flex-col justify-end pointer-events-none">
                <div className="flex items-end justify-between">
                  <div className="pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-3 h-3" style={{ color: accentColor }} />
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/80">
                        {hostSet?.title || 'Unknown Source'}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-2 drop-shadow-lg">
                      {festival.title}
                    </h3>
                    <p className="text-[10px] md:text-[11px] text-white/50 line-clamp-2 leading-relaxed font-medium">
                      {festival.description}
                    </p>
                  </div>
                  
                  <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shrink-0 group-hover:bg-white group-hover:text-black transition-all duration-300 pointer-events-auto">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
});
