import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  theme = 'dark'
}) => {
  const isLight = theme === 'light';
  
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Original Vector Symbol: Mumbai Skyline Pillars + Predictive Curve */}
      <div className={`relative ${iconSizes[size]} rounded-lg bg-aubergine p-1.5 flex items-center justify-center shadow-md overflow-hidden border border-aubergine-light/40`}>
        <svg viewBox="0 0 40 40" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle architectural grid */}
          <line x1="4" y1="36" x2="36" y2="36" stroke="#DDE3E8" strokeWidth="1.5" strokeOpacity="0.4" />
          
          {/* Mumbai skyline silhouettes (Tower A, Center Highrise, Tower B) */}
          <rect x="7" y="18" width="6" height="18" rx="0.5" fill="#DDE3E8" fillOpacity="0.85" />
          <rect x="15" y="10" width="8" height="26" rx="0.5" fill="#DDE3E8" fillOpacity="0.95" />
          <rect x="25" y="15" width="7" height="21" rx="0.5" fill="#DDE3E8" fillOpacity="0.75" />
          
          {/* Micro illuminated window accents */}
          <rect x="17" y="13" width="1.5" height="1.5" fill="#EAAA00" />
          <rect x="20" y="13" width="1.5" height="1.5" fill="#EAAA00" />
          <rect x="17" y="17" width="1.5" height="1.5" fill="#EAAA00" />
          <rect x="20" y="17" width="1.5" height="1.5" fill="#EAAA00" />
          <rect x="9" y="21" width="1.5" height="1.5" fill="#EAAA00" />
          <rect x="27" y="19" width="1.5" height="1.5" fill="#EAAA00" />
          
          {/* Predictive Trend Vector Curve in Signature Marigold */}
          <path
            d="M5 30 C 12 24, 18 20, 26 14 C 29 11.5, 32 9, 35 6"
            stroke="#EAAA00"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Apex Confidence Marker */}
          <circle cx="35" cy="6" r="2.5" fill="#EAAA00" />
          <circle cx="35" cy="6" r="4.5" stroke="#EAAA00" strokeWidth="1" strokeOpacity="0.5" />
        </svg>
      </div>

      {/* Brand Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`editorial-title font-bold tracking-tight ${textSizes[size]} ${isLight ? 'text-white' : 'text-aubergine'}`}>
            Mumbai Estate
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-marigold text-aubergine-deep font-sans">
            AI
          </span>
        </div>
        <span className={`text-[10px] uppercase tracking-wider font-medium mt-0.5 ${isLight ? 'text-ice/80' : 'text-warm-muted'}`}>
          Property Valuation Intelligence
        </span>
      </div>
    </div>
  );
};
