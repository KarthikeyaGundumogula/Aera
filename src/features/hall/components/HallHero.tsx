import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CINEMATIC_QUOTES } from "../../../constants/quotes";
import { CURRENT_USER_MOCK } from "../../../mock";

export function HallHero() {
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * CINEMATIC_QUOTES.length));

  const handleNewQuote = useCallback(() => {
    let newIdx;
    do {
      newIdx = Math.floor(Math.random() * CINEMATIC_QUOTES.length);
    } while (newIdx === quoteIdx && CINEMATIC_QUOTES.length > 1);
    setQuoteIdx(newIdx);
  }, [quoteIdx]);

  const randomQuote = CINEMATIC_QUOTES[quoteIdx];

  return (
    <section className="relative overflow-hidden px-6 md:px-12 pt-6 pb-6">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-40 bg-white/[0.012] rounded-full blur-[80px]" />
        <div className="absolute top-4 right-1/3 w-64 h-28 bg-white/[0.008] rounded-full blur-[60px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleNewQuote}
            className="flex items-center justify-center w-5 h-5 rounded-full bg-white/[0.03] border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-pointer hover:bg-white/[0.08] hover:scale-110 active:scale-95 transition-all focus:outline-none"
            title="Get another quote"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500/90 animate-pulse pointer-events-none" />
          </button>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 border-b border-white/10 pb-0.5">
            ✧ {CURRENT_USER_MOCK.name.toUpperCase()}!! The Matter is ... ✧
          </p>
        </div>
        <AnimatePresence mode="wait">
          <motion.h1 
            key={quoteIdx}
            initial={{ opacity: 0, filter: "blur(4px)", y: 4 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(4px)", y: -4 }}
            transition={{ duration: 0.4 }}
            className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.2] mb-5 max-w-4xl text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/30 italic"
            style={{ fontFamily: "'Playfair Display', 'Tiro Devanagari Hindi', 'Tiro Telugu', serif" }}
          >
            {randomQuote}
          </motion.h1>
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
