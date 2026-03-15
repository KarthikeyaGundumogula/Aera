/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { TheatreItem } from "./types";
import { MobileLayout } from "./components/MobileLayout";
import { DesktopLayout } from "./components/DesktopLayout";
import { QuickView } from "./components/QuickView";

export default function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TheatreItem | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="min-h-screen font-sans selection:bg-brand-accent/30">
      {isMobile ? (
        <MobileLayout selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      ) : (
        <DesktopLayout selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      )}
      <QuickView selectedItem={selectedItem} setSelectedItem={setSelectedItem} isMobile={isMobile} />
    </div>
  );
}
