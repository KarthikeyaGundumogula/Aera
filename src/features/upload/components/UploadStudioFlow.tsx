import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "@/lib/api";
import { extractSrcId } from "../../../utils/embed";


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
  UploadStoryboardPage,
} from "../types";

const UPLOAD_STEPS: UploadStep[] = ["IDENTITY", "CREDITS", "SOURCE", "FORMAT", "REVIEW"];

function revokeUrls(urls: string[]) {
  urls.forEach((url) => {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  });
}

function getStoryboardPageUrls(storyboardPages: UploadStoryboardPage[]) {
  return storyboardPages.map((page) => page.url).filter((url) => url.startsWith("blob:"));
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
  uploadTargetUrl,
  isOriginalRelease,
  originalId,
}: UploadFlowConfig) {
  const [step, setStep] = useState<UploadStep>("IDENTITY");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UploadFormData>({
    originalIds: initialOriginalIds,
    title: "",
    category: "Edit",
    contentUrl: "",
    storyboardPages: [],
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
      if (nextStep === "FORMAT" && formData.category === "Storyboard") {
        nextStep = "REVIEW";
      }
      setStep(nextStep);
    }
  }, [formData.category, step]);

  const handleBack = useCallback(() => {
    const currentIndex = UPLOAD_STEPS.indexOf(step);
    if (currentIndex > 0) {
      let previousStep = UPLOAD_STEPS[currentIndex - 1];
      if (previousStep === "FORMAT" && formData.category === "Storyboard") {
        previousStep = "SOURCE";
      }
      setStep(previousStep);
    }
  }, [formData.category, step]);

  const { addWork, fetchUserWorks, currentArtist } = useAuth();

  /**
   * Maps front-end aspect ratio numbers to TARS EditFormat enum values.
   * TARS EditFormat: IMAX | ACADEMY | SQUARE | VERTICAL
   */
  function getEditFormat(ratio: number): string {
    if (ratio >= 1.5) return "IMAX";
    if (ratio >= 1.1) return "ACADEMY";
    if (ratio <= 0.7) return "VERTICAL";
    return "SQUARE";
  }

  /**
   * Maps front-end aspect ratio numbers to TARS PosterFormat enum values.
   * TARS PosterFormat: CANVAS | STANDARD | SQUARE | VERTICAL
   */
  function getPosterFormat(ratio: number): string {
    if (ratio >= 1.5) return "CANVAS";
    if (ratio <= 0.7) return "VERTICAL";
    if (Math.abs(ratio - 1.0) < 0.1) return "SQUARE";
    return "STANDARD"; // 2:3 portrait
  }

  /**
   * Maps front-end platform string to TARS SupportedPlatforms enum value.
   * TARS SupportedPlatforms: YOUTUBE | TWITTER | NATIVE
   */
  function getTarsPlatform(platform: string): string {
    if (platform.toLowerCase() === "youtube") return "YOUTUBE";
    if (platform.toLowerCase() === "twitter") return "TWITTER";
    return "NATIVE";
  }

  /**
   * Sanitizes work title to conform to Rust WorkTitle constraints:
   * 1. Max 100 characters
   * 2. No leading/trailing spaces
   * 3. Only Unicode letters and spaces (strips numbers/symbols that cause Rust 400 parse errors)
   */
  function cleanWorkTitle(inputTitle?: string): string | undefined {
    if (!inputTitle) return undefined;
    const cleaned = inputTitle
      .replace(/[^a-zA-Z\u0C00-\u0C7F\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (cleaned.length === 0) return undefined;
    return cleaned.slice(0, 100);
  }

  /**
   * Filters out mock non-UUID IDs (e.g. "org-1") so Rust's Option<Vec<Uuid>> deserializes without 400 errors.
   */
  function cleanOriginalUuids(originalIds?: string[]): string[] | undefined {
    if (!originalIds || originalIds.length === 0) return undefined;
    const validUuids = originalIds.filter((id) =>
      /^[0-9a-fA-F-]{36}$/.test(id)
    );
    return validUuids.length > 0 ? validUuids : undefined;
  }

  const handleRelease = useCallback(async () => {
    setIsSubmitting(true);
    setUploadError(null);
    let uploadSucceeded = false;

    const categoryEndpointMap: Record<string, string> = {
      Edit: "EDIT",
      Poster: "POSTER",
      Storyboard: "SCRIPT",
    };
    const workTypeEndpoint = categoryEndpointMap[formData.category] || "EDIT";

    try {
      const activePlatform = isOriginalRelease ? "youtube" : (formData.platform || "youtube");
      let backendSrcId = extractSrcId(formData.contentUrl, activePlatform);
      let backendSrcIds: string[] = [];

      if (formData.category === "Poster") {
        backendSrcId = `https://picsum.photos/seed/${Date.now()}/800/1200`;
      } else if (formData.category === "Storyboard") {
        backendSrcIds = formData.storyboardPages.map(
          (_, i) => `https://picsum.photos/seed/${Date.now() + i}/600/900`
        );
      }

      const cleanTitle = cleanWorkTitle(formData.title);
      const cleanOriginals = cleanOriginalUuids(formData.originalIds);

      // ─── Build correctly-typed TARS payload ─────────────────────────────────
      let payload: Record<string, unknown>;
      if (formData.category === "Edit") {
        payload = {
          title: cleanTitle,
          work_type: "EDIT",
          src_id: backendSrcId,
          platform: getTarsPlatform(activePlatform),
          format: getEditFormat(formData.aspectRatio),
          originals: cleanOriginals,
        };
      } else if (formData.category === "Poster") {
        payload = {
          title: cleanTitle,
          work_type: "POSTER",
          src_id: backendSrcId,
          format: getPosterFormat(formData.aspectRatio),
          originals: cleanOriginals,
        };
      } else {
        payload = {
          title: cleanTitle,
          work_type: "SCRIPT",
          src_ids: backendSrcIds,
          thoughts: formData.storyboardPages.map((p) => (p.text || "").slice(0, 5000)),
          originals: cleanOriginals,
        };
      }

      const targetOrgId = originalId || formData.originalIds[0] || initialOriginalIds[0];
      const validOrgUuid = targetOrgId && /^[0-9a-fA-F-]{36}$/.test(targetOrgId) ? targetOrgId : undefined;

      // Ensure original_id is present in payload.originals when uploading an original release
      if (validOrgUuid) {
        const existingOriginals = (payload.originals as string[]) || [];
        if (!existingOriginals.includes(validOrgUuid)) {
          payload.originals = [...existingOriginals, validOrgUuid];
        }
      }

      // Target endpoint: if uploading for a set, hit POST /sets/{setId}/new/work/{workTypeEndpoint}
      const targetEndpoint =
        uploadTargetUrl ||
        (setId && /^[0-9a-fA-F-]{36}$/.test(setId)
          ? `/sets/${setId}/new/work/${workTypeEndpoint}`
          : `/works/new/${workTypeEndpoint}`);

      const uploadRes = await apiFetch(targetEndpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (uploadRes.ok) {
        // ✅ Refresh studio works list from backend — this is the canonical source of truth
        if (currentArtist?.id) {
          await fetchUserWorks(currentArtist.id);
        }
        // Backend succeeded: DO NOT call addWork — fetchUserWorks already populated the list
        uploadSucceeded = true;
      } else {
        const errText = await uploadRes.text().catch(() => "");
        let friendlyMessage = "Upload failed. Please try again.";
        try {
          const errJson = JSON.parse(errText);
          if (errJson.message) friendlyMessage = errJson.message;
        } catch { /* non-JSON error body */ }
        console.warn("[UploadStudioFlow] Backend upload returned:", uploadRes.status, errText);
        setUploadError(friendlyMessage);
      }
    } catch (e) {
      console.warn("[UploadStudioFlow] Backend submission error:", e);
      setUploadError("Network error. Check your connection and try again.");
    }




    // Only use addWork as a local fallback when the backend call failed
    // (keeps the UX working offline / during dev). When the backend succeeded,
    // fetchUserWorks already refreshed the list — adding again causes the
    // duplicate-key React warning and shows the work twice in the studio.
    if (!uploadSucceeded) {
      const newWork = {
        id: `work-custom-${Date.now()}`,
        title: formData.title,
        category: formData.category,
        image: formData.category === "Storyboard" ? (formData.storyboardPages[0]?.url || "") : formData.contentUrl,
        platform: formData.platform,
        srcId: extractSrcId(formData.contentUrl, formData.platform || "youtube"),
        credits: 0,
        aspectRatio: formData.aspectRatio,
        originalIds: formData.originalIds,
        festivalId,
        setId,
      };
      addWork(newWork);
    }

    setIsSubmitting(false);

    // Only navigate to Studio if the upload actually worked
    if (uploadSucceeded) {
      window.setTimeout(() => {
        onComplete();
      }, 1800);
    }
    // If it failed, uploadError is set — ReviewStep will show the error banner.
  }, [onComplete, formData, addWork, fetchUserWorks, currentArtist, festivalId, setId]);


  useEffect(() => {
    const activeBlobUrls = [
      ...(formData.contentUrl.startsWith("blob:") ? [formData.contentUrl] : []),
      ...getStoryboardPageUrls(formData.storyboardPages),
    ];

    const removedUrls = previousBlobUrlsRef.current.filter(
      (url) => !activeBlobUrls.includes(url),
    );
    revokeUrls(removedUrls);
    previousBlobUrlsRef.current = activeBlobUrls;
  }, [formData.contentUrl, formData.storyboardPages]);

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
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.03] blur-[120px] rounded-xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[120px] rounded-xl" />
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
                if (uploadStep === "FORMAT" && formData.category === "Storyboard") return null;
                return (
                  <div
                    key={uploadStep}
                    className={`h-1 w-8 rounded-xl transition-all duration-500 ${
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
                storyboardPages={formData.storyboardPages}
                originalIds={formData.originalIds}
                setFormData={updateFormData}
                onNext={handleNext}
                onBack={handleBack}
                isOriginalRelease={isOriginalRelease}
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
                uploadError={uploadError}
                formData={formData}
                currentOriginal={selectedOriginals[0]}
                onRelease={handleRelease}
                onRetry={() => { setUploadError(null); setIsSubmitting(false); }}
                onBack={handleBack}
              />
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
