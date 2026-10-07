import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SacredGodItem, Song } from '../types';
import { getSongsForGod } from '../utils/devotionalPlaylists';
import { DEITY_DESCRIPTIONS } from '../data/translations';
import { 
  Flame, 
  Play, 
  Pause,
  Youtube, 
  Search, 
  X, 
  RotateCcw,
  Music,
  Mic2,
  Clock,
  ListMusic,
  Disc3,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const SacredGodsGallery: React.FC = () => {
  const { 
    sacredGods, 
    songs, 
    playSong, 
    pauseSong,
    currentTrack,
    isPlaying,
    openInYouTube, 
    openLyricsModal,
    showToast,
    language,
    t
  } = useApp();

  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDarshanGod, setActiveDarshanGod] = useState<SacredGodItem | null>(null);
  const [offeredArathiIds, setOfferedArathiIds] = useState<string[]>([]);
  const [playlistSearch, setPlaylistSearch] = useState<string>('');
  const [selectedSingerFilter, setSelectedSingerFilter] = useState<string>('ALL');

  // Precompute songs for each god
  const godSongsMap = useMemo(() => {
    const map = new Map<string, Song[]>();
    for (const god of sacredGods) {
      map.set(god.id, getSongsForGod(god, songs));
    }
    return map;
  }, [sacredGods, songs]);

  // Group Filters
  const GROUP_TABS = [
    { 
      key: 'ALL', 
      label: language === 'ta' ? 'அனைத்து 18 தெய்வங்கள்' : 'All 18 Divine Forms', 
      count: sacredGods.length 
    },
    { 
      key: 'PRIMAL_GODS', 
      label: language === 'ta' ? 'மூல தெய்வங்கள்' : 'Primal Deities', 
      count: sacredGods.filter(g => g.group === 'PRIMAL_GODS').length 
    },
    { 
      key: 'SACRED_KSHETRAMS', 
      label: language === 'ta' ? 'புண்ணிய ஸ்தலங்கள்' : 'Sacred Kshetrams', 
      count: sacredGods.filter(g => g.group === 'SACRED_KSHETRAMS').length 
    },
    { 
      key: 'MAHA_GURUS', 
      label: language === 'ta' ? 'மகான்கள் & ஞானிகள்' : 'Maha Gurus & Siddhas', 
      count: sacredGods.filter(g => g.group === 'MAHA_GURUS').length 
    },
    { 
      key: 'VEDA_HOMAMS', 
      label: language === 'ta' ? 'வேத மந்திரங்கள் & ஹோமம்' : 'Vedas & Homams', 
      count: sacredGods.filter(g => g.group === 'VEDA_HOMAMS').length 
    },
  ];

  // Filtered Gods for the grid
  const filteredGods = useMemo(() => {
    return sacredGods.filter(god => {
      if (selectedGroup !== 'ALL' && god.group !== selectedGroup) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = god.name.toLowerCase().includes(q);
        const matchTamil = god.tamilName.toLowerCase().includes(q);
        const matchMantra = god.mantra.toLowerCase().includes(q) || god.mantraTamil.toLowerCase().includes(q);
        const matchAbode = god.templeAbode.toLowerCase().includes(q);
        const matchTagline = god.tagline.toLowerCase().includes(q);
        if (!matchName && !matchTamil && !matchMantra && !matchAbode && !matchTagline) {
          return false;
        }
      }
      return true;
    });
  }, [sacredGods, selectedGroup, searchQuery]);

  // Active God's playlist tracks
  const activeGodSongs = useMemo(() => {
    if (!activeDarshanGod) return [];
    const raw = godSongsMap.get(activeDarshanGod.id) || [];
    return raw.filter(s => {
      if (selectedSingerFilter !== 'ALL') {
        const singerName = (s.credits?.singer || '').toLowerCase();
        if (!singerName.includes(selectedSingerFilter.toLowerCase())) return false;
      }
      if (playlistSearch.trim()) {
        const q = playlistSearch.toLowerCase();
        const inTitle = (s.title || '').toLowerCase().includes(q);
        const inTamil = (s.tamilTitle || '').toLowerCase().includes(q);
        const inSinger = (s.credits?.singer || '').toLowerCase().includes(q);
        const inRaga = (s.raga || '').toLowerCase().includes(q);
        return inTitle || inTamil || inSinger || inRaga;
      }
      return true;
    });
  }, [activeDarshanGod, godSongsMap, playlistSearch, selectedSingerFilter]);

  // Unique singers for active god's playlist
  const activeGodSingers = useMemo(() => {
    if (!activeDarshanGod) return [];
    const raw = godSongsMap.get(activeDarshanGod.id) || [];
    const set = new Set<string>();
    raw.forEach(s => {
      if (s.credits?.singer) set.add(s.credits.singer.trim());
    });
    return Array.from(set);
  }, [activeDarshanGod, godSongsMap]);

  // Arathi Offering Handler
  const handleOfferArathi = (god: SacredGodItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!offeredArathiIds.includes(god.id)) {
      setOfferedArathiIds(prev => [...prev, god.id]);
      showToast(`🪔 தீபாராதனை சமர்ப்பிக்கப்பட்டது! ${god.tamilName} அருள் பெறுக.`, 'success');
    } else {
      showToast(`🪔 ${god.name} Divine Blessings Offered`, 'info');
    }
  };

  // Play God's Playlist from track 1
  const handlePlayAllGodSongs = (god: SacredGodItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const list = godSongsMap.get(god.id) || [];
    if (list.length > 0) {
      playSong(list[0]);
      showToast(`▶ Playing ${god.name} Playlist (1/${list.length}: ${list[0].title})`, 'success');
    }
  };

  // Play a specific song or toggle pause
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
    <section id="sacred-gods-section" className="py-16 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 w-full max-w-[2000px] mx-auto space-y-10">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#18120B] border border-[#FFDE00]/35 text-[#FFDE00] text-xs font-bold uppercase tracking-widest mb-3 shadow-[0_0_20px_rgba(255,222,0,0.15)]">
            <Flame className="w-3.5 h-3.5 text-[#E52020] fill-[#E52020]" />
            <span>{t('gods.badge', '18 SACRED GODS & DEVOTIONAL SONG PLAYLISTS')}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight font-cinzel">
            {language === 'ta' ? '18 திருவுருவ தரிசனம் & பக்திப் பாடல்கள்' : '18 Sacred Divine Forms & Devotional Hymns'}
          </h2>
          <p className="text-base text-[#C0B8B0] mt-2 max-w-3xl leading-relaxed">
            {t('gods.subtitle', 'Select any sacred deity below to open their dedicated devotional playlist. Explore Annamalaiyar & Unnamalaiyar, Amman, Vinayagar, Murugan, Ayyappan, Perumal, and sacred Gurus with full playback controls.')}
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFDE00]" />
          <input
            id="sacred-gods-search"
            type="text"
            placeholder={t('gods.searchPlaceholder', 'Search God, Guru, Mantra, Sthalam...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#140F0A] border border-[#FFDE00]/25 focus:border-[#FFDE00] text-sm text-white placeholder-[#888888] outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#FFDE00] hover:text-white"
            >
              {t('gods.clear', 'Clear')}
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {GROUP_TABS.map((tab) => {
          const isSelected = selectedGroup === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedGroup(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-[#FFDE00] via-[#FACC15] to-[#E58A32] text-[#0A0806] ring-2 ring-[#E52020] shadow-[0_0_20px_rgba(255,222,0,0.35)]'
                  : 'bg-[#18120B] border border-white/10 text-[#C8C0B8] hover:text-white hover:border-[#FFDE00]/40'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-[#FFDE00]'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 18 Sacred Gods Grid */}
      {filteredGods.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#140F0A] border border-white/10 p-8 space-y-4">
          <p className="text-lg text-white font-bold">No sacred deity found matching "{searchQuery}"</p>
          <button
            onClick={() => { setSelectedGroup('ALL'); setSearchQuery(''); }}
            className="px-5 py-2.5 rounded-xl bg-[#FFDE00] text-black font-bold text-xs shadow-md cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Search & Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
          {filteredGods.map((god) => {
            const hasOfferedArathi = offeredArathiIds.includes(god.id);
            const godSongs = godSongsMap.get(god.id) || [];
            const isGodCurrentlyPlaying = godSongs.some(s => s.id === currentTrack?.id && isPlaying);

            return (
              <div
                key={god.id}
                id={`sacred-god-card-${god.id}`}
                onClick={() => {
                  setActiveDarshanGod(god);
                  setPlaylistSearch('');
                  setSelectedSingerFilter('ALL');
                }}
                className={`group relative rounded-2xl bg-[#140F0B] p-4 transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  isGodCurrentlyPlaying
                    ? 'border-2 border-[#FFDE00] shadow-[0_0_35px_rgba(255,222,0,0.35)]'
                    : 'border border-[#FFDE00]/25 hover:border-[#FFDE00] hover:shadow-[0_15px_40px_rgba(0,0,0,0.95),0_0_30px_rgba(255,222,0,0.25)]'
                }`}
              >
                {/* Top Image & Darshan Badges */}
                <div>
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-black/60 shadow-lg">
                    <img
                      src={god.image}
                      alt={god.name}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/shiva.jpg'; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/40"></div>

                    {/* Number Badge & Group Label */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full bg-[#0A0806]/90 border border-[#FFDE00]/50 text-[11px] font-mono font-bold text-[#FFDE00] flex items-center justify-center shadow-md">
                        {god.number}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm border border-white/10 text-[9px] font-bold text-white truncate max-w-[120px]">
                        {god.groupLabel.split('&')[0]}
                      </span>
                    </div>

                    {/* Arathi Lamp Trigger Button */}
                    <button
                      onClick={(e) => handleOfferArathi(god, e)}
                      title={hasOfferedArathi ? 'Arathi Offered' : 'Offer Arathi / தீபாராதனை'}
                      className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                        hasOfferedArathi
                          ? 'bg-[#FFDE00] text-black ring-2 ring-[#E52020] animate-pulse'
                          : 'bg-black/75 hover:bg-black text-[#FFDE00] border border-[#FFDE00]/30 hover:border-[#FFDE00]'
                      }`}
                    >
                      <Flame className={`w-4 h-4 ${hasOfferedArathi ? 'fill-current text-[#E52020]' : 'fill-[#FFDE00]'}`} />
                    </button>

                    {/* Songs Count Badge Overlay */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#0A0806]/90 text-[#FFDE00] font-bold border border-[#FFDE00]/40 flex items-center gap-1 shadow-sm">
                        <Music className="w-2.5 h-2.5" />
                        <span>{godSongs.length} Songs</span>
                      </span>
                      {isGodCurrentlyPlaying && (
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-[#E52020] text-white font-bold animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                          <span>Playing</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Sacred Information */}
                  <div className="mt-3.5 space-y-1.5">
                    <h3 className="text-base font-bold text-white group-hover:text-[#FFDE00] transition-colors line-clamp-1">
                      {language === 'ta' ? god.tamilName : god.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#FFDE00]/90 font-serif line-clamp-1">
                      {language === 'ta' ? god.name : god.tamilName}
                    </p>
                    <p className="text-[11px] text-[#A0988E] line-clamp-2 leading-relaxed">
                      {language === 'ta' ? god.mantraTamil : (god.mantra || god.mantraTamil)}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                  <p className="text-[10px] text-[#807870] line-clamp-1">
                    📍 {god.templeAbode.split(',')[0]}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {/* View Playlist & Play */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDarshanGod(god);
                        setPlaylistSearch('');
                        setSelectedSingerFilter('ALL');
                      }}
                      className="py-2 px-2 rounded-xl bg-[#1C140E] hover:bg-[#2A1E14] border border-[#FFDE00]/40 text-[11px] font-bold text-white hover:text-[#FFDE00] transition-all flex items-center justify-center gap-1 cursor-pointer"
                      title={language === 'ta' ? 'பாடல்கள் தொகுப்பைக் காண்க' : 'View Songs & Playlist'}
                    >
                      <ListMusic className="w-3 h-3 text-[#FFDE00]" />
                      <span>{language === 'ta' ? 'பாடல்கள்' : 'Playlist'} ({godSongs.length})</span>
                    </button>

                    {/* Quick Play All */}
                    <button
                      onClick={(e) => handlePlayAllGodSongs(god, e)}
                      className="py-2 px-2 rounded-xl bg-gradient-to-r from-[#FFDE00] to-[#E58A32] hover:brightness-110 text-[#0A0806] font-extrabold text-[11px] transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer whitespace-nowrap"
                      title={language === 'ta' ? 'முதல் பாடலை இயக்கு' : 'Play First Song'}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{language === 'ta' ? 'இயக்கு' : 'Play All'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comprehensive God Devotional Playlist & Darshan Modal */}
      {activeDarshanGod && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-200"
          onClick={() => setActiveDarshanGod(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-[#110C07] border-2 border-[#FFDE00]/50 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_60px_rgba(255,222,0,0.35)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-[#0A0704] border-b border-[#FFDE00]/25 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFDE00] animate-ping"></span>
                <span className="text-xs sm:text-sm font-bold text-[#FFDE00] uppercase tracking-wider font-cinzel">
                  #{activeDarshanGod.number} {language === 'ta' ? activeDarshanGod.tamilName : activeDarshanGod.name} • {language === 'ta' ? `பக்திப் பாடல் தொகுப்பு (${activeGodSongs.length} பாடல்கள்)` : `Devotional Playlist (${activeGodSongs.length} Tracks)`}
                </span>
              </div>
              <button
                onClick={() => setActiveDarshanGod(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-8 space-y-6">
              
              {/* Deity Hero Info Card */}
              <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start p-4 sm:p-5 rounded-2xl bg-[#18110A] border border-[#FFDE00]/25">
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-[#FFDE00]/50 shadow-xl shrink-0">
                  <img
                    src={activeDarshanGod.image}
                    alt={activeDarshanGod.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-1 left-1 right-1 text-center">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FFDE00] text-black font-extrabold line-clamp-1">
                      {activeDarshanGod.tagline}
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white font-cinzel">
                      {language === 'ta' ? activeDarshanGod.tamilName : activeDarshanGod.name}
                    </h3>
                    <p className="text-sm sm:text-base text-[#FFDE00] font-serif font-semibold">
                      {language === 'ta' ? activeDarshanGod.name : activeDarshanGod.tamilName}
                    </p>
                  </div>

                  <p className="text-xs text-[#C0B8B0] line-clamp-2 leading-relaxed">
                    {DEITY_DESCRIPTIONS[activeDarshanGod.id]?.[language] || activeDarshanGod.description}
                  </p>

                  <p className="text-[11px] text-[#A0988E]">
                    📍 <span className="text-[#FFDE00] font-medium">{language === 'ta' ? 'புண்ணிய ஸ்தலம்:' : 'Abode:'}</span> {activeDarshanGod.templeAbode}
                  </p>

                  {/* Top Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      onClick={(e) => handlePlayAllGodSongs(activeDarshanGod, e)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFDE00] via-[#FACC15] to-[#E58A32] text-[#0A0806] font-extrabold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{language === 'ta' ? `அனைத்தும் இயக்கு (${activeGodSongs.length})` : `Play All (${activeGodSongs.length} Songs)`}</span>
                    </button>

                    <button
                      onClick={(e) => handleOfferArathi(activeDarshanGod, e)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        offeredArathiIds.includes(activeDarshanGod.id)
                          ? 'bg-[#FFDE00] text-black ring-2 ring-[#E52020]'
                          : 'bg-[#22170E] hover:bg-[#2F2013] text-[#FFDE00] border border-[#FFDE00]/40'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>{offeredArathiIds.includes(activeDarshanGod.id) ? (language === 'ta' ? 'தீபாராதனை செய்யப்பட்டது' : 'Arathi Offered') : (language === 'ta' ? 'தீபாராதனை செய்க' : 'Offer Arathi')}</span>
                    </button>

                    <button
                      onClick={() => {
                        openInYouTube(`https://www.youtube.com/results?search_query=Subam+Audio+Vision+${encodeURIComponent(activeDarshanGod.name)}`);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#E52020] hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Youtube className="w-3.5 h-3.5 fill-current" />
                      <span>YouTube</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sacred Moola Mantra Box */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#1E140B] to-[#120D07] border border-[#FFDE00]/30">
                <div className="space-y-0.5">
                  <p className="text-xs text-white font-serif font-bold leading-relaxed">
                    {activeDarshanGod.mantraTamil}
                  </p>
                  <p className="text-[11px] text-[#A0988E] font-mono">
                    {activeDarshanGod.mantra}
                  </p>
                </div>
              </div>

              {/* Playlist Filter & Search Bar */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ListMusic className="w-4 h-4 text-[#FFDE00]" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      {language === 'ta' ? 'பக்திப் பாடல்கள் தொகுப்பு' : 'Categorized Songs Playlist'}
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFDE00]/20 text-[#FFDE00] font-mono font-bold">
                      {activeGodSongs.length} {language === 'ta' ? 'பாடல்கள்' : 'Tracks'}
                    </span>
                  </div>

                  {/* In-modal Search Input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#FFDE00]" />
                    <input
                      type="text"
                      placeholder={language === 'ta' ? 'இத்தொகுப்பில் பாடல்களைத் தேடுக...' : 'Search within this deity...'}
                      value={playlistSearch}
                      onChange={(e) => setPlaylistSearch(e.target.value)}
                      className="w-full pl-8 pr-7 py-2 rounded-lg bg-[#18110A] border border-white/10 focus:border-[#FFDE00] text-xs text-white placeholder-[#888888] outline-none"
                    />
                    {playlistSearch && (
                      <button
                        onClick={() => setPlaylistSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#888888] hover:text-white"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Singer Filter Chips */}
                {activeGodSingers.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      onClick={() => setSelectedSingerFilter('ALL')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedSingerFilter === 'ALL'
                          ? 'bg-[#FFDE00] text-black'
                          : 'bg-[#18110A] text-[#A0988E] hover:text-white border border-white/10'
                      }`}
                    >
                      {language === 'ta' ? 'அனைத்து பாடகர்கள்' : 'All Singers'}
                    </button>
                    {activeGodSingers.map(singer => (
                      <button
                        key={singer}
                        onClick={() => setSelectedSingerFilter(singer)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                          selectedSingerFilter === singer
                            ? 'bg-[#FFDE00] text-black font-bold'
                            : 'bg-[#18110A] text-[#A0988E] hover:text-white border border-white/10'
                        }`}
                      >
                        <Mic2 className="w-2.5 h-2.5" />
                        <span>{singer}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Categorized Songs List */}
              <div className="space-y-2">
                {activeGodSongs.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-[#18110A] border border-white/10 text-[#888888] text-sm">
                    No songs found matching "{playlistSearch}".
                  </div>
                ) : (
                  activeGodSongs.map((song, idx) => {
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
                        {/* Left: Track # & Artwork */}
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
                              src={song.coverImage || activeDarshanGod.image}
                              alt={song.title}
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = activeDarshanGod.image; }}
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

                          {/* Song Title & Singer Details */}
                          <div className="min-w-0 space-y-0.5">
                            <h5 className={`text-sm font-bold truncate ${isCurrent ? 'text-[#FFDE00]' : 'text-white'}`}>
                              {song.title}
                            </h5>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#A0988E]">
                              {song.credits?.singer && (
                                <span className="flex items-center gap-1 font-medium text-[#C0B8B0]">
                                  <Mic2 className="w-2.5 h-2.5 text-[#FFDE00]" />
                                  <span className="truncate">{song.credits.singer}</span>
                                </span>
                              )}
                              {song.raga && (
                                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-black/50 text-[10px] text-[#FFDE00] border border-white/10">
                                  {song.raga}
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

                        {/* Right: Duration & Quick Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-[#888888] font-mono hidden sm:inline-block">
                            {song.duration || '04:30'}
                          </span>

                          {/* Play / Pause Toggle Button */}
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

                          {/* Lyrics Modal Trigger */}
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
      )}

    </section>
  );
};
