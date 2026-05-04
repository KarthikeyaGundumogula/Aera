import { memo, useState } from "react";
import { StageIcon } from "../../../components/icons/AppIcons";
import { ORIGINALS } from "../../../mock";

export const TopOriginalsAccordion = memo(function TopOriginalsAccordion({
  navigate,
}: {
  navigate: (path: string) => void;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Top originals by presence (repeated to mock 15 items for layout testing)
  const baseOriginals = [...ORIGINALS].sort(
    (a, b) => b.stats.presence - a.stats.presence,
  );
  const topOriginals = Array.from({ length: 15 }, (_, i) => baseOriginals[i % baseOriginals.length]);

  return (
    <div className="flex h-[300px] md:h-[400px] w-full gap-2 px-6 md:px-12 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
      {topOriginals.map((org, index) => {
        const isActive = activeIndex === index;
        return (
          <div
            key={`${org.id}-${index}`}
            className={`relative rounded-xl overflow-hidden snap-center cursor-pointer shrink-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isActive ? "w-[360px] md:w-[520px]" : "w-[200px] md:w-[260px]"}`}
            onClick={(e) => {
              if (isActive) {
                navigate(`/originals/${org.id}`);
              } else {
                setActiveIndex(index);
                // Trigger native browser smooth centering alongside the CSS transition instantly
                // Only center on mobile and tablet screens. Desktop expands perfectly in place.
                if (window.innerWidth < 1024) {
                  e.currentTarget.scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "nearest",
                  });
                }
              }
            }}
          >
            <img loading="lazy"
              src={org.coverImage}
              alt={org.title}
              className="absolute inset-0 w-full h-full object-cover"
              decoding="async"
            />
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 transition-opacity duration-500 ${isActive ? "opacity-80" : "opacity-90"}`}
            />

            <div
              className={`absolute inset-0 p-6 flex flex-col ${isActive ? "justify-end items-start text-left" : "justify-center items-center text-center"}`}
            >
              <h4
                className="font-black uppercase tracking-tighter leading-[0.85] shadow-black drop-shadow-md break-words"
                style={{
                  fontSize: isActive
                    ? `clamp(2rem, ${Math.max(3, 8 - org.title.length * 0.3)}vw, 3.5rem)`
                    : `clamp(1.2rem, ${Math.max(2, 5 - org.title.length * 0.2)}vw, 2rem)`,
                }}
              >
                {org.title}
              </h4>

              {isActive && org.description && (
                <p className="mt-4 text-xs md:text-sm font-medium text-white/60 line-clamp-3 max-w-sm leading-relaxed tracking-wide animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {org.description}
                </p>
              )}

              <div
                className={`flex items-center gap-2 ${isActive ? "mt-6" : "hidden"}`}
              >
                <StageIcon className="w-4 h-4 text-yellow-400" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                  {org.stats.presence} Stage
                </span>
              </div>
            </div>

            {/* Quick Access Floating Presence Bug */}
            {!isActive && (
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-sm flex items-center gap-1 border border-white/10">
                <StageIcon className="w-2.5 h-2.5 text-yellow-500" />
                <span className="text-[8px] font-black text-white/80 tabular-nums tracking-widest">
                  {org.stats.presence}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});
