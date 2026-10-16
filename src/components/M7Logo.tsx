import React from 'react';
import { motion } from 'framer-motion';

interface M7LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  animated?: boolean;
  className?: string;
}

export const M7Logo: React.FC<M7LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  animated = true,
  className = '',
}) => {
  const dimensions = {
    sm: { width: 150, height: 60, scale: 0.65 },
    md: { width: 230, height: 90, scale: 0.9 },
    lg: { width: 330, height: 130, scale: 1.25 },
    xl: { width: 440, height: 170, scale: 1.65 },
  }[size];

  // Motion transitions
  const strokeTransition = {
    duration: 1.4,
    ease: [0.16, 1, 0.3, 1] as const,
  };

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div className="relative filter drop-shadow-[0_4px_28px_rgba(225,6,0,0.5)]">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 340 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            {/* Authentic Formula 1 Red Gradient */}
            <linearGradient id="f1GantryRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF1801" />
              <stop offset="60%" stopColor="#E10600" />
              <stop offset="100%" stopColor="#9E0000" />
            </linearGradient>

            {/* Specular Chrome Highlight */}
            <linearGradient id="chromeHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#D0D0DA" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.9" />
            </linearGradient>

            {/* Cyan Racing Telemetry Gradient */}
            <linearGradient id="telemetryLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D2BE" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>

            {/* Neon Bloom Filter */}
            <filter id="f1Glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Ambient Aerodynamic Speed Trails */}
          <g opacity="0.35">
            <motion.line
              x1="20"
              y1="34"
              x2="110"
              y2="34"
              stroke="#00D2BE"
              strokeWidth="2"
              strokeDasharray="16 8"
              initial={animated ? { x: -30, opacity: 0 } : false}
              animate={animated ? { x: [0, 30, 0], opacity: [0.2, 0.6, 0.2] } : false}
              transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
            />
            <motion.line
              x1="10"
              y1="64"
              x2="80"
              y2="64"
              stroke="#E10600"
              strokeWidth="2"
              strokeDasharray="20 10"
              initial={animated ? { x: -20, opacity: 0 } : false}
              animate={animated ? { x: [0, 25, 0], opacity: [0.2, 0.7, 0.2] } : false}
              transition={{ repeat: Infinity, duration: 1.8, ease: "linear", delay: 0.2 }}
            />
          </g>

          {/* MAIN FORMULA 1 "M7" EMBLEM WITH AUTHENTIC FORWARD RAKE */}
          <g transform="skewX(-18)" style={{ transformOrigin: '170px 60px' }}>
            {/* ======================================================== */}
            {/* THE "M": FORMULA 1 CHISELED APEX RACING GEOMETRY        */}
            {/* ======================================================== */}

            {/* 1. M - Heavy Primary Red Track (Crisp, High-Speed F1 Apexes) */}
            <motion.path
              d="M 44,100 L 44,24 L 88,74 L 132,24 L 132,100"
              stroke="url(#f1GantryRed)"
              strokeWidth="22"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeMiterlimit="3"
              fill="none"
              filter="url(#f1Glow)"
              initial={animated ? { pathLength: 0, opacity: 0 } : false}
              animate={animated ? { pathLength: 1, opacity: 1 } : false}
              transition={strokeTransition}
            />

            {/* 2. M - Left & Right Base Aerodynamic Skirts */}
            <line x1="33" y1="100" x2="55" y2="100" stroke="url(#f1GantryRed)" strokeWidth="4" />
            <line x1="121" y1="100" x2="143" y2="100" stroke="url(#f1GantryRed)" strokeWidth="4" />

            {/* 3. M - Inner Chrome Racing Groove (High-Torque Negative Space) */}
            <motion.path
              d="M 44,98 L 44,25 L 88,73 L 132,25 L 132,98"
              stroke="url(#chromeHighlight)"
              strokeWidth="3.5"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeMiterlimit="3"
              fill="none"
              opacity="0.95"
              initial={animated ? { pathLength: 0, opacity: 0 } : false}
              animate={animated ? { pathLength: 1, opacity: 0.95 } : false}
              transition={{ ...strokeTransition, delay: 0.2 }}
            />

            {/* 4. M - Center Telemetry Speed Notch */}
            <polygon points="88,62 84,54 92,54" fill="#00D2BE" opacity="0.9" />

            {/* ======================================================== */}
            {/* THE "7": SIGNATURE F1 HORIZONTAL ROOF, RAKED DIAGONAL &  */}
            {/*          AUTHENTIC MOTORSPORT HORIZONTAL CROSSBAR        */}
            {/* ======================================================== */}

            {/* 1. 7 - Primary Heavy Red Track */}
            <motion.path
              d="M 176,24 L 256,24 L 202,100"
              stroke="url(#f1GantryRed)"
              strokeWidth="22"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeMiterlimit="3"
              fill="none"
              filter="url(#f1Glow)"
              initial={animated ? { pathLength: 0, opacity: 0 } : false}
              animate={animated ? { pathLength: 1, opacity: 1 } : false}
              transition={{ ...strokeTransition, delay: 0.25 }}
            />

            {/* 2. 7 - Authentic Motorsport Crossbar (Guarantees Unmistakable "7") */}
            <motion.line
              x1="206"
              y1="60"
              x2="246"
              y2="60"
              stroke="url(#f1GantryRed)"
              strokeWidth="15"
              strokeLinecap="butt"
              filter="url(#f1Glow)"
              initial={animated ? { scaleX: 0, opacity: 0 } : false}
              animate={animated ? { scaleX: 1, opacity: 1 } : false}
              transition={{ ...strokeTransition, delay: 0.4 }}
            />

            {/* 3. 7 - Base Aerodynamic Skirt */}
            <line x1="191" y1="100" x2="213" y2="100" stroke="url(#f1GantryRed)" strokeWidth="4" />

            {/* 4. 7 - Inner Chrome Racing Groove (Top Roof & Diagonal) */}
            <motion.path
              d="M 176,24 L 254,24 L 202,98"
              stroke="url(#chromeHighlight)"
              strokeWidth="3.5"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeMiterlimit="3"
              fill="none"
              opacity="0.95"
              initial={animated ? { pathLength: 0, opacity: 0 } : false}
              animate={animated ? { pathLength: 1, opacity: 0.95 } : false}
              transition={{ ...strokeTransition, delay: 0.45 }}
            />

            {/* 5. 7 - Inner Chrome Groove for Crossbar */}
            <motion.line
              x1="208"
              y1="60"
              x2="244"
              y2="60"
              stroke="url(#chromeHighlight)"
              strokeWidth="3"
              strokeLinecap="butt"
              opacity="0.9"
              initial={animated ? { scaleX: 0 } : false}
              animate={animated ? { scaleX: 1 } : false}
              transition={{ delay: 0.5, duration: 0.3 }}
            />

            {/* 6. High-Speed DRS Slipstream Chevrons (FIA Gold & Cyan) */}
            <motion.polygon
              points="270,18 284,24 270,30 274,24"
              fill="#FFB800"
              initial={animated ? { scale: 0, opacity: 0 } : false}
              animate={animated ? { scale: 1, opacity: 1 } : false}
              transition={{ delay: 0.55, type: "spring", stiffness: 350 }}
            />
            <motion.polygon
              points="285,18 299,24 285,30 289,24"
              fill="#00D2BE"
              initial={animated ? { scale: 0, opacity: 0 } : false}
              animate={animated ? { scale: 1, opacity: 1 } : false}
              transition={{ delay: 0.65, type: "spring", stiffness: 350 }}
            />

            {/* 7. DRS Telemetry Active Strobe Indicator */}
            <motion.circle
              cx="260"
              cy="24"
              r="3.5"
              fill="#FFFFFF"
              initial={animated ? { scale: 0 } : false}
              animate={animated ? { scale: [1, 1.4, 1] } : false}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            />
          </g>
        </svg>
      </div>

      {/* OFFICIAL FORMULA 1 BROADCAST TYPOGRAPHY BADGE */}
      {showSubtitle && (
        <motion.div
          initial={animated ? { opacity: 0, y: 8 } : false}
          animate={animated ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-3 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="h-[2px] w-6 bg-gradient-to-r from-transparent to-[#E10600]"></span>
            <span className="font-f1-head font-black tracking-[0.28em] text-xs sm:text-sm text-white uppercase italic">
              MATTHEU AMARI
            </span>
            <span className="h-[2px] w-6 bg-gradient-to-l from-transparent to-[#00D2BE]"></span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="px-1.5 py-0.2 bg-[#E10600] text-white text-[9px] font-f1-head font-black italic rounded">
              GP 07
            </span>
            <p className="font-telemetry text-[10px] tracking-[0.25em] text-[#8E8E93] uppercase font-bold">
              7TH BIRTHDAY WORLD CHAMPIONSHIP
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

