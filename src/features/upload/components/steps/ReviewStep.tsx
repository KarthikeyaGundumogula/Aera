import { motion } from "motion/react";
import { Sparkles, Clapperboard } from "lucide-react";
import { WorkPreview } from "../WorkPreview";
import type { Original } from "../../../../types";
import type { UploadFormData } from "../../types";

interface ReviewStepProps {
  isSubmitting: boolean;
  formData: UploadFormData;
  currentOriginal?: Original;
  onRelease: () => void;
  onBack: () => void;
}

export function ReviewStep({ isSubmitting, formData, currentOriginal, onRelease, onBack }: ReviewStepProps) {
  if (isSubmitting) {
    return (
      <div className="text-center py-20">
         <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-12"
         >
            <div className="relative w-40 h-40 mx-auto">
                <motion.div 
                    className="absolute inset-0 border-2 border-white/10 rounded-xl"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                    className="absolute inset-4 border border-white/20 rounded-xl border-t-white"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Clapperboard className="w-10 h-10 text-white/80 animate-bounce" />
                </div>
                
                <motion.div 
                    className="absolute top-0 left-1/2 w-2 h-2 bg-white rounded-xl -ml-1"
                    animate={{ rotate: 360 }}
                    style={{ transformOrigin: "center 80px" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
            </div>
            <div>
                <h1 className="text-3xl font-black uppercase tracking-[1em] mb-4 text-white">Post Production</h1>
                <div className="flex flex-col items-center gap-2">
                    <p className="text-white/40 text-[10px] tracking-widest animate-pulse uppercase">Finalizing Master...</p>
                    <p className="text-white/20 text-[10px] tracking-[0.5em] uppercase">Syncing to Theatre Clusters</p>
                </div>
            </div>
         </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      key="step-review"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg"
    >
      <div className="text-center space-y-10">
           <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-xl border border-white/10 flex items-center justify-center bg-white/[0.02] shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                  <Sparkles className="w-8 h-8 text-white/50 animate-pulse" />
              </div>
              <div>
                  <h1 className="text-3xl font-black uppercase tracking-[0.2em] mb-4">Final Review</h1>
                  <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
                      Your release is calibrated and assigned. 
                      One last check before we broadcast to the network.
                  </p>
              </div>
           </div>

           <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-left space-y-4">
             <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">Release Summary</p>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">Title</p>
                 <p className="text-sm font-bold text-white truncate">{formData.title}</p>
               </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">Category</p>
                  <p className="text-sm font-bold text-white">
                    {formData.category === "Edit" ? "Cinematic Edit" : formData.category === "Poster" ? "Cinematic Poster" : "Cinematic Storyboard"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">Source</p>
                  <p className="text-sm font-bold text-white capitalize">
                    {(formData.category === "Poster" || formData.category === "Storyboard") ? "Local Archive" : formData.platform}
                  </p>
                </div>
               <div className="space-y-1">
                 <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">Associated Film</p>
                 <p className="text-sm font-bold text-white truncate">{currentOriginal?.title ?? "—"}</p>
               </div>
             </div>
              <div className="border-t border-white/5 pt-4 space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">Source Content</p>
                <p className="text-xs font-mono text-white/60 break-all">
                  {formData.category === "Storyboard" 
                    ? `${formData.storyboardPages.length} Storyboard Pages`
                    : (formData.contentUrl || "—")
                  }
                </p>
              </div>
           </div>

           <div className="w-full flex justify-center">
             <WorkPreview
               formData={{...formData, title: formData.title || "Untitled Preview"}}
               originalCover={currentOriginal?.coverImage}
             />
           </div>

           <div className="flex flex-col gap-4">
              <button 
                  onClick={onRelease}
                  className="w-full py-6 bg-white text-black rounded-2xl text-sm font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
              >
                  <span className="group-hover:translate-x-1 transition-transform">RELEASE</span> <Sparkles className="w-5 h-5" />
              </button>
              <button onClick={onBack} className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest py-2">
                  BACK
              </button>
           </div>
      </div>
    </motion.div>
  );
}
