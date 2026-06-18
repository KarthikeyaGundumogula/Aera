import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

import { THEATRE_FORMATS } from "../../../constants/formats";
import { IdentityStep } from "./steps/IdentityStep";
import { SourceStep } from "./steps/SourceStep";
import { CreditsStep } from "./steps/CreditsStep";
import { FormatStep } from "./steps/FormatStep";
import { ReviewStep } from "./steps/ReviewStep";
import type {
  UploadFlowConfig,
  UploadFormData,
  UploadStep,
  UploadScriptPage,
} from "../types";

const UPLOAD_STEPS: UploadStep[] = ["IDENTITY", "CREDITS", "SOURCE", "FORMAT", "REVIEW"];

function revokeUrls(urls: string[]) {
  urls.forEach((url) => {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  });
}

function getScriptPageUrls(scriptPages: UploadScriptPage[]) {
  return scriptPages.map((page) => page.url).filter((url) => url.startsWith("blob:"));
}

export function UploadStudioFlow({
  exitLabel,
  headerEyebrow,
  title,
  accentIcon = "line",
  onExit,
  onComplete,
  originals,
  initialOriginalIds = [],
  festivalId,
  setId,
}: UploadFlowConfig) {
  const [step, setStep] = useState<UploadStep>("IDENTITY");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UploadFormData>({
    originalIds: initialOriginalIds,
    title: "",
    category: "Edit",
    contentUrl: "",
    scriptPages: [],
    aspectRatio: THEATRE_FORMATS.IMAX.ratio,
    platform: "youtube",
  });
  const previousBlobUrlsRef = useRef<string[]>([]);

  const selectedOriginals = useMemo(
    () => originals.filter((original) => formData.originalIds.includes(original.id)),
    [formData.originalIds, originals],
  );
  const titleLines = useMemo(() => title.split("\n"), [title]);

  const updateFormData = useCallback((data: Partial<UploadFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const handleNext = useCallback(() => {
    const currentIndex = UPLOAD_STEPS.indexOf(step);
    if (currentIndex < UPLOAD_STEPS.length - 1) {
      let nextStep = UPLOAD_STEPS[currentIndex + 1];
      if (nextStep === "FORMAT" && formData.category === "Script") {
        nextStep = "REVIEW";
      }
      setStep(nextStep);
    }
  }, [formData.category, step]);

  const handleBack = useCallback(() => {
    const currentIndex = UPLOAD_STEPS.indexOf(step);
    if (currentIndex > 0) {
      let previousStep = UPLOAD_STEPS[currentIndex - 1];
      if (previousStep === "FORMAT" && formData.category === "Script") {
        previousStep = "SOURCE";
      }
      setStep(previousStep);
    }
  }, [formData.category, step]);

  const { addWork } = useAuth();

  const handleRelease = useCallback(() => {
    setIsSubmitting(true);
    
    const newWork = {
      id: `work-custom-${Date.now()}`,
      title: formData.title,
      category: formData.category,
      image: formData.category === "Script" ? (formData.scriptPages[0]?.url || "") : formData.contentUrl,
      platform: formData.platform,
      srcId: formData.platform === "youtube" ? (formData.contentUrl.split("v=")[1] || formData.contentUrl.split("/").pop() || "") : "",
      credits: 0,
      aspectRatio: formData.aspectRatio,
      originalIds: formData.originalIds,
      festivalId,
      setId,
    };
    
    addWork(newWork);

    window.setTimeout(() => {
      onComplete();
    }, 3500);
  }, [onComplete, formData, addWork, festivalId, setId]);

  useEffect(() => {
    const activeBlobUrls = [
      ...(formData.contentUrl.startsWith("blob:") ? [formData.contentUrl] : []),
      ...getScriptPageUrls(formData.scriptPages),
    ];

    const removedUrls = previousBlobUrlsRef.current.filter(
      (url) => !activeBlobUrls.includes(url),
    );
    revokeUrls(removedUrls);
    previousBlobUrlsRef.current = activeBlobUrls;
  }, [formData.contentUrl, formData.scriptPages]);

  useEffect(() => {
    return () => {
      revokeUrls(previousBlobUrlsRef.current);
    };
  }, []);

  const headerAdornment =
    accentIcon === "sparkles" ? (
      <Sparkles className="w-4 h-4 text-yellow-400/60" />
    ) : (
      <div className="h-px w-12 bg-white/20" />
    );

  return (
    <div className="relative min-h-screen bg-surface-deep text-white overflow-y-auto font-sans selection:bg-white selection:text-black">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.03] blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-32 flex flex-col min-h-screen">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onExit}
          className="group flex items-center gap-3 w-fit mb-12 hover:text-white/70 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{exitLabel}</span>
        </motion.button>

        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            {headerAdornment}
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
              {headerEyebrow}
            </span>
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-[-0.02em] leading-[0.9]">
                {titleLines.map((line, index) => (
                  <span key={line}>
                    {line}
                    {index < titleLines.length - 1 && <br />}
                  </span>
                ))}
              </h1>
            </div>

            <div className="flex gap-2">
              {UPLOAD_STEPS.map((uploadStep, index) => {
                if (uploadStep === "FORMAT" && formData.category === "Script") return null;
                return (
                  <div
                    key={uploadStep}
                    className={`h-1 w-8 rounded-full transition-all duration-500 ${
                      index <= UPLOAD_STEPS.indexOf(step)
                        ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        : "bg-white/10"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </header>

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
                originals={originals}
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
