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
    sm: { width: 140, height: 64 },
    md: { width: 220, height: 101 },
    lg: { width: 330, height: 152 },
    xl: { width: 460, height: 211 },
  }[size];

  const rawId = React.useId();
  const maskId = `m7-mask-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* 
        360° uncropped soft red glow bloom.
        Zero top cropping: ample headroom so the rounded crest of M stays 100% intact.
      */}
      <motion.div
        initial={animated ? { opacity: 0, scale: 0.95 } : false}
        animate={animated ? { opacity: 1, scale: 1 } : false}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative filter drop-shadow-[0_0_26px_rgba(255,24,1,0.65)] drop-shadow-[0_4px_12px_rgba(255,24,1,0.45)]"
      >
        <svg
          viewBox="-28.25 -23 370 170"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible w-full h-auto"
          style={{ maxWidth: dimensions.width }}
        >
          <defs>
            {/* 
              Precision Mask with userSpaceOnUse bounds:
              - Full vertical headroom (y=-500) so the top curve of M is 100% uncropped.
              - Razor-flat horizontal baseline at y=124 where all 3 bottom feet terminate flush.
              - 100% genuine transparent 6.5px racing slit.
            */}
            <mask
              id={maskId}
              maskUnits="userSpaceOnUse"
              x="-500"
              y="-500"
              width="2000"
              height="2000"
            >
              {/* White area allows all graphics from y=-500 down to exact baseline y=124 */}
              <rect x="-500" y="-500" width="2000" height="624" fill="white" />

              {/* Slit running through M */}
              <path
                d="M 46,130 L 46,38 C 46,22 60,18 74,26 L 110,76 L 146,26 C 160,18 174,22 174,38 L 174,130"
                fill="none"
                stroke="black"
                strokeWidth="6.5"
                strokeLinecap="butt"
                strokeLinejoin="round"
              />
              {/* Slit running through 7 (aligned to y=22 top, descends past 124 so it cuts cleanly through baseline) */}
              <path
                d="M 202,22 L 264,22 C 276,22 280,30 272,42 L 210,135"
                fill="none"
                stroke="black"
                strokeWidth="6.5"
                strokeLinecap="butt"
                strokeLinejoin="round"
              />
            </mask>
          </defs>

          {/* SKEWED GROUP: Skewed at -26° forward aerodynamic rake - standard g so Framer Motion never overrides transform */}
          <g
            transform="skewX(-26)"
            style={{ transformOrigin: '160px 65px' }}
            mask={`url(#${maskId})`}
          >
            {/* THE "M": 44px extra-wide solid red ribbon, ends at baseline y=124 */}
            <path
              d="M 46,124 L 46,38 C 46,22 60,18 74,26 L 110,76 L 146,26 C 160,18 174,22 174,38 L 174,124"
              fill="none"
              stroke="#FF1801"
              strokeWidth="44"
              strokeLinecap="butt"
              strokeLinejoin="round"
            />

            {/* THE "7": 44px extra-wide solid red ribbon, top aligned to y=22 (top edge y=0), baseline cuts horizontally flush at y=124 */}
            <path
              d="M 202,22 L 264,22 C 276,22 280,30 272,42 L 210,135"
              fill="none"
              stroke="#FF1801"
              strokeWidth="44"
              strokeLinecap="butt"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </motion.div>

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
