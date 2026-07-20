import React from "react";
import { GroupStar as Star } from "../icons/GroupStar";
import { ActionProps, getActionClasses, handleActionClick } from "./utils";

export const StarAction: React.FC<ActionProps & { isStaring?: boolean }> = ({ 
  isActive, 
  onClick, 
  count, 
  variant = "viewer", 
  className = "",
  isStaring = false
}) => {
  const isFeed = variant === "feed";
  
  const activeClasses = isFeed 
    ? "bg-[#FFD700]/10 text-[#FFD700] shadow-[0_0_14px_rgba(255,215,0,0.16)]"
    : "border-[#FFD700]/30 bg-[#FFD700]/10 text-[#FFD700]";
    
  const idleClasses = isFeed
    ? "text-white/30 hover:text-white/90 hover:bg-white/[0.06]"
    : "border-white/8 bg-white/3 text-white/40 hover:text-white/80 hover:bg-white/10";
    
  const actionHandler = handleActionClick(onClick);
  const classes = getActionClasses(variant, isActive, activeClasses, idleClasses, className);
  const style = isActive ? { boxShadow: "0 0 16px rgba(255,215,0,0.15)" } : undefined;

  return (
    <button onPointerDown={(e) => e.stopPropagation()} onClick={actionHandler} className={classes} style={style} aria-label={isActive ? "Remove star" : "Star this work"}>
      {isActive && (
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="gold-metal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF7D6" />
              <stop offset="25%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="75%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#FFF7D6" />
            </linearGradient>
          </defs>
        </svg>
      )}
      <Star
        className={isFeed ? "w-[14px] h-[14px]" : "w-[13px] h-[13px]"}
        stroke={isActive ? "url(#gold-metal)" : "currentColor"}
        fill={isActive ? "url(#gold-metal)" : "none"}
        strokeWidth={isActive ? 1.5 : 2}
        style={{
          transform: isStaring ? "scale(1.4)" : "scale(1)",
          transition: isStaring
            ? "transform 90ms cubic-bezier(0.23,1,0.32,1)"
            : "transform 320ms cubic-bezier(0.23,1,0.32,1)",
        }}
      />
      {isFeed ? (
        <span className="hidden sm:inline">{isActive ? "Starred" : "Star"}</span>
      ) : (
        <span className="text-[11px] font-bold">
          {count ?? (isActive ? "Starred" : "Star")}
        </span>
      )}
    </button>
  );
};
