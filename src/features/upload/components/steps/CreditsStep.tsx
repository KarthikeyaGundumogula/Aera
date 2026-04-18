import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Original } from "../../../../types";

interface CreditsStepProps {
  originals: Original[];
  selectedIds: string[];
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function CreditsStep({ originals, selectedIds, setFormData, onNext, onBack }: CreditsStepProps) {
  const toggleSelection = (id: string) => {
    const newIds = selectedIds.includes(id)
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id];
    setFormData({ originalIds: newIds });
  };

  return (
    <motion.div
      key="step-credits"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="w-full"
    >
      <div className="text-center mb-12">
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] mb-2">The Credits</h2>
        <p className="text-white/40 text-xs text-balance">Select all official FrameHouse projects associated with this release</p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 px-4 max-h-[50vh] overflow-y-auto no-scrollbar pb-8">
        {originals.map((org) => {
          const isSelected = selectedIds.includes(org.id);
          return (
            <motion.button
              key={org.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleSelection(org.id)}
              className={`relative aspect-[2/3] group rounded-xl overflow-hidden border-2 transition-all duration-500 ${
                isSelected ? "border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]" : "border-transparent"
              }`}
            >
              <img src={org.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className={`absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4 transition-opacity duration-300 ${
                isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}>
                 <CheckCircle2 className={`w-10 h-10 mb-4 transition-all duration-500 ${isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-center">{org.title}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-12 flex items-center justify-between px-4">
          <button onClick={onBack} className="text-white/40 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
          </button>
          
          <button 
            disabled={selectedIds.length === 0}
            onClick={onNext} 
            className="px-10 py-4 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/90 disabled:opacity-30 transition-all flex items-center gap-2"
          >
            Connect Source <ChevronRight className="w-4 h-4" />
          </button>
      </div>
    </motion.div>
  );
}
