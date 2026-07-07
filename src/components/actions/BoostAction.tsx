import React from "react";
import { Zap } from "lucide-react";
import { ActionProps, getActionClasses, handleActionClick } from "./utils";

export const BoostAction: React.FC<ActionProps> = ({ isActive, onClick, variant = "feed", className = "" }) => {
  const isFeed = variant === "feed";
  
  const activeClasses = isFeed 
    ? "bg-[#B45309]/10 text-[#B45309] shadow-[0_0_14px_rgba(180,83,9,0.16)]"
    : "border-[#B45309]/30 bg-[#B45309]/10 text-[#B45309]";
    
  const idleClasses = isFeed
    ? "text-white/30 hover:text-white/90 hover:bg-white/[0.06]"
    : "border-white/8 bg-white/3 text-white/40 hover:text-white/80 hover:bg-white/10";
    
  const actionHandler = handleActionClick(onClick);
  const classes = getActionClasses(variant, isActive, activeClasses, idleClasses, className);

  return (
    <button onPointerDown={(e) => e.stopPropagation()} onClick={actionHandler} className={classes}>
      <Zap
        className={isFeed ? "w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" : "w-[13px] h-[13px] shrink-0"}
        fill={isActive ? "currentColor" : "none"}
      />
      <span className={isFeed ? "hidden sm:inline" : "text-[11px] font-bold"}>
        {isActive ? "Boosted" : "Boost"}
      </span>
    </button>
  );
};
