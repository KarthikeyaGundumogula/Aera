import { motion } from "motion/react";
import { Instagram, Twitter, Youtube } from "lucide-react";

export interface SocialsData {
  instagram: string;
  twitter: string;
  youtube: string;
}

interface SocialsSectionProps {
  socials: SocialsData;
  onChange: (platform: keyof SocialsData, value: string) => void;
}

interface SocialRowProps {
  id: string;
  icon: React.FC<{ className?: string }>;
  label: string;
  prefix: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  delay: number;
}

function SocialRow({ id, icon: Icon, label, prefix, value, placeholder, onChange, delay }: SocialRowProps) {
  const hasValue = value.trim().length > 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
      className={`
        flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-300
        bg-white/[0.03]
        ${hasValue
          ? "border-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
          : "border-white/[0.07] hover:border-white/15"
        }
      `}
    >
      {/* Platform Icon */}
      <div className={`shrink-0 transition-colors duration-300 ${hasValue ? "text-white/70" : "text-white/25"}`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Label */}
      <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/25 shrink-0 w-16">
        {label}
      </span>

      {/* Divider */}
      <div className="w-px h-4 bg-white/10 shrink-0" />

      {/* Prefix + Input */}
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <span className="text-sm font-bold text-white/25 shrink-0">{prefix}</span>
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="
            flex-1 min-w-0 bg-transparent text-sm font-medium text-white
            placeholder:text-white/15 outline-none
          "
        />
      </div>
    </motion.div>
  );
}

export function SocialsSection({ socials, onChange }: SocialsSectionProps) {
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
          III — Socials
        </span>
      </div>

      <div className="space-y-3">
        <SocialRow
          id="social-instagram"
          icon={Instagram}
          label="Instagram"
          prefix="@"
          value={socials.instagram}
          placeholder="yourhandle"
          onChange={(v) => onChange("instagram", v)}
          delay={0}
        />
        <SocialRow
          id="social-twitter"
          icon={Twitter}
          label="Twitter / X"
          prefix="@"
          value={socials.twitter}
          placeholder="yourhandle"
          onChange={(v) => onChange("twitter", v)}
          delay={0.06}
        />
        <SocialRow
          id="social-youtube"
          icon={Youtube}
          label="YouTube"
          prefix=""
          value={socials.youtube}
          placeholder="Stage handle (e.g. @yourname)"
          onChange={(v) => onChange("youtube", v)}
          delay={0.12}
        />
      </div>
    </motion.section>
  );
}
