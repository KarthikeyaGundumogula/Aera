import {
  motion,
  AnimatePresence,
  useSpring,
  useMotionValue,
} from "motion/react";
import React, { memo, useState, useEffect, useRef } from "react";
import { Instagram, Twitter, Youtube, Library, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StageIcon, SpiritIcon, WorksIcon } from "../../../components/icons/AppIcons";
import { FavoriteButton } from "../../../components/FavoriteButton";
import { AdaptiveTitle } from "../../../components/AdaptiveTitle";
import { OriginalArtist } from "../../../types";
import { CreditTag } from "../tags";
import { ModalWrapper } from "../modals/ModalWrapper";
import { ArtistAvatar } from "../../../components/ArtistAvatar";
import { apiFetch } from "@/lib/api";

interface ArtistModalData {
  profilePicture?: string;
  stageName?: string;
  userName?: string;
  tagLine?: string;
  youtubeProfile?: string | null;
  twitterProfile?: string | null;
  instagramProfile?: string | null;
  spirit?: number;
  works?: number;
  originals?: string[];
}

interface ArtistProfileProps {
  artist: OriginalArtist | null;
  onClose?: () => void;
  index?: number;
  variant?: "default" | "featured" | "inline";
  zIndex?: string;
}

export const ArtistProfile = memo(
  ({ artist, index = 0, variant = "default", onClose, zIndex = "z-[160]" }: ArtistProfileProps) => {
    if (!artist) return null;

    const [localIsOpen, setLocalIsOpen] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [modalData, setModalData] = useState<ArtistModalData | null>(null);
    const [isLoadingModal, setIsLoadingModal] = useState(false);
    
    // Support both internal (click card) and external (WorkModal) triggers
    const isOpen = onClose ? !!artist : localIsOpen;
    const setIsOpen = (val: boolean) => {
      if (onClose && !val) {
        onClose();
      } else {
        setLocalIsOpen(val);
      }
    };

    const isFeatured = variant === "featured";
    const portraitRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Parallax Values for the portrait only
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { damping: 20, stiffness: 100 });
    const springY = useSpring(mouseY, { damping: 20, stiffness: 100 });

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!portraitRef.current || isFlipped) return;
      const rect = portraitRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set((e.clientX - centerX) / 15);
      mouseY.set((e.clientY - centerY) / 15);
    };

    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    // Reset flip state when modal closes
    useEffect(() => {
      if (!isOpen) {
        setIsFlipped(false);
        handleMouseLeave();
      }
    }, [isOpen]);

    // Fetch ArtistModal data when open
    useEffect(() => {
      if (!isOpen || !artist) return;

      const targetIdentifier = artist.userName || artist.id;
      if (!targetIdentifier) return;

      let isMounted = true;
      setIsLoadingModal(true);

      apiFetch(`/profiles/modal/${encodeURIComponent(targetIdentifier)}`, { method: "GET" })
        .then(async (res) => {
          if (!isMounted) return;
          if (res.ok) {
            const json = await res.json();
            const data: ArtistModalData = json?.artist_modal || json?.artistModal || null;
            if (data && isMounted) {
              setModalData(data);
            }
          }
        })
        .catch((err) => {
          console.warn("[ArtistProfile] Failed to fetch artist modal data:", err);
        })
        .finally(() => {
          if (isMounted) setIsLoadingModal(false);
        });

      return () => {
        isMounted = false;
      };
    }, [isOpen, artist?.id, artist?.userName]);

    if (!artist) return null;

    const currentName = modalData?.stageName || artist.name || "Artist";
    const currentUsername = modalData?.userName || artist.userName || "";
    const displayHandle = currentUsername
      ? (currentUsername.startsWith("@") ? currentUsername : `@${currentUsername}`)
      : (currentName ? `@${currentName.toLowerCase().replace(/\s+/g, "")}` : "@artist");
    const currentImage = modalData?.profilePicture || artist.image || "";
    const currentBio = modalData?.tagLine || artist.bio || "FrameHouse creator contributing to the cinematic evolution.";
    const currentSpirit = modalData?.spirit ?? artist.spirit ?? 0;
    const currentWorks = modalData?.works ?? artist.works ?? 0;
    const currentSocials = {
      instagram: modalData?.instagramProfile || artist.socials?.instagram,
      twitter: modalData?.twitterProfile || artist.socials?.twitter,
      youtube: modalData?.youtubeProfile || artist.socials?.youtube,
    };
    const currentOriginals: Array<{ id: string; title: string }> = modalData?.originals
      ? modalData.originals.map((title, idx) => ({ id: `${idx}`, title }))
      : (artist.workedOn || []);

    const handleProjectClick = () => {
      setIsOpen(false);
    };

    const cardContent = (
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{
                duration: 0.8,
                type: "spring",
                damping: 20,
                stiffness: 100,
              }}
              style={{ transformStyle: "preserve-3d" }}
              onClick={(e) => {
                e.stopPropagation();
                if (variant === "inline") return;
                // Prevent flipping if an interactive element (like CreditTag or Social Link) was clicked
                const target = e.target as HTMLElement;
                if (target.closest("button") || target.closest("a")) return;
                setIsFlipped(!isFlipped);
              }}
              className={`relative w-full h-full ${variant === "inline" ? "" : "cursor-pointer"}`}
            >
              {/* FRONT SIDE (RESTORED CLASSIC ID CARD) */}
              <div
                className={`w-full backface-hidden ${isFlipped ? "pointer-events-none" : ""}`}
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="relative w-full rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col backdrop-blur-xl">
                  {/* Card Header */}
                  <div className="p-6 pb-2 flex justify-between items-start z-10">
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">
                        Artist Stage
                      </span>
                      <span className="text-[9px] font-mono text-white/35 mt-0.5 tracking-wider">
                        {displayHandle}
                      </span>
                    </div>

                    {/* Visit Profile Button (Top Right) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                        navigate(`/profile/${currentUsername || artist.id}`);
                      }}
                      className="bg-[#f0f0f0] text-[#111] px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-white hover:scale-105 transition-all shadow-xl backdrop-blur-md"
                    >
                      Visit
                    </button>
                  </div>

                  {/* Portrait Section (Identity Frame) */}
                  <div className="px-6 py-4 z-10 flex items-center justify-center gap-2 sm:gap-6 overflow-hidden">
                    {/* Left side Vertical Username */}
                    <div className="flex flex-col items-center gap-4 opacity-25 select-none shrink-0">
                      <div className="w-[1px] h-10 sm:h-12 bg-white" />
                      <span className="[writing-mode:vertical-rl] rotate-180 text-[7px] sm:text-[8px] font-mono tracking-[0.4em] uppercase text-white whitespace-nowrap">
                        {displayHandle}
                      </span>
                      <div className="w-[1px] h-10 sm:h-12 bg-white" />
                    </div>

                    {/* Portrait */}
                    <div className="perspective-1000 w-48 sm:w-64 shrink-0">
                      <motion.div
                        ref={portraitRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        style={{ rotateX: springY, rotateY: springX }}
                        className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/10 group bg-black/20 shadow-2xl"
                      >
                        <ArtistAvatar
                          src={currentImage}
                          name={currentName}
                          size={240}
                          className="w-full h-full rounded-2xl"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </motion.div>
                    </div>

                    {/* Right side Vertical Username */}
                    <div className="flex flex-col items-center gap-4 opacity-25 select-none shrink-0">
                      <div className="w-[1px] h-10 sm:h-12 bg-white" />
                      <span className="[writing-mode:vertical-rl] rotate-180 text-[7px] sm:text-[8px] font-mono tracking-[0.4em] uppercase text-white whitespace-nowrap">
                        {displayHandle}
                      </span>
                      <div className="w-[1px] h-10 sm:h-12 bg-white" />
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="px-8 py-2 text-center z-10">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-2 leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                      {currentName}
                    </h2>
                    <div className="h-px w-12 bg-white/10 mx-auto my-4" />
                    <p className="text-[11px] font-medium text-white/50 leading-relaxed max-w-[90%] mx-auto line-clamp-3 italic">
                      "
                      {currentBio}
                      "
                    </p>
                  </div>

                  {/* Stats Section */}
                  <div className="mt-6 mx-6 p-4 rounded-xl bg-white/5 border border-white/5 flex justify-around items-center z-10">
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30 mb-1">
                        Spirit
                      </span>
                      <div className="flex items-center gap-2">
                        <SpiritIcon className="w-3 h-3 text-white/80" />
                        <span className="text-sm font-black text-white">
                          {currentSpirit}
                        </span>
                      </div>
                    </div>

                    <div className="w-px h-6 bg-white/10" />

                    <div className="flex flex-col items-center justify-center">
                      <FavoriteButton
                        isFavorited={isFavorited}
                        onFavorite={() => setIsFavorited(!isFavorited)}
                        activeColor="#B45309"
                        iconSize={20}
                        className="p-1"
                      />
                    </div>

                    <div className="w-px h-6 bg-white/10" />

                    <div className="flex flex-col items-center">
                      <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/30 mb-1">
                        Works
                      </span>
                      <div className="flex items-center gap-2">
                        <WorksIcon className="w-3 h-3 text-white/80" />
                        <span className="text-sm font-black text-white">
                          {currentWorks}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Social Footer */}
                  <div className="p-8 flex justify-center items-center gap-8 z-10">
                    {currentSocials.instagram && (
                      <a
                        href={`https://instagram.com/${currentSocials.instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl"
                      >
                        <Instagram size={18} />
                      </a>
                    )}
                    {currentSocials.twitter && (
                      <a
                        href={`https://twitter.com/${currentSocials.twitter.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl"
                      >
                        <Twitter size={18} />
                      </a>
                    )}
                    {currentSocials.youtube && (
                      <a
                        href={`https://youtube.com/@${currentSocials.youtube.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl"
                      >
                        <Youtube size={20} />
                      </a>
                    )}
                  </div>
                  <div className="h-1 bg-gradient-to-r from-white/20 via-white/10 to-white/20 w-full" />
                </div>
              </div>

              {/* BACK SIDE (THE NEON VAULT) */}
              <div
                className={`absolute inset-0 w-full h-full rotate-y-180 backface-hidden ${!isFlipped ? "pointer-events-none" : ""}`}
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-white/[0.03] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col backdrop-blur-xl">
                  <div className="p-6 pb-2 flex justify-between items-start z-10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase">
                        Credit Gallery
                      </span>
                      <span className="text-[9px] font-mono text-white/35 mt-0.5 tracking-wider">
                        {displayHandle}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 px-8 py-10 flex flex-col justify-start items-center gap-6 z-10 overflow-y-auto no-scrollbar">
                    <div className="space-y-4 w-full">
                      <div className="flex items-center justify-center gap-2 mb-6">
                        <Library className="w-3 h-3 text-white/20" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 text-center">
                          Collected Originals
                        </h3>
                      </div>

                      <div 
                        className="flex flex-row flex-wrap justify-center gap-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {currentOriginals.map((project, pIdx) => (
                          <CreditTag
                            key={`${project.id}-${pIdx}`}
                            id={project.id}
                            title={project.title}
                            index={pIdx}
                            onClick={handleProjectClick}
                          />
                        ))}

                        {currentOriginals.length === 0 && (
                          <p className="text-[9px] uppercase tracking-[0.3em] text-white/20 italic text-center">
                            No public records found
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-8 flex items-center justify-center border-t border-white/5 bg-white/[0.02]">
                    <p className="text-[10px] font-medium text-white/40 italic text-center leading-relaxed">
                      "Cinema is a matter of what's in the frame and what's
                      out."
                    </p>
                  </div>

                  <div className="h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />
                </div>
              </div>
            </motion.div>
    );

    return (
      <>
        {/* CARD TRIGGER - Film Strip Style (Only show if not an external modal) */}
        {variant !== "inline" && !onClose && (
          <motion.div
            onClick={() => setIsOpen(true)}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (index % 5) * 0.05 }}
            className={`group relative overflow-hidden cursor-pointer ${isFeatured ? "aspect-[3.5/1]" : "aspect-[3.2/1]"}`}
          >
            <div className="flex h-full items-center gap-2 px-1 py-1">
              <div
                className={`shrink-0 overflow-hidden rounded-xl ${isFeatured ? "h-10 w-10 md:h-14 md:w-14" : "h-12 w-12 md:h-11 md:w-11"}`}
              >
                <ArtistAvatar
                  src={artist.image}
                  name={artist.name}
                  size={56}
                  className="h-full w-full rounded-xl"
                />
              </div>

              <div
                className={`min-w-0 ${isFeatured ? "space-y-0.5 md:space-y-1" : "space-y-1"}`}
              >
                <AdaptiveTitle
                  title={artist.name}
                  as="h4"
                  multiWordClass={isFeatured ? "text-xs md:text-base" : "text-sm md:text-[15px]"}
                  singleWordClamp={isFeatured ? "clamp(0.75rem, 4vw, 1.1rem)" : "clamp(0.8rem, 3.5vw, 1rem)"}
                  className="tracking-tight"
                />

                <div
                  className={`flex items-center ${isFeatured ? "gap-3 md:gap-5" : "gap-3 md:gap-4"}`}
                >
                  <div>
                    <p
                      className={`mb-0.5 flex items-center gap-1 font-bold uppercase tracking-[0.2em] text-white/30 ${isFeatured ? "text-[7px] md:text-[9px]" : "text-[8px]"}`}
                    >
                      <SpiritIcon
                        className={` ${isFeatured ? "h-2 w-2 md:h-3 md:w-3" : "h-3 w-3"}`}
                      />
                      Spirit
                    </p>
                    <p
                      className={`font-bold text-white ${isFeatured ? "text-[10px] md:text-sm" : "text-xs md:text-sm"}`}
                    >
                      {artist.spirit}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`mb-0.5 flex items-center gap-1 font-bold uppercase tracking-[0.2em] text-white/30 ${isFeatured ? "text-[7px] md:text-[9px]" : "text-[8px]"}`}
                    >
                      <WorksIcon
                        className={` ${isFeatured ? "h-2 w-2 md:h-3 md:w-3" : "h-3 w-3"}`}
                      />
                      Works
                    </p>
                    <p
                      className={`font-bold text-white ${isFeatured ? "text-[10px] md:text-sm" : "text-xs md:text-sm"}`}
                    >
                      {artist.works}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {variant === "inline" ? (
          <div className="perspective-2000 w-full max-w-[340px] sm:max-w-[380px] h-fit mx-auto my-auto pointer-events-auto">
            {cardContent}
          </div>
        ) : (
          <ModalWrapper 
            isOpen={isOpen} 
            onClose={() => setIsOpen(false)}
            className="bg-black/80 backdrop-blur-xl"
            zIndex={zIndex}
          >
            <div className="perspective-2000 w-full max-w-[340px] sm:max-w-[380px] h-fit">
              {cardContent}
            </div>
          </ModalWrapper>
        )}
      </>
    );
  },
);
