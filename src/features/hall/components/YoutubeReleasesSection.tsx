import { Youtube } from "lucide-react";
import { RecentReleasesSection } from "../../shared/components/RecentReleasesSection";

export function YoutubeReleasesSection() {
  return (
    <RecentReleasesSection
      title="Top Releases this Week"
      icon={Youtube}
      className=""
      headerClassName="mb-5 opacity-100"
    />
  );
}
