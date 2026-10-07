import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Artist, ArtistRole } from '../types';
import { getSongsForArtist } from '../utils/devotionalPlaylists';
import { Mic2, Music, ArrowRight, Play, ListMusic } from 'lucide-react';

export const ArtistShowcase: React.FC = () => {
  const { artists, songs, openArtist, playSong, showToast, language, t } = useApp();
  const [roleFilter, setRoleFilter] = useState<'ALL' | ArtistRole>('ALL');

  // Precompute songs for each artist
  const artistSongsMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const artist of artists) {
      const list = getSongsForArtist(artist, songs);
      map.set(artist.id, list.length);
    }
    return map;
  }, [artists, songs]);

  const filteredArtists = artists.filter(a => {
    if (roleFilter === 'ALL') return true;
    return a.role === roleFilter;
  });

  const getRoleLabel = (role: ArtistRole) => {
    if (language === 'ta') {
      switch (role) {
        case 'SINGER': return 'புகழ்பெற்ற பாடகர்';
        case 'COMPOSER': return 'இசையமைப்பாளர்';
        case 'LYRICIST': return 'பாடலாசிரியர்';
        case 'MUSIC_DIRECTOR': return 'இசை தயாரிப்பாளர்';
      }
    }
    switch (role) {
      case 'SINGER': return 'Master Vocalist';
      case 'COMPOSER': return 'Raga Composer';
      case 'LYRICIST': return 'Vedic Lyricist';
      case 'MUSIC_DIRECTOR': return 'Sound Producer';
    }
  };

  const getTabRoleLabel = (role: 'ALL' | ArtistRole) => {
    if (language === 'ta') {
      switch (role) {
        case 'ALL': return 'அனைத்து கலைஞர்கள்';
        case 'SINGER': return 'பாடகர்கள்';
        case 'COMPOSER': return 'இசையமைப்பாளர்கள்';
        case 'LYRICIST': return 'பாடலாசிரியர்கள்';
        case 'MUSIC_DIRECTOR': return 'தயாரிப்பாளர்கள்';
      }
    }
    switch (role) {
      case 'ALL': return 'All Maestros';
      case 'SINGER': return 'Singers';
      case 'COMPOSER': return 'Composers';
      case 'LYRICIST': return 'Lyricists';
      case 'MUSIC_DIRECTOR': return 'Directors';
    }
  };

  const handleQuickPlayArtist = (artist: Artist, e: React.MouseEvent) => {
    e.stopPropagation();
    const artistSongs = getSongsForArtist(artist, songs);
    if (artistSongs.length > 0) {
      playSong(artistSongs[0]);
      showToast(`▶ Playing ${artist.name} Playlist (1/${artistSongs.length}: ${artistSongs[0].title})`, 'success');
    } else {
      openArtist(artist);
    }
  };

  return (
    <section id="artists-showcase-section" className="py-20 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 w-full max-w-[2000px] mx-auto space-y-10">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181109] border border-[#FFDE00]/30 text-[#FFDE00] text-xs font-semibold uppercase tracking-widest mb-3">
            <Mic2 className="w-3.5 h-3.5 text-[#FFDE00]" />
            <span>{t('artists.badge', 'MAESTROS OF SACRED BHAKTI')}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight font-cinzel">
            {language === 'ta' ? 'பக்தி குரல்கள் - மேஸ்ட்ரோக்கள்' : 'Voices of Devotion'}
          </h2>
          <p className="text-base text-[#C0B8B0] mt-2 max-w-2xl leading-relaxed">
            {t('artists.subtitle', 'Immortal vocalists who brought Tamil divine music to millions of hearts under Subam Audio Vision’s iconic production.')}
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 bg-[#140F0A] p-1.5 rounded-xl border border-[#FFDE00]/20 self-start md:self-auto overflow-x-auto">
          {(['ALL', 'SINGER', 'COMPOSER', 'LYRICIST', 'MUSIC_DIRECTOR'] as const).map((role) => (
            <button
              key={role}
              id={`artist-role-tab-${role.toLowerCase()}`}
              onClick={() => setRoleFilter(role as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                roleFilter === role
                  ? 'bg-gradient-to-r from-[#FFDE00] to-[#E58A32] text-[#0A0806] font-extrabold shadow-[0_0_15px_rgba(255,222,0,0.3)]'
                  : 'text-[#A0988E] hover:text-white hover:bg-white/5'
              }`}
            >
              {getTabRoleLabel(role)}
            </button>
          ))}
        </div>
      </div>

      {/* Artist Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {filteredArtists.map((artist) => {
          const count = artistSongsMap.get(artist.id) || artist.songCount;

          return (
            <div
              key={artist.id}
              id={`artist-card-${artist.id}`}
              onClick={() => openArtist(artist)}
              className="group relative rounded-2xl bg-[#140F0B] border border-white/10 hover:border-[#FFDE00]/70 p-4 transition-all duration-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.85),0_0_25px_rgba(255,222,0,0.2)] flex flex-col justify-between cursor-pointer"
            >
              {/* Portrait Image Container */}
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-black/60 shadow-md">
                <img
                  src={artist.photoUrl}
                  alt={artist.name}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/singer_male.jpg'; }}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0905] via-transparent to-transparent"></div>

                {/* Role Badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2.5 py-1 rounded-md bg-[#0A0704]/90 backdrop-blur-md border border-[#FFDE00]/35 text-[10px] font-semibold text-[#FFDE00]">
                    {getRoleLabel(artist.role)}
                  </span>
                </div>

                {/* Works Count Badge */}
                <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-[#FFDE00] border border-[#FFDE00]/30 shadow-sm flex items-center gap-1">
                  <Music className="w-2.5 h-2.5" />
                  <span>{count} {language === 'ta' ? 'பாடல்கள்' : 'Tracks'}</span>
                </div>
              </div>

              {/* Content Info */}
              <div className="mt-4 space-y-1.5">
                <h3 className="text-base font-bold text-white group-hover:text-[#FFDE00] transition-colors line-clamp-1">
                  {artist.name}
                </h3>
                
                {artist.famousFor && (
                  <p className="text-xs text-[#FFDE00]/90 line-clamp-1 font-medium">
                    {artist.famousFor}
                  </p>
                )}

                <p className="text-xs text-[#A0988E] line-clamp-2 leading-relaxed">
                  {artist.bio}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  onClick={(e) => handleQuickPlayArtist(artist, e)}
                  className="py-1.5 px-3 rounded-lg bg-[#22160C] hover:bg-[#FFDE00] text-[#FFDE00] hover:text-black text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-[#FFDE00]/30"
                  title="Play All Songs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{language === 'ta' ? 'இயக்கு' : 'Play'}</span>
                </button>

                <div className="flex items-center gap-1 text-xs font-semibold text-[#FFDE00] group-hover:underline">
                  <ListMusic className="w-3.5 h-3.5" />
                  <span>{language === 'ta' ? 'பாடல்கள்' : 'Playlist'}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};
