import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Heart, 
  ShoppingBag, 
  FileText, 
  Download, 
  Check, 
  Music2,
  Share2,
  Youtube,
  ExternalLink
} from 'lucide-react';
import { audioEngine } from '../services/audioSynthesizer';
import { INITIAL_LYRICS } from '../data/initialData';

export const ExpandedPlayer: React.FC = () => {
  const { 
    currentTrack, 
    isPlaying, 
    currentTime, 
    duration, 
    volume, 
    isMuted, 
    isPreview, 
    previewTimeLeft,
    togglePlay, 
    seek, 
    setVolume, 
    toggleMute, 
    toggleFavorite, 
    openCheckout, 
    isExpandedPlayerOpen, 
    setIsExpandedPlayerOpen,
    currentUser,
    songs,
    playSong,
    openInYouTube
  } = useApp();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<'LYRICS' | 'CREDITS' | 'RELATED' | 'YOUTUBE'>('LYRICS');

  const song = currentTrack;
  const isPurchased = song ? (currentUser?.purchasedSongIds.includes(song.id) || currentUser?.role === 'ADMIN') : false;
  const isFav = song ? currentUser?.favorites.includes(song.id) : false;
  const lyricsData = song ? INITIAL_LYRICS[song.id] : null;

  // Real-time circular / bar waveform visualizer
  useEffect(() => {
    if (!isExpandedPlayerOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dataArray = new Uint8Array(64);

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (isPlaying) {
        audioEngine.getFrequencyData(dataArray);
      } else {
        dataArray.fill(12);
      }

      const barCount = 48;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const val = isPlaying ? (dataArray[i % dataArray.length] / 255) : 0.05;
        const barHeight = Math.max(4, val * height * 0.95);

        const grad = ctx.createLinearGradient(0, height, 0, 0);
        grad.addColorStop(0, 'rgba(212, 175, 55, 0.3)');
        grad.addColorStop(0.5, 'rgba(240, 199, 94, 0.9)');
        grad.addColorStop(1, 'rgba(229, 138, 50, 0.95)');

        ctx.fillStyle = grad;
        ctx.fillRect(i * (barWidth + 2), height - barHeight, barWidth, barHeight);
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isExpandedPlayerOpen, isPlaying]);

  if (!isExpandedPlayerOpen || !song) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const relatedSongs = songs.filter(s => s.id !== song.id && s.categoryId === song.categoryId).slice(0, 4);

  return (
    <div
      id="expanded-player-modal"
      className="fixed inset-0 z-50 bg-[#070707]/95 backdrop-blur-3xl overflow-y-auto flex flex-col justify-between p-4 sm:p-8 animate-in fade-in"
    >
      {/* Background Atmospheric Blur based on Album Artwork */}
      <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
        <img
          src={song.coverImage}
          alt={song.title}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/shiva.jpg'; }}
          className="w-full h-full object-cover blur-3xl scale-125"
        />
        <div className="absolute inset-0 bg-[#070707]/80"></div>
      </div>

      {/* Top Bar */}
      <div className="relative z-10 max-w-[2000px] w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
          <span className="text-xs font-mono tracking-widest uppercase text-[#F0C75E]">
            432Hz Master Sacred Stage
          </span>
        </div>

        <button
          id="close-expanded-player"
          onClick={() => setIsExpandedPlayerOpen(false)}
          className="p-2.5 rounded-full bg-black/60 hover:bg-black text-[#CCCCCC] hover:text-white border border-white/10 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content Area: Left Artwork + Visualizer | Right Lyrics & Credits */}
      <div className="relative z-10 max-w-[2000px] w-full mx-auto my-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-6">
        
        {/* Left Column: Large Artwork, Visualizer & Transport Controls */}
        <div className="lg:col-span-6 flex flex-col items-center text-center space-y-6">
          
          {/* Large Album Artwork */}
          <div className="relative w-64 sm:w-80 md:w-96 aspect-square rounded-2xl overflow-hidden bg-[#121212] border-2 border-[#D4AF37]/50 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.3)] group">
            <img
              src={song.coverImage}
              alt={song.title}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/shiva.jpg'; }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

            {/* Raga & Tuning Stamp */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-black/70 backdrop-blur-md border border-[#D4AF37]/40 text-xs font-mono text-[#F0C75E]">
              {song.raga || 'Bhairav'} • 432Hz OM Tuning
            </div>

            {isPreview && !isPurchased && (
              <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md border border-[#D4AF37]/40 py-1.5 px-3 rounded-lg text-xs text-[#F0C75E] font-medium">
                Free 30-Sec Preview Mode ({previewTimeLeft}s left)
              </div>
            )}
          </div>

          {/* Title & Artist */}
          <div className="space-y-1 max-w-md">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif">
              {song.title}
            </h2>
            <p className="text-sm text-[#D4AF37]">
              {song.credits.singer}
            </p>
            <p className="text-xs text-[#888888]">
              {song.subtitle || song.categoryName}
            </p>
          </div>

          {/* Canvas Waveform */}
          <div className="w-full max-w-md h-12 bg-black/40 rounded-xl p-2 border border-white/5">
            <canvas ref={canvasRef} width={400} height={40} className="w-full h-full" />
          </div>

          {/* Scrubber Timeline */}
          <div className="w-full max-w-md space-y-1">
            <input
              type="range"
              min="0"
              max={duration || 30}
              step="0.1"
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
            />
            <div className="flex justify-between text-xs text-[#888888] font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => toggleFavorite(song.id)}
              className="p-3 rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
            </button>

            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F0C75E] text-[#070707] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.6)] transform hover:scale-105 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current ml-1" />
              )}
            </button>

            <button
              onClick={() => openInYouTube(song)}
              className="px-4 py-2.5 rounded-xl bg-[#E52020] hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(229,32,32,0.4)] transition-colors cursor-pointer"
              title="Watch and play on YouTube"
            >
              <Youtube className="w-4 h-4 fill-white" />
              <span>Watch on YT</span>
            </button>
          </div>
        </div>

        {/* Right Column: Tabbed Lyrics / Credits / Related */}
        <div className="lg:col-span-6 flex flex-col h-[520px] rounded-2xl bg-[#121212]/90 border border-white/10 overflow-hidden shadow-2xl">
          
          {/* Tabs Bar */}
          <div className="flex items-center justify-around border-b border-white/10 bg-[#161616]/80 p-2 overflow-x-auto">
            {(['LYRICS', 'YOUTUBE', 'CREDITS', 'RELATED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-[#D4AF37] text-black shadow-md font-bold'
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                {tab === 'LYRICS' ? '📜 Synchronized Lyrics' : tab === 'YOUTUBE' ? '🎬 YouTube Video' : tab === 'CREDITS' ? '👥 Studio Credits' : '🎵 Related Ragas'}
              </button>
            ))}
          </div>

          {/* Scrollable Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            
            {activeTab === 'YOUTUBE' && (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-lg">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${song.youtubeVideoId || 'uGvU2yU0sW0'}?autoplay=1&rel=0&modestbranding=1`}
                    title={song.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#181818] border border-white/5 text-xs">
                  <div>
                    <h5 className="font-bold text-white line-clamp-1">{song.title}</h5>
                    <p className="text-[11px] text-[#888888]">Subam Audio Vision Official Video Broadcast</p>
                  </div>
                  {song.youtubeUrl && (
                    <a
                      href={song.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] flex items-center gap-1.5"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                      <span>YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'LYRICS' && (
              <div className="space-y-4 text-center">
                {lyricsData?.timestamps && lyricsData.timestamps.length > 0 ? (
                  lyricsData.timestamps.map((line, idx) => {
                    const isCurrent = currentTime >= line.time && (idx === lyricsData.timestamps!.length - 1 || currentTime < lyricsData.timestamps![idx + 1].time);
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl transition-all duration-300 ${
                          isCurrent
                            ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/50 scale-105 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                            : 'opacity-60'
                        }`}
                      >
                        <p className={`text-base sm:text-lg font-bold ${isCurrent ? 'text-[#F0C75E]' : 'text-white'}`}>
                          {line.text}
                        </p>
                        {line.translation && (
                          <p className="text-xs text-[#A8A8A8] mt-1 italic font-serif">
                            "{line.translation}"
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="whitespace-pre-line text-base text-[#CCCCCC] font-serif leading-relaxed">
                    {lyricsData?.lyricsText || song.description}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'CREDITS' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-3">
                  <h4 className="font-bold text-[#F0C75E] uppercase tracking-wider text-[11px]">Primary Artists</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[#777777] block">Vocalist:</span>
                      <span className="text-white font-medium">{song.credits.singer}</span>
                    </div>
                    <div>
                      <span className="text-[#777777] block">Composer:</span>
                      <span className="text-white font-medium">{song.credits.composer}</span>
                    </div>
                    <div>
                      <span className="text-[#777777] block">Lyricist:</span>
                      <span className="text-white font-medium">{song.credits.lyricist}</span>
                    </div>
                    <div>
                      <span className="text-[#777777] block">Music Director:</span>
                      <span className="text-white font-medium">{song.credits.musicDirector}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-3">
                  <h4 className="font-bold text-[#F0C75E] uppercase tracking-wider text-[11px]">Audio Fidelity & Studio</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[#777777] block">Recorded At:</span>
                      <span className="text-white font-medium">{song.credits.studio || 'Naad Divine Studio Stage'}</span>
                    </div>
                    <div>
                      <span className="text-[#777777] block">Mastering Frequency:</span>
                      <span className="text-[#F0C75E] font-medium">432Hz Solfeggio Tuned</span>
                    </div>
                    <div>
                      <span className="text-[#777777] block">Audio Encoding:</span>
                      <span className="text-white font-medium">24-Bit / 96kHz Lossless FLAC/WAV</span>
                    </div>
                    <div>
                      <span className="text-[#777777] block">Publisher:</span>
                      <span className="text-white font-medium">Naad Divine Records</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'RELATED' && (
              <div className="space-y-2">
                {relatedSongs.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => playSong(rel)}
                    className="p-3 rounded-xl bg-[#181818] hover:bg-[#222222] border border-white/5 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={rel.coverImage} alt={rel.title} onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/shiva.jpg'; }} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <h5 className="text-sm font-bold text-white group-hover:text-[#F0C75E] transition-colors">{rel.title}</h5>
                        <p className="text-xs text-[#888888]">{rel.credits.singer} • {rel.duration}</p>
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
