import { useState } from "react";
import { ProfileHero } from "../../shared/profile/ProfileHero";

function CinematicColorPicker({ value, onChange }: { value: string, onChange: (c: string) => void }) {
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
        type="range" min="0" max="360" value={h} 
        onChange={(e) => updateColor(Number(e.target.value), s, l)}
        className="w-full h-1.5 rounded-full appearance-none outline-none cursor-pointer shadow-inner [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/20"
        style={{ background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)' }}
      />
      <input 
        type="range" min="0" max="100" value={s} 
        onChange={(e) => updateColor(h, Number(e.target.value), l)}
        className="w-full h-1.5 rounded-full appearance-none outline-none cursor-pointer shadow-inner [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/20"
        style={{ background: `linear-gradient(to right, hsl(${h}, 0%, ${l}%), hsl(${h}, 100%, ${l}%))` }}
      />
      <input 
        type="range" min="0" max="100" value={l} 
        onChange={(e) => updateColor(h, s, Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none outline-none cursor-pointer shadow-inner [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/20"
        style={{ background: `linear-gradient(to right, #000000, hsl(${h}, ${s}%, 50%), #ffffff)` }}
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
}

export function LiveStagePreview({
  username,
  displayName,
  tagline,
  portrait,
  imagePosition,
  themeTextColor = "#ef4444",
  themeBgColor = "#050505",
  onTextColorChange,
  onBgColorChange,
}: LiveStagePreviewProps) {
  const [activePicker, setActivePicker] = useState<"text" | "bg" | null>(null);

  return (
    <div className="w-full relative">
      {/* Invisible backdrop to close pickers */}
      {activePicker && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setActivePicker(null)} 
        />
      )}

      <div 
        className="relative h-[280px] sm:h-[320px] md:h-[400px] w-full rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] group transition-colors duration-500"
        style={{ backgroundColor: themeBgColor }}
      >
        {/* Grain Overlay */}
        <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        {/* ─── Actual Hero (Scaled Down) ─── */}
        <div className="absolute inset-0 flex justify-center overflow-hidden">
          <div className="w-full h-full scale-[0.4] md:scale-[0.52] origin-top">
            <ProfileHero 
              name={displayName}
              handle={username}
              tagline={tagline}
              image={portrait || ""}
              imagePosition={imagePosition}
              theme={{ text: themeTextColor, nameGradient: [themeTextColor, themeTextColor] }}
              showGradient={false}
              className="pt-10"
            />
          </div>
        </div>

        {/* Small "HERO" Label inside the container */}
        <div className="absolute top-8 left-10 z-20 pointer-events-none">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            HERO
          </span>
        </div>

        {/* Viewfinder Corners */}
        <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-white/20 rounded-tl-lg" />
        <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-white/20 rounded-tr-lg" />
        <div className="absolute bottom-6 left-6 w-8 h-8 border-b border-l border-white/20 rounded-bl-lg" />
        <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-white/20 rounded-br-lg" />

        {/* Cinematic HUD Callout: TEXT COLOR */}
        {onTextColorChange && (
          <div className="absolute top-12 right-8 md:right-12 z-50 flex items-center group">
            <div className="w-8 md:w-16 h-px bg-gradient-to-r from-transparent to-white/40 group-hover:to-white/80 transition-colors" />
            <div className="relative">
              <button 
                onClick={() => setActivePicker(activePicker === 'text' ? null : 'text')}
                className="relative flex items-center justify-center w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 cursor-pointer hover:border-white/50 transition-all overflow-hidden z-10 shrink-0"
              >
                <div className="w-4 h-4 rounded-full border border-white/40" style={{ backgroundColor: themeTextColor }} />
              </button>

              {/* Popover Slider */}
              {activePicker === 'text' && (
                <div className="absolute top-10 right-0 p-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                  <CinematicColorPicker value={themeTextColor} onChange={onTextColorChange} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cinematic HUD Callout: AURA COLOR */}
        {onBgColorChange && (
          <div className="absolute bottom-12 left-8 md:left-12 z-50 flex items-center group">
            <div className="relative">
              <button 
                onClick={() => setActivePicker(activePicker === 'bg' ? null : 'bg')}
                className="relative flex items-center justify-center w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 cursor-pointer hover:border-white/50 transition-all overflow-hidden z-10 shrink-0"
              >
                <div className="w-4 h-4 rounded-full border border-white/40" style={{ backgroundColor: themeBgColor }} />
              </button>

              {/* Popover Slider */}
              {activePicker === 'bg' && (
                <div className="absolute bottom-10 left-0 p-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl z-50 origin-bottom-left animate-in fade-in zoom-in-95 duration-200">
                  <CinematicColorPicker value={themeBgColor} onChange={onBgColorChange} />
                </div>
              )}
            </div>
            <div className="w-8 md:w-16 h-px bg-gradient-to-r from-white/40 group-hover:from-white/80 to-transparent transition-colors" />
          </div>
        )}

        {/* Bottom Shade */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
