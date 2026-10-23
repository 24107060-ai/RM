import React from 'react';

export const SkylineHeroIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-xl mx-auto h-[380px] flex items-center justify-center select-none overflow-hidden rounded-2xl glass-panel p-6 shadow-glass border border-ice">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-marigold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-ice/50 rounded-full blur-3xl pointer-events-none" />

      {/* SVG Canvas for Skyline & Trajectory */}
      <svg
        viewBox="0 0 600 380"
        className="w-full h-full relative z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DDE3E8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </linearGradient>

          <linearGradient id="bldgGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3A0F34" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#240820" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="bldgGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#54194C" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#3A0F34" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="bldgGradBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#BAC5CE" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#DDE3E8" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="priceLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EAAA00" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#EAAA00" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFF2B2" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="areaFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EAAA00" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#EAAA00" stopOpacity="0.0" />
          </linearGradient>

          {/* Filter for glowing node */}
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Sky Backdrop Fill */}
        <rect x="20" y="20" width="560" height="340" rx="12" fill="url(#skyGrad)" />

        {/* Horizontal Elevation / Price Grid Lines */}
        <g stroke="#DDE3E8" strokeOpacity="0.6" strokeDasharray="4 4" strokeWidth="1">
          <line x1="40" y1="90" x2="560" y2="90" />
          <line x1="40" y1="160" x2="560" y2="160" />
          <line x1="40" y1="230" x2="560" y2="230" />
          <line x1="40" y1="300" x2="560" y2="300" />
        </g>

        {/* Grid Value Annotations */}
        <text x="45" y="86" fill="#7A6B78" fontSize="10" fontFamily="'Plus Jakarta Sans', sans-serif">₹25 Cr+ Premium</text>
        <text x="45" y="156" fill="#7A6B78" fontSize="10" fontFamily="'Plus Jakarta Sans', sans-serif">₹10 Cr - ₹25 Cr Mid-High</text>
        <text x="45" y="226" fill="#7A6B78" fontSize="10" fontFamily="'Plus Jakarta Sans', sans-serif">₹5 Cr - ₹10 Cr Suburban</text>
        <text x="45" y="296" fill="#7A6B78" fontSize="10" fontFamily="'Plus Jakarta Sans', sans-serif">₹20 L - ₹5 Cr Entry / MMR Hubs</text>

        {/* Background Building Silhouettes (Layer 1 - Distant Skyline) */}
        <g fill="url(#bldgGradBack)">
          <rect x="70" y="150" width="45" height="150" rx="1" />
          <rect x="130" y="120" width="55" height="180" rx="1" />
          <polygon points="157,95 140,120 175,120" />
          <rect x="210" y="140" width="40" height="160" rx="1" />
          <rect x="280" y="110" width="60" height="190" rx="1" />
          <rect x="365" y="130" width="50" height="170" rx="1" />
          <rect x="445" y="100" width="55" height="200" rx="1" />
          <polygon points="472,70 455,100 490,100" />
          <rect x="515" y="160" width="40" height="140" rx="1" />
        </g>

        {/* Foreground Modern High-Rise Towers (Layer 2 - Rising Architecture) */}
        <g>
          {/* Tower 1 - South Bombay Coastal Tower */}
          <rect x="95" y="180" width="50" height="135" rx="2" fill="url(#bldgGrad2)" />
          {/* Architectural Lines on Tower 1 */}
          <line x1="95" y1="210" x2="145" y2="210" stroke="#DDE3E8" strokeOpacity="0.3" />
          <line x1="95" y1="240" x2="145" y2="240" stroke="#DDE3E8" strokeOpacity="0.3" />
          <line x1="95" y1="270" x2="145" y2="270" stroke="#DDE3E8" strokeOpacity="0.3" />

          {/* Tower 2 - Central Highrise */}
          <rect x="175" y="130" width="65" height="185" rx="3" fill="url(#bldgGrad1)" />
          <line x1="207" y1="80" x2="207" y2="130" stroke="#3A0F34" strokeWidth="2" />
          <circle cx="207" cy="80" r="3" fill="#EAAA00" filter="url(#goldGlow)" />

          {/* Tower 3 - Bandra West Style Stepped Structure */}
          <rect x="265" y="170" width="50" height="145" rx="2" fill="url(#bldgGrad2)" />
          <rect x="275" y="150" width="30" height="20" rx="1" fill="url(#bldgGrad1)" />

          {/* Tower 4 - Iconic Landmark Highrise with Crown */}
          <rect x="340" y="95" width="75" height="220" rx="3" fill="url(#bldgGrad1)" />
          {/* Crown */}
          <polygon points="377,65 350,95 405,95" fill="url(#bldgGrad1)" />
          <line x1="377" y1="45" x2="377" y2="65" stroke="#EAAA00" strokeWidth="2.5" />
          <circle cx="377" cy="45" r="3.5" fill="#EAAA00" filter="url(#goldGlow)" />

          {/* Tower 5 - Modern Residential Complex */}
          <rect x="435" y="160" width="55" height="155" rx="2" fill="url(#bldgGrad2)" />
        </g>

        {/* Illuminated Warm Marigold Windows (Subtle Lighting Animation) */}
        <g fill="#EAAA00" className="animate-pulseGlow">
          {/* Windows on Tower 2 */}
          <rect x="188" y="150" width="5" height="7" rx="0.5" />
          <rect x="200" y="150" width="5" height="7" rx="0.5" />
          <rect x="215" y="150" width="5" height="7" rx="0.5" />
          <rect x="188" y="170" width="5" height="7" rx="0.5" />
          <rect x="215" y="170" width="5" height="7" rx="0.5" />
          <rect x="188" y="200" width="5" height="7" rx="0.5" />
          <rect x="200" y="200" width="5" height="7" rx="0.5" />
          <rect x="215" y="220" width="5" height="7" rx="0.5" />

          {/* Windows on Landmark Tower 4 */}
          <rect x="355" y="115" width="6" height="8" rx="0.5" />
          <rect x="375" y="115" width="6" height="8" rx="0.5" />
          <rect x="395" y="115" width="6" height="8" rx="0.5" />
          <rect x="355" y="135" width="6" height="8" rx="0.5" />
          <rect x="395" y="135" width="6" height="8" rx="0.5" />
          <rect x="375" y="160" width="6" height="8" rx="0.5" />
          <rect x="355" y="185" width="6" height="8" rx="0.5" />
          <rect x="395" y="185" width="6" height="8" rx="0.5" />
          <rect x="375" y="210" width="6" height="8" rx="0.5" />
          <rect x="355" y="235" width="6" height="8" rx="0.5" />
          <rect x="395" y="235" width="6" height="8" rx="0.5" />

          {/* Windows on Tower 5 */}
          <rect x="450" y="180" width="5" height="6" rx="0.5" />
          <rect x="465" y="180" width="5" height="6" rx="0.5" />
          <rect x="450" y="210" width="5" height="6" rx="0.5" />
          <rect x="465" y="230" width="5" height="6" rx="0.5" />
        </g>

        {/* Prediction Regression Curve (Area under Curve) */}
        <path
          d="M 50 310 Q 150 290 230 250 T 360 170 T 470 120 T 540 60 L 540 315 L 50 315 Z"
          fill="url(#areaFillGrad)"
        />

        {/* Thin Elegant Marigold Line Tracing Price Trend */}
        <path
          d="M 50 310 Q 150 290 230 250 T 360 170 T 470 120 T 540 60"
          stroke="url(#priceLineGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="1000"
          strokeDashoffset="0"
          className="animate-dashDraw"
        />

        {/* Predictive Regression Sample Nodes along the curve */}
        <circle cx="150" cy="285" r="4" fill="#FFFFFF" stroke="#EAAA00" strokeWidth="2.5" />
        <circle cx="270" cy="225" r="4.5" fill="#FFFFFF" stroke="#EAAA00" strokeWidth="2.5" />
        <circle cx="390" cy="155" r="5" fill="#FFFFFF" stroke="#EAAA00" strokeWidth="2.5" />
        <circle cx="485" cy="105" r="5.5" fill="#FFFFFF" stroke="#EAAA00" strokeWidth="3" />
        
        {/* Apex Prediction Active Point */}
        <circle cx="540" cy="60" r="7" fill="#EAAA00" filter="url(#goldGlow)" />
        <circle cx="540" cy="60" r="3.5" fill="#FFFFFF" />

        {/* Floating Callout Tag at Apex */}
        <g transform="translate(420, 28)">
          <rect width="115" height="28" rx="6" fill="#3A0F34" stroke="#EAAA00" strokeWidth="1.2" />
          <text x="8" y="18" fill="#FFFFFF" fontSize="11" fontWeight="600" fontFamily="'Plus Jakarta Sans', sans-serif">
            Top Tier: <tspan fill="#EAAA00">₹42.0 Cr</tspan>
          </text>
        </g>

        {/* Base Waterfront / Ground Line */}
        <line x1="30" y1="315" x2="570" y2="315" stroke="#3A0F34" strokeWidth="2" strokeOpacity="0.4" />
        <path d="M 30 315 Q 120 317 210 315 T 390 316 T 570 315" stroke="#DDE3E8" strokeWidth="1" />
      </svg>
      
      {/* Editorial Floating Caption */}
      <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between text-xs text-warm-muted/80">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-marigold animate-ping" />
          Empirical MMR Valuation Gradient
        </span>
        <span className="text-[11px] font-mono tracking-tight">413 Localities | 6,347 Records</span>
      </div>
    </div>
  );
};
