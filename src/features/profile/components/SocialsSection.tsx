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
  brandClass: string;
  brandColor: string;
}

function SocialRow({ id, icon: Icon, label, prefix, value, placeholder, onChange, delay, brandClass, brandColor }: SocialRowProps) {
  const hasValue = value.trim().length > 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300
        bg-white/[0.03] group
        ${hasValue
          ? `${brandClass}`
          : `border-white/[0.07] hover:border-white/15 ${brandClass.replace(/border-[a-z]+-[0-9]+\/30/, 'focus-within:border-white/30').replace(/shadow-.+\]/, '')}`
        }
      `}
    >
      {/* Platform Icon */}
      <div className={`shrink-0 transition-colors duration-300 ${hasValue ? brandColor : "text-white/25 group-focus-within:text-white/40"}`}>
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
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-6 mt-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Social Links</h3>
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
          brandClass="border-pink-500/30 focus-within:border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
          brandColor="text-pink-400"
        />
        <SocialRow
          id="social-twitter"
          icon={Twitter}
          label="Twitter"
          prefix="@"
          value={socials.twitter}
          placeholder="yourhandle"
          onChange={(v) => onChange("twitter", v)}
          delay={0.06}
          brandClass="border-blue-400/30 focus-within:border-blue-400/50 shadow-[0_0_15px_rgba(96,165,250,0.15)]"
          brandColor="text-blue-400"
        />
        <SocialRow
          id="social-youtube"
          icon={Youtube}
          label="YouTube"
          prefix=""
          value={socials.youtube}
          placeholder="Channel ID"
          onChange={(v) => onChange("youtube", v)}
          delay={0.12}
          brandClass="border-red-500/30 focus-within:border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
          brandColor="text-red-500"
        />
      </div>
    </motion.section>
  );
}
