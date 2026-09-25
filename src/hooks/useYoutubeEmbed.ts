import { useState, useEffect, useCallback } from "react";

/**
 * useYoutubeEmbed
 *
 * Fast, responsive loader detection for YouTube iframes.
 *
 * YouTube iframes paint the video thumbnail and player UI within 150–300ms,
 * but browser native `iframe.onload` can be stalled for seconds by YouTube's
 * background analytics, ad-engine, and telemetry network requests.
 *
 * This hook listens to:
 * 1. Native `iframe.onload` (if it fires early)
 * 2. Window `message` events from `youtube.com` (sent via `enablejsapi=1` on initialization)
 * 3. A 400ms safety timeout (by which YouTube has already painted the thumbnail and player)
 *
 * This guarantees the FHLoader overlay dismisses the instant the player/thumbnail
 * appears, without lingering over the rendered video.
 */
export function useYoutubeEmbed(srcId: string | undefined, isEnabled = true) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isEnabled || !srcId) {
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);
    let isCancelled = false;

    const onMessage = (event: MessageEvent) => {
      if (
        typeof event.origin === "string" &&
        (event.origin.includes("youtube.com") || event.origin.includes("youtube-nocookie.com"))
      ) {
        if (!isCancelled) {
          setIsLoaded(true);
        }
      }
    };

    window.addEventListener("message", onMessage);

    // Fallback: YouTube paints thumbnail & initial UI within ~400ms
    const timer = setTimeout(() => {
      if (!isCancelled) {
        setIsLoaded(true);
      }
    }, 450);

    return () => {
      isCancelled = true;
      window.removeEventListener("message", onMessage);
      clearTimeout(timer);
    };
  }, [srcId, isEnabled]);

  const handleIframeLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return { isYoutubeLoaded: isLoaded, handleIframeLoad };
}
