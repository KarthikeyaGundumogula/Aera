import React, { useRef } from "react";
import { motion } from "motion/react";
import { Camera, X } from "lucide-react";

interface PortraitIdentitySectionProps {
  username: string;
  displayName: string;
  tagline: string;
  onIdentityChange: (field: "username" | "displayName" | "tagline", value: string) => void;
  portraitPreview: string | null;
  onPortraitChange: (file: File, preview: string) => void;
  onPortraitClear: () => void;
}

const TAGLINE_MAX = 120;

export function PortraitIdentitySection({
  username,
  displayName,
  tagline,
  onIdentityChange,
  portraitPreview,
  onPortraitChange,
  onPortraitClear,
}: PortraitIdentitySectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      onPortraitChange(file, preview);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-8"
    >


      {/* ─── PORTRAIT UPLOAD ─── */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <div className="relative group perspective-1000">
          <div 
            onClick={() => !portraitPreview && fileInputRef.current?.click()}
            className={`w-40 sm:w-48 aspect-square rounded-2xl overflow-hidden border-2 flex flex-col items-center justify-center transition-all shadow-2xl ${
              portraitPreview 
                ? "border-white/10 bg-black/20" 
                : "border-dashed border-white/20 hover:border-white/40 cursor-pointer bg-white/[0.02] hover:bg-white/[0.04]"
            }`}
          >
            {portraitPreview ? (
              <>
                <img src={portraitPreview} alt="Portrait preview" className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </>
            ) : (
              <>
                <Camera className="w-8 h-8 text-white/20 mb-2 group-hover:text-white/40 transition-colors" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/20 group-hover:text-white/40 transition-colors">Upload</span>
              </>
            )}
          </div>
          
          {portraitPreview && (
            <button
              onClick={onPortraitClear}
              className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 hover:bg-red-600 hover:scale-105"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="text-center max-w-xs px-4">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/90 truncate">
            {displayName || "Stage Name"}
          </h3>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1 truncate">
            {tagline || "Your Idea of whom you are"}
          </p>
        </div>
      </div>

      {/* ─── IDENTITY FIELDS ─── */}
      <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-white/30 ml-1">
              Screen Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => onIdentityChange("displayName", e.target.value)}
              placeholder="e.g. Christopher Nolan"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-sm font-bold tracking-tight placeholder:text-white/10 focus:border-white/30 focus:bg-white/[0.05] transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-white/30 ml-1">
              Artist Handle
            </label>
            <div className="relative">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 font-mono text-xs">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => onIdentityChange("username", e.target.value.toLowerCase().replace(/\s/g, ''))}
                placeholder="handle"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-8 pr-4 py-3.5 text-sm font-bold tracking-tight placeholder:text-white/10 focus:border-white/30 focus:bg-white/[0.05] transition-all outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-white/30 ml-1">
            Tagline
          </label>
          <div className="relative">
            <input
              type="text"
              value={tagline}
              onChange={(e) => onIdentityChange("tagline", e.target.value.slice(0, TAGLINE_MAX))}
              placeholder="What is your Idea of whom you are"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-sm font-medium placeholder:text-white/10 focus:border-white/30 focus:bg-white/[0.05] transition-all outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-mono text-white/20 tabular-nums">
              {tagline.length}/{TAGLINE_MAX}
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
