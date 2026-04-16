import { motion } from "motion/react";
import React from "react";

interface CreditTagProps {
  id: string;
  title: string;
  onClick: (id: string) => void;
  index: number;
}

const NEON_COLORS = ['#00E5FF', '#FFD700', '#FF4D00', '#7C4DFF', '#00FF41', '#FF00E5'];

export const CreditTag: React.FC<CreditTagProps> = ({ id, title, onClick, index }) => {
  const color = NEON_COLORS[index % NEON_COLORS.length];

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(id);
      }}
      className="relative w-fit px-3 py-1.5 bg-white/5 border rounded-full group overflow-hidden transition-all duration-300"
      style={{ 
        borderColor: `${color}44`,
        boxShadow: `0 0 10px ${color}10`
      }}
    >
      {/* Neon Hover Border */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity blur-[2px] rounded-full"
        style={{ border: `1px solid ${color}` }}
      />
      
      <div className="relative z-10 flex items-center justify-center">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">
          {title}
        </span>
      </div>
      
      {/* Background Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
        style={{ backgroundColor: color }}
      />
    </motion.button>
  );
};
