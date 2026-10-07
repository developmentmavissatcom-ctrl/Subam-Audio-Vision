import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  X, 
  Play, 
  Pause,
  Youtube, 
  FileText, 
  Download, 
  Disc3, 
  Mic2, 
  Music,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Song } from '../types';
import { searchItems, splitForHighlight } from '../utils/searchEngine';

const QUICK_SEARCH_PILLS = [
  { label: 'Vinai Theerkum', query: 'vinai theerkum' },
  { label: 'Sevvadaikari (102)', query: 'sevvadaikari' },
  { label: 'S.P.B. Hits', query: 'spb' },
  { label: 'Siva Manthiram', query: 'siva manthiram' },
  { label: 'Mahanadhi Shobana', query: 'shobana' },
  { label: 'Veeramanidasan', query: 'veeramani' },
  { label: 'Arunachalanae', query: 'arunachala' },
  { label: 'Kandha Sashti', query: 'kandha sashti' },
  { label: 'Perumal Govinda', query: 'govinda' },
  { label: 'Harivarasanam', query: 'harivarasanam' }
];

export const SearchModal: React.FC = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    songs, 
    playSong, 
    pauseSong,
    currentTrack, 
    isPlaying,
    openLyrics, 
    openCheckout, 
    openInYouTube,
    showToast
  } = useApp();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'MASTER' | 'YOUTUBE'>('ALL');
  const [apiResults, setApiResults] = useState<Song[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus on modal open
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setApiResults([]);
    }
  }, [isSearchOpen]);

  // Instant local search with intelligent search engine
  const localResults = useMemo(() => {
    if (!query.trim()) {
      return songs.slice(0, 10);
    }
    return searchItems(songs, query.trim());
  }, [songs, query]);

  // Debounced API search to fetch any matched release from the 1,330 Subam YouTube catalog
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setApiResults([]);
      setIsLoadingApi(false);
      return;
    }

    setIsLoadingApi(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.results)) {
            setApiResults(data.results);
          }
        }
      } catch (err) {
        console.warn('Search API error:', err);
      } finally {
        setIsLoadingApi(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Unified deduplicated results: combines instant local results with server catalog results
  const combinedResults = useMemo(() => {
    if (!query.trim()) {
      return localResults;
    }

    const map = new Map<string, Song>();
    
    // 1. Add local master tracks first (ensures MP3 stream links are preserved)
    localResults.forEach(song => {
      map.set(song.id, song);
    });

    // 2. Add API results (including 1,330 Subam official YouTube catalog releases)
    apiResults.forEach(song => {
      if (!map.has(song.id)) {
        // Also check if same title already exists
        const exists = Array.from(map.values()).some(
          s => s.title.toLowerCase().trim() === song.title.toLowerCase().trim()
        );
        if (!exists) {
          map.set(song.id, song);
        }
      }
    });

    const all = Array.from(map.values());

    // Apply Tab Filter
    if (activeTab === 'MASTER') {
      return all.filter(s => !!s.fullAudioUrl || !!s.customUploadedAudioUrl || s.id.startsWith('track-sav_') || s.id.startsWith('slot-'));
    }
    if (activeTab === 'YOUTUBE') {
      return all.filter(s => s.id.startsWith('yt-') || !!s.youtubeVideoId);
    }

    return all;
  }, [query, localResults, apiResults, activeTab]);

  if (!isSearchOpen) return null;

  const handlePlay = (song: Song) => {
    if (currentTrack?.id === song.id && isPlaying) {
      pauseSong();
    } else {
      playSong(song);
      showToast(`Playing ${song.title}`, 'success');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-3 sm:px-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setIsSearchOpen(false)}
    >
      <div 
        id="search-modal-container"
        className="w-full max-w-3xl rounded-2xl bg-[#120E0A] border border-[#FFDE00]/40 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#17120D] flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#FFDE00]/10 border border-[#FFDE00]/30 text-[#FFDE00] shrink-0">
            <Search className="w-5 h-5" />
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              id="search-modal-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by song name (Sevvadaikari, Vinai Theerkum), singer (S.P.B., Shobana), God (Sivan, Murugan), or album..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#736A61] focus:outline-none focus:border-[#FFDE00] transition-colors"
            />
            {isLoadingApi && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-[#FFDE00] animate-spin" />
              </div>
            )}
          </div>

          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs font-semibold text-[#8C8379] hover:text-white px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              Clear
            </button>
          )}

          <button
            id="search-modal-close-btn"
            onClick={() => setIsSearchOpen(false)}
            className="p-2 rounded-xl text-[#8C8379] hover:text-white hover:bg-white/10 transition-colors shrink-0"
            title="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search Keyword Chips */}
        <div className="px-4 py-2.5 border-b border-white/5 bg-[#0F0B08] overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="text-[11px] font-black text-[#FFDE00] uppercase tracking-wider shrink-0">
            Quick:
          </span>
          {QUICK_SEARCH_PILLS.map((pill) => (
            <button
              key={pill.query}
              onClick={() => setQuery(pill.query)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                query.toLowerCase() === pill.query.toLowerCase()
                  ? 'bg-[#FFDE00] text-black font-bold shadow-md shadow-[#FFDE00]/20'
                  : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/5'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Results Category Tabs */}
        {query.trim() && (
          <div className="px-4 py-2 bg-[#140F0B] border-b border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  activeTab === 'ALL'
                    ? 'bg-[#FFDE00] text-black'
                    : 'text-[#8C8379] hover:text-white'
                }`}
              >
                All Songs ({combinedResults.length})
              </button>
              <button
                onClick={() => setActiveTab('MASTER')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  activeTab === 'MASTER'
                    ? 'bg-[#FFDE00] text-black'
                    : 'text-[#8C8379] hover:text-white'
                }`}
              >
                Master MP3
              </button>
              <button
                onClick={() => setActiveTab('YOUTUBE')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  activeTab === 'YOUTUBE'
                    ? 'bg-[#FFDE00] text-black'
                    : 'text-[#8C8379] hover:text-white'
                }`}
              >
                YouTube Releases
              </button>
            </div>

            <div className="text-[11px] text-[#8C8379]">
              Showing matching devotional songs
            </div>
          </div>
        )}

        {/* Results Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {!query.trim() && (
            <div className="text-[11px] font-black uppercase tracking-wider text-[#FFDE00] px-2 py-1 flex items-center gap-1.5">
              <Disc3 className="w-3.5 h-3.5" />
              <span>Recommended Sacred Devotional Tracks</span>
            </div>
          )}

          {combinedResults.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#8C8379]">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-base text-white font-bold">No devotional songs found for "{query}"</p>
              <p className="text-xs text-[#8C8379] max-w-md mx-auto">
                Try searching with singer names (e.g. <b>S.P.B.</b>, <b>Mahanadhi Shobana</b>), song names (<b>Sevvadaikari</b>, <b>Vinai Theerkum</b>), or deities (<b>Sivan</b>, <b>Murugan</b>).
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                {QUICK_SEARCH_PILLS.slice(0, 5).map((p) => (
                  <button
                    key={p.query}
                    onClick={() => setQuery(p.query)}
                    className="px-3 py-1.5 rounded-lg bg-[#FFDE00]/10 border border-[#FFDE00]/30 text-xs font-bold text-[#FFDE00] hover:bg-[#FFDE00] hover:text-black transition-colors"
                  >
                    Search {p.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            combinedResults.map((song) => {
              const isCurrent = currentTrack?.id === song.id;
              const isThisPlaying = isCurrent && isPlaying;
              const isMaster = !!song.fullAudioUrl || !!song.customUploadedAudioUrl || song.id.startsWith('track-sav_') || song.id.startsWith('slot-');
              const albumTag = song.albumCode ? song.albumCode.replace('SAV_', 'ACD ') : song.albumTitle;

              return (
                <div
                  key={song.id}
                  className={`group relative p-3 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-[#FFDE00]/10 border-[#FFDE00] shadow-md shadow-[#FFDE00]/10'
                      : 'bg-[#16110C] hover:bg-[#1C1610] border-white/5 hover:border-[#FFDE00]/40'
                  }`}
                >
                  {/* Left: Thumbnail & Title Info */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div 
                      onClick={() => handlePlay(song)}
                      className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/80 shrink-0 border border-white/10 cursor-pointer shadow-md"
                    >
                      <img
                        src={song.coverImage}
                        alt={song.title}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/shiva.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {isThisPlaying ? (
                          <Pause className="w-5 h-5 text-[#FFDE00] fill-current" />
                        ) : (
                          <Play className="w-5 h-5 text-[#FFDE00] fill-current ml-0.5" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      {/* Badges Row */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {albumTag && (
                          <span className="px-2 py-0.5 rounded bg-[#FFDE00]/15 border border-[#FFDE00]/30 text-[10px] font-black text-[#FFDE00] uppercase tracking-wider">
                            {albumTag}
                          </span>
                        )}
                        {isMaster ? (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                            320kbps MP3
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-[10px] font-bold text-red-400 flex items-center gap-1">
                            <Youtube className="w-3 h-3 fill-current" />
                            YouTube Release
                          </span>
                        )}
                        {song.deityTamilName && (
                          <span className="text-[10px] text-white/60 truncate">
                            • {song.deityTamilName}
                          </span>
                        )}
                      </div>

                      {/* Song Title with Highlighting */}
                      <h4 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-[#FFDE00] transition-colors">
                        {splitForHighlight(song.title, query).map((part, idx) => (
                          <span 
                            key={idx} 
                            className={part.isMatch ? 'bg-[#FFDE00]/30 text-[#FFDE00] font-black rounded px-0.5' : ''}
                          >
                            {part.text}
                          </span>
                        ))}
                      </h4>

                      {/* Tamil Title & Singer */}
                      <p className="text-xs text-[#A89F91] truncate flex items-center gap-2">
                        {song.tamilTitle && song.tamilTitle !== song.title && (
                          <span className="text-white/80 font-medium truncate">
                            {song.tamilTitle}
                          </span>
                        )}
                        <span className="shrink-0 flex items-center gap-1">
                          <Mic2 className="w-3 h-3 text-[#FFDE00]/70" />
                          {song.credits?.singer || 'Subam Devotional Vocalist'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Play Audio / Stream Button */}
                    <button
                      onClick={() => handlePlay(song)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                        isThisPlaying
                          ? 'bg-[#E52020] text-white'
                          : 'bg-[#FFDE00] hover:bg-[#ffe74c] text-black active:scale-95'
                      }`}
                      title={isThisPlaying ? 'Pause' : 'Play Song'}
                    >
                      {isThisPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          <span>Play</span>
                        </>
                      )}
                    </button>

                    {/* YouTube Watch Button */}
                    <button
                      onClick={() => {
                        openInYouTube(song);
                        setIsSearchOpen(false);
                      }}
                      className="p-2 rounded-xl bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 transition-all"
                      title="Watch and play on official YouTube channel"
                    >
                      <Youtube className="w-4 h-4 fill-current" />
                    </button>

                    {/* Lyrics Button */}
                    <button
                      onClick={() => {
                        openLyrics(song);
                        setIsSearchOpen(false);
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-[#FFDE00] border border-white/10 transition-colors"
                      title="View Sacred Lyrics"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    {/* Buy / Digital Master Purchase */}
                    {song.price > 0 && (
                      <button
                        onClick={() => {
                          openCheckout(song);
                          setIsSearchOpen(false);
                        }}
                        className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-[#FFDE00] text-white/90 hover:text-black border border-white/10 text-xs font-bold transition-all flex items-center gap-1"
                        title="Download 320kbps Master"
                      >
                        <Download className="w-3 h-3" />
                        <span>₹{song.price}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Info */}
        <div className="px-4 py-2.5 border-t border-white/10 bg-[#0F0B08] flex items-center justify-between text-[11px] text-[#8C8379]">
          <div className="flex items-center gap-2">
            <span>Subam Audio Vision Search Index:</span>
            <span className="font-bold text-white">85 Master Albums</span>
            <span>•</span>
            <span className="font-bold text-white">1,330+ YouTube Releases</span>
          </div>
          <span className="hidden sm:inline">Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
