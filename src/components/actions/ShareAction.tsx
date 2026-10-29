import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Share2, Check, Copy, MessageCircle } from "lucide-react";

export interface ShareActionProps {
  title?: string;
  text?: string;
  url?: string;
  variant?: "feed" | "viewer" | "nav" | "button" | "icon" | "ledger";
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
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openDownward, setOpenDownward] = useState(false);
  const [horizontalShift, setHorizontalShift] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const hasNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const getTargetUrl = useCallback(() => {
    if (url) {
      if (url.startsWith("http")) return url;
      if (typeof window !== "undefined") {
        return `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
      }
      return url;
    }
    return typeof window !== "undefined" ? window.location.href : "";
  }, [url]);

  // Adjust docking position dynamically to avoid viewport clipping
  useEffect(() => {
    if (!isOpen) return;

    const checkBounds = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      // If near the top (e.g. top headers or swiper controls), open downwards
      if (spaceAbove < 75 && spaceBelow > spaceAbove) {
        setOpenDownward(true);
      } else {
        setOpenDownward(false);
      }

      if (dockRef.current) {
        const dRect = dockRef.current.getBoundingClientRect();
        const padding = 12;
        let shift = 0;
        if (dRect.left < padding) {
          shift = padding - dRect.left;
        } else if (dRect.right > window.innerWidth - padding) {
          shift = window.innerWidth - padding - dRect.right;
        }
        setHorizontalShift(shift);
      }
    };

    checkBounds();
    const rafId = requestAnimationFrame(checkBounds);
    window.addEventListener("resize", checkBounds);
    window.addEventListener("scroll", checkBounds, true);

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!dockRef.current || !dockRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", checkBounds);
      window.removeEventListener("scroll", checkBounds, true);
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetUrl = getTargetUrl();
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
        ta.style.cssText = "position:fixed;opacity:0;left:-9999px;top:-9999px;";
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
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1400);
    }
  };

  const handleShareX = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetUrl = getTargetUrl();
    const shareText = text || title || "Check out this on Aera";
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText,
    )}&url=${encodeURIComponent(targetUrl)}`;
    window.open(xUrl, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetUrl = getTargetUrl();
    const shareText = text || title || "Check out this on Aera";
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `${shareText} ${targetUrl}`,
    )}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetUrl = getTargetUrl();

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: targetUrl,
        });
        if (onShareSuccess) onShareSuccess();
        setIsOpen(false);
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }

    // Fallback if native share fails
    handleCopy(e);
  };

  const renderTrigger = () => {
    if (variant === "icon") {
      return (
        <button
          type="button"
          onClick={handleToggle}
          aria-label="Share"
          className={`w-9 h-9 rounded-xl backdrop-blur-md border flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 ${
            isOpen || copied
              ? "bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
              : "bg-black/60 border-white/10 text-white/60 hover:text-white hover:bg-black/80"
          } ${className}`}
        >
          {copied ? (
            <Check size={15} className="text-emerald-400" />
          ) : (
            <Share2 size={15} />
          )}
        </button>
      );
    }

    if (variant === "ledger") {
      return (
        <button
          type="button"
          onClick={handleToggle}
          aria-label="Share entry"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-xl border transition-all cursor-pointer text-[10px] font-black uppercase tracking-widest active:scale-95 ${
            isOpen || copied
              ? "border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
              : "border-white/10 text-white/60 hover:text-white hover:border-white/25"
          } ${className}`}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Share2 className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {copied ? "Copied" : label}
          </span>
        </button>
      );
    }

    if (variant === "nav") {
      return (
        <button
          type="button"
          onClick={handleToggle}
          aria-label="Share"
          className={`flex items-center gap-1.5 h-8 px-3 rounded-xl backdrop-blur-md border transition-all duration-200 active:scale-[0.95] cursor-pointer ${
            isOpen || copied
              ? "bg-amber-500/20 border-amber-500/40 text-amber-400 font-bold"
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
          type="button"
          onClick={handleToggle}
          className={`h-9 px-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 active:scale-95 cursor-pointer ${
            isOpen || copied
              ? "bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
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

    // Default "button" / "feed" variant (matches PostCard action row)
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`h-11 px-3 rounded-2xl border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 active:scale-95 cursor-pointer ${
          isOpen || copied
            ? "bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
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

  return (
    <div
      className="relative inline-flex items-center"
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {renderTrigger()}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dockRef}
            initial={{ opacity: 0, y: openDownward ? -6 : 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: horizontalShift, scale: 1 }}
            exit={{ opacity: 0, y: openDownward ? -6 : 6, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className={`absolute ${
              openDownward ? "top-full mt-2" : "bottom-full mb-2"
            } right-0 z-[500] flex items-center gap-1 p-1.5 rounded-2xl bg-[#0e0e10]/95 backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.85)] select-none whitespace-nowrap`}
          >
            {/* Copy Link Action */}
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer active:scale-95 ${
                copied
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-white/75 hover:text-white hover:bg-white/10"
              }`}
              title="Copy link to clipboard"
            >
              {copied ? (
                <Check size={13} className="text-emerald-400" />
              ) : (
                <Copy size={13} />
              )}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            {/* X / Twitter Action */}
            <button
              type="button"
              onClick={handleShareX}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-white/75 hover:text-white hover:bg-white/10 transition-all duration-150 cursor-pointer active:scale-95"
              title="Share to X"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>X</span>
            </button>

            {/* WhatsApp Action */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-white/75 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-150 cursor-pointer active:scale-95"
              title="Share to WhatsApp"
            >
              <MessageCircle size={13} />
              <span>WhatsApp</span>
            </button>

            {/* Native OS Share (if supported) */}
            {hasNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-white/75 hover:text-amber-400 hover:bg-amber-500/10 transition-all duration-150 cursor-pointer active:scale-95"
                title="More sharing options"
              >
                <Share2 size={13} />
                <span>More</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
