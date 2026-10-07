import React from 'react';
import { useApp } from '../context/AppContext';
import { Youtube, Flame, ExternalLink, Play } from 'lucide-react';
import { SubamLogo } from './SubamLogo';

export const SubamBannerShowcase: React.FC = () => {
  const { siteSettings, openInYouTube, songs, playSong, t, language } = useApp();

  const handlePlaySpecial = () => {
    const special = songs.find(s => s.featured || s.isSlotBox) || songs[0];
    if (special) playSong(special);
  };

  return (
    <section id="subam-banner-showcase" className="pt-3 pb-6 px-3 sm:px-6 md:px-8 lg:px-10 max-w-[2000px] mx-auto">
      {/* Official Panoramic Banner Card */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#FFDE00]/40 bg-[#0E0B07] shadow-[0_12px_40px_rgba(0,0,0,0.85)] group">
        
        {/* Banner Graphic Image Holder - Placed from top to bottom so top text is completely visible */}
        <div className="relative w-full aspect-[1376/768] bg-black overflow-hidden flex items-start justify-center">
          <img
            src="/Subam%20banner.png"
            alt="Subam Audio Vision Official Devotional Banner"
            className="w-full h-full object-contain sm:object-cover object-top block transition-transform duration-700 group-hover:scale-[1.01]"
          />
        </div>

        {/* Clean, Non-Obstructive Bar below the banner for Quick Actions & Studio Credential */}
        <div className="border-t border-[#FFDE00]/25 bg-[#120D06] px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SubamLogo size="sm" withBorder={true} />
            <div>
              <h3 className="text-sm sm:text-base font-bold font-cinzel text-white flex items-center gap-2">
                <span>{language === 'ta' ? 'சுபம் ஆடியோ விஷன் • திருவண்ணாமலை' : `${siteSettings.brandName} • Tiruvannamalai`}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFDE00]/15 border border-[#FFDE00]/30 text-[#FFDE00] text-[10px] font-black uppercase tracking-wider">
                  <Flame className="w-3 h-3 text-[#E52020]" />
                  <span>{t('banner.badge', 'Official Master Vault')}</span>
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-[#C2B7AC] font-medium flex items-center gap-2 mt-0.5">
                <span className="text-[#FFDE00]">{t('banner.established', 'Est. 1997')}</span>
                <span>•</span>
                <span>{t('banner.masterTracks', '1,200+ Master Tracks')}</span>
                <span>•</span>
                <span className="text-[#E8E8E8]">{t('banner.devoteesCount', '600K+ Devotees Worldwide')}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <button
              onClick={handlePlaySpecial}
              className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-[#FFDE00] to-[#FF9900] text-black font-extrabold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-md shadow-[#FFDE00]/20 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>{t('banner.playTrack', 'Play Master Track')}</span>
            </button>

            <button
              onClick={() => openInYouTube()}
              className="px-4 sm:px-5 py-2 rounded-xl bg-[#E52020] hover:bg-[#ff2b2b] text-white font-extrabold text-xs sm:text-sm active:scale-95 transition-all flex items-center gap-2 shadow-md shadow-[#E52020]/25 cursor-pointer"
            >
              <Youtube className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">{t('banner.watchYoutube', 'Watch on YouTube')}</span>
              <span className="sm:hidden">YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
