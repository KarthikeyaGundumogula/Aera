/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { ScreenPage } from "./pages/ScreenPage";
import { ComingSoonPage } from "./pages/ComingSoonPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/screens"
          element={<ComingSoonPage label="Screens" description="We’re shaping the dedicated screens experience next. For now, this page is a placeholder while we finish the mobile UI." />}
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
        <Route path="/screens/:id" element={<ScreenPage />} />
      </Routes>
    </BrowserRouter>
  );
}
