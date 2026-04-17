import { motion } from "motion/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { TheatreItem, SetSelectedItem } from "../../../types";

import { DesktopCanvas } from "../components/desktop/DesktopCanvas";
import { MobileCanvas } from "../components/mobile/MobileCanvas";

import { Logo } from "../../../components/Logo";

import { useHeaderVisibility } from "../hooks/useHeaderVisibility";

interface TheatreLayoutProps {
  selectedItem: TheatreItem | null;
  setSelectedItem: SetSelectedItem;
  isMobile?: boolean;
}

export function TheatreLayout({ setSelectedItem, isMobile }: TheatreLayoutProps) {
  const { isHeaderVisible, handleScroll } = useHeaderVisibility();
  const navigate = useNavigate();
  const location = useLocation();

  const getNavClassName = (active: boolean) =>
    `text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${active ? "text-white" : "text-white/60 hover:text-white"}`;

  return (
    <div className="bg-[#050505] h-screen text-white selection:bg-brand-accent/30 overflow-hidden">
      {/* FIXED Header */}
      <motion.header 
        initial={{ y: 0 }}
        animate={{ y: isHeaderVisible ? 0 : -100 }}
        transition={{ type: "spring", damping: 20, stiffness: 120 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-black/40 backdrop-blur-xl border-b border-white/5"
      >
        <div className="flex items-center gap-12">
          <Logo onClick={() => navigate("/")} />
          <nav className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => navigate("/")}
              className={getNavClassName(location.pathname === "/")}
            >
              Home
            </button>
            <button
              onClick={() => navigate("/theatre")}
              className={getNavClassName(location.pathname === "/theatre")}
            >
              Theatre
            </button>
            <button
              onClick={() => navigate("/originals")}
              className={getNavClassName(location.pathname.startsWith("/originals"))}
            >
              Originals
            </button>
            <button
              onClick={() => navigate("/sets")}
              className={getNavClassName(location.pathname === "/sets")}
            >
              Sets
            </button>

          </nav>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-white/60 hover:text-white transition-colors"><Search className="w-5 h-5" /></button>
          <button
            onClick={() => navigate("/profile")}
            className={`transition-colors ${location.pathname === "/profile" ? "text-white" : "text-white/60 hover:text-white"}`}
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </motion.header>

      <motion.main 
        initial={false}
        animate={{ paddingTop: isHeaderVisible ? 80 : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 150 }}
        className="h-full w-full"
      >
        {isMobile ? (
          <MobileCanvas setSelectedItem={setSelectedItem} />
        ) : (
          <DesktopCanvas setSelectedItem={setSelectedItem} onScroll={handleScroll} />
        )}
      </motion.main>
    </div>
  );
}
