import React from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Monitor, Tv, Smartphone, Square, Film } from "lucide-react";
import { WorkPreview } from "../WorkPreview";
import { THEATRE_FORMATS } from "../../../../constants/formats";

interface FormatStepProps {
  formData: any;
  currentOriginal: any;
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function FormatStep({ formData, currentOriginal, setFormData, onNext, onBack }: FormatStepProps) {
  return (
    <motion.div
      key="step-format"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="w-full flex flex-col lg:flex-row gap-8"
    >
      {/* Live Preview — shown FIRST on mobile, right side on desktop */}
      <div className="w-full lg:hidden">
        <WorkPreview formData={{...formData, title: formData.title || "Untitled Preview"}} originalCover={currentOriginal?.coverImage} />
      </div>

      {/* Visual Selector Side */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="mb-8 text-center lg:text-left">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] mb-2 text-white/80">The Format</h2>
          <p className="text-white/40 text-xs">Select how your release is framed in the theatre</p>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {formData.category === "Edit" ? (
            <>
              <FormatButton 
                icon={<Monitor />} 
                label={THEATRE_FORMATS.IMAX.label} 
                sub={THEATRE_FORMATS.IMAX.sub} 
                active={formData.aspectRatio === THEATRE_FORMATS.IMAX.ratio} 
                onClick={() => setFormData({ aspectRatio: THEATRE_FORMATS.IMAX.ratio })} 
              />
               <FormatButton 
                icon={<Tv />} 
                label={THEATRE_FORMATS.ACADEMY.label} 
                sub={THEATRE_FORMATS.ACADEMY.sub} 
                active={formData.aspectRatio === THEATRE_FORMATS.ACADEMY.ratio} 
                onClick={() => setFormData({ aspectRatio: THEATRE_FORMATS.ACADEMY.ratio })} 
              />
               <FormatButton 
                icon={<Smartphone />} 
                label={THEATRE_FORMATS.VERTICAL_VIDEO.label} 
                sub={THEATRE_FORMATS.VERTICAL_VIDEO.sub} 
                active={formData.aspectRatio === THEATRE_FORMATS.VERTICAL_VIDEO.ratio} 
                onClick={() => setFormData({ aspectRatio: THEATRE_FORMATS.VERTICAL_VIDEO.ratio })} 
              />
               <FormatButton 
                icon={<Square />} 
                label={THEATRE_FORMATS.SQUARE_VIDEO.label} 
                sub={THEATRE_FORMATS.SQUARE_VIDEO.sub} 
                active={formData.aspectRatio === THEATRE_FORMATS.SQUARE_VIDEO.ratio} 
                onClick={() => setFormData({ aspectRatio: THEATRE_FORMATS.SQUARE_VIDEO.ratio })} 
              />
            </>
          ) : (
            <>
              <FormatButton 
                icon={<Film />} 
                label={THEATRE_FORMATS.STANDARD_POSTER.label} 
                sub={THEATRE_FORMATS.STANDARD_POSTER.sub} 
                active={formData.aspectRatio === THEATRE_FORMATS.STANDARD_POSTER.ratio} 
                onClick={() => setFormData({ aspectRatio: THEATRE_FORMATS.STANDARD_POSTER.ratio })} 
              />
               <FormatButton 
                icon={<Square />} 
                label={THEATRE_FORMATS.SQUARE_POSTER.label} 
                sub={THEATRE_FORMATS.SQUARE_POSTER.sub} 
                active={formData.aspectRatio === THEATRE_FORMATS.SQUARE_POSTER.ratio} 
                onClick={() => setFormData({ aspectRatio: THEATRE_FORMATS.SQUARE_POSTER.ratio })} 
              />
               <FormatButton 
                icon={<Smartphone />} 
                label={THEATRE_FORMATS.VERTICAL_POSTER.label} 
                sub={THEATRE_FORMATS.VERTICAL_POSTER.sub} 
                active={formData.aspectRatio === THEATRE_FORMATS.VERTICAL_POSTER.ratio} 
                onClick={() => setFormData({ aspectRatio: THEATRE_FORMATS.VERTICAL_POSTER.ratio })} 
              />
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-8">
          <button onClick={onBack} className="text-white/40 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
            <ChevronLeft className="w-4 h-4" /> BACK
          </button>
          <button 
            onClick={onNext} 
            className="px-8 py-3 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/90 transition-all flex items-center gap-2"
          >
            NEXT <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Preview Side — desktop only (mobile shown above) */}
      <div className="hidden lg:block w-full lg:w-2/3 min-h-[400px]">
        <WorkPreview formData={{...formData, title: formData.title || "Untitled Preview"}} originalCover={currentOriginal?.coverImage} />
      </div>
    </motion.div>
  );
}

function FormatButton({ icon, label, sub, active, onClick }: { icon: React.ReactNode, label: string, sub: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-xl border flex items-center gap-4 transition-all duration-300 ${
        active ? "bg-white text-black border-white shadow-[0_0_35px_rgba(255,255,255,0.15)]" : "bg-white/5 text-white border-white/10 hover:border-white/20"
      }`}
    >
      <div className={`p-2 rounded-lg transition-colors ${active ? "bg-black text-white" : "bg-white/10"}`}>
        {icon}
      </div>
      <div className="text-left">
        <div className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{label}</div>
        <div className={`text-[9px] font-bold uppercase tracking-widest leading-none ${active ? "text-black/60" : "text-white/30"}`}>{sub}</div>
      </div>
    </button>
  );
}
