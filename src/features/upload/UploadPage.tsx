import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronRight, 
  ChevronLeft, 
  Film, 
  Image as ImageIcon, 
  Monitor, 
  Tv, 
  Smartphone, 
  Square,
  CheckCircle2,
  Lock, 
  Sparkles, 
  Clapperboard 
} from "lucide-react";
import { ORIGINALS } from "../../mock";
import { TheatreItem } from "../../types";
import { WorkPreview } from "./components/WorkPreview";
import { THEATRE_FORMATS } from "../../constants/formats";

// Step 1: INTEL (Title, Category)
// Step 2: TRANSMISSION (URL)
// Step 3: PROJECT (Select Original)
// Step 4: GEOMETRY (Format)
// Step 5: SEAL (Finalize Release)
type Step = "INTEL" | "TRANSMISSION" | "PROJECT" | "GEOMETRY" | "SEAL";

export default function UploadPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("INTEL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    originalId: "",
    title: "",
    category: "Edit" as "Edit" | "Poster",
    contentUrl: "",
    aspectRatio: THEATRE_FORMATS.IMAX.ratio as number,
    platform: "youtube" as "youtube" | "twitter",
  });

  const currentOriginal = useMemo(() => 
    ORIGINALS.find(o => o.id === formData.originalId), 
  [formData.originalId]);

  const handleNext = () => {
    if (step === "INTEL") setStep("TRANSMISSION");
    else if (step === "TRANSMISSION") setStep("PROJECT");
    else if (step === "PROJECT") setStep("GEOMETRY");
    else if (step === "GEOMETRY") setStep("SEAL");
  };

  const handleBack = () => {
    if (step === "TRANSMISSION") setStep("INTEL");
    else if (step === "PROJECT") setStep("TRANSMISSION");
    else if (step === "GEOMETRY") setStep("PROJECT");
    else if (step === "SEAL") setStep("GEOMETRY");
  };

  const handleRelease = () => {
    setIsSubmitting(true);
    // Simulate deep space archiving
    setTimeout(() => {
      navigate("/theatre");
    }, 3500);
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-white selection:text-black">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.03] blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12 flex flex-col min-h-screen">
        
        {/* HEADER SECTION */}
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="h-px w-12 bg-white/20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">The Release Rite</span>
          </motion.div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-[-0.02em] leading-[0.9]">
                Initiate <br /> <span className="text-white/30">Release</span>
              </h1>
            </div>
            
            {/* PROGRESS INDICATOR */}
            <div className="flex gap-2">
              {(["INTEL", "TRANSMISSION", "PROJECT", "GEOMETRY", "SEAL"] as Step[]).map((s, i) => (
                <div 
                  key={s} 
                  className={`h-1 w-8 rounded-full transition-all duration-500 ${
                    i <= ["INTEL", "TRANSMISSION", "PROJECT", "GEOMETRY", "SEAL"].indexOf(step) 
                      ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                      : "bg-white/10"
                  }`} 
                />
              ))}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: INTEL */}
            {step === "INTEL" && (
              <motion.div
                key="step-intel"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="w-full max-w-xl"
              >
                <div className="text-center mb-12">
                  <h2 className="text-sm font-bold uppercase tracking-[0.3em] mb-2">The Identity</h2>
                  <p className="text-white/40 text-xs text-balance">Define the entry point of your release</p>
                </div>
                
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setFormData({...formData, category: "Edit"})}
                      className={`flex-1 p-6 rounded-2xl border transition-all duration-300 ${
                        formData.category === "Edit" ? "bg-white text-black border-white" : "bg-white/5 text-white border-white/10 hover:border-white/20"
                      }`}
                    >
                      <Film className="w-6 h-6 mb-3" />
                      <div className="text-left">
                        <div className="text-xs font-black uppercase tracking-widest leading-none mb-1">Cinematic Edit</div>
                        <div className={`text-[9px] font-bold uppercase tracking-widest ${formData.category === "Edit" ? "text-black/40" : "text-white/30"}`}>Motion Art</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => setFormData({...formData, category: "Poster"})}
                      className={`flex-1 p-6 rounded-2xl border transition-all duration-300 ${
                        formData.category === "Poster" ? "bg-white text-black border-white" : "bg-white/5 text-white border-white/10 hover:border-white/20"
                      }`}
                    >
                      <ImageIcon className="w-6 h-6 mb-3" />
                      <div className="text-left">
                        <div className="text-xs font-black uppercase tracking-widest leading-none mb-1">Cinematic Poster</div>
                        <div className={`text-[9px] font-bold uppercase tracking-widest ${formData.category === "Poster" ? "text-black/40" : "text-white/30"}`}>Static Visual</div>
                      </div>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <input 
                      type="text"
                      placeholder="Title of Release"
                      autoFocus
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xl font-medium focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all placeholder:text-white/10"
                    />
                  </div>

                  <div className="flex items-center justify-end pt-4">
                    <button 
                      disabled={!formData.title}
                      onClick={handleNext} 
                      className="px-10 py-4 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/90 disabled:opacity-30 transition-all flex items-center gap-2"
                    >
                      Establish Transmission <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: TRANSMISSION */}
            {step === "TRANSMISSION" && (
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
                      onClick={() => setFormData({...formData, platform: "youtube"})}
                      className={`flex-1 p-6 rounded-2xl border transition-all duration-300 ${
                        formData.platform === "youtube" ? "bg-red-500/10 border-red-500/50 text-red-500" : "bg-white/5 text-white border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="text-xs font-black uppercase tracking-widest text-center">Youtube</div>
                    </button>
                    <button 
                      onClick={() => setFormData({...formData, platform: "twitter"})}
                      className={`flex-1 p-6 rounded-2xl border transition-all duration-300 ${
                        formData.platform === "twitter" ? "bg-blue-500/10 border-blue-500/50 text-blue-500" : "bg-white/5 text-white border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="text-xs font-black uppercase tracking-widest text-center">Twitter / X</div>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <input 
                      type="url"
                      placeholder={formData.platform === 'youtube' ? "https://youtube.com/watch?v=..." : "https://twitter.com/status/..."}
                      autoFocus
                      value={formData.contentUrl}
                      onChange={(e) => setFormData({...formData, contentUrl: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-base font-mono focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all placeholder:text-white/10"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button onClick={handleBack} className="text-white/40 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button 
                      disabled={!formData.contentUrl}
                      onClick={handleNext} 
                      className="px-10 py-4 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/90 disabled:opacity-30 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    >
                      Assign Project <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PROJECT SELECTION */}
            {step === "PROJECT" && (
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
                  {ORIGINALS.map((org) => (
                    <motion.button
                      key={org.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setFormData({ ...formData, originalId: org.id });
                        handleNext();
                      }}
                      className={`relative aspect-[2/3] group rounded-xl overflow-hidden border-2 transition-all duration-500 ${
                        formData.originalId === org.id ? "border-white" : "border-transparent"
                      }`}
                    >
                      <img src={org.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className={`absolute inset-0 bg-black/70 flex flex-col items-center justify-end p-4 transition-opacity duration-300 ${
                        formData.originalId === org.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}>
                         <CheckCircle2 className={`w-8 h-8 mb-4 transition-transform duration-500 scale-0 ${formData.originalId === org.id ? "scale-100" : ""}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-center">{org.title}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-12 flex justify-start">
                    <button onClick={handleBack} className="text-white/40 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: GEOMETRY */}
            {step === "GEOMETRY" && (
              <motion.div
                key="step-geometry"
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
                    <h2 className="text-sm font-bold uppercase tracking-[0.3em] mb-2 text-white/80">The Geometry</h2>
                    <p className="text-white/40 text-xs">Calibrate the container for your release</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {formData.category === "Edit" ? (
                      <>
                        <FormatButton 
                          icon={<Monitor />} 
                          label={THEATRE_FORMATS.IMAX.label} 
                          sub={THEATRE_FORMATS.IMAX.sub} 
                          active={formData.aspectRatio === THEATRE_FORMATS.IMAX.ratio} 
                          onClick={() => setFormData({...formData, aspectRatio: THEATRE_FORMATS.IMAX.ratio})} 
                        />
                         <FormatButton 
                          icon={<Tv />} 
                          label={THEATRE_FORMATS.ACADEMY.label} 
                          sub={THEATRE_FORMATS.ACADEMY.sub} 
                          active={formData.aspectRatio === THEATRE_FORMATS.ACADEMY.ratio} 
                          onClick={() => setFormData({...formData, aspectRatio: THEATRE_FORMATS.ACADEMY.ratio})} 
                        />
                         <FormatButton 
                          icon={<Smartphone />} 
                          label={THEATRE_FORMATS.VERTICAL_VIDEO.label} 
                          sub={THEATRE_FORMATS.VERTICAL_VIDEO.sub} 
                          active={formData.aspectRatio === THEATRE_FORMATS.VERTICAL_VIDEO.ratio} 
                          onClick={() => setFormData({...formData, aspectRatio: THEATRE_FORMATS.VERTICAL_VIDEO.ratio})} 
                        />
                         <FormatButton 
                          icon={<Square />} 
                          label={THEATRE_FORMATS.SQUARE_VIDEO.label} 
                          sub={THEATRE_FORMATS.SQUARE_VIDEO.sub} 
                          active={formData.aspectRatio === THEATRE_FORMATS.SQUARE_VIDEO.ratio} 
                          onClick={() => setFormData({...formData, aspectRatio: THEATRE_FORMATS.SQUARE_VIDEO.ratio})} 
                        />
                      </>
                    ) : (
                      <>
                        <FormatButton 
                          icon={<Film />} 
                          label={THEATRE_FORMATS.STANDARD_POSTER.label} 
                          sub={THEATRE_FORMATS.STANDARD_POSTER.sub} 
                          active={formData.aspectRatio === THEATRE_FORMATS.STANDARD_POSTER.ratio} 
                          onClick={() => setFormData({...formData, aspectRatio: THEATRE_FORMATS.STANDARD_POSTER.ratio})} 
                        />
                         <FormatButton 
                          icon={<Square />} 
                          label={THEATRE_FORMATS.SQUARE_POSTER.label} 
                          sub={THEATRE_FORMATS.SQUARE_POSTER.sub} 
                          active={formData.aspectRatio === THEATRE_FORMATS.SQUARE_POSTER.ratio} 
                          onClick={() => setFormData({...formData, aspectRatio: THEATRE_FORMATS.SQUARE_POSTER.ratio})} 
                        />
                         <FormatButton 
                          icon={<Smartphone />} 
                          label={THEATRE_FORMATS.VERTICAL_POSTER.label} 
                          sub={THEATRE_FORMATS.VERTICAL_POSTER.sub} 
                          active={formData.aspectRatio === THEATRE_FORMATS.VERTICAL_POSTER.ratio} 
                          onClick={() => setFormData({...formData, aspectRatio: THEATRE_FORMATS.VERTICAL_POSTER.ratio})} 
                        />
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-8">
                    <button onClick={handleBack} className="text-white/40 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button 
                      onClick={handleNext} 
                      className="px-8 py-3 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/90 transition-all flex items-center gap-2"
                    >
                      Seal Release <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Live Preview Side — desktop only (mobile shown above) */}
                <div className="hidden lg:block w-full lg:w-2/3 min-h-[400px]">
                  <WorkPreview formData={{...formData, title: formData.title || "Untitled Preview"}} originalCover={currentOriginal?.coverImage} />
                </div>
              </motion.div>
            )}

            {/* STEP 5: SEAL */}
            {step === "SEAL" && (
              <motion.div
                key="step-seal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg"
              >
                {!isSubmitting ? (
                    <div className="text-center space-y-10">
                         <div className="flex flex-col items-center gap-6">
                            <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center bg-white/[0.02] shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                                <Sparkles className="w-8 h-8 text-white/50 animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-[0.2em] mb-4">Mastering Ready</h1>
                                <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
                                    Your release is calibrated and assigned. 
                                    Perform the final check before we broadcast to the network.
                                </p>
                            </div>
                         </div>

                         {/* Release Summary Card */}
                         <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-left space-y-4">
                           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">Release Summary</p>
                           <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                               <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">Title</p>
                               <p className="text-sm font-bold text-white truncate">{formData.title}</p>
                             </div>
                             <div className="space-y-1">
                               <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">Category</p>
                               <p className="text-sm font-bold text-white">{formData.category === "Edit" ? "Cinematic Edit" : "Cinematic Poster"}</p>
                             </div>
                             <div className="space-y-1">
                               <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">Network</p>
                               <p className="text-sm font-bold text-white capitalize">{formData.platform}</p>
                             </div>
                             <div className="space-y-1">
                               <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">Project</p>
                               <p className="text-sm font-bold text-white truncate">{currentOriginal?.title ?? "—"}</p>
                             </div>
                           </div>
                           <div className="border-t border-white/5 pt-4 space-y-1">
                             <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">Source ID</p>
                             <p className="text-xs font-mono text-white/60 break-all">{formData.contentUrl || "—"}</p>
                           </div>
                         </div>

                         {/* Final Preview — click to verify embed */}
                         <div className="w-full flex justify-center">
                           <WorkPreview
                             formData={{...formData, title: formData.title || "Untitled Preview"}}
                             originalCover={currentOriginal?.coverImage}
                           />
                         </div>

                         <div className="flex flex-col gap-4">
                            <button 
                                onClick={handleRelease}
                                className="w-full py-6 bg-white text-black rounded-2xl text-sm font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                            >
                                <span className="group-hover:translate-x-1 transition-transform">Release Artifact</span> <Sparkles className="w-5 h-5" />
                            </button>
                            <button onClick={handleBack} className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest py-2">
                                Calibrate Parameters
                            </button>
                         </div>
                    </div>
                ) : (
                    <div className="text-center py-20">
                         <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="space-y-12"
                         >
                            <div className="relative w-40 h-40 mx-auto">
                                <motion.div 
                                    className="absolute inset-0 border-2 border-white/10 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.div 
                                    className="absolute inset-4 border border-white/20 rounded-full border-t-white"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Clapperboard className="w-10 h-10 text-white/80 animate-bounce" />
                                </div>
                                
                                {/* Orbiting Dots */}
                                <motion.div 
                                    className="absolute top-0 left-1/2 w-2 h-2 bg-white rounded-full -ml-1"
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
                )}
              </motion.div>
            )}

          
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function FormatButton({ icon, label, sub, active, onClick }: { icon: any, label: string, sub: string, active: boolean, onClick: () => void }) {
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
