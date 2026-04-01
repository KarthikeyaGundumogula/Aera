import { motion } from "motion/react";
import { Users, Film } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { TheatreItem } from "../types";
import { SCREENS_DATA } from "../mock";
import { QuickView } from "../components/QuickView";
import { CategoryIcon, PresenceIcon, ReleasesIcon } from "../components/AppIcons";

import { Logo } from "../components/Logo";

export function ScreenPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<TheatreItem | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const screen = id ? SCREENS_DATA[id] : null;

  if (!screen) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Screen not found</h1>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-white text-black rounded-full font-bold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const artistStripItems = Array.from(
    { length: Math.max(15, screen.topArtists.length) },
    (_, index) => screen.topArtists[index % screen.topArtists.length]
  );

  return (
    <div className="min-h-screen bg-[#050505] overflow-y-auto no-scrollbar">
      {/* Hero Header */}
      <div className="relative h-[50vh] w-full">
        <img
          src={screen.coverImage}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
          <Logo onClick={() => navigate("/")} showText={false} />
        </div>

        {/* Screen Info */}
        <div className="absolute bottom-0 left-0 p-8 w-full">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest rounded-sm border border-white/10">
                Official Screen
              </span>
              <div className="h-px w-8 bg-white/20" />
            </div>
            <h1
              className="font-black tracking-tighter mb-4 uppercase leading-[0.82] break-words"
              style={{
                fontSize: `clamp(2.5rem, ${Math.max(5, 15 - screen.title.length * 0.3)}vw, 7rem)`,
              }}
            >
              {screen.title}
            </h1>
            <p className="text-sm text-white/60 max-w-md leading-relaxed mb-8">
              {screen.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <PresenceIcon className="w-3 h-3 text-yellow-400" />
                  <span className="text-lg font-bold">
                    {screen.stats.presence}
                  </span>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">
                  Presence
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-3 h-3 text-blue-400" />
                  <span className="text-lg font-bold">
                    {screen.stats.members}
                  </span>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">
                  Artists
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <Film className="w-3 h-3 text-purple-400" />
                  <span className="text-lg font-bold">
                    {screen.stats.releases}
                  </span>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">
                  Releases
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Top Artists */}
      <section className="px-8 pt-10 pb-4">
        <div className="flex items-center gap-2 mb-6 opacity-40">
          <div className="w-4 h-px bg-white" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">
            Artist Spotlight
          </h3>
        </div>

        <div className="overflow-x-auto no-scrollbar pb-2">
          <div className="grid grid-flow-col grid-rows-3 gap-2 auto-cols-[250px] md:auto-cols-[300px] w-max">
            {artistStripItems.map((artist, idx) => (
              <motion.div
                key={`${artist.id}-${idx}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 5) * 0.05 }}
                className="group relative aspect-[3.2/1] overflow-hidden"
              >
                <div className="flex h-full items-center gap-2 px-1 py-1">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full md:h-11 md:w-11">
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <h4 className="truncate text-sm md:text-[15px] font-bold uppercase tracking-tight text-white">
                      {artist.name}
                    </h4>

                    <div className="flex items-center gap-3 md:gap-4">
                      <div>
                        <p className="mb-0.5 flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                          <PresenceIcon className="h-3 w-3" />
                          Presence
                        </p>
                        <p className="text-xs md:text-sm font-bold text-white">
                          {artist.presence}
                        </p>
                      </div>
                      <div>
                        <p className="mb-0.5 flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                          <ReleasesIcon className="h-3 w-3" />
                          Releases
                        </p>
                        <p className="text-xs md:text-sm font-bold text-white">
                          {artist.releases}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wall of Fame */}
      <div className="px-8 pt-3 pb-8">
        <div className="flex items-center gap-2 mb-8 opacity-40">
          <div className="w-4 h-px bg-white" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">
            {screen.title} Wall
            </h3>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {screen.wallOfFame.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedItem(item)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/5 mb-4">
                <img
                  src={item.image}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-4 right-4 px-2 py-0.5 bg-black/40 backdrop-blur-md border border-white/10 rounded flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest">
                  <CategoryIcon
                    category={item.category}
                    className="w-2.5 h-2.5 fill-white/20"
                  />
                  {item.category}
                </div>
              </div>
              <h4 className="text-xl font-bold uppercase tracking-tight mb-1">
                {item.title}
              </h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                Featured Release
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detailed Information */}
      <div className="p-8 pt-0">
        <div className="flex items-center gap-2 mb-8 opacity-40">
          <div className="w-4 h-px bg-white" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">
            Detailed Information
          </h3>
        </div>

        <div className="space-y-8">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
              Full Description
            </h4>
            <p className="text-sm text-white/80 leading-relaxed">
              {screen.description} This curated screen represents a pinnacle of
              cinematic achievement, bringing together the most impactful visual
              and narrative elements from the {screen.title} universe.
            </p>
          </div>

          {screen.releaseDate && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
                Release Date
              </h4>
              <p className="text-sm text-white/80 font-mono tracking-tighter">
                {screen.releaseDate}
              </p>
            </div>
          )}
        </div>
      </div>

      <QuickView
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        isMobile={isMobile}
        items={screen.wallOfFame}
        columns={1}
      />

      {/* Footer Space */}
      <div className="h-24" />
    </div>
  );
}
