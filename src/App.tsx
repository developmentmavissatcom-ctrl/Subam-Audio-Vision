/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { SacredGodsGallery } from './components/SacredGodsGallery';
import { SacredJukeboxSection } from './components/SacredJukeboxSection';
import { LiveDarshanSection } from './components/LiveDarshanSection';
import { CategorySection } from './components/CategorySection';
import { ArtistShowcase } from './components/ArtistShowcase';
import { AboutBrand } from './components/AboutBrand';
import { SubamBannerShowcase } from './components/SubamBannerShowcase';
import { Footer } from './components/Footer';
import { MusicPlayer } from './components/MusicPlayer';
import { ExpandedPlayer } from './components/ExpandedPlayer';
import { LyricsModal } from './components/LyricsModal';
import { ArtistModal } from './components/ArtistModal';
import { YouTubeModal } from './components/YouTubeModal';
import { CheckoutModal } from './components/CheckoutModal';
import { UserAccount } from './components/UserAccount';
import { AdminDashboard } from './components/AdminDashboard';
import { SearchModal } from './components/SearchModal';
import { Toast } from './components/Toast';

const MainContent: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="min-h-screen bg-[#070707] text-[#E8E8E8] flex flex-col selection:bg-[#D4AF37] selection:text-black">
      {/* Top Navigation & Announcement Banner */}
      <Navbar />

      {/* Main Dynamic View Routing */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <SubamBannerShowcase />
            <SacredGodsGallery />
            <ArtistShowcase />
            <LiveDarshanSection />
            <SacredJukeboxSection />
            <AboutBrand />
          </>
        )}

        {(currentView === 'gods' || currentView === 'music' || currentView === 'slots') && (
          <div className="pt-6 pb-12">
            <SacredGodsGallery />
          </div>
        )}

        {currentView === 'lyrics' && (
          <div className="pt-6 pb-12">
            <CategorySection />
          </div>
        )}

        {currentView === 'jukebox' && (
          <div className="pt-6 pb-12">
            <SacredJukeboxSection />
          </div>
        )}

        {currentView === 'live' && (
          <div className="pt-6 pb-12">
            <LiveDarshanSection />
          </div>
        )}

        {currentView === 'artists' && (
          <div className="pt-6 pb-12">
            <ArtistShowcase />
          </div>
        )}

        {currentView === 'about' && (
          <div className="pt-6 pb-12">
            <AboutBrand />
          </div>
        )}

        {currentView === 'account' && (
          <div className="pt-6 pb-12">
            <UserAccount />
          </div>
        )}

        {currentView === 'admin' && (
          <div className="pt-6 pb-12">
            <AdminDashboard />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Persistent Bottom Music Player */}
      <MusicPlayer />

      {/* Global Interactive Overlays & Modals */}
      <ExpandedPlayer />
      <LyricsModal />
      <ArtistModal />
      <YouTubeModal />
      <CheckoutModal />
      <SearchModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
