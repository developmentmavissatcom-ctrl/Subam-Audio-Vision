import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DevotionalSlot } from '../types';
import { slotToSong } from '../data/slotBoxesData';
import { DRIVE_DEVOTIONAL_SLOTS } from '../data/driveSongsData';
import { evaluateSearchMatch, searchItems } from '../utils/searchEngine';
import { 
  Play, 
  Pause, 
  Search, 
  RefreshCw, 
  CheckCircle2,
  ListMusic,
  Radio,
  Disc3,
  LayoutGrid,
  Layers,
  Clock,
  Mic2,
  Youtube,
  X
} from 'lucide-react';

export const SongSlotBoxes: React.FC = () => {
  const { 
    currentTrack, 
    isPlaying, 
    playSong, 
    pauseSong, 
    showToast,
    openInYouTube,
    setIsSearchOpen
  } = useApp();

  const [slots, setSlots] = useState<DevotionalSlot[]>(DRIVE_DEVOTIONAL_SLOTS);
  const [selectedDeity, setSelectedDeity] = useState<string>('ALL');
  const [selectedAlbum, setSelectedAlbum] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'GRID' | 'ALBUMS'>('GRID');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Sync slots from server /api/slots
  const syncServerSlots = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/slots');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSlots(data);
        }
      }
    } catch {
      // Fallback already loaded from DRIVE_DEVOTIONAL_SLOTS
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    syncServerSlots();
  }, []);

  // Unique list of albums from slots for filter
  interface AlbumInfo {
    code: string;
    title: string;
    image: string;
  }

  const albumList: AlbumInfo[] = Array.from(
    slots.reduce((map, s) => {
      if (s.albumCode && s.albumTitle && !map.has(s.albumCode)) {
        map.set(s.albumCode, {
          code: s.albumCode,
          title: s.albumTitle,
          image: s.imagePath
        });
      }
      return map;
    }, new Map<string, AlbumInfo>()).values()
  );

  // Clicking a slot plays or pauses the respective song
  const handleSlotClick = (slot: DevotionalSlot) => {
    const song = slotToSong(slot);

    if (currentTrack?.id === slot.id && isPlaying) {
      pauseSong();
    } else {
      playSong(song);
      showToast(`Now Playing: ${slot.title} (${slot.singer})`, 'success');
    }
  };

  // Filter slots by deity, album & search query
  const filteredSlots = slots.filter(slot => {
    // Album filter
    if (selectedAlbum !== 'ALL' && slot.albumCode !== selectedAlbum) {
      return false;
    }

    // Deity filter
    if (selectedDeity !== 'ALL') {
      if (selectedDeity === 'SIVAN' && slot.deity !== 'ANNAMALAIYAR_SIVAN') return false;
      if (selectedDeity === 'PERUMAL' && slot.deity !== 'PERUMAL_VENKATESWARA') return false;
      if (selectedDeity === 'MURUGAN' && slot.deity !== 'MURUGAN') return false;
      if (selectedDeity === 'AMMAN' && slot.deity !== 'AMMAN_SHAKTHI') return false;
      if (selectedDeity === 'AYYAPPAN' && slot.deity !== 'AYYAPPAN') return false;
      if (selectedDeity === 'VINAYAGAR' && slot.deity !== 'VINAYAGAR') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = slot.title.toLowerCase().includes(q);
      const matchTamil = slot.tamilTitle?.toLowerCase().includes(q);
      const matchSinger = slot.singer.toLowerCase().includes(q);
      const matchAlbum = slot.albumTitle?.toLowerCase().includes(q) || slot.albumCode?.toLowerCase().includes(q);
      const matchDeity = slot.deityTamilName.toLowerCase().includes(q);
      const matchRaga = slot.raga?.toLowerCase().includes(q);
      if (!matchTitle && !matchTamil && !matchSinger && !matchAlbum && !matchDeity && !matchRaga) return false;
    }

    return true;
  });

  // Group slots by album for ALBUMS view
  const groupedByAlbum = albumList.map(alb => ({
    ...alb,
    tracks: filteredSlots.filter(s => s.albumCode === alb.code)
  })).filter(g => g.tracks.length > 0);

  return (
    <section 
      id="song-slots-section" 
      className="py-16 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 bg-[#0A0704] border-t-2 border-[#FFDE00]/30 relative overflow-hidden"
    >
      {/* Background Sacred Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FFDE00]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#E52020]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[2000px] mx-auto space-y-8 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3">
            <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#1C1309] border border-[#FFDE00]/40 text-[#FFDE00] text-xs font-bold uppercase tracking-wider shadow-sm">
              <span>Subam Master Audio Vault • Google Drive Playlists Mapped</span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight font-cinzel">
                Devotional Song Playlists & Track Cards
              </h2>
              <span className="text-sm font-semibold text-[#FFDE00] font-tamil">
                (சுபம் பக்தி பாடல்கள் • 12 தெய்வீக ஆல்பங்கள்)
              </span>
            </div>

            <p className="text-sm text-[#C0B8B0] max-w-3xl leading-relaxed">
              All 82 devotional tracks from the official Subam Audio Vision Google Drive archive mapped to their corresponding album cards with authentic Tamil hymn titles, master MP3 studio playback, and track listings.
            </p>
          </div>

          {/* Right Action Hub */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#140F0A] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('GRID')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'GRID'
                    ? 'bg-[#FFDE00] text-black shadow-sm'
                    : 'text-[#A0988E] hover:text-white'
                }`}
                title="View individual song cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Track Cards</span>
              </button>
              <button
                onClick={() => setViewMode('ALBUMS')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'ALBUMS'
                    ? 'bg-[#FFDE00] text-black shadow-sm'
                    : 'text-[#A0988E] hover:text-white'
                }`}
                title="View grouped by 12 ACD albums"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>By Albums</span>
              </button>
            </div>

            {/* Total Tracks Badge */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#140F0A] border border-[#FFDE00]/30 shadow-inner">
              <ListMusic className="w-4 h-4 text-[#FFDE00]" />
              <div className="text-xs">
                <span className="text-white font-bold">{filteredSlots.length}</span>
                <span className="text-[#A0988E]"> of {slots.length} Tracks</span>
              </div>
            </div>

            {/* Refresh Folder Sync */}
            <button
              onClick={syncServerSlots}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A120A] border border-white/10 hover:border-[#FFDE00]/40 text-[#C0B8B0] hover:text-white transition-colors cursor-pointer text-xs font-bold"
              title="Refresh audio and cover artwork from project folder"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#FFDE00] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Sync Audio</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-4">
          {/* Deity Categories Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Songs', tamil: 'அனைத்தும்' },
              { id: 'SIVAN', label: 'Lord Shiva', tamil: 'சிவன்' },
              { id: 'PERUMAL', label: 'Perumal / Balaji', tamil: 'பெருமாள்' },
              { id: 'MURUGAN', label: 'Lord Murugan', tamil: 'முருகன்' },
              { id: 'AMMAN', label: 'Amman / Shakthi', tamil: 'அம்மன்' },
              { id: 'AYYAPPAN', label: 'Ayyappan', tamil: 'ஐயப்பன்' },
              { id: 'VINAYAGAR', label: 'Vinayagar', tamil: 'விநாயகர்' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedDeity(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  selectedDeity === tab.id
                    ? 'bg-[#FFDE00] text-black shadow-[0_0_15px_rgba(255,222,0,0.4)]'
                    : 'bg-[#140F0A] text-[#B0A8A0] hover:text-white hover:bg-[#201812] border border-white/5'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-80 font-tamil font-normal">({tab.tamil})</span>
              </button>
            ))}
          </div>

          {/* Secondary Album & Search Filter Row */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
            {/* Album Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
              <span className="text-[11px] font-bold text-[#A0988E] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Disc3 className="w-3.5 h-3.5 text-[#FFDE00]" />
                <span>Albums:</span>
              </span>
              <button
                onClick={() => setSelectedAlbum('ALL')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  selectedAlbum === 'ALL'
                    ? 'bg-[#FFDE00]/20 text-[#FFDE00] border border-[#FFDE00]'
                    : 'bg-white/5 text-[#A0988E] hover:text-white border border-transparent'
                }`}
              >
                All 12 Albums ({slots.length})
              </button>
              {albumList.map(alb => {
                const count = slots.filter(s => s.albumCode === alb.code).length;
                const active = selectedAlbum === alb.code;
                return (
                  <button
                    key={alb.code}
                    onClick={() => setSelectedAlbum(alb.code)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                      active
                        ? 'bg-[#FFDE00] text-black shadow-sm font-bold'
                        : 'bg-[#18110A] text-[#C0B8B0] hover:text-white border border-white/5'
                    }`}
                  >
                    <span className="text-[10px] uppercase opacity-75">{alb.code.replace('SAV_', '')}</span>
                    <span>{alb.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${active ? 'bg-black/20 text-black' : 'bg-white/10 text-[#FFDE00]'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-[#8A827A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search song, Tamil hymn, singer..."
                className="w-full bg-[#140F0A] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#6A625A] focus:outline-none focus:border-[#FFDE00]/60 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* View Mode 1: Individual Song Track Cards Grid */}
        {viewMode === 'GRID' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {filteredSlots.map((slot) => {
              const isCurrent = currentTrack?.id === slot.id;
              const hasCustomAudio = !!slot.audioFile;

              return (
                <div
                  key={slot.id}
                  id={`slot-card-${slot.id}`}
                  onClick={() => handleSlotClick(slot)}
                  className={`group relative rounded-2xl bg-[#140F0A] border transition-all duration-300 flex flex-col overflow-hidden cursor-pointer ${
                    isCurrent && isPlaying
                      ? 'border-[#FFDE00] ring-2 ring-[#FFDE00]/40 shadow-[0_10px_35px_rgba(255,222,0,0.25)]'
                      : 'border-[#FFDE00]/20 hover:border-[#FFDE00]/60 hover:shadow-[0_10px_30px_rgba(0,0,0,0.85)]'
                  }`}
                >
                  {/* Album Cover Artwork Container */}
                  <div className="relative aspect-square w-full bg-[#080604] overflow-hidden">
                    <img
                      src={slot.imagePath}
                      alt={slot.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/shiva.jpg';
                      }}
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        isCurrent && isPlaying ? 'scale-105' : 'group-hover:scale-105'
                      }`}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#140F0A] via-black/20 to-black/40" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <div className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-[#FFDE00]/40 text-[10px] font-black text-[#FFDE00] tracking-wider uppercase flex items-center gap-1">
                        <span>{slot.albumCode ? slot.albumCode.replace('SAV_', 'ACD ') : `SLOT #${slot.slotNumber.toString().padStart(2, '0')}`}</span>
                        {slot.trackNumber && <span className="text-white/80">• #{slot.trackNumber}</span>}
                      </div>

                      {/* Master MP3 Status Pill */}
                      {hasCustomAudio ? (
                        <div className="px-2 py-0.5 rounded-lg bg-[#008751]/90 backdrop-blur-md border border-[#4ADE80]/50 text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3 text-[#4ADE80]" />
                          <span>MP3 MASTER</span>
                        </div>
                      ) : (
                        <div className="px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-[#FFDE00]/30 text-[10px] font-bold text-[#FFDE00] flex items-center gap-1">
                          <Radio className="w-2.5 h-2.5 text-[#FFDE00]" />
                          <span>SUBAM DEVOTIONAL</span>
                        </div>
                      )}
                    </div>

                    {/* Top Right Quick YouTube Watch Action */}
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openInYouTube(slotToSong(slot));
                        }}
                        className="px-2 py-1 rounded-lg bg-black/80 hover:bg-[#E52020] text-white text-[10px] font-bold border border-white/20 hover:border-[#E52020] flex items-center gap-1 shadow-md transition-all cursor-pointer"
                        title="Watch on Subam Audio Vision YouTube"
                      >
                        <Youtube className="w-3 h-3 fill-[#E52020] hover:fill-white" />
                        <span>YT</span>
                      </button>
                    </div>

                    {/* Bottom Right Duration Badge */}
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-white/90 border border-white/10 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-[#FFDE00]" />
                      <span>{slot.audioFile?.duration ? `${Math.floor(slot.audioFile.duration / 60)}:${(slot.audioFile.duration % 60).toString().padStart(2, '0')}` : '05:40'}</span>
                    </div>

                    {/* Playing Pulse Equalizer Overlay */}
                    {isCurrent && isPlaying && (
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                        <div className="flex items-end gap-1 h-8">
                          <span className="w-1.5 bg-[#FFDE00] rounded-full animate-bounce [animation-delay:-0.3s] h-8"></span>
                          <span className="w-1.5 bg-[#FFDE00] rounded-full animate-bounce [animation-delay:-0.15s] h-5"></span>
                          <span className="w-1.5 bg-[#FFDE00] rounded-full animate-bounce [animation-delay:-0.45s] h-7"></span>
                          <span className="w-1.5 bg-[#FFDE00] rounded-full animate-bounce [animation-delay:-0.2s] h-4"></span>
                          <span className="w-1.5 bg-[#FFDE00] rounded-full animate-bounce h-6"></span>
                        </div>
                        <span className="text-[11px] font-black uppercase text-[#FFDE00] tracking-widest bg-black/70 px-2 py-0.5 rounded border border-[#FFDE00]/40">
                          NOW PLAYING
                        </span>
                      </div>
                    )}

                    {/* Play Button Overlay (when hovered and not playing) */}
                    {!(isCurrent && isPlaying) && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#FFDE00] to-[#E58A32] text-black flex items-center justify-center shadow-[0_0_25px_rgba(255,222,0,0.7)] transform scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-6 h-6 ml-0.5 fill-current" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content & Metadata */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      {/* Album code & name */}
                      {slot.albumTitle && (
                        <div className="text-[11px] font-bold text-[#FFDE00]/80 tracking-wide uppercase flex items-center gap-1.5 truncate">
                          <Disc3 className="w-3 h-3 text-[#FFDE00] shrink-0" />
                          <span>{slot.albumTitle}</span>
                        </div>
                      )}

                      <h3 className="font-cinzel text-base font-bold text-white group-hover:text-[#FFDE00] transition-colors leading-snug line-clamp-1">
                        {slot.title}
                      </h3>

                      {slot.tamilTitle && (
                        <p className="text-xs font-bold text-[#FFDE00] font-tamil line-clamp-1">
                          {slot.tamilTitle}
                        </p>
                      )}

                      <p className="text-xs text-[#A0988E] flex items-center gap-1.5 pt-0.5 truncate">
                        <Mic2 className="w-3.5 h-3.5 text-[#FFDE00] shrink-0" />
                        <span>{slot.singer}</span>
                      </p>

                      <div className="flex items-center gap-2 pt-1 text-[10px] text-[#7A726A] flex-wrap">
                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#C0B8B0]">
                          {slot.categoryName}
                        </span>
                        {slot.raga && <span>• {slot.raga}</span>}
                        {slot.deityTamilName && (
                          <span className="text-[#FFDE00] font-tamil">• {slot.deityTamilName}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Quick Play Tab Bar */}
                  <div 
                    className={`py-2.5 px-4 text-center text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
                      isCurrent && isPlaying
                        ? 'bg-[#E52020] text-white'
                        : 'bg-[#1C140C] text-[#FFDE00] group-hover:bg-[#FFDE00] group-hover:text-black'
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause Playing</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        <span>Play Sacred Master</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View Mode 2: Grouped by the 12 ACD Devotional Albums */}
        {viewMode === 'ALBUMS' && (
          <div className="space-y-8">
            {groupedByAlbum.map((album) => (
              <div
                key={album.code}
                className="rounded-2xl bg-[#140F0A] border border-[#FFDE00]/25 overflow-hidden p-5 sm:p-6 shadow-xl"
              >
                {/* Album Header Banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pb-5 border-b border-white/10">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-black/60 border border-[#FFDE00]/40 shrink-0 shadow-lg">
                    <img
                      src={album.image}
                      alt={album.title}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/shiva.jpg'; }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FFDE00]/15 border border-[#FFDE00]/30 text-[11px] font-black text-[#FFDE00] uppercase tracking-wider">
                      <Disc3 className="w-3 h-3 text-[#FFDE00]" />
                      <span>{album.code.replace('SAV_', 'SAV ACD ')}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-white truncate">
                      {album.title}
                    </h3>
                    <p className="text-xs text-[#A0988E]">
                      Subam Audio Vision Master Recording • {album.tracks.length} Devotional Tracks
                    </p>
                  </div>
                  {/* Play Entire Album Button */}
                  <button
                    onClick={() => handleSlotClick(album.tracks[0])}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFDE00] to-[#E58A32] text-black font-bold text-xs hover:brightness-110 transition-all shadow-md cursor-pointer shrink-0"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Play Album</span>
                  </button>
                </div>

                {/* Tracklist Table */}
                <div className="mt-4 divide-y divide-white/5">
                  {album.tracks.map((slot, idx) => {
                    const isCurrent = currentTrack?.id === slot.id;
                    return (
                      <div
                        key={slot.id}
                        onClick={() => handleSlotClick(slot)}
                        className={`flex items-center justify-between gap-3 py-3 px-3 rounded-xl transition-all cursor-pointer ${
                          isCurrent && isPlaying
                            ? 'bg-[#FFDE00]/15 border border-[#FFDE00]/40 text-white'
                            : 'hover:bg-white/5 text-[#C0B8B0] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <button
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform ${
                              isCurrent && isPlaying
                                ? 'bg-[#FFDE00] text-black'
                                : 'bg-white/5 text-[#FFDE00] hover:scale-110'
                            }`}
                          >
                            {isCurrent && isPlaying ? (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            )}
                          </button>
                          <span className="text-xs font-mono font-bold text-[#A0988E] w-6">
                            {(slot.trackNumber || (idx + 1)).toString().padStart(2, '0')}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h4 className={`text-sm font-bold truncate ${isCurrent ? 'text-[#FFDE00]' : 'text-white'}`}>
                              {slot.title}
                            </h4>
                            {slot.tamilTitle && (
                              <p className="text-xs font-tamil text-[#FFDE00]/80 truncate">
                                {slot.tamilTitle}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-2 text-xs text-[#A0988E]">
                          <span>{slot.singer}</span>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#008751]/70 text-[#4ADE80] border border-[#4ADE80]/30 hidden md:inline">
                            MP3 MASTER
                          </span>
                          <span className="text-xs font-mono text-[#A0988E]">
                            {slot.audioFile?.duration ? `${Math.floor(slot.audioFile.duration / 60)}:${(slot.audioFile.duration % 60).toString().padStart(2, '0')}` : '05:30'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openInYouTube(slotToSong(slot));
                            }}
                            className="p-1.5 rounded-lg bg-[#E52020]/15 hover:bg-[#E52020] text-[#E52020] hover:text-white border border-[#E52020]/30 transition-all cursor-pointer"
                            title="Watch and play on YouTube"
                          >
                            <Youtube className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
