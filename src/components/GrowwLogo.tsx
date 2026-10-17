import React from 'react';

interface GrowwLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

export const GrowwLogo: React.FC<GrowwLogoProps> = ({
  className = '',
  size = 'md',
  showBadge = false
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Groww Emblem: Dual Teal & Blue Interlocking Petals */}
      <div className={`${iconSizes[size]} shrink-0 transition-transform duration-200 hover:scale-105 flex items-center justify-center`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Left Petal: Groww Teal / Emerald #00D09C */}
          <path
            d="M 23.8 6 C 14.2 6.2 6.5 14 6.5 23.8 C 6.5 33.6 14.4 41.5 24.2 41.5 C 27.8 41.5 31.2 40.4 34.1 38.4 C 27.2 36.5 22.2 30.2 22.2 22.8 C 22.2 14.8 28 8.1 35.8 7 C 32.2 6.3 28.1 5.9 23.8 6 Z"
            fill="#00D09C"
          />
          {/* Right Petal: Groww Royal Blue #5367FF */}
          <path
            d="M 24.2 42 C 33.8 41.8 41.5 34 41.5 24.2 C 41.5 14.4 33.6 6.5 23.8 6.5 C 20.2 6.5 16.8 7.6 13.9 9.6 C 20.8 11.5 25.8 17.8 25.8 25.2 C 25.8 33.2 20 39.9 12.2 41 C 15.8 41.7 19.9 42.1 24.2 42 Z"
            fill="#5367FF"
          />
          {/* Overlapping core harmony circle */}
          <circle cx="24" cy="24" r="4.2" fill="#00D09C" fillOpacity="0.4" />
        </svg>
      </div>

      {/* Official Groww Typography */}
      <div className="flex items-center gap-1.5">
        <span
          className={`${textSizes[size]} font-black tracking-[-0.04em] text-[#44475b] dark:text-white leading-none font-sans`}
        >
          Groww
        </span>
        {showBadge && (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#00D09C]/15 text-[#00b386] dark:text-[#00D09C] border border-[#00D09C]/30 leading-none">
            Invest
          </span>
        )}
      </div>
    </div>
  );
};

