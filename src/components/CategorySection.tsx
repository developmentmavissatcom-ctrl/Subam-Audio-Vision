import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight } from 'lucide-react';

export const CategorySection: React.FC = () => {
  const { categories, setSelectedCategory, setCurrentView } = useApp();

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    const el = document.getElementById('original-collection-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setCurrentView('music');
    }
  };

  return (
    <section id="devotional-categories-section" className="py-20 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 bg-[#090909] border-t border-b border-white/5 relative overflow-hidden">
      
      {/* Abstract Background Ambient Glow */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-[2000px] mx-auto space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#161616] border border-[#D4AF37]/30 text-[#F0C75E] text-xs font-semibold uppercase tracking-widest mb-3">
              <span>Sacred Deities & Chants</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              Devotional Categories
            </h2>
            <p className="text-base text-[#A8A8A8] mt-2 max-w-xl">
              Immerse yourself in specialized sacred vibrations—from high-energy Shiva tandavas to meditative flute ragas.
            </p>
          </div>

          <button
            onClick={() => handleCategoryClick('all')}
            className="text-xs font-semibold text-[#F0C75E] hover:text-white flex items-center gap-1.5 transition-colors self-start md:self-auto"
          >
            <span>View All Genres</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              id={`cat-card-${cat.slug}`}
              onClick={() => handleCategoryClick(cat.id)}
              className="group relative rounded-2xl overflow-hidden bg-[#121212] border border-white/10 hover:border-[#D4AF37]/60 aspect-[4/5] p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.15)] cursor-pointer"
            >
              {/* Background Image with Dark Vignette */}
              <img
                src={cat.image}
                alt={cat.name}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/shiva.jpg'; }}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-40 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#0A0A0A]/70 to-transparent"></div>

              {/* Top Sacred Pattern Watermark */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/30 flex items-center justify-center text-[#F0C75E] text-xs font-cinzel font-bold">
                  ॐ
                </span>
                <span className="text-[11px] font-mono text-[#D4AF37] bg-black/70 px-2 py-0.5 rounded backdrop-blur-md border border-white/10">
                  {cat.songCount} Tracks
                </span>
              </div>

              {/* Bottom Content */}
              <div className="relative z-10 space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#F0C75E] transition-colors font-cinzel">
                  {cat.name}
                </h3>
                {cat.tamilName && (
                  <p className="text-xs font-bold text-[#FFDE00] font-serif line-clamp-1">
                    {cat.tamilName}
                  </p>
                )}
                <p className="text-xs text-[#A8A8A8] line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>

                {/* Popular Song Types Pills */}
                {cat.popularSongTypes && cat.popularSongTypes.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1">
                    {cat.popularSongTypes.slice(0, 3).map((st, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/60 border border-[#FFDE00]/30 text-[#FFDE00]/90 backdrop-blur-sm"
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-1 flex items-center gap-1 text-[11px] font-semibold text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore Chants</span>
                  <ArrowRight className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
