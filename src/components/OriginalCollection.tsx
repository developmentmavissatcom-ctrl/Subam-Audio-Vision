import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Song } from '../types';
import { 
  Play, 
  Pause, 
  Heart, 
  FileText, 
  Download, 
  Search, 
  Music2, 
  Disc, 
  Clock, 
  Check, 
  Filter
} from 'lucide-react';

export const OriginalCollection: React.FC = () => {
  const { 
    songs, 
    categories, 
    currentTrack, 
    isPlaying, 
    playSong, 
    pauseSong, 
    toggleFavorite, 
    openLyrics, 
    openCheckout,
    selectedCategory,
    setSelectedCategory
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedDeity, setSelectedDeity] = useState('ALL');

  const filteredSongs = useMemo(() => {
    return songs.filter(song => {
      // Category filter
      if (selectedCategory && selectedCategory !== 'all' && song.categoryId !== selectedCategory) {
        return false;
      }
      // Deity filter
      if (selectedDeity !== 'ALL' && song.deity !== selectedDeity) {
        return false;
      }
      // Search query filter
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchTitle = song.title.toLowerCase().includes(q);
        const matchTamil = song.tamilTitle?.toLowerCase().includes(q) || false;
        const matchSinger = song.credits?.singer?.toLowerCase().includes(q) || false;
        const matchCat = song.categoryName?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchTamil && !matchSinger && !matchCat) {
          return false;
        }
      }
      return true;
    });
  }, [songs, selectedCategory, selectedDeity, query]);

  return (
    <section id="original-collection-section" className="py-16 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[2000px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A140B] border border-[#D4AF37]/30 text-[#F0C75E] text-xs font-semibold uppercase tracking-widest mb-3">
            <Music2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Master Recordings & Audio Vault</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-cinzel text-white">
            Original Devotional Collection
          </h2>
          <p className="text-sm text-[#A89F95] mt-1.5 max-w-xl">
            Lossless devotional songs composed and recorded for Subam Audio Vision. Available for streaming and instant master track download.
          </p>
        </div>

        {/* Search input in collection */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#8C8379] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, singer, ragam..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#14100C] border border-white/10 text-white text-xs placeholder-[#736A61] focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'bg-[#14110C] border border-white/10 text-[#C2B7AC] hover:border-[#D4AF37]/40'
          }`}
        >
          All Categories ({songs.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'bg-[#14110C] border border-white/10 text-[#C2B7AC] hover:border-[#D4AF37]/40'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Songs Grid / Table */}
      {filteredSongs.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#120E0A] border border-white/5 space-y-3">
          <Disc className="w-10 h-10 text-[#6B635A] mx-auto animate-spin" />
          <p className="text-base text-white font-semibold">No devotional songs found</p>
          <p className="text-xs text-[#8C8379]">Try clearing your search query or selecting a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredSongs.map((song: Song) => {
            const isCurrent = currentTrack?.id === song.id;
            const isThisPlaying = isCurrent && isPlaying;

            return (
              <div
                key={song.id}
                className={`group rounded-2xl p-4 bg-[#120E0A] border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-[0_4px_20px_rgba(212,175,55,0.15)]'
                    : 'border-white/5 hover:border-[#D4AF37]/40 hover:bg-[#18130E]'
                }`}
              >
                {/* Artwork & Play overlay */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-black mb-3.5">
                  <img
                    src={song.coverImage}
                    alt={song.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/Subam%20logo.png';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Play Button Overlay */}
                  <button
                    onClick={() => isThisPlaying ? pauseSong() : playSong(song)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity"
                    aria-label={isThisPlaying ? 'Pause song' : 'Play song'}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37] text-black flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                      {isThisPlaying ? (
                        <Pause className="w-5 h-5 fill-black" />
                      ) : (
                        <Play className="w-5 h-5 fill-black ml-0.5" />
                      )}
                    </div>
                  </button>

                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#D4AF37]" />
                    {song.duration}
                  </div>

                  {/* Price Tag */}
                  <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#1A140B]/90 backdrop-blur-sm border border-[#D4AF37]/40 text-[#F0C75E] text-[11px] font-bold">
                    ₹{song.price}
                  </div>
                </div>

                {/* Song Meta */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1 group-hover:text-[#F0C75E] transition-colors">
                      {song.title}
                    </h3>
                    {song.tamilTitle && (
                      <p className="text-xs text-[#D4AF37] font-serif font-medium mt-0.5 line-clamp-1">
                        {song.tamilTitle}
                      </p>
                    )}
                    <p className="text-xs text-[#998F84] mt-1 line-clamp-1">
                      {song.credits?.singer || 'Subam Devotional Vocalist'}
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavorite(song.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          song.isFavorited ? 'text-red-500 hover:bg-red-500/10' : 'text-[#8C8379] hover:text-white hover:bg-white/5'
                        }`}
                        title="Favorite"
                      >
                        <Heart className={`w-4 h-4 ${song.isFavorited ? 'fill-red-500' : ''}`} />
                      </button>

                      <button
                        onClick={() => openLyrics(song)}
                        className="p-2 rounded-lg text-[#8C8379] hover:text-[#F0C75E] hover:bg-white/5 transition-colors"
                        title="View Lyrics"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => openCheckout(song)}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F0C75E] text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
