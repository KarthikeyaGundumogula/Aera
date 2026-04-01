import { motion } from "motion/react";

interface LogoProps {
  onClick?: () => void;
  className?: string;
  showText?: boolean;
}

export function Logo({ onClick, className = "", showText = true }: LogoProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-2 md:gap-3 cursor-pointer group ${className}`}
    >
      <div className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/6 shadow-xl transition-transform group-hover:-rotate-3 md:h-9 md:w-9">
        <div className="absolute inset-[3px] rounded-[9px] border border-white/10" />
        <div className="relative flex items-center gap-[2px] text-[9px] font-black uppercase tracking-tight text-white md:text-[11px]">
          <span>F</span>
          <span className="text-white/45">H</span>
        </div>
      </div>
      {showText && (
        <h1 className="text-sm md:text-xl font-bold tracking-[0.16em] text-white">
          FrameHouse
        </h1>
      )}
    </motion.div>
  );
}
