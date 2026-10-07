import React from 'react';

interface SubamLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  withBorder?: boolean;
}

export const SubamLogo: React.FC<SubamLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  withBorder = true,
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className={`relative ${sizeClasses[size]} rounded-xl overflow-hidden flex-shrink-0 bg-[#FFDE00] p-1 flex items-center justify-center ${
          withBorder ? 'ring-2 ring-[#E52020] shadow-[0_4px_16px_rgba(229,32,32,0.3)]' : ''
        } transition-transform duration-300 hover:scale-105`}
      >
        <img
          src="/Subam logo.png"
          alt="Subam Audio Vision"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/Subam%20logo.png';
          }}
          className="w-full h-full object-contain max-w-full max-h-full block select-none"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-cinzel font-black tracking-wider text-white text-base sm:text-lg">
              SUBAM AUDIO
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#E58A32] bg-[#E58A32]/10 border border-[#E58A32]/30 px-1.5 py-0.5 rounded font-sans font-bold">
              ORIGINALS
            </span>
          </div>
          <span className="text-[10px] tracking-widest uppercase text-[#A0A0A0] font-sans">
            Vision & Records • Est. 1997
          </span>
        </div>
      )}
    </div>
  );
};
