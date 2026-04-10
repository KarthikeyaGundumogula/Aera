/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { OriginalPage } from "./pages/OriginalPage";
import { ComingSoonPage } from "./pages/ComingSoonPage";
import { TheatrePage } from "./pages/TheatrePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/theatre" element={<TheatrePage />} />
        <Route
          path="/originals"
          element={<ComingSoonPage label="Originals" description="We’re shaping the dedicated originals experience next. For now, this page is a placeholder while we finish the mobile UI." />}
        />
        <Route
          path="/sets"
          element={<ComingSoonPage label="Sets" />}
        />
        <Route
          path="/calls"
          element={<ComingSoonPage label="Calls" />}
        />
        <Route
          path="/profile"
          element={<ComingSoonPage label="Profile" />}
        />
        <Route path="/originals/:id" element={<OriginalPage />} />
      </Routes>
    </BrowserRouter>
  );
}
