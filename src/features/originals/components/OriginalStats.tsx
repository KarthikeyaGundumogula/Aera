import { motion, AnimatePresence } from "motion/react";
import { Users, Film } from "lucide-react";
import { PresenceIcon } from "../../../components/icons/AppIcons";

interface OriginalStatsProps {
  stats: {
    presence: string | number;
    members: string | number;
    releases: string | number;
  };
  isTheaterMode: boolean;
}

export function OriginalStats({ stats, isTheaterMode }: OriginalStatsProps) {
  return (
    <AnimatePresence>
      {!isTheaterMode && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-0 left-0 w-full px-8 pb-2 z-20 pointer-events-none"
        >
          <div className="flex items-center gap-8 md:gap-12 py-4 border-t border-white/10">
            <div className="flex flex-col pointer-events-auto">
              <div className="flex items-center gap-2 mb-1">
                <PresenceIcon className="w-3 h-3 text-yellow-400" />
                <span className="text-lg font-bold drop-shadow-2xl">
                  {stats.presence}
                </span>
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-white/50 drop-shadow-2xl">
                Presence
              </span>
            </div>
            <div className="flex flex-col pointer-events-auto">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-3 h-3 text-blue-400" />
                <span className="text-lg font-bold drop-shadow-2xl">
                  {stats.members}
                </span>
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-white/50 drop-shadow-2xl">
                Artists
              </span>
            </div>
            <div className="flex flex-col pointer-events-auto">
              <div className="flex items-center gap-2 mb-1">
                <Film className="w-3 h-3 text-purple-400" />
                <span className="text-lg font-bold drop-shadow-2xl">
                  {stats.releases}
                </span>
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-white/50 drop-shadow-2xl">
                Releases
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
