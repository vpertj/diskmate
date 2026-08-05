import { Routes, Route } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import { CacheCleanerPage } from "./components/cache-cleaner/CacheCleanerPage";
import { LargeFilesPage } from "./components/large-files/LargeFilesPage";
import { DuplicateFinderPage } from "./components/duplicate-finder/DuplicateFinderPage";
import { AppUninstallerPage } from "./components/app-uninstaller/AppUninstallerPage";
import { TrashCleanerPage } from "./components/trash-cleaner/TrashCleanerPage";
import { DiskVisualizerPage } from "./components/disk-visualizer/DiskVisualizerPage";

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/cache" element={<CacheCleanerPage />} />
        <Route path="/large-files" element={<LargeFilesPage />} />
        <Route path="/duplicates" element={<DuplicateFinderPage />} />
        <Route path="/uninstaller" element={<AppUninstallerPage />} />
        <Route path="/trash" element={<TrashCleanerPage />} />
        <Route path="/visualizer" element={<DiskVisualizerPage />} />
      </Route>
    </Routes>
  );
}

export default App;
