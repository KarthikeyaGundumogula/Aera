import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, ArrowRight } from "lucide-react";

export function ContactCTA() {
  const navigate = useNavigate();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="px-6 sm:px-12 mb-24"
    >
      <div className="relative group p-10 md:p-16 rounded-[40px] bg-white/[0.02] border border-white/5 overflow-hidden text-center flex flex-col items-center">
        {/* Abstract Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-accent/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-brand-accent/10 transition-all duration-700" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-center gap-3 mb-8 opacity-40">
            <div className="h-px w-8 bg-white/20" />
            <span className="text-[9px] font-bold uppercase tracking-[0.4em]">
              Direct Communication
            </span>
            <div className="h-px w-8 bg-white/20" />
          </div>

          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none">
            Have a thought? <br />
            <span className="text-white/20">Talk to the Founders.</span>
          </h2>

          <p className="text-xs md:text-sm text-white/30 max-w-sm mx-auto leading-relaxed">
            During our beta phase, every frame counts. Reach out directly with
            feedback, questions, or just to say hello.
          </p>

          <button
            onClick={() => navigate("/contact")}
            className="group/btn relative mt-8 px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.1)] flex items-center gap-3"
          >
            <MessageSquare className="w-4 h-4 transition-transform group-hover/btn:-translate-y-1 group-hover/btn:rotate-12" />
            <span>Open Stage</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
