import { useId } from "react";
import { motion } from "motion/react";
import { Users, Sun, Heart, Instagram, Twitter, Youtube } from "lucide-react";

interface ProfileHeroProps {
  name: string;
  handle: string;
  tagline: string;
  image: string;
  followers?: number | string;
  presence?: number | string;
  theme?: {
    nameGradient: [string, string];
  };
  imagePosition?: string;
  isFollowing?: boolean;
  onFollow?: () => void;
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
  followers = 0,
  presence = 0,
  theme = {
    nameGradient: ["#fac107", "#fac107"],
  },
  imagePosition = "50% 0%",
  isFollowing = false,
  onFollow,
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

        {/* Bottom Half: Centered Metrics & Actions */}
        {(!hideMetrics || !hideActions) && (
          <div className="w-full flex flex-col items-center gap-10">
            {!hideMetrics && (
              <div className="flex justify-center gap-12 md:gap-24">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Users
                    className="w-4 h-4 md:w-6 md:h-6 opacity-50 text-white"
                  />
                  <span
                    className="text-sm md:text-xl font-black tracking-tight text-white"
                  >
                    {followers}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Sun
                    className="w-4 h-4 md:w-6 md:h-6 opacity-50 text-white"
                  />
                  <span
                    className="text-sm md:text-xl font-black tracking-tight text-white"
                  >
                    {presence}
                  </span>
                </div>
              </div>
            )}

            {!hideActions && (
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onFollow}
                  className={`
                    px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500
                    ${isFollowing 
                      ? "bg-white/10 text-white/60 border border-white/10" 
                      : "bg-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.15)]"
                    }
                  `}
                >
                  {isFollowing ? "Following" : "Follow"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onFavorite}
                  className={`
                    p-3.5 rounded-full border transition-all duration-500
                    ${isFavorited 
                      ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]" 
                      : "bg-white/[0.03] border-white/10 text-white/30 hover:text-white hover:bg-white/10 backdrop-blur-md"
                    }
                  `}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
                </motion.button>
              </div>
            )}
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
