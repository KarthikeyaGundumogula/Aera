import { motion } from "motion/react";
import { Search, Home, User } from "lucide-react";
import { TheatreItem } from "../types";
import { LIVE_NOW, FEED_ITEMS, GRID_ITEMS } from "../data/mockData";

interface MobileLayoutProps {
  selectedItem: TheatreItem | null;
  setSelectedItem: (item: TheatreItem | null) => void;
}

export function MobileLayout({ setSelectedItem }: MobileLayoutProps) {
  const banners = [
    { id: 'b1', title: 'New Release: Neon Nights', image: 'https://picsum.photos/seed/neon/800/400' },
    { id: 'b2', title: 'Exclusive: Director Cut', image: 'https://picsum.photos/seed/director/800/400' },
    { id: 'b3', title: 'Live: Global Premiere', image: 'https://picsum.photos/seed/premiere/800/400' },
  ];

  return (
    <div className="bg-brand-dark h-screen flex flex-col overflow-hidden">
      {/* Slim Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-3 bg-brand-dark/95 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-semibold tracking-tight text-white">Theatre</h1>
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-brand-accent text-brand-dark rounded-sm uppercase tracking-widest">AERA</span>
          </div>
          <button className="p-1.5 rounded-full hover:bg-white/5 transition-colors">
            <Search className="text-white/80 w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2-Axis Scrollable Content Area */}
      <main className="flex-1 mt-14 overflow-auto no-scrollbar bg-gradient-ambient">
        {/* Spotlight Section */}
        <div className="pt-4">
          <div className="px-6 mb-2">
            <h2 className="text-[10px] font-bold text-brand-accent uppercase tracking-[0.2em]">Spotlight</h2>
          </div>
          <div className="w-full overflow-x-auto no-scrollbar flex space-x-3 px-6 pb-4">
            {banners.map((banner) => (
              <motion.div 
                key={banner.id} 
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 w-48 h-24 rounded-lg overflow-hidden relative border border-white/10 shadow-lg"
              >
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover opacity-70" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-2 flex flex-col justify-end">
                  <span className="text-[7px] font-bold text-white/60 uppercase tracking-widest mb-0.5">Featured</span>
                  <h4 className="text-[10px] font-medium text-white line-clamp-1">{banner.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Feed - Theatre Grid */}
        <div className="w-[180vw] px-6 pb-32">
          <div className="px-2 mb-4">
            <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Theatre Feed</h2>
          </div>
          
          {/* 2D Grid for 2-axis exploration - Tightened spacing */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-6">
            {/* Mix of Live and Feed items in a wide grid */}
            {[...LIVE_NOW, ...FEED_ITEMS, ...GRID_ITEMS.slice(0, 8)].map((item, idx) => (
              <motion.div
                key={`${item.id}-${idx}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                viewport={{ once: true }}
                onClick={() => setSelectedItem(item)}
                className="flex flex-col space-y-2 cursor-pointer"
              >
                <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-xl border border-white/5">
                  <img
                    src={'image' in item ? item.image : ''}
                    alt={'title' in item ? item.title : 'Item'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {'status' in item && (
                    <div className="absolute top-2 left-2 flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full">
                      {item.status === "Live Now" && <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></span>}
                      <span className="text-[7px] font-bold text-white uppercase tracking-widest">{item.status}</span>
                    </div>
                  )}
                  {'badge' in item && (
                    <div className="absolute bottom-2 right-2">
                      <span className="px-1 py-0.5 bg-brand-accent text-white text-[7px] font-bold rounded-sm tracking-widest">
                        {item.badge}
                      </span>
                    </div>
                  )}
                </div>
                <div className="px-1">
                  <h3 className="text-[11px] font-medium text-white line-clamp-1">{'title' in item ? item.title : 'Untitled'}</h3>
                  <p className="text-[8px] text-white/30 uppercase tracking-wider mt-0.5">
                    {'watching' in item ? item.watching : ('meta' in item ? item.meta : 'AERA')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 glass-nav z-50 flex items-center justify-around px-8">
        <button className="flex flex-col items-center space-y-1 group">
          <Home className="text-brand-accent w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent">Home</span>
        </button>
        <button className="flex flex-col items-center space-y-1 group">
          <User className="text-white/40 w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Profile</span>
        </button>
      </nav>
    </div>
  );
}
