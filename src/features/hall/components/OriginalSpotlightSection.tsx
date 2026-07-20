import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Grid, Clapperboard } from "lucide-react";
import { SectionHeader } from "../../../components/SectionHeader";
import { FHLoader } from "../../../components/FHLoader";
import { RecentReleasesSection } from "../../shared/components/RecentReleasesSection";
import { HorizontalClusterSection } from "./HorizontalClusterSection";
import { ORIGINALS, GRID_ITEMS } from "../../../mock";

import { TheatreItem, Original } from "../../../types";

interface OriginalSpotlightSectionProps {
  original: Original;
  works: TheatreItem[];
}

export function OriginalSpotlightSection({ original, works }: OriginalSpotlightSectionProps) {
  const [activeTab, setActiveTab] = useState<"releases" | "works">("releases");
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tab: "releases" | "works") => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  return (
    <div className="relative">
      {/* Header & Tabs */}
      <div className="px-6 md:px-12 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionHeader icon={Clapperboard} title={`${original.title}`} containerClassName="opacity-100" />

        <div className="flex items-center gap-6">
          <button
            onClick={() => handleTabChange("releases")}
            className={`relative pb-1 text-[11px] font-black uppercase tracking-widest transition-colors ${
              activeTab === "releases" ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            Releases
            {activeTab === "releases" && (
              <motion.div
                layoutId={`spotlightTab-${original.id}`}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>

          <button
            onClick={() => handleTabChange("works")}
            className={`relative pb-1 text-[11px] font-black uppercase tracking-widest transition-colors ${
              activeTab === "works" ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            Stage
            {activeTab === "works" && (
              <motion.div
                layoutId={`spotlightTab-${original.id}`}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {isPending ? (
            <motion.div
              key="loader"
              className="flex items-center justify-center h-[250px] w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FHLoader label={`Loading ${activeTab}...`} />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "releases" ? (
                // We pass empty title and mb-0 to RecentReleasesSection so it seamlessly blends in without double-headers
                <RecentReleasesSection title="" className="" headerClassName="hidden" />
              ) : (
                <HorizontalClusterSection items={works} compact />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
