import React from "react";
import { Share2 } from "lucide-react";
import { ActionProps, getActionClasses, handleActionClick } from "./utils";

export const ShareAction: React.FC<ActionProps> = ({ isActive, onClick, variant = "feed", className = "" }) => {
  const isFeed = variant === "feed";
  
  const activeClasses = isFeed 
    ? "text-white bg-white/[0.12]"
    : "border-white/30 bg-white/10 text-white";
    
  const idleClasses = isFeed
    ? "text-white/30 hover:text-white/90 hover:bg-white/[0.06]"
    : "border-white/8 bg-white/3 text-white/40 hover:text-white/80 hover:bg-white/10";
    
  const actionHandler = handleActionClick(onClick);
  const classes = getActionClasses(variant, isActive, activeClasses, idleClasses, className);

  return (
    <button onPointerDown={(e) => e.stopPropagation()} onClick={actionHandler} className={classes}>
      <Share2
        className={isFeed ? "w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" : "w-[13px] h-[13px] shrink-0"}
        fill={isActive ? "currentColor" : "none"}
      />
      <span className={isFeed ? "hidden sm:inline" : "text-[11px] font-bold"}>
        {isActive ? "Shared" : "Share"}
      </span>
    </button>
  );
};
