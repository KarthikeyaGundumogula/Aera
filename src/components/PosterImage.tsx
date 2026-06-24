import React, { useState } from "react";
import { Film } from "lucide-react";

interface PosterImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export function PosterImage({ src, alt, className = "" }: PosterImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={`relative flex flex-col items-center justify-center bg-[#050302] border border-white/5 overflow-hidden ${className}`}>
        {/* Subtle background glow/noise simulation */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
        
        <Film className="w-8 h-8 text-white/10 mb-2 relative z-10" strokeWidth={1} />
        
        {/* Title fallback */}
        <span className="text-[10px] font-black uppercase tracking-widest text-white/20 text-center px-2 relative z-10 leading-snug line-clamp-3">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
