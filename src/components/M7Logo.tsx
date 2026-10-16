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
  // Proportions matching the muscular twin-ribbon F1 racetrack geometry
  const dimensions = {
    sm: { width: 140, height: 56 },
    md: { width: 220, height: 88 },
    lg: { width: 330, height: 132 },
    xl: { width: 460, height: 184 },
  }[size];

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* 
        360° uncropped soft red glow bloom.
        Zero clipPath, zero overflow restriction: natural red light dispersion in all directions.
      */}
      <div className="relative filter drop-shadow-[0_0_26px_rgba(255,24,1,0.65)] drop-shadow-[0_4px_12px_rgba(255,24,1,0.45)]">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="10 10 330 135"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            {/* 100% genuine transparent racing slit (negative space) */}
            <mask id="m7-wide-racing-slit">
              <rect x="-200" y="-200" width="1000" height="800" fill="white" />
              {/* Slit running through M */}
              <path
                d="M 46,124 L 46,38 C 46,22 60,18 74,26 L 110,76 L 146,26 C 160,18 174,22 174,38 L 174,124"
                fill="none"
                stroke="black"
                strokeWidth="6.5"
                strokeLinecap="butt"
                strokeLinejoin="round"
              />
              {/* Slit running through 7 (y_end compensated to 114 for exact baseline alignment) */}
              <path
                d="M 202,26 L 264,26 C 276,26 280,34 272,46 L 218,114"
                fill="none"
                stroke="black"
                strokeWidth="6.5"
                strokeLinecap="butt"
                strokeLinejoin="round"
              />
            </mask>
          </defs>

          {/* SKEWED GROUP: Completely unclipped, zero clip-path */}
          <motion.g
            transform="skewX(-26)"
            style={{ transformOrigin: '160px 65px' }}
            mask="url(#m7-wide-racing-slit)"
            initial={animated ? { opacity: 0, scale: 0.95 } : false}
            animate={animated ? { opacity: 1, scale: 1 } : false}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* THE "M": 44px extra-wide solid red ribbon */}
            <path
              d="M 46,124 L 46,38 C 46,22 60,18 74,26 L 110,76 L 146,26 C 160,18 174,22 174,38 L 174,124"
              fill="none"
              stroke="#FF1801"
              strokeWidth="44"
              strokeLinecap="butt"
              strokeLinejoin="round"
            />

            {/* THE "7": 44px extra-wide solid red ribbon (horizontal roof + slanted leg, no crossbar) */}
            <path
              d="M 202,26 L 264,26 C 276,26 280,34 272,46 L 218,114"
              fill="none"
              stroke="#FF1801"
              strokeWidth="44"
              strokeLinecap="butt"
              strokeLinejoin="round"
            />
          </motion.g>
        </svg>
      </div>

      {showSubtitle && (
        <motion.div
          initial={animated ? { opacity: 0, y: 8 } : false}
          animate={animated ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-3 text-center"
        >
          <div className="font-heading font-black tracking-[0.3em] uppercase text-xs md:text-sm text-foreground flex items-center justify-center gap-2">
            <span>MATTHEU</span>
            <span className="w-1.5 h-1.5 rounded-full bg-racing-red inline-block" />
            <span>AMARI</span>
          </div>
          <div className="font-mono text-[10px] tracking-[0.25em] text-racing-red uppercase font-semibold mt-0.5">
            GRAND PRIX 2026 &bull; 7TH BIRTHDAY
          </div>
        </motion.div>
      )}
    </div>
  );
};
