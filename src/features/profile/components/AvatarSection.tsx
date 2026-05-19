import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Upload, X } from "lucide-react";

interface AvatarSectionProps {
  file: File | null;
  previewUrl: string | null;
  onChange: (file: File, preview: string) => void;
  onClear: () => void;
}

export function AvatarSection({ file, previewUrl, onChange, onClear }: AvatarSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    (incoming: File) => {
      if (!incoming.type.startsWith("image/")) return;
      const url = URL.createObjectURL(incoming);
      onChange(incoming, url);
    },
    [onChange]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) processFile(picked);
    // Reset so re-selecting same file triggers change
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
      className="w-full"
    >
      {/* Section Eyebrow */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px w-10 bg-white/20" />
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
          I — Portrait
        </span>
      </div>

      <div className="flex flex-col items-center gap-10">

        {/* Avatar Preview Section (Identity Frame) */}
        <div className="shrink-0 z-10 flex items-center justify-center gap-4 sm:gap-8 overflow-hidden">
          <AnimatePresence>
            {previewUrl && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 0.2, x: 0 }}
                className="flex flex-col items-center gap-4 select-none shrink-0"
              >
                <div className="w-[1px] h-10 sm:h-12 bg-white" />
                <span className="[writing-mode:vertical-rl] rotate-180 text-[7px] sm:text-[8px] font-mono tracking-[0.6em] uppercase text-white whitespace-nowrap">
                  @NEW_CREATOR
                </span>
                <div className="w-[1px] h-10 sm:h-12 bg-white" />
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={`
              w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden relative flex items-center justify-center shrink-0
              border transition-all duration-500
              ${previewUrl
                ? "border-white/30 shadow-[0_0_40px_rgba(255,255,255,0.1)] scale-110"
                : "border-dashed border-white/15 bg-white/[0.04]"
              }
            `}
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
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <motion.div
                  key="avatar-placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <User className="w-7 h-7 sm:w-8 sm:h-8 text-white/15" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {previewUrl && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 0.2, x: 0 }}
                className="flex flex-col items-center gap-4 select-none shrink-0"
              >
                <div className="w-[1px] h-6 sm:h-8 bg-white" />
                <span className="[writing-mode:vertical-rl] rotate-180 text-[7px] sm:text-[8px] font-mono tracking-[0.4em] uppercase text-white whitespace-nowrap">
                  STAGE REC-001
                </span>
                <div className="w-[1px] h-6 sm:h-8 bg-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Drop Zone */}
        <div className="w-full max-w-sm mx-auto">
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload portrait photo"
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center gap-3
              rounded-2xl border-2 border-dashed px-6 py-8
              cursor-pointer transition-all duration-300 select-none
              ${isDragging
                ? "border-white/40 bg-white/[0.06]"
                : previewUrl
                  ? "border-white/15 bg-white/[0.03] hover:border-white/25"
                  : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]"
              }
            `}
          >
            <AnimatePresence mode="wait">
              {isDragging ? (
                <motion.div
                  key="dragging"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2"
                >
                  <Upload className="w-5 h-5 text-white/60" />
                  <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Drop it</span>
                </motion.div>
              ) : previewUrl ? (
                <motion.div
                  key="replace"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <Upload className="w-4 h-4 text-white/30" />
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.25em]">
                    Replace Portrait
                  </span>
                  {file && (
                    <span className="text-[9px] text-white/20 max-w-[180px] truncate text-center">
                      {file.name}
                    </span>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2"
                >
                  <Upload className="w-5 h-5 text-white/25" />
                  <div className="text-center">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
                      Upload Portrait
                    </p>
                    <p className="text-[9px] text-white/20 mt-1">
                      Best: 1:1 aspect ratio — JPG, PNG, WEBP
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          {/* Clear button */}
          <AnimatePresence>
            {previewUrl && (
              <motion.button
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={onClear}
                className="mt-4 mx-auto flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-white/25 hover:text-white/50 transition-colors"
              >
                <X className="w-3 h-3" />
                Remove
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
