import React, { useState, useCallback } from "react";
import { Share2, Check } from "lucide-react";

export interface ShareActionProps {
  title?: string;
  text?: string;
  url?: string;
  variant?: "feed" | "viewer" | "nav" | "button";
  className?: string;
  onShareSuccess?: () => void;
  label?: string;
}

export const ShareAction: React.FC<ShareActionProps> = ({
  title = "Aera",
  text = "Check out this on Aera",
  url,
  variant = "button",
  className = "",
  onShareSuccess,
  label = "Share",
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const targetUrl = url || window.location.href;

      if (navigator.share) {
        try {
          await navigator.share({
            title,
            text,
            url: targetUrl,
          });
          if (onShareSuccess) onShareSuccess();
          return;
        } catch (err: unknown) {
          if (err instanceof Error && err.name === "AbortError") return;
        }
      }

      let ok = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(targetUrl);
          ok = true;
        } catch (_) {}
      }

      if (!ok) {
        try {
          const ta = document.createElement("textarea");
          ta.value = targetUrl;
          ta.style.cssText =
            "position:fixed;opacity:0;left:-9999px;top:-9999px;";
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          ok = document.execCommand("copy");
          document.body.removeChild(ta);
        } catch (_) {}
      }

      if (ok) {
        setCopied(true);
        if (onShareSuccess) onShareSuccess();
        setTimeout(() => setCopied(false), 2000);
      }
    },
    [title, text, url, onShareSuccess],
  );

  if (variant === "nav") {
    return (
      <button
        onClick={handleShare}
        aria-label="Share"
        className={`flex items-center gap-1.5 h-8 px-3 rounded-xl backdrop-blur-md border transition-all duration-200 active:scale-[0.95] ${
          copied
            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 font-bold"
            : "bg-black/55 border-white/8 text-white/40 hover:text-white hover:border-white/20"
        } ${className}`}
        style={{ touchAction: "manipulation" }}
      >
        {copied ? (
          <Check size={12} className="text-emerald-400" />
        ) : (
          <Share2 size={12} strokeWidth={2} />
        )}
        <span className="text-[8.5px] font-black uppercase tracking-[0.22em] hidden sm:inline">
          {copied ? "Copied" : label}
        </span>
      </button>
    );
  }

  if (variant === "viewer") {
    return (
      <button
        onClick={handleShare}
        className={`h-9 px-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
          copied
            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
            : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
        } ${className}`}
        aria-label="Share work"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Copied</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </>
        )}
      </button>
    );
  }

  // Default "button" / "feed" variant (matches WallPostCard action row)
  return (
    <button
      onClick={handleShare}
      className={`h-11 px-3 rounded-2xl border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
        copied
          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
          : "bg-white/[0.03] border-white/10 text-white/70 hover:text-white hover:bg-white/[0.06]"
      } ${className}`}
      aria-label="Share"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Copied</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </>
      )}
    </button>
  );
};
