import { motion } from "motion/react";
import { Sparkles, Users, Film, Share2, Play, PenTool } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { TheatreItem } from "../types";
import { SCREENS_DATA } from "../data/mockData";
import { QuickView } from "../components/QuickView";

import { Logo } from "../components/Logo";

const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'Edit':
      return <Play className="w-2.5 h-2.5 fill-white/20" />;
    case 'Script':
      return <PenTool className="w-2.5 h-2.5 fill-white/20" />;
    case 'Poster':
      return <Sparkles className="w-2.5 h-2.5 fill-white/20" />;
    default:
      return null;
  }
};

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
          <Logo onClick={() => navigate('/')} showText={false} />
        </div>

        {/* Screen Info */}
        <div className="absolute bottom-0 left-0 p-8 w-full">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest rounded-sm border border-white/10">Official Screen</span>
              <div className="h-px w-8 bg-white/20" />
            </div>
            <h1 
              className="font-black tracking-tighter mb-4 uppercase leading-[0.82] break-words"
              style={{ 
                fontSize: `clamp(2.5rem, ${Math.max(5, 15 - (screen.title.length * 0.3))}vw, 7rem)` 
              }}
            >
              {screen.title}
            </h1>
            <p className="text-sm text-white/60 max-w-md leading-relaxed mb-8">{screen.description}</p>
            
            {/* Stats */}
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  <span className="text-lg font-bold">{screen.stats.credits}</span>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">Presence</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-3 h-3 text-blue-400" />
                  <span className="text-lg font-bold">{screen.stats.members}</span>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">Artists</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <Film className="w-3 h-3 text-purple-400" />
                  <span className="text-lg font-bold">{screen.stats.releases}</span>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/30">Releases</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wall of Fame */}
      <div className="p-8">
        <div className="flex items-center gap-2 mb-8 opacity-40">
          <div className="w-4 h-px bg-white" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Wall of Fame</h3>
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
                  {getCategoryIcon(item.category)}
                  {item.category}
                </div>
              </div>
              <h4 className="text-xl font-bold uppercase tracking-tight mb-1">{item.title}</h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Featured Release</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detailed Information */}
      <div className="p-8 pt-0">
        <div className="flex items-center gap-2 mb-8 opacity-40">
          <div className="w-4 h-px bg-white" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Detailed Information</h3>
        </div>
        
        <div className="space-y-8">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Full Description</h4>
            <p className="text-sm text-white/80 leading-relaxed">
              {screen.description} This curated screen represents a pinnacle of cinematic achievement, bringing together the most impactful visual and narrative elements from the {screen.title} universe.
            </p>
          </div>
          
          {screen.releaseDate && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Release Date</h4>
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
