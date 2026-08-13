import React, { useState } from "react";
import { Film } from "lucide-react";

interface PosterImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  info?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "auto" | "sync";
  draggable?: boolean;
}

export function PosterImage({
  src,
  alt,
  className = "",
  info,
  loading = "lazy",
  decoding = "async",
  draggable,
}: PosterImageProps) {
  const [hasError, setHasError] = useState(false);

  const cleanSrc = src && typeof src === "string" ? src.trim() : "";
  const isInvalid = !cleanSrc || hasError;

  if (isInvalid) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-[#070503] border border-white/10 overflow-hidden select-none p-3 ${className}`}
      >
        {/* Subtle cinematic gradient and framehouse pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Framehouse Film Badge */}
        <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-white/5 mb-1.5 shadow-inner shrink-0">
          <Film className="w-3.5 h-3.5 text-white/50" strokeWidth={1.5} />
        </div>

        {/* Title fallback */}
        <span className="text-[10px] font-black uppercase tracking-wider text-white/80 text-center px-1 relative z-10 leading-tight line-clamp-2">
          {alt || "Original"}
        </span>

        {/* Info subtitle fallback */}
        {info && (
          <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#D97706]/70 text-center mt-1 relative z-10 line-clamp-1">
            {info}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={cleanSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      draggable={draggable}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

