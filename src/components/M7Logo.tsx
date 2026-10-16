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

          {/* MAIN FORMULA 1 "M7" EMBLEM WITH AUTHENTIC 20-DEGREE FORWARD RAKE */}
          <g transform="skewX(-20)" style={{ transformOrigin: '170px 60px' }}>
            {/* ======================================================== */}
            {/* THE "M": DUAL RACETRACK APEX RIBBONS */}
            {/* ======================================================== */}

            {/* 1. M - Heavy Primary Red Ribbon (Tubular Racetrack) */}
            <motion.path
              d="M 52,100 L 52,36 C 52,18 80,18 82,36 L 96,72 C 100,82 108,82 112,72 L 126,36 C 128,18 156,18 156,36 L 156,100"
              stroke="url(#f1GantryRed)"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              filter="url(#f1Glow)"
              initial={animated ? { pathLength: 0, opacity: 0 } : false}
              animate={animated ? { pathLength: 1, opacity: 1 } : false}
              transition={strokeTransition}
            />

            {/* 2. M - Inner Negative-Space Racing Groove (White & Cyan) */}
            <motion.path
              d="M 52,100 L 52,36 C 52,18 80,18 82,36 L 96,72 C 100,82 108,82 112,72 L 126,36 C 128,18 156,18 156,36 L 156,100"
              stroke="url(#chromeHighlight)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.9"
              initial={animated ? { pathLength: 0, opacity: 0 } : false}
              animate={animated ? { pathLength: 1, opacity: 0.9 } : false}
              transition={{ ...strokeTransition, delay: 0.2 }}
            />

            {/* ======================================================== */}
            {/* THE "7": SIGNATURE F1 HORIZONTAL BAR & DIAGONAL SLASH */}
            {/* ======================================================== */}

            {/* 1. 7 - Heavy Primary Red Ribbon */}
            <motion.path
              d="M 188,27 L 246,27 C 260,27 266,35 258,49 L 214,100"
              stroke="url(#f1GantryRed)"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              filter="url(#f1Glow)"
              initial={animated ? { pathLength: 0, opacity: 0 } : false}
              animate={animated ? { pathLength: 1, opacity: 1 } : false}
              transition={{ ...strokeTransition, delay: 0.3 }}
            />

            {/* 2. 7 - Inner Chrome Racing Groove */}
            <motion.path
              d="M 188,27 L 246,27 C 260,27 266,35 258,49 L 214,100"
              stroke="url(#chromeHighlight)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.9"
              initial={animated ? { pathLength: 0, opacity: 0 } : false}
              animate={animated ? { pathLength: 1, opacity: 0.9 } : false}
              transition={{ ...strokeTransition, delay: 0.45 }}
            />

            {/* 3. High-Speed DRS Slipstream Chevron Mark */}
            <motion.polygon
              points="272,28 284,24 278,38 266,42"
              fill="#FFB800"
              initial={animated ? { scale: 0, opacity: 0 } : false}
              animate={animated ? { scale: 1, opacity: 1 } : false}
              transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
            />

            {/* 4. DRS Telemetry Active Dot */}
            <motion.circle
              cx="264"
              cy="27"
              r="3.5"
              fill="#00D2BE"
              initial={animated ? { scale: 0 } : false}
              animate={animated ? { scale: [1, 1.4, 1] } : false}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
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
