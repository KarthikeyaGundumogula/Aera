import { useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Heart, Instagram, Twitter, Youtube } from "lucide-react";
import { SpiritIcon } from "../../../components/icons/AppIcons";

interface ProfileHeroProps {
  name: string;
  handle: string;
  tagline: string;
  image: string;
  spirit?: number | string;
  favoritesCount?: number | string;
  theme?: {
    nameGradient: [string, string];
  };
  imagePosition?: string;
  isFavorited?: boolean;
  onFavorite?: () => void;
  className?: string;
  scale?: number;
  showGradient?: boolean;
  socials?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  hideMetrics?: boolean;
  hideActions?: boolean;
  onImagePositionChange?: (pos: string) => void;
  leftFlankContent?: React.ReactNode;
}

export function ProfileHero({
  name,
  handle,
  tagline,
  image,
  spirit = 0,
  favoritesCount = 0,
  theme = {
    nameGradient: ["#fac107", "#fac107"],
  },
  imagePosition = "50% 0%",
  isFavorited = false,
  onFavorite,
  className = "",
  scale = 1,
  showGradient = true,
  socials,
  portraitOverlay,
  hideMetrics = false,
  hideActions = false,
  onImagePositionChange,
  leftFlankContent,
}: ProfileHeroProps & { portraitOverlay?: React.ReactNode }) {
  const gradientId = `profileHeroGradient-${useId()}`;

  return (
    <div 
      className={`relative z-30 w-full flex flex-col items-center overflow-hidden transition-all duration-700 ${className}`}
      style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
    >
      {/* Profile-Hero Level Amber Flare Effect */}
      <AnimatePresence>
        {isFavorited && (
          <motion.div
            key="hero-amber-flare"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.1, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut", opacity: { times: [0, 0.2, 1] } }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#B45309]/30 blur-[150px] rounded-full pointer-events-none z-0"
          />
        )}
      </AnimatePresence>
      {/* 5-Row Fractional Grid (Strictly for Name and Portrait) */}
      <div className="relative w-full h-[35vh] md:h-[50vh] grid grid-cols-1 grid-rows-5 justify-items-center items-stretch mt-4 md:mt-0">
        {/* Rows 1, 2, 3: Background Username */}
        <div className="col-start-1 row-start-1 row-end-4 w-full h-full max-w-[95%] z-0 pointer-events-none">
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 180"
            preserveAspectRatio="none"
            style={{ opacity: 1 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={theme.nameGradient[0]} />
                <stop offset="100%" stopColor={theme.nameGradient[1]} />
              </linearGradient>
            </defs>
            <text
              x="500"
              y="150"
              fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              fontSize="168"
              fontWeight="900"
              fill={`url(#${gradientId})`}
              textAnchor="middle"
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              className="uppercase select-none"
            >
              {name || "ARTIST"}
            </text>
          </svg>
        </div>

        {/* Rows 3, 4, 5: Profile Picture */}
        <div className="col-start-1 row-start-3 row-end-6 relative z-10 w-[45%] md:w-[33.75%] max-w-xl h-full flex items-center justify-center">
          {/* Left Flank slot (e.g. for Pan Y Slider) */}
          {leftFlankContent && (
            <div className="absolute -left-12 md:-left-16 top-1/2 -translate-y-1/2 z-20">
              {leftFlankContent}
            </div>
          )}



          <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-white/5">
            {image ? (
              <img loading="lazy"
                src={image}
                alt={name}
                className="w-full h-full object-cover"
                style={{ objectPosition: imagePosition }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-10">
                <Users size={48} />
              </div>
            )}
            
            {/* Absolute Centered Portrait Overlay */}
            {portraitOverlay && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                {portraitOverlay}
              </div>
            )}
          </div>


          {/* Avant-Garde Floating Vertical Social Instrument (Attached to the right flank of the portrait frame) */}
          {socials && (Object.keys(socials).length > 0) && (
            <div className="absolute -right-12 md:-right-16 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 py-4 z-20 group">
              {socials.instagram && (
                <a
                  href={`https://instagram.com/${socials.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white hover:scale-125 transition-all p-2"
                  title="Instagram"
                >
                  <Instagram size={18} />
                </a>
              )}
              {socials.twitter && (
                <a
                  href={`https://twitter.com/${socials.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white hover:scale-125 transition-all p-2"
                  title="X / Twitter"
                >
                  <Twitter size={18} />
                </a>
              )}
              {socials.youtube && (
                <a
                  href={`https://youtube.com/@${socials.youtube.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white hover:scale-125 transition-all p-2"
                  title="YouTube"
                >
                  <Youtube size={20} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dedicated Tagline & Metrics Block */}
      <div className="relative z-20 w-full flex flex-col items-center px-8 mt-6 space-y-6">
        <div className="w-full text-center flex flex-col items-center gap-6">
          {/* Minimalist Handle Display */}
          <div className="flex items-center gap-4">
            <div className="w-8 h-[1px] bg-white/20" />
            <span className="text-[10px] font-mono tracking-[0.6em] uppercase text-white/60 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              {handle || "USERNAME"}
            </span>
            <div className="w-8 h-[1px] bg-white/20" />
          </div>

          <p
            className="text-base md:text-xl font-serif tracking-tight text-white/90 leading-none bg-transparent"
          >
            {tagline || "The Art of Cinema"}
          </p>
        </div>

        {/* Bottom Half: Centered Metrics & Actions Row */}
        {(!hideActions) && (
          <div className="w-full flex justify-center mt-2 z-20">
            <div className="flex items-center gap-8">
              
              {/* Spirit Metric */}
              {!hideMetrics && spirit && (
                <>
                  <div className="flex items-center gap-3">
                    <SpiritIcon className="w-8 h-8 text-white/80" />
                    <span className="font-mono text-2xl font-bold tracking-tighter text-white">
                      {spirit}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-white/20" />
                </>
              )}

              {/* Favorites Action & Count */}
              <div className="flex items-center gap-4">
                <span className="font-mono text-2xl font-bold tracking-tighter text-white">
                  {favoritesCount}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onFavorite}
                  className="relative p-2 transition-all duration-300 flex items-center justify-center overflow-visible"
                >
                  {/* Subtle expansion ripple on favorite */}
                  <AnimatePresence>
                    {isFavorited && (
                      <motion.div
                        key="favorite-ripple"
                        initial={{ scale: 0.5, opacity: 0.8 }}
                        animate={{ scale: 3, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="absolute inset-0 bg-[#B45309]/40 rounded-full pointer-events-none blur-sm"
                      />
                    )}
                  </AnimatePresence>

                  <motion.div
                    initial={false}
                    animate={{
                      scale: isFavorited ? [1, 1.5, 1.1] : [1, 0.8, 1],
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Heart 
                      className={`relative z-10 w-8 h-8 transition-colors duration-500 ${
                        isFavorited 
                          ? "fill-[#B45309] text-[#B45309] drop-shadow-[0_0_20px_rgba(180,83,9,0.8)]" 
                          : "text-white/60 hover:text-white"
                      }`} 
                    />
                  </motion.div>
                </motion.button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Global Bottom Gradient (Blends the entire Hero into the Feed Section smoothly) */}
      {showGradient && (
        <div
          className="absolute bottom-0 left-0 w-full h-[30vh] md:h-[40vh] pointer-events-none z-10"
          style={{
            background: `linear-gradient(to bottom, transparent, #050505)`,
          }}
        />
      )}
    </div>
  );
}
