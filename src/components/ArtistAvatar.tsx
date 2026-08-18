import { useState } from "react";
import { DEFAULT_AVATAR_PLACEHOLDER } from "@/constants/placeholders";

interface ArtistAvatarProps {
  src?: string | null;
  name: string;
  variant?: string;
  size?: number;
  className?: string;
  colors?: string[];
  showTitleFallback?: boolean;
  imagePosition?: string;
}

export function ArtistAvatar({
  src,
  name,
  size = 40,
  className = "",
  showTitleFallback = false,
  imagePosition = "50% 0%",
}: ArtistAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const cleanName = name || "Artist";

  // Check if src is a real image URL
  const isRealUrl =
    src &&
    !src.startsWith("boring-avatar:") &&
    (src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("data:") ||
      src.startsWith("/"));

  const hasFullSizing = className.includes("w-full") || className.includes("h-full");
  const sizeStyle = hasFullSizing
    ? { width: "100%", height: "100%" }
    : size
    ? { width: size, height: size }
    : {};

  if (isRealUrl && !imgError) {
    return (
      <img
        src={src}
        alt={cleanName}
        onError={() => setImgError(true)}
        className={`object-cover rounded-xl ${className}`}
        style={{ ...sizeStyle, objectPosition: imagePosition }}
      />
    );
  }

  // If showing explicit title fallback mode
  if (showTitleFallback) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-black/60 border border-white/10 rounded-xl overflow-hidden p-2 text-center select-none ${className}`}
        style={sizeStyle}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/20 bg-white/10 mb-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-white">
            FH
          </span>
        </div>
        <span className="text-[8px] font-bold uppercase tracking-widest text-white/60 truncate max-w-full px-1">
          {cleanName}
        </span>
      </div>
    );
  }

  // Standard profile picture image placeholder fallback
  return (
    <img
      src={DEFAULT_AVATAR_PLACEHOLDER}
      alt={cleanName}
      className={`object-cover rounded-xl ${className}`}
      style={{ ...sizeStyle, objectPosition: imagePosition }}
    />
  );
}
