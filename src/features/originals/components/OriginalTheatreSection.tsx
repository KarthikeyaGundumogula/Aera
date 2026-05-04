import { useNavigate } from "react-router-dom";
import { Original } from "../../../types";
import { UnifiedTheatre } from "../../theatre/components/UnifiedTheatre";
import { SectionHeader } from "../../../components/SectionHeader";
import { ArrowRight } from "lucide-react";

interface OriginalTheatreSectionProps {
  original: Original;
}

export function OriginalTheatreSection({
  original,
}: OriginalTheatreSectionProps) {
  const navigate = useNavigate();

  // works is populated by the mock barrel (JOIN via originalId)
  const originalContent = original.works;

  if (!originalContent.length) return null;

  return (
    <section className="pt-12 pb-8">
      {/* Header stays padded for readability */}
      <div className="mb-6 flex items-center justify-between px-8">
        <SectionHeader
          iconNode={<div className="w-4 h-px bg-white" />}
          title="Theatre"
        />

        <button
          onClick={() => navigate(`/originals/${original.id}/theatre`)}
          className="group inline-flex items-center gap-2 text-white/40 transition-all hover:text-white active:scale-95"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Enter
          </span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Clusters inset to the same page gutter as the surrounding Originals sections */}
      <div className="px-8">
        <UnifiedTheatre 
          works={originalContent}
          variant="preview"
          maxClusters={2}
        />
      </div>
    </section>
  );
}
