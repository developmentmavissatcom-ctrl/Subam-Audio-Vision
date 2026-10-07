import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getSongsForArtist } from '../utils/devotionalPlaylists';
import { Song } from '../types';
import { 
  X, 
  Play, 
  Pause, 
  Music, 
  Mic2, 
  Search, 
  Youtube, 
  Clock, 
  FileText, 
  ListMusic, 
  Radio, 
  Share2 
} from 'lucide-react';

export const ArtistModal: React.FC = () => {
  const { 
    activeArtistModal, 
    closeArtist, 
    songs, 
    playSong, 
    pauseSong, 
    currentTrack, 
    isPlaying, 
    openInYouTube,
    openLyricsModal,
    showToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  const artist = activeArtistModal;

  // Retrieve and sort all songs for this artist
  const allArtistSongs = useMemo(() => {
    if (!artist) return [];
    return getSongsForArtist(artist, songs);
  }, [artist, songs]);

  // Extract unique categories / deities for filter tabs
  const categoryTabs = useMemo(() => {
    if (!allArtistSongs.length) return [];
    const set = new Set<string>();
    allArtistSongs.forEach(s => {
      if (s.categoryName) set.add(s.categoryName);
      else if (s.deity) set.add(s.deity.replace('_', ' '));
    });
    return Array.from(set);
  }, [allArtistSongs]);

  // Filter songs based on search and category
  const filteredSongs = useMemo(() => {
    return allArtistSongs.filter(s => {
      if (selectedCategoryFilter !== 'ALL') {
        const cat = (s.categoryName || '').toLowerCase();
        const deity = (s.deity || '').toLowerCase();
        const filter = selectedCategoryFilter.toLowerCase();
        if (!cat.includes(filter) && !deity.includes(filter)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = (s.title || '').toLowerCase().includes(q);
        const inTamil = (s.tamilTitle || '').toLowerCase().includes(q);
        const inCat = (s.categoryName || '').toLowerCase().includes(q);
        const inRaga = (s.raga || '').toLowerCase().includes(q);
        return inTitle || inTamil || inCat || inRaga;
      }

      return true;
    });
  }, [allArtistSongs, selectedCategoryFilter, searchQuery]);

  if (!artist) return null;

  // Play full artist playlist from track 1
  const handlePlayAll = () => {
    if (filteredSongs.length > 0) {
      playSong(filteredSongs[0]);
      showToast(`▶ Playing ${artist.name} Playlist (1/${filteredSongs.length}: ${filteredSongs[0].title})`, 'success');
    }
  };

  // Toggle song playback
  const handleToggleSong = (song: Song, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentTrack?.id === song.id && isPlaying) {
      pauseSong();
    } else {
      playSong(song);
      showToast(`▶ Now Playing: ${song.title}`, 'info');
    }
  };

  return (
    <div
      id="artist-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={closeArtist}
    >
      <div
        id="artist-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-[#110C08] border-2 border-[#FFDE00]/40 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_60px_rgba(255,222,0,0.25)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Top Control Bar */}
        <div className="px-6 py-4 bg-[#0A0704] border-b border-[#FFDE00]/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Mic2 className="w-4 h-4 text-[#FFDE00]" />
            <span className="text-xs sm:text-sm font-bold text-[#FFDE00] uppercase tracking-wider font-cinzel">
              Voice of Devotion • {artist.name} ({allArtistSongs.length} Master Recordings)
            </span>
          </div>
          <button
            onClick={closeArtist}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#CCCCCC] hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* Artist Hero Header */}
          <div className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#1C140C] via-[#150F09] to-[#0D0805] border border-[#FFDE00]/30 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xl">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-[#FFDE00]/50 shadow-2xl shrink-0">
              <img
                src={artist.photoUrl}
                alt={artist.name}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/singer_male.jpg'; }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>

            <div className="text-center sm:text-left space-y-2 flex-1">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#FFDE00]/15 border border-[#FFDE00]/35 text-[#FFDE00] text-xs font-bold uppercase tracking-wider">
                <span>{artist.role}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white font-cinzel">
                {artist.name}
              </h2>

              {artist.famousFor && (
                <p className="text-xs sm:text-sm text-[#FFDE00] font-medium">
                  🌟 Renowned For: {artist.famousFor}
                </p>
              )}

              <p className="text-xs text-[#C0B8B0] leading-relaxed line-clamp-2">
                {artist.bio}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                <button
                  onClick={handlePlayAll}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFDE00] via-[#FACC15] to-[#E58A32] text-[#0A0806] font-extrabold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play All ({allArtistSongs.length} Songs)</span>
                </button>

                <button
                  onClick={() => openInYouTube(`https://www.youtube.com/results?search_query=Subam+Audio+Vision+${encodeURIComponent(artist.name)}`)}
                  className="px-4 py-2 rounded-xl bg-[#E52020] hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <Youtube className="w-3.5 h-3.5 fill-current" />
                  <span>Watch on YouTube</span>
                </button>
              </div>
            </div>
          </div>

          {/* Playlist Controls & Filters */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-[#FFDE00]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Singer Discography & Playlist
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFDE00]/20 text-[#FFDE00] font-mono font-bold">
                  {filteredSongs.length} Tracks
                </span>
              </div>

              {/* Search within Artist Songs */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#FFDE00]" />
                <input
                  type="text"
                  placeholder="Search tracks or raga..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-2 rounded-lg bg-[#18110A] border border-white/10 focus:border-[#FFDE00] text-xs text-white placeholder-[#888888] outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#888888] hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Category / Deity Filter Chips */}
            {categoryTabs.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedCategoryFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategoryFilter === 'ALL'
                      ? 'bg-[#FFDE00] text-black shadow-sm'
                      : 'bg-[#18110A] text-[#A0988E] hover:text-white border border-white/10'
                  }`}
                >
                  All Categories ({allArtistSongs.length})
                </button>
                {categoryTabs.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategoryFilter === cat
                        ? 'bg-[#FFDE00] text-black font-bold'
                        : 'bg-[#18110A] text-[#A0988E] hover:text-white border border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rearranged Tracklist */}
          <div className="space-y-2">
            {filteredSongs.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-[#18110A] border border-white/10 text-[#888888] text-sm">
                No songs found matching "{searchQuery}".
              </div>
            ) : (
              filteredSongs.map((song, idx) => {
                const isCurrent = currentTrack?.id === song.id;
                const isTrackPlaying = isCurrent && isPlaying;

                return (
                  <div
                    key={song.id}
                    onClick={() => handleToggleSong(song)}
                    className={`p-3 rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isCurrent
                        ? 'bg-[#22160C] border-2 border-[#FFDE00] shadow-[0_0_20px_rgba(255,222,0,0.25)]'
                        : 'bg-[#150F09] hover:bg-[#1C140D] border border-white/10 hover:border-[#FFDE00]/40'
                    }`}
                  >
                    {/* Left: Index & Artwork */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 text-center text-xs font-mono font-bold shrink-0 ${isCurrent ? 'text-[#FFDE00]' : 'text-[#666666]'}`}>
                        {isTrackPlaying ? (
                          <span className="flex items-end justify-center gap-0.5 h-4 w-4 mx-auto">
                            <span className="w-1 bg-[#FFDE00] h-4 animate-pulse"></span>
                            <span className="w-1 bg-[#FFDE00] h-2 animate-pulse delay-75"></span>
                            <span className="w-1 bg-[#FFDE00] h-3 animate-pulse delay-150"></span>
                          </span>
                        ) : (
                          idx + 1
                        )}
                      </span>

                      <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 border border-white/10">
                        <img
                          src={song.coverImage || artist.photoUrl}
                          alt={song.title}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = artist.photoUrl; }}
                          className="w-full h-full object-cover"
                        />
                        {isCurrent && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            {isTrackPlaying ? (
                              <Pause className="w-4 h-4 text-[#FFDE00] fill-[#FFDE00]" />
                            ) : (
                              <Play className="w-4 h-4 text-[#FFDE00] fill-[#FFDE00]" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Song Title & Metadata */}
                      <div className="min-w-0 space-y-0.5">
                        <h4 className={`text-sm font-bold truncate ${isCurrent ? 'text-[#FFDE00]' : 'text-white'}`}>
                          {song.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#A0988E]">
                          {song.categoryName && (
                            <span className="px-1.5 py-0.2 rounded bg-black/60 text-[#FFDE00] text-[10px] font-medium border border-[#FFDE00]/20">
                              {song.categoryName}
                            </span>
                          )}
                          {song.raga && (
                            <span className="hidden sm:inline-block text-[#C0B8B0]">
                              • {song.raga}
                            </span>
                          )}
                          {song.tamilTitle && song.tamilTitle !== song.title && (
                            <span className="hidden md:inline-block text-[10px] text-[#807870] font-serif truncate">
                              {song.tamilTitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Duration & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-[#888888] font-mono hidden sm:inline-block">
                        {song.duration || '04:30'}
                      </span>

                      {/* Play / Pause Button */}
                      <button
                        onClick={(e) => handleToggleSong(song, e)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          isTrackPlaying
                            ? 'bg-[#FFDE00] text-black'
                            : 'bg-[#22170E] hover:bg-[#FFDE00] text-[#FFDE00] hover:text-black border border-[#FFDE00]/40'
                        }`}
                        title={isTrackPlaying ? 'Pause' : 'Play Track'}
                      >
                        {isTrackPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* YouTube Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (song.youtubeUrl) {
                            openInYouTube(song.youtubeUrl);
                          } else {
                            openInYouTube(`https://www.youtube.com/results?search_query=Subam+Audio+Vision+${encodeURIComponent(song.title)}`);
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-[#E52020]/20 hover:bg-[#E52020] text-[#E52020] hover:text-white border border-[#E52020]/40 transition-colors flex items-center justify-center cursor-pointer"
                        title="Watch on YouTube"
                      >
                        <Youtube className="w-4 h-4 fill-current" />
                      </button>

                      {/* Lyrics Button */}
                      {song.lyricsId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openLyricsModal(song);
                          }}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-[#CCCCCC] hover:text-white transition-colors flex items-center justify-center cursor-pointer hidden md:flex"
                          title="View Lyrics"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
