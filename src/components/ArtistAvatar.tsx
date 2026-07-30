import { useState } from "react";
import Avatar from "boring-avatars";

interface ArtistAvatarProps {
  src?: string | null;
  name: string;
  variant?: "beam" | "marble" | "pixel" | "sunset" | "bauhaus" | "ring";
  size?: number;
  className?: string;
  colors?: string[];
  showTitleFallback?: boolean;
  imagePosition?: string;
}

const DEFAULT_AVATAR_COLORS = [
  "#0f1a42",
  "#fac107",
  "#ffffff",
  "#1e293b",
  "#334155",
];

export function ArtistAvatar({
  src,
  name,
  variant = "beam",
  size = 40,
  className = "",
  colors = DEFAULT_AVATAR_COLORS,
  showTitleFallback = false,
  imagePosition = "50% 0%",
}: ArtistAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const cleanName = name || "Artist";

  // Check if src is a real external image URL (not empty, not boring-avatar seed)
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

  // If showing Framehouse Icon + Title fallback explicit mode
  if (showTitleFallback || imgError) {
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

  // Boring Avatar fallback / primary generator
  const seed = src?.startsWith("boring-avatar:")
    ? src.replace("boring-avatar:", "")
    : cleanName;

  const avatarSize = hasFullSizing ? "100%" : size || 40;

  return (
    <div
      className={`overflow-hidden rounded-xl flex items-center justify-center bg-black/40 border border-white/10 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover ${className}`}
      style={sizeStyle}
    >
      <Avatar
        size={avatarSize}
        name={seed}
        variant={variant}
        colors={colors}
        square={true}
      />
    </div>
  );
}
