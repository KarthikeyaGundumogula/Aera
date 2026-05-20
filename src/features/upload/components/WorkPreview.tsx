import { useMemo } from "react";
import { TheatreItem } from "../../../types";
import { EditWork } from "../../shared/work/EditWork";
import { PosterWork } from "../../shared/work/PosterWork";
import { ScriptWork } from "../../shared/work/ScriptWork";
import { extractSrcId, buildThumbnail } from "../../../utils/embed";
import type { UploadFormData } from "../types";

interface WorkPreviewProps {
  formData: UploadFormData;
  originalCover?: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format";

export function WorkPreview({ formData, originalCover }: WorkPreviewProps) {
  const mockItem: TheatreItem = useMemo(() => {
    // Extract the raw platform ID from whatever the user pasted
    const srcId = extractSrcId(formData.platform, formData.contentUrl) ?? undefined;

    // Resolve cover image
    let image = originalCover ?? FALLBACK_IMAGE;
    
    if (formData.category === "Poster" && formData.contentUrl) {
      image = formData.contentUrl;
    } else if (formData.category === "Script" && formData.scriptPages.length > 0) {
      image = formData.scriptPages[0].url;
    } else if (srcId && formData.platform === "youtube") {
      image = buildThumbnail("youtube", srcId);
    }

    return {
      id: "preview-id",
      title: formData.title || "Untitled Work",
      category: formData.category,
      image,
      images: formData.scriptPages.map(p => p.url),
      captions: formData.scriptPages.map(p => p.text),
      aspectRatio: formData.aspectRatio,
      artist: "You", // Locked to current user
      originalIds: formData.originalIds,
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
        ) : formData.category === "Poster" ? (
          <PosterWork
            item={mockItem}
            variant="feed"
            showBadge={true}
          />
        ) : (
          <ScriptWork
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
