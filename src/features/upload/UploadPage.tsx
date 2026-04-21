import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ORIGINALS } from "../../mock";
import { THEATRE_FORMATS } from "../../constants/formats";

// Step Components
import { IdentityStep } from "./components/steps/IdentityStep";
import { SourceStep } from "./components/steps/SourceStep";
import { CreditsStep } from "./components/steps/CreditsStep";
import { FormatStep } from "./components/steps/FormatStep";
import { ReviewStep } from "./components/steps/ReviewStep";

type Step = "IDENTITY" | "CREDITS" | "SOURCE" | "FORMAT" | "REVIEW";

export default function UploadPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("IDENTITY");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    originalIds: [] as string[],
    title: "",
    category: "Edit" as "Edit" | "Poster",
    contentUrl: "",
    aspectRatio: THEATRE_FORMATS.IMAX.ratio as number,
    platform: "youtube" as "youtube" | "twitter",
  });

  const selectedOriginals = useMemo(() => 
    ORIGINALS.filter(o => formData.originalIds.includes(o.id)), 
  [formData.originalIds]);

  const updateFormData = useCallback((data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const handleNext = useCallback(() => {
    const steps: Step[] = ["IDENTITY", "CREDITS", "SOURCE", "FORMAT", "REVIEW"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  }, [step]);

  const handleBack = useCallback(() => {
    const steps: Step[] = ["IDENTITY", "CREDITS", "SOURCE", "FORMAT", "REVIEW"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  }, [step]);

  const handleRelease = useCallback(() => {
    setIsSubmitting(true);
    setTimeout(() => {
      navigate("/theatre");
    }, 3500);
  }, [navigate]);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-y-auto font-sans selection:bg-white selection:text-black">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.03] blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-32 flex flex-col min-h-screen">
        {/* GLOBAL EXIT ACTION */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate("/theatre")}
          className="group flex items-center gap-3 w-fit mb-12 hover:text-white/70 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Exit Studio</span>
        </motion.button>

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
              {(["IDENTITY", "CREDITS", "SOURCE", "FORMAT", "REVIEW"] as Step[]).map((s, i) => (
                <div 
                  key={s} 
                  className={`h-1 w-8 rounded-full transition-all duration-500 ${
                    i <= ["IDENTITY", "CREDITS", "SOURCE", "FORMAT", "REVIEW"].indexOf(step) 
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
            {step === "IDENTITY" && (
              <IdentityStep 
                category={formData.category} 
                title={formData.title} 
                setFormData={updateFormData} 
                onNext={handleNext} 
              />
            )}
            {step === "CREDITS" && (
              <CreditsStep 
                originals={ORIGINALS} 
                selectedIds={formData.originalIds} 
                setFormData={updateFormData} 
                onNext={handleNext} 
                onBack={handleBack} 
              />
            )}
            {step === "SOURCE" && (
              <SourceStep 
                category={formData.category}
                platform={formData.platform} 
                contentUrl={formData.contentUrl} 
                originalIds={formData.originalIds}
                setFormData={updateFormData} 
                onNext={handleNext} 
                onBack={handleBack} 
              />
            )}
            {step === "FORMAT" && (
              <FormatStep 
                formData={formData} 
                currentOriginal={selectedOriginals[0]} 
                setFormData={updateFormData} 
                onNext={handleNext} 
                onBack={handleBack} 
              />
            )}
            {step === "REVIEW" && (
              <ReviewStep 
                isSubmitting={isSubmitting} 
                formData={formData} 
                currentOriginal={selectedOriginals[0]} 
                onRelease={handleRelease} 
                onBack={handleBack} 
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
