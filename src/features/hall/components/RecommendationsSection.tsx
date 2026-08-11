import { SectionHeader } from "../../../components/SectionHeader";
import { HorizontalClusterSection } from "./HorizontalClusterSection";
import { Clapperboard } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useState, useEffect } from "react";

export function RecommendationsSection() {
  const [recommendedWorks, setRecommendedWorks] = useState<any[]>([]);

  useEffect(() => {
    apiFetch("/theatre")
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          setRecommendedWorks(json.items || json.data || []);
        }
      })
      .catch(() => {});
  }, []);
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
        <HorizontalClusterSection items={recommendedWorks} compact />
      </div>
    </div>
  );
}
