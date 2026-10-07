import React, { useState, useEffect } from 'react';
import { useApp, AppView } from '../context/AppContext';
import { 
  Search, 
  Radio, 
  Home, 
  Menu, 
  X, 
  Mic2, 
  Info,
  Flame,
  Youtube,
  Disc3,
  Languages
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    siteSettings, 
    currentView, 
    setCurrentView, 
    setIsSearchOpen, 
    openInYouTube,
    youtubeStreams,
    language,
    setLanguage,
    t
  } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const hasLiveStream = youtubeStreams.some(s => s.status === 'LIVE');

  const handleNavClick = (id: AppView) => {
    setCurrentView(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t('nav.home', 'Home'), icon: <Home className="w-4 h-4" /> },
    { id: 'gods', label: t('nav.gods', '18 Gods & Songs'), icon: <Flame className="w-4 h-4 text-[#FFDE00]" /> },
    { id: 'artists', label: t('nav.artists', 'Voices of Devotion'), icon: <Mic2 className="w-4 h-4 text-[#FFDE00]" /> },
    { id: 'live', label: t('nav.live', 'Live Darshan'), icon: <Radio className="w-4 h-4 text-[#E52020]" /> },
    { id: 'jukebox', label: t('nav.jukebox', 'Sacred Jukebox'), icon: <Disc3 className="w-4 h-4 text-[#FFDE00]" /> },
    { id: 'about', label: t('nav.about', 'About Subam'), icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Announcement Bar matching Subam signature Gold / Red / Green theme */}
      {siteSettings.announcementText && (
        <div id="announcement-bar" className="bg-gradient-to-r from-[#1A0B08] via-[#2A1504] to-[#1A0B08] border-b border-[#FFDE00]/25 py-2 px-4 text-center text-xs font-semibold text-[#FFDE00] flex items-center justify-center gap-3 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-[#E52020] animate-ping inline-block shadow-[0_0_8px_#E52020]"></span>
          <span className="tracking-wide">{t('nav.announcement', siteSettings.announcementText)}</span>
          <span className="hidden md:inline-block bg-[#008751]/30 text-[#4ADE80] border border-[#008751]/50 text-[10px] uppercase px-2 py-0.5 rounded-full font-bold tracking-wider">
            {t('nav.officialChannel', 'Official Channel')}
          </span>
        </div>
      )}

      {/* Main Sticky Navbar */}
      <header
        id="main-header"
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'glass-nav py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.8)] border-b border-[#FFDE00]/20'
            : 'bg-gradient-to-b from-[#0A0806]/95 via-[#0A0806]/80 to-transparent py-3.5'
        }`}
      >
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 flex items-center justify-between">
          
          {/* Official Brand Logo */}
          <div 
            id="brand-logo"
            onClick={() => setCurrentView('home')} 
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden ring-2 ring-[#E52020] shadow-[0_0_20px_rgba(229,32,32,0.4)] group-hover:scale-105 group-hover:ring-[#FFDE00] transition-all bg-[#FFDE00] flex-shrink-0 flex items-center justify-center p-1 sm:p-1.5">
              <img
                src="/Subam logo.png"
                alt="Subam Audio Vision"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/Subam%20logo.png'; }}
                className="w-full h-full object-contain max-w-full max-h-full block select-none"
              />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-cinzel font-black tracking-[0.16em] text-white text-base sm:text-xl group-hover:text-[#FFDE00] transition-colors drop-shadow-sm">
                  SUBAM AUDIO
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#FFDE00] bg-[#E52020] px-2 py-0.5 rounded font-sans font-extrabold shadow-sm">
                  ORIGINALS
                </span>
              </div>
              <span className="text-[10px] tracking-widest uppercase text-[#00E575] font-sans font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#008751]"></span>
                {t('nav.tagline', 'Sacred Music & Vision • Est. 1997')}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav id="desktop-nav" className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              const isLiveTab = item.id === 'live';
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3.5 py-2 text-sm font-medium transition-all rounded-xl flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'text-[#FFDE00] font-bold bg-[#FFDE00]/10 border border-[#FFDE00]/30 shadow-[0_0_15px_rgba(255,222,0,0.15)]'
                      : 'text-[#C8C8C8] hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span>{item.label}</span>
                  {isLiveTab && hasLiveStream && (
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E52020] opacity-90"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E52020]"></span>
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute -bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-[#FFDE00] via-[#E52020] to-[#FFDE00] rounded-full shadow-[0_0_8px_rgba(255,222,0,0.9)]"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: Language Switcher, Search, YouTube Official Channel */}
          <div id="navbar-actions" className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Switcher Pill (English / தமிழ்) */}
            <div 
              id="language-switcher"
              className="flex items-center p-0.5 rounded-xl bg-[#140F0A] border border-[#FFDE00]/30 shadow-inner"
              title={language === 'en' ? 'தமிழுக்கு மாற்றவும் (Switch to Tamil)' : 'Switch to English'}
            >
              <div className="flex items-center gap-1 px-1.5 py-0.5 text-[#FFDE00] opacity-80 hidden xl:flex">
                <Languages className="w-3.5 h-3.5" />
              </div>
              <button
                id="lang-btn-en"
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer font-sans ${
                  language === 'en'
                    ? 'bg-gradient-to-r from-[#FFDE00] to-[#FF9900] text-black font-extrabold shadow-sm'
                    : 'text-[#C0B7AE] hover:text-white font-medium'
                }`}
              >
                ENG
              </button>
              <button
                id="lang-btn-ta"
                type="button"
                onClick={() => setLanguage('ta')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer font-sans ${
                  language === 'ta'
                    ? 'bg-gradient-to-r from-[#FFDE00] to-[#FF9900] text-black font-extrabold shadow-sm'
                    : 'text-[#C0B7AE] hover:text-white font-medium'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* Global Search Trigger */}
            <button
              id="search-trigger-btn"
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 rounded-xl text-[#C0C0C0] hover:text-white bg-[#18130E] hover:bg-[#251B12] border border-[#FFDE00]/25 hover:border-[#FFDE00] transition-all flex items-center gap-2 group cursor-pointer"
              title={t('nav.searchTitle', 'Search music, artists, lyrics (Cmd+K)')}
            >
              <Search className="w-4 h-4 text-[#FFDE00] group-hover:scale-110 transition-transform" />
              <span className="hidden lg:inline text-xs text-[#A0A0A0]">{t('nav.search', 'Search...')}</span>
              <kbd className="hidden lg:inline text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[#888888]">⌘K</kbd>
            </button>

            {/* YouTube Official Channel Button */}
            <button
              id="youtube-channel-nav-btn"
              onClick={() => openInYouTube()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E52020] hover:bg-red-700 text-white font-bold text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(229,32,32,0.4)] cursor-pointer group"
              title="Visit Subam Audio Vision Official YouTube Channel (597K+ Subscribers)"
            >
              <Youtube className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">{t('nav.youtube', 'YOUTUBE')}</span>
              <span className="hidden lg:inline text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-mono font-normal">
                597K+
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl text-[#FFDE00] bg-[#18130E] border border-[#FFDE00]/30 hover:bg-[#251B12] md:hidden cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div 
            id="mobile-nav-menu" 
            className="md:hidden bg-[#100C09]/98 border-b border-[#FFDE00]/25 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4"
          >
            {/* Mobile Language Switcher Bar */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 px-1">
              <span className="text-xs text-[#FFDE00] font-bold flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-[#FFDE00]" />
                <span>{t('nav.languageSwitch', 'Language')}</span>
              </span>
              <div className="flex items-center p-0.5 rounded-lg bg-[#18110A] border border-[#FFDE00]/30">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 text-xs rounded font-bold cursor-pointer transition-all ${
                    language === 'en' ? 'bg-[#FFDE00] text-black shadow' : 'text-[#A0988E]'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('ta')}
                  className={`px-3 py-1 text-xs rounded font-bold cursor-pointer transition-all ${
                    language === 'ta' ? 'bg-[#FFDE00] text-black shadow' : 'text-[#A0988E]'
                  }`}
                >
                  தமிழ்
                </button>
              </div>
            </div>

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  handleNavClick(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between font-medium text-sm cursor-pointer ${
                  currentView === item.id
                    ? 'bg-[#FFDE00] text-[#0A0806] font-bold shadow-lg'
                    : 'text-[#D0D0D0] hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.id === 'live' && hasLiveStream && (
                  <span className="px-2 py-0.5 text-[10px] bg-[#E52020] text-white font-bold rounded-full animate-pulse">
                    LIVE
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </header>
    </>
  );
};
