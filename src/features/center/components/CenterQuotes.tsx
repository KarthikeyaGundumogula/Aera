import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCcw } from "lucide-react";
import { CINEMATIC_QUOTES } from "../../../constants/quotes";
import { CURRENT_USER_MOCK } from "../../../mock";

export function CenterQuotes() {
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
    <section className="px-6 md:px-12 py-6 w-full max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-[#080808] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      >
        {/* Machine header strip */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-[2px] bg-white/20" />
              <div className="w-2 h-2 rounded-[2px] bg-white/20" />
              <div className="w-2 h-2 rounded-[2px] bg-amber-500/80 animate-pulse" />
            </div>
            <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/40">
              Framehouse.Core // Quote_Engine
            </span>
          </div>
          <button
            onClick={handleNewQuote}
            className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors focus:outline-none"
            title="Cycle Quote"
          >
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
              Cycle
            </span>
            <RefreshCcw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        {/* Card Body */}
        <div className="px-6 py-10 md:px-10 md:py-12 relative flex flex-col justify-center items-center text-center">
          {/* Subtle grid background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/70 mb-6 relative z-10">
            ✧ {CURRENT_USER_MOCK.name.toUpperCase()}!! The Matter is ... ✧
          </p>

          <AnimatePresence mode="wait">
            <motion.h1 
              key={quoteIdx}
              initial={{ opacity: 0, filter: "blur(4px)", y: 4 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(4px)", y: -4 }}
              transition={{ duration: 0.4 }}
              className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-relaxed max-w-4xl text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40 italic relative z-10"
              style={{ fontFamily: "'Playfair Display', 'Tiro Devanagari Hindi', 'Tiro Telugu', serif" }}
            >
              {randomQuote}
            </motion.h1>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
