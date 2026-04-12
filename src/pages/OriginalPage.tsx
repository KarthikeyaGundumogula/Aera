import { motion } from "motion/react";
import { Users, Film } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { TheatreItem } from "../types";
import { ORIGINALS_DATA } from "../mock";
import { QuickView } from "../components/QuickView";
import { CategoryIcon, PresenceIcon, ReleasesIcon } from "../components/AppIcons";
import { Logo } from "../components/Logo";
import { ArtistCard } from "../components/ArtistCard";
import { TheatreFeedItem } from "../components/TheatreFeedItem";
import { SectionHeader } from "../components/SectionHeader";
import { StarProfileCard, StarProfileCardProps } from "../components/StarProfileCard";
import { StarModal } from "../components/StarModal";

const STARS_MOCK = [
  { actorName: "Timothée Chalamet", characterName: "Paul Atreides", imageUrl: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=800&auto=format&fit=crop" },
  { actorName: "Zendaya", characterName: "Chani", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop" },
  { actorName: "Rebecca Ferguson", characterName: "Lady Jessica", imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop" },
  { actorName: "Oscar Isaac", characterName: "Duke Leto", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop" },
  { actorName: "Jason Momoa", characterName: "Duncan Idaho", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop" },
];

const MAKERS_MOCK = [
  { actorName: "Denis Villeneuve", characterName: "Director", imageUrl: "https://images.unsplash.com/photo-1544168190-79c154273140?q=80&w=800&auto=format&fit=crop" },
  { actorName: "Greig Fraser", characterName: "DoP", imageUrl: "https://images.unsplash.com/photo-1517430554945-aa5c808f2f2c?q=80&w=800&auto=format&fit=crop" },
  { actorName: "Hans Zimmer", characterName: "Music", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop" },
  { actorName: "Mary Parent", characterName: "Producer", imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop" },
  { actorName: "Jon Spaihts", characterName: "Screenplay", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop" },
];

export function OriginalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<TheatreItem | null>(null);
  const [selectedStar, setSelectedStar] = useState<StarProfileCardProps | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const original = id ? ORIGINALS_DATA[id] : null;

  if (!original) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Original not found</h1>
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
    { length: Math.max(15, original.topArtists.length) },
    (_, index) => original.topArtists[index % original.topArtists.length]
  );

  return (
    <div className="min-h-screen bg-[#050505] overflow-y-auto no-scrollbar">
      {/* Hero Header */}
      <div className="relative h-[50vh] w-full">
        <img
          src={original.coverImage}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
          <Logo onClick={() => navigate("/")} showText={false} />
        </div>

        {/* Original Info */}
        <div className="absolute bottom-0 left-0 p-8 w-full">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest rounded-sm border border-white/10">
                  Original
              </span>
              <div className="h-px w-8 bg-white/20" />
            </div>
            <h1
              className="font-black tracking-tighter mb-4 uppercase leading-[0.82] break-words"
              style={{
                fontSize: `clamp(2.5rem, ${Math.max(5, 15 - original.title.length * 0.3)}vw, 7rem)`,
              }}
            >
              {original.title}
            </h1>
            <p className="text-sm text-white/60 max-w-md leading-relaxed mb-8">
              {original.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <PresenceIcon className="w-3 h-3 text-yellow-400" />
                  <span className="text-lg font-bold">
                    {original.stats.presence}
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
                    {original.stats.members}
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
                    {original.stats.releases}
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

      {/* Star Spotlight */}
      <section className="px-8 pt-10 pb-4">
        <SectionHeader 
           iconNode={<div className="w-4 h-px bg-white" />} 
           title="Stars" 
           containerClassName="mb-6" 
        />

        <div className="overflow-x-auto no-scrollbar pb-6 -mx-8 px-8">
          <div className="flex gap-4 sm:gap-6 w-max">
            {STARS_MOCK.map((star, idx) => (
              <StarProfileCard 
                key={idx} 
                actorName={star.actorName} 
                characterName={star.characterName} 
                imageUrl={star.imageUrl} 
                delay={idx * 0.15}
                onClick={() => setSelectedStar(star)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Makers Spotlight */}
      <section className="px-8 pt-6 pb-4">
        <SectionHeader 
           iconNode={<div className="w-4 h-px bg-white" />} 
           title="Makers" 
           containerClassName="mb-6" 
        />

        <div className="overflow-x-auto no-scrollbar pb-6 -mx-8 px-8">
          <div className="flex gap-4 sm:gap-6 w-max">
            {MAKERS_MOCK.map((maker, idx) => (
              <StarProfileCard 
                key={idx} 
                actorName={maker.actorName} 
                characterName={maker.characterName} 
                imageUrl={maker.imageUrl} 
                delay={idx * 0.15}
                onClick={() => setSelectedStar(maker)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Top Artists */}
      <section className="px-8 pt-4 pb-4">
        <SectionHeader 
           iconNode={<div className="w-4 h-px bg-white" />} 
           title="Artist Spotlight" 
           containerClassName="mb-6" 
        />

        <div className="overflow-x-auto no-scrollbar pb-2">
          <div className="grid grid-flow-col grid-rows-3 gap-2 auto-cols-[250px] md:auto-cols-[300px] w-max">
            {artistStripItems.map((artist, idx) => (
              <ArtistCard key={`${artist.id}-${idx}`} artist={artist} index={idx} variant="default" />
            ))}
          </div>
        </div>
      </section>

      {/* Wall of Fame */}
      <div className="px-8 pt-3 pb-8">
        <SectionHeader 
           iconNode={<div className="w-4 h-px bg-white" />} 
           title={`${original.title} Wall`}
           containerClassName="mb-8" 
        />

        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
          {original.wallOfFame.map((item) => (
             <TheatreFeedItem
               key={item.id}
               item={item}
               items={original.wallOfFame}
               setSelectedItem={setSelectedItem}
             />
          ))}
        </div>
      </div>

      {/* Detailed Information */}
      <div className="p-8 pt-0">
        <SectionHeader 
           iconNode={<div className="w-4 h-px bg-white" />} 
           title="Detailed Information"
           containerClassName="mb-8" 
        />

        <div className="space-y-8">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
              Full Description
            </h4>
            <p className="text-sm text-white/80 leading-relaxed">
              {original.description} This curated original represents a pinnacle of
              cinematic achievement, bringing together the most impactful visual
              and narrative elements from the {original.title} universe.
            </p>
          </div>

          {original.releaseDate && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
                Release Date
              </h4>
              <p className="text-sm text-white/80 font-mono tracking-tighter">
                {original.releaseDate}
              </p>
            </div>
          )}
        </div>
      </div>

      <QuickView
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        isMobile={isMobile}
        items={original.wallOfFame}
        columns={1}
      />

      {/* Footer Space */}
      <div className="h-24" />

      {/* Cinematic Star Modal Overlay */}
      <StarModal 
        star={selectedStar} 
        onClose={() => setSelectedStar(null)} 
      />
    </div>
  );
}
