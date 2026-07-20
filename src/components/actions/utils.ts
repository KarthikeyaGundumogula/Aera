import React from "react";

export type ActionVariant = "feed" | "viewer";

export interface ActionProps {
  isActive: boolean;
  onClick: (e?: any) => void;
  count?: string | number;
  variant?: ActionVariant;
  className?: string;
  style?: React.CSSProperties;
}

export function getActionClasses(
  variant: ActionVariant,
  isActive: boolean,
  activeClasses: string,
  idleClasses: string,
  extraClassName: string = ""
) {
  const isFeed = variant === "feed";
  const commonClasses = "flex items-center gap-1.5 transition-all active:scale-[0.97] focus:outline-none shrink-0";
  
  const variantClasses = isFeed
    ? "px-2 sm:px-3 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest"
    : "h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl border";
    
  const stateClasses = isActive ? activeClasses : idleClasses;
  
  return `${commonClasses} ${variantClasses} ${stateClasses} ${extraClassName}`.trim();
}

export const handleActionClick = (onClick: (e?: any) => void) => (e: any) => {
  e.preventDefault();
  e.stopPropagation();
  onClick(e);
};
