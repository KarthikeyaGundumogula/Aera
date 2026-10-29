import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from "../../../components/SectionHeader";
import { Sparkles, Sun, Users, QrCode, Film } from "lucide-react";
import { PosterImage } from "../../../components/PosterImage";
import { formatReleaseDate } from "@/utils/time";
import { apiFetch } from "@/lib/api";
import { useState, useEffect } from "react";
import type { Original } from "@/types/originals";

interface CastCrewProfile {
  actorName: string;
  imageUrl: string;
  role: "maker" | "star";
}

const FALLBACK_MAKERS = [
  { originalId: "rrr-original", titleMatch: "rrr", actorName: "S. S. Rajamouli", imageUrl: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=800&auto=format&fit=crop" },
  { originalId: "vikram-original", titleMatch: "vikram", actorName: "Lokesh Kanagaraj", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop" },
  { originalId: "kgf-original", titleMatch: "kgf", actorName: "Prashanth Neel", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop" },
  { originalId: "baahubali-original", titleMatch: "baahubali", actorName: "S. S. Rajamouli", imageUrl: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=800&auto=format&fit=crop" },
  { originalId: "og-original", titleMatch: "og", actorName: "Sujeeth", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop" },
];

const FALLBACK_STARS = [
  { originalId: "og-original", titleMatch: "og", actorName: "Pawan Kalyan", imageUrl: "/stars/pawan-kalyan.jpeg" },
  { originalId: "rrr-original", titleMatch: "rrr", actorName: "Ram Charan", imageUrl: "/stars/ram-charan.jpg" },
  { originalId: "rrr-original", titleMatch: "rrr", actorName: "Jr. NTR", imageUrl: "/stars/jr_ntr.jpg" },
  { originalId: "rrr-original", titleMatch: "rrr", actorName: "Alia Bhatt", imageUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=800&auto=format&fit=crop" },
  { originalId: "kgf-original", titleMatch: "kgf", actorName: "Yash", imageUrl: "/stars/yash.jpg" },
  { originalId: "baahubali-original", titleMatch: "baahubali", actorName: "Prabhas", imageUrl: "/stars/prabhas.jpeg" },
  { originalId: "vikram-original", titleMatch: "vikram", actorName: "Kamal Haasan", imageUrl: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?q=80&w=800&auto=format&fit=crop" },
  { originalId: "vikram-original", titleMatch: "vikram", actorName: "Vijay Sethupathi", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop" },
  { originalId: "vikram-original", titleMatch: "vikram", actorName: "Fahadh Faasil", imageUrl: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=800&auto=format&fit=crop" },
];

function getCastCrewProfiles(orig: any): CastCrewProfile[] {
  const normTitle = (orig.title || "").toLowerCase();

  // 1. Resolve 1 Maker
  let maker: CastCrewProfile | null = null;

  if (Array.isArray(orig.makers) && orig.makers.length > 0) {
    const m = orig.makers[0];
    const name = m.actorName || m.name || m.userName;
    if (name) {
      maker = {
        actorName: name,
        imageUrl:
          m.imageUrl ||
          m.profilePicture ||
          m.avatar ||
          m.image ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=18181b&color=ffffff&bold=true`,
        role: "maker",
      };
    }
  }

  if (!maker) {
    const fallbackM = FALLBACK_MAKERS.find(
      (m) =>
        m.originalId === orig.id ||
        (m.titleMatch && normTitle.includes(m.titleMatch)) ||
        (orig.director && m.actorName.toLowerCase() === String(orig.director).toLowerCase())
    );
    if (fallbackM) {
      maker = {
        actorName: fallbackM.actorName,
        imageUrl: fallbackM.imageUrl,
        role: "maker",
      };
    }
  }

  if (!maker && orig.director && typeof orig.director === "string" && orig.director.trim()) {
    const directorName = orig.director.trim();
    maker = {
      actorName: directorName,
      imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(directorName)}&background=18181b&color=ffffff&bold=true`,
      role: "maker",
    };
  }

  // 2. Resolve up to 2 Stars
  const stars: CastCrewProfile[] = [];

  if (Array.isArray(orig.stars) && orig.stars.length > 0) {
    for (const s of orig.stars) {
      if (stars.length >= 2) break;
      const name = s.actorName || s.name || s.characterName;
      if (name && (!maker || maker.actorName.toLowerCase() !== name.toLowerCase())) {
        stars.push({
          actorName: name,
          imageUrl:
            s.imageUrl ||
            s.profilePicture ||
            s.avatar ||
            s.image ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=18181b&color=ffffff&bold=true`,
          role: "star",
        });
      }
    }
  }

  if (stars.length < 2) {
    const fallbackStars = FALLBACK_STARS.filter(
      (s) => s.originalId === orig.id || (s.titleMatch && normTitle.includes(s.titleMatch))
    );
    for (const fs of fallbackStars) {
      if (stars.length >= 2) break;
      if (
        !stars.some((existing) => existing.actorName.toLowerCase() === fs.actorName.toLowerCase()) &&
        (!maker || maker.actorName.toLowerCase() !== fs.actorName.toLowerCase())
      ) {
        stars.push({
          actorName: fs.actorName,
          imageUrl: fs.imageUrl,
          role: "star",
        });
      }
    }
  }

  if (stars.length < 2 && orig.castPreview && typeof orig.castPreview === "string") {
    const parsedNames = orig.castPreview
      .split(/[•·,]/)
      .map((n: string) => n.trim())
      .filter((n: string) => n.length > 0 && n !== "...");
    for (const name of parsedNames) {
      if (stars.length >= 2) break;
      if (
        !stars.some((existing) => existing.actorName.toLowerCase() === name.toLowerCase()) &&
        (!maker || maker.actorName.toLowerCase() !== name.toLowerCase())
      ) {
        const matchKnown = FALLBACK_STARS.find(
          (s) => s.actorName.toLowerCase() === name.toLowerCase()
        );
        stars.push({
          actorName: name,
          imageUrl:
            matchKnown?.imageUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=18181b&color=ffffff&bold=true`,
          role: "star",
        });
      }
    }
  }

  // Maximum of 3 profiles: 1 maker + up to 2 stars
  const profiles: CastCrewProfile[] = [];
  if (maker) {
    profiles.push(maker);
  }
  profiles.push(...stars.slice(0, 2));

  return profiles.slice(0, 3);
}

export function TopOriginalsSection() {
  const navigate = useNavigate();
  const [originals, setOriginals] = useState<Original[]>([]);

  useEffect(() => {
    let isMounted = true;
    apiFetch("/originals?limit=5")
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          const rawList = (json.data ?? []).slice(0, 5);
          const mapped: Original[] = rawList.map((og: any) => ({
            id: og.id,
            title: og.title,
            description: og.description || "",
            coverImage: og.coverImage || "",
            releaseDate: og.releaseDate || "",
            genre: og.genre || undefined,
            director: og.director || undefined,
            castPreview: og.castPreview || undefined,
            stats: {
              presence: og.presence ?? 0,
              members: og.members ?? 0,
              releases: 0,
            },
            topArtists: og.topArtists || [],
            works: og.works || [],
            stars: og.stars || [],
            makers: og.makers || [],
          }));
          if (isMounted) {
            setOriginals(mapped);
          }

          // If raw items lack stars or makers, enrich them concurrently from /originals/:id
          const needsDetails = rawList.some(
            (og: any) =>
              (!og.makers || og.makers.length === 0) &&
              (!og.stars || og.stars.length === 0)
          );

          if (needsDetails) {
            const enriched = await Promise.all(
              rawList.map(async (og: any) => {
                if (
                  (og.makers && og.makers.length > 0) ||
                  (og.stars && og.stars.length > 0)
                ) {
                  return og;
                }
                try {
                  const detailRes = await apiFetch(`/originals/${og.id}`);
                  if (detailRes.ok) {
                    const detailJson = await detailRes.json();
                    if (detailJson.data) {
                      return {
                        ...og,
                        makers: detailJson.data.makers || og.makers || [],
                        stars: detailJson.data.stars || og.stars || [],
                        director: detailJson.data.director || og.director,
                        castPreview: detailJson.data.castPreview || og.castPreview,
                      };
                    }
                  }
                } catch {
                  // Fallback safely to initial mapped object
                }
                return og;
              })
            );

            if (isMounted) {
              setOriginals(
                enriched.map((og: any) => ({
                  id: og.id,
                  title: og.title,
                  description: og.description || "",
                  coverImage: og.coverImage || "",
                  releaseDate: og.releaseDate || "",
                  genre: og.genre || undefined,
                  director: og.director || undefined,
                  castPreview: og.castPreview || undefined,
                  stats: {
                    presence: og.presence ?? 0,
                    members: og.members ?? 0,
                    releases: 0,
                  },
                  topArtists: og.topArtists || [],
                  works: og.works || [],
                  stars: og.stars || [],
                  makers: og.makers || [],
                }))
              );
            }
          }
        }
      })
      .catch((err) => {
        console.error("[TopOriginalsSection] Failed to fetch originals:", err);
      });

    return () => {
      isMounted = false;
    };
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
            const ticketNo = `TKT-${(orig.id || "").slice(0, 6).toUpperCase()}`;
            const profiles = getCastCrewProfiles(orig);
            const displayDirector = director || profiles.find((p) => p.role === "maker")?.actorName;

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
                    {displayDirector && (
                      <p className="text-[7px] sm:text-[8px] text-white/40 uppercase tracking-[0.2em] mb-1 sm:mb-2 font-bold truncate">
                        from — {displayDirector}
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
                    {orig.releaseDate && formatReleaseDate(orig.releaseDate) && (
                      <div className="flex items-end gap-4 mb-2 sm:mb-3">
                        <div className="text-[6px] sm:text-[7px] text-white/40 uppercase tracking-[0.2em] font-bold leading-[1.1]">
                          RELEASING
                          <br />
                          ON
                        </div>
                        <div className="text-[7px] sm:text-[8px] text-white uppercase tracking-widest font-mono">
                          {formatReleaseDate(orig.releaseDate)}
                        </div>
                      </div>
                    )}

                    {/* Cast & Crew Profiles: 1 Maker + up to 2 Stars (Max 3) */}
                    {profiles.length > 0 && (
                      <div className="flex items-center">
                        {profiles.map((profile, i) => (
                          <div
                            key={`${profile.actorName}-${i}`}
                            className={`w-5 h-5 sm:w-7 sm:h-7 rounded-md border border-[#111] overflow-hidden bg-surface-deep shadow-md ${
                              i > 0 ? "-ml-1.5 sm:-ml-2" : ""
                            }`}
                            style={{ zIndex: 10 - i }}
                            title={`${profile.actorName}${profile.role === "maker" ? " (Maker)" : " (Star)"}`}
                          >
                            <img
                              src={profile.imageUrl}
                              alt={profile.actorName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.onerror = null;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  profile.actorName
                                )}&background=18181b&color=ffffff&bold=true`;
                              }}
                            />
                          </div>
                        ))}
                      </div>
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
