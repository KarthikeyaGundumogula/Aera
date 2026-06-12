import { useEffect, useRef, useCallback, useState } from "react";

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: (el: HTMLElement) => unknown;
      };
    };
  }
}

export function useTwitterWidgets(srcId: string | undefined, refreshTrigger?: unknown) {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | number | null>(null);
  const renderGenRef = useRef(0);

  const renderTweet = useCallback(() => {
    const container = containerRef.current;
    if (!container || !srcId) return;

    const generation = ++renderGenRef.current;

    container.innerHTML = [
      `<blockquote`,
      `  class="twitter-tweet"`,
      `  data-media-max-width="560"`,
      `  data-conversation="none"`,
      `  data-theme="dark"`,
      `  data-dnt="true"`,
      `>`,
      `  <a href="https://twitter.com/twitter/status/${srcId}"></a>`,
      `</blockquote>`,
    ].join(" ");

    const doLoad = () => {
      if (renderGenRef.current !== generation) return;
      if (!window.twttr?.widgets || !containerRef.current) return;

      const p = window.twttr.widgets.load(containerRef.current);
      if (p instanceof Promise) {
        p.then(() => {
          if (renderGenRef.current !== generation) return;
          // Use ResizeObserver instead of layout thrashing polling
          const iframe = container.querySelector("iframe");
          if (iframe) {
            const observer = new ResizeObserver((entries) => {
              for (const entry of entries) {
                if (entry.contentRect.height > 100) {
                  observer.disconnect();
                  if (renderGenRef.current === generation) setIsLoaded(true);
                }
              }
            });
            observer.observe(iframe);
            // Fallback just in case observer doesn't fire
            setTimeout(() => {
              observer.disconnect();
              if (renderGenRef.current === generation) setIsLoaded(true);
            }, 3000);
          } else {
            setIsLoaded(true);
          }
        }).catch((err: unknown) => {
          console.error("Twitter widget load error", err);
          if (renderGenRef.current === generation) setIsLoaded(true);
        });
      } else {
        // Fallback if twttr.widgets.load doesn't return a promise
        setTimeout(() => {
          if (renderGenRef.current === generation) setIsLoaded(true);
        }, 1000);
      }
    };

    if (window.twttr?.widgets) {
      doLoad();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src*="platform.twitter.com/widgets.js"]',
      );
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        script.charset = "utf-8";
        script.onload = doLoad;
        document.body.appendChild(script);
      } else {
        if (pollRef.current) clearInterval(pollRef.current as number);
        pollRef.current = setInterval(() => {
          if (window.twttr?.widgets) {
            if (pollRef.current) clearInterval(pollRef.current as number);
            pollRef.current = null;
            doLoad();
          }
        }, 100);
        
        setTimeout(() => {
          if (pollRef.current) {
            clearInterval(pollRef.current as number);
            pollRef.current = null;
          }
          if (renderGenRef.current === generation) {
            setIsLoaded(true);
          }
        }, 5000);
      }
    }
  }, [srcId]);

  useEffect(() => {
    if (!srcId) return;
    setIsLoaded(false);
    const fallback = setTimeout(() => setIsLoaded(true), 5000);
    renderTweet();
    return () => {
      clearTimeout(fallback);
      if (pollRef.current) {
        clearInterval(pollRef.current as number);
        pollRef.current = null;
      }
      renderGenRef.current++; // Invalidate pending loads
      if (containerRef.current) {
        containerRef.current.innerHTML = ""; // Cleanup DOM
      }
    };
  }, [srcId, renderTweet, refreshTrigger]);

  return { containerRef, isLoaded };
}
