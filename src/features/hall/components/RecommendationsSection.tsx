import { SectionHeader } from "../../../components/SectionHeader";
import { HorizontalClusterSection } from "./HorizontalClusterSection";
import { ORIGINALS, GRID_ITEMS } from "../../../mock";
import { Clapperboard } from "lucide-react";

// Filter works based on recommended originals to form the "Stage"
const RECOMMENDED_ORIGINALS = ORIGINALS.slice(0, 4);
const RECOMMENDED_WORKS = GRID_ITEMS.filter((w) =>
  RECOMMENDED_ORIGINALS.some((o) => w.originalIds?.includes(o.id)),
).slice(0, 15);

export function RecommendationsSection() {
  return (
    <div className="relative">
      <div className="px-6 md:px-12 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionHeader
          icon={Clapperboard}
          title="Talk of the week Stage"
          containerClassName="opacity-100"
        />
      </div>

      <div className="relative">
        <HorizontalClusterSection items={RECOMMENDED_WORKS} compact />
      </div>
    </div>
  );
}
