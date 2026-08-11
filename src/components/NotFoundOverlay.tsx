import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowLeft, Radio, Film, Layers, Mail, CheckCircle } from "lucide-react";
import { Logo } from "./Logo";

interface NotFoundOverlayProps {
  title?: string;
  subtitle?: string;
  mode?: "page" | "overlay";
  onClose?: () => void;
}

export function NotFoundOverlay({
  title = "WE'RE WORKING ON THIS SCENE",
  subtitle = "The frame or signal you are looking for is currently being curated behind the curtain. Stay in-touch with the Framehouse collective while we polish the stage.",
  mode = "page",
  onClose,
}: NotFoundOverlayProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
    }, 2000);
  };

  const containerClasses =
    mode === "overlay"
      ? "fixed inset-0 z-[300] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6"
      : "min-h-screen bg-[#030303] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden pt-[72px]";

  return (
    <div className={containerClasses}>
      {/* Dynamic Background Signal Wave Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-white/10 via-white/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <svg className="w-full h-full stroke-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern-404" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern-404)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl bg-surface-deep/80 border border-white/10 rounded-3xl p-8 md:p-12 relative z-10 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center"
      >
        {/* Framehouse Logo & Signal Badge */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-white/5 rounded-full border border-white/10 mb-8">
          <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/70">
            FRAMEHOUSE · OFF-CANVAS SIGNAL
          </span>
        </div>

        {/* Big 404 / Construction Visual */}
        <div className="relative mb-6">
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/60 to-white/10 select-none">
            404
          </h1>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-black border border-white/15 rounded-md">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-amber-300">
              UNDER CONSTRUCTION
            </span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-3">
          {title}
        </h2>
        <p className="text-xs md:text-sm text-white/50 leading-relaxed max-w-md mb-8 font-medium">
          {subtitle}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (onClose) onClose();
              navigate("/");
            }}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/90 transition-colors shadow-lg w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Hall</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (onClose) onClose();
              navigate("/sets");
            }}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all w-full sm:w-auto"
          >
            <Layers className="w-4 h-4 text-white/60" />
            <span>Explore Sets</span>
          </motion.button>
        </div>

        {/* Keep Framehouse In-Touch Form */}
        <div className="w-full pt-6 border-t border-white/10 flex flex-col items-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3 flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-white/40" />
            <span>Keep Framehouse In-Touch</span>
          </p>

          <AnimatePresence mode="wait">
            {subscribed ? (
              <motion.div
                key="subscribed"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>You're in the Loop! We'll notify you soon.</span>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubscribe}
                className="flex items-center gap-2 w-full max-w-sm"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email for scene updates..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:border-white/30 outline-none transition-all"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Join
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
