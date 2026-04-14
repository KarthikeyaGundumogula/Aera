import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

import { Original, TheatreItem, SetSelectedItem } from "../../../types";

import { buildClusters } from "../../theatre/engine/clusterBuilder";
import { buildMobileClusters } from "../../theatre/engine/mobileClusterBuilder";
import { StaticDesktopCluster } from "../../theatre/components/desktop/StaticDesktopCluster";
import { MobileClusterView } from "../../theatre/components/mobile/MobileClusterView";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { SectionHeader } from "../../../components/SectionHeader";

interface OriginalTheatreSectionProps {
  original: Original;
  setSelectedItem: SetSelectedItem;
}

export function OriginalTheatreSection({
  original,
  setSelectedItem,
}: OriginalTheatreSectionProps) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery();

  // works is populated by the mock barrel (JOIN via originalId)
  const originalContent = original.works;

  const clusters = useMemo(() => {
    if (!originalContent.length) return { desktop: [], mobile: [] };

    // Grouping content into clusters
    const dClusters = buildClusters(originalContent, "flow").slice(0, 2);
    const mClusters = buildMobileClusters(originalContent).slice(0, 2);

    return {
      desktop: dClusters,
      mobile: mClusters,
    };
  }, [originalContent]);

  if (!originalContent.length) return null;

  return (
    <section className="pt-12 pb-8">
      {/* Header stays padded for readability */}
      <div className="flex justify-between items-end mb-6 px-8">
        <SectionHeader
          iconNode={<div className="w-4 h-px bg-white" />}
          title="Theatre"
        />

        <button
          onClick={() => navigate(`/originals/${original.id}/theatre`)}
          className="group flex items-center gap-3 text-white/40 hover:text-white transition-all active:scale-95 pb-2"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] pt-0.5">
            Enter
          </span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Clusters: edge-to-edge on mobile, padded to match page sections on desktop */}
      <div className="flex flex-col md:px-8" style={{ gap: "2px" }}>
        {isMobile
          ? clusters.mobile.map((cluster) => (
              <MobileClusterView
                key={cluster.id}
                cluster={cluster}
                setSelectedItem={setSelectedItem}
              />
            ))
          : clusters.desktop.map((cluster, idx) => (
              <StaticDesktopCluster
                key={idx}
                cluster={cluster}
                setSelectedItem={setSelectedItem}
              />
            ))}
      </div>
    </section>
  );
}
