import React from 'react';
import { motion } from 'framer-motion';

interface M7LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  animated?: boolean;
  slitColor?: 'dark' | 'white';
  className?: string;
}

export const M7Logo: React.FC<M7LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  animated = true,
  slitColor = 'dark',
  className = '',
}) => {
  const dimensions = {
    sm: { width: 140, height: 60, scale: 0.65 },
    md: { width: 220, height: 95, scale: 0.9 },
    lg: { width: 330, height: 140, scale: 1.25 },
    xl: { width: 450, height: 185, scale: 1.65 },
  }[size];

  const strokeTransition = {
    duration: 1.2,
    ease: [0.16, 1, 0.3, 1] as const,
  };

  const slitStrokeColor = slitColor === 'white' ? '#FFFFFF' : '#09090D';

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div className="relative filter drop-shadow-[0_4px_32px_rgba(255,24,1,0.55)]">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 350 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            {/* Authentic Formula 1 Red Gradient */}
            <linearGradient id="f1GantryRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF2A14" />
              <stop offset="50%" stopColor="#FF1801" />
              <stop offset="100%" stopColor="#D60A00" />
            </linearGradient>

            {/* Specular Chrome Highlight */}
            <linearGradient id="chromeHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#E5E5F0" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.85" />
            </linearGradient>

            {/* Flat Horizontal Baseline Clip: Ensures razor-flat bottom edge */}
            <clipPath id="m7BaselineClip">
              <rect x="0" y="0" width="450" height="114" />
            </clipPath>

            {/* Neon Bloom Glow Filter */}
            <filter id="f1Glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* MAIN FORMULA 1 "M7" EMBLEM WITH AUTHENTIC 26-DEGREE FORWARD RAKE */}
          <g transform="skewX(-26)" style={{ transformOrigin: '160px 65px' }} clipPath="url(#m7BaselineClip)">
            {/* ======================================================== */}
            {/* THE "M": FORMULA 1 RACETRACK APEX DUAL-RIBBON (36px WIDE) */}
            {/* ======================================================== */}

            {/* 1. M - Wide Heavy Red Track */}
            <motion.path
              d="M 44,130 L 44,38 C 44,23 58,18 72,26 L 108,72 L 144,26 C 158,18 172,23 172,38 L 172,130"
              stroke="url(#f1GantryRed)"
              strokeWidth="36"
              strokeLinecap="butt"
              strokeLinejoin="round"
              fill="none"
              filter="url(#f1Glow)"
              initial={animated ? { pathLength: 0, opacity: 0 } : false}
              animate={animated ? { pathLength: 1, opacity: 1 } : false}
              transition={strokeTransition}
            />

            {/* 2. M - Inner Negative-Space Racing Groove */}
            <motion.path
              d="M 44,130 L 44,38 C 44,23 58,18 72,26 L 108,72 L 144,26 C 158,18 172,23 172,38 L 172,130"
              stroke={slitStrokeColor}
              strokeWidth="5.5"
              strokeLinecap="butt"
              strokeLinejoin="round"
              fill="none"
              initial={animated ? { pathLength: 0, opacity: 0 } : false}
              animate={animated ? { pathLength: 1, opacity: 1 } : false}
              transition={{ ...strokeTransition, delay: 0.15 }}
            />

            {/* 3. M - Chrome Specular Racing Highlight */}
            <motion.path
              d="M 44,130 L 44,38 C 44,23 58,18 72,26 L 108,72 L 144,26 C 158,18 172,23 172,38 L 172,130"
              stroke="url(#chromeHighlight)"
              strokeWidth="1.8"
              strokeLinecap="butt"
              strokeLinejoin="round"
              fill="none"
              opacity="0.9"
              initial={animated ? { pathLength: 0, opacity: 0 } : false}
              animate={animated ? { pathLength: 1, opacity: 0.9 } : false}
              transition={{ ...strokeTransition, delay: 0.2 }}
            />

            {/* ======================================================== */}
            {/* THE "7": NATURAL MOTORSPORT ROOF & RAKED LEG (36px WIDE) */}
            {/* ======================================================== */}

            {/* 1. 7 - Wide Heavy Red Track (No Crossbar) */}
            <motion.path
              d="M 198,26 L 256,26 C 269,26 273,34 265,46 L 212,130"
              stroke="url(#f1GantryRed)"
              strokeWidth="36"
              strokeLinecap="butt"
              strokeLinejoin="round"
              fill="none"
              filter="url(#f1Glow)"
              initial={animated ? { pathLength: 0, opacity: 0 } : false}
              animate={animated ? { pathLength: 1, opacity: 1 } : false}
              transition={{ ...strokeTransition, delay: 0.2 }}
            />

            {/* 2. 7 - Inner Negative-Space Racing Groove */}
            <motion.path
              d="M 198,26 L 256,26 C 269,26 273,34 265,46 L 212,130"
              stroke={slitStrokeColor}
              strokeWidth="5.5"
              strokeLinecap="butt"
              strokeLinejoin="round"
              fill="none"
              initial={animated ? { pathLength: 0, opacity: 0 } : false}
              animate={animated ? { pathLength: 1, opacity: 1 } : false}
              transition={{ ...strokeTransition, delay: 0.3 }}
            />

            {/* 3. 7 - Chrome Specular Racing Highlight */}
            <motion.path
              d="M 198,26 L 256,26 C 269,26 273,34 265,46 L 212,130"
              stroke="url(#chromeHighlight)"
              strokeWidth="1.8"
              strokeLinecap="butt"
              strokeLinejoin="round"
              fill="none"
              opacity="0.9"
              initial={animated ? { pathLength: 0, opacity: 0 } : false}
              animate={animated ? { pathLength: 1, opacity: 0.9 } : false}
              transition={{ ...strokeTransition, delay: 0.35 }}
            />
          </g>
        </svg>
      </div>

      {/* OFFICIAL FORMULA 1 MINIMAL TYPOGRAPHY BADGE */}
      {showSubtitle && (
        <motion.div
          initial={animated ? { opacity: 0, y: 6 } : false}
          animate={animated ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-3 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="h-[2px] w-5 bg-gradient-to-r from-transparent to-[#FF1801]"></span>
            <span className="font-f1-head font-black tracking-[0.26em] text-xs sm:text-sm text-white uppercase italic">
              MATTHEU AMARI
            </span>
            <span className="h-[2px] w-5 bg-gradient-to-l from-transparent to-[#FF1801]"></span>
          </div>
          <p className="font-telemetry text-[9px] sm:text-[10px] tracking-[0.24em] text-[#8E8E93] uppercase font-bold mt-0.5">
            TURNING 7 • GRAND PRIX 2026
          </p>
        </motion.div>
      )}
    </div>
  );
};
