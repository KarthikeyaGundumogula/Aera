import React, { useId } from "react";

export function GroupStar({ 
  size = 24, 
  className = "", 
  strokeWidth = 2, 
  fill = "none", 
  stroke = "currentColor", 
  ...props 
}: React.SVGProps<SVGSVGElement> & { size?: number | string }) {
  // Lucide star points
  const starPoints = "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2";
  
  // Unique ID for the mask to prevent collisions if multiple GroupStars are rendered
  const maskId = useId() + "-group-star-mask";

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={fill} 
      stroke={stroke} 
      strokeWidth={strokeWidth}
      strokeLinecap="round" 
      strokeLinejoin="miter" // Sharp corners as requested
      strokeMiterlimit={10}
      overflow="visible"
      className={className}
      {...props}
    >
      <defs>
        <mask id={maskId}>
          <rect x="-10" y="-10" width="44" height="44" fill="white" />
          {/* Mask out the area where the main star sits. The stroke creates a beautiful gap between front and back stars. */}
          <polygon points={starPoints} fill="black" stroke="black" strokeWidth={2} strokeLinejoin="miter" />
        </mask>
      </defs>

      {/* Background Stars with mask applied */}
      <g mask={`url(#${maskId})`}>
        {/* Left Background Star */}
        <g transform="translate(-2, 4.2) scale(0.65)" opacity={0.7}>
          <polygon points={starPoints} />
        </g>
        {/* Right Background Star */}
        <g transform="translate(10.4, 4.2) scale(0.65)" opacity={0.7}>
          <polygon points={starPoints} />
        </g>
      </g>

      {/* Main Foreground Star */}
      <polygon points={starPoints} />
    </svg>
  );
}
