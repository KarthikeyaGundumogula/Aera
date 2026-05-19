import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Users, Globe, Film } from 'lucide-react';
import { FESTIVALS } from '../../../mock';
import type { Set } from '../../../types';

/**
 * SetCardTicker — Centered marquee band across the card canvas.
 *
 * Positioned absolutely at the vertical center of the 16:9 canvas.
 * Styled as a film strip with perforations.
 */
const SetCardTicker = memo(function SetCardTicker({
  tickerText,
}: {
  tickerText: string;
}) {
  const FilmEdge = () => (
    <div 
      className="w-full h-[5px] opacity-40"
      style={{
        backgroundImage: `repeating-linear-gradient(to right, 
          transparent, 
          transparent 12px, 
          rgba(255,255,255,0.15) 12px, 
          rgba(255,255,255,0.15) 12.5px, 
          transparent 12.5px, 
          transparent 21.5px, 
          rgba(255,255,255,0.15) 21.5px, 
          rgba(255,255,255,0.15) 22px
        ), repeating-linear-gradient(to right,
          transparent,
          transparent 12px,
          rgba(255,255,255,0.05) 12px,
          rgba(255,255,255,0.05) 22px
        )`,
        backgroundSize: '22px 100%'
      }}
    />
  );

  return (
    <div
      className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-10 overflow-hidden h-9 flex flex-col bg-black/40 backdrop-blur-md border-y border-white/5"
    >
      {/* 1. Top Edge Procedural */}
      <div className="pt-1 w-full">
        <FilmEdge />
      </div>
      
      {/* 2. Main Content Area */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="flex items-center gap-4 px-6">
          <div className="w-1 h-1 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.6)]" />
          
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/90 antialiased pt-0.5">
            {tickerText}
          </span>

          <div className="w-1 h-1 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.6)]" />
        </div>
      </div>

      {/* 3. Bottom Edge Procedural */}
      <div className="pb-1 w-full">
        <FilmEdge />
      </div>
    </div>
  );
});

interface SetCardProps {
  set: Set;
  index: number;
}

/**
 * SetCard — 16:9 cinematic canvas for a micro-community.
 *
 * Interaction:
 *   - Click card → expand detail panel (description, stats)
 *   - Click arrow → navigate to /sets/:id
 */
export const SetCard = memo(function SetCard({ set, index }: SetCardProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const festival = set.activeFestivalId ? FESTIVALS.find(f => f.id === set.activeFestivalId) : null;
  const hasFestival = !!festival;

  const memberCount = set.members.length;
  const festivalCount = FESTIVALS.filter(f => f.setId === set.id).length;
  // Deterministic mock stats derived from the set ID
  const globalPresence = ((set.id.length * 17 + memberCount * 43) % 80) + 20;
  const worksCount = ((set.id.length * 31 + memberCount * 7) % 150) + 12;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => setIsExpanded(!isExpanded)}
      className="group cursor-pointer bg-[#0a0a0a] border border-white/[0.05] rounded-lg overflow-hidden transition-colors hover:border-white/10"
      aria-label={`Set: ${set.title}`}
    >
      {/* Canvas — 16:9 */}
      <div className="relative w-full aspect-video overflow-hidden">
        {/* 1. Cover image */}
        <img
          loading={index < 2 ? 'eager' : 'lazy'}
          src={set.coverImage}
          alt={set.title}
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
        />

        {/* 2. Cinematic gradient — transitions into the panel background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent pointer-events-none" />

        {/* 3. Top-right CTA — Arrow navigates to set page */}
        <button
          className="absolute top-2 right-2 z-20 p-1"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/sets/${set.id}`);
          }}
          aria-label={`Enter ${set.title}`}
        >
          <ArrowRight className="w-5 h-5 text-white" />
        </button>

        {/* 4. Centered ticker — only when festival is live */}
        {hasFestival && (
          <SetCardTicker tickerText={festival.title} />
        )}

        {/* 5. Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12">
          <h3
            className="font-black text-white uppercase tracking-tighter leading-none mb-1"
            style={{ fontSize: 'clamp(1rem, 2.2vw, 1.45rem)' }}
          >
            {set.title}
          </h3>
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
            <div className="px-5 pb-6 pt-2 space-y-4">
              {/* Description */}
              <p className="text-[11px] text-white/50 leading-relaxed">
                {set.description}
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-white/25" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                    {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
                  </span>
                </div>

                <div className="h-3 w-px bg-white/8" />

                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-white/25" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                    {festivalCount} {festivalCount === 1 ? 'Festival' : 'Festivals'}
                  </span>
                </div>

                <div className="h-3 w-px bg-white/8" />

                <div className="flex items-center gap-2">
                  <Film className="w-3.5 h-3.5 text-white/25" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                    {worksCount} Works
                  </span>
                </div>

                <div className="h-3 w-px bg-white/8" />

                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-white/25" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                    {globalPresence} Global Presence
                  </span>
                </div>
              </div>

              {/* Theme Line */}
              {set.themeLine && (
                <p className="text-[9px] font-medium italic text-white/20 tracking-wider">
                  "{set.themeLine}"
                </p>
              )}

              {/* Blended Enter Action */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/sets/${set.id}`);
                }}
                className="w-full flex items-center justify-between pt-4 border-t border-white/[0.04] group/btn"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 group-hover:text-white transition-colors">
                  EXPLORE {set.title}'s .. 
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
});
