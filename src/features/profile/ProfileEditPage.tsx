import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ProfileEditCard } from "./components/ProfileEditCard";
import { ARTISTS_MOCK } from "../../mock";
import type { OriginalArtist } from "../../types";

/**
 * ProfileEditPage — "Profile Editor"
 * Dedicated route for artists to update their Stage, socials, and security.
 */
export default function ProfileEditPage() {
  const navigate = useNavigate();

  // In a real app, this would come from an Auth context or API
  const artist: OriginalArtist = ARTISTS_MOCK[0];

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-white selection:text-black">
      {/* ─── Cinematic Background Layer ─────────────────────────────── */}
      <div
        className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-white/[0.03] blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-white/[0.02] blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-6 pt-12 pb-32 flex flex-col min-h-screen">
        {/* Exit Action */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate("/")}
          className="group flex items-center gap-3 w-fit mb-12 text-white/40 hover:text-white/70 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Exit Editor
          </span>
        </motion.button>

        {/* ─── Header ────────────────────────────────────────────────── */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="h-px w-10 bg-white/20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
              The Stage Refinement
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black uppercase tracking-[-0.02em] leading-[0.9]"
          >
            Customize Your
            <br />
            <span className="text-white/30">Stage</span>
          </motion.h1>
        </div>

        {/* ─── Stage Edit Card ─────────────────────────────────────── */}
        <ProfileEditCard artist={artist} onSave={() => undefined} />

        {/* Footer info */}
        <div className="mt-auto pt-12 border-t border-white/5 flex items-center justify-between opacity-20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em]">
              Encrypted Session
            </span>
          </div>
          <span className="text-[8px] font-medium uppercase tracking-[0.2em]">
            Stage Collective v1.0
          </span>
        </div>
      </div>
    </div>
  );
}
