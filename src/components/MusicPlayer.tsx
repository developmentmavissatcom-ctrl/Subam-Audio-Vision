import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Heart, 
  ShoppingBag, 
  FileText,
  Download,
  Youtube,
  ExternalLink,
  Tv,
  Radio
} from 'lucide-react';

export const MusicPlayer: React.FC = () => {
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
    setTrackDuration,
    setVolume, 
    toggleMute, 
    toggleFavorite, 
    openCheckout, 
    openLyrics,
    openInYouTube,
    setIsExpandedPlayerOpen,
    currentUser,
    songs,
    playSong,
    pauseSong,
    language,
    t
  } = useApp();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const nativeAudioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const [showMiniVideo, setShowMiniVideo] = useState(false);

  const isPurchased = currentTrack ? (currentUser?.purchasedSongIds.includes(currentTrack.id) || currentUser?.role === 'ADMIN') : false;
  const isFav = currentTrack ? currentUser?.favorites.includes(currentTrack.id) : false;

  const isLocalAudio = !!(
    currentTrack?.customUploadedAudioUrl ||
    (currentTrack?.previewAudioUrl && currentTrack.previewAudioUrl.startsWith('/audio/')) ||
    (currentTrack?.fullAudioUrl && currentTrack.fullAudioUrl.startsWith('/audio/'))
  );

  const activeAudioUrl = currentTrack?.customUploadedAudioUrl ||
    (currentTrack?.previewAudioUrl && currentTrack.previewAudioUrl.startsWith('/audio/') ? currentTrack.previewAudioUrl : null) ||
    (currentTrack?.fullAudioUrl && currentTrack.fullAudioUrl.startsWith('/audio/') ? currentTrack.fullAudioUrl : null);

  // Send postMessage commands to embedded YouTube iframe
  const sendYouTubeCommand = (func: string, args: any[] = []) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    } catch {
      // safe fallback
    }
  };

  // Sync playback when isPlaying or current track changes
  useEffect(() => {
    if (isLocalAudio && activeAudioUrl) {
      // Pause YouTube when playing local studio audio
      sendYouTubeCommand('pauseVideo');
      if (nativeAudioRef.current) {
        if (isPlaying) {
          const playPromise = nativeAudioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.warn('Playback notice:', err);
            });
          }
        } else {
          nativeAudioRef.current.pause();
        }
      }
    } else {
      if (nativeAudioRef.current) {
        nativeAudioRef.current.pause();
      }
      if (isPlaying) {
        sendYouTubeCommand('playVideo');
      } else {
        sendYouTubeCommand('pauseVideo');
      }
    }
  }, [isPlaying, currentTrack?.id, isLocalAudio, activeAudioUrl, currentTrack?.youtubeVideoId]);

  // Sync Volume
  useEffect(() => {
    if (nativeAudioRef.current) {
      nativeAudioRef.current.volume = isMuted ? 0 : volume;
    }
    if (isMuted) {
      sendYouTubeCommand('mute');
    } else {
      sendYouTubeCommand('unMute');
      sendYouTubeCommand('setVolume', [volume * 100]);
    }
  }, [volume, isMuted]);

  // Time ticker interval when playing YouTube fallback
  useEffect(() => {
    // If using local master audio, time updates are handled natively by onTimeUpdate
    if (isLocalAudio) return;
    if (!isPlaying || isScrubbing) return;

    const interval = setInterval(() => {
      const currentDur = duration || currentTrack?.durationSeconds || 360;
      const nextTime = currentTime + 1;

      if (nextTime >= currentDur) {
        // Auto play next track
        const currentIndex = songs.findIndex(s => s.id === currentTrack?.id);
        if (currentIndex !== -1 && currentIndex < songs.length - 1) {
          playSong(songs[currentIndex + 1]);
        } else {
          pauseSong();
          seek(0);
        }
      } else {
        seek(nextTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration, isScrubbing, currentTrack, songs, isLocalAudio]);

  // Real-time Canvas Waveform Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let step = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      step += 0.08;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const barCount = 32;
      const barWidth = width / barCount - 1.5;

      for (let i = 0; i < barCount; i++) {
        let val = 0.1;
        if (isPlaying) {
          val = Math.abs(Math.sin(step + i * 0.35)) * 0.75 + Math.abs(Math.cos(step * 0.7 + i * 0.2)) * 0.25;
        }
        const barHeight = Math.max(3, val * height * 0.95);

        // Subam Gold to Red gradient
        const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
        grad.addColorStop(0, 'rgba(229, 32, 32, 0.6)');
        grad.addColorStop(0.6, 'rgba(255, 222, 0, 0.85)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

        ctx.fillStyle = grad;
        ctx.fillRect(i * (barWidth + 1.5), height - barHeight, barWidth, barHeight);
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScrubValue(val);
    if (!isScrubbing) {
      seek(val);
      sendYouTubeCommand('seekTo', [val, true]);
    }
  };

  const handleSeekCommit = () => {
    setIsScrubbing(false);
    seek(scrubValue);
    if (isLocalAudio && nativeAudioRef.current) {
      nativeAudioRef.current.currentTime = scrubValue;
    } else {
      sendYouTubeCommand('seekTo', [scrubValue, true]);
    }
  };

  const handleNextTrack = () => {
    const currentIndex = songs.findIndex(s => s.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    playSong(songs[nextIndex]);
  };

  const handlePrevTrack = () => {
    const currentIndex = songs.findIndex(s => s.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    playSong(songs[prevIndex]);
  };

  const videoId = (currentTrack.youtubeVideoId && currentTrack.youtubeVideoId !== '17mC8Z-xK6c') 
    ? currentTrack.youtubeVideoId 
    : 'd5f4ZHwxJnA';

  return (
    <div
      id="persistent-music-player"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0E0B08]/96 backdrop-blur-2xl border-t border-[#FFDE00]/30 shadow-[0_-10px_35px_rgba(0,0,0,0.9)] py-2 sm:py-2.5 px-3 sm:px-6 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] transition-all"
    >
      {/* Hidden/Floating YouTube IFrame Engine for True Audio/Video Preview */}
      <div className={showMiniVideo ? "fixed bottom-24 right-4 sm:right-8 z-50 transition-all animate-in fade-in slide-in-from-bottom-5" : "w-0 h-0 overflow-hidden opacity-0 pointer-events-none absolute -left-[9999px]"}>
        {showMiniVideo && (
          <div className="bg-[#18120C] p-1.5 rounded-2xl border-2 border-[#FFDE00] shadow-[0_15px_40px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between px-2 py-1 mb-1 text-[11px] font-bold text-[#FFDE00]">
              <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                <Radio className="w-3 h-3 animate-pulse text-[#E52020]" />
                {currentTrack.title}
              </span>
              <button 
                onClick={() => setShowMiniVideo(false)}
                className="text-white/70 hover:text-white px-1.5 py-0.5 rounded bg-white/10 text-[10px]"
              >
                ✕ Hide
              </button>
            </div>
            <iframe
              ref={iframeRef}
              id="subam-youtube-realtime-player"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&playsinline=1&controls=1`}
              title={currentTrack.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-64 h-36 sm:w-80 sm:h-48 rounded-xl shadow-inner bg-black"
            />
          </div>
        )}
      </div>

      {/* Native HTML5 Audio Engine for Uploaded & Converted Master Audio Files */}
      {isLocalAudio && activeAudioUrl && (
        <audio
          key={activeAudioUrl}
          ref={nativeAudioRef}
          src={activeAudioUrl}
          preload="auto"
          autoPlay={isPlaying}
          onEnded={handleNextTrack}
          onTimeUpdate={() => {
            if (nativeAudioRef.current && !isScrubbing) {
              seek(Math.floor(nativeAudioRef.current.currentTime));
            }
          }}
          onLoadedMetadata={() => {
            if (nativeAudioRef.current && nativeAudioRef.current.duration) {
              setTrackDuration(Math.floor(nativeAudioRef.current.duration));
            }
          }}
          onCanPlay={() => {
            if (isPlaying && nativeAudioRef.current && nativeAudioRef.current.paused) {
              nativeAudioRef.current.play().catch(() => {});
            }
          }}
          className="hidden"
        />
      )}

      {!showMiniVideo && !isLocalAudio && (
        <iframe
          ref={iframeRef}
          id="subam-youtube-audio-background-engine"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&playsinline=1`}
          title={currentTrack.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="w-0 h-0 opacity-0 pointer-events-none absolute"
        />
      )}

      {/* Progress Bar (Scrubber) with Subam Yellow Accent */}
      <div className="w-full max-w-[2000px] mx-auto mb-1.5 relative flex items-center group">
        <input
          id="player-timeline-slider"
          type="range"
          min="0"
          max={duration || currentTrack.durationSeconds || 360}
          step="1"
          value={isScrubbing ? scrubValue : currentTime}
          onMouseDown={() => setIsScrubbing(true)}
          onMouseUp={handleSeekCommit}
          onTouchStart={() => setIsScrubbing(true)}
          onTouchEnd={handleSeekCommit}
          onChange={handleSeekChange}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FFDE00] focus:outline-none"
        />
      </div>

      <div className="w-full max-w-[2000px] mx-auto flex items-center justify-between gap-2 sm:gap-6">
        
        {/* Left: Track Artwork & Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 sm:flex-initial sm:w-1/3 lg:w-1/4">
          <div 
            onClick={() => setIsExpandedPlayerOpen(true)}
            className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-[#18120C] border border-[#FFDE00]/40 flex-shrink-0 cursor-pointer group/art shadow-md"
          >
            <img
              src={currentTrack.coverImage}
              alt={currentTrack.title}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/shiva.jpg'; }}
              className="w-full h-full object-cover group-hover/art:scale-110 transition-transform"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/art:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 className="w-4 h-4 text-[#FFDE00]" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 
                onClick={() => setIsExpandedPlayerOpen(true)}
                className="text-xs sm:text-sm font-bold text-white hover:text-[#FFDE00] truncate cursor-pointer transition-colors"
                title={currentTrack.title}
              >
                {language === 'ta' ? (currentTrack.tamilTitle || currentTrack.title) : currentTrack.title}
              </h4>
              {isLocalAudio && (
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#008751]/80 text-[#4ADE80] border border-[#4ADE80]/40 whitespace-nowrap shadow-sm">
                  {language === 'ta' ? 'மாஸ்டர் MP3' : 'STUDIO MP3'}
                </span>
              )}
              {currentTrack.deityTamilName && !isLocalAudio && (
                <span className="hidden xl:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FFDE00]/15 text-[#FFDE00] border border-[#FFDE00]/30 whitespace-nowrap">
                  {currentTrack.deityTamilName}
                </span>
              )}
            </div>

            <p className="text-[11px] text-[#B0A8A0] truncate mt-0.5 font-medium flex items-center gap-1">
              <span>{currentTrack.credits.singer}</span>
              {currentTrack.raga && (
                <span className="hidden md:inline text-[10px] text-[#FFDE00]/70">• {currentTrack.raga}</span>
              )}
            </p>
          </div>

          {/* Quick YouTube Direct Redirect Button */}
          <button
            id="player-youtube-redirect-btn"
            onClick={() => openInYouTube(currentTrack)}
            className="p-1.5 rounded-lg bg-[#E52020]/15 hover:bg-[#E52020] text-[#E52020] hover:text-white border border-[#E52020]/40 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold shrink-0"
            title="Open and Play this Video Directly on YouTube"
          >
            <Youtube className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">YouTube</span>
          </button>

          {/* Mini Video Toggle */}
          <button
            id="player-toggle-video-btn"
            onClick={() => setShowMiniVideo(!showMiniVideo)}
            className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer shrink-0 ${
              showMiniVideo 
                ? 'bg-[#FFDE00] text-[#0A0806] border-[#FFDE00]' 
                : 'bg-white/5 hover:bg-white/10 text-[#C0B8B0] border-white/10'
            }`}
            title="Toggle Live Video Preview"
          >
            <Tv className="w-3 h-3" />
            <span>Video</span>
          </button>

          {/* Quick Favorite Toggle */}
          <button
            id="player-fav-btn"
            onClick={() => toggleFavorite(currentTrack.id)}
            className="hidden md:block p-1.5 rounded-full hover:bg-white/5 text-[#A0988E] hover:text-[#E52020] transition-colors cursor-pointer"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-[#E52020] text-[#E52020]' : ''}`} />
          </button>

          {/* Quick Lyrics Trigger */}
          <button
            id="player-lyrics-btn"
            onClick={() => openLyrics(currentTrack)}
            className="hidden md:block p-1.5 rounded-full hover:bg-white/5 text-[#A0988E] hover:text-[#FFDE00] transition-colors cursor-pointer"
            title="View Lyrics"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Controls & Audio Waveform */}
        <div className="flex flex-col items-center gap-1 flex-1 max-w-xs sm:max-w-md">
          <div className="flex items-center gap-2.5 sm:gap-4">
            
            {/* Prev Track */}
            <button
              id="player-prev-btn"
              onClick={handlePrevTrack}
              className="p-1.5 text-[#C0B8B0] hover:text-[#FFDE00] transition-colors cursor-pointer"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause Main Button */}
            <button
              id="player-play-btn"
              onClick={togglePlay}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-[#FFDE00] via-[#FACC15] to-[#E58A32] text-[#0A0806] flex items-center justify-center shadow-[0_0_20px_rgba(255,222,0,0.5)] hover:brightness-110 transition-all transform hover:scale-105 cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play YouTube Audio'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Next Track */}
            <button
              id="player-next-btn"
              onClick={handleNextTrack}
              className="p-1.5 text-[#C0B8B0] hover:text-[#FFDE00] transition-colors cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Time and Mini Waveform */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] text-[#A0988E] font-mono w-full justify-center">
            <span className="font-bold text-white">{formatTime(currentTime)}</span>
            
            {/* Real-time reactive canvas waveform */}
            <div className="hidden sm:block w-28 md:w-36 h-3 bg-black/50 border border-white/5 rounded px-1">
              <canvas ref={canvasRef} width={140} height={12} className="w-full h-full" />
            </div>

            <span>{formatTime(duration || currentTrack.durationSeconds || 360)}</span>
          </div>
        </div>

        {/* Right: YouTube Direct Action & Volume */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 flex-1 sm:flex-initial sm:w-1/3 lg:w-1/4">
          
          {/* Direct YouTube Video Button */}
          <button
            id="player-youtube-watch-action"
            onClick={() => openInYouTube(currentTrack)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E52020] hover:bg-red-700 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(229,32,32,0.35)] cursor-pointer whitespace-nowrap"
            title="Watch and play this track directly on YouTube"
          >
            <Youtube className="w-3.5 h-3.5 fill-white" />
            <span>Watch on YT</span>
          </button>

          {/* Volume Control */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-[#A0988E] hover:text-[#FFDE00] transition-colors cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-[#E52020]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#FFDE00]" />
              )}
            </button>
            <input
              id="player-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FFDE00]"
            />
          </div>

          {/* Expand Player */}
          <button
            id="player-expand-btn"
            onClick={() => setIsExpandedPlayerOpen(true)}
            className="p-2 rounded-xl text-[#A0988E] hover:text-[#FFDE00] hover:bg-white/5 transition-colors cursor-pointer"
            title="Expand Full Screen Theatre"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
