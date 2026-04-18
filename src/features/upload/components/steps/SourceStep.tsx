import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Upload, Image as ImageIcon, X } from "lucide-react";
import { useRef } from "react";

interface SourceStepProps {
  category: "Edit" | "Poster";
  platform: "youtube" | "twitter";
  contentUrl: string;
  originalIds: string[];
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SourceStep({ 
  category,
  platform, 
  contentUrl, 
  originalIds, 
  setFormData, 
  onNext, 
  onBack 
}: SourceStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPoster = category === "Poster";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData({ contentUrl: url });
    }
  };

  const removeFile = () => {
    setFormData({ contentUrl: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <motion.div
      key="step-source"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="w-full max-w-xl"
    >
      <div className="text-center mb-12">
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] mb-2">The Source</h2>
        <p className="text-white/40 text-xs text-balance">
          {isPoster 
            ? "Upload the high-resolution master of your poster"
            : `Link your work for the ${originalIds?.length || 0} selected film${(originalIds?.length !== 1) ? 's' : ''}`
          }
        </p>
      </div>
      
      <div className="space-y-8">
        {!isPoster ? (
          <>
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
                placeholder={platform === 'youtube' ? "Paste YouTube link..." : "Paste Twitter/X status link..."}
                autoFocus
                value={contentUrl}
                onChange={(e) => setFormData({ contentUrl: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-base font-mono focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all placeholder:text-white/10"
              />
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            {!contentUrl ? (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[16/6] rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center gap-4 hover:bg-white/[0.04] hover:border-white/20 transition-all group"
              >
                <div className="p-4 rounded-full bg-white/5 text-white/40 group-hover:text-white transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black uppercase tracking-widest mb-1">Upload Original Master</p>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">PNG, JPG or WebP up to 50MB</p>
                </div>
              </button>
            ) : (
              <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-black aspect-[16/6]">
                <img src={contentUrl} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center gap-4">
                   <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
                      <ImageIcon className="w-4 h-4 text-white/40" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Master Artifact Ready</span>
                   </div>
                   <button 
                    onClick={removeFile}
                    className="p-2 bg-red-500/20 text-red-500 border border-red-500/30 rounded-full hover:bg-red-500 hover:text-white transition-all"
                   >
                     <X className="w-4 h-4" />
                   </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <button onClick={onBack} className="text-white/40 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button 
            disabled={!contentUrl}
            onClick={onNext} 
            className="px-10 py-4 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/90 disabled:opacity-30 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
             {isPoster ? "Analyze Geometry" : "Associate Film"} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
