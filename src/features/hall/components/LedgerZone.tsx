import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { LedgerItem } from "../../../mock/ledger";

interface LedgerZoneProps {
  items: LedgerItem[];
}

const STATUS_MAP = {
  want_to_watch: {
    label: "Hype",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
    icon: EyeOff,
  },
  watched: {
    label: "Seen",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
    icon: Eye,
  },
};

function LedgerCard({ item }: { item: LedgerItem }) {
  const navigate = useNavigate();
  const statusCfg = STATUS_MAP[item.status];
  const StatusIcon = statusCfg.icon;

  return (
    <motion.button
      onClick={() => navigate("/ledger")}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className="
        relative flex-shrink-0 w-64 sm:w-72 rounded-2xl overflow-hidden
        bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.18]
        cursor-pointer text-left transition-all duration-300
        group
      "
    >
      {/* Poster thumbnail */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.originalPosterUrl}
          alt={item.originalName}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusCfg.bg} ${statusCfg.color}`}
          >
            <StatusIcon className="w-2.5 h-2.5" />
            {statusCfg.label}
          </span>
        </div>

        {/* Tagged works count bubble */}
        {item.taggedWorks.length > 0 && (
          <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-black/70 border border-white/15 flex items-center justify-center">
            <span className="text-[10px] font-black text-white/80">{item.taggedWorks.length}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2">
        <h4 className="text-[13px] font-black uppercase tracking-tight text-white/90 group-hover:text-white transition-colors">
          {item.originalName}
        </h4>
        <p className="text-[11px] text-white/40 font-mono leading-relaxed line-clamp-2">
          {item.status === "watched" && item.afterThoughts
            ? item.afterThoughts
            : item.hypeText}
        </p>
      </div>
    </motion.button>
  );
}

export function LedgerZone({ items }: LedgerZoneProps) {
  if (!items.length) return null;

  return (
    <div className="overflow-x-auto no-scrollbar pb-4">
      <div className="flex gap-4 w-max px-6 md:px-12">
        {items.map((item) => (
          <LedgerCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
