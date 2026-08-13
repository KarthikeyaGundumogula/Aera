import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from "../../../components/SectionHeader";
import { Sparkles, Sun, Users, QrCode, Film } from "lucide-react";
import { PosterImage } from "../../../components/PosterImage";
import { apiFetch } from "@/lib/api";
import { useState, useEffect } from "react";
import type { Original } from "@/types/originals";

export function TopOriginalsSection() {
  const navigate = useNavigate();
  const [originals, setOriginals] = useState<Original[]>([]);

  useEffect(() => {
    apiFetch("/originals")
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          setOriginals(json.items || json.data || []);
        }
      })
      .catch((err) => {
        console.error("[TopOriginalsSection] Failed to fetch originals:", err);
      });
  }, []);

  return (
    <div className="relative">
      <SectionHeader
        icon={Sparkles}
        title="Talk of the week"
        containerClassName="px-6 md:px-12 mb-6 opacity-100"
      />

      {/* Centered Desktop Carousel */}
      <div className="overflow-x-auto no-scrollbar pb-6 w-full">
        <div className="flex gap-4 sm:gap-6 w-max px-6 md:px-12 mx-auto">
          {originals.map((orig: any) => {
            const director = orig.director as string | null | undefined;
            const castPreview = (orig.castPreview || orig.cast_preview) as string | null | undefined;
            const ticketNo = `TKT-${(orig.id || "").slice(0, 6).toUpperCase()}`;

            return (
              <motion.div
                key={orig.id}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/originals/${orig.id}`)}
                className="relative flex w-[85vw] max-w-[700px] h-[220px] sm:h-[280px] rounded-2xl cursor-pointer group bg-[#111] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden"
              >
                {/* (Cutouts removed per request) */}

                {/* LEFT: Details (40%) */}
                <div className="relative w-[40%] flex flex-col p-4 sm:p-6 z-10 border-r border-white/5 bg-black/40 backdrop-blur-sm h-full overflow-hidden">
                  {/* Top Fixed Section */}
                  <div className="shrink-0">
                    {/* Film Strip Header */}
                    <div className="flex items-center gap-2 mb-2 sm:mb-4">
                      <Film className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                      <div className="flex flex-col">
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-white">
                          ORIGINAL
                        </span>
                        <span className="text-[6px] sm:text-[7px] font-medium text-white/50 uppercase tracking-widest hidden sm:block">
                          FRAMEHOUSE EXCLUSIVE
                        </span>
                      </div>
                    </div>

                    {/* Titles */}
                    {director && (
                      <p className="text-[7px] sm:text-[8px] text-white/40 uppercase tracking-[0.2em] mb-1 sm:mb-2 font-bold">
                        from — {director}
                      </p>
                    )}
                    <h4 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-widest text-white mb-2 leading-none drop-shadow-md line-clamp-2 break-words">
                      {orig.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {orig.genre?.slice(0, 2).map((g: any) => (
                        <span
                          key={g}
                          className="px-1.5 py-0.5 bg-white/10 text-white/90 text-[6px] sm:text-[7px] font-bold uppercase tracking-widest rounded-sm border border-white/5"
                        >
                          {g}
                        </span>
                      ))}
                      <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-500 text-[6px] sm:text-[7px] font-black uppercase tracking-[0.2em] rounded-sm border border-amber-500/20">
                        U/A
                      </span>
                    </div>
                  </div>

                  {/* Flexible Middle Section for Description */}
                  <div className="flex-1 min-h-0 mt-2 sm:mt-3 flex flex-col justify-start">
                    <p className="text-[8px] sm:text-[9px] text-white/60 leading-relaxed line-clamp-2 sm:line-clamp-3 lg:line-clamp-4 pr-2">
                      {orig.description}
                    </p>
                  </div>

                  {/* Bottom Fixed Section */}
                  <div className="shrink-0 mt-auto pt-2">
                    {orig.releaseDate && (
                      <div className="flex items-end gap-4 mb-2 sm:mb-3">
                        <div className="text-[6px] sm:text-[7px] text-white/40 uppercase tracking-[0.2em] font-bold leading-[1.1]">
                          RELEASING
                          <br />
                          ON
                        </div>
                        <div className="text-[7px] sm:text-[8px] text-white uppercase tracking-widest font-mono">
                          {orig.releaseDate}
                        </div>
                      </div>
                    )}

                    {castPreview && (
                      <p className="text-[7px] sm:text-[8px] text-white/50 uppercase tracking-[0.15em] font-bold truncate">
                        {castPreview}
                      </p>
                    )}
                  </div>
                </div>

                {/* CENTER: Image (35%) */}
                <div className="relative w-[35%] h-full bg-[#111]">
                  <PosterImage
                    src={orig.coverImage}
                    alt={orig.title}
                    info={orig.genre?.slice(0, 2).join(" • ")}
                    className="w-full h-full object-cover object-center grayscale-[0.2] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                  />
                  {/* Subtle inner shadow to blend edges instead of massive gradients */}
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(17,17,17,0.8)] pointer-events-none" />
                </div>

                {/* RIGHT: Stub & Analytics (25%) */}
                <div className="relative w-[25%] flex flex-col items-center justify-between p-3 sm:p-5 z-10 border-l-[2px] border-dashed border-white/20 bg-black/40 backdrop-blur-sm">
                  {/* Trending Tag */}
                  <div className="flex flex-col w-full items-center mb-2 pb-2 border-b border-white/10">
                    <span className="px-2 py-0.5 bg-amber-500 text-black text-[6px] sm:text-[7px] font-black uppercase tracking-[0.2em] rounded-sm">
                      Trending Now
                    </span>
                  </div>

                  {/* Analytics Center */}
                  <div className="flex flex-col items-center gap-2 sm:gap-4 my-auto w-full">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-amber-500 mb-1">
                        <Sun className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-sm sm:text-lg font-black tracking-tighter leading-none">
                          {orig.stats?.presence ?? "—"}
                        </span>
                      </div>
                      <p className="text-[6px] sm:text-[7px] text-white/50 uppercase tracking-[0.2em] font-bold">
                        Presence
                      </p>
                    </div>

                    <div className="w-8 h-[1px] bg-white/10" />

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-white/90 mb-1">
                        <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="text-[10px] sm:text-xs font-black tracking-tight leading-none">
                          {(orig.stats?.members ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[5px] sm:text-[6px] text-white/40 uppercase tracking-[0.2em] font-bold leading-tight">
                        Members
                        <br />
                        Waiting
                      </p>
                    </div>
                  </div>

                  {/* QR / Enter CTA */}
                  <div className="mt-auto flex flex-col items-center gap-1.5 group-hover:scale-110 transition-transform">
                    <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-white/80" />
                    <span className="text-[6px] sm:text-[7px] font-black text-amber-500 uppercase tracking-widest">
                      Enter
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
