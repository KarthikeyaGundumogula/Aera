import { motion } from "motion/react";

interface PortraitIdentitySectionProps {
  username: string;
  displayName: string;
  tagline: string;
  onIdentityChange: (field: "username" | "displayName" | "tagline", value: string) => void;
}

const TAGLINE_MAX = 120;

export function PortraitIdentitySection({
  username,
  displayName,
  tagline,
  onIdentityChange,
}: PortraitIdentitySectionProps) {
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
          I — Stage your Hero
        </span>
      </div>

      {/* ─── IDENTITY FIELDS ─── */}
      <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-white/30 ml-1">
              Screen Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => onIdentityChange("displayName", e.target.value)}
              placeholder="e.g. Christopher Nolan"
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-xl font-black tracking-tight placeholder:text-white/5 focus:border-white/30 focus:bg-white/[0.05] transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-white/30 ml-1">
              Artist Handle
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-mono text-sm">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => onIdentityChange("username", e.target.value.toLowerCase().replace(/\s/g, ''))}
                placeholder="handle"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-5 text-xl font-black tracking-tight placeholder:text-white/5 focus:border-white/30 focus:bg-white/[0.05] transition-all outline-none"
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
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-base font-medium placeholder:text-white/5 focus:border-white/30 focus:bg-white/[0.05] transition-all outline-none"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-mono text-white/10 tabular-nums">
              {tagline.length}/{TAGLINE_MAX}
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
