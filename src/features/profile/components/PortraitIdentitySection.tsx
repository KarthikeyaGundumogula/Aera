import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Upload, X } from "lucide-react";

interface PortraitIdentitySectionProps {
  username: string;
  displayName: string;
  tagline: string;
  file: File | null;
  previewUrl: string | null;
  onIdentityChange: (field: "username" | "displayName" | "tagline", value: string) => void;
  onPortraitChange: (file: File, preview: string) => void;
  onPortraitClear: () => void;
  imagePosition?: string;
  onImagePositionChange?: (position: string) => void;
  renderPreview?: React.ReactNode;
}

const TAGLINE_MAX = 120;

export function PortraitIdentitySection({
  username,
  displayName,
  tagline,
  file,
  previewUrl,
  onIdentityChange,
  onPortraitChange,
  onPortraitClear,
  imagePosition = "50% 0%",
  onImagePositionChange,
  renderPreview,
}: PortraitIdentitySectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    (incoming: File) => {
      if (!incoming.type.startsWith("image/")) return;
      const url = URL.createObjectURL(incoming);
      onPortraitChange(incoming, url);
    },
    [onPortraitChange]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) processFile(picked);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processFile(dropped);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-12"
    >
      {/* Section Eyebrow */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px w-10 bg-white/20" />
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
          I — Public Profile
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
        {/* Left: Avatar Preview Section & Controls */}
        <div className="shrink-0 flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-4 sm:gap-6 relative group">

          {/* Portrait Circle/Square */}
          <div
            className={`
              w-32 h-32 rounded-2xl overflow-hidden relative flex items-center justify-center shrink-0
              border transition-all duration-500 cursor-pointer
              ${previewUrl
                ? "border-white/30 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                : "border-dashed border-white/15 bg-white/[0.04] hover:bg-white/[0.06] hover:border-white/25"
              }
            `}
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <AnimatePresence mode="wait">
              {previewUrl ? (
                <motion.img
                  key="avatar-img"
                  initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  src={previewUrl}
                  alt="Artist portrait preview"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: imagePosition }}
                />
              ) : (
                <motion.div
                  key="avatar-placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <User className="w-8 h-8 text-white/15" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <Upload className="w-5 h-5 text-white/80" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-white/80">Update Photo</span>
            </div>
          </div>

          {/* Right side Metadata indicator & Slider */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            {previewUrl && onImagePositionChange ? (
              <div className="flex flex-col items-center gap-2 h-32 justify-center opacity-50 hover:opacity-100 transition-opacity">
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Pan Y</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={imagePosition.split(" ")[1]?.replace("%", "") || "0"}
                  onChange={(e) => {
                    const x = imagePosition.split(" ")[0] || "50%";
                    onImagePositionChange(`${x} ${e.target.value}%`);
                  }}
                  className="h-20 touch-none appearance-none bg-white/10 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white cursor-ns-resize"
                  style={{ writingMode: "vertical-lr", direction: "rtl" }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 opacity-20 select-none">
                <div className="w-[1px] h-6 bg-white" />
                <span className="[writing-mode:vertical-rl] rotate-180 text-[7px] font-mono tracking-[0.4em] uppercase text-white whitespace-nowrap">
                  LIVE PREVIEW
                </span>
                <div className="w-[1px] h-6 bg-white" />
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
          </div>

          {/* Bottom Horizontal Slider (Pan X) */}
          {previewUrl && onImagePositionChange && (
            <div className="flex items-center gap-2 w-32 justify-center opacity-50 hover:opacity-100 transition-opacity mr-12 sm:mr-14">
              <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Pan X</span>
              <input
                type="range"
                min="0"
                max="100"
                value={imagePosition.split(" ")[0]?.replace("%", "") || "50"}
                onChange={(e) => {
                  const y = imagePosition.split(" ")[1] || "0%";
                  onImagePositionChange(`${e.target.value}% ${y}`);
                }}
                className="w-20 touch-none appearance-none bg-white/10 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white cursor-ew-resize"
              />
            </div>
          )}
        </div>

        {/* Center: Live Preview (Mobile Only) */}
        {renderPreview && (
          <div className="block md:hidden w-full">
            {renderPreview}
          </div>
        )}

        {/* Right: Identity Inputs */}
        <div className="flex-1 w-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold uppercase tracking-[0.35em] text-white/30 ml-1">
                Full Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => onIdentityChange("displayName", e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-xl font-black tracking-tight placeholder:text-white/5 focus:border-white/30 focus:bg-white/[0.05] transition-all outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold uppercase tracking-[0.35em] text-white/30 ml-1">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 font-mono text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => onIdentityChange("username", e.target.value.toLowerCase().replace(/\s/g, ''))}
                  placeholder="handle"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-10 pr-5 py-4 text-xl font-black tracking-tight placeholder:text-white/5 focus:border-white/30 focus:bg-white/[0.05] transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[9px] font-bold uppercase tracking-[0.35em] text-white/30 ml-1">
              Your Craft (Tagline)
            </label>
            <div className="relative">
              <input
                type="text"
                value={tagline}
                onChange={(e) => onIdentityChange("tagline", e.target.value.slice(0, TAGLINE_MAX))}
                placeholder="A short line that defines your work..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium placeholder:text-white/5 focus:border-white/30 focus:bg-white/[0.05] transition-all outline-none"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-white/10 tabular-nums">
                {tagline.length}/{TAGLINE_MAX}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
