import { motion } from "motion/react";

const TAGLINES = [
  "A Divine Revelation is about to Begin",
  "The Founders have arrived. Let the Rite begin.",
  "The Theatre belongs to those who build it.",
  "This is just the first layer of the Dream.",
  "Founded by Art. Maintained by the Collective.",
];

export function RollingTicker() {
  return (
    <div className="relative w-full overflow-hidden bg-black/80 backdrop-blur-2xl border-y border-white/5 py-4">
      {/* Cinematic Gradient Overlays for smooth edges */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex w-max whitespace-nowrap items-center"
        animate={{
          x: ["0%", "-50%"],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop"
        }}
      >
        {/* Render the set twice for a perfect seamless loop */}
        {[...TAGLINES, ...TAGLINES].map((text, i) => (
          <div key={`${text}-${i}`} className="flex items-center gap-12 pr-12">
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-white/40 hover:text-white transition-colors cursor-default whitespace-nowrap">
              {text}
            </span>
            {/* Visual Separator */}
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
