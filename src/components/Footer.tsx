import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Youtube, Instagram, Music2, Mail, ShieldCheck, Heart, ArrowRight, Flame } from 'lucide-react';

export const Footer: React.FC = () => {
  const { siteSettings, categories, setSelectedCategory, setCurrentView, showToast } = useApp();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Please provide a valid email', 'error');
      return;
    }
    showToast('Subscribed to Sacred Release Alerts ✨', 'success');
    setNewsletterEmail('');
  };

  const handleCategoryNav = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentView('music');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-[#0A0704] border-t border-[#FFDE00]/25 pt-16 pb-28 sm:pb-24 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 text-[#B8B0A8] text-xs">
      <div className="w-full max-w-[2000px] mx-auto space-y-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Col 1 & 2: Brand Info & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-[#E52020] bg-[#FFDE00] flex-shrink-0 shadow-[0_0_15px_rgba(255,222,0,0.3)] flex items-center justify-center p-1">
                <img
                  src="/Subam logo.png"
                  alt="Subam Audio Vision"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/Subam%20logo.png'; }}
                  className="w-full h-full object-contain max-w-full max-h-full block select-none"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-cinzel text-white tracking-wider">
                  {siteSettings.brandName}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#FFDE00] font-sans font-bold">
                  Tiruvannamalai • Est. 1997
                </span>
              </div>
            </div>

            <p className="text-sm text-[#A0988E] leading-relaxed max-w-sm">
              Subam Audio Vision (Est. 1997, Tiruvannamalai) — The official digital sanctuary for timeless South Indian devotional classics, Tiruvannamalai Girivalam recordings, and lossless audio masters.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2 space-y-2 max-w-sm">
              <span className="text-xs font-bold text-white block">Receive Sacred Releases & Aarti Notifications</span>
              <form onSubmit={handleSubscribeNewsletter} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#140F0A] border border-[#FFDE00]/25 text-xs text-white placeholder-[#888888] outline-none focus:border-[#FFDE00]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFDE00] to-[#E58A32] text-black font-extrabold text-xs transition-colors flex items-center gap-1 shadow-md cursor-pointer hover:brightness-110"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold text-[#FFDE00] tracking-wider">Discography</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => { setSelectedCategory('all'); setCurrentView('music'); }} className="hover:text-[#FFDE00] transition-colors cursor-pointer">
                  All Sacred Compositions
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('jukebox')} className="hover:text-[#FFDE00] transition-colors cursor-pointer">
                  Sacred Devotional Jukeboxes
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('live')} className="hover:text-[#FFDE00] transition-colors cursor-pointer">
                  Sacred Live Temple Darshan
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('artists')} className="hover:text-[#FFDE00] transition-colors cursor-pointer">
                  Maestros & Vocalists
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('gods')} className="hover:text-[#FFDE00] transition-colors cursor-pointer">
                  18 Gods Darshan & Mantras
                </button>
              </li>
              <li>
                <button onClick={() => window.open(siteSettings.youtubeChannelUrl || "https://youtube.com/@subamaudiovision?si=dIQ6TPxVa1LcycQb", "_blank")} className="hover:text-[#FFDE00] transition-colors cursor-pointer flex items-center gap-1">
                  <span>Official YouTube Channel</span>
                  <Youtube className="w-3.5 h-3.5 text-[#E52020]" />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Categories */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold text-[#FFDE00] tracking-wider">Sacred Deities</h4>
            <ul className="space-y-2">
              {categories.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <button onClick={() => handleCategoryNav(cat.id)} className="hover:text-[#FFDE00] transition-colors cursor-pointer">
                    {cat.name} Padalgal
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Trust & Standards */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold text-[#FFDE00] tracking-wider">Audio Quality & Devotion</h4>
            <div className="space-y-2.5 text-xs text-[#A0988E]">
              <div className="flex items-center gap-2">
                <span className="text-[#FFDE00]">✦</span>
                <span>24-bit / 96kHz Lossless Studio Master</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#FFDE00]">✦</span>
                <span>432Hz Solfeggio Harmonic Tuning</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#FFDE00]">✦</span>
                <span>Official YouTube Music Streams</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#FFDE00]">✦</span>
                <span>Direct Artist Patronage</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright and Social Links */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#807870] text-center sm:text-left">
            © {new Date().getFullYear()} {siteSettings.brandName} Records. All rights reserved. Crafted for spiritual elevation.
          </p>

          <div className="flex items-center gap-4 text-[#A0988E]">
            <a href={siteSettings.youtubeChannelUrl || "https://youtube.com/@subamaudiovision?si=dIQ6TPxVa1LcycQb"} target="_blank" rel="noopener noreferrer" className="hover:text-[#E52020] transition-colors" title="Subam Audio Vision YouTube Channel">
              <Youtube className="w-5 h-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://spotify.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#008751] transition-colors">
              <Music2 className="w-5 h-5" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
