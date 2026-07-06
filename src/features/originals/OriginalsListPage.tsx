import { useMemo } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Clapperboard } from "lucide-react";
import { ORIGINALS, MAKERS_MOCK, STARS_MOCK } from "../../mock";
import { OriginalPosterCard } from "./components/OriginalPosterCard";

export function OriginalsListPage() {
  const navigate = useNavigate();

  // Pass all makers and stars so each card can resolve its own cast/crew
  const makers = useMemo(() => MAKERS_MOCK, []);
  const stars = useMemo(() => STARS_MOCK, []);

  return (
    <div
      className="min-h-screen bg-black text-white overflow-y-auto no-scrollbar"
      style={{ touchAction: "manipulation" }}
    >
      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-10 py-4 bg-black/80 backdrop-blur-xl border-b border-white/[0.04]"
      >
        {/* Left: back to Hall */}
        <button
          onClick={() => navigate("/")}
          aria-label="Return to Hall"
          className="group p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors active:scale-90 transition-transform duration-150"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/50 group-hover:text-white transition-colors group-hover:-translate-x-0.5 transition-transform"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* Center: page identity */}
        <div className="absolute inset-x-0 flex justify-center pointer-events-none">
          <div className="flex items-center gap-2.5">
            <Clapperboard
              className="w-3.5 h-3.5 text-white/50"
              aria-hidden="true"
            />
            <h1 className="text-[10px] font-black uppercase tracking-[0.45em] text-white/70">
              Originals
            </h1>
          </div>
        </div>

        {/* Right: count badge */}
        <span
          className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 tabular-nums"
          aria-label={`${ORIGINALS.length} originals`}
        >
          {ORIGINALS.length} Films
        </span>
      </motion.header>

      {/* ── POSTER GRID ──────────────────────────────────────────────── */}
      <main
        className="px-1 sm:px-4 md:px-8 pt-[2px] pb-28"
        aria-label="Originals poster grid"
      >
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-1.5 sm:gap-4 md:gap-5 items-stretch">
          {ORIGINALS.map((original, index) => (
            <OriginalPosterCard
              key={original.id}
              original={original}
              makers={makers}
              stars={stars}
              index={index}
            />
          ))}
        </div>

        {/* Empty state (defensive) */}
        {ORIGINALS.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <Clapperboard className="w-8 h-8 text-white/10 mb-4" aria-hidden="true" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/15">
              Gallery is empty
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
