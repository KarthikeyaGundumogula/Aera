import { motion } from "motion/react";
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { PresenceIcon, ReleasesIcon } from "../../../components/icons/AppIcons";
import { OriginalArtist } from "../../../types";

interface ArtistCardProps {
  artist: OriginalArtist;
  index: number;
  variant?: 'default' | 'featured';
}

export const ArtistCard = memo(({ artist, index, variant = 'default' }: ArtistCardProps) => {
  const isFeatured = variant === 'featured';
  const navigate = useNavigate();

  return (
    <motion.div
      onClick={() => navigate(`/artists/${artist.id}`)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 5) * 0.05 }}
      className={`group relative overflow-hidden cursor-pointer ${isFeatured ? 'aspect-[3.5/1]' : 'aspect-[3.2/1]'}`}
    >
      <div className="flex h-full items-center gap-2 px-1 py-1">
        <div className={`shrink-0 overflow-hidden rounded-full ${isFeatured ? 'h-10 w-10 md:h-14 md:w-14' : 'h-12 w-12 md:h-11 md:w-11'}`}>
          <img
            src={artist.image}
            alt={artist.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className={`min-w-0 ${isFeatured ? 'space-y-0.5 md:space-y-1' : 'space-y-1'}`}>
          <h4 className={`truncate font-bold uppercase tracking-tight text-white ${isFeatured ? 'text-xs md:text-base' : 'text-sm md:text-[15px]'}`}>
            {artist.name}
          </h4>

          <div className={`flex items-center ${isFeatured ? 'gap-3 md:gap-5' : 'gap-3 md:gap-4'}`}>
            <div>
              <p className={`mb-0.5 flex items-center gap-1 font-bold uppercase tracking-[0.2em] text-white/30 ${isFeatured ? 'text-[7px] md:text-[9px]' : 'text-[8px]'}`}>
                <PresenceIcon className={` ${isFeatured ? 'h-2 w-2 md:h-3 md:w-3' : 'h-3 w-3'}`} />
                Presence
              </p>
              <p className={`font-bold text-white ${isFeatured ? 'text-[10px] md:text-sm' : 'text-xs md:text-sm'}`}>
                {artist.presence}
              </p>
            </div>
            <div>
              <p className={`mb-0.5 flex items-center gap-1 font-bold uppercase tracking-[0.2em] text-white/30 ${isFeatured ? 'text-[7px] md:text-[9px]' : 'text-[8px]'}`}>
                <ReleasesIcon className={` ${isFeatured ? 'h-2 w-2 md:h-3 md:w-3' : 'h-3 w-3'}`} />
                Releases
              </p>
              <p className={`font-bold text-white ${isFeatured ? 'text-[10px] md:text-sm' : 'text-xs md:text-sm'}`}>
                {artist.releases}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
