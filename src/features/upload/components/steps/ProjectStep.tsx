import { motion } from "motion/react";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { Original } from "../../../../types";

interface ProjectStepProps {
  originals: Original[];
  selectedId: string;
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ProjectStep({ originals, selectedId, setFormData, onNext, onBack }: ProjectStepProps) {
  return (
    <motion.div
      key="step-project"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="w-full"
    >
      <div className="text-center mb-12">
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] mb-2">The Canvas</h2>
        <p className="text-white/40 text-xs text-balance">Link your release to an official FrameHouse project</p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {originals.map((org) => (
          <motion.button
            key={org.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setFormData({ originalId: org.id });
              onNext();
            }}
            className={`relative aspect-[2/3] group rounded-xl overflow-hidden border-2 transition-all duration-500 ${
              selectedId === org.id ? "border-white" : "border-transparent"
            }`}
          >
            <img src={org.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className={`absolute inset-0 bg-black/70 flex flex-col items-center justify-end p-4 transition-opacity duration-300 ${
              selectedId === org.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}>
               <CheckCircle2 className={`w-8 h-8 mb-4 transition-transform duration-500 scale-0 ${selectedId === org.id ? "scale-100" : ""}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-center">{org.title}</span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-12 flex justify-start">
          <button onClick={onBack} className="text-white/40 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
          </button>
      </div>
    </motion.div>
  );
}
