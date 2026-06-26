import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Trophy, Clock, Zap } from "lucide-react";
import { Festival } from "../../../types";
import { ARTISTS_MOCK } from "../../../mock";

interface FestivalsZoneProps {
  festivals: Festival[];
}

const STATUS_CONFIG = {
  LIVE: {
    label: "Live Now",
    dot: "bg-emerald-400",
    badge: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    ring: "ring-emerald-500/30",
  },
  UPCOMING: {
    label: "Upcoming",
    dot: "bg-amber-400",
    badge: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    ring: "ring-amber-500/20",
  },
  CONCLUDED: {
    label: "Concluded",
    dot: "bg-white/20",
    badge: "text-white/30 bg-white/5 border-white/10",
    ring: "ring-white/5",
  },
} as const;

function FestivalCard({ festival }: { festival: Festival }) {
  const navigate = useNavigate();
  const cfg = STATUS_CONFIG[(festival.status as keyof typeof STATUS_CONFIG)] ?? STATUS_CONFIG.CONCLUDED;

  return (
    <motion.button
      onClick={() => navigate(`/festivals/${festival.id}`)}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative flex-shrink-0 w-72 sm:w-80 rounded-2xl overflow-hidden
        bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.16]
        ring-1 ${cfg.ring}
        cursor-pointer text-left transition-all duration-300
        group
      `}
    >
      {/* Cover image with cinematic gradient overlay */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={festival.coverImage}
          alt={festival.title}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Live pulse dot */}
        {festival.status === "LIVE" && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute bottom-3 left-4">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${cfg.badge}`}
          >
            {festival.status === "LIVE" && <Zap className="w-2.5 h-2.5" />}
            {festival.status === "CONCLUDED" && <Clock className="w-2.5 h-2.5" />}
            {festival.status === "UPCOMING" && <Clock className="w-2.5 h-2.5" />}
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2">
        <h4 className="text-[13px] font-black uppercase tracking-tight leading-tight text-white/90 group-hover:text-white transition-colors line-clamp-2">
          {festival.title}
        </h4>
        <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2 font-mono">
          {festival.description}
        </p>

        {/* Panelists Cluster */}
        <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-1.5">
              {ARTISTS_MOCK.slice(
                festival.id.charCodeAt(festival.id.length - 1) % 3, 
                (festival.id.charCodeAt(festival.id.length - 1) % 3) + 3
              ).map((artist, i) => (
                <div 
                  key={i} 
                  className="relative w-5 h-5 rounded-full border border-[#111] bg-[#222] overflow-hidden shadow-sm" 
                  style={{ zIndex: 10 - i }}
                  title={artist.name}
                >
                  {artist.image ? (
                    <img src={artist.image} alt={artist.name} className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] font-bold">{artist.name[0]}</div>
                  )}
                </div>
              ))}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
              +{8 + (festival.id.charCodeAt(0) % 15)} Panelists
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export function FestivalsZone({ festivals }: FestivalsZoneProps) {
  if (!festivals.length) return null;

  // Sort: LIVE first, then UPCOMING, then CONCLUDED
  const sorted = [...festivals].sort((a, b) => {
    const order = { LIVE: 0, UPCOMING: 1, CONCLUDED: 2 };
    return (order[a.status as keyof typeof order] ?? 2) - (order[b.status as keyof typeof order] ?? 2);
  });

  return (
    <div className="overflow-x-auto no-scrollbar pb-4">
      <div className="flex gap-4 w-max px-6 md:px-12">
        {sorted.map((fest) => (
          <FestivalCard key={fest.id} festival={fest} />
        ))}
      </div>
    </div>
  );
}
