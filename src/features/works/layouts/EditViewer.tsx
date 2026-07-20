import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TheatreItem } from "../../../types";
import { ViewerFrame, MediaSlotContext } from "./ViewerFrame";
import { buildEmbedUrl } from "../../../utils/embed";
import { useTwitterWidgets } from "../../../hooks/useTwitterWidgets";
import { FHLoader } from "../../../components/FHLoader";

interface EditViewerProps {
  item: TheatreItem;
}

/**
 * EditViewer — wraps ViewerFrame with the YouTube/Twitter embed as
 * the media slot. All chrome (identity block, artist panel, nav) lives in
 * ViewerFrame.
 */
export function EditViewer({ item }: EditViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isYoutubeLoaded, setIsYoutubeLoaded] = useState(false);

  const isYoutube = item.platform === "youtube";
  const isTwitter = item.platform === "twitter";

  const { containerRef: twitterRef, isLoaded: isTwitterLoaded } =
    useTwitterWidgets(isTwitter ? item.srcId : undefined, true);

  const isLoaded = isYoutube ? isYoutubeLoaded : isTwitterLoaded;
  const youtubeEmbedUrl = isYoutube && item.srcId ? buildEmbedUrl("youtube", item.srcId) : "";

  const ambientSrc =
    isYoutube && item.srcId
      ? `https://img.youtube.com/vi/${item.srcId}/maxresdefault.jpg`
      : item.image || "";

  return (
    <ViewerFrame
      item={item}
      mediaMaxWidth={isTwitter ? "min(550px,calc(100vw-2rem))" : "min(680px,calc(100vw-2rem))"}
      mediaSlot={({ doubleTapFlash, triggerDoubleTap }: MediaSlotContext) => (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full"
          onPointerDown={triggerDoubleTap}
        >
          {/* Loading shimmer */}
          <AnimatePresence>
            {!isLoaded && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-white/[0.025] rounded-xl"
              >
                {isYoutube && ambientSrc && (
                  <img
                    src={ambientSrc}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-20"
                  />
                )}
                <FHLoader label="Loading" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* YouTube embed */}
          {isYoutube && (
            <div
              className={`relative mx-auto rounded-xl overflow-hidden transition-opacity duration-500 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              style={{ 
                boxShadow: "0 0 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
                aspectRatio: "16/9",
                width: "100%",
                maxHeight: "calc(100vh - 320px)",
                maxWidth: "calc((100vh - 320px) * 16 / 9)"
              }}
            >
              <iframe
                ref={iframeRef}
                id={`yt-${item.id}`}
                src={youtubeEmbedUrl}
                className="absolute inset-0 w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={item.title}
                loading="eager"
                onLoad={() => setIsYoutubeLoaded(true)}
              />
            </div>
          )}

          {/* Twitter/X embed */}
          {isTwitter && (
            <div
              className={`w-full flex justify-center transition-opacity duration-500 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
            >
              <div ref={twitterRef} className="w-full max-w-[540px]" />
            </div>
          )}
        </motion.div>
      )}
    />
  );
}
