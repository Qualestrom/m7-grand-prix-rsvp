import React from 'react';
import { motion } from 'framer-motion';

// Official Formula 1 Display Bold Vector Paths (Marc Rouault / Wieden+Kennedy F1 Typography)
const F1_BOLD_PATH_M = "M40 0H233L273 564C273.6666717529297 571.3333282470703 275.1666717529297 577.3333282470703 277.5 582.0C279.8333282470703 586.6666717529297 284.3333282470703 589.0 291.0 589.0C296.3333282470703 589.0 300.6666717529297 587.0 304.0 583.0C307.3333282470703 579.0 309.6666717529297 573.3333282470703 311.0 566.0L381.0 167.0C389.6666717529297 115.0 411.3333282470703 72.16667175292969 446.0 38.5C480.6666717529297 4.8333282470703125 527.0 -12.0 585.0 -12.0C641.0 -12.0 686.1666717529297 4.3333282470703125 720.5 37.0C754.8333282470703 69.66667175292969 776.3333282470703 112.66667175292969 785.0 166.0L852.0 567.0C852.6666717529297 573.0 854.6666717529297 578.1666717529297 858.0 582.5C861.3333282470703 586.8333282470703 865.6666717529297 589.0 871.0 589.0C877.6666717529297 589.0 881.8333282470703 586.6666717529297 883.5 582.0C885.1666717529297 577.3333282470703 886.3333282470703 571.6666717529297 887.0 565.0L927.0 0.0H1120.0L1073.0 536.0C1066.3333282470703 615.3333282470703 1047.5 672.8333282470703 1016.5 708.5C985.5 744.1666717529297 938.3333282470703 762.0 875.0 762.0C815.0 762.0 767.1666717529297 743.5 731.5 706.5C695.8333282470703 669.5 673.3333282470703 619.3333282470703 664.0 556.0L607.0 184.0C606.3333282470703 176.0 604.3333282470703 169.6666717529297 601.0 165.0C597.6666717529297 160.3333282470703 592.6666717529297 158.0 586.0 158.0C579.3333282470703 158.0 574.5 160.0 571.5 164.0C568.5 168.0 566.3333282470703 174.0 565.0 182.0L506.0 555.0C496.0 619.0 473.1666717529297 669.5 437.5 706.5C401.8333282470703 743.5 353.6666717529297 762.0 293.0 762.0C236.3333282470703 762.0 189.5 744.3333282470703 152.5 709.0C115.5 673.6666717529297 93.66667175292969 616.0 87.0 536.0Z";
const F1_BOLD_PATH_7 = "M330 0 602 459C617.3333282470703 485.6666717529297 630.1666717529297 511.6666717529297 640.5 537.0C650.8333282470703 562.3333282470703 656.0 587.3333282470703 656.0 612.0C656.0 654.6666717529297 641.6666717529297 688.3333282470703 613.0 713.0C584.3333282470703 737.6666717529297 539.0 750.0 477.0 750.0H36.0V597.0H414.0C424.6666717529297 597.0 432.6666717529297 595.1666717529297 438.0 591.5C443.3333282470703 587.8333282470703 446.0 582.3333282470703 446.0 575.0C446.0 569.6666717529297 445.1666717529297 563.8333282470703 443.5 557.5C441.8333282470703 551.1666717529297 438.3333282470703 543.6666717529297 433.0 535.0L112.0 0.0Z";

interface M7LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  animated?: boolean;
  className?: string;
  variant?: 'f1-bold' | 'f1-ribbon';
}

export const M7Logo: React.FC<M7LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  animated = true,
  className = '',
  variant = 'f1-bold',
}) => {
  // Proportional sizing matching Formula 1 mark proportions
  const dimensions = {
    sm: { width: 140, height: 44 },
    md: { width: 220, height: 68 },
    lg: { width: 320, height: 98 },
    xl: { width: 440, height: 136 },
  }[size];

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* 
        360° uncropped soft red glow bloom.
        Zero clipPath, zero overflow restriction: natural dispersion in all directions.
      */}
      <div className="relative filter drop-shadow-[0_0_28px_rgba(255,24,1,0.65)] drop-shadow-[0_4px_14px_rgba(255,24,1,0.45)]">
        {variant === 'f1-bold' ? (
          /* ======================================================== */
          /* VARIANT 1: OFFICIAL FORMULA 1 DISPLAY BOLD MASTER        */
          /* 100% Authentic F1 Typography + 45° Rake + Racing Slit   */
          /* ======================================================== */
          <svg
            width={dimensions.width}
            height={dimensions.height}
            viewBox="80 -60 2660 840"
            fill="#FF1801"
            xmlns="http://www.w3.org/2000/svg"
            className="overflow-visible"
          >
            <defs>
              <mask id="m7-f1-bold-slit-mask">
                <rect x="-3000" y="-3000" width="10000" height="10000" fill="white" />
                {/* Horizontal racing slit through M at 42% cap height */}
                <rect x="-3000" y="285" width="4160" height="45" fill="black" />
              </mask>
            </defs>

            <motion.g
              transform="translate(100, 720) scale(1, -1) skewX(45)"
              initial={animated ? { opacity: 0, scale: 0.96 } : false}
              animate={animated ? { opacity: 1, scale: 1 } : false}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* THE M (With official F1 horizontal racing slit cutaway) */}
              <g mask="url(#m7-f1-bold-slit-mask)">
                <path d={F1_BOLD_PATH_M} />
              </g>

              {/* THE 7 (Bold solid monolithic block, exactly mirroring the F1 '1') */}
              <g transform="translate(1200, 0)">
                <path d={F1_BOLD_PATH_7} />
              </g>
            </motion.g>
          </svg>
        ) : (
          /* ======================================================== */
          /* VARIANT 2: TWIN-RIBBON SPEEDTRACK M7 (REFINED FAVORITE)  */
          /* 45° Rake + Genuine Transparent Slit + Aligned Baseline    */
          /* ======================================================== */
          <svg
            width={dimensions.width}
            height={dimensions.height}
            viewBox="0 0 420 120"
            fill="#FF1801"
            xmlns="http://www.w3.org/2000/svg"
            className="overflow-visible"
          >
            <defs>
              <mask id="m7-twin-ribbon-slit-mask">
                <rect width="100%" height="100%" fill="white" />
                <path
                  d="
                    M 40,110 L 40,36 C 40,22 54,18 66,26 L 100,74 L 134,26 C 146,18 160,22 160,36 L 160,110
                    M 190,26 L 260,26 C 270,26 272,34 264,46 L 220,110
                  "
                  fill="none" stroke="black" stroke-width="6" stroke-linecap="butt" stroke-linejoin="round"
                />
              </mask>
            </defs>
            <motion.g
              transform="skewX(-45)"
              style={{ transformOrigin: '210px 60px' }}
              mask="url(#m7-twin-ribbon-slit-mask)"
              initial={animated ? { opacity: 0, scale: 0.96 } : false}
              animate={animated ? { opacity: 1, scale: 1 } : false}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <path
                d="M 40,110 L 40,36 C 40,22 54,18 66,26 L 100,74 L 134,26 C 146,18 160,22 160,36 L 160,110"
                fill="none" stroke="#FF1801" strokeWidth="32" strokeLinecap="butt" strokeLinejoin="round"
              />
              <path
                d="M 190,26 L 260,26 C 270,26 272,34 264,46 L 220,110"
                fill="none" stroke="#FF1801" strokeWidth="32" strokeLinecap="butt" strokeLinejoin="round"
              />
            </motion.g>
          </svg>
        )}
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
