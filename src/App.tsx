import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from './lib/router';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import ContentLibrary from './pages/ContentLibrary';
import ContentDetail from './pages/ContentDetail';
import LyricBook from './pages/LyricBook';
import VisualizerStudio from './pages/VisualizerStudio';
import ContentKit from './pages/ContentKit';
import VektrLab from './pages/VektrLab';
import LinkVault from './pages/LinkVault';
import SovereignOnboarding from './pages/SovereignOnboarding';
import MobileStudio from './pages/MobileStudio';
import SamplerStudio from './pages/SamplerStudio';
import TunerStudio from './pages/TunerStudio';
import { ProfileProvider, useProfile } from './lib/ProfileContext';
import { useSEO } from './lib/useSEO';
function EntryGuard({ children }: { children: React.ReactNode }) {
  const { profile } = useProfile();
  if (!profile.initialized) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

export default function App() {
  useSEO('Independent Artist Studio', 'Your professional musician-first workspace. Transform tracks into 4K content with built-in mastering and distribution.');
  return (
    <ProfileProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<SovereignOnboarding />} />
          <Route element={<EntryGuard><Layout /></EntryGuard>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/library" element={<ContentLibrary />} />
            <Route path="/tracks" element={<Navigate to="/library" replace />} />
            <Route path="/library/:id" element={<ContentDetail />} />
            <Route path="/tracks/:id" element={<Navigate to="/library/:id" replace />} />
            <Route path="/lyrics" element={<LyricBook />} />
            <Route path="/visualizer" element={<VisualizerStudio />} />
            <Route path="/content" element={<ContentKit />} />
            <Route path="/vektr-lab" element={<VektrLab />} />
            <Route path="/links" element={<LinkVault />} />
            <Route path="/mobile" element={<MobileStudio />} />
            <Route path="/sampler" element={<SamplerStudio />} />
            <Route path="/tuner" element={<TunerStudio />} />
            <Route path="*" element={<div className="p-20 text-center font-bold text-[var(--color-text)]">404 Route Not Found</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProfileProvider>
  );
}
