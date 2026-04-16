import { motion, AnimatePresence } from "motion/react";
import React, { memo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OriginalStar } from "../../../types";
import { CreditTag } from "../tags";

interface StarProfileProps {
  person: OriginalStar;
  delay?: number;
  type?: 'Star' | 'Maker';
}

export const StarProfile = memo(({ person, delay = 0, type = 'Star' }: StarProfileProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const navigate = useNavigate();

    // Handle body scroll locking
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [isOpen]);

    const nameParts = person.actorName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const handleProjectClick = (id: string) => {
      setIsOpen(false);
      navigate(`/originals/${id}`);
    };

    return (
      <>
        {/* STAR CARD (TRIGGER - FILM STRIP STYLE) */}
        <motion.div
          onClick={() => setIsOpen(true)}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="group relative flex w-full aspect-[2/3] min-w-[200px] max-w-[260px] overflow-hidden rounded-[20px] bg-[#050505] cursor-pointer border border-white/5"
        >
          {/* Film Strip Background */}
          <div className="absolute inset-0 z-0 h-full w-full">
            <img
              src={person.imageUrl}
              alt={person.actorName}
              className="h-full w-full object-cover transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-[1.03]"
            />
          </div>

          {/* EDGE SOUNDTRACK - Left physical border of the reel */}
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
                    {/* Default state (Actor Name) */}
                    <div className="w-full h-1/2 flex items-center justify-center">
                      <span className="[writing-mode:vertical-rl] rotate-180 uppercase tracking-widest text-[#f4f1ea] text-[11px] sm:text-[12px] font-black whitespace-nowrap flex items-center gap-2">
                        <span className="w-[1px] h-3 bg-white/30 inline-block mb-1"></span>
                        {person.actorName}
                      </span>
                    </div>

                    {/* Hover state (Character Name) */}
                    <div className="w-full h-1/2 flex items-center justify-center">
                      <span className="[writing-mode:vertical-rl] rotate-180 uppercase tracking-[0.3em] text-[8px] sm:text-[9px] font-bold text-white/50 whitespace-nowrap">
                        {person.characterName}
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
          
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 to-transparent pointer-events-none" />
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 sm:p-8"
              onClick={() => setIsOpen(false)}
            >
              <div className="perspective-2000 w-full max-w-[340px] sm:max-w-[380px] h-fit">
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ 
                    duration: 0.8, 
                    type: "spring", 
                    damping: 20, 
                    stiffness: 100 
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Prevent flipping if an interactive element (like CreditTag) was clicked
                    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
                    setIsFlipped(!isFlipped);
                  }}
                  className="relative w-full h-full cursor-pointer"
                >
                  {/* FRONT SIDE (FILM STRIP MODAL STYLE) */}
                  <div 
                    className="w-full backface-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="relative w-full aspect-[2/3] bg-[#0A0A0A] rounded-[24px] overflow-hidden flex shadow-2xl border border-white/10">
                        {/* Top Title Overlay */}
                        <div className="absolute top-6 w-full text-center z-30 pointer-events-none mix-blend-overlay">
                          <span className="text-white/100 uppercase tracking-[0.4em] text-[10px] sm:text-xs font-bold">
                            {type}
                          </span>
                        </div>

                        {/* Overlapping Name Container (Left Edge) */}
                        <div className="absolute left-0 top-0 bottom-0 w-24 flex flex-col items-center justify-center z-40 pointer-events-none mix-blend-overlay sm:mix-blend-normal">
                          <div className="absolute flex flex-col items-start -rotate-90 whitespace-nowrap origin-center scale-[105%] sm:scale-100">
                            <div
                              className="uppercase text-[42px] sm:text-[52px] tracking-wide leading-[0.85] drop-shadow-xl font-bold"
                              style={{
                                color: "rgba(255,255,255,0.95)",
                                fontFamily: "'Londrina Outline', sans-serif",
                              }}
                            >
                              {firstName}
                            </div>
                            <div
                              className="uppercase text-[42px] sm:text-[52px] tracking-wide leading-[0.85] drop-shadow-xl font-bold"
                              style={{
                                color: "rgba(255, 255, 255, 0.57)",
                                fontFamily: "'Londrina Outline', sans-serif",
                              }}
                            >
                              {lastName}
                            </div>
                          </div>
                        </div>

                        {/* Filmstrip Main Content */}
                        <div className="w-full h-full relative z-10 overflow-hidden bg-[#020202] flex flex-col justify-between py-5 sm:py-6">
                          {/* Horizontal Top Perforations */}
                          <div className="flex justify-center gap-4 opacity-30 px-4 z-30 relative">
                            {[...Array(6)].map((_, i) => (
                              <div
                                key={`tp-${i}`}
                                className="w-4 sm:w-5 h-2 rounded-sm bg-black border border-white/10"
                              />
                            ))}
                          </div>

                          {/* Main Image */}
                          <div className="absolute inset-0 z-0">
                            <img
                              src={person.imageUrl}
                              alt={person.actorName}
                              className="w-full h-full object-cover scale-[1.02]"
                            />
                            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#020202] via-[#020202]/30 to-transparent pointer-events-none" />
                            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#020202] via-[#020202]/60 to-transparent pointer-events-none" />
                          </div>

                          {/* Horizontal Bottom Perforations */}
                          <div className="flex justify-center gap-4 opacity-30 px-4 z-30 relative">
                            {[...Array(6)].map((_, i) => (
                              <div
                                key={`bp-${i}`}
                                className="w-4 sm:w-5 h-2 rounded-sm bg-black border border-white/10"
                              />
                            ))}
                          </div>
                        </div>

                        {/* Bottom Footer Overlay */}
                        <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-30 px-4 sm:px-6 flex items-center justify-between">
                          <button className="bg-[#f0f0f0] text-[#111] px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-[0.2em] hover:bg-white hover:scale-105 transition-all shadow-md">
                            Follow +
                          </button>

                          <span className="text-[#999] font-bold text-[9px] tracking-widest uppercase text-right leading-tight max-w-[50%]">
                            {person.characterName}
                          </span>
                        </div>
                    </div>
                  </div>

                  {/* BACK SIDE (THE NEON VAULT) */}
                  <div 
                    className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-[#050505] border border-white/10 shadow-2xl flex flex-col backdrop-blur-3xl aspect-[2/3]">
                      <div className="p-6 pb-2 flex justify-between items-start z-10">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black tracking-[0.3em] text-white/40 uppercase">Credit Archive</span>
                          <span className="text-[9px] font-mono text-white/20 mt-0.5">{person.actorName}</span>
                        </div>
                      </div>

                      <div className="flex-1 px-6 py-6 flex flex-col justify-start items-center gap-4 z-10 overflow-y-auto no-scrollbar">
                        <h3 className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 text-center mb-4">Filmography</h3>
                        
                        <div className="flex flex-row flex-wrap justify-center gap-2 w-full">
                          {person.workedOn?.map((project, pIdx) => (
                            <CreditTag 
                              key={project.id}
                              id={project.id}
                              title={project.title}
                              index={pIdx}
                              onClick={handleProjectClick}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="p-8 flex items-center justify-center border-t border-white/5 bg-white/[0.02]">
                         <p className="text-[10px] font-medium text-white/40 italic text-center leading-relaxed">
                           "All there is to it is to be as real as you can be."
                         </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
});
