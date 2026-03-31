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
      <div className="w-6 h-6 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center transition-transform group-hover:rotate-12 shadow-xl">
        <div className="w-3 h-3 md:w-4 md:h-4 bg-black rounded-sm rotate-45" />
      </div>
      {showText && (
        <h1 className="text-sm md:text-xl font-bold tracking-[0.2em] uppercase">AERA</h1>
      )}
    </motion.div>
  );
}
