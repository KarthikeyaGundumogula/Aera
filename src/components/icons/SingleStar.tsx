import React from "react";

export function SingleStar({ 
  size = 24, 
  className = "", 
  strokeWidth = 2, 
  fill = "none", 
  stroke = "currentColor", 
  ...props 
}: React.SVGProps<SVGSVGElement> & { size?: number | string }) {
  // Lucide star points
  const starPoints = "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2";

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={fill} 
      stroke={stroke} 
      strokeWidth={strokeWidth}
      strokeLinecap="round" 
      strokeLinejoin="miter" // Sharp corners
      strokeMiterlimit={10}
      className={className}
      {...props}
    >
      <polygon points={starPoints} />
    </svg>
  );
}
