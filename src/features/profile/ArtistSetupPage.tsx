import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ChevronRight, ShieldCheck } from "lucide-react";

import { PortraitIdentitySection } from "./components/PortraitIdentitySection";
import { AccessKeySection } from "./components/AccessKeySection";
import { SocialsSection, type SocialsData } from "./components/SocialsSection";

import { ArtistProfile } from "../shared/profile";
import { OriginalArtist } from "../../types";
import { useAuth, formatColorTheme } from "../../context/AuthContext";
import { useProfileForm } from "./hooks/useProfileForm";
import { DEFAULT_AVATAR_PLACEHOLDER } from "@/constants/placeholders";
import { apiFetch } from "@/lib/api";




/**
 * ArtistSetupPage — "Stage Setup"
 * Artists set their public profile: portrait, name, tagline, and socials.
 * Supports both artist self-onboarding and administrative profile seeding.
 */
export default function ArtistSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const { register } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [step, setStep] = useState(1);
  const [successArtist, setSuccessArtist] = useState<OriginalArtist | null>(
    null,
  );



  const { formData, updateField, updateSocial, setPortrait, clearPortrait, setFormData } = useProfileForm();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleClaim = useCallback(async () => {
    if (!isReadyToSave) {
      setErrorMessage("Please complete all required fields and ensure password matches criteria.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const artistDetails: OriginalArtist = {
      id: `profile-${formData.username}`,
      name: formData.name.trim(),
      userName: formData.username.trim().toLowerCase(),
      bio: formData.bio.trim() || "Cinematic Visionary",
      image: formData.portraitPreview || DEFAULT_AVATAR_PLACEHOLDER,
      spirit: 0,
      works: 0,
      themeBgColor: formData.themeBgColor || "#0f1a42",
      themeTextColor: formData.themeTextColor || "#fac107",
      isClaimed: true,
      socials: {
        instagram: formData.socials.instagram.trim() || undefined,
        twitter: formData.socials.twitter.trim() || undefined,
        youtube: formData.socials.youtube.trim() || undefined,
      },
    };

    try {
      const success = await register(artistDetails, formData.password);
      if (success) {
        setIsSaved(true);
        setSuccessArtist(artistDetails);
      } else {
        setErrorMessage("Registration failed. Handle may already be taken or server unavailable.");
        setIsSaved(false);
      }
    } catch (err) {
      setErrorMessage("Network error during profile creation. Please try again.");
      setIsSaved(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [isReadyToSave, formData, register]);

  const handleResetForm = useCallback(() => {
    setFormData({
      username: "",
      name: "",
      bio: "",
      socials: { instagram: "", twitter: "", youtube: "" },
      portraitFile: null,
      portraitPreview: null,
      password: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      themeTextColor: "#fac107",
      themeBgColor: "#0f1a42",
    });
    setIsSaved(false);
    setSuccessArtist(null);
    setErrorMessage(null);
  }, [setFormData]);

  const handleAdminSeed = useCallback(async () => {
    if (!isStep1Ready) {
      setErrorMessage("Please enter both an artist name and handle.");
      return;
    }

    const cleanHandle = formData.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    const cleanStageName = formData.name.trim().toLowerCase().replace(/[^a-z\u0C00-\u0C7F ]/g, "").replace(/\s+/g, " ").trim().slice(0, 15);

    if (!cleanHandle) {
      setErrorMessage("Handle must contain valid alphanumeric characters or underscores.");
      return;
    }
    if (!cleanStageName) {
      setErrorMessage("Stage name must contain alphabetic characters and not exceed 15 characters.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: Record<string, unknown> = {
      stage_name: cleanStageName,
      handle: cleanHandle,
      tag_line: formData.bio.trim() ? formData.bio.trim().slice(0, 100) : undefined,
      profile_picture: (formData.portraitPreview && !formData.portraitPreview.startsWith("boring-avatar:") && (formData.portraitPreview.startsWith("http://") || formData.portraitPreview.startsWith("https://") || formData.portraitPreview.startsWith("/")))
        ? formData.portraitPreview
        : undefined,
      color_theme: formatColorTheme(formData.themeTextColor, formData.themeBgColor),
    };

    if (formData.socials.youtube.trim().length > 0) {
      payload.youtube_profile = formData.socials.youtube.trim();
    }
    if (formData.socials.twitter.trim().length > 0) {
      payload.twitter_profile = formData.socials.twitter.trim();
    }
    if (formData.socials.instagram.trim().length > 0) {
      payload.instagram_profile = formData.socials.instagram.trim();
    }

    try {
      const res = await apiFetch("/admin/seed_profile", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsSaved(true);
        const seededArtist: OriginalArtist = {
          id: `profile-${cleanHandle}`,
          name: formData.name.trim(),
          userName: cleanHandle,
          bio: formData.bio.trim() || "Cinematic Visionary",
          image: formData.portraitPreview || DEFAULT_AVATAR_PLACEHOLDER,
          spirit: 100,
          works: 0,
          themeBgColor: formData.themeBgColor || "#0f1a42",
          themeTextColor: formData.themeTextColor || "#fac107",
          isClaimed: false,
          socials: {
            instagram: formData.socials.instagram.trim() || undefined,
            twitter: formData.socials.twitter.trim() || undefined,
            youtube: formData.socials.youtube.trim() || undefined,
          },
        };
        setSuccessArtist(seededArtist);
      } else {
        const errorJson = await res.json().catch(() => null);
        const errMsg = errorJson?.error || errorJson?.message || res.apiError?.message || `Failed to seed profile (${res.status})`;
        setErrorMessage(errMsg);
        setIsSaved(false);
      }
    } catch (err) {
      setErrorMessage("Network error during admin profile seeding. Please try again.");
      setIsSaved(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [isStep1Ready, formData]);


  const handleModalClose = () => setSuccessArtist(null);

  return (
    <div className="relative min-h-screen bg-surface-deep text-white overflow-y-auto font-sans selection:bg-white selection:text-black pb-40">
      {/* ─── Cinematic Background Layer ─────────────────────────────── */}
      <div
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] bg-white/[0.025] blur-[140px] rounded-xl animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] bg-white/[0.015] blur-[140px] rounded-xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-12 flex flex-col min-h-screen">
        {/* ─── Top Actions ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between w-full mb-14">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            onClick={() => navigate(isAdmin ? "/admin" : "/")}
            className="group flex items-center gap-3 w-fit text-white/40 hover:text-white/70 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              {isAdmin ? "Admin Center" : "Exit"}
            </span>
          </motion.button>

          {isAdmin ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-mono uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Protocol</span>
            </div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              onClick={() => navigate("/profile/login")}
              className="px-6 py-2 border border-white/10 rounded-xl bg-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            >
              Sign In
            </motion.button>
          )}
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
              {isAdmin ? "Profile Provisioning" : "New Account"}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl text-white/50 md:text-5xl font-black uppercase tracking-[-0.02em] leading-[0.9]"
          >
            {isAdmin ? (
              <>
                Seed Artist
                <br />
                <span className="text-white">Profile</span>
              </>
            ) : (
              <>
                Welcome to 
                <br />
                <span className="text-white">The Club</span>
              </>
            )}
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

                {isAdmin ? (
                  isSaved ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-6 py-6"
                    >
                      <div className="flex items-center gap-3 px-8 py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">
                          Profile Seeded Successfully (Unclaimed)
                        </span>
                      </div>

                      <div className="flex flex-col gap-3 w-full max-w-xs pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSuccessArtist(successArtist)}
                          className="w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white/10 transition-all text-white"
                        >
                          View Artist Card
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate("/admin")}
                          className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white/90 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                        >
                          Return to Admin <ChevronRight className="w-4 h-4" />
                        </motion.button>

                        <button
                          type="button"
                          onClick={handleResetForm}
                          className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors py-2 text-center"
                        >
                          + Seed Another Profile
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center gap-5">
                      {errorMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center tracking-wide max-w-md w-full"
                        >
                          {errorMessage}
                        </motion.div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!isStep1Ready || isSubmitting}
                        onClick={handleAdminSeed}
                        className="
                          self-center px-12 py-4 bg-white text-black rounded-xl
                          text-xs font-black uppercase tracking-widest
                          hover:bg-white/90 disabled:opacity-25 disabled:cursor-not-allowed
                          transition-all duration-200 shadow-[0_0_40px_rgba(255,255,255,0.08)]
                        "
                      >
                        {isSubmitting ? "Seeding Profile..." : "Seed Profile"}
                      </motion.button>
                    </div>
                  )
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!isStep1Ready}
                    onClick={() => setStep(2)}
                    className="
                      self-center px-12 py-4 bg-white text-black rounded-xl
                      text-xs font-black uppercase tracking-widest
                      hover:bg-white/90 disabled:opacity-25 disabled:cursor-not-allowed
                      transition-all duration-200 shadow-[0_0_40px_rgba(255,255,255,0.08)]
                    "
                  >
                    Continue
                  </motion.button>
                )}
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
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center tracking-wide max-w-md"
                    >
                      {errorMessage}
                    </motion.div>
                  )}

                  <AnimatePresence mode="wait">
                    {isSaved ? (
                      <motion.div
                        key="saved"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 px-10 py-4 rounded-xl bg-white/10 border border-white/20 text-white"
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
                        disabled={!isReadyToSave || isSubmitting}
                        id="claim-identity-btn"
                        className="
                          px-12 py-4 bg-white text-black rounded-xl
                          text-xs font-black uppercase tracking-widest
                          hover:bg-white/90 disabled:opacity-25 disabled:cursor-not-allowed
                          transition-all duration-200 shadow-[0_0_40px_rgba(255,255,255,0.08)]
                        "
                      >
                        {isSubmitting ? "Creating Profile..." : "Create"}
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
                            id: `profile-${formData.username}`,
                            name: formData.name || "Artist",
                            bio: formData.bio || "Cinematic Visionary",
                            image: formData.portraitPreview || DEFAULT_AVATAR_PLACEHOLDER,
                            spirit: 0,
                            works: 0,
                            themeBgColor: formData.themeBgColor || "#0f1a42",
                            themeTextColor: formData.themeTextColor || "#fac107",
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
