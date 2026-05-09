import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { FESTIVALS, SETS, PROFILES_DIRECTORY } from '../../../mock';
import type { Festival } from '../../../types';

/**
 * FestivalCarousel — Zone A of /sets.
 *
 * Auto-advances every 4 seconds. Pauses on hover (desktop).
 * Swipeable left/right on mobile via motion drag.
 * No chevron buttons — gesture and auto-play only.
 *
 * Palette: Black + white only.
 */

const AUTOPLAY_INTERVAL = 4000;
const SWIPE_THRESHOLD = 60; // px drag needed to trigger slide change

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.98,
  }),
  center: { 
    x: 0, 
    opacity: 1, 
    scale: 1,
    zIndex: 1
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-20%' : '20%',
    opacity: 0,
    scale: 1.02,
    zIndex: 0,
  }),
};

interface FestivalSlideProps {
  festival: Festival;
}

const FestivalSlide = memo(function FestivalSlide({ festival }: FestivalSlideProps) {
  const hostSet = SETS.find((s) => s.id === festival.setId);

  return (
    <div className="absolute inset-0" aria-label={`Festival: ${festival.title}`}>
      {/* Cover */}
      <img
        loading="eager"
        src={festival.coverImage}
        alt={festival.title}
        className="absolute inset-0 w-full h-full object-cover object-top"
      />

      {/* Gradient — anchored for title legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

      {/* Content — bottom anchored, matches home hero layout */}
      <div className="absolute inset-0 flex flex-col justify-end px-6 sm:px-8 pb-8 pointer-events-none">
        {/* Status + host */}
        <div className="flex items-center gap-3 mb-3">
          {festival.status === 'LIVE' && (
            <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.25em] text-black bg-white rounded-sm">
              Live
            </span>
          )}
          {hostSet && (
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/38">
              {hostSet.title}
            </span>
          )}
        </div>

        {/* Title — large on mobile to match home hero energy */}
        <h2
          className="font-black text-white uppercase tracking-tighter leading-[0.85] mb-4"
          style={{
            fontSize: 'clamp(2rem, 8vw, 3rem)',
          }}
        >
          {festival.title}
        </h2>
      </div>
    </div>
  );
});

export const FestivalCarousel = memo(function FestivalCarousel() {
  const activeFestivals = FESTIVALS.filter(
    (f) => f.status === 'LIVE' || f.status === 'UPCOMING'
  );

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (nextIndex: number, dir: 1 | -1) => {
      setDirection(dir);
      setIndex(nextIndex);
    },
    []
  );

  const advance = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % activeFestivals.length);
  }, [activeFestivals.length]);

  // Auto-advance
  useEffect(() => {
    if (activeFestivals.length <= 1 || isPaused) return;
    intervalRef.current = setInterval(advance, AUTOPLAY_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [advance, isPaused, activeFestivals.length]);

  // Swipe handler — triggers when drag ends beyond threshold or velocity
  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      const { offset, velocity } = info;
      const SWIPE_VELOCITY = 400;

      if (offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY) {
        goTo((index + 1) % activeFestivals.length, 1);
      } else if (offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY) {
        goTo((index - 1 + activeFestivals.length) % activeFestivals.length, -1);
      }
    },
    [index, activeFestivals.length, goTo]
  );

  if (activeFestivals.length === 0) return null;

  return (
    <section aria-label="Festival Stage">
      {/*
        Mobile: full-bleed, no padding, no rounded corners, tall 65vh — matches home hero.
        Desktop: padded, rounded corners, capped at 420px — editorial card feel.
      */}
      <div className="md:px-8 md:mb-10">
        <div
          className={[
            'relative w-full overflow-hidden bg-black select-none',
            // Mobile: full-bleed hero — no rounding, tall
            'h-[65vh]',
            // Desktop: rounded card, fixed height
            'md:rounded-xl md:h-[420px]',
          ].join(' ')}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Animated slides */}
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={activeFestivals[index].id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 32, mass: 0.8 },
                opacity: { duration: 0.25 },
                scale: { duration: 0.4 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'pan-y' }}
            >
              <FestivalSlide festival={activeFestivals[index]} />
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators — only when multiple festivals */}
          {activeFestivals.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-30 pointer-events-none">
              {activeFestivals.map((_, i) => (
                <div
                  key={i}
                  className={`h-px transition-all duration-400 ${
                    i === index ? 'w-6 bg-white' : 'w-2 bg-white/28'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Auto-play progress bar — thin line at very bottom */}
          {activeFestivals.length > 1 && !isPaused && (
            <motion.div
              key={`progress-${index}`}
              className="absolute bottom-0 left-0 h-px bg-white/20 z-30"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: 'linear' }}
            />
          )}
        </div>
      </div>
    </section>
  );
});
