import { motion } from "motion/react";
import { Film, Image as ImageIcon, BookOpen, ChevronRight, Dna } from "lucide-react";
import { THEATRE_FORMATS } from "../../../../constants/formats";
import type { UpdateUploadFormData, UploadCategory } from "../../types";

interface IdentityStepProps {
  category: UploadCategory;
  title: string;
  setFormData: UpdateUploadFormData;
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
        <div className="flex items-center justify-center gap-2 mb-2">
          <Dna className="w-4 h-4 text-white/50" />
          <h2 className="text-sm font-bold uppercase tracking-[0.3em]">
            The Identity
          </h2>
        </div>
        <p className="text-white/40 text-xs text-balance">
          Give your release a name and a category
        </p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <button
            onClick={() =>
              setFormData({
                category: "Edit",
                aspectRatio: THEATRE_FORMATS.IMAX.ratio,
              })
            }
            className={`flex flex-col p-3 md:p-6 rounded-xl md:rounded-2xl border transition-all duration-300 ${
              category === "Edit"
                ? "bg-white text-black border-white"
                : "bg-white/5 text-white border-white/10 hover:border-white/20"
            }`}
          >
            <Film className="w-5 h-5 md:w-6 md:h-6 mb-2 md:mb-3" />
            <div className="text-left">
              <div className="text-[9px] md:text-xs font-black uppercase tracking-widest leading-none mb-1">
                Edit
              </div>
              <div
                className={`text-[7px] md:text-[9px] font-bold uppercase tracking-widest ${category === "Edit" ? "text-black/40" : "text-white/30"}`}
              >
                Motion
              </div>
            </div>
          </button>
          <button
            onClick={() =>
              setFormData({
                category: "Poster",
                aspectRatio: THEATRE_FORMATS.STANDARD_POSTER.ratio,
              })
            }
            className={`flex flex-col p-3 md:p-6 rounded-xl md:rounded-2xl border transition-all duration-300 ${
              category === "Poster"
                ? "bg-white text-black border-white"
                : "bg-white/5 text-white border-white/10 hover:border-white/20"
            }`}
          >
            <ImageIcon className="w-5 h-5 md:w-6 md:h-6 mb-2 md:mb-3" />
            <div className="text-left">
              <div className="text-[9px] md:text-xs font-black uppercase tracking-widest leading-none mb-1">
                Poster
              </div>
              <div
                className={`text-[7px] md:text-[9px] font-bold uppercase tracking-widest ${category === "Poster" ? "text-black/40" : "text-white/30"}`}
              >
                Static
              </div>
            </div>
          </button>
          <button
            onClick={() =>
              setFormData({
                category: "Script",
                aspectRatio: THEATRE_FORMATS.SQUARE_POSTER.ratio,
              })
            }
            className={`flex flex-col p-3 md:p-6 rounded-xl md:rounded-2xl border transition-all duration-300 ${
              category === "Script"
                ? "bg-white text-black border-white"
                : "bg-white/5 text-white border-white/10 hover:border-white/20"
            }`}
          >
            <BookOpen className="w-5 h-5 md:w-6 md:h-6 mb-2 md:mb-3" />
            <div className="text-left">
              <div className="text-[9px] md:text-xs font-black uppercase tracking-widest leading-none mb-1">
                Story
              </div>
              <div
                className={`text-[7px] md:text-[9px] font-bold uppercase tracking-widest ${category === "Script" ? "text-black/40" : "text-white/30"}`}
              >
                Narrative
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
            className="px-10 py-4 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/90 disabled:opacity-30 transition-all flex items-center gap-2"
          >
            NEXT <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
