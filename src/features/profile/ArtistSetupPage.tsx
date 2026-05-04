import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";

import { PortraitIdentitySection } from "./components/PortraitIdentitySection";
import { AccessKeySection } from "./components/AccessKeySection";
import { SocialsSection, type SocialsData } from "./components/SocialsSection";
import { LiveStagePreview } from "./components/LiveStagePreview";
import { ArtistProfile } from "../shared/profile";
import { ARTISTS_MOCK } from "../../mock";
import { OriginalArtist } from "../../types";

interface ProfileFormData {
  username: string;
  displayName: string;
  tagline: string;
  password: string;
  socials: SocialsData;
  portraitFile: File | null;
  portraitPreview: string | null;
  imagePosition: string;
  themeTextColor: string;
  themeBgColor: string;
}

/**
 * ArtistSetupPage — "The Stage Rite"
 * Artists set their public profile: portrait, name, tagline, and socials.
 */
export default function ArtistSetupPage() {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [step, setStep] = useState(1);
  const [successArtist, setSuccessArtist] = useState<OriginalArtist | null>(
    null,
  );

  const labels = {
    rite: "The Stage Rite",
    action: "Shape Your Stage",
    prompt: "Your Stage For the Global theatre, Shape Your Hero, presnt yourself in your tone",
  };

  const [formData, setFormData] = useState<ProfileFormData>({
    username: "",
    displayName: "",
    tagline: "",
    password: "",
    socials: { instagram: "", twitter: "", youtube: "" },
    portraitFile: null,
    portraitPreview: null,
    imagePosition: "50% 0%",
    themeTextColor: "#fac107",
    themeBgColor: "#0f1a42",
  });

  const handleIdentityChange = useCallback(
    (field: "username" | "displayName" | "tagline", value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleAccessKeySet = useCallback((key: string) => {
    setFormData((prev) => ({ ...prev, password: key }));
  }, []);

  const handleSocialChange = useCallback(
    (platform: keyof SocialsData, value: string) => {
      setFormData((prev) => ({
        ...prev,
        socials: { ...prev.socials, [platform]: value },
      }));
    },
    [],
  );

  const handlePortraitChange = useCallback((file: File, preview: string) => {
    setFormData((prev) => ({
      ...prev,
      portraitFile: file,
      portraitPreview: preview,
      imagePosition: "50% 0%",
    }));
  }, []);

  const handlePortraitClear = useCallback(() => {
    setFormData((prev) => {
      if (prev.portraitPreview) URL.revokeObjectURL(prev.portraitPreview);
      return {
        ...prev,
        portraitFile: null,
        portraitPreview: null,
        imagePosition: "50% 0%",
      };
    });
  }, []);

  const handleImagePositionChange = useCallback((position: string) => {
    setFormData((prev) => ({ ...prev, imagePosition: position }));
  }, []);

  const handleTextColorChange = useCallback((color: string) => {
    setFormData((prev) => ({ ...prev, themeTextColor: color }));
  }, []);

  const handleBgColorChange = useCallback((color: string) => {
    setFormData((prev) => ({ ...prev, themeBgColor: color }));
  }, []);

  const isStep1Ready =
    formData.username.trim().length > 0 &&
    formData.displayName.trim().length > 0;

  const isReadyToSave = isStep1Ready && formData.password.length > 0;

  const handleClaim = useCallback(() => {
    if (!isReadyToSave) return;
    setIsSaved(true);

    const mockArtist = ARTISTS_MOCK[0];
    setSuccessArtist({
      ...mockArtist,
      id: `profile-${formData.username}`,
      name: formData.displayName || mockArtist.name,
      bio: formData.tagline || mockArtist.bio,
      image: formData.portraitPreview || mockArtist.image,
    });
  }, [isReadyToSave, formData]);

  const handleModalClose = () => setSuccessArtist(null);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-y-auto font-sans selection:bg-white selection:text-black pb-40">
      {/* ─── Cinematic Background Layer ─────────────────────────────── */}
      <div
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] bg-white/[0.025] blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] bg-white/[0.015] blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-12 flex flex-col min-h-screen">
        {/* ─── Top Actions ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between w-full mb-14">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            onClick={() => navigate("/")}
            className="group flex items-center gap-3 w-fit text-white/40 hover:text-white/70 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Exit
            </span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            onClick={() => navigate("/profile/login")}
            className="px-6 py-2 border border-white/10 rounded-full bg-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          >
            Sign In
          </motion.button>
        </div>

        {/* ─── Page Header ─────────────────────────────────────────── */}
        <header className="mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 mb-5"
          >
            <div className="h-px w-12 bg-white/20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
              {labels.rite}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl font-black uppercase tracking-[-0.02em] leading-[0.88]"
          >
            {labels.action.split(" ").slice(0, 2).join(" ")} <br />
            <span className="text-white/25">
              {labels.action.split(" ").slice(2).join(" ")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-5 text-sm text-white/35 max-w-xs leading-relaxed"
          >
            {labels.prompt}
          </motion.p>
        </header>

        {/* ─── PERSISTENT VIEW FINDER ─────────────────────────────── */}
        <div className="mb-20">
          <LiveStagePreview
            username={formData.username}
            displayName={formData.displayName}
            tagline={formData.tagline}
            portrait={formData.portraitPreview}
            imagePosition={formData.imagePosition}
            themeTextColor={formData.themeTextColor}
            themeBgColor={formData.themeBgColor}
            onTextColorChange={handleTextColorChange}
            onBgColorChange={handleBgColorChange}
            onPortraitChange={handlePortraitChange}
            onImagePositionChange={handleImagePositionChange}
          />
        </div>

        {/* ─── Form Sections ───────────────────────────────────────── */}
        <div className="flex flex-col gap-24">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-24"
              >
                {/* I — Public Profile */}
                <PortraitIdentitySection
                  username={formData.username}
                  displayName={formData.displayName}
                  tagline={formData.tagline}
                  onIdentityChange={handleIdentityChange}
                />

                {/* II — Socials */}
                <SocialsSection
                  socials={formData.socials}
                  onChange={handleSocialChange}
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!isStep1Ready}
                  onClick={() => setStep(2)}
                  className="
                    self-center px-12 py-4 bg-white text-black rounded-full
                    text-xs font-black uppercase tracking-widest
                    hover:bg-white/90 disabled:opacity-25 disabled:cursor-not-allowed
                    transition-all duration-200 shadow-[0_0_40px_rgba(255,255,255,0.08)]
                  "
                >
                  Continue
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-24"
              >
                {/* III — Access Key */}
                <div className="space-y-8">
                  <button
                    onClick={() => setStep(1)}
                    className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-all"
                  >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Back for Final Check</span>
                  </button>

                  <AccessKeySection onKeySet={handleAccessKeySet} />
                </div>

                {/* Primary CTA: Claim Identity */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center gap-5"
                >
                  <AnimatePresence mode="wait">
                    {isSaved ? (
                      <motion.div
                        key="saved"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 px-10 py-4 rounded-full bg-white/10 border border-white/20 text-white"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white/60" />
                        <span className="text-xs font-black uppercase tracking-widest">
                          Identity Claimed
                        </span>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="claim"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleClaim}
                        disabled={!isReadyToSave}
                        id="claim-identity-btn"
                        className="
                          px-12 py-4 bg-white text-black rounded-full
                          text-xs font-black uppercase tracking-widest
                          hover:bg-white/90 disabled:opacity-25 disabled:cursor-not-allowed
                          transition-all duration-200 shadow-[0_0_40px_rgba(255,255,255,0.08)]
                        "
                      >
                        create
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {isSaved && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-4 w-full max-w-xs pt-8 border-t border-white/5"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          setSuccessArtist({
                            ...ARTISTS_MOCK[0],
                            name: formData.username,
                            bio: formData.tagline,
                            image:
                              formData.portraitPreview || ARTISTS_MOCK[0].image,
                          })
                        }
                        className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white/10 transition-all"
                      >
                        View Artist Card
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/")}
                        className="w-full py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white/90 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                      >
                        Enter Theatre <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3D Artist ID Modal on Success */}
      <ArtistProfile artist={successArtist} onClose={handleModalClose} />
    </div>
  );
}
