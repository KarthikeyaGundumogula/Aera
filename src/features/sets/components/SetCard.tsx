import React, { memo, useState, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Users, Globe, Film } from 'lucide-react';
import { FESTIVALS } from '../../../mock';
import type { Set } from '../../../types';

interface SetCardProps {
  set: Set;
  index: number;
}

/**
 * SetCard — Typographic minimalist canvas for a micro-community.
 */
export const SetCard = memo(function SetCard({ set, index }: SetCardProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const festival = set.activeFestivalId ? FESTIVALS.find(f => f.id === set.activeFestivalId) : null;
  const hasFestival = !!festival;

  const memberCount = set.members.length;
  const festivalCount = FESTIVALS.filter(f => f.setId === set.id).length;
  const globalPresence = ((set.id.length * 17 + memberCount * 43) % 80) + 20;
  const worksCount = ((set.id.length * 31 + memberCount * 7) % 150) + 12;

  const gradientId = `setCardGradient-${useId()}`;
  const accentColor = set.accentColor || '#ffffff';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => setIsExpanded(!isExpanded)}
      className="group cursor-pointer bg-[#030303] border border-white/[0.04] rounded-2xl overflow-hidden transition-colors hover:border-white/10 hover:bg-[#080808]"
      aria-label={`Set: ${set.title}`}
    >
      {/* Canvas — 16:9 purely typographic */}
      <div className="relative w-full aspect-video overflow-hidden flex flex-col justify-between">
        {/* Subtle background based on accent color (glow removed) */}

        {/* Top-right CTA */}
        <button
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-black transition-all duration-300 active:scale-95"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/sets/${set.id}`);
          }}
          aria-label={`Enter ${set.title}`}
        >
          <ArrowRight className="w-3.5 h-3.5 text-white/60 group-hover:text-black transition-colors" />
        </button>

        {/* Top-left Indicator for Live Festival */}
        {hasFestival && (
          <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/70">
               {festival.title}
             </span>
          </div>
        )}

        {/* Massive SVG Typography Container */}
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center px-6 relative z-10 pointer-events-none">
          <svg
            className="w-full transition-transform duration-700 group-hover:scale-105"
            viewBox="0 0 1000 200"
            preserveAspectRatio="xMidYMid meet"
          >
            <text
              x="500"
              y="150"
              fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              fontSize="160"
              fontWeight="900"
              fill={accentColor}
              textAnchor="middle"
              textLength="900"
              lengthAdjust="spacingAndGlyphs"
              className="uppercase select-none drop-shadow-2xl"
            >
              {set.title}
            </text>
          </svg>
          
          {/* Statement / Theme Line on the front */}
          {set.themeLine && (
            <p className="text-[10px] md:text-[11px] font-medium italic text-white/50 tracking-[0.2em] uppercase mt-[-10px] md:mt-[-15px] transition-all duration-700 group-hover:text-white/80 group-hover:scale-105 text-center px-4">
              "{set.themeLine}"
            </p>
          )}
        </div>

        {/* Bottom subtle stats row */}
        <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between z-10">
           <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
             {memberCount} Members
           </span>
           <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
             {worksCount} Works
           </span>
        </div>
      </div>

      {/* Expandable Detail Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 pt-2 space-y-5 bg-surface-deep">
              {/* Description */}
              <p className="text-[11px] text-white/50 leading-relaxed max-w-lg">
                {set.description}
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-white/20" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                    {memberCount}
                  </span>
                </div>

                <div className="h-3 w-px bg-white/10" />

                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-white/20" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                    {festivalCount}
                  </span>
                </div>

                <div className="h-3 w-px bg-white/10" />

                <div className="flex items-center gap-2">
                  <Film className="w-3.5 h-3.5 text-white/20" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                    {worksCount}
                  </span>
                </div>

                <div className="h-3 w-px bg-white/10" />

                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-white/20" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                    {globalPresence}
                  </span>
                </div>
              </div>



              {/* Blended Enter Action */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/sets/${set.id}`);
                }}
                className="w-full flex items-center justify-between pt-5 border-t border-white/[0.02] group/btn"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">
                  ENTER SET 
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white transition-colors" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
});
