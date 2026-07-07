import React from "react";
import { HonourIcon } from "../icons/HonourIcon";
import { ActionProps, getActionClasses, handleActionClick } from "./utils";

export const HonourAction: React.FC<ActionProps & { isHonouring?: boolean }> = ({ 
  isActive, 
  onClick, 
  count, 
  variant = "exhibition", 
  className = "",
  isHonouring = false
}) => {
  const isFeed = variant === "feed";
  
  const activeClasses = isFeed 
    ? "bg-[#E11D48]/10 text-[#E11D48] shadow-[0_0_14px_rgba(225,29,72,0.16)]"
    : "border-[#E11D48]/30 bg-[#E11D48]/10 text-[#E11D48]";
    
  const idleClasses = isFeed
    ? "text-white/30 hover:text-white/90 hover:bg-white/[0.06]"
    : "border-white/8 bg-white/3 text-white/40 hover:text-white/80 hover:bg-white/10";
    
  const actionHandler = handleActionClick(onClick);
  const classes = getActionClasses(variant, isActive, activeClasses, idleClasses, className);
  const style = isActive ? { boxShadow: "0 0 16px rgba(225,29,72,0.15)" } : undefined;

  return (
    <button onPointerDown={(e) => e.stopPropagation()} onClick={actionHandler} className={classes} style={style} aria-label={isActive ? "Remove honour" : "Honour this work"}>
      <HonourIcon
        size={isFeed ? 14 : 13}
        filled={isActive}
        style={{
          transform: isHonouring ? "scale(1.4)" : "scale(1)",
          transition: isHonouring
            ? "transform 90ms cubic-bezier(0.23,1,0.32,1)"
            : "transform 320ms cubic-bezier(0.23,1,0.32,1)",
        }}
      />
      {isFeed ? (
        <span className="hidden sm:inline">{isActive ? "Honoured" : "Honour"}</span>
      ) : (
        <span className="text-[11px] font-bold">
          {count ?? (isActive ? "Honoured" : "Honour")}
        </span>
      )}
    </button>
  );
};
