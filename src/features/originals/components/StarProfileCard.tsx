import { motion } from "motion/react";
import { memo } from "react";

export interface StarProfileCardProps {
  actorName: string;
  characterName: string;
  imageUrl: string;
  delay?: number;
  onClick?: () => void;
}

export const StarProfileCard = memo(({ actorName, characterName, imageUrl, delay = 0, onClick }: StarProfileCardProps) => {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex w-full aspect-[2/3] min-w-[200px] max-w-[260px] overflow-hidden rounded-[20px] bg-[#050505] cursor-pointer border border-white/5"
    >
      {/* 
        FILM STRIP / IMAGE CONTAINER
      */}
      <div className="absolute inset-0 z-0 h-full w-full">
        
        {/* Image */}
        <img
          src={imageUrl}
          alt={actorName}
          className="h-full w-full object-cover transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-[1.03]"
        />
      </div>

      {/* 
        EDGE SOUNDTRACK - Left physical border of the reel
      */}
      <div className="absolute left-0 top-0 bottom-0 z-20 flex w-10 flex-col items-center justify-between bg-transparent">
        
        {/* Top perforations */}
        <div className="flex flex-col gap-1.5 pt-4 opacity-30">
          {[...Array(3)].map((_, i) => (
            <div key={`t-${i}`} className="w-1.5 h-2 rounded-sm bg-black border border-white/10" />
          ))}
        </div>

        {/* Text Revealer container */}
        <div className="relative w-full flex-1 flex flex-col items-center overflow-hidden my-2">
            
            {/* Sliding Container */}
            <div className="absolute w-full h-[200%] flex flex-col items-center top-0 transition-transform duration-[800ms] ease-[0.19,1,0.22,1] transform group-hover:-translate-y-1/2">
                
                {/* Default state (Actor Name) - Lives inside the top 50% */}
                <div className="w-full h-1/2 flex items-center justify-center">
                  <span className="[writing-mode:vertical-rl] rotate-180 uppercase tracking-widest text-[#f4f1ea] text-[11px] sm:text-[12px] font-black whitespace-nowrap flex items-center gap-2">
                    <span className="w-[1px] h-3 bg-white/30 inline-block mb-1"></span>
                    {actorName}
                  </span>
                </div>

                {/* Hover state (Character Name) - Lives inside the bottom 50% */}
                <div className="w-full h-1/2 flex items-center justify-center">
                  <span className="[writing-mode:vertical-rl] rotate-180 uppercase tracking-[0.3em] text-[8px] sm:text-[9px] font-bold text-white/50 whitespace-nowrap">
                    {characterName}
                  </span>
                </div>

            </div>
        </div>

        {/* Bottom perforations */}
        <div className="flex flex-col gap-1.5 pb-4 opacity-30">
          {[...Array(3)].map((_, i) => (
            <div key={`b-${i}`} className="w-1.5 h-2 rounded-sm bg-black border border-white/10" />
          ))}
        </div>

      </div>

    </motion.div>
  );
});
