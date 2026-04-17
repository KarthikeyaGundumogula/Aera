/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./app/App";
import { MobileNavBar } from "./features/navigation/MobileNavBar";
import { ScrollToTop } from "./components/utils/ScrollToTop";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <MobileNavBar />
      <AppRoutes />
    </BrowserRouter>
  );
}
