import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ORIGINALS_DATA } from "../../mock";
import { THEATRE_FORMATS } from "../../constants/formats";

// Step Components (Reusing existing Studio steps)
import { IdentityStep } from "./components/steps/IdentityStep";
import { SourceStep } from "./components/steps/SourceStep";
import { CreditsStep } from "./components/steps/CreditsStep";
import { FormatStep } from "./components/steps/FormatStep";
import { ReviewStep } from "./components/steps/ReviewStep";

type Step = "IDENTITY" | "CREDITS" | "SOURCE" | "FORMAT" | "REVIEW";
const UPLOAD_STEPS: Step[] = ["IDENTITY", "CREDITS", "SOURCE", "FORMAT", "REVIEW"];

export default function OriginalReleaseUploadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("IDENTITY");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const original = id ? ORIGINALS_DATA[id] : null;

  const [formData, setFormData] = useState({
    originalIds: [id] as string[],
    title: "",
    category: "Edit" as "Edit" | "Poster" | "Script",
    contentUrl: "",
    scriptPages: [] as { url: string; text: string }[],
    aspectRatio: THEATRE_FORMATS.IMAX.ratio as number,
    platform: "youtube" as "youtube" | "twitter",
  });

  // Redirect if original doesn't exist
  useEffect(() => {
    if (!original) {
      navigate("/");
    }
  }, [original, navigate]);

  const selectedOriginals = useMemo(() => 
    original ? [original] : [], 
  [original]);

  const updateFormData = useCallback((data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const handleNext = useCallback(() => {
    const currentIndex = UPLOAD_STEPS.indexOf(step);
    if (currentIndex < UPLOAD_STEPS.length - 1) {
      let nextStep = UPLOAD_STEPS[currentIndex + 1];
      
      // Skip FORMAT for scripts
      if (nextStep === "FORMAT" && formData.category === "Script") {
        nextStep = "REVIEW";
      }
      
      setStep(nextStep);
    }
  }, [step, formData.category]);

  const handleBack = useCallback(() => {
    const currentIndex = UPLOAD_STEPS.indexOf(step);
    if (currentIndex > 0) {
      let prevStep = UPLOAD_STEPS[currentIndex - 1];
      
      // Skip FORMAT for scripts
      if (prevStep === "FORMAT" && formData.category === "Script") {
        prevStep = "SOURCE";
      }
      
      setStep(prevStep);
    }
  }, [step, formData.category]);

  const handleRelease = useCallback(() => {
    setIsSubmitting(true);
    setTimeout(() => {
      navigate(`/originals/${id}`);
    }, 3500);
  }, [navigate, id]);

  if (!original) return null;

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-y-auto font-sans selection:bg-white selection:text-black">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.03] blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-32 flex flex-col min-h-screen">
        {/* GLOBAL EXIT ACTION */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(`/originals/${id}`)}
          className="group flex items-center gap-3 w-fit mb-12 hover:text-white/70 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Return to {original.title}</span>
        </motion.button>

        {/* HEADER SECTION */}
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <Sparkles className="w-4 h-4 text-yellow-400/60" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Studio Session: {original.title}</span>
          </motion.div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-[-0.02em] leading-[0.9]">
                Initiate <br /> <span className="text-white/30">Official Release</span>
              </h1>
            </div>
            
            {/* PROGRESS INDICATOR */}
            <div className="flex gap-2">
              {UPLOAD_STEPS.map((s, i) => {
                if (s === "FORMAT" && formData.category === "Script") return null;
                return (
                  <div 
                    key={s} 
                    className={`h-1 w-8 rounded-full transition-all duration-500 ${
                      i <= UPLOAD_STEPS.indexOf(step) 
                        ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                        : "bg-white/10"
                    }`} 
                  />
                );
              })}
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
                originals={Object.values(ORIGINALS_DATA)} 
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
                scriptPages={formData.scriptPages}
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
