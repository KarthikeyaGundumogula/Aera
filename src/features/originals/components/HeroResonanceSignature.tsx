import { memo } from "react";
import { motion } from "motion/react";

interface ResonanceSignatureProps {
  signature?: {
    normalizedSurgeDensity: number;
    surgeSpread: "UNIVERSAL" | "DISTINCT" | "POLARIZING";
  };
}

export const HeroResonanceSignature = memo(
  ({ signature }: ResonanceSignatureProps) => {
    if (!signature) return null;

    const { normalizedSurgeDensity, surgeSpread } = signature;

    const renderBattery = (density: number) => {
      const totalBlocks = 10;
      const filledCount = Math.round(density / 10);
      const emptyCount = totalBlocks - filledCount;

      // █ = U+2588, ░ = U+2591
      const filled = "█".repeat(filledCount);
      const empty = "░".repeat(emptyCount);
      return filled + empty;
    };

    const renderSpreadPattern = (spread: string) => {
      if (spread === "POLARIZING") return "████░░████";
      if (spread === "DISTINCT") return "██░░██░░██";
      return "██████████"; // UNIVERSAL
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="mt-2 inline-block bg-black/20 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-white/5"
      >
        <div className="font-mono text-[10px] sm:text-xs tracking-widest text-white/90 grid grid-cols-[max-content_max-content_max-content] gap-x-4 sm:gap-x-6 gap-y-1.5 sm:gap-y-2 items-center drop-shadow-md">
          {/* Surge Density */}
          <div className="uppercase font-bold">Surge Density</div>
          <div className="text-amber-500/90 tracking-[0.2em] drop-shadow-[0_0_8px_rgba(245,166,35,0.4)]">
            {renderBattery(normalizedSurgeDensity)}
          </div>
          <div className="font-bold">{normalizedSurgeDensity}%</div>

          {/* Surge Spread */}
          <div className="uppercase font-bold">Surge Spread</div>
          <div className="text-amber-500/90 tracking-[0.2em] drop-shadow-[0_0_8px_rgba(245,166,35,0.4)]">
            {renderSpreadPattern(surgeSpread)}
          </div>
          <div className="uppercase font-bold">{surgeSpread}</div>
        </div>

        {/* Separating Line & Label */}
        <div className="mt-3 pt-3 border-t border-white/10 max-w-sm">
          <p className="text-[10px] sm:text-xs text-white/60 italic font-serif leading-relaxed">
            {surgeSpread === "POLARIZING" && `This film has the power to move someone to extraordinary heights. It's not for everyone, but for those it's for, it's everything.`}
            {surgeSpread === "DISTINCT" && `This film has a clear identity. Not for everyone, but deeply resonates with its specific audience.`}
            {surgeSpread === "UNIVERSAL" && `A reliable masterpiece. Almost everyone who watches this has a deeply positive experience.`}
          </p>
        </div>
      </motion.div>
    );
  },
);
