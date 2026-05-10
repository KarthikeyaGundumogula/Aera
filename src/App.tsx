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
import ArtistSetupPage from "./features/profile/ArtistSetupPage";
import LoginPage from "./features/profile/LoginPage";
import ProfileEditPage from "./features/profile/ProfileEditPage";
import OriginalCreatePage from "./features/originals/OriginalCreatePage";
import OriginalReleaseUploadPage from "./features/upload/OriginalReleaseUploadPage";
import ContactPage from "./features/contact/ContactPage";
import { LedgerPage } from "./features/ledger/LedgerPage";
import { AdminPage } from "./features/admin/AdminPage";
import ProfilePage from "./features/profile/ProfilePage";
import { SetsPage, SetDetailPage, SetsTheatrePage } from "./features/sets";
import { FestivalDetailPage, FestivalTheatrePage } from "./features/festivals";

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
        <Route path="/sets" element={<SetsPage />} />
        <Route path="/sets/:id" element={<SetDetailPage />} />
        <Route path="/sets/:id/theatre" element={<SetsTheatrePage />} />

        <Route path="/profile/new" element={<ArtistSetupPage />} />
        <Route path="/profile/login" element={<LoginPage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
        <Route path="/works/new" element={<UploadPage />} />
        <Route path="/ledger" element={<LedgerPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/originals/new" element={<OriginalCreatePage />} />
        <Route path="/admin/profile/new" element={<ArtistSetupPage />} />
        
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/originals/:id" element={<OriginalPage />} />
        <Route path="/originals/:id/theatre" element={<OriginalsTheatrePage />} />
        <Route
          path="/originals/:id/releases"
          element={<ComingSoonPage label="Official Releases" />}
        />
        <Route
          path="/originals/:id/releases/new"
          element={<OriginalReleaseUploadPage />}
        />
        <Route
          path="/artists/:id"
          element={<ComingSoonPage label="Artist Profile" />}
        />
        <Route path="/profile/:profileId" element={<ProfilePage />} />
        <Route
          path="/festivals/:id"
          element={<FestivalDetailPage />}
        />
        <Route
          path="/festivals/:id/theatre"
          element={<FestivalTheatrePage />}
        />
      </Routes>
    </BrowserRouter>
  );
}
