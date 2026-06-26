import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

import { FHLoader } from "../../../components/FHLoader";
import { SectionHeader } from "../../../components/SectionHeader";
import { HorizontalClusterSection } from "./HorizontalClusterSection";
import { ORIGINALS, GRID_ITEMS } from "../../../mock";

// Pick 4 originals for recommendations (mock logic)
const RECOMMENDED_ORIGINALS = ORIGINALS.slice(0, 4);
const RECOMMENDED_WORKS = GRID_ITEMS.filter((w) =>
  RECOMMENDED_ORIGINALS.some((o) => w.originalIds?.includes(o.id)),
).slice(0, 15);

function OriginalsCarousel() {
  const navigate = useNavigate();
  return (
    <div className="overflow-x-auto no-scrollbar pb-4">
      <div className="flex gap-4 w-max px-6 md:px-12">
        {RECOMMENDED_ORIGINALS.map((orig) => (
          <motion.div
            key={orig.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/originals/${orig.id}`)}
            className="relative w-48 h-72 rounded-2xl overflow-hidden cursor-pointer group bg-white/[0.02] border border-white/[0.08]"
          >
            <img
              src={orig.coverImage}
              alt={orig.title}
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h4 className="text-[14px] font-black uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors">
                {orig.title}
              </h4>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function RecommendationsZone() {
  const [activeTab, setActiveTab] = useState<"originals" | "works">(
    "originals",
  );
  const [isPending, setIsPending] = useState(false);

  // Fake loading effect
  useEffect(() => {
    setIsPending(true);
    const timer = setTimeout(() => setIsPending(false), 800);
    return () => clearTimeout(timer);
  }, [activeTab]);

  return (
    <div className="relative">
      <div className="px-6 md:px-12 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionHeader
          icon={Sparkles}
          title="Talk of the week"
          containerClassName="opacity-100"
        />

        {/* Tab Switcher */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("originals")}
            className={`relative pb-1 text-[11px] font-black uppercase tracking-widest transition-colors ${
              activeTab === "originals"
                ? "text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            Originals
            {activeTab === "originals" && (
              <motion.div
                layoutId="recTabIndicator"
                className="absolute left-0 right-0 bottom-0 h-[2px] bg-amber-400"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("works")}
            className={`relative pb-1 text-[11px] font-black uppercase tracking-widest transition-colors ${
              activeTab === "works"
                ? "text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            Stage
            {activeTab === "works" && (
              <motion.div
                layoutId="recTabIndicator"
                className="absolute left-0 right-0 bottom-0 h-[2px] bg-amber-400"
              />
            )}
          </button>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {isPending ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-[300px] w-full"
            >
              <FHLoader label="Curating..." />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "originals" ? (
                <OriginalsCarousel />
              ) : (
                <HorizontalClusterSection items={RECOMMENDED_WORKS} compact />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
