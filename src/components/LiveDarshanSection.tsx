import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Radio, 
  Play, 
  Eye,
  Clock, 
  MapPin, 
  Youtube,
  Maximize2,
  Calendar,
  History,
  Search,
  Copy,
  Check
} from 'lucide-react';
import { YouTubeStream } from '../types';

export const LiveDarshanSection: React.FC = () => {
  const { youtubeStreams, openYouTubeModal, showToast, language, t } = useApp();
  const mainPlayerRef = useRef<HTMLDivElement>(null);

  // 1. Separate Current Live Feeds vs Previous Live Recordings
  const currentLiveStreams = useMemo(() => {
    return youtubeStreams.filter(
      (s: YouTubeStream) => s.categoryType === 'LIVE_DARSHAN' && s.status === 'LIVE'
    );
  }, [youtubeStreams]);

  const previousLiveStreams = useMemo(() => {
    return youtubeStreams.filter(
      (s: YouTubeStream) => s.categoryType === 'LIVE_DARSHAN' && (s.status === 'ENDED' || s.type === 'REPLAY')
    );
  }, [youtubeStreams]);

  // Active stream currently displayed in the main live box (defaults to first live stream)
  const [activeStreamId, setActiveStreamId] = useState<string>(
    currentLiveStreams[0]?.id || previousLiveStreams[0]?.id || ''
  );

  // Whether the inline YouTube player is actively playing inside the main box
  const [isPlayingInline, setIsPlayingInline] = useState<boolean>(false);

  // Filter and search state for previous live recordings
  const [previousFilter, setPreviousFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Find the currently active stream object
  const activeStream = youtubeStreams.find(s => s.id === activeStreamId) || currentLiveStreams[0] || previousLiveStreams[0];
  const isCurrentLive = activeStream?.status === 'LIVE';

  // Handle switching stream in the main box
  const handleSelectStream = (stream: YouTubeStream, autoPlay: boolean = false) => {
    setActiveStreamId(stream.id);
    if (autoPlay) {
      setIsPlayingInline(true);
    }
    // Smoothly scroll to main player box
    if (mainPlayerRef.current) {
      mainPlayerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('YouTube link copied to clipboard! 🙏', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filter previous live videos
  const filteredPreviousLive = useMemo(() => {
    return previousLiveStreams.filter((stream: YouTubeStream) => {
      const q = searchQuery.toLowerCase().trim();
      const titleLower = stream.title.toLowerCase();
      const templeLower = (stream.templeName || '').toLowerCase();
      const festivalLower = (stream.festivalName || '').toLowerCase();

      // Category filter
      if (previousFilter === 'shiva') {
        const isShiva = titleLower.includes('deepam') || titleLower.includes('பிரதோஷம்') || titleLower.includes('சோமவார') || templeLower.includes('arunachala') || templeLower.includes('shiva') || titleLower.includes('அண்ணாமலையார்') || titleLower.includes('சிவன்');
        if (!isShiva) return false;
      } else if (previousFilter === 'murugan') {
        const isMurugan = titleLower.includes('palani') || titleLower.includes('பழனி') || titleLower.includes('tiruchendur') || titleLower.includes('திருச்செந்தூர்') || titleLower.includes('murugan') || titleLower.includes('முருகன்') || titleLower.includes('சூரசம்ஹாரம்');
        if (!isMurugan) return false;
      } else if (previousFilter === 'amman') {
        const isAmman = titleLower.includes('samayapuram') || titleLower.includes('சமயபுரம்') || titleLower.includes('மாரியம்மன்') || titleLower.includes('அம்மன்') || titleLower.includes('குலசை') || titleLower.includes('மீனாட்சி') || titleLower.includes('meenakshi');
        if (!isAmman) return false;
      } else if (previousFilter === 'ayyappan') {
        const isAyyappan = titleLower.includes('sabarimala') || titleLower.includes('சபரிமலை') || titleLower.includes('ayyappan') || titleLower.includes('ஐயப்பன்') || titleLower.includes('ஜோதி');
        if (!isAyyappan) return false;
      } else if (previousFilter === 'perumal') {
        const isPerumal = titleLower.includes('srirangam') || titleLower.includes('ஸ்ரீரங்கம்') || titleLower.includes('ரங்கநாதர்') || titleLower.includes('பெருமாள்') || titleLower.includes('திருநள்ளாறு');
        if (!isPerumal) return false;
      }

      // Search query
      if (q) {
        const titleMatch = titleLower.includes(q);
        const tamilMatch = stream.tamilTitle?.toLowerCase().includes(q) || false;
        const templeMatch = templeLower.includes(q);
        const festMatch = festivalLower.includes(q);
        const descMatch = stream.description?.toLowerCase().includes(q) || false;
        return titleMatch || tamilMatch || templeMatch || festMatch || descMatch;
      }

      return true;
    });
  }, [previousLiveStreams, previousFilter, searchQuery]);

  const displayedPreviousLive = filteredPreviousLive.slice(0, visibleCount);

  return (
    <section 
      id="live-darshan-section" 
      ref={mainPlayerRef}
      className="py-16 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[2000px] mx-auto space-y-12"
    >
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-red-500/20">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#200A0A] border border-red-500/40 text-[#FF4D4D] text-xs font-extrabold uppercase tracking-widest">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span>நேரலை தரிசனம் • Real-Time Temple Feeds & Festival Archives</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-cinzel text-white">
            Sacred Live Temple Darshan
          </h2>
          
          <p className="text-sm sm:text-base text-[#C4A8A8] max-w-2xl leading-relaxed">
            Direct visual telecasts from South India's holiest sanctums. Experience continuous Akhanda Darshans, nitya poojas, deeparadhanai, and 24/7 Girivalam feeds alongside the complete archive of {previousLiveStreams.length} recorded festival live telecasts from Subam Audio Vision.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MAIN LIVE BOX FOR THE CURRENT LIVE TO PLAY                             */}
      {/* ========================================================================= */}
      {activeStream && (
        <div className="rounded-3xl overflow-hidden bg-gradient-to-b from-[#1E0F0C] via-[#140A08] to-[#0A0504] border-2 border-red-500/40 shadow-2xl shadow-red-950/50">
          {/* Main Box Header Bar */}
          <div className="p-4 sm:p-5 bg-black/60 border-b border-red-500/20 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isCurrentLive ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black tracking-wider uppercase shadow-md animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <span>DIRECT LIVE SANCTUM TELECAST</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-[#F5C542] text-xs font-black tracking-wider uppercase shadow-md">
                  <History className="w-3.5 h-3.5" />
                  <span>ARCHIVED LIVE RECORDING • FULL REPLAY</span>
                </div>
              )}

              {activeStream.templeName && (
                <div className="flex items-center gap-1.5 text-xs text-[#E8D8D8] font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>{activeStream.templeName}</span>
                </div>
              )}
            </div>

            {/* Viewers & Actions */}
            <div className="flex items-center gap-3">
              {activeStream.viewersCount && (
                <div className="flex items-center gap-1.5 text-xs text-red-300 font-mono bg-red-950/40 px-3 py-1 rounded-full border border-red-500/30">
                  <Eye className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  <span>
                    {activeStream.viewersCount >= 1000000 
                      ? `${(activeStream.viewersCount / 1000000).toFixed(1)}M Views`
                      : `${Math.floor(activeStream.viewersCount / 1000)}K Views`}
                  </span>
                </div>
              )}

              <button
                onClick={() => openYouTubeModal(activeStream)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Expand to Fullscreen Theatre"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Theatre View</span>
              </button>

              <a
                href={activeStream.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>Watch on YouTube</span>
              </a>
            </div>
          </div>

          {/* Video Player Display Area */}
          <div className="relative aspect-video w-full bg-black">
            {isPlayingInline ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeStream.youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`}
                title={activeStream.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div 
                className="relative w-full h-full cursor-pointer group"
                onClick={() => setIsPlayingInline(true)}
              >
                <img
                  src={activeStream.thumbnailUrl}
                  alt={activeStream.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/shiva.jpg';
                  }}
                  className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 brightness-90 group-hover:brightness-100"
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Center Play Button Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl shadow-red-950/80 group-hover:scale-110 group-hover:bg-red-600 transition-all border-2 border-white/40">
                    <Play className="w-9 h-9 fill-white ml-1" />
                  </div>
                  <span className="px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-bold tracking-wider uppercase border border-red-500/40">
                    Click to Start Direct Playback
                  </span>
                </div>

                {/* Title inside Player Bar */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-black/75 backdrop-blur-md text-[#F0C75E] text-xs font-bold border border-white/10 mb-2">
                    <Radio className="w-3.5 h-3.5 text-red-500" />
                    <span>{activeStream.festivalName || 'Sacred Temple Live Darshan'}</span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-white drop-shadow-md">
                    {activeStream.title}
                  </h3>
                  {activeStream.timing && (
                    <p className="text-xs sm:text-sm text-[#E0D0C0] mt-1 drop-shadow">
                      {activeStream.timing}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Box Interactive Footer Bar */}
          <div className="p-4 sm:p-6 bg-[#0E0605] border-t border-red-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                  Now Playing in Main Live Box
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">
                {activeStream.title}
              </h4>
              <p className="text-xs text-[#B09F9F] line-clamp-2">
                {activeStream.description}
              </p>
              <div className="flex items-center gap-4 pt-1 text-xs text-[#E0D0D0]">
                {activeStream.broadcastDate && (
                  <span className="flex items-center gap-1 text-[#D4AF37]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{activeStream.broadcastDate}</span>
                  </span>
                )}
                {activeStream.durationLabel && (
                  <span className="flex items-center gap-1 text-white/70">
                    <Clock className="w-3.5 h-3.5 text-red-400" />
                    <span>{activeStream.durationLabel}</span>
                  </span>
                )}
                <span className="font-mono text-[#D4AF37]">ID: {activeStream.youtubeVideoId}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleCopyLink(activeStream.youtubeUrl, activeStream.id)}
                className="p-3 rounded-2xl bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Copy Video Link"
              >
                {copiedId === activeStream.id ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Sanctum Switcher Tabs (Direct Live Feeds) */}
          {currentLiveStreams.length > 0 && (
            <div className="p-4 bg-[#140807] border-t border-red-500/20">
              <div className="text-xs font-bold text-[#E0C0C0] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span>Switch Live Sanctum Feed:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {currentLiveStreams.map((stream: YouTubeStream) => {
                  const isSelected = stream.id === activeStreamId;
                  return (
                    <button
                      key={stream.id}
                      onClick={() => handleSelectStream(stream, true)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-red-950/60 border-red-500 shadow-md shadow-red-950/50 scale-[1.02]'
                          : 'bg-black/40 border-white/10 hover:border-red-500/40 hover:bg-black/70'
                      }`}
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-black">
                        <img
                          src={stream.thumbnailUrl}
                          alt={stream.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/shiva.jpg';
                          }}
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-red-600/40 flex items-center justify-center">
                            <Play className="w-4 h-4 fill-white text-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">
                          {stream.templeName || stream.title}
                        </div>
                        <div className="text-[11px] text-red-300 font-medium truncate mt-0.5">
                          {stream.timing || '24/7 Akhanda Feed'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PREVIOUS LIVE DARSHANS & FESTIVAL ARCHIVES                             */}
      {/* ========================================================================= */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1208] border border-[#D4AF37]/30 text-[#F0C75E] text-xs font-bold uppercase tracking-wider mb-2">
              <History className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{language === 'ta' ? 'முந்தைய நேரலை பதிவுகள் • கோவில் திருவிழாக்கள்' : 'Recorded Festival Live Archive • Sacred Temple Broadcasts'}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-cinzel text-white">
              {language === 'ta' ? `முந்தைய நேரலை கோவில் ஒளிபரப்புகள் (${previousLiveStreams.length})` : `Previous Live Temple Telecasts (${previousLiveStreams.length})`}
            </h3>
            <p className="text-xs sm:text-sm text-[#A89F95] mt-1">
              {language === 'ta' 
                ? 'கார்த்திகை தீபம், பிரதோஷ அபிஷேகம், பழனி பங்குனி உத்திரம், சபரிமலை மகரஜோதி மற்றும் கோவில் பிரம்மோற்சவ நேரலை ஒளிபரப்புகளின் தொகுப்பு.'
                : 'Browse and play complete recordings of Karthigai Deepam, Pradosham Abhishekam, Palani Panguni Uthiram, Sabarimala Makara Jyothi, and temple Brahmotsavams.'}
            </p>
          </div>

          {/* Search Bar for Previous Live */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-red-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={language === 'ta' ? 'முந்தைய ஒளிபரப்புகளைத் தேடுக...' : 'Search previous broadcasts...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(12);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-red-500/30 text-white placeholder-[#8A8279] text-xs focus:outline-none focus:border-red-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A89F95] hover:text-white"
              >
                {language === 'ta' ? 'நீக்குக' : 'Clear'}
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills for Previous Live */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {[
            { id: 'all', label: language === 'ta' ? 'அனைத்து திருவிழாக்கள்' : 'All Festivals', count: previousLiveStreams.length },
            { id: 'shiva', label: language === 'ta' ? 'அருணாசல தீபம் & சிவன்' : 'Arunachala Deepam & Sivan' },
            { id: 'murugan', label: language === 'ta' ? 'பழனி & முருகன்' : 'Palani & Murugan' },
            { id: 'amman', label: language === 'ta' ? 'சமயபுரம் & அம்மன்' : 'Samayapuram & Shakthi' },
            { id: 'ayyappan', label: language === 'ta' ? 'சபரிமலை & ஐயப்பன்' : 'Sabarimala & Ayyappan' },
            { id: 'perumal', label: language === 'ta' ? 'ஸ்ரீரங்கம் & பெருமாள்' : 'Srirangam & Perumal' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setPreviousFilter(tab.id);
                setVisibleCount(12);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                previousFilter === tab.id
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/40 scale-105'
                  : 'bg-black/50 text-[#C4B8A8] border border-white/10 hover:border-red-500/40 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-[#A89F95] px-1">
          <span>
            Showing <strong className="text-white">{displayedPreviousLive.length}</strong> of <strong className="text-red-400">{filteredPreviousLive.length}</strong> recorded broadcasts
          </span>
          {searchQuery && (
            <span>
              Filtered for <em className="text-white">"{searchQuery}"</em>
            </span>
          )}
        </div>

        {/* Grid of Previous Live Streams */}
        {displayedPreviousLive.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPreviousLive.map((stream: YouTubeStream) => {
              const isCurrentlyInMainPlayer = stream.id === activeStreamId;
              const isCopied = copiedId === stream.id;

              return (
                <div
                  key={stream.id}
                  className={`group rounded-2xl overflow-hidden bg-[#120B09] border transition-all duration-300 flex flex-col shadow-xl ${
                    isCurrentlyInMainPlayer
                      ? 'border-red-500 shadow-red-950/50'
                      : 'border-red-500/20 hover:border-red-500/60 hover:shadow-red-950/30'
                  }`}
                >
                  {/* Thumbnail Box */}
                  <div 
                    className="relative aspect-video bg-black overflow-hidden cursor-pointer"
                    onClick={() => handleSelectStream(stream, true)}
                  >
                    <img
                      src={stream.thumbnailUrl}
                      alt={stream.title}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/shiva.jpg';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

                    {/* Recorded Live Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[#FF9E9E] text-[11px] font-extrabold tracking-wider uppercase flex items-center gap-1.5 border border-red-500/40 shadow-lg">
                        <History className="w-3.5 h-3.5 text-red-400" />
                        RECORDED LIVE
                      </span>
                    </div>

                    {/* Duration Badge */}
                    {stream.durationLabel && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1 border border-white/10">
                        <Clock className="w-3 h-3 text-red-400" />
                        <span>{stream.durationLabel}</span>
                      </div>
                    )}

                    {/* Temple / Festival Banner */}
                    {(stream.festivalName || stream.templeName) && (
                      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-[11px] font-semibold text-white/90 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 truncate">
                        <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                        <span className="truncate">{stream.festivalName || stream.templeName}</span>
                      </div>
                    )}

                    {/* Hover Play Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-13 h-13 rounded-full bg-[#CC0000] text-white flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {stream.broadcastDate && (
                        <div className="text-[11px] font-bold text-[#D4AF37] flex items-center gap-1.5 mb-1.5">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>{stream.broadcastDate}</span>
                        </div>
                      )}

                      <h4 className="text-base font-bold text-white line-clamp-2 group-hover:text-red-300 transition-colors">
                        {stream.title}
                      </h4>

                      {stream.tamilTitle && (
                        <p className="text-xs text-[#D4AF37] font-medium mt-1 truncate">
                          {stream.tamilTitle}
                        </p>
                      )}

                      <p className="text-xs text-[#9E958B] mt-2 line-clamp-2 leading-relaxed">
                        {stream.description}
                      </p>

                      {/* Video Link Display & Copy */}
                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#A89F95]">
                        <span className="font-mono text-red-400">ID: {stream.youtubeVideoId}</span>
                        <button
                          onClick={() => handleCopyLink(stream.youtubeUrl, stream.id)}
                          className="flex items-center gap-1 text-[#C4B8A8] hover:text-white transition-colors cursor-pointer"
                          title="Copy YouTube Link"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-green-400" />
                              <span className="text-green-400 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-white/50 font-mono">
                        {stream.viewersCount 
                          ? stream.viewersCount >= 1000000 
                            ? `${(stream.viewersCount / 1000000).toFixed(1)}M+ Views`
                            : `${Math.floor(stream.viewersCount / 1000)}K+ Views`
                          : 'Archived Feed'}
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={stream.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-white/60 hover:text-white p-1.5 transition-colors cursor-pointer"
                          title="Watch on YouTube"
                        >
                          <Youtube className="w-4 h-4 text-red-500" />
                        </a>

                        <button
                          onClick={() => openYouTubeModal(stream)}
                          className="p-1.5 text-white/70 hover:text-white transition-colors cursor-pointer"
                          title="Theatre View"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleSelectStream(stream, true)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isCurrentlyInMainPlayer
                              ? 'bg-red-600 text-white'
                              : 'bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30'
                          }`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{isCurrentlyInMainPlayer ? 'Playing in Box' : 'Play in Main Box'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center rounded-2xl bg-black/40 border border-red-500/20 p-8 space-y-3">
            <History className="w-10 h-10 text-red-400 mx-auto opacity-50" />
            <h4 className="text-lg font-bold text-white">No Previous Live Telecasts Found</h4>
            <p className="text-sm text-[#A89F95] max-w-md mx-auto">
              No recorded festival broadcasts matched your filter criteria. Try searching with a different temple name or reset filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setPreviousFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold mt-2"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Load More Button */}
        {filteredPreviousLive.length > visibleCount && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setVisibleCount(prev => Math.min(prev + 12, filteredPreviousLive.length))}
              className="px-6 py-3 rounded-xl bg-[#200A0A] hover:bg-[#301010] text-[#FF9E9E] border border-red-500/40 text-xs font-extrabold transition-all shadow-lg hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              <History className="w-4 h-4 text-red-400" />
              <span>Load More Broadcasts (Showing {displayedPreviousLive.length} of {filteredPreviousLive.length})</span>
            </button>

            <button
              onClick={() => setVisibleCount(filteredPreviousLive.length)}
              className="px-5 py-3 rounded-xl bg-black/60 hover:bg-black/90 text-[#C4B8A8] hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
            >
              Show All ({filteredPreviousLive.length})
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
