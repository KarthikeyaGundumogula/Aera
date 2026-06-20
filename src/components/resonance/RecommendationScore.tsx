import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { Info } from "lucide-react";

const AMBER      = "#D97706";
const AMBER_DIM  = "rgba(217,119,6,0.12)";
const AMBER_GLOW = "rgba(217,119,6,0.30)";

const VISUAL_MAX = 5000;
const TICK_MS    = 16;

function lerpRGB(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number, t: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `rgb(${clamp(r1 + (r2 - r1) * t)},${clamp(g1 + (g2 - g1) * t)},${clamp(b1 + (b2 - b1) * t)})`;
}

function scoreRatioToColor(ratio: number): string {
  if (ratio <= 0)   return "rgba(255,255,255,0.30)";
  if (ratio <= 0.3) return lerpRGB(200, 200, 200, 255, 255, 255,          ratio / 0.3);
  if (ratio <= 0.6) return lerpRGB(255, 255, 255,  255, 220, 140, (ratio - 0.3) / 0.3);
  if (ratio <= 1.0) return lerpRGB(255, 220, 140,  217, 119,   6, (ratio - 0.6) / 0.4);
  return lerpRGB(217, 119, 6, 245, 158, 11, Math.min((ratio - 1) * 2, 1));
}

interface RecommendationScoreProps {
  score: number;
  onChange: (score: number) => void;
  onPeakFlash?: () => void;
}

