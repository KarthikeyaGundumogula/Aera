import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { Infinity as InfinityIcon } from "lucide-react";

const AMBER      = "#D97706";
const AMBER_DIM  = "rgba(217,119,6,0.12)";
const AMBER_GLOW = "rgba(217,119,6,0.30)";

const USER_LAST_PEAK = 4200;
const TICK_MS        = 16;

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
  const [hasPeaked, setHasPeaked] = useState(score >= USER_LAST_PEAK);

  const holdStartRef = useRef<number>(0);
  const rafRef       = useRef<number | null>(null);
  const scoreRef     = useRef<number>(score);
  const hasPeakedRef = useRef<boolean>(score >= USER_LAST_PEAK);

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
    const ratio = score / USER_LAST_PEAK;
    scoreColorMV.set(scoreRatioToColor(ratio));
    const glowT = ratio < 0.5 ? 0 : Math.min((ratio - 0.5) / 0.5, 1);
    glowRadiusMV.set(glowT * 48);
    glowAlphaMV.set(glowT * 0.65);
    
    if (score < USER_LAST_PEAK) {
      hasPeakedRef.current = false;
      setHasPeaked(false);
    } else {
      hasPeakedRef.current = true;
      setHasPeaked(true);
    }
  }, [score, scoreColorMV, glowRadiusMV, glowAlphaMV]);

  const stopHold = useCallback(() => {
    setIsHolding(false);
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    shakeX.set(0);
  }, [shakeX]);

  const startHold = useCallback(() => {
    setIsHolding(true);
    holdStartRef.current = performance.now();

    const tick = () => {
      const currentRatio = scoreRef.current / USER_LAST_PEAK;
      let rate = 0;
      if (currentRatio < 0.6) {
        const progress = currentRatio / 0.6;
        rate = 3500 * (1 - Math.pow(progress, 2)) + 400;
      } else {
        const tensionProgress = (currentRatio - 0.6) / 0.6;
        rate = 400 * Math.pow(1.6, tensionProgress * 5);
      }
      
      const increment = (rate * TICK_MS) / 1000;
      scoreRef.current += increment;
      const rounded = Math.round(scoreRef.current);
      onChange(rounded);

      const ratio = rounded / USER_LAST_PEAK;
      scoreColorMV.set(scoreRatioToColor(ratio));
      const glowT = ratio < 0.5 ? 0 : Math.min((ratio - 0.5) / 0.5, 1);
      glowRadiusMV.set(glowT * 48);
      glowAlphaMV.set(glowT * 0.65);

      if (ratio >= 0.7) {
        const intensity = Math.min((ratio - 0.7) / 0.3, 1) * 6;
        shakeX.set((Math.random() - 0.5) * intensity * 2);
      }

      if (!hasPeakedRef.current && rounded >= USER_LAST_PEAK) {
        hasPeakedRef.current = true;
        setHasPeaked(true);
        if (onPeakFlash) onPeakFlash();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [shakeX, scoreColorMV, glowRadiusMV, glowAlphaMV, onChange, onPeakFlash]);

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

    const ratio = newScore / USER_LAST_PEAK;
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

    if (!hasPeakedRef.current && newScore >= USER_LAST_PEAK) {
      hasPeakedRef.current = true;
      setHasPeaked(true);
      if (onPeakFlash) onPeakFlash();
    } else if (newScore < USER_LAST_PEAK) {
      hasPeakedRef.current = false;
      setHasPeaked(false);
    }
  }, [isHolding, shakeX, scoreColorMV, glowRadiusMV, glowAlphaMV, onChange, onPeakFlash]);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">
          Recommendation Score
        </span>
        {score > 0 && (
          <button
            onClick={() => { stopHold(); onChange(0); }}
            className="text-[9px] uppercase tracking-[0.2em] text-white/15 hover:text-white/40 transition-colors focus:outline-none"
          >
            Reset
          </button>
        )}
      </div>

      <motion.div style={{ x: springX }} className="flex items-center w-full mb-4 mt-1">
        <div className="w-1/2 flex items-baseline gap-3">
          <motion.span
            className="text-4xl font-black tracking-tighter leading-none"
            style={{
              fontVariantNumeric: "tabular-nums",
              color: scoreColorMV,
              textShadow: glowShadow,
            }}
          >
            {score === 0 ? "—" : score.toString()}
          </motion.span>

          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] uppercase tracking-[0.2em] text-white/20 font-medium">
              Your peak
            </span>
            <div className="flex items-center gap-1.5">
              <InfinityIcon 
                className="w-3 h-3" 
                style={{ 
                  color: hasPeaked ? `${AMBER}55` : "rgba(255,255,255,0.15)",
                  transition: "color 0.4s ease"
                }} 
              />
              <span
                className="text-sm font-semibold tabular-nums"
                style={{
                  color: hasPeaked ? `${AMBER}55` : "rgba(255,255,255,0.15)",
                  textDecoration: hasPeaked ? "line-through" : "none",
                  transition: "color 0.4s ease, text-decoration 0.3s ease",
                }}
              >
                {USER_LAST_PEAK}
              </span>
            </div>
          </div>
        </div>

        <div className="w-1/2 flex items-end justify-center gap-[4px] h-[44px] pb-1 relative group touch-none">
          <input
            type="range"
            min={0}
            max={USER_LAST_PEAK * 1.25}
            value={score}
            onChange={(e) => handleScrub(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            style={{ touchAction: "none" }}
          />

          {[0, 1, 2, 3, 4].map((i) => {
            const chunkStart = i * 0.2;
            const chunkEnd = (i + 1) * 0.2;
            const ratio = score / USER_LAST_PEAK;

            let fillPct = 0;
            if (ratio >= chunkEnd) fillPct = 1;
            else if (ratio > chunkStart) fillPct = (ratio - chunkStart) / 0.2;

            const maxHeight = 12 + i * 6;

            return (
              <div
                key={i}
                className="relative w-[8px] rounded-[2px] bg-white/[0.08] overflow-hidden transition-all duration-300 group-hover:bg-white/[0.12]"
                style={{ height: `${maxHeight}px` }}
              >
                <div
                  className="absolute bottom-0 left-0 w-full rounded-[2px] transition-all duration-[50ms]"
                  style={{
                    height: `${fillPct * 100}%`,
                    backgroundColor: "#10B981",
                    boxShadow: fillPct === 1 ? `0 0 10px rgba(16, 185, 129, 0.4)` : "none",
                  }}
                />
              </div>
            );
          })}
          <AnimatePresence>
            {score > USER_LAST_PEAK && (() => {
              const overRatio = (score - USER_LAST_PEAK) / USER_LAST_PEAK;
              const fillPct = Math.min(overRatio / 0.2, 1);
              
              const r = Math.round(217 + (255 - 217) * fillPct);
              const g = Math.round(119 + (220 - 119) * fillPct);
              const b = Math.round(6 + (100 - 6) * fillPct);
              const barColor = `rgb(${r}, ${g}, ${b})`;
              const glowSize = 10 + fillPct * 12;

              return (
                <motion.div
                  initial={{ opacity: 0, height: 6 }}
                  animate={{ opacity: 1, height: 42 }}
                  exit={{ opacity: 0, height: 6 }}
                  className="relative w-[8px] rounded-[2px] bg-white/[0.08] ml-[2px] overflow-hidden transition-all duration-300 group-hover:bg-white/[0.12]"
                >
                  <div
                    className="absolute bottom-0 left-0 w-full rounded-[2px] transition-all duration-[50ms]"
                    style={{
                      height: `${fillPct * 100}%`,
                      backgroundColor: barColor,
                      boxShadow: `0 0 ${glowSize}px ${barColor}`,
                    }}
                  />
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </motion.div>

      <p className="text-[10px] text-white/20 mb-5 leading-relaxed">
        {score === 0
          ? "How strong is your recommendation? Hold to score."
          : score < USER_LAST_PEAK * 0.5
          ? "Keep going…"
          : score < USER_LAST_PEAK
          ? "Approaching your peak."
          : "You've surpassed your own peak. That's rare."}
      </p>

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
          <InfinityIcon
            className="w-4 h-4"
            style={{
              color: isHolding ? (scoreColorMV as any) : "rgba(255,255,255,0.25)",
              transition: "color 0.2s ease",
            }}
            strokeWidth={1.75}
          />
          <motion.span
            className="text-[11px] font-black uppercase tracking-[0.3em]"
            style={{
              color: isHolding ? (scoreColorMV as any) : "rgba(255,255,255,0.2)",
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
