import { motion } from "motion/react";
import { memo } from "react";
import { TheatreItem, SetSelectedItem } from "../../../types";
import { CategoryIcon, EditsIcon, PostersIcon, ScriptsIcon } from "../../../components/icons/AppIcons";

interface TheatreFeedItemProps {
  item: TheatreItem;
  items: TheatreItem[];
  setSelectedItem: SetSelectedItem;
}

export const TheatreFeedItem = memo(function TheatreFeedItem({ item, items, setSelectedItem }: TheatreFeedItemProps) {
  const isScript = item.category === 'Script';
  const isPoster = item.category === 'Poster';
  const isEdit = item.category === 'Edit' || item.type === 'video' || item.isPlay;

  return (
    <div 
      className="group cursor-pointer break-inside-avoid w-full inline-block mb-6 md:mb-8"
      onClick={() => setSelectedItem(item, items, 0)}
    >
      <div className={`relative rounded-xl overflow-hidden bg-white/5 border mb-3 ${isPoster ? 'border-transparent group-hover:border-white/10 ring-1 ring-white/5' : 'border-white/5'}`}>
        
        {isScript ? (
          <div className="w-full min-h-[300px] bg-[#f4f1ea] text-[#2a2a2a] p-6 md:p-8 font-mono text-[10px] md:text-xs leading-tight overflow-hidden shadow-inner border border-black/5 flex flex-col justify-center select-text transition-transform duration-700 group-hover:scale-[1.02]">
            <div className="uppercase mb-2 opacity-40 text-[7px] md:text-[8px] font-bold tracking-widest">Scene {item.id}</div>
            <div className="mb-2 font-bold uppercase tracking-tighter">{item.origins || 'INT. THE CANVAS - DAY'}</div>
            <div className="mb-4 italic opacity-70 leading-relaxed text-sm md:text-base">
              {item.title?.split(':').length > 1 ? item.title.split(':')[1] : (item.text || "A moment of pure cinematic reflection.")}
            </div>
            <div className="text-center w-full mb-1 mt-2 font-bold uppercase text-[8px] md:text-[10px] tracking-[0.2em]">{item.artist || 'DIRECTOR'}</div>
            <div className="text-center w-full px-4 italic opacity-90 text-sm">
              "{item.title?.split(':')[0]}"
            </div>
            <div className="mt-8 pt-4 border-t border-black/5 opacity-30 text-[7px] md:text-[8px] uppercase tracking-widest flex justify-between">
              <span>Draft v2.4</span>
              <span>{item.credits || 0} Credits</span>
            </div>
          </div>
        ) : (
          <div className="relative w-full overflow-hidden flex flex-col">
            <img 
               src={item.image} 
               alt={item.title}
               className={`w-full object-cover transition-transform duration-700 ${isEdit ? 'group-hover:scale-105' : 'group-hover:scale-[1.02]'}`}
               style={{ aspectRatio: item.aspectRatio ? `${item.aspectRatio}` : (isEdit ? '9/16' : 'auto') }}
               referrerPolicy="no-referrer"
            />
            {/* Subtle gradient for visual weight */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        )}

        {/* Video Indicator */}
        {isEdit && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
             <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative group/play pointer-events-auto">
               <div className="absolute inset-0 rounded-full bg-white/10 blur-xl scale-150 group-hover/play:bg-white/30 transition-colors duration-700" />
               <div className="relative w-14 h-14 rounded-full bg-black/40 backdrop-blur-2xl border border-white/20 flex items-center justify-center overflow-hidden shadow-2xl">
                 <EditsIcon className="h-5 w-5 text-white fill-white/10 ml-1 group-hover/play:scale-110 transition-transform duration-500" />
                 <motion.div animate={{ x: [-60, 60] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12" />
               </div>
             </motion.div>
          </div>
        )}

        {/* Poster Indicator */}
        {isPoster && (
          <div className="absolute top-4 right-4 z-10">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative group/sparkle pointer-events-auto">
              <div className="absolute inset-0 rounded-full bg-white/10 blur-sm scale-125 group-hover/sparkle:bg-white/30 transition-colors duration-500" />
              <div className="relative w-8 h-8 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 flex items-center justify-center overflow-hidden">
                 <PostersIcon className="h-3.5 w-3.5 text-white fill-white/10 group-hover/sparkle:rotate-12 transition-transform" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Script Indicator */}
        {isScript && (
          <div className="absolute top-4 right-4 z-10">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative group/pen pointer-events-auto">
              <div className="absolute inset-0 rounded-full bg-black/10 blur-sm scale-125 transition-colors duration-500" />
              <div className="relative w-8 h-8 rounded-full bg-black/80 backdrop-blur-xl border border-black flex items-center justify-center overflow-hidden shadow-xl">
                 <ScriptsIcon className="h-3.5 w-3.5 text-white fill-white/10 group-hover/pen:scale-110 transition-transform duration-500" />
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <div className="px-1 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <CategoryIcon category={item.category} className="w-3.5 h-3.5 fill-white/20" />
            <h5 className="text-sm md:text-[15px] font-bold uppercase tracking-tight leading-none">{item.title}</h5>
          </div>
          <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/40">Origins: {item.origins || 'Original'}</p>
        </div>
      </div>
    </div>
  );
});
