import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TransmissionStepProps {
  platform: "youtube" | "twitter";
  contentUrl: string;
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function TransmissionStep({ platform, contentUrl, setFormData, onNext, onBack }: TransmissionStepProps) {
  return (
    <motion.div
      key="step-transmission"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="w-full max-w-xl"
    >
      <div className="text-center mb-12">
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] mb-2">The Transmission</h2>
        <p className="text-white/40 text-xs">Bridge your work to the FrameHouse network</p>
      </div>
      
      <div className="space-y-8">
         <div className="flex gap-4">
          <button 
            onClick={() => setFormData({ platform: "youtube" })}
            className={`flex-1 p-6 rounded-2xl border transition-all duration-300 ${
              platform === "youtube" ? "bg-red-500/10 border-red-500/50 text-red-500" : "bg-white/5 text-white border-white/10 hover:border-white/20"
            }`}
          >
            <div className="text-xs font-black uppercase tracking-widest text-center">Youtube</div>
          </button>
          <button 
            onClick={() => setFormData({ platform: "twitter" })}
            className={`flex-1 p-6 rounded-2xl border transition-all duration-300 ${
              platform === "twitter" ? "bg-blue-500/10 border-blue-500/50 text-blue-500" : "bg-white/5 text-white border-white/10 hover:border-white/20"
            }`}
          >
            <div className="text-xs font-black uppercase tracking-widest text-center">Twitter / X</div>
          </button>
        </div>

        <div className="space-y-4">
          <input 
            type="url"
            placeholder={platform === 'youtube' ? "https://youtube.com/watch?v=..." : "https://twitter.com/status/..."}
            autoFocus
            value={contentUrl}
            onChange={(e) => setFormData({ contentUrl: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-base font-mono focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all placeholder:text-white/10"
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <button onClick={onBack} className="text-white/40 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button 
            disabled={!contentUrl}
            onClick={onNext} 
            className="px-10 py-4 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/90 disabled:opacity-30 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            Assign Project <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
