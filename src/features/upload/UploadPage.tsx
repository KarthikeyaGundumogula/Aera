import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ORIGINALS } from "../../mock";
import { THEATRE_FORMATS } from "../../constants/formats";

// Step Components
import { IntelStep } from "./components/steps/IntelStep";
import { TransmissionStep } from "./components/steps/TransmissionStep";
import { ProjectStep } from "./components/steps/ProjectStep";
import { GeometryStep } from "./components/steps/GeometryStep";
import { SealStep } from "./components/steps/SealStep";

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

  const updateFormData = useCallback((data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const handleNext = useCallback(() => {
    const steps: Step[] = ["INTEL", "TRANSMISSION", "PROJECT", "GEOMETRY", "SEAL"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  }, [step]);

  const handleBack = useCallback(() => {
    const steps: Step[] = ["INTEL", "TRANSMISSION", "PROJECT", "GEOMETRY", "SEAL"];
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
            {step === "INTEL" && (
              <IntelStep 
                category={formData.category} 
                title={formData.title} 
                setFormData={updateFormData} 
                onNext={handleNext} 
              />
            )}
            {step === "TRANSMISSION" && (
              <TransmissionStep 
                platform={formData.platform} 
                contentUrl={formData.contentUrl} 
                setFormData={updateFormData} 
                onNext={handleNext} 
                onBack={handleBack} 
              />
            )}
            {step === "PROJECT" && (
              <ProjectStep 
                originals={ORIGINALS} 
                selectedId={formData.originalId} 
                setFormData={updateFormData} 
                onNext={handleNext} 
                onBack={handleBack} 
              />
            )}
            {step === "GEOMETRY" && (
              <GeometryStep 
                formData={formData} 
                currentOriginal={currentOriginal} 
                setFormData={updateFormData} 
                onNext={handleNext} 
                onBack={handleBack} 
              />
            )}
            {step === "SEAL" && (
              <SealStep 
                isSubmitting={isSubmitting} 
                formData={formData} 
                currentOriginal={currentOriginal} 
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
