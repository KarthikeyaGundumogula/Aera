import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, User, Sparkles, ChevronRight } from "lucide-react";
import { ArtistProfile } from "../shared/profile";
import { ARTISTS_MOCK } from "../../mock";
import { OriginalArtist } from "../../types";

type AuthMode = "LOGIN" | "SIGNUP";

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("SIGNUP");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [successArtist, setSuccessArtist] = useState<OriginalArtist | null>(null);

  const toggleMode = () => setMode(prev => prev === "LOGIN" ? "SIGNUP" : "LOGIN");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate finding or creating an artist
    const mockArtist = ARTISTS_MOCK[0]; // Use the first mock artist for demo
    setSuccessArtist({
      ...mockArtist,
      name: formData.username || mockArtist.name
    });
  };

  const handleModalClose = () => {
    setSuccessArtist(null);
    if (mode === "SIGNUP") {
      navigate("/profile");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-y-auto font-sans selection:bg-white selection:text-black">
      
      {/* ─── Cinematic Background Layer ─────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-white/[0.03] blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-white/[0.02] blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-6 pt-12 pb-32 flex flex-col min-h-screen justify-center">
        
        {/* Exit Action */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate("/")}
          className="group flex items-center gap-3 w-fit mb-12 text-white/40 hover:text-white/70 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Return to Theatre</span>
        </motion.button>

        <div className="mb-12">
           <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="h-px w-10 bg-white/20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
              {mode === "LOGIN" ? "Welcome Back" : "The Invitation"}
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black uppercase tracking-[-0.02em] leading-[0.9]"
          >
            {mode === "LOGIN" ? "Access The" : "Enter The"}<br />
            <span className="text-white/30">Stage</span>
          </motion.h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username only for both modes */}

          <div className="relative">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              required
              placeholder="USERNAME"
              value={formData.username}
              onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold uppercase tracking-widest focus:border-white focus:ring-1 focus:ring-white/20 outline-none transition-all placeholder:text-white/10"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="password"
              required
              placeholder="PASSWORD"
              value={formData.password}
              onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold uppercase tracking-widest focus:border-white focus:ring-1 focus:ring-white/20 outline-none transition-all placeholder:text-white/10"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-5 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:bg-white/90 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
          >
            {mode === "LOGIN" ? "Enter Theatre" : "Initiate Identity"} <ChevronRight className="w-4 h-4" />
          </motion.button>
        </form>

        <div className="mt-12 text-center">
          <button 
            onClick={toggleMode}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors"
          >
            {mode === "LOGIN" 
              ? "Don't have an invitation? Join the Collective" 
              : "Already a member? Enter your Stage"
            }
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-24 pt-8 border-t border-white/5 flex items-center justify-between opacity-20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-[0.4em]">Encrypted Session</span>
          </div>
          <span className="text-[8px] font-medium uppercase tracking-[0.2em]">Aera Network v1.0</span>
        </div>

      </div>

      {/* 3D Artist ID Modal on Success */}
      <ArtistProfile 
        artist={successArtist}
        onClose={handleModalClose}
      />
    </div>
  );
}
