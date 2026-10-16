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
    sm: { width: 140, height: 60, scale: 0.6 },
    md: { width: 220, height: 90, scale: 0.85 },
    lg: { width: 320, height: 130, scale: 1.2 },
    xl: { width: 420, height: 170, scale: 1.6 },
  }[size];

  const drawTransition = {
    duration: 1.6,
    ease: [0.16, 1, 0.3, 1] as const,
  };

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div className="relative filter drop-shadow-[0_0_24px_rgba(225,6,0,0.45)]">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 320 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="f1RedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF1801" />
              <stop offset="100%" stopColor="#B30000" />
            </linearGradient>
            <linearGradient id="whiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#D4D4D8" />
            </linearGradient>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#FF9900" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Aerodynamic Speed Lines behind the logo */}
          <g opacity="0.6">
            <motion.line
              x1="10"
              y1="28"
              x2="100"
              y2="28"
              stroke="#00D2BE"
              strokeWidth="2.5"
              strokeDasharray="16 8"
              initial={animated ? { x: -30, opacity: 0 } : false}
              animate={animated ? { x: [0, 40, 0], opacity: [0.3, 0.9, 0.3] } : false}
              transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
            />
            <motion.line
              x1="5"
              y1="48"
              x2="70"
              y2="48"
              stroke="#E10600"
              strokeWidth="2"
              strokeDasharray="20 10"
              initial={animated ? { x: -20, opacity: 0 } : false}
              animate={animated ? { x: [0, 30, 0], opacity: [0.2, 0.7, 0.2] } : false}
              transition={{ repeat: Infinity, duration: 1.8, ease: "linear", delay: 0.3 }}
            />
            <motion.line
              x1="15"
              y1="68"
              x2="60"
              y2="68"
              stroke="#FFB800"
              strokeWidth="2"
              strokeDasharray="12 6"
              initial={animated ? { x: -15, opacity: 0 } : false}
              animate={animated ? { x: [0, 25, 0], opacity: [0.2, 0.8, 0.2] } : false}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear", delay: 0.5 }}
            />
          </g>

          {/* "M" - Sweeping Left Aerodynamic Ribbon (F1 Red) */}
          <motion.path
            d="M 50 102 L 86 18 H 122 L 96 102 H 68 L 94 40 H 76 L 50 102 Z"
            fill="url(#f1RedGrad)"
            stroke="#FFFFFF"
            strokeWidth={animated ? "1.5" : "0"}
            initial={animated ? { pathLength: 0, opacity: 0 } : false}
            animate={animated ? { pathLength: 1, opacity: 1 } : false}
            transition={drawTransition}
            filter="url(#neonGlow)"
          />

          {/* "M" - Inner Interlocking Diagonal Ribbon (Pure White / Kerb Strip) */}
          <motion.path
            d="M 106 102 L 132 40 H 150 L 124 102 H 106 Z M 138 18 H 174 L 148 102 H 128 L 152 40 H 144 L 138 18 Z"
            fill="url(#whiteGrad)"
            stroke="#00D2BE"
            strokeWidth={animated ? "1" : "0"}
            initial={animated ? { pathLength: 0, opacity: 0 } : false}
            animate={animated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ ...drawTransition, delay: 0.2 }}
          />

          {/* "7" - Detached Racing Speed Mark tucked into the slipstream (F1 Red & Gold) */}
          <g>
            {/* Top Bar of the 7 */}
            <motion.path
              d="M 186 18 H 268 L 254 44 H 206 L 202 54 H 236 L 226 72 H 202 L 186 18 Z"
              fill="url(#f1RedGrad)"
              initial={animated ? { x: 30, opacity: 0 } : false}
              animate={animated ? { x: 0, opacity: 1 } : false}
              transition={{ ...drawTransition, delay: 0.35 }}
              filter="url(#neonGlow)"
            />
            {/* Sweeping Diagonal Stem of the 7 */}
            <motion.path
              d="M 268 18 L 226 102 H 194 L 238 32 H 258 L 268 18 Z"
              fill="url(#whiteGrad)"
              initial={animated ? { y: -20, opacity: 0 } : false}
              animate={animated ? { y: 0, opacity: 1 } : false}
              transition={{ ...drawTransition, delay: 0.45 }}
            />
            {/* High-speed Slipstream Chevron */}
            <motion.polygon
              points="278,22 292,18 284,38 270,42"
              fill="url(#goldGrad)"
              initial={animated ? { scale: 0, opacity: 0 } : false}
              animate={animated ? { scale: 1, opacity: 1 } : false}
              transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
            />
          </g>

          {/* DRS / Telemetry Cyan Racing Dot Indicator */}
          <motion.circle
            cx="278"
            cy="18"
            r="4.5"
            fill="#00D2BE"
            initial={animated ? { scale: 0 } : false}
            animate={animated ? { scale: [1, 1.4, 1] } : false}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
        </svg>
      </div>

      {showSubtitle && (
        <motion.div
          initial={animated ? { opacity: 0, y: 10 } : false}
          animate={animated ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-2 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="h-[2px] w-6 bg-[#E10600]"></span>
            <span className="font-f1-head font-black tracking-[0.25em] text-xs sm:text-sm text-white uppercase">
              MATTHEU AMARI
            </span>
            <span className="h-[2px] w-6 bg-[#00D2BE]"></span>
          </div>
          <p className="font-telemetry text-[10px] tracking-[0.3em] text-[#8E8E93] mt-0.5 uppercase">
            ROUND 07 • 7TH BIRTHDAY GRAND PRIX
          </p>
        </motion.div>
      )}
    </div>
  );
};
