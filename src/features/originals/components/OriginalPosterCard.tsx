import { memo, useMemo } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Original, OriginalMaker, OriginalStar } from "../../../types";

interface OriginalPosterCardProps {
  original: Original;
  makers: OriginalMaker[];
  stars: OriginalStar[];
  index: number;
}

export const OriginalPosterCard = memo(
  ({ original, makers, stars, index }: OriginalPosterCardProps) => {
    const navigate = useNavigate();

    const director = useMemo(() => {
      return makers.find(
        (m) =>
          m.characterName === "Director" &&
          m.workedOn?.some((w) => w.id === original.id),
      );
    }, [makers, original.id]);

    const castAndCrewText = useMemo(() => {
      const movieStars = stars.filter((s) =>
        s.workedOn?.some((w) => w.id === original.id),
      );
      const movieMakers = makers.filter(
        (m) =>
          m.characterName !== "Director" &&
          m.workedOn?.some((w) => w.id === original.id),
      );

      const names = [
        ...movieStars.map((s) => s.actorName),
        ...movieMakers.map((m) => m.actorName),
      ];

      if (names.length === 0) return "ENSEMBLE CAST";
      // Show up to 5 names to ensure it wraps to a second line
      return names.slice(0, 5).join(" • ").toUpperCase();
    }, [stars, makers, original.id]);

    const year = useMemo(() => {
      if (!original.releaseDate) return null;
      const parts = original.releaseDate.split("-");
      return parts.length === 3 ? parts[2].slice(-2) : null;
    }, [original.releaseDate]);

    return (
      <div style={{ containerType: "inline-size" }} className="w-full h-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * 0.04,
            ease: [0.23, 1, 0.32, 1],
          }}
          onClick={() => navigate(`/originals/${original.id}`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              navigate(`/originals/${original.id}`);
          }}
          className="flex flex-col h-full cursor-pointer transition-all duration-300 ease-out group rounded-md overflow-hidden"
          style={{
            backgroundColor: "#090909", // Deep dark background for the card
            border: "0.5px solid rgba(255, 255, 255, 0.24)", // Whiter tinted outer border
            padding: "4cqi", // Matte/padding around everything
          }}
          whileHover={{
            borderColor: "rgba(255, 255, 255, 0.5)", // Brighter white highlight on hover
            boxShadow: "0 0 30px -5px rgba(255, 255, 255, 0.15)", // White glow shadow
            scale: 0.98,
          }}
          whileTap={{ scale: 0.96 }}
        >
          {/* ── TOP SECTION (Fixed height) ─────────────────────────────── */}
          <div
            className="flex items-end justify-between gap-2 mb-[2cqi]"
            style={{ height: "20cqi" }}
          >
            <h2
              className="font-black uppercase leading-[1.1] text-white tracking-tight flex-1"
              style={{
                fontSize: "clamp(0.8rem, 8cqi, 1.8rem)",
                textWrap: "balance",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {original.title}
            </h2>
            {director && (
              <div className="flex flex-col items-end shrink-0 pt-[0.5cqi]">
                <span
                  className="text-white/40 uppercase tracking-[0.15em] font-bold leading-none mb-[1.5cqi]"
                  style={{ fontSize: "clamp(0.35rem, 3cqi, 0.6rem)" }}
                >
                  DIR.
                </span>
                <span
                  className="text-white/80 font-semibold leading-none text-right"
                  style={{
                    fontSize: "clamp(0.45rem, 4cqi, 0.75rem)",
                    maxWidth: "12ch",
                  }}
                >
                  {director.actorName}
                </span>
              </div>
            )}
          </div>

          {/* ── POSTER IMAGE (FRAMED) ─────────────────────────────────── */}
          <div
            className="relative w-full shrink-0 overflow-hidden bg-black transition-transform duration-300 ease-out group-hover:-translate-y-1"
            style={{
              aspectRatio: "2 / 3",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            <img
              src={original.coverImage}
              alt={`${original.title} poster`}
              loading="lazy"
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 group-hover:brightness-110"
            />
          </div>

          {/* ── BOTTOM SECTION ─────────────────────────────────────────── */}
          <div className="flex items-end justify-between gap-2 mt-[4cqi] flex-1">
            <div className="flex flex-col gap-[1cqi] min-w-0 pb-[0.5cqi] justify-end">
              <span
                className="text-white/80 font-semibold uppercase tracking-[0.05em] leading-tight"
                style={{
                  fontSize: "clamp(0.4rem, 4cqi, 0.7rem)",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  height: "2.5em"
                }}
              >
                {castAndCrewText}
              </span>
            </div>

            {year && (
              <div
                className="font-black text-white leading-none shrink-0 tabular-nums"
                style={{
                  fontSize: "clamp(1rem, 10cqi, 2rem)",
                  letterSpacing: "-0.04em",
                }}
              >
                /{year}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  },
);

OriginalPosterCard.displayName = "OriginalPosterCard";
