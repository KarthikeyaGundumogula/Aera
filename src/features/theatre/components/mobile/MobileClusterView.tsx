import { memo } from "react";
import { MobileCluster } from "../../engine/mobileClusterBuilder";
import { MobileCard } from "./MobileCard";

interface MobileClusterViewProps {
  cluster: MobileCluster;
}

/**
 * Renders a single mobile cluster with NORMALIZED height.
 *
 * All templates use h-full on the root so the parent container controls
 * the total cluster height (just like desktop StaticDesktopCluster uses
 * a fixed clamp height and distributes via CSS Grid 1fr rows).
 *
 * Space is distributed with flex proportions that approximate the natural
 * aspect ratios of each slot type:
 *
 *   A / D  — IMAX (~16:9) row gets flex-[9], square row gets flex-[7]
 *   B / C  — Academy (4:3) gets flex-[3] of right/left column,
 *             Square (1:1) gets flex-[4] of right/left column
 *   E      — Both posters fill their half equally (h-full)
 *
 * All cards use forceFill=true — the container, not the card, owns sizing.
 *
 * Layout patterns:
 *   A — "Feature Presentation":  IMAX full-width + 2 squares below
 *   B — "Asymmetric Left":       Vertical left (fill) | Academy + Square right
 *   C — "Asymmetric Right":      Square + Academy left | Vertical right (fill)
 *   D — "Pacing Block":          2 squares top + IMAX full-width below
 *   E — "The Gallery":           2 posters side-by-side
 */
export const MobileClusterView = memo(function MobileClusterView({
  cluster,
}: MobileClusterViewProps) {
  const [s0, s1, s2] = cluster.slots;
  // All cards forced to fill their container — aspect class is ignored.
  const card = (slot: typeof s0) => <MobileCard slot={slot} forceFill />;

  switch (cluster.type) {
    // ── A: Feature Presentation ─────────────────────────────────────────────
    // IMAX (16:9) on top → gets more vertical space (flex-[9])
    // Two squares below  → flex-[7]
    case "A":
      return (
        <div className="w-full h-full flex flex-col gap-[2px]">
          <div className="flex-[9] min-h-0">{card(s0)}</div>
          <div className="flex-[7] min-h-0 grid grid-cols-2 gap-[2px]">
            {card(s1)}
            {card(s2)}
          </div>
        </div>
      );

    // ── B: Asymmetric Left ──────────────────────────────────────────────────
    // Vertical card fills full left column.
    // Right column: Academy (4:3) → flex-[3], Square (1:1) → flex-[4].
    case "B":
      return (
        <div className="flex w-full h-full gap-[2px]">
          <div className="w-1/2 h-full min-w-0">{card(s0)}</div>
          <div className="w-1/2 h-full min-w-0 flex flex-col gap-[2px]">
            <div className="flex-[3] min-h-0">{card(s1)}</div>
            <div className="flex-[4] min-h-0">{card(s2)}</div>
          </div>
        </div>
      );

    // ── C: Asymmetric Right ─────────────────────────────────────────────────
    // Left column: Square (1:1) → flex-[4], Academy (4:3) → flex-[3].
    // Vertical card fills full right column.
    case "C":
      return (
        <div className="flex w-full h-full gap-[2px]">
          <div className="w-1/2 h-full min-w-0 flex flex-col gap-[2px]">
            <div className="flex-[4] min-h-0">{card(s0)}</div>
            <div className="flex-[3] min-h-0">{card(s2)}</div>
          </div>
          <div className="w-1/2 h-full min-w-0">{card(s1)}</div>
        </div>
      );

    // ── D: Pacing Block ─────────────────────────────────────────────────────
    // Mirror of A: two squares on top → flex-[7], IMAX below → flex-[9]
    case "D":
      return (
        <div className="w-full h-full flex flex-col gap-[2px]">
          <div className="flex-[7] min-h-0 grid grid-cols-2 gap-[2px]">
            {card(s0)}
            {card(s1)}
          </div>
          <div className="flex-[9] min-h-0">{card(s2)}</div>
        </div>
      );

    // ── E: The Gallery ──────────────────────────────────────────────────────
    // Two poster-format cards, equal height, side by side.
    case "E":
      return (
        <div className="grid grid-cols-2 gap-[2px] w-full h-full">
          {card(s0)}
          {card(s1)}
        </div>
      );

    default:
      return null;
  }
});
