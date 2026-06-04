import { motion } from "motion/react";
import { Dna } from "lucide-react";

interface CreationIdentitySectionProps {
  title: string;
  description: string;
  onChange: (field: "title" | "description", val: string) => void;
}

export function CreationIdentitySection({ title, description, onChange }: CreationIdentitySectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10">
          <Dna className="w-4 h-4 text-white/70" />
        </div>
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/50">Core Identity</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 ml-1">Original Name</label>
          <input
            type="text"
            placeholder="e.g. THE DARK KNIGHT"
            value={title}
            onChange={(e) => onChange("title", e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-5 text-lg font-bold focus:ring-2 focus:ring-white/10 focus:border-white/20 outline-none transition-all placeholder:text-white/10 uppercase tracking-tight"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 ml-1">Description (Optional)</label>
          <textarea
            placeholder="The soul of the artifact..."
            value={description}
            onChange={(e) => onChange("description", e.target.value)}
            rows={4}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-5 text-sm font-medium focus:ring-2 focus:ring-white/10 focus:border-white/20 outline-none transition-all placeholder:text-white/10 resize-none leading-relaxed"
          />
        </div>
      </div>
    </motion.section>
  );
}
