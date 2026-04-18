import { useMemo } from "react";
import { TheatreItem } from "../../../types";
import { EditWork } from "../../shared/work/EditWork";
import { PosterWork } from "../../shared/work/PosterWork";
import { extractSrcId, buildThumbnail } from "../../../utils/embed";

interface WorkPreviewProps {
  formData: {
    title: string;
    category: "Edit" | "Poster";
    originalId: string;
    contentUrl: string;
    aspectRatio: number;
    platform: "youtube" | "twitter";
  };
  originalCover?: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format";

export function WorkPreview({ formData, originalCover }: WorkPreviewProps) {
  const mockItem: TheatreItem = useMemo(() => {
    // Extract the raw platform ID from whatever the user pasted
    const srcId = extractSrcId(formData.platform, formData.contentUrl) ?? undefined;

    // Derive thumbnail for YouTube; for Twitter use the originalCover or fallback
    const image =
      srcId && formData.platform === "youtube"
        ? buildThumbnail("youtube", srcId)
        : (originalCover ?? FALLBACK_IMAGE);

    return {
      id: "preview-id",
      title: formData.title || "Untitled Work",
      category: formData.category,
      image,
      aspectRatio: formData.aspectRatio,
      artist: "You", // Locked to current user
      originalIds: formData.originalId ? [formData.originalId] : [],
      platform: formData.platform,
      srcId,
    };
  }, [formData, originalCover]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      {/* Render exact theatre container */}
      <div
        className="w-full relative shadow-2xl transition-all duration-300 mx-auto"
        style={{
          aspectRatio: formData.aspectRatio,
          maxWidth: formData.aspectRatio > 1 ? "600px" : "320px",
          maxHeight: "75vh",
        }}
      >
        {formData.category === "Edit" ? (
          <EditWork
            item={mockItem}
            variant="feed"
            showBadge={true}
            showHoverOverlay={true}
          />
        ) : (
          <PosterWork
            item={mockItem}
            variant="feed"
            showBadge={true}
          />
        )}
      </div>
      <p className="mt-6 text-[10px] uppercase font-bold tracking-widest text-white/30">
        Click card to test Theatre Modal
      </p>
    </div>
  );
}
