import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { TheatreItem } from "../../../types";

interface ScriptFilmstripProps {
  pages: string[];
  captions?: string[];
  item: TheatreItem;
}

/**
 * ScriptFilmstrip — Desktop horizontal filmstrip viewer.
 *
 * Images are laid out side-by-side. The user drag-scrolls with
 * momentum (native overflow-x scroll + touch). A scrubber bar
 * at the bottom shows position and allows jumping to any page.
 * A fixed HUD counter (03 / 08) tracks the current page.
 */
export function ScriptFilmstrip({ pages, captions, item }: ScriptFilmstripProps) {
  const [activePage, setActivePage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToPage = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const child = el.children[idx] as HTMLElement;
    if (child) {
      child.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    }
    setActivePage(idx);
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const itemWidth = el.scrollWidth / pages.length;
    const idx = Math.round(scrollLeft / itemWidth);
    setActivePage(Math.min(idx, pages.length - 1));
  };

  return (
    <div className="relative w-full flex flex-col gap-3">
      {/* Page HUD */}
      <div className="absolute top-3 right-3 z-10 pointer-events-none">
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-xl">
          {String(activePage + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}
        </span>
      </div>

      {/* Filmstrip scroll area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto no-scrollbar"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          cursor: "grab",
        }}
      >
        {pages.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
            className="shrink-0 rounded-2xl overflow-hidden border border-white/8 bg-[#0d0d0b]"
            style={{
              scrollSnapAlign: "start",
              width: "min(72vw, 480px)",
              maxHeight: "70vh",
            }}
          >
            <img
              src={src}
              alt={`${item.title || "Script"} — page ${i + 1}`}
              className="w-full h-full object-contain block select-none"
              loading={i <= 1 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "low"}
              decoding="async"
              draggable={false}
            />
          </motion.div>
        ))}
      </div>

      {/* Scrubber bar */}
      <div className="flex items-center gap-0.5 w-full h-0.5 bg-white/8 rounded-xl relative">
        {/* Active progress indicator */}
        <motion.div
          className="absolute left-0 h-full bg-white/50 rounded-xl"
          animate={{ width: `${((activePage + 1) / pages.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
        {/* Invisible click targets per page */}
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToPage(i)}
            aria-label={`Go to page ${i + 1}`}
            className="flex-1 h-5 -my-2"
            style={{ touchAction: "manipulation" }}
          />
        ))}
      </div>

      {/* Caption */}
      {captions?.[activePage] && (
        <motion.p
          key={activePage}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="text-[10px] text-white/30 font-medium italic text-center px-4 leading-relaxed"
        >
          &ldquo;{captions[activePage]}&rdquo;
        </motion.p>
      )}
    </div>
  );
}
