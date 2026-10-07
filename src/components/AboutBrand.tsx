import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Award } from 'lucide-react';
import { SubamLogo } from './SubamLogo';

export const AboutBrand: React.FC = () => {
  const { siteSettings, language, t } = useApp();

  return (
    <section id="about-brand-section" className="py-20 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[2000px] mx-auto space-y-12">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#120E09] via-[#0C0905] to-[#120E09] border border-[#D4AF37]/30 p-8 sm:p-12 lg:p-16 shadow-2xl">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text & Heritage */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#1F170C] border border-[#D4AF37]/35 text-[#F0C75E] text-xs font-bold uppercase tracking-widest">
              <span>{t('about.badge', 'OUR SACRED HERITAGE')} • {t('about.subline', 'Est. 1997')}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-cinzel text-white leading-tight">
              {language === 'ta' ? 'அழியா பக்தி பாரம்பரியம் • தலைமுறை கடந்த இசை' : 'Honoring Sacred Traditions in Every Recording'}
            </h2>

            <p className="text-sm sm:text-base text-[#C2B7AC] leading-relaxed">
              {language === 'ta'
                ? '1997 ஆம் ஆண்டு புனித திருவண்ணாமலை அருணாசலேஸ்வரர் அடிவாரத்தில் நிறுவப்பட்ட சுபம் ஆடியோ விஷன், 1,200-க்கும் மேற்பட்ட பக்தி பாடல்கள், கோவில் திருவிழா கீதங்கள் மற்றும் கிராமிய பக்தி பாடல்களை தயாரித்து ஆவணப்படுத்தியுள்ளது.'
                : 'Founded in 1997 at the sacred foothills of Mount Arunachala in Tiruvannamalai, Subam Audio Vision has produced and catalogued over 1,200 authentic devotional compositions, temple anthems, and folk masterworks.'}
            </p>

            <p className="text-sm sm:text-base text-[#A89F95] leading-relaxed">
              {language === 'ta'
                ? 'டாக்டர் எஸ்.பி. பாலசுப்ரமணியம், வீரமணிதாசன், எல்.ஆர். ஈஸ்வரி, மகாநதி சோபனா உள்ளிட்ட மாபெரும் மேஸ்ட்ரோக்களின் தெய்வீக குரலில் உருவான அழியா பாடல்கள், உலகெங்கும் உள்ள லட்சக்கணக்கான பக்தர்களின் இல்லங்களில் ஆன்மீக அமைதியை பரப்பி வருகின்றன.'
                : 'From historic sessions featuring Dr. S.P. Balasubrahmanyam to thunderous Ayyappa songs by Veeramanidasan and electrifying Amman melodies by L.R. Eswari, every release is preserved with pristine fidelity to carry divine peace to millions of households worldwide.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-2xl font-bold font-cinzel text-[#F0C75E]">1997</div>
                <div className="text-xs text-[#9E958B]">{language === 'ta' ? 'திருவண்ணாமலை தொடக்கம்' : 'Established in Tiruvannamalai'}</div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-2xl font-bold font-cinzel text-[#F0C75E]">1,200+</div>
                <div className="text-xs text-[#9E958B]">{language === 'ta' ? 'மாஸ்டர் பக்தி படைப்புகள்' : 'Master Devotional Works'}</div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-2xl font-bold font-cinzel text-[#F0C75E]">597K+</div>
                <div className="text-xs text-[#9E958B]">{language === 'ta' ? 'YouTube பக்தர்கள்' : 'YouTube Devotees'}</div>
              </div>
            </div>
          </div>

          {/* Right Brand Badge & Features */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-2xl bg-black/50 border border-[#D4AF37]/25 space-y-6 text-center">
            <SubamLogo size="xl" />

            <div className="space-y-1">
              <h3 className="text-xl font-bold font-cinzel text-white">
                {language === 'ta' ? 'சுபம் ஆடியோ விஷன்' : 'SUBAM AUDIO VISION'}
              </h3>
              <p className="text-xs text-[#D4AF37] font-semibold tracking-wider uppercase">
                {language === 'ta' ? 'திருவண்ணாமலை • தமிழ்நாடு' : 'Tiruvannamalai • Tamil Nadu'}
              </p>
            </div>

            <div className="w-full space-y-3 pt-2 text-left">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-white">
                    {language === 'ta' ? 'அசல் ஸ்டுடியோ மாஸ்டர்ஸ்' : 'Lossless Studio Masters'}
                  </div>
                  <div className="text-[#8C8379]">
                    {language === 'ta' ? 'அசல் அனலாக் மற்றும் டிஜிட்டல் மாஸ்டர்களிலிருந்து பாதுகாக்கப்பட்ட தூய இசை.' : 'Clean studio audio preserved from original analog & digital masters.'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                <Award className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-white">
                    {language === 'ta' ? 'புகழ்பெற்ற ஆன்மீகக் குரல்கள்' : 'Authentic Spiritual Artists'}
                  </div>
                  <div className="text-[#8C8379]">
                    {language === 'ta' ? 'தமிழ்நாட்டின் மிகச்சிறந்த பக்தி பாடகர்களின் குரலில் ஒலிக்கும் பாடல்கள்.' : 'Recorded with Tamil Nadu’s most celebrated devotional vocalists.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
