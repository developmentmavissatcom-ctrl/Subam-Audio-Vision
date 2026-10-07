import React from 'react';
import { Youtube, Bell, Users, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const YouTubeCta: React.FC = () => {
  const { siteSettings } = useApp();
  const channelUrl = siteSettings.youtubeChannelUrl || "https://youtube.com/@subamaudiovision?si=dIQ6TPxVa1LcycQb";

  return (
    <section className="py-16 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 w-full max-w-[2000px] mx-auto">
      <div className="relative rounded-3xl bg-gradient-to-r from-[#141414] via-[#1A1111] to-[#141414] border border-[#D4AF37]/30 p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl">
        
        {/* Subtle Background Glow */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-[#E52020] bg-[#FFDE00] flex-shrink-0 shadow-md flex items-center justify-center p-1">
                <img
                  src="/Subam logo.png"
                  alt="Subam Audio Vision"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/Subam%20logo.png'; }}
                  className="w-full h-full object-contain max-w-full max-h-full block select-none"
                />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>Official Subam Audio Vision Channel</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight font-cinzel">
              Join Over 600,000+ Devotees on YouTube
            </h2>

            <p className="text-base text-[#A8A8A8] leading-relaxed">
              Subscribe to @subamaudiovision for daily Tiruvannamalai Girivalam broadcasts, Friday Aadi Velli Amman specials, and evergreen Sivan & Ayyappan devotional hits.
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#CCCCCC]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D4AF37]" />
                <span><strong>600,000+</strong> Subscribers</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-400" />
                <span>1,300+ Devotional Videos</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            <a
              id="youtube-subscribe-cta-btn"
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-4 px-8 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(239,68,68,0.4)] cursor-pointer"
            >
              <Youtube className="w-5 h-5 fill-current" />
              <span>Subscribe on YouTube</span>
              <ExternalLink className="w-4 h-4 text-white/70" />
            </a>

            <p className="text-center text-[11px] text-[#777777]">
              Free access to all live streams, jukeboxes & premieres
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
