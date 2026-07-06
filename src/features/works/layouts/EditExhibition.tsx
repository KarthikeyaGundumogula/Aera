import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TheatreItem } from "../../../types";
import { ExhibitionFrame, MediaSlotContext } from "./ExhibitionFrame";
import { buildEmbedUrl } from "../../../utils/embed";
import { useTwitterWidgets } from "../../../hooks/useTwitterWidgets";
import { FHLoader } from "../../../components/FHLoader";
import { HonourIcon } from "../../../components/icons/HonourIcon";

interface EditExhibitionProps {
  item: TheatreItem;
}

/**
 * EditExhibition — wraps ExhibitionFrame with the YouTube/Twitter embed as
 * the media slot. All chrome (identity block, artist panel, nav) lives in
 * ExhibitionFrame.
 */
export function EditExhibition({ item }: EditExhibitionProps) {
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
    <ExhibitionFrame
      item={item}
      mediaMaxWidth="min(900px,calc(100vw-2rem))"
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
              className={`w-full aspect-video rounded-xl overflow-hidden transition-opacity duration-500 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              style={{ boxShadow: "0 0 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)" }}
            >
              <iframe
                ref={iframeRef}
                id={`yt-${item.id}`}
                src={youtubeEmbedUrl}
                className="w-full h-full border-none"
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

          {/* Double-tap honour flash */}
          <AnimatePresence>
            {doubleTapFlash && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.4 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
              >
                <HonourIcon size={72} filled={true} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    />
  );
}
