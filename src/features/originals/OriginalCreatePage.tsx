import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";

import { CreationIdentitySection } from "./components/creation/CreationIdentitySection";
import { CreationMetaSection } from "./components/creation/CreationMetaSection";
import { CreationCastSection } from "./components/creation/CreationCastSection";
import { CastMember } from "./components/creation/PersonSearchInput";

export default function OriginalCreatePage() {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    releaseDate: "",
    genres: [] as string[],
    stars: [] as CastMember[],
    makers: [] as CastMember[],
    coverImage: "",
  });

  const updateFormData = useCallback((data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const handleSeal = useCallback(() => {
    if (!formData.title) return;
    setIsSaved(true);
    // Simulate API delay
    setTimeout(() => {
      navigate("/originals");
    }, 3000);
  }, [formData.title, navigate]);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-y-auto font-sans selection:bg-white selection:text-black pb-32">
      {/* ─── Cinematic Background Layer ─────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-white/[0.02] blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[45%] h-[45%] bg-white/[0.015] blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-12 flex flex-col min-h-screen">
        {/* ─── Exit Action ─────────────────────────────────────────── */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate("/")}
          className="group flex items-center gap-3 w-fit mb-14 text-white/40 hover:text-white/70 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Exit creation</span>
        </motion.button>

        {/* ─── Page Header ─────────────────────────────────────────── */}
        <header className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-5"
          >
            <div className="h-px w-12 bg-white/20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
              Create Original
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black uppercase tracking-[-0.02em] leading-[0.88]"
          >
            Initiate <br />
            <span className="text-white/25">New Artifact</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 text-sm text-white/35 max-w-xs leading-relaxed"
          >
            Define the core of a new original. Stars, makers, and the vision that binds them.
          </motion.p>
        </header>

        {/* ─── Form Sections ───────────────────────────────────────── */}
        <div className="flex flex-col gap-20">
          <CreationIdentitySection 
            title={formData.title} 
            description={formData.description} 
            onChange={(field, val) => updateFormData({ [field]: val })} 
          />

          <div className="h-px w-full bg-white/[0.06]" />

          <CreationMetaSection 
            releaseDate={formData.releaseDate} 
            genres={formData.genres} 
            onDateChange={(val) => updateFormData({ releaseDate: val })}
            onGenresChange={(val) => updateFormData({ genres: val })}
          />

          <div className="h-px w-full bg-white/[0.06]" />

          <CreationCastSection 
            stars={formData.stars}
            makers={formData.makers}
            onStarsChange={(val) => updateFormData({ stars: val })}
            onMakersChange={(val) => updateFormData({ makers: val })}
          />
        </div>

        {/* ─── Final Action: Seal Original ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 pt-12 border-t border-white/5 flex flex-col items-center gap-6"
        >
          <AnimatePresence mode="wait">
            {isSaved ? (
              <motion.div
                key="saved"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-white/10 border border-white/20 text-white"
              >
                <div className="relative">
                    <CheckCircle2 className="w-5 h-5 text-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                    <motion.div 
                        className="absolute inset-0 bg-white/20 blur-md rounded-full"
                        animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.3em]">Original Sealed</span>
              </motion.div>
            ) : (
              <motion.button
                key="seal"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSeal}
                disabled={!formData.title}
                className="
                  group relative px-16 py-5 bg-white text-black rounded-2xl
                  text-xs font-black uppercase tracking-[0.4em]
                  hover:bg-white/90 disabled:opacity-20 disabled:cursor-not-allowed
                  transition-all duration-300 shadow-[0_0_50px_rgba(255,255,255,0.1)]
                  flex items-center gap-3
                "
              >
                <span>Seal Original</span>
                <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
              </motion.button>
            )}
          </AnimatePresence>

          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
            Once sealed, this artifact joins the global collective
          </p>
        </motion.div>
      </div>
    </div>
  );
}
