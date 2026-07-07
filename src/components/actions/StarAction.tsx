import React from "react";
import { Star } from "lucide-react";
import { ActionProps, getActionClasses, handleActionClick } from "./utils";

export const StarAction: React.FC<ActionProps & { isStaring?: boolean }> = ({ 
  isActive, 
  onClick, 
  count, 
  variant = "exhibition", 
  className = "",
  isStaring = false
}) => {
  const isFeed = variant === "feed";
  
  const activeClasses = isFeed 
    ? "bg-amber-400/10 text-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.16)]"
    : "border-amber-400/30 bg-amber-400/10 text-amber-400";
    
  const idleClasses = isFeed
    ? "text-white/30 hover:text-white/90 hover:bg-white/[0.06]"
    : "border-white/8 bg-white/3 text-white/40 hover:text-white/80 hover:bg-white/10";
    
  const actionHandler = handleActionClick(onClick);
  const classes = getActionClasses(variant, isActive, activeClasses, idleClasses, className);
  const style = isActive ? { boxShadow: "0 0 16px rgba(251,191,36,0.15)" } : undefined;

  return (
    <button onPointerDown={(e) => e.stopPropagation()} onClick={actionHandler} className={classes} style={style} aria-label={isActive ? "Remove star" : "Star this work"}>
      <Star
        className={isFeed ? "w-[14px] h-[14px]" : "w-[13px] h-[13px]"}
        fill={isActive ? "currentColor" : "none"}
        strokeWidth={2}
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
