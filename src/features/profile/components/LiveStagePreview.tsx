import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Upload } from "lucide-react";
import { ProfileHero } from "../../shared/profile/ProfileHero";

function CinematicColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) {
  const [h, setH] = useState(0);
  const [s, setS] = useState(100);
  const [l, setL] = useState(50);

  const updateColor = (newH: number, newS: number, newL: number) => {
    setH(newH);
    setS(newS);
    setL(newL);
    onChange(`hsl(${newH}, ${newS}%, ${newL}%)`);
  };

  return (
    <div className="flex flex-col gap-3 w-32 md:w-40 pt-1">
      <input
        type="range"
        min="0"
        max="360"
        value={h}
        onChange={(e) => updateColor(Number(e.target.value), s, l)}
        className="w-full h-1.5 rounded-full appearance-none outline-none cursor-pointer shadow-inner [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/20"
        style={{
          background:
            "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
        }}
      />
      <input
        type="range"
        min="0"
        max="100"
        value={s}
        onChange={(e) => updateColor(h, Number(e.target.value), l)}
        className="w-full h-1.5 rounded-full appearance-none outline-none cursor-pointer shadow-inner [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/20"
        style={{
          background: `linear-gradient(to right, hsl(${h}, 0%, ${l}%), hsl(${h}, 100%, ${l}%))`,
        }}
      />
      <input
        type="range"
        min="0"
        max="100"
        value={l}
        onChange={(e) => updateColor(h, s, Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none outline-none cursor-pointer shadow-inner [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/20"
        style={{
          background: `linear-gradient(to right, #000000, hsl(${h}, ${s}%, 50%), #ffffff)`,
        }}
      />
    </div>
  );
}

interface LiveStagePreviewProps {
  username: string;
  displayName: string;
  tagline: string;
  portrait: string | null;
  imagePosition?: string;
  themeTextColor?: string;
  themeBgColor?: string;
  onTextColorChange?: (color: string) => void;
  onBgColorChange?: (color: string) => void;
  onPortraitChange?: (file: File, preview: string) => void;
  onImagePositionChange?: (position: string) => void;
}

export function LiveStagePreview({
  username,
  displayName,
  tagline,
  portrait,
  imagePosition = "50% 0%",
  themeTextColor = "#fac107",
  themeBgColor = "#0f1a42",
  onTextColorChange,
  onBgColorChange,
  onPortraitChange,
  onImagePositionChange,
}: LiveStagePreviewProps) {
  const [activePicker, setActivePicker] = useState<"text" | "bg" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onPortraitChange) {
      const preview = URL.createObjectURL(file);
      onPortraitChange(file, preview);
    }
    e.target.value = "";
  };

  return (
    <div className="w-full relative group">
      {/* Invisible backdrop to close pickers */}
      {activePicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActivePicker(null)}
        />
      )}

      <div
        className="relative h-[320px] sm:h-[380px] md:h-[480px] w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] transition-colors duration-500"
        style={{ backgroundColor: themeBgColor }}
      >
        {/* Grain Overlay */}
        <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        {/* ─── Actual Hero (Scaled Down) ─── */}
        <div className="absolute inset-0 flex justify-center overflow-hidden">
          <div className="w-full h-full scale-[0.45] md:scale-[0.58] origin-top">
            <ProfileHero
              name={displayName}
              handle={username}
              tagline={tagline}
              image={portrait || ""}
              imagePosition={imagePosition}
              theme={{ nameGradient: [themeTextColor, themeTextColor] }}
              showGradient={false}
              className="pt-12"
            />
          </div>
        </div>

        {/* HUD: VIEWFINDER Label */}
        <div className="absolute top-10 left-12 z-20 pointer-events-none">
          <span className="text-[10px] font-black uppercase tracking-[0.8em] text-white/40 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Hero
          </span>
        </div>

        {/* Viewfinder Corners */}
        <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-white/20 rounded-tl-xl" />
        <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-white/20 rounded-tr-xl" />
        <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-white/20 rounded-bl-xl" />
        <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-white/20 rounded-br-xl" />

        {/* ─── HUD CALIBRATION CONTROLS ─── */}

        {/* Vertical Slider (Pan Y) - Right Edge */}
        {onImagePositionChange && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/30 [writing-mode:vertical-rl]">
              PAN Y
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={imagePosition.split(" ")[1]?.replace("%", "") || "0"}
              onChange={(e) => {
                const x = imagePosition.split(" ")[0] || "50%";
                onImagePositionChange(`${x} ${e.target.value}%`);
              }}
              className="h-32 md:h-48 touch-none appearance-none bg-white/10 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white cursor-ns-resize"
              style={{ writingMode: "vertical-lr", direction: "rtl" }}
            />
          </div>
        )}

        {/* Horizontal Slider (Pan X) - Bottom Edge */}
        {onImagePositionChange && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/30">
              PAN X
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={imagePosition.split(" ")[0]?.replace("%", "") || "50"}
              onChange={(e) => {
                const y = imagePosition.split(" ")[1] || "0%";
                onImagePositionChange(`${e.target.value}% ${y}`);
              }}
              className="w-32 md:w-64 touch-none appearance-none bg-white/10 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white cursor-ew-resize"
            />
          </div>
        )}

        {/* HUD: Portrait Upload (Centered for Intuition) */}
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="flex flex-col items-center gap-4 group/upload pointer-events-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-transparent transition-all text-white/30 hover:text-white group-hover/upload:scale-110"
            >
              <Upload className="w-6 h-6" />
            </button>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 opacity-0 group-hover/upload:opacity-100 transition-all">
              Update Portrait
            </span>
          </div>
        </div>

        {/* HUD: Text Color (Repositioned closer to the central text) */}
        {onTextColorChange && (
          <div className="absolute top-[8%] right-[14%] md:right-[20%] z-50 flex items-center gap-4">
            <div className="relative">
              <motion.button
                animate={{ opacity: [0.6, 1, 0.6], scale: [0.95, 1, 0.95] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                onClick={() =>
                  setActivePicker(activePicker === "text" ? null : "text")
                }
                className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:border-white/50 transition-all z-10"
              >
                <div
                  className="w-4 h-4 rounded-full border border-white/40 shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                  style={{ backgroundColor: themeTextColor }}
                />
              </motion.button>
              {activePicker === "text" && (
                <div className="absolute top-12 right-0 p-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                  <CinematicColorPicker
                    value={themeTextColor}
                    onChange={onTextColorChange}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* HUD: Aura Color (Repositioned to the left edge) */}
        {onBgColorChange && (
          <div className="absolute top-[70%] left-12 z-50 flex items-center gap-4">
            <div className="relative">
              <motion.button
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                onClick={() =>
                  setActivePicker(activePicker === "bg" ? null : "bg")
                }
                className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 hover:border-white/50 transition-all z-10"
              >
                <div
                  className="w-4 h-4 rounded-full border border-white/40 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                  style={{ backgroundColor: themeBgColor }}
                />
              </motion.button>
              {activePicker === "bg" && (
                <div className="absolute bottom-12 left-0 p-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl z-50 origin-bottom-left animate-in fade-in zoom-in-95 duration-200">
                  <CinematicColorPicker
                    value={themeBgColor}
                    onChange={onBgColorChange}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Bottom Shade */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
