import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  Mail,
  Instagram,
  Twitter,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { Logo } from "../../components/Logo";

export default function ContactPage() {
  const navigate = useNavigate();

  const contacts = [
    {
      id: "phone",
      label: "Direct Line",
      value: "+91 9392571958",
      icon: <Phone className="w-5 h-5" />,
      href: "tel:+919392571958",
    },
    {
      id: "email",
      label: "Electronic Mail",
      value: "Karthikeya Gundumogula",
      icon: <Mail className="w-5 h-5" />,
      href: "mailto:karthikeyag2682@gmail.com",
    },
    {
      id: "instagram",
      label: "Instagram",
      value: "@karthikeya.gundumogula",
      icon: <Instagram className="w-5 h-5" />,
      href: "https://www.instagram.com/karthikeya.gundumogula/",
    },
    {
      id: "twitter",
      label: "X / Twitter",
      value: "@Kapten",
      icon: <Twitter className="w-5 h-5" />,
      href: "https://x.com/jalsa_kap",
    },
  ];

  return (
    <div className="min-h-screen bg-surface-deep text-white selection:bg-white selection:text-black font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white/[0.02] blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-white/[0.015] blur-[150px] rounded-full" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-surface-deep/95 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Logo onClick={() => navigate("/")} showText={false} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
          The Founder's Line
        </span>
      </header>

      <main className="relative z-10 pt-32 pb-24 px-6 max-w-4xl mx-auto">
        {/* Intro */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-12 bg-white/20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
              Direct Connection
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-[0.9] mb-8"
          >
            Reach the <br />
            <span className="text-white/20">Collective Founders</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-white/40 max-w-xl leading-relaxed"
          >
            We are building the Collective alongside our beta community. No middle-men, no
            tickets. Just a direct frequency to the people shaping this theatre.
          </motion.p>
        </section>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact, idx) => (
            <motion.a
              key={contact.id}
              href={contact.href}
              target={
                contact.id.startsWith("tel") || contact.id.startsWith("mailto")
                  ? undefined
                  : "_blank"
              }
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{
                scale: 1.01,
                backgroundColor: "rgba(255, 255, 255, 0.04)",
              }}
              whileTap={{ scale: 0.99 }}
              className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 transition-all duration-300 flex flex-col justify-between h-56"
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 group-hover:text-white group-hover:border-white/20 transition-all">
                  {contact.icon}
                </div>
                <div className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/10 group-hover:text-white/20 transition-all">
                  Something is Fishy
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-2">
                  {contact.label}
                </h3>
                <div className="text-lg md:text-xl font-black uppercase tracking-tight mb-2 group-hover:text-white transition-colors">
                  {contact.value}
                </div>
                <p className="text-[10px] font-medium text-white/20 group-hover:text-white/40 uppercase tracking-widest leading-relaxed">
                  contact me
                </p>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30"
        >
          <div className="flex items-center gap-4">
            <MessageSquare className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em]">
              Response time: ~2-4 shifts
            </span>
          </div>
          <div className="text-[9px] font-medium uppercase tracking-[0.2em]">
            Founded with rage
          </div>
        </motion.div>
      </main>
    </div>
  );
}
