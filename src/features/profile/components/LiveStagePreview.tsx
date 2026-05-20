import { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import { ProfileHero } from "../../shared/profile/ProfileHero";
import { CinematicColorPicker } from "../../../components/CinematicColorPicker";

interface LiveStagePreviewProps {
  username: string;
  displayName: string;
  tagline: string;
  portrait: string | null;
  imagePosition: string;
  themeTextColor: string;
  themeBgColor: string;
  onTextColorChange?: (color: string) => void;
  onBgColorChange?: (color: string) => void;
  onPortraitChange?: (file: File, preview: string) => void;
  onImagePositionChange?: (pos: string) => void;
  className?: string;
  socials?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

export function LiveStagePreview({
  username,
  displayName,
  tagline,
  portrait,
  imagePosition,
  themeTextColor,
  themeBgColor,
  onTextColorChange,
  onBgColorChange,
  onPortraitChange,
  onImagePositionChange,
  className = "",
  socials,
}: LiveStagePreviewProps) {
  const [activePicker, setActivePicker] = useState<"text" | "bg" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onPortraitChange) {
      const preview = URL.createObjectURL(file);
      onPortraitChange(file, preview);
    }
  };

  // Safe split values for the Pan coordinates
  const panX = imagePosition.split(" ")[0] || "50%";
  const panY = imagePosition.split(" ")[1] || "0%";

  return (
    <div
      className={`relative w-full rounded-[2.5rem] border border-white/10 transition-colors duration-500 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.7)] ${className}`}
      style={{ backgroundColor: themeBgColor }}
    >
      {/* Invisible backdrop to close pickers */}
      {activePicker && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setActivePicker(null)}
        />
      )}

      {/* Viewfinder Content Container */}
      <div className="relative z-20 px-6 py-12 md:px-12 md:py-16">
        {/* HUD: VIEWFINDER Label */}
        <div className="absolute top-6 left-6 md:left-10 z-20 pointer-events-none flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 drop-shadow-md">
            Hero Preview
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        </div>

        {/* Viewfinder corner lines */}
        <div className="absolute inset-4 border border-white/10 rounded-2xl pointer-events-none z-30" />
        
        {/* Actual unscaled 1:1 ProfileHero */}
        <ProfileHero
          name={displayName || "Stage Name"}
          handle={username || "stage"}
          tagline={tagline || "Your stage tagline here..."}
          image={portrait || ""}
          imagePosition={imagePosition}
          theme={{ nameGradient: [themeTextColor, themeTextColor] }}
          showGradient={false}
          hideMetrics={true}
          hideActions={true}
          onImagePositionChange={onImagePositionChange}
          socials={socials || {
            instagram: `${username || "stage"}_insta`,
            twitter: `${username || "stage"}_x`,
            youtube: `${username || "stage"}_yt`,
          }}
          className="pt-8 pb-4"
          leftFlankContent={
            onImagePositionChange && (
              <div className="flex flex-col items-center gap-2 py-4 opacity-40 hover:opacity-100 transition-opacity">
                <span className="text-[7px] font-black uppercase tracking-widest text-white/30 [writing-mode:vertical-rl] drop-shadow-md select-none">
                  PAN Y
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={panY.replace("%", "")}
                  onChange={(e) => {
                    onImagePositionChange(`${panX} ${e.target.value}%`);
                  }}
                  className="w-4 h-20 md:h-28 appearance-none bg-white/10 rounded-full outline-none cursor-ns-resize [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md touch-none"
                  style={{ WebkitAppearance: "slider-vertical" as any, accentColor: "rgba(255, 255, 255, 0.2)" }}
                />
              </div>
            )
          }
          portraitOverlay={
            onPortraitChange && (
              <div className="flex flex-col items-center gap-1 group/upload">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-black/60 border border-white/20 text-white/50 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-xl pointer-events-auto"
                  title="Upload Photo"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <span className="text-[7px] font-black uppercase tracking-wider text-white/40 opacity-0 group-hover/upload:opacity-100 transition-opacity">
                  Upload Photo
                </span>
              </div>
            )
          }
        />

        {/* Horizontal Slider (Pan X) - Bottom Overlay */}
        {onImagePositionChange && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 opacity-40 hover:opacity-100 transition-all duration-300">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/30 drop-shadow-md select-none">
              PAN X
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={panX.replace("%", "")}
              onChange={(e) => {
                onImagePositionChange(`${e.target.value}% ${panY}`);
              }}
              className="w-20 md:w-40 h-4 appearance-none bg-white/10 rounded-full outline-none cursor-ew-resize [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md touch-none"
            />
          </div>
        )}

        {/* HUD: Text Color picker */}
        {onTextColorChange && (
          <div className="absolute top-6 right-8 md:right-12 z-30 flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() =>
                  setActivePicker(activePicker === "text" ? null : "text")
                }
                className="flex items-center justify-center w-9 h-9 rounded-full bg-black/60 border border-white/20 hover:border-white/50 transition-all active:scale-95 shadow-md"
                title="Accent Text Aura"
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white/30"
                  style={{ backgroundColor: themeTextColor }}
                />
              </button>
              {activePicker === "text" && (
                <div className="absolute top-11 right-0 p-1 z-40 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                  <CinematicColorPicker
                    value={themeTextColor}
                    onChange={onTextColorChange}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* HUD: Aura Backdrop Color picker */}
        {onBgColorChange && (
          <div className="absolute top-6 right-20 md:right-24 z-30 flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() =>
                  setActivePicker(activePicker === "bg" ? null : "bg")
                }
                className="flex items-center justify-center w-9 h-9 rounded-full bg-black/60 border border-white/20 hover:border-white/50 transition-all active:scale-95 shadow-md"
                title="Aura Backdrop Color"
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white/30"
                  style={{ backgroundColor: themeBgColor }}
                />
              </button>
              {activePicker === "bg" && (
                <div className="absolute top-11 right-0 p-1 z-40 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                  <CinematicColorPicker
                    value={themeBgColor}
                    onChange={onBgColorChange}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
