import { useEffect, useRef, useState, useMemo } from "react";
import { extractSrcId } from "../utils/embed";

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: (el?: HTMLElement) => Promise<unknown>;
        createVideo: (
          tweetId: string,
          targetEl: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement | undefined>;
        createTweet: (
          tweetId: string,
          targetEl: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement | undefined>;
      };
      events?: {
        bind: (type: string, callback: (event: any) => void) => void;
        unbind: (type: string, callback: (event: any) => void) => void;
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
    let observer: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let renderedHandler: ((event: any) => void) | null = null;

    const markLoaded = () => {
      if (isCancelled || renderGenRef.current !== generation) return;
      setIsLoaded(true);
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (mutationObserver) {
        mutationObserver.disconnect();
        mutationObserver = null;
      }
    };

    const render = async () => {
      const twttr = await loadTwitterSdk();
      if (isCancelled || renderGenRef.current !== generation) return;

      const container = containerRef.current;
      if (!container) return;

      // Subscribe to Twitter's native widget 'rendered' event
      if (twttr?.events?.bind) {
        renderedHandler = (event: any) => {
          if (container && (container.contains(event?.target) || event?.target === container.querySelector("iframe"))) {
            markLoaded();
          }
        };
        twttr.events.bind("rendered", renderedHandler);
      }

      container.innerHTML = `
        <blockquote class="twitter-tweet" data-media-max-width="560" data-conversation="none" data-theme="dark" data-dnt="true" data-align="center">
          <a href="https://twitter.com/x/status/${cleanTweetId}/video/1"></a>
        </blockquote>
      `;

      // Helper to check if a video iframe already exists and has rendered content (>50px)
      const checkRendered = () => {
        const iframe = container.querySelector("iframe");
        if (iframe) {
          const height = iframe.offsetHeight || iframe.clientHeight || iframe.getBoundingClientRect().height;
          if (height > 50) {
            markLoaded();
            return true;
          }

          iframe.addEventListener("load", markLoaded, { once: true });

          if (!observer) {
            observer = new ResizeObserver((entries) => {
              for (const entry of entries) {
                if (entry.contentRect.height > 50) {
                  markLoaded();
                }
              }
            });
            observer.observe(iframe);
          }
          return true;
        }
        return false;
      };

      mutationObserver = new MutationObserver(() => {
        if (checkRendered()) {
          mutationObserver?.disconnect();
          mutationObserver = null;
        }
      });
      mutationObserver.observe(container, { childList: true, subtree: true });

      if (twttr?.widgets?.load) {
        try {
          const res = twttr.widgets.load(container);
          if (res instanceof Promise) {
            await res;
            if (!isCancelled && renderGenRef.current === generation) {
              const iframe = container.querySelector("iframe");
              const h = iframe?.offsetHeight || iframe?.getBoundingClientRect().height || 0;
              if (h > 50) {
                markLoaded();
                return;
              }
            }
          }
        } catch (e) {
          console.warn("[useTwitterWidgets] load error:", e);
        }
      }

      if (isCancelled || renderGenRef.current !== generation) return;

      checkRendered();
    };

    render();

    // Fallback safety timer: dismiss loader after 2.5s if adblockers/network prevent events
    const fallbackTimer = setTimeout(() => {
      markLoaded();
    }, 2500);

    return () => {
      isCancelled = true;
      clearTimeout(fallbackTimer);
      renderGenRef.current++;
      if (observer) observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      if (renderedHandler && window.twttr?.events?.unbind) {
        try {
          window.twttr.events.unbind("rendered", renderedHandler);
        } catch { /* ignore */ }
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [cleanTweetId, refreshTrigger]);

  return { containerRef, isLoaded, tweetId: cleanTweetId };
}
