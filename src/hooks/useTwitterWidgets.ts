import { useEffect, useRef, useCallback, useState } from "react";

declare global {
  interface Window {
    twttr?: any;
  }
}

export function useTwitterWidgets(srcId: string | undefined, refreshTrigger?: any) {
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

      let attempts = 0;
      const checkHeightAndResolve = () => {
        attempts++;
        const iframe = container.querySelector("iframe");
        if (iframe) {
          const height = iframe.offsetHeight || parseFloat(iframe.style.height) || 0;
          if (height > 100 || attempts > 30) {
            if (renderGenRef.current === generation) setIsLoaded(true);
            return;
          }
        } else if (attempts > 30) {
          if (renderGenRef.current === generation) setIsLoaded(true);
          return;
        }

        if (renderGenRef.current === generation) {
          setTimeout(checkHeightAndResolve, 100);
        }
      };

      const p = window.twttr.widgets.load(containerRef.current);
      if (p && typeof p.then === "function") {
        p.then(() => {
          checkHeightAndResolve();
        }).catch((err: any) => {
          console.error("Twitter widget load error", err);
          if (renderGenRef.current === generation) setIsLoaded(true);
        });
      } else {
        setTimeout(checkHeightAndResolve, 100);
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
        if (pollRef.current) clearInterval(pollRef.current as any);
        pollRef.current = setInterval(() => {
          if (window.twttr?.widgets) {
            if (pollRef.current) clearInterval(pollRef.current as any);
            pollRef.current = null;
            doLoad();
          }
        }, 100);
        
        setTimeout(() => {
          if (pollRef.current) {
            clearInterval(pollRef.current as any);
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
        clearInterval(pollRef.current as any);
        pollRef.current = null;
      }
    };
  }, [srcId, renderTweet, refreshTrigger]);

  return { containerRef, isLoaded };
}
