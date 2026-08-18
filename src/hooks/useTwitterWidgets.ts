import { useEffect, useRef, useState, useMemo } from "react";
import { extractSrcId } from "../utils/embed";

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: (el?: HTMLElement) => Promise<unknown>;
        createTweet: (
          tweetId: string,
          targetEl: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement | undefined>;
      };
      _e?: Array<() => void>;
      ready?: (callback: (twttr: any) => void) => void;
    };
  }
}

let twitterScriptPromise: Promise<any> | null = null;

function loadTwitterSdk(): Promise<any> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.twttr?.widgets) return Promise.resolve(window.twttr);

  if (!twitterScriptPromise) {
    twitterScriptPromise = new Promise((resolve) => {
      if (window.twttr?.widgets) {
        resolve(window.twttr);
        return;
      }

      const scriptId = "twitter-wjs";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        script.charset = "utf-8";
        document.body.appendChild(script);
      }

      const onDone = () => {
        if (window.twttr?.ready) {
          window.twttr.ready((twttr: any) => resolve(twttr));
        } else {
          resolve(window.twttr || null);
        }
      };

      script.addEventListener("load", onDone);
      script.addEventListener("error", () => resolve(null));

      // Fallback timeout in case script is blocked
      setTimeout(onDone, 3000);
    });
  }

  return twitterScriptPromise;
}

export function useTwitterWidgets(srcId: string | undefined, refreshTrigger?: unknown) {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderGenRef = useRef(0);

  const cleanTweetId = useMemo(() => {
    if (!srcId) return "";
    return extractSrcId("twitter", srcId);
  }, [srcId]);

  useEffect(() => {
    if (!cleanTweetId) {
      setIsLoaded(true);
      return;
    }

    const generation = ++renderGenRef.current;
    setIsLoaded(false);
    let isCancelled = false;

    const render = async () => {
      const twttr = await loadTwitterSdk();
      if (isCancelled || renderGenRef.current !== generation) return;

      const container = containerRef.current;
      if (!container) return;

      container.innerHTML = "";

      if (twttr?.widgets?.createTweet) {
        try {
          const el = await twttr.widgets.createTweet(cleanTweetId, container, {
            theme: "dark",
            dnt: true,
            conversation: "none",
            align: "center",
          });

          if (isCancelled || renderGenRef.current !== generation) return;

          if (el) {
            setIsLoaded(true);
            return;
          }
        } catch (err) {
          console.warn("[useTwitterWidgets] createTweet failed, trying fallback blockquote:", err);
        }
      }

      // Fallback: blockquote + widgets.load
      if (container && !isCancelled && renderGenRef.current === generation) {
        container.innerHTML = `
          <blockquote class="twitter-tweet" data-theme="dark" data-dnt="true" data-conversation="none" data-align="center">
            <a href="https://twitter.com/i/status/${cleanTweetId}"></a>
          </blockquote>
        `;

        if (twttr?.widgets?.load) {
          try {
            await twttr.widgets.load(container);
          } catch (e) {
            console.warn("[useTwitterWidgets] fallback load error:", e);
          }
        }
      }

      if (!isCancelled && renderGenRef.current === generation) {
        setIsLoaded(true);
      }
    };

    render();

    const fallbackTimer = setTimeout(() => {
      if (!isCancelled && renderGenRef.current === generation) {
        setIsLoaded(true);
      }
    }, 4000);

    return () => {
      isCancelled = true;
      clearTimeout(fallbackTimer);
      renderGenRef.current++;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [cleanTweetId, refreshTrigger]);

  return { containerRef, isLoaded, tweetId: cleanTweetId };
}
