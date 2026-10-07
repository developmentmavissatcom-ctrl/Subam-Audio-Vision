import React, { useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Flame } from 'lucide-react';

export const Hero3D: React.FC = () => {
  const { songs, playSong, setCurrentView } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    // Reduced lightweight particles for maximum performance
    const particles: Array<{ x: number; y: number; radius: number; speed: number; alpha: number }> = [];
    for (let i = 0; i < 24; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        speed: Math.random() * 0.3 + 0.1,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    const render = () => {
      if (document.visibilityState === 'hidden') {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Subtle sacred golden particles floating up
      ctx.fillStyle = '#FFDE00';
      for (const p of particles) {
        p.y -= p.speed;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handlePlayFirstSong = () => {
    if (songs && songs.length > 0) {
      playSong(songs[0]);
    }
  };

  const handleExploreDarshan = () => {
    const el = document.getElementById('sacred-gods-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setCurrentView('gods');
    }
  };

  return (
    <section id="hero-3d-section" className="relative min-h-[480px] sm:min-h-[540px] flex items-center justify-center overflow-hidden bg-[#070707] px-4 sm:px-6 md:px-12 py-12 sm:py-16">
      {/* Background Sacred Banner Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/Subam%20banner.png"
          alt="Subam Audio Vision Devotional Banner"
          className="w-full h-full object-cover object-top opacity-30 filter brightness-90 saturate-125 scale-105 pointer-events-none transition-opacity duration-1000"
        />
        {/* Deep Vignette and Gradients for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e0a05]/90 via-[#070707]/80 to-[#070707]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070707]/95 via-transparent to-[#070707]/95" />
      </div>

      {/* Background sacred ambient canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-[1]" />

      {/* Radial sacred gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[#D4AF37]/20 to-[#FF5722]/15 rounded-full blur-3xl pointer-events-none z-[1]" />

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#1A140B] border border-[#FFDE00]/30 text-[#FFDE00] text-xs font-semibold uppercase tracking-widest shadow-lg">
          <span>Subam Audio Vision • Tiruvannamalai (Est. 1997)</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-cinzel text-white tracking-tight leading-tight">
          Sacred Tamil Devotional <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#F0C75E] via-[#FFDE00] to-[#FF8C00] bg-clip-text text-transparent">
            Masters & Golden Classics
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-[#C4BCB3] leading-relaxed">
          Stream authentic devotional audio, Girivalam anthems, Amman folk urumee melodies, and live temple broadcasts by legendary maestros.
        </p>

        <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
          <button
            id="hero-play-chants-btn"
            onClick={handlePlayFirstSong}
            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#FFDE00] to-[#FF8C00] text-black font-bold text-sm tracking-wide hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(255,222,0,0.35)] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Play Sacred Chants</span>
          </button>

          <button
            id="hero-explore-darshan-btn"
            onClick={handleExploreDarshan}
            className="px-6 py-3.5 rounded-full bg-[#1A150D] border border-[#FFDE00]/35 text-[#FFDE00] font-semibold text-sm hover:bg-[#261E13] hover:border-[#FFDE00] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Flame className="w-4 h-4 text-[#FFDE00]" />
            <span>18 Gods Darshan</span>
          </button>
        </div>
      </div>
    </section>
  );
};
