import { motion } from "motion/react";

interface IdentitySectionProps {
  name: string;
  tagline: string;
  password: string;
  onChange: (field: "name" | "tagline" | "password", value: string) => void;
}

const TAGLINE_MAX = 120;

export function IdentitySection({ name, tagline, password, onChange }: IdentitySectionProps) {
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
          II — Identity
        </span>
      </div>

      <div className="space-y-4">
        {/* Display Name */}
        <div className="relative group">
          <label className="block text-[9px] font-bold uppercase tracking-[0.35em] text-white/30 mb-2 ml-1">
            Display Name
          </label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Your artist name"
            autoComplete="off"
            className="
              w-full bg-white/[0.04] border border-white/10 rounded-2xl
              px-6 py-5 text-2xl font-black tracking-tight
              placeholder:text-white/10 text-white
              focus:outline-none focus:border-white/30 focus:bg-white/[0.06]
              transition-all duration-300
            "
          />
        </div>

        {/* Tagline */}
        <div className="relative group">
          <label className="block text-[9px] font-bold uppercase tracking-[0.35em] text-white/30 mb-2 ml-1">
            Tagline
          </label>
          <div className="relative">
            <input
              id="profile-tagline"
              type="text"
              value={tagline}
              onChange={(e) => onChange("tagline", e.target.value.slice(0, TAGLINE_MAX))}
              placeholder="One line that defines your craft"
              autoComplete="off"
              className="
                w-full bg-white/[0.04] border border-white/10 rounded-2xl
                px-6 py-5 text-base font-medium
                placeholder:text-white/10 text-white/80
                focus:outline-none focus:border-white/30 focus:bg-white/[0.06]
                transition-all duration-300
              "
            />
            <span
              className={`
                absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-bold tabular-nums transition-colors pointer-events-none
                ${tagline.length >= TAGLINE_MAX ? "text-white/50" : "text-white/20"}
              `}
            >
              {tagline.length}/{TAGLINE_MAX}
            </span>
          </div>
        </div>

        {/* Password */}
        <div className="relative group">
          <label className="block text-[9px] font-bold uppercase tracking-[0.35em] text-white/30 mb-2 ml-1">
            Access Key (Password)
          </label>
          <input
            id="profile-password"
            type="password"
            value={password}
            onChange={(e) => onChange("password", e.target.value)}
            placeholder="Secure your archive"
            className="
              w-full bg-white/[0.04] border border-white/10 rounded-2xl
              px-6 py-5 text-base font-medium
              placeholder:text-white/10 text-white/80
              focus:outline-none focus:border-white/30 focus:bg-white/[0.06]
              transition-all duration-300
            "
          />
        </div>
      </div>
    </motion.section>
  );
}
