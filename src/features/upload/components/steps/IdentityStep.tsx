import { motion } from "motion/react";
import { Film, Image as ImageIcon, BookOpen, ChevronRight } from "lucide-react";

interface IdentityStepProps {
  category: "Edit" | "Poster" | "Script";
  title: string;
  setFormData: (data: any) => void;
  onNext: () => void;
}

export function IdentityStep({
  category,
  title,
  setFormData,
  onNext,
}: IdentityStepProps) {
  return (
    <motion.div
      key="step-identity"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="w-full max-w-xl"
    >
      <div className="text-center mb-12">
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] mb-2">
          The Identity
        </h2>
        <p className="text-white/40 text-xs text-balance">
          Give your release a name and a category
        </p>
      </div>

      <div className="space-y-8">
        <div className="flex gap-4">
          <button
            onClick={() => setFormData({ category: "Edit" })}
            className={`flex-1 p-6 rounded-2xl border transition-all duration-300 ${
              category === "Edit"
                ? "bg-white text-black border-white"
                : "bg-white/5 text-white border-white/10 hover:border-white/20"
            }`}
          >
            <Film className="w-6 h-6 mb-3" />
            <div className="text-left">
              <div className="text-xs font-black uppercase tracking-widest leading-none mb-1">
                Cinematic Edit
              </div>
              <div
                className={`text-[9px] font-bold uppercase tracking-widest ${category === "Edit" ? "text-black/40" : "text-white/30"}`}
              >
                Motion Art
              </div>
            </div>
          </button>
          <button
            onClick={() => setFormData({ category: "Poster" })}
            className={`flex-1 p-6 rounded-2xl border transition-all duration-300 ${
              category === "Poster"
                ? "bg-white text-black border-white"
                : "bg-white/5 text-white border-white/10 hover:border-white/20"
            }`}
          >
            <ImageIcon className="w-6 h-6 mb-3" />
            <div className="text-left">
              <div className="text-xs font-black uppercase tracking-widest leading-none mb-1">
                Cinematic Poster
              </div>
              <div
                className={`text-[9px] font-bold uppercase tracking-widest ${category === "Poster" ? "text-black/40" : "text-white/30"}`}
              >
                Static Visual
              </div>
            </div>
          </button>
          <button
            onClick={() => setFormData({ category: "Script" })}
            className={`flex-1 p-6 rounded-2xl border transition-all duration-300 ${
              category === "Script"
                ? "bg-white text-black border-white"
                : "bg-white/5 text-white border-white/10 hover:border-white/20"
            }`}
          >
            <BookOpen className="w-6 h-6 mb-3" />
            <div className="text-left">
              <div className="text-xs font-black uppercase tracking-widest leading-none mb-1">
                Cinematic Script
              </div>
              <div
                className={`text-[9px] font-bold uppercase tracking-widest ${category === "Script" ? "text-black/40" : "text-white/30"}`}
              >
                Narrative Arc
              </div>
            </div>
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name your release"
            autoFocus
            value={title}
            onChange={(e) => setFormData({ title: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xl font-medium focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all placeholder:text-white/10"
          />
        </div>

        <div className="flex items-center justify-end pt-4">
          <button
            disabled={!title}
            onClick={onNext}
            className="px-10 py-4 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/90 disabled:opacity-30 transition-all flex items-center gap-2"
          >
            Connect Source <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
