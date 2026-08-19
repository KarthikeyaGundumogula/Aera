import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { TheatreItem } from "../../../types";
import { buildMobileClustersWithRemainder } from "../../theatre/engine/mobileClusterBuilder";
import { MobileClusterView } from "../../theatre/components/mobile/MobileClusterView";
import { MobileCard } from "../../theatre/components/mobile/MobileCard";
import { isPosterWork, isStoryboardWork, isEditWork } from "../../shared/work";
import { FeedContext } from "../../../context/FeedContext";
import { SectionHeader } from "../../../components/SectionHeader";
import { apiFetch } from "@/lib/api";

interface ArtistContextPanelProps {
  artistId: string;
  currentWorkId: string | number;
}

export function ArtistContextPanel({ artistId, currentWorkId }: ArtistContextPanelProps) {
  const location = useLocation();
  const [artistWorks, setArtistWorks] = useState<TheatreItem[]>([]);

  // Check if feed items were passed via router location.state
  const locationState = location.state as { item?: TheatreItem; feedItems?: TheatreItem[] } | null;
  const feedItemsFromState = locationState?.feedItems;

  useEffect(() => {
    // If no feed items in state, fetch artist works from backend as fallback using correct endpoint
    if ((!feedItemsFromState || feedItemsFromState.length === 0) && artistId) {
      apiFetch(`/profiles/${artistId}/works?limit=20`)
        .then(async (res) => {
          if (res.ok) {
            const json = await res.json();
            const items = json.items || json.data || [];
            setArtistWorks(items);
          }
        })
        .catch((err) => {
          console.error("[ArtistContextPanel] Failed to fetch artist works:", err);
        });
    }
  }, [artistId, feedItemsFromState]);

  // Memoize display works and section title
  const { displayWorks, sectionTitle } = React.useMemo(() => {
    let works: TheatreItem[] = [];
    let title = "Up Next in Feed";

    if (feedItemsFromState && feedItemsFromState.length > 0) {
      title = "Up Next in Feed";
      const currentIndex = feedItemsFromState.findIndex(
        (w) => String(w.id) === String(currentWorkId)
      );
      if (currentIndex !== -1) {
        const after = feedItemsFromState.slice(currentIndex + 1);
        const before = feedItemsFromState.slice(0, currentIndex);
        works = [...after, ...before].filter(
          (w) => String(w.id) !== String(currentWorkId)
        );
      } else {
        works = feedItemsFromState.filter(
          (w) => String(w.id) !== String(currentWorkId)
        );
      }
    } else if (artistWorks.length > 0) {
      title = "More From Artist";
      works = artistWorks.filter(
        (w) => String(w.id) !== String(currentWorkId)
      );
    }

    return { displayWorks: works, sectionTitle: title };
  }, [feedItemsFromState, artistWorks, currentWorkId]);

  const { clusters, stackedItems } = React.useMemo(() => {
    if (displayWorks.length === 0) return { clusters: [], stackedItems: [] };
    const res = buildMobileClustersWithRemainder(displayWorks);
    return {
      clusters: res.clusters.slice(0, 4),
      stackedItems: res.stackedItems,
    };
  }, [displayWorks]);

  if (displayWorks.length === 0 || (clusters.length === 0 && stackedItems.length === 0)) return null;

  return (
    <div className="w-full h-full bg-[#070706] lg:border-l lg:border-white/[0.04]">
      <div className="flex flex-col h-full lg:h-screen lg:sticky lg:top-0 lg:overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#070706]/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center">
          <SectionHeader title={sectionTitle} />
        </div>

        <div className="pt-2 pb-20 lg:pb-10 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col w-full gap-4">
              <FeedContext.Provider value={displayWorks}>
                {/* 1. Complete Clusters */}
                {clusters.map((cluster) => (
                  <div key={cluster.id} style={{ height: "40dvh" }}>
                    <MobileClusterView cluster={cluster} />
                  </div>
                ))}

                {/* 2. Remaining Stacked Items (fewer than full cluster) */}
                {stackedItems.length > 0 && (
                  <div className="flex flex-col gap-4 w-full">
                    {stackedItems.map((item) => (
                      <div
                        key={item.id}
                        className={`w-full overflow-hidden rounded-xl border border-white/10 ${
                          isPosterWork(item)
                            ? "aspect-[2/3]"
                            : isStoryboardWork(item)
                            ? "aspect-[4/5]"
                            : "aspect-[16/9]"
                        }`}
                      >
                        <MobileCard
                          slot={{
                            item,
                            type: isPosterWork(item)
                              ? "Vertical"
                              : isEditWork(item)
                              ? "Wide"
                              : "Square",
                          }}
                          className="w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </FeedContext.Provider>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
