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
  // Exact 1:1 Formula 1 Aspect Ratio: Width = 31.5, Height = 6.0 (~5.25:1)
  const dimensions = {
    sm: { width: 140, height: 38 },
    md: { width: 220, height: 58 },
    lg: { width: 330, height: 86 },
    xl: { width: 460, height: 120 },
  }[size];

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* 
        360° uncropped soft red glow bloom.
        Zero clipPath, zero masks: natural dispersion in all directions.
      */}
      <div className="relative filter drop-shadow-[0_0_28px_rgba(255,24,1,0.65)] drop-shadow-[0_4px_14px_rgba(255,24,1,0.45)]">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="-0.5 8.2 31 7.6"
          fill="#FF1801"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          {/* ======================================================== */}
          {/* THE "M": 1:1 FORMULA 1 DUAL-RIBBON SPEED VECTOR (#FF1801) */}
          {/* ======================================================== */}
          {/* M - Upper Ribbon (Above y=11.24 horizontal racing slit) */}
          <motion.path
            d="M 0,15 C 0,15 2.71,12.3 4.22,10.81 C 5.77,9.34 6.54,9 9.39,9 L 11.5,9 L 13.74,11.24 L 11.5,11.24 L 10.46,10.2 C 8.5,10.2 8.0,10.34 7.08,11.21 C 6.43,11.83 5.0,13.25 4.23,14 L 3.38,15 Z M 13.74,11.24 L 15.98,9 L 18.5,9 L 16.26,11.24 L 14.5,11.24 L 15.54,10.2 L 14.78,10.2 Z"
            initial={animated ? { opacity: 0, x: -10 } : false}
            animate={animated ? { opacity: 1, x: 0 } : false}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* M - Lower Ribbon (Below y=11.61 horizontal racing slit) */}
          <motion.path
            d="M 4,15 C 4,15 5.44,13.57 6.33,12.68 C 7.28,11.73 7.66,11.61 9.88,11.61 L 11.87,11.61 L 13.74,13.48 L 15.61,11.61 L 17.6,11.61 L 14.21,15.0 L 12.2,15.0 L 13.74,13.46 L 11.0,15.0 L 7.15,15 C 7.15,15 7.92,14.25 8.18,14.2 C 9.21,14.2 9.47,14.25 9.88,13.84 L 9.88,11.61 Z"
            initial={animated ? { opacity: 0, x: -10 } : false}
            animate={animated ? { opacity: 1, x: 0 } : false}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          />

          {/* ======================================================== */}
          {/* THE "7": 1:1 PARTNER TO THE OFFICIAL F1 "1" (#FF1801)    */}
          {/* ======================================================== */}
          {/* 7 - Horizontal Top Roof (thickness = 2.24, y=9.0 to 11.24) */}
          <motion.path
            d="M 19.14,9.0 L 26.0,9.0 L 23.76,11.24 L 16.90,11.24 Z"
            initial={animated ? { opacity: 0, x: 10 } : false}
            animate={animated ? { opacity: 1, x: 0 } : false}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.14 }}
          />

          {/* 7 - Slanted 45° Leg (Exact F1 "1" parallelogram: w=3.61) */}
          <motion.path
            d="M 26.0,9.0 L 20.0,15.0 L 23.61,15.0 L 29.61,9.0 Z"
            initial={animated ? { opacity: 0, x: 10 } : false}
            animate={animated ? { opacity: 1, x: 0 } : false}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          />
        </svg>
      </div>

      {showSubtitle && (
        <motion.div
          initial={animated ? { opacity: 0, y: 8 } : false}
          animate={animated ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.6, delay: 0.4 }}
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
