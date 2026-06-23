import React from "react";

interface ResonanceBarsProps {
  score: number;
  highestScore: number;
  size?: "sm" | "md" | "lg";
  colorVariant?: "white" | "amber" | "emerald";
  className?: string;
}

export function ResonanceBars({
  score,
  highestScore,
  size = "sm",
  colorVariant = "white",
  className = "",
}: ResonanceBarsProps) {
  const ratio = Math.min(score / highestScore, 1);

  // Define sizing presets (6 heights now)
  const sizeConfig = {
    sm: {
      width: 2.5,
      heights: [6, 8, 10, 12, 14, 16],
      gap: 1.5,
      activeShadow: "0 0 4px",
      peakShadow: "0 0 8px",
    },
    md: {
      width: 3.2,
      heights: [7, 10, 13, 16, 19, 22],
      gap: 2,
      activeShadow: "0 0 6px",
      peakShadow: "0 0 10px",
    },
    lg: {
      width: 4.5,
      heights: [9, 13.5, 18, 22.5, 27, 31.5],
      gap: 2.5,
      activeShadow: "0 0 8px",
      peakShadow: "0 0 14px",
    },
  }[size];

  // Define global fallback color presets
  const colorConfig = {
    white: {
      fill: "#FFFFFF",
      shadowColor: "rgba(255,255,255,0.4)",
    },
    amber: {
      fill: "#F59E0B", // Fallback, but overriden by escalating scheme
      shadowColor: "rgba(245,158,11,0.5)",
    },
    emerald: {
      fill: "#10B981",
      shadowColor: "rgba(16,185,129,0.4)",
    }
  }[colorVariant];

  // Escalating Amber Scheme
  const amberColors = [
    "#E7E5E4", // Bar 1: Dim white
    "#FEF3C7", // Bar 2: Amber 100
    "#FDE68A", // Bar 3: Amber 200
    "#FCD34D", // Bar 4: Amber 300
    "#F59E0B", // Bar 5: Amber 500 (Peak)
    "#EF4444", // Bar 6: Cinematic Red (Overdrive)
  ];
  const amberShadows = [
    "rgba(231,229,228,0.4)",
    "rgba(254,243,199,0.4)",
    "rgba(253,230,138,0.4)",
    "rgba(252,211,77,0.4)",
    "rgba(245,158,11,0.6)",
    "rgba(239,68,68,0.8)", // Red glow
  ];

  return (
    <div
      className={`flex items-end shrink-0 ${className}`}
      style={{ gap: `${sizeConfig.gap}px` }}
    >
      {[0, 1, 2, 3, 4, 5].map((i) => {
        if (i === 5 && score <= highestScore) return null;

        let fillPct = 0;
        
        if (i < 5) {
          // Bars 1-5 represent 0 to highestScore (each 20%)
          const chunkStart = i * 0.2;
          const chunkEnd = (i + 1) * 0.2;
          if (ratio >= chunkEnd) fillPct = 1;
          else if (ratio > chunkStart) fillPct = (ratio - chunkStart) / 0.2;
        } else {
          // Bar 6 is the Peak Bar (beyond highestScore)
          const overRatio = Math.max(0, (score - highestScore) / highestScore);
          fillPct = Math.min(overRatio / 0.2, 1);
        }
        
        const maxHeight = sizeConfig.heights[i];
        
        let barFillColor = colorConfig.fill;
        let barShadowColor = colorConfig.shadowColor;
        let shadowSize = sizeConfig.activeShadow;

        if (colorVariant === "amber") {
          barFillColor = amberColors[i];
          barShadowColor = amberShadows[i];
          if (i === 5) {
            shadowSize = sizeConfig.peakShadow;
          }
        }

        return (
          <div
            key={i}
            className="relative rounded-[1px] bg-[#27272A] overflow-hidden"
            style={{ width: `${sizeConfig.width}px`, height: `${maxHeight}px` }}
          >
            <div
              className="absolute bottom-0 left-0 w-full rounded-[1px] transition-all duration-300"
              style={{
                height: `${fillPct * 100}%`,
                backgroundColor: barFillColor,
                boxShadow: fillPct > 0 ? `${shadowSize} ${barShadowColor}` : "none",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
