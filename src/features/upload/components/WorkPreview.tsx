import { useMemo, useState } from "react";
import { X, Play, Film } from "lucide-react";
import { TheatreItem } from "../../../types";
import { EditWork } from "../../shared/work/EditWork";
import { PosterWork } from "../../shared/work/PosterWork";
import { StoryboardWork } from "../../shared/work/StoryboardWork";
import { extractSrcId, buildThumbnail, buildEmbedUrl } from "../../../utils/embed";
import type { UploadFormData } from "../types";

interface WorkPreviewProps {
  formData: UploadFormData;
  originalCover?: string;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format";

export function WorkPreview({ formData, originalCover }: WorkPreviewProps) {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const mockItem: TheatreItem = useMemo(() => {
    const rawSrcId = extractSrcId(formData.platform, formData.contentUrl);
    const srcId = rawSrcId && rawSrcId.trim().length > 0 ? rawSrcId.trim() : undefined;

    // Resolve cover image
    let image = originalCover || FALLBACK_IMAGE;

    if (formData.category === "Poster" && formData.contentUrl) {
      image = formData.contentUrl;
    } else if (formData.category === "Storyboard" && formData.storyboardPages.length > 0) {
      image = formData.storyboardPages[0].url;
    } else if (srcId && (formData.platform === "youtube" || !formData.platform)) {
      image = buildThumbnail("youtube", srcId);
    } else if (originalCover) {
      image = originalCover;
    }

    return {
      id: "preview-id",
      title: formData.title || "Untitled Work",
      category: formData.category,
      image,
      thumbnail: image,
      images: formData.storyboardPages.map((p) => p.url),
      captions: formData.storyboardPages.map((p) => p.text),
      aspectRatio: formData.aspectRatio,
      artist: "You",
      originalIds: formData.originalIds,
      platform: formData.platform || "youtube",
      srcId,
    };
  }, [formData, originalCover]);

  const embedUrl = useMemo(() => {
    if (mockItem.category === "Edit" && mockItem.platform === "youtube" && mockItem.srcId) {
      return buildEmbedUrl("youtube", mockItem.srcId);
    }
    return "";
  }, [mockItem.category, mockItem.platform, mockItem.srcId]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      {/* Render exact theatre container — intercept click so it opens in-studio preview instead of navigating to /works/preview-id */}
      <div
        className="w-full relative shadow-2xl transition-all duration-300 mx-auto cursor-pointer group/preview"
        style={{
          aspectRatio: formData.aspectRatio,
          maxWidth: formData.aspectRatio > 1 ? "600px" : "320px",
          maxHeight: "75vh",
        }}
        onClickCapture={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsPreviewModalOpen(true);
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
          <StoryboardWork
            item={mockItem}
            variant="feed"
            showBadge={true}
          />
        )}
      </div>

      <p className="mt-6 text-[10px] uppercase font-bold tracking-widest text-white/30 flex items-center gap-1.5">
        <Play className="w-3 h-3 text-white/40" /> Click card to test Theatre Preview
      </p>

      {/* In-Studio Theatre Preview Modal */}
      {isPreviewModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Theatre Preview"
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-white/60" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
                  {mockItem.title}
                </span>
                <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded bg-white/10 text-white/60 font-bold ml-2">
                  Preview Mode
                </span>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Player Container */}
            <div
              className="w-full relative rounded-2xl overflow-hidden bg-surface-deep border border-white/10 shadow-2xl flex items-center justify-center"
              style={{
                aspectRatio: formData.aspectRatio,
                maxHeight: "75vh",
              }}
            >
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : formData.category === "Poster" ? (
                <img
                  src={mockItem.image}
                  alt={mockItem.title}
                  className="w-full h-full object-contain"
                />
              ) : formData.category === "Storyboard" && mockItem.images && mockItem.images.length > 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <img
                    src={mockItem.images[0]}
                    alt="Storyboard cover"
                    className="max-h-[60vh] object-contain rounded-xl mb-4"
                  />
                  {mockItem.captions?.[0] && (
                    <p className="text-xs text-white/70 max-w-md font-sans">
                      {mockItem.captions[0]}
                    </p>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-white/40">
                  <Film className="w-12 h-12 mb-3 stroke-1 text-white/20" />
                  <p className="text-xs font-bold uppercase tracking-widest text-white/60">
                    No active media embed source
                  </p>
                  <p className="text-[10px] mt-1 text-white/30">
                    Provide a valid YouTube URL or media asset to test live playback
                  </p>
                </div>
              )}
            </div>

            <p className="text-[9px] uppercase tracking-widest text-white/30">
              Press ESC or click outside to return to the studio
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
