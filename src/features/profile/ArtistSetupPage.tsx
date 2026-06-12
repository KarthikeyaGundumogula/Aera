import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";

import { PortraitIdentitySection } from "./components/PortraitIdentitySection";
import { AccessKeySection } from "./components/AccessKeySection";
import { SocialsSection, type SocialsData } from "./components/SocialsSection";

import { ArtistProfile } from "../shared/profile";
import { ARTISTS_MOCK } from "../../mock";
import { OriginalArtist } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useProfileForm } from "./hooks/useProfileForm";




/**
 * ArtistSetupPage — "Stage Setup"
 * Artists set their public profile: portrait, name, tagline, and socials.
 */
export default function ArtistSetupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [step, setStep] = useState(1);
  const [successArtist, setSuccessArtist] = useState<OriginalArtist | null>(
    null,
  );



  const { formData, updateField, updateSocial, setPortrait, clearPortrait } = useProfileForm();

  const handleIdentityChange = useCallback(
    (field: "username" | "name" | "bio", value: string) => {
      updateField(field, value);
    },
    [updateField]
  );

  const handleAccessKeySet = useCallback((key: string) => {
    updateField("password", key);
  }, [updateField]);

  const handleSocialChange = useCallback(
    (platform: "instagram" | "twitter" | "youtube", value: string) => {
      updateSocial(platform, value);
    },
    [updateSocial]
  );

  const handlePortraitChange = useCallback((file: File, preview: string) => {
    setPortrait(file, preview);
  }, [setPortrait]);

  const handlePortraitClear = useCallback(() => {
    clearPortrait();
  }, [clearPortrait]);

  const handleImagePositionChange = useCallback((position: string) => {
    // Left empty for compatibility if imagePosition was removed
  }, []);

  const handleTextColorChange = useCallback((color: string) => {
    updateField("themeTextColor", color);
  }, [updateField]);

  const handleBgColorChange = useCallback((color: string) => {
    updateField("themeBgColor", color);
  }, [updateField]);

  const isStep1Ready =
    formData.username.trim().length > 0 &&
    formData.name.trim().length > 0;

  const isReadyToSave = isStep1Ready && (formData.password?.length ?? 0) > 0;

  const handleClaim = useCallback(() => {
    if (!isReadyToSave) return;
    setIsSaved(true);

    const mockArtist = ARTISTS_MOCK[0];
    const artistDetails = {
      ...mockArtist,
      id: `profile-${formData.username}`,
      name: formData.name || mockArtist.name,
      bio: formData.bio || mockArtist.bio,
      image: formData.portraitPreview || mockArtist.image,
      themeBgColor: formData.themeBgColor,
      themeTextColor: formData.themeTextColor,
    };
    register(artistDetails);
    setSuccessArtist(artistDetails);
  }, [isReadyToSave, formData, register]);

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
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="h-px w-10 bg-white/20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
              New Account
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl text-white/50 md:text-5xl font-black uppercase tracking-[-0.02em] leading-[0.9]"
          >
            Welcome to 
            <br />
            <span className="text-white">The Club</span>
          </motion.h1>
        </header>



        {/* ─── Form Sections ───────────────────────────────────────── */}
        <div className="flex flex-col gap-12">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-12"
              >
                {/* I — Public Profile */}
                <PortraitIdentitySection
                  username={formData.username}
                  displayName={formData.name}
                  tagline={formData.bio}
                  onIdentityChange={(f, v) => {
                    const fieldMap = {
                      displayName: "name",
                      tagline: "bio",
                      username: "username"
                    } as const;
                    handleIdentityChange(fieldMap[f], v);
                  }}
                  portraitPreview={formData.portraitPreview}
                  onPortraitChange={handlePortraitChange}
                  onPortraitClear={handlePortraitClear}
                />

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
                            name: formData.name,
                            bio: formData.bio,
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