export function RecommendationScore({ score, onChange, onPeakFlash }: RecommendationScoreProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [showScoreTooltip, setShowScoreTooltip] = useState(false);

  const holdStartRef = useRef<number>(0);
  const rafRef       = useRef<number | null>(null);
  const scoreRef     = useRef<number>(score);

  const shakeX = useMotionValue(0);
  const springX = useSpring(shakeX, { stiffness: 600, damping: 8 });

  const scoreColorMV = useMotionValue("rgba(255,255,255,0.30)");
  const glowRadiusMV = useMotionValue(0);
  const glowAlphaMV  = useMotionValue(0);
  const glowShadow   = useTransform(
    [glowRadiusMV, glowAlphaMV],
    ([r, a]: number[]) => r > 0 ? `0 0 ${Math.round(r)}px rgba(217,119,6,${a.toFixed(2)})` : "none"
  );

  // Sync internal refs if parent changes score directly (e.g., reset)
  useEffect(() => {
    scoreRef.current = score;
    const ratio = score / VISUAL_MAX;
    scoreColorMV.set(scoreRatioToColor(ratio));
    const glowT = ratio < 0.5 ? 0 : Math.min((ratio - 0.5) / 0.5, 1);
    glowRadiusMV.set(glowT * 48);
    glowAlphaMV.set(glowT * 0.65);
  }, [score, scoreColorMV, glowRadiusMV, glowAlphaMV]);

  const stopHold = useCallback(() => {
    setIsHolding(false);
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    shakeX.set(0);

    // Round to nearest 10 on release for cleaner UI
    if (scoreRef.current > 0) {
      const snapped = Math.round(scoreRef.current / 10) * 10;
      scoreRef.current = snapped;
      onChange(snapped);
    }
  }, [shakeX, onChange]);

  const startHold = useCallback(() => {
    setIsHolding(true);
    holdStartRef.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const holdDuration = (now - holdStartRef.current) / 1000; // in seconds
      
      // Fast, constantly accelerating rate. NO breaks, NO slowing down.
      const rate = 3000 + (1500 * holdDuration) + (500 * Math.pow(holdDuration, 2));
      
      const increment = (rate * TICK_MS) / 1000;
      scoreRef.current += increment;
      const rounded = Math.round(scoreRef.current);
      onChange(rounded);

      const ratio = rounded / VISUAL_MAX;
      scoreColorMV.set(scoreRatioToColor(ratio));
      const glowT = ratio < 0.5 ? 0 : Math.min((ratio - 0.5) / 0.5, 1);
      glowRadiusMV.set(glowT * 48);
      glowAlphaMV.set(glowT * 0.65);

      if (ratio >= 0.7) {
        const intensity = Math.min((ratio - 0.7) / 0.3, 1) * 6;
        shakeX.set((Math.random() - 0.5) * intensity * 2);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [shakeX, scoreColorMV, glowRadiusMV, glowAlphaMV, onChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startHold();
  }, [startHold]);

  const handlePointerUp = useCallback(() => stopHold(), [stopHold]);

  const handleScrub = useCallback((newScore: number) => {
    if (isHolding) return;
    onChange(newScore);
    scoreRef.current = newScore;

    const ratio = newScore / VISUAL_MAX;
    scoreColorMV.set(scoreRatioToColor(ratio));
    const glowT = ratio < 0.5 ? 0 : Math.min((ratio - 0.5) / 0.5, 1);
    glowRadiusMV.set(glowT * 48);
    glowAlphaMV.set(glowT * 0.65);

    if (ratio >= 0.7 && ratio <= 1.0) {
      const intensity = Math.min((ratio - 0.7) / 0.3, 1) * 6;
      shakeX.set((Math.random() - 0.5) * intensity * 2);
    } else {
      shakeX.set(0);
    }
  }, [isHolding, shakeX, scoreColorMV, glowRadiusMV, glowAlphaMV, onChange]);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div className="flex flex-col">
      {/* Top Row: Label & Reset & Score Number */}
      <div className="flex items-end justify-between mb-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">
              Score
            </span>
            <div 
              className="relative flex items-center"
              onMouseEnter={() => setShowScoreTooltip(true)}
              onMouseLeave={() => setShowScoreTooltip(false)}
              onClick={(e) => { e.stopPropagation(); setShowScoreTooltip(!showScoreTooltip); }}
            >
              <Info className={`w-3 h-3 transition-colors cursor-help ${showScoreTooltip ? "text-[#D97706]" : "text-white/15"}`} />
              
              <div 
                className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-[220px] p-2 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg shadow-xl text-[10px] text-white/80 leading-relaxed pointer-events-none transition-all duration-200 origin-bottom z-[250] ${showScoreTooltip ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]"}`}
              >
                Give your personal rating to the experience you had with no boundaries go bonkers
              </div>
            </div>
          </div>
          <div className="h-[12px]">
            <AnimatePresence>
              {score > 0 && (
                <motion.button
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  onClick={() => { stopHold(); onChange(0); }}
                  className="text-[8px] uppercase tracking-[0.2em] text-white/15 hover:text-white/40 transition-colors focus:outline-none text-left"
                >
                  Reset
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Score Number (Top Right) */}
        <div className="flex items-end justify-end h-[32px] pb-1">
          <motion.div style={{ x: springX }}>
            <motion.span
              className="text-3xl font-black tracking-tighter leading-none"
              style={{
                fontVariantNumeric: "tabular-nums",
                color: scoreColorMV,
                textShadow: glowShadow,
              }}
            >
              {score === 0 ? "—" : score.toString()}
            </motion.span>
          </motion.div>
        </div>
      </div>

      {/* Middle Row: Visual Bars (Centered) */}
      <div className="flex items-end justify-center gap-[4px] h-[50px] pb-2 relative group touch-none mb-4 w-full">
        <input
          type="range"
          min={0}
          max={VISUAL_MAX * 1.5}
          value={score}
          onChange={(e) => handleScrub(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
          style={{ touchAction: "none" }}
        />

        <AnimatePresence>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            if (i === 5 && score <= VISUAL_MAX) return null;

            const heights = [20, 26, 32, 38, 44, 50];
            const colors = [
              "#E7E5E4", // dim_white
              "#FDE68A", // light_amber_1
              "#FCD34D", // medium_amber
              "#F59E0B", // deep_amber
              "#D97706", // ultra_deep_burnt_amber
              "#F59E0B", // max_glowing_amber (Peak)
            ];
            const shadows = [
              "rgba(231,229,228,0.4)",
              "rgba(253,230,138,0.4)",
              "rgba(252,211,77,0.4)",
              "rgba(245,158,11,0.5)",
              "rgba(217,119,6,0.6)",
              "rgba(245,158,11,0.8)",
            ];

            let fillPct = 0;
            if (i < 5) {
              const chunkStart = i * 0.2;
              const chunkEnd = (i + 1) * 0.2;
              const ratio = score / VISUAL_MAX;
              if (ratio >= chunkEnd) fillPct = 1;
              else if (ratio > chunkStart) fillPct = (ratio - chunkStart) / 0.2;
            } else {
              const overRatio = (score - VISUAL_MAX) / VISUAL_MAX;
              fillPct = Math.min(overRatio / 0.2, 1);
            }

            const isPeak = i === 5;
            const barHeight = heights[i];
            const glowSize = isPeak ? 10 + fillPct * 12 : 10;

            return (
              <motion.div
                key={i}
                initial={isPeak ? { opacity: 0, height: 6 } : false}
                animate={isPeak ? { opacity: 1, height: barHeight } : false}
                exit={isPeak ? { opacity: 0, height: 6 } : undefined}
                className={`relative w-[8px] rounded-[2px] bg-[#27272A] overflow-hidden transition-all duration-300 group-hover:bg-[#27272A]/80 ${isPeak ? 'ml-[4px]' : ''}`}
                style={!isPeak ? { height: `${barHeight}px` } : undefined}
              >
                <div
                  className="absolute bottom-0 left-0 w-full rounded-[2px] transition-all duration-[50ms]"
                  style={{
                    height: `${fillPct * 100}%`,
                    backgroundColor: colors[i],
                    boxShadow: fillPct > 0 ? `0 0 ${glowSize}px ${shadows[i]}` : "none",
                  }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <motion.button
        id="recommendation-score-hold-btn"
        aria-label="Hold to set recommendation score"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        whileTap={{ scale: 0.97 }}
        className="relative w-full h-16 rounded-xl overflow-hidden focus-visible:outline-none touch-none select-none"
        style={{
          WebkitTapHighlightColor: "transparent",
          boxShadow: isHolding
            ? `0 0 0 1px ${AMBER}55, inset 0 0 32px ${AMBER_DIM}`
            : "0 0 0 1px rgba(255,255,255,0.06)",
          transition: "box-shadow 0.25s ease",
          x: springX,
        }}
      >
        <motion.div
          className="absolute inset-0 origin-left"
          animate={{ scaleX: isHolding ? 1 : 0, opacity: isHolding ? 1 : 0 }}
          transition={{
            scaleX: { duration: 0.15, ease: [0.23, 1, 0.32, 1] },
            opacity: { duration: 0.1 },
          }}
          style={{ background: `linear-gradient(90deg, ${AMBER_DIM} 0%, transparent 100%)` }}
          aria-hidden
        />

        <div className="relative flex items-center justify-center gap-2.5 h-full">
          <motion.span
            className="text-[11px] font-black uppercase tracking-[0.3em]"
            style={{
              color: isHolding ? (scoreColorMV as MotionValue<string>) : "rgba(255,255,255,0.2)",
              transition: "color 0.2s ease",
              textShadow: isHolding ? glowShadow : "none",
            }}
          >
            {isHolding ? "Scoring…" : "Set Score"}
          </motion.span>

          {isHolding && (
            <span className="relative flex h-2 w-2" aria-hidden>
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                style={{ backgroundColor: AMBER }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: AMBER }}
              />
            </span>
          )}
        </div>
      </motion.button>
    </div>
  );
}
