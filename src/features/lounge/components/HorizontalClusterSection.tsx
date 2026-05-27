import { useMemo } from "react";
import { TheatreItem } from "../../../types";
import { buildClusters } from "../../theatre/engine/clusterBuilder";
import { buildMobileClusters } from "../../theatre/engine/mobileClusterBuilder";
import { StaticDesktopCluster } from "../../theatre/components/desktop/StaticDesktopCluster";
import { MobileClusterView } from "../../theatre/components/mobile/MobileClusterView";
import { FeedContext } from "../../../context/FeedContext";
import { useMediaQuery } from "../../../hooks/useMediaQuery";

interface HorizontalClusterSectionProps {
  items: TheatreItem[];
  compact?: boolean;
}

/**
 * Horizontal cluster scroll for the Lounge.
 *
 * Mobile  → MobileClusterView  (exactly what mobile Theatre uses)
 * Desktop → StaticDesktopCluster (exactly what desktop Theatre uses)
 *
 * Each cluster sits in its own slot inside a single horizontal scroll container.
 * Mobile slots are 80vw wide so ~1.2 clusters are visible — natural peek into the next.
 * Desktop slots are 60vw wide so multiple clusters are visible across the wider screen.
 */
export function HorizontalClusterSection({ items, compact = false }: HorizontalClusterSectionProps) {
  const isMobile = useMediaQuery();

  const mobileClusters = useMemo(
    () => (isMobile ? buildMobileClusters(items) : []),
    [items, isMobile]
  );

  const desktopClusters = useMemo(
    () => (!isMobile ? buildClusters(items, "flow") : []),
    [items, isMobile]
  );

  // Flat item lists for FeedContext (needed by card-level detail navigation)
  const mobileFlat = useMemo(
    () => mobileClusters.flatMap((c) => c.slots.map((s) => s.item)),
    [mobileClusters]
  );
  const desktopFlat = useMemo(
    () =>
      desktopClusters.flatMap((c) =>
        c.slots.map((s) => s.item).filter(Boolean)
      ) as TheatreItem[],
    [desktopClusters]
  );

  if (!items.length) return null;

  // ── Mobile layout ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div
        className="overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none pb-4"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <FeedContext.Provider value={mobileFlat}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              flexWrap: "nowrap",
              width: "max-content",
              gap: "2px",
            }}
          >
            {mobileClusters.map((cluster) => (
              // Same fixed height as Theatre mobile wrappers → perfectly consistent
              <div
                key={cluster.id}
                style={{
                  width: compact ? "70vw" : "80vw",
                  height: compact ? "clamp(260px, 75vw, 360px)" : "clamp(320px, 90vw, 440px)",
                  flexShrink: 0,
                }}
              >
                <MobileClusterView cluster={cluster} />
              </div>
            ))}
          </div>
        </FeedContext.Provider>
      </div>
    );
  }

  // ── Desktop layout ────────────────────────────────────────────────────────
  return (
    <div
      className="overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none pb-4"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <FeedContext.Provider value={desktopFlat}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            flexWrap: "nowrap",
            width: "max-content",
            gap: "2px",
          }}
        >
          {desktopClusters.map((cluster, idx) => (
            // 60vw per cluster — shows ~1.6 at a time on wide screens
            <div
              key={cluster.id ?? idx}
              style={{ width: compact ? "45vw" : "60vw", flexShrink: 0 }}
            >
              <StaticDesktopCluster cluster={cluster} compact={compact} />
            </div>
          ))}
        </div>
      </FeedContext.Provider>
    </div>
  );
}
