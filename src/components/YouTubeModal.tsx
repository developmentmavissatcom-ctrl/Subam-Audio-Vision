import React from 'react';
import { useApp } from '../context/AppContext';
import { X, ExternalLink, Radio, Users, Youtube } from 'lucide-react';

export const YouTubeModal: React.FC = () => {
  const { activeYouTubeModal, closeYouTubeModal } = useApp();

  if (!activeYouTubeModal) return null;

  const stream = activeYouTubeModal;

  return (
    <div
      id="youtube-theatre-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in"
      onClick={closeYouTubeModal}
    >
      <div
        id="youtube-theatre-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl rounded-2xl bg-[#121212] border border-[#D4AF37]/40 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#161616] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {stream.status === 'LIVE' ? (
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-400 bg-red-950/60 border border-red-500/40 px-2 py-0.5 rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    LIVE NOW
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-semibold text-[#F0C75E] bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-2 py-0.5 rounded">
                    {stream.type}
                  </span>
                )}
                {stream.viewersCount && (
                  <span className="text-xs text-[#888888]">
                    {stream.viewersCount.toLocaleString()} watching
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1 mt-0.5">
                {stream.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={stream.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] text-xs font-semibold text-white border border-white/10 transition-colors"
            >
              <span>Open on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#A8A8A8]" />
            </a>
            <button
              onClick={closeYouTubeModal}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#CCCCCC] hover:text-white border border-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 16:9 YouTube Video Embed */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${stream.youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`}
            title={stream.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Bottom Stream Details */}
        <div className="p-4 sm:p-6 bg-[#0E0E0E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-[#A8A8A8] max-w-2xl leading-relaxed">
            {stream.description}
          </p>

          <a
            href={stream.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden w-full py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs text-center flex items-center justify-center gap-2"
          >
            <Youtube className="w-4 h-4" />
            <span>Open in YouTube App</span>
          </a>
        </div>

      </div>
    </div>
  );
};
