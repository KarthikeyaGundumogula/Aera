import { motion } from "motion/react";
import { Check } from "lucide-react";

export const THEME_PALETTES = [
  { id: "crimson-red", name: "Crimson Red", gradient: ["#b91c1c", "#ef4444"] as [string, string] },
  { id: "ghost-white", name: "Ghost White", gradient: ["#374151", "#f3f4f6"] as [string, string] },
  { id: "deep-ocean", name: "Deep Ocean", gradient: ["#1e3a8a", "#3b82f6"] as [string, string] },
  { id: "neon-jade", name: "Neon Jade", gradient: ["#064e3b", "#10b981"] as [string, string] },
  { id: "void-gold", name: "Void Gold", gradient: ["#854d0e", "#eab308"] as [string, string] },
];

interface ThemeSelectionSectionProps {
  selectedGradient: [string, string];
  onThemeChange: (gradient: [string, string]) => void;
}

export function ThemeSelectionSection({ selectedGradient, onThemeChange }: ThemeSelectionSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-8"
    >
      {/* Section Eyebrow */}
      <div className="flex items-center gap-3">
        <div className="h-px w-10 bg-white/20" />
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
          II — Stage Aura
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {THEME_PALETTES.map((palette) => {
          const isSelected = selectedGradient[0] === palette.gradient[0] && selectedGradient[1] === palette.gradient[1];

          return (
            <button
              key={palette.id}
              onClick={() => onThemeChange(palette.gradient)}
              className={`relative h-24 rounded-2xl border transition-all duration-300 overflow-hidden group ${
                isSelected ? "border-white/50 scale-[1.02]" : "border-white/10 hover:border-white/25 hover:scale-[1.01]"
              }`}
            >
              <div
                className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(to bottom, ${palette.gradient[0]}, ${palette.gradient[1]})`,
                }}
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative h-full flex flex-col items-center justify-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white drop-shadow-md">
                  {palette.name}
                </span>
                {isSelected && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}
