import React, { memo, Fragment } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
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
  setId,
}: {
  tickerText: string;
  setId: string;
}) {
  // Ordered Chaos: Deterministic random delay based on ID (no useMemo needed)
  const getSeed = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };
  
  const randomDelay = -(getSeed(setId) % 40);

  // Helper to render a row of simple horizontal perforations
  const Perforations = () => (
    <div className="flex justify-around w-full px-4">
      {Array.from({ length: 20 }).map((_, i) => (
        <div 
          key={i} 
          className="w-[12px] h-[1.5px] bg-white/20 rounded-full" 
        />
      ))}
    </div>
  );

  const TickerItems = () => (
    <div className="flex items-center gap-10">
      {Array.from({ length: 12 }).map((_, i) => (
        <Fragment key={i}>
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-2.5 h-2.5 text-white/40 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/90 whitespace-nowrap">
              {tickerText}
            </span>
            <Sparkles className="w-2.5 h-2.5 text-white/40 animate-pulse" />
          </div>
          {i < 11 && <div className="w-2 h-[1.5px] bg-white/10 rounded-full" />}
        </Fragment>
      ))}
    </div>
  );

  const Separator = () => <div className="w-2 h-[1.5px] bg-white/10 rounded-full mx-10" />;

  return (
    <div
      className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-10 overflow-hidden h-10 flex items-center"
      style={{
        maskImage:
          'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
      }}
    >
      {/* 1. Transparent Strip Base — clean background */}
      <div className="absolute inset-y-1 inset-x-0 bg-black/25" />
      
      {/* 2. The Animated Content */}
      <div 
        className="animate-marquee-slow flex items-center h-full"
        style={{ animationDelay: `${randomDelay}s` }}
      >
        <div className="flex flex-col justify-between py-1.5 h-full">
          <Perforations />
          <div className="flex items-center">
            <TickerItems />
            <Separator />
          </div>
          <Perforations />
        </div>
        
        {/* Duplicate for seamless marquee */}
        <div className="flex flex-col justify-between py-1.5 h-full" aria-hidden="true">
          <Perforations />
          <div className="flex items-center">
            <TickerItems />
            <Separator />
          </div>
          <Perforations />
        </div>
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
 */
export const SetCard = memo(function SetCard({ set, index }: SetCardProps) {
  const navigate = useNavigate();
  const festival = set.activeFestivalId ? FESTIVALS.find(f => f.id === set.activeFestivalId) : null;
  const hasFestival = !!festival;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => navigate(`/sets/${set.id}`)}
      className="group cursor-pointer"
      aria-label={`Set: ${set.title}`}
    >
      {/* Canvas — 16:9 */}
      <div className="relative w-full aspect-video overflow-hidden rounded-lg">
        {/* 1. Cover image */}
        <img
          loading={index < 2 ? 'eager' : 'lazy'}
          src={set.coverImage}
          alt={set.title}
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
        />

        {/* 2. Cinematic gradient — heavy at bottom, clear at top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/15 to-transparent pointer-events-none" />

        {/* 3. Top-right CTA — Edge Right Arrow */}
        <div className="absolute top-2 right-2 z-20">
          <ArrowRight className="w-5 h-5 text-white" />
        </div>

        {/* 4. Centered ticker — only when festival is live */}
        {hasFestival && (
          <SetCardTicker tickerText={festival.title} setId={set.id} />
        )}

        {/* 5. Bottom content */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)',
          }}
        >
          <h3
            className="font-black text-white uppercase tracking-tighter leading-none mb-1"
            style={{ fontSize: 'clamp(1rem, 2.2vw, 1.45rem)' }}
          >
            {set.title}
          </h3>
        </div>

        {/* Hover ring — hairline white border */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-400 border border-white/10" />
      </div>
    </motion.article>
  );
});
