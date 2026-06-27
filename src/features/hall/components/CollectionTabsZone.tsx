import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";

import { FHLoader } from "../../../components/FHLoader";
import { SectionHeader } from "../../../components/SectionHeader";
import { mockCollection } from "../../../mock/collection";
import { GRID_ITEMS } from "../../../mock";
import { CollectionZone } from "./CollectionZone";
import { HorizontalClusterSection } from "./HorizontalClusterSection";

// Grab some works to simulate chronological collection works
const COLLECTION_WORKS = GRID_ITEMS.filter((w) =>
  mockCollection.some((l) => w.originalIds?.includes(l.originalId))
)
  .slice(0, 15)
  .reverse(); // Reverse for mock "chronological"

export function CollectionTabsZone() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"originals" | "works">("originals");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsPending(true);
    const timer = setTimeout(() => setIsPending(false), 800);
    return () => clearTimeout(timer);
  }, [activeTab]);

  return (
    <div className="relative">
      <div className="px-6 md:px-12 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionHeader icon={BookOpen} title="Your Collection" containerClassName="opacity-100" />

        <div className="flex items-center gap-4">
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
                  layoutId="collectionTabIndicator"
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
                  layoutId="collectionTabIndicator"
                  className="absolute left-0 right-0 bottom-0 h-[2px] bg-amber-400"
                />
              )}
            </button>
          </div>

          <button
            onClick={() => navigate("/collection")}
            className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white/25 hover:text-white/60 transition-colors hidden sm:flex"
          >
            Full Collection <ChevronRight className="w-3 h-3" />
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
              className="flex items-center justify-center h-[250px] w-full"
            >
              <FHLoader label="Loading Collection..." />
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
                <CollectionZone items={mockCollection} />
              ) : (
                <HorizontalClusterSection items={COLLECTION_WORKS} compact />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
