import React from 'react';
import { useApp } from '../context/AppContext';
import { Playlist, Song } from '../types';
import { ListMusic, Play, Pause, Youtube, Music2, Volume2, Sparkles } from 'lucide-react';

export const PlaylistsSection: React.FC = () => {
  const { playlists, songs, currentTrack, isPlaying, playSong, togglePlay, openInYouTube, showToast } = useApp();

  // Helper to resolve songs belonging to a given playlist
  const getPlaylistSongs = (playlist: Playlist): Song[] => {
    const plId = playlist.id.toLowerCase();
    const plTitle = playlist.title.toLowerCase();
    const plCat = (playlist.category || '').toLowerCase();

    // 1. Sivan / Annamalaiyar Playlists
    if (plId.includes('sivan') || plTitle.includes('sivan') || plCat.includes('sivan')) {
      const matched = songs.filter(s => 
        s.deity === 'ANNAMALAIYAR_SIVAN' || 
        s.categoryId === 'annamalaiyar-sivan' || 
        s.categoryName?.toLowerCase().includes('sivan') ||
        s.albumCode === 'SAV ACD 107' ||
        s.albumCode === 'SAV ACD 118' ||
        s.albumCode === 'SAV ACD 123'
      );
      if (matched.length > 0) return matched;
    }

    // 2. Amman / Shakthi Friday Playlists
    if (plId.includes('amman') || plTitle.includes('amman') || plCat.includes('amman') || plTitle.includes('shobana')) {
      const matched = songs.filter(s => 
        s.deity === 'AMMAN_SHAKTHI' || 
        s.categoryId === 'amman-shakthi' || 
        s.categoryName?.toLowerCase().includes('amman') ||
        s.albumCode === 'SAV ACD 102' ||
        s.albumCode === 'SAV ACD 124' ||
        s.credits?.singer?.toLowerCase().includes('shobana')
      );
      if (matched.length > 0) return matched;
    }

    // 3. Murugan / Sashti Playlists
    if (plId.includes('murugan') || plTitle.includes('murugar') || plCat.includes('murugan')) {
      const matched = songs.filter(s => 
        s.deity === 'MURUGAN' || 
        s.categoryId === 'murugan-padalgal' || 
        s.categoryName?.toLowerCase().includes('murugan') ||
        s.albumCode === 'SAV ACD 115'
      );
      if (matched.length > 0) return matched;
    }

    // 4. Perumal / Venkateswara Playlists
    if (plId.includes('perumal') || plTitle.includes('perumal') || plCat.includes('perumal')) {
      const matched = songs.filter(s => 
        s.deity === 'PERUMAL_VENKATESWARA' || 
        s.categoryId === 'perumal-venkateswara' || 
        s.categoryName?.toLowerCase().includes('perumal') ||
        s.albumCode === 'SAV ACD 111'
      );
      if (matched.length > 0) return matched;
    }

    // 5. Category-based fallback
    const byCategory = songs.filter(s => 
      s.categoryName?.toLowerCase() === plCat ||
      s.categoryId?.toLowerCase() === plCat
    );
    if (byCategory.length > 0) return byCategory;

    // 6. Generic fallback
    return songs.slice(0, 15);
  };

  const handlePlaylistClick = (playlist: Playlist) => {
    const plTracks = getPlaylistSongs(playlist);
    if (plTracks.length === 0) return;

    // Check if current track is already from this playlist
    const isCurrentInPlaylist = currentTrack && plTracks.some(t => t.id === currentTrack.id);

    if (isCurrentInPlaylist) {
      // Toggle play/pause
      togglePlay();
    } else {
      // Start playing the first track of this playlist immediately with instant bufferless local audio
      const firstTrack = plTracks[0];
      playSong(firstTrack);
      showToast(`Playing ${playlist.title} (${plTracks.length} Sacred Tracks)`, 'success');
    }
  };

  return (
    <section id="playlists-section" className="py-16 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[2000px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A140B] border border-[#D4AF37]/30 text-[#F0C75E] text-xs font-semibold uppercase tracking-widest mb-3">
            <ListMusic className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Curated Devotional Anthologies</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-cinzel text-white">
            Sacred Playlists & Jukeboxes
          </h2>
          <p className="text-sm text-[#A89F95] mt-1.5 max-w-xl">
            Non-stop temple sets, Girivalam walks, and special festival albums carefully sequenced for deep spiritual immersion. Instant playback with zero buffering.
          </p>
        </div>
      </div>

      {/* Grid of Playlists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {playlists.map((playlist: Playlist) => {
          const plTracks = getPlaylistSongs(playlist);
          const isCurrentPlaylist = currentTrack && plTracks.some(t => t.id === currentTrack.id);
          const isCurrentPlaying = isCurrentPlaylist && isPlaying;

          return (
            <div
              key={playlist.id}
              className={`group rounded-2xl overflow-hidden bg-[#120E0A] border transition-all flex flex-col p-4 shadow-lg ${
                isCurrentPlaying 
                  ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/40 bg-[#1A140C]' 
                  : 'border-white/5 hover:border-[#D4AF37]/40 hover:bg-[#18130E]'
              }`}
            >
              {/* Cover art with play overlay */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-black mb-4">
                <img
                  src={playlist.thumbnailUrl}
                  alt={playlist.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/Subam%20logo.png';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Status overlay banner if playing */}
                {isCurrentPlaying && (
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-[#D4AF37] text-black text-[11px] font-bold flex items-center gap-1.5 shadow-lg animate-pulse">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Now Playing</span>
                  </div>
                )}

                {/* Interactive Play / Pause Overlay Button */}
                <div className={`absolute inset-0 bg-black/45 transition-opacity flex items-center justify-center ${
                  isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <button
                    onClick={() => handlePlaylistClick(playlist)}
                    className="w-14 h-14 rounded-full bg-[#D4AF37] text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform"
                    aria-label={isCurrentPlaying ? "Pause playlist" : "Play playlist"}
                  >
                    {isCurrentPlaying ? (
                      <Pause className="w-6 h-6 fill-black" />
                    ) : (
                      <Play className="w-6 h-6 fill-black ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Songs count badge */}
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-sm text-white text-[11px] font-medium flex items-center gap-1.5 border border-white/10">
                  <Music2 className="w-3 h-3 text-[#D4AF37]" />
                  <span>{plTracks.length} Studio Tracks</span>
                </div>
              </div>

              {/* Playlist Info */}
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{playlist.category || 'Curated Devotional'}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#F0C75E] transition-colors line-clamp-1">
                    {playlist.title}
                  </h3>
                  {playlist.tamilTitle && (
                    <p className="text-xs text-[#C5BAAF] mt-0.5 font-medium line-clamp-1">
                      {playlist.tamilTitle}
                    </p>
                  )}
                  <p className="text-xs text-[#9E958B] mt-1.5 line-clamp-2 leading-relaxed">
                    {playlist.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => handlePlaylistClick(playlist)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      isCurrentPlaying 
                        ? 'bg-[#D4AF37] text-black shadow-md' 
                        : 'bg-white/5 text-[#F0C75E] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30'
                    }`}
                  >
                    {isCurrentPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Playlist</span>
                      </>
                    )}
                  </button>

                  {playlist.youtubePlaylistUrl && (
                    <button
                      onClick={() => openInYouTube(playlist.youtubePlaylistUrl)}
                      className="text-[#FF5555] hover:text-[#FF7777] flex items-center gap-1 font-semibold px-2 py-1 rounded hover:bg-white/5 transition-colors"
                      title="Open full video playlist on YouTube"
                    >
                      <Youtube className="w-4 h-4 fill-[#FF5555]" />
                      <span>YouTube</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
