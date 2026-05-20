import { useState, useEffect, useRef } from "react";

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex.split("").map((char) => char + char).join("");
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return { h: 0, s: 100, l: 50 };
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function parseColor(val: string): { h: number; s: number; l: number } {
  if (val.startsWith("hsl")) {
    const match = val.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      return {
        h: Number(match[1]),
        s: Number(match[2]),
        l: Number(match[3]),
      };
    }
  } else if (val.startsWith("#")) {
    return hexToHsl(val);
  }
  return { h: 0, s: 100, l: 50 };
}

export function CinematicColorPicker({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (c: string) => void;
  className?: string;
}) {
  const { h: initialH, s: initialS, l: initialL } = parseColor(value);
  const [h, setH] = useState(initialH);
  const [s, setS] = useState(initialS);
  const [l, setL] = useState(initialL);

  const wheelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sync internal state when value prop changes from outside
  useEffect(() => {
    if (isDragging) return;
    const { h: nextH, s: nextS, l: nextL } = parseColor(value);
    setH(nextH);
    setS(nextS);
    setL(nextL);
  }, [isDragging, value]);

  const updateColor = (newH: number, newS: number, newL: number) => {
    setH(newH);
    setS(newS);
    setL(newL);
    onChange(`hsl(${newH}, ${newS}%, ${newL}%)`);
  };

  const handlePointer = (clientX: number, clientY: number) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const W = rect.width;
    const cx = W / 2;
    const cy = W / 2;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const dx = x - cx;
    const dy = y - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = W / 2;

    const nextS = Math.min(100, Math.round((distance / maxRadius) * 100));

    let angleRad = Math.atan2(dy, dx);
    let angleDeg = angleRad * (180 / Math.PI);
    let nextH = angleDeg + 90;
    if (nextH < 0) nextH += 360;
    nextH = Math.round(nextH) % 360;

    updateColor(nextH, nextS, l);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    handlePointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    handlePointer(e.clientX, e.clientY);
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  };

  // Calculate indicator pin placement inside 128px bounding box
  const W_SIZE = 128;
  const cx = W_SIZE / 2;
  const cy = W_SIZE / 2;
  const r = (s / 100) * (W_SIZE / 2);
  const phi = (h - 90) * (Math.PI / 180);
  const cursorX = cx + r * Math.cos(phi);
  const cursorY = cy + r * Math.sin(phi);

  return (
    <div className={`flex flex-col items-center gap-4 w-40 p-3 bg-black/85 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl ${className}`}>
      {/* ─── Circular Color Wheel ─── */}
      <div className="relative flex flex-col items-center">
        <div
          ref={wheelRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onPointerLeave={handlePointerEnd}
          className="w-32 h-32 rounded-full relative cursor-crosshair border border-white/15 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] overflow-hidden touch-none"
          style={{
            background:
              "radial-gradient(circle, #ffffff 0%, transparent 85%), conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
          }}
        >
          {/* Wheel HUD Scope Lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <div className="w-full h-[1px] border-b border-dashed border-white" />
            <div className="h-full w-[1px] border-l border-dashed border-white absolute" />
            <div className="w-16 h-16 rounded-full border border-dashed border-white absolute" />
          </div>

          {/* Indicator Pin */}
          <div
            className="absolute w-3.5 h-3.5 rounded-full border-2 border-white bg-black/50 shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-75"
            style={{
              left: `${cursorX}px`,
              top: `${cursorY}px`,
            }}
          />
        </div>
      </div>

      {/* ─── Luminance / Lightness Slider ─── */}
      <div className="w-full space-y-1">
        <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-[0.2em] text-white/40 px-1">
          <span>Luminance</span>
          <span className="text-white/70 font-mono">{l}%</span>
        </div>
        <input
          type="range"
          min="5"
          max="95"
          value={l}
          onChange={(e) => updateColor(h, s, Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none outline-none cursor-pointer shadow-inner [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/20"
          style={{
            background: `linear-gradient(to right, #000000, hsl(${h}, ${s}%, 50%), #ffffff)`,
          }}
        />
      </div>

      {/* Numerical HSL telemetry values */}
      <div className="flex justify-between items-center w-full px-1 text-[7px] font-mono text-white/30 tracking-wider select-none border-t border-white/5 pt-2">
        <span>H: {h}°</span>
        <span>S: {s}%</span>
      </div>
    </div>
  );
}
