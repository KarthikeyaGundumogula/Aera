import { motion } from "motion/react";
import { Logo } from "./Logo";

interface FHLoaderProps {
  label?: string;
  className?: string;
}

export function FHLoader({ label = "Loading", className = "" }: FHLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <Logo showText={false} className="scale-[1.5]" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -inset-4 border-t-2 border-white/20 rounded-full"
        />
      </div>
      {label && (
        <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 animate-pulse text-center">
          {label}
        </p>
      )}
    </div>
  );
}
