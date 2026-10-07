import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Song, LyricsData } from '../types';
import { 
  X, 
  Play, 
  Pause, 
  Music, 
  Globe, 
  BookOpen, 
  Volume2, 
  Check, 
  Share2,
  Copy
} from 'lucide-react';
import { INITIAL_LYRICS } from '../data/initialData';

export const LyricsModal: React.FC = () => {
  const { 
    activeLyricsModalSong, 
    closeLyrics, 
    currentTrack, 
    isPlaying, 
    currentTime, 
    playSong, 
    pauseSong,
    showToast 
  } = useApp();

  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [activeTab, setActiveTab] = useState<'SYNC' | 'FULL_TEXT' | 'MEANING'>('SYNC');
  const [copied, setCopied] = useState(false);

  const song = activeLyricsModalSong;
  const isPlayingThisSong = isPlaying && currentTrack?.id === song?.id;

  useEffect(() => {
    if (!song) return;
    
    // Fetch or find lyrics
    if (INITIAL_LYRICS[song.id]) {
      setLyricsData(INITIAL_LYRICS[song.id]);
    } else {
      fetch(`/api/lyrics/${song.id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setLyricsData(data);
        })
        .catch(() => {});
    }
  }, [song]);

  if (!song) return null;

  const handleCopyLyrics = () => {
    if (lyricsData?.lyricsText) {
      navigator.clipboard.writeText(lyricsData.lyricsText);
      setCopied(true);
      showToast('Sacred verses copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div 
      id="lyrics-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in"
      onClick={closeLyrics}
    >
      <div 
        id="lyrics-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-[#121212] border border-[#D4AF37]/35 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.2)] flex flex-col overflow-hidden animate-in zoom-in-95"
      >
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#161616] to-[#121212]">
          <div className="flex items-center gap-4">
            <img
              src={song.coverImage}
              alt={song.title}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/shiva.jpg'; }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-[#D4AF37]/40 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] bg-[#D4AF37]/15 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                  {song.language} Hymn
                </span>
                {song.raga && (
                  <span className="text-[10px] text-[#A8A8A8] hidden sm:inline font-mono">
                    Raga: {song.raga}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {song.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#A8A8A8]">
                Sung by {song.credits.singer} • Composed by {song.credits.composer}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLyrics}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#CCCCCC] hover:text-white border border-white/10 transition-all"
              title="Copy Verses"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={closeLyrics}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#CCCCCC] hover:text-white border border-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-6 py-3 bg-[#0D0D0D] border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(['SYNC', 'FULL_TEXT', 'MEANING'] as const).map((tab) => (
              <button
                key={tab}
                id={`lyrics-tab-${tab.toLowerCase()}`}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'text-[#888888] hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'SYNC' ? '⚡ Live Sync Lyrics' : tab === 'FULL_TEXT' ? '📜 Original Stotra' : '📖 Spiritual Meaning'}
              </button>
            ))}
          </div>

          {/* Audio Play Trigger inside Lyrics */}
          <button
            onClick={() => {
              if (isPlayingThisSong) pauseSong();
              else playSong(song);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#282828] border border-[#D4AF37]/40 text-xs font-medium text-[#F0C75E] transition-all"
          >
            {isPlayingThisSong ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlayingThisSong ? 'Pause Audio' : 'Play Track'}</span>
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 max-h-[60vh]">
          
          {/* Tab 1: Live Synchronized Lyrics */}
          {activeTab === 'SYNC' && (
            <div className="space-y-6 max-w-2xl mx-auto text-center">
              {lyricsData?.timestamps && lyricsData.timestamps.length > 0 ? (
                lyricsData.timestamps.map((line, idx) => {
                  // Check if current playback matches line timestamp
                  const isCurrent = isPlayingThisSong && currentTime >= line.time && (idx === lyricsData.timestamps!.length - 1 || currentTime < lyricsData.timestamps![idx + 1].time);
                  
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl transition-all duration-300 ${
                        isCurrent
                          ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/50 scale-105 shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                          : 'opacity-65 hover:opacity-100'
                      }`}
                    >
                      <p className={`text-lg sm:text-xl font-bold transition-colors ${isCurrent ? 'text-[#F0C75E]' : 'text-white'}`}>
                        {line.text}
                      </p>
                      {line.translation && (
                        <p className="text-xs sm:text-sm text-[#A8A8A8] mt-2 italic font-serif">
                          "{line.translation}"
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 space-y-3">
                  <p className="text-sm text-[#888888]">Synchronized timestamps are being calibrated for this stotra.</p>
                  <button
                    onClick={() => setActiveTab('FULL_TEXT')}
                    className="px-4 py-2 rounded-lg bg-[#D4AF37] text-black font-semibold text-xs"
                  >
                    View Complete Stotra Verses
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Full Original Text */}
          {activeTab === 'FULL_TEXT' && (
            <div className="max-w-2xl mx-auto whitespace-pre-line text-center font-serif text-lg sm:text-xl leading-relaxed text-[#E8E8E8] space-y-4">
              <div className="p-6 rounded-2xl bg-[#090909] border border-white/5 shadow-inner">
                {lyricsData?.lyricsText || 'Sacred verses loading...'}
              </div>
            </div>
          )}

          {/* Tab 3: Spiritual Meaning & Raga Notes */}
          {activeTab === 'MEANING' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-[#D4AF37]/20 space-y-3">
                <h3 className="text-base font-bold text-[#F0C75E]">
                  Essence of the Sacred Hymn
                </h3>
                <p className="text-sm text-[#CCCCCC] leading-relaxed">
                  {lyricsData?.meaning || song.description}
                </p>
              </div>

              {/* Raga & Metrical Structure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#161616] border border-white/5 space-y-1">
                  <span className="text-[11px] text-[#888888] uppercase tracking-wider">Classical Raga</span>
                  <p className="text-sm font-bold text-white">{song.raga || 'Bhairav'}</p>
                  <p className="text-xs text-[#777777]">Resonates with morning prana & meditative cosmic focus.</p>
                </div>

                <div className="p-4 rounded-xl bg-[#161616] border border-white/5 space-y-1">
                  <span className="text-[11px] text-[#888888] uppercase tracking-wider">Tala & Metre</span>
                  <p className="text-sm font-bold text-white">{song.tala || 'Adi Tala (8 Beats)'}</p>
                  <p className="text-xs text-[#777777]">Traditional Sanskrit rhythmic meter (Chhanda).</p>
                </div>
              </div>

              {/* Comprehensive Production Credits */}
              <div className="p-5 rounded-xl bg-[#141414] border border-white/5 space-y-3">
                <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">Production & Recording Credits</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[#777777] block">Vocalist</span>
                    <span className="text-white font-medium">{song.credits.singer}</span>
                  </div>
                  <div>
                    <span className="text-[#777777] block">Composer</span>
                    <span className="text-white font-medium">{song.credits.composer}</span>
                  </div>
                  <div>
                    <span className="text-[#777777] block">Lyricist</span>
                    <span className="text-white font-medium">{song.credits.lyricist}</span>
                  </div>
                  <div>
                    <span className="text-[#777777] block">Music Director</span>
                    <span className="text-white font-medium">{song.credits.musicDirector}</span>
                  </div>
                  <div>
                    <span className="text-[#777777] block">Studio</span>
                    <span className="text-white font-medium">{song.credits.studio || 'Naad Divine Sound Stage'}</span>
                  </div>
                  <div>
                    <span className="text-[#777777] block">Audio Master</span>
                    <span className="text-[#F0C75E] font-medium">432Hz 24-Bit 96kHz</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
