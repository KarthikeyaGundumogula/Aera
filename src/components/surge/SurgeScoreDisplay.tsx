import { SurgeBars } from "../SurgeBars";

const PEAK_CROSSED_LINES = [
  "Rewrote the Peak",
  "New Peak Experience",
  "Changed the Ceiling",
  "Peak Transcended",
  "Beyond the Snapshot",
];

interface SurgeScoreDisplayProps {
  /** The user's surge score */
  surgeScore: number;
  /** The snapshot peak at time of watching */
  peakSnapshot: number;
  /** The current live peak (shown in brackets) */
  currentPeakScore?: number;
  /** Controls the size of the percentage number and bars */
  size?: "sm" | "lg";
  /** Optional label rendered below the ratio line */
  label?: string;
}

/**
 * Read-only display of a surge score.
 * Shows percentage (uncapped, goes beyond 100%), ratio, current peak bracket,
 * peak-crossed badge, and SurgeBars — all driven from a single source of truth.
 */
export function SurgeScoreDisplay({
  surgeScore,
  peakSnapshot,
  currentPeakScore,
  size = "lg",
  label,
}: SurgeScoreDisplayProps) {
  const effectivePeak = peakSnapshot || 1000;
  const pct = effectivePeak > 0 ? Math.round((surgeScore / effectivePeak) * 100) : 0;
  const peakCrossed = surgeScore >= effectivePeak;
  const peakLine =
    PEAK_CROSSED_LINES[Math.abs(Math.round(surgeScore)) % PEAK_CROSSED_LINES.length];

  const pctClass =
    size === "lg"
      ? "text-[72px] font-black leading-none tracking-tighter"
      : "text-[40px] font-black leading-none tracking-tighter tabular-nums";

  const ratioClass =
    size === "lg"
      ? "text-[18px] font-bold text-white/40 tracking-tight font-mono"
      : "text-[10px] font-mono font-bold text-white/40";

  const barsSize = size === "lg" ? "lg" : "xl";

  return (
    <div className="flex items-center justify-between">
      {/* Left: number + ratio + badge */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className={pctClass} style={{ color: "#EF4444" }}>
            {pct}%
          </span>
          <span className={ratioClass}>
            {surgeScore.toLocaleString()} / {effectivePeak.toLocaleString()}
            {currentPeakScore ? (
              <span className="text-amber-400/80 font-mono text-[10px] ml-1.5 lowercase">
                [{currentPeakScore.toLocaleString()}]
              </span>
            ) : null}
          </span>
        </div>

        {peakCrossed && (
          <span
            className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-400"
            style={{ textShadow: "0 0 8px rgba(52,211,153,0.6)" }}
          >
            ↑ {peakLine}
          </span>
        )}

        {label && (
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mt-1">
            {label}
          </p>
        )}
      </div>

      {/* Right: bars */}
      <div className="flex items-center shrink-0" style={{ height: size === "lg" ? 40 : 40 }}>
        <SurgeBars
          score={surgeScore}
          highestScore={effectivePeak}
          colorVariant="amber"
          size={barsSize}
        />
      </div>
    </div>
  );
}
