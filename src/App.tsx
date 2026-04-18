/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./components/utils/ScrollToTop";
import { MobileNavBar } from "./features/navigation/MobileNavBar";

// Page Imports
import { Home } from "./features/home/HomePage";
import { OriginalPage } from "./features/originals/OriginalPage";
import { ComingSoonPage } from "./features/shared/ComingSoonPage";
import { TheatrePage } from "./features/theatre/TheatrePage";
import { OriginalsTheatrePage } from "./features/originals/OriginalsTheatrePage";
import UploadPage from "./features/upload/UploadPage";

/**
 * App Component
 * Handles the main routing and global layout wrappers.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <MobileNavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/theatre" element={<TheatrePage />} />
        <Route
          path="/originals"
          element={
            <ComingSoonPage
              label="Originals"
              description="We're shaping the dedicated originals experience next. For now, this page is a placeholder."
            />
          }
        />
        <Route path="/sets" element={<ComingSoonPage label="Sets" />} />
        <Route path="/profile" element={<ComingSoonPage label="Profile" />} />
        <Route path="/submit" element={<UploadPage />} />
        
        <Route path="/originals/:id" element={<OriginalPage />} />
        <Route path="/originals/:id/theatre" element={<OriginalsTheatrePage />} />
        <Route
          path="/originals/:id/releases"
          element={<ComingSoonPage label="Official Releases" />}
        />
        <Route
          path="/artists/:id"
          element={<ComingSoonPage label="Artist Profile" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
