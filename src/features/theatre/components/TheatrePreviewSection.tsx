import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { TheatreItem } from "../../../types";
import { UnifiedTheatre } from "./UnifiedTheatre";
import { SectionHeader } from "../../../components/SectionHeader";
import { ArrowRight } from "lucide-react";

interface TheatrePreviewSectionProps {
  title?: string;
  works: TheatreItem[];
  enterUrl: string;
}

export const TheatrePreviewSection = memo(function TheatrePreviewSection({
  title = "Theatre",
  works,
  enterUrl,
}: TheatrePreviewSectionProps) {
  const navigate = useNavigate();

  if (!works.length) return null;

  return (
    <section className="pt-6 pb-20">
      {/* Header stays padded for readability */}
      <div className="mb-6 flex items-center justify-between px-4 md:px-8">
        <SectionHeader title={title} />

        <button
          onClick={() => navigate(enterUrl)}
          className="group inline-flex items-center gap-2 text-white/40 transition-all hover:text-white active:scale-95"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Enter
          </span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Clusters inset to the same page gutter as the surrounding sections */}
      <div className="">
        <UnifiedTheatre 
          works={works}
          variant="preview"
          maxClusters={2}
        />
      </div>
    </section>
  );
});
