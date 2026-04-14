import { memo } from "react";
import { SetSelectedItem } from "../../../../types";
import { MobileCluster } from "../../engine/mobileClusterBuilder";
import { MobileCard } from "./MobileCard";

interface MobileClusterViewProps {
  cluster: MobileCluster;
  setSelectedItem: SetSelectedItem;
}

/**
 * Renders a single mobile cluster according to its layout type.
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
  setSelectedItem,
}: MobileClusterViewProps) {
  const [s0, s1, s2] = cluster.slots;
  const card = (slot: typeof s0, fill = false) => (
    <MobileCard slot={slot} setSelectedItem={setSelectedItem} forceFill={fill} />
  );

  switch (cluster.type) {
    // ── A: Feature Presentation ───────────────────────────────────────
    case "A":
      return (
        <div className="w-full flex flex-col gap-1">
          {card(s0)}
          <div className="grid grid-cols-2 gap-1 w-full">
            {card(s1)}
            {card(s2)}
          </div>
        </div>
      );

    // ── B: Asymmetric Left ────────────────────────────────────────────
    case "B":
      return (
        <div className="flex w-full gap-1">
          <div className="w-1/2 flex flex-col">{card(s0, true)}</div>
          <div className="w-1/2 flex flex-col gap-1">
            {card(s1)}
            {card(s2)}
          </div>
        </div>
      );

    // ── C: Asymmetric Right ───────────────────────────────────────────
    case "C":
      return (
        <div className="flex w-full gap-1">
          <div className="w-1/2 flex flex-col gap-1">
            {card(s0)}
            {card(s2)}
          </div>
          <div className="w-1/2 flex flex-col">{card(s1, true)}</div>
        </div>
      );

    // ── D: Pacing Block ───────────────────────────────────────────────
    case "D":
      return (
        <div className="w-full flex flex-col gap-1">
          <div className="grid grid-cols-2 gap-1 w-full">
            {card(s0)}
            {card(s1)}
          </div>
          {card(s2)}
        </div>
      );

    // ── E: The Gallery ────────────────────────────────────────────────
    case "E":
      return (
        <div className="grid grid-cols-2 gap-1 w-full">
          {card(s0)}
          {card(s1)}
        </div>
      );

    default:
      return null;
  }
});
