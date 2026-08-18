import React, { useRef } from "react";
import { motion } from "motion/react";
import { Upload, Pencil, X } from "lucide-react";
import { ArtistAvatar } from "@/components/ArtistAvatar";

interface PortraitIdentitySectionProps {
  username: string;
  displayName: string;
  tagline: string;
  onIdentityChange: (
    field: "username" | "displayName" | "tagline",
    value: string
  ) => void;
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    onPortraitChange(file, previewUrl);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-8"
    >
      {/* ─── PORTRAIT UPLOADER & PREVIEW ─── */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-40 sm:w-48 aspect-square rounded-2xl overflow-hidden border-2 border-white/20 bg-black/40 flex items-center justify-center shadow-2xl transition-all group-hover:border-white/40">
            <ArtistAvatar
              src={portraitPreview}
              name={displayName || username || "Artist"}
              size={180}
              className="w-full h-full rounded-2xl"
            />
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity backdrop-blur-sm">
            <Pencil className="w-6 h-6 text-white" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
              {portraitPreview ? "Change Portrait" : "Upload Portrait"}
            </span>
          </div>

          {/* Clear Button */}
          {portraitPreview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPortraitClear();
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white shadow-lg transition-all"
              title="Remove picture"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Upload Action Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/80 transition-all"
        >
          <Upload className="w-3.5 h-3.5" />
          {portraitPreview ? "Replace Portrait Photo" : "Upload Portrait Photo"}
        </button>

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
