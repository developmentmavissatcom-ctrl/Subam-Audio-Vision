import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Disc3, 
  Play, 
  Clock, 
  Music2, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Youtube, 
  Layers, 
  ExternalLink,
  Search,
  Copy,
  Check,
  Filter
} from 'lucide-react';
import { YouTubeStream } from '../types';

export const SacredJukeboxSection: React.FC = () => {
  const { youtubeStreams, openYouTubeModal, showToast, language, t } = useApp();
  const [expandedTracklists, setExpandedTracklists] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(18);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter exclusively for Jukebox compilations
  const allJukeboxStreams = useMemo(() => {
    return youtubeStreams.filter(
      (s: YouTubeStream) => s.categoryType === 'JUKEBOX' || (!s.categoryType && s.status !== 'LIVE' && s.type !== 'LIVE')
    );
  }, [youtubeStreams]);

  // Categories list with counts
  const categories = useMemo(() => {
    const map: Record<string, number> = {};
    allJukeboxStreams.forEach(item => {
      const cat = (item as any).deityCategory || 'Lord Shiva & Arunachala';
      map[cat] = (map[cat] || 0) + 1;
    });

    return [
      { id: 'all', label: 'All Jukeboxes', count: allJukeboxStreams.length },
      { id: 'shiva', label: 'Lord Shiva & Arunachala', count: map['Lord Shiva & Arunachala'] || 0 },
      { id: 'amman', label: 'Goddess Amman & Shakthi', count: map['Goddess Amman & Shakthi'] || 0 },
      { id: 'murugan', label: 'Lord Murugan & Skanda', count: map['Lord Murugan & Skanda'] || 0 },
      { id: 'vinayagar', label: 'Lord Ganesha & Vinayagar', count: map['Lord Ganesha & Vinayagar'] || 0 },
      { id: 'ayyappan', label: 'Swami Ayyappan', count: map['Swami Ayyappan & Sabarimala'] || 0 },
      { id: 'perumal', label: 'Lord Perumal & Venkateswara', count: map['Lord Perumal & Venkateswara'] || 0 },
      { id: 'hanuman', label: 'Hanuman & Others', count: map['Lord Hanuman & Anjaneyar'] || 0 },
    ];
  }, [allJukeboxStreams]);

  // Filtered Jukebox list
  const filteredJukeboxes = useMemo(() => {
    return allJukeboxStreams.filter((item: YouTubeStream) => {
      const q = searchQuery.toLowerCase().trim();
      const deityCat = (item as any).deityCategory || '';
      
      // Category filter
      if (selectedCategory === 'shiva' && !deityCat.includes('Shiva')) return false;
      if (selectedCategory === 'amman' && !deityCat.includes('Amman')) return false;
      if (selectedCategory === 'murugan' && !deityCat.includes('Murugan')) return false;
      if (selectedCategory === 'vinayagar' && !deityCat.includes('Ganesha')) return false;
      if (selectedCategory === 'ayyappan' && !deityCat.includes('Ayyappan')) return false;
      if (selectedCategory === 'perumal' && !deityCat.includes('Perumal')) return false;
      if (selectedCategory === 'hanuman' && !deityCat.includes('Hanuman')) return false;

      // Search query
      if (q) {
        const titleMatch = item.title.toLowerCase().includes(q);
        const tamilMatch = item.tamilTitle?.toLowerCase().includes(q) || false;
        const artistMatch = item.artists?.toLowerCase().includes(q) || false;
        const descMatch = item.description?.toLowerCase().includes(q) || false;
        const tracksMatch = item.tracksList?.some(t => t.toLowerCase().includes(q)) || false;
        return titleMatch || tamilMatch || artistMatch || descMatch || tracksMatch;
      }

      return true;
    });
  }, [allJukeboxStreams, selectedCategory, searchQuery]);

  const displayedJukeboxes = filteredJukeboxes.slice(0, visibleCount);

  const toggleTracklist = (id: string) => {
    setExpandedTracklists(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('YouTube link copied to clipboard! 🙏', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <section 
      id="sacred-jukebox-section" 
      className="py-16 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[2000px] mx-auto space-y-10"
    >
      {/* Jukebox Master Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#D4AF37]/25">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F1708] border border-[#D4AF37]/40 text-[#F0C75E] text-xs font-extrabold uppercase tracking-widest">
            <Disc3 className="w-3.5 h-3.5 text-[#D4AF37] animate-spin-slow" />
            <span>{language === 'ta' ? `சுபம் பக்தி ஜூக்பாக்ஸ் • ${allJukeboxStreams.length} ஆல்பங்கள்` : `Subam Sacred Jukebox • ${allJukeboxStreams.length} Master Album Compilations`}</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-cinzel text-white">
            {language === 'ta' ? 'புனித பக்தி ஜூக்க்பாக்ஸ்' : 'Sacred Devotional Jukeboxes'}
          </h2>
          
          <p className="text-sm sm:text-base text-[#D0C5B0] max-w-2xl leading-relaxed">
            {language === 'ta'
              ? 'சுபம் ஆடியோ விஷன் அதிகாரப்பூர்வ யூடியூப் தளத்திலிருந்து நேரடியாக தடையற்ற 45 முதல் 90 நிமிட பக்தி இசை ஆல்பங்கள், தியானம் மற்றும் பூஜைக்கான பாடல் தொகுப்புகள்.'
              : 'Continuous, uninterrupted studio master album collections fetched directly from the official Subam Audio Vision YouTube channel. Non-stop 45-to-90 minute continuous devotional listening experiences mastered in pristine 24-bit studio audio for puja, meditation, temple walking, and sacred festivities.'}
          </p>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#D4AF37] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={language === 'ta' ? 'ஜூக்க்பாக்ஸ், பாடல், தெய்வம், பாடகர் (SPB, வீரமணி) மூலம் தேடுக...' : 'Search jukeboxes by song, deity, singer (SPB, Unnikrishnan, Veeramani), or festival...'}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(18); // Reset page size on search
            }}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/60 border border-[#D4AF37]/30 text-white placeholder-[#8A8279] text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#A89F95] hover:text-white"
            >
              {language === 'ta' ? 'நீக்குக' : 'Clear'}
            </button>
          )}
        </div>

        {/* Deity Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <Filter className="w-4 h-4 text-[#D4AF37] shrink-0 mr-1 hidden sm:inline-block" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setVisibleCount(18);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-[#D4AF37] text-black shadow-md shadow-amber-950/40 scale-105'
                  : 'bg-black/50 text-[#C4B8A8] border border-white/10 hover:border-[#D4AF37]/50 hover:text-white'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === cat.id ? 'bg-black/30 text-black' : 'bg-white/10 text-[#A89F95]'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Results summary counter */}
        <div className="flex items-center justify-between text-xs text-[#A89F95] px-1">
          <span>
            Showing <strong className="text-white">{displayedJukeboxes.length}</strong> of <strong className="text-[#D4AF37]">{filteredJukeboxes.length}</strong> jukebox compilations
          </span>
          {searchQuery && (
            <span>
              Filtered for <em className="text-white">"{searchQuery}"</em>
            </span>
          )}
        </div>
      </div>

      {/* Jukebox Cards Grid */}
      {displayedJukeboxes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedJukeboxes.map((jukebox: YouTubeStream) => {
            const isExpanded = !!expandedTracklists[jukebox.id];
            const isCopied = copiedId === jukebox.id;

            return (
              <div
                key={jukebox.id}
                className="group rounded-2xl overflow-hidden bg-[#120E0A] border border-[#D4AF37]/25 hover:border-[#D4AF37]/70 transition-all duration-300 flex flex-col shadow-xl hover:shadow-amber-950/30"
              >
                {/* Thumbnail Container */}
                <div 
                  className="relative aspect-video bg-black overflow-hidden cursor-pointer"
                  onClick={() => openYouTubeModal(jukebox)}
                >
                  <img
                    src={jukebox.thumbnailUrl}
                    alt={jukebox.title}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/shiva.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />

                  {/* Master Jukebox Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[#F0C75E] text-[11px] font-extrabold tracking-wider uppercase flex items-center gap-1.5 border border-[#D4AF37]/40 shadow-lg">
                      <Disc3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                      MASTER JUKEBOX
                    </span>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {jukebox.durationLabel && (
                      <div className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1 border border-white/10">
                        <Clock className="w-3 h-3 text-[#D4AF37]" />
                        <span>{jukebox.durationLabel}</span>
                      </div>
                    )}
                  </div>

                  {/* Artist Credits Badge */}
                  {jukebox.artists && (
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-[11px] font-semibold text-white/90 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded border border-[#D4AF37]/20 truncate">
                      <Music2 className="w-3 h-3 text-[#D4AF37] shrink-0" />
                      <span className="truncate">{jukebox.artists}</span>
                    </div>
                  )}

                  {/* Hover Play Button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#D4AF37] text-black flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-6 h-6 fill-black ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Info Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8A8279] mb-2">
                      <span className="text-[#D4AF37] font-semibold flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {jukebox.trackCount ? `${jukebox.trackCount} Continuous Hymns` : 'Multi-Track Album'}
                      </span>
                      {jukebox.viewersCount && (
                        <span className="text-white/60">
                          {jukebox.viewersCount >= 1000000 
                            ? `${(jukebox.viewersCount / 1000000).toFixed(1)}M+ Views`
                            : `${Math.floor(jukebox.viewersCount / 1000)}K+ Views`}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-white line-clamp-2 group-hover:text-[#F0C75E] transition-colors">
                      {jukebox.title}
                    </h4>

                    {jukebox.tamilTitle && (
                      <p className="text-xs text-[#D4AF37] font-medium mt-1 truncate">
                        {jukebox.tamilTitle}
                      </p>
                    )}

                    <p className="text-xs text-[#9E958B] mt-2 line-clamp-2 leading-relaxed">
                      {jukebox.description}
                    </p>

                    {/* Direct YouTube Video Link Display */}
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#A89F95]">
                      <span className="font-mono text-[#D4AF37]">ID: {jukebox.youtubeVideoId}</span>
                      <button
                        onClick={() => handleCopyLink(jukebox.youtubeUrl, jukebox.id)}
                        className="flex items-center gap-1 text-[#C4B8A8] hover:text-[#F0C75E] transition-colors cursor-pointer"
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

                  {/* Expandable Chapter Tracklist */}
                  {jukebox.tracksList && jukebox.tracksList.length > 0 && (
                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <button
                        onClick={() => toggleTracklist(jukebox.id)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-[#D4AF37] hover:text-[#F0C75E] py-1 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          <span>{isExpanded ? 'Hide Tracklist' : `View Included Hymns (${jukebox.tracksList.length})`}</span>
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-2.5 rounded-xl bg-black/70 border border-[#D4AF37]/20 space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar text-xs">
                          {jukebox.tracksList.map((trackName, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[#DDD3C4] py-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                              <span className="truncate">{trackName}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bottom Action Row */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <a
                      href={jukebox.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#A89F95] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
                    >
                      <Youtube className="w-4 h-4 text-red-500" />
                      <span>YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => openYouTubeModal(jukebox)}
                      className="px-4 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#F0C75E] text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-105"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play Full Jukebox</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-black/40 border border-[#D4AF37]/20 p-8 space-y-3">
          <Disc3 className="w-10 h-10 text-[#D4AF37] mx-auto opacity-50" />
          <h4 className="text-lg font-bold text-white">No Jukebox Compilations Found</h4>
          <p className="text-sm text-[#A89F95] max-w-md mx-auto">
            No albums matched your current filter criteria. Try searching with a different keyword or select "All Jukeboxes".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#D4AF37] text-black text-xs font-bold mt-2"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Pagination / Load More Controls */}
      {filteredJukeboxes.length > visibleCount && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <button
            onClick={() => setVisibleCount(prev => Math.min(prev + 18, filteredJukeboxes.length))}
            className="px-6 py-3 rounded-xl bg-[#1A1308] hover:bg-[#2A1D0B] text-[#F0C75E] border border-[#D4AF37]/40 text-xs font-extrabold transition-all shadow-lg hover:scale-105 cursor-pointer flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-[#D4AF37]" />
            <span>Load More Jukeboxes (Showing {displayedJukeboxes.length} of {filteredJukeboxes.length})</span>
          </button>

          <button
            onClick={() => setVisibleCount(filteredJukeboxes.length)}
            className="px-5 py-3 rounded-xl bg-black/60 hover:bg-black/90 text-[#C4B8A8] hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
          >
            Show All ({filteredJukeboxes.length})
          </button>
        </div>
      )}
    </section>
  );
};
