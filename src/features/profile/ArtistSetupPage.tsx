import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Film } from "lucide-react";

import { IdentitySection } from "./components/IdentitySection";
import { SocialsSection, type SocialsData } from "./components/SocialsSection";
import { AvatarSection } from "./components/AvatarSection";

interface ProfileFormData {
  name: string;
  tagline: string;
  socials: SocialsData;
  portraitFile: File | null;
  portraitPreview: string | null;
}

/**
 * ArtistSetupPage — "The Identity Rite"
 * Artists set their public profile: portrait, name, tagline, and socials.
 *
 * Frontend-only; state is local (no persistence yet).
 */
export default function ArtistSetupPage() {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    tagline: "",
    socials: { instagram: "", twitter: "", youtube: "" },
    portraitFile: null,
    portraitPreview: null,
  });

  const handleIdentityChange = useCallback(
    (field: "name" | "tagline", value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSocialChange = useCallback(
    (platform: keyof SocialsData, value: string) => {
      setFormData((prev) => ({
        ...prev,
        socials: { ...prev.socials, [platform]: value },
      }));
    },
    []
  );

  const handlePortraitChange = useCallback((file: File, preview: string) => {
    setFormData((prev) => ({
      ...prev,
      portraitFile: file,
      portraitPreview: preview,
    }));
  }, []);

  const handlePortraitClear = useCallback(() => {
    setFormData((prev) => {
      // Revoke the object URL to avoid memory leaks
      if (prev.portraitPreview) {
        URL.revokeObjectURL(prev.portraitPreview);
      }
      return { ...prev, portraitFile: null, portraitPreview: null };
    });
  }, []);

  const isReadyToSave = formData.name.trim().length > 0;

  const handleClaim = useCallback(() => {
    if (!isReadyToSave) return;
    setIsSaved(true);
    // TODO: POST to backend when available (multipart/form-data for portraitFile)
  }, [isReadyToSave]);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-white selection:text-black">

      {/* ─── Cinematic Background Layer ─────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] bg-white/[0.025] blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] bg-white/[0.015] blur-[140px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-12 pb-32 flex flex-col min-h-screen">

        {/* ─── Exit Action ─────────────────────────────────────────── */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          onClick={() => navigate("/")}
          className="group flex items-center gap-3 w-fit mb-14 text-white/40 hover:text-white/70 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Exit</span>
        </motion.button>

        {/* ─── Page Header ─────────────────────────────────────────── */}
        <header className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 mb-5"
          >
            <div className="h-px w-12 bg-white/20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
              The Identity Rite
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl font-black uppercase tracking-[-0.02em] leading-[0.88]"
          >
            Shape Your <br />
            <span className="text-white/25">Presence</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-5 text-sm text-white/35 max-w-xs leading-relaxed"
          >
            Your identity on FrameHouse. One name. One line. Your stage.
          </motion.p>
        </header>

        {/* ─── Form Sections ───────────────────────────────────────── */}
        <div className="flex flex-col gap-14">

          {/* I — Portrait (first) */}
          <AvatarSection
            file={formData.portraitFile}
            previewUrl={formData.portraitPreview}
            onChange={handlePortraitChange}
            onClear={handlePortraitClear}
          />

          <div className="h-px w-full bg-white/[0.06]" />

          {/* II — Identity */}
          <IdentitySection
            name={formData.name}
            tagline={formData.tagline}
            onChange={handleIdentityChange}
          />

          <div className="h-px w-full bg-white/[0.06]" />

          {/* III — Socials */}
          <SocialsSection
            socials={formData.socials}
            onChange={handleSocialChange}
          />
        </div>

        {/* ─── Primary CTA: Claim Identity ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 flex flex-col items-center gap-5"
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
                <span className="text-xs font-black uppercase tracking-widest">Identity Claimed</span>
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
                Claim Your Identity
              </motion.button>
            )}
          </AnimatePresence>

          {/* ─── Secondary CTA: Release Rite ─────────────────────── */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/submit")}
            id="begin-release-rite-btn"
            className="
              group flex items-center gap-2.5
              px-6 py-3 rounded-full border border-white/10
              bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20
              text-white/45 hover:text-white/70
              text-[10px] font-bold uppercase tracking-[0.25em]
              transition-all duration-300
            "
          >
            <Film className="w-3.5 h-3.5 transition-transform group-hover:rotate-[-6deg]" />
            Begin Release Rite
            <span className="text-white/25 group-hover:text-white/50 transition-colors">→</span>
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}
