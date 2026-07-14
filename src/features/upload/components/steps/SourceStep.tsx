import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Upload, Image as ImageIcon, X, Plus, Link } from "lucide-react";
import { useRef } from "react";
import type {
  UpdateUploadFormData,
  UploadCategory,
  UploadPlatform,
  UploadStoryboardPage,
} from "../../types";

interface SourceStepProps {
  category: UploadCategory;
  platform: UploadPlatform;
  contentUrl: string;
  storyboardPages: UploadStoryboardPage[];
  originalIds: string[];
  setFormData: UpdateUploadFormData;
  onNext: () => void;
  onBack: () => void;
}

export function SourceStep({ 
  category,
  platform, 
  contentUrl, 
  storyboardPages,
  originalIds, 
  setFormData, 
  onNext, 
  onBack 
}: SourceStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPoster = category === "Poster";
  const isStoryboard = category === "Storyboard";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (isStoryboard) {
      const newPages = Array.from(files).map(file => ({
        url: URL.createObjectURL(file),
        text: ""
      }));
      setFormData({ storyboardPages: [...storyboardPages, ...newPages].slice(0, 10) });
    } else {
      const file = files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setFormData({ contentUrl: url });
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = () => {
    setFormData({ contentUrl: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeStoryboardPage = (index: number) => {
    const updated = storyboardPages.filter((_, i) => i !== index);
    setFormData({ storyboardPages: updated });
  };

  const updatePageText = (index: number, text: string) => {
    const updated = [...storyboardPages];
    updated[index] = { ...updated[index], text };
    setFormData({ storyboardPages: updated });
  };

  const canProceed = isStoryboard ? storyboardPages.length > 0 : !!contentUrl;

  return (
    <motion.div
      key="step-source"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="w-full max-w-xl"
    >
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Link className="w-4 h-4 text-white/50" />
          <h2 className="text-sm font-bold uppercase tracking-[0.3em]">The Source</h2>
        </div>
        <p className="text-white/40 text-xs text-balance">
          {isPoster 
            ? "Upload the high-resolution master of your poster"
            : isStoryboard
              ? "Upload storyboard pages and add their narrative (Max 10)"
              : `Link your work for the ${originalIds?.length || 0} selected film${(originalIds?.length !== 1) ? 's' : ''}`
          }
        </p>
      </div>
      
      <div className="space-y-8">
        {(!isPoster && !isStoryboard) ? (
          /* ── VIDEO SOURCE (EDIT) ── */
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
        ) : isPoster ? (
          /* ── POSTER SOURCE ── */
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
                <div className="p-4 rounded-xl bg-white/5 text-white/40 group-hover:text-white transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black uppercase tracking-widest mb-1">Upload Original Master</p>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">PNG, JPG or WebP up to 50MB</p>
                </div>
              </button>
            ) : (
              <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-black aspect-[16/6]">
                <img loading="lazy" src={contentUrl} className="w-full h-full object-cover opacity-60" alt="Poster preview" />
                <div className="absolute inset-0 flex items-center justify-center gap-4">
                   <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                      <ImageIcon className="w-4 h-4 text-white/40" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Master Artifact Ready</span>
                   </div>
                   <button 
                    onClick={removeFile}
                    className="p-2 bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                   >
                     <X className="w-4 h-4" />
                   </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── STORYBOARD SOURCE (MULTI-IMAGE + TEXT) ── */
          <div className="space-y-6">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {storyboardPages.map((page, idx) => (
                  <motion.div 
                    key={page.url}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 group"
                  >
                    <div className="relative w-24 aspect-[2/3] rounded-lg overflow-hidden border border-white/10 shrink-0">
                      <img
                        loading="lazy"
                        src={page.url}
                        className="w-full h-full object-cover object-top"
                        alt={`Page ${idx + 1}`}
                      />
                      <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-black">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">Page Narrative</span>
                        <button 
                          onClick={() => removeStoryboardPage(idx)}
                          className="p-1 text-white/20 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <textarea 
                        value={page.text}
                        onChange={(e) => updatePageText(idx, e.target.value)}
                        placeholder="Add cinematic notes for this page..."
                        className="flex-1 bg-white/5 border border-white/5 rounded-xl p-3 text-[11px] leading-relaxed font-medium outline-none focus:border-white/20 transition-all resize-none placeholder:text-white/5"
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {storyboardPages.length < 10 && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.01] flex flex-col items-center justify-center gap-2 hover:bg-white/[0.03] hover:border-white/10 transition-all group"
                >
                  <Plus className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-colors" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/40">
                    Add {storyboardPages.length > 0 ? "Another Page" : "First Page"}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <button onClick={onBack} className="text-white/40 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
            <ChevronLeft className="w-4 h-4" /> BACK
          </button>
          <button 
            disabled={!canProceed}
            onClick={onNext} 
            className="px-10 py-4 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/90 disabled:opacity-30 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
             NEXT <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
