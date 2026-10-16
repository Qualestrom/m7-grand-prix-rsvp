import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { M7Logo } from './M7Logo';
import { EVENT_CONFIG } from '../config/eventConfig';
import { soundtrackService } from '../services/soundtrackService';

interface TelemetryLoaderProps {
  onComplete: () => void;
}

export const TelemetryLoader: React.FC<TelemetryLoaderProps> = ({ onComplete }) => {
  const handleProceed = () => {
    soundtrackService.play();
    onComplete();
  };

  // Smoothly transition into the dramatic intro after 2.8 seconds
  useEffect(() => {
    // Start sound in low bass mode (muffled exterior garage ambience)
    soundtrackService.closeToBass(0.1);
    soundtrackService.play();

    const timer = setTimeout(() => {
      handleProceed();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      onClick={handleProceed}
      className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-[#09090D] relative overflow-hidden select-none cursor-pointer px-4"
    >
      {/* Subtle Luxury Radial Vignette Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(225,6,0,0.18)_0%,rgba(9,9,13,0.95)_70%)] pointer-events-none" />

      {/* Floating Glowing M7 Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [-8, 8, -8],
        }}
        transition={{
          opacity: { duration: 0.8 },
          scale: { duration: 0.8 },
          y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="z-10 w-full max-w-[340px] sm:max-w-[420px] md:max-w-[460px] flex flex-col items-center justify-center mx-auto text-center"
      >
        <motion.div
          className="w-full flex justify-center items-center"
          animate={{
            filter: [
              'drop-shadow(0 0 20px rgba(225,6,0,0.45))',
              'drop-shadow(0 0 50px rgba(225,6,0,0.85))',
              'drop-shadow(0 0 20px rgba(225,6,0,0.45))',
            ],
          }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <M7Logo size="xl" showSubtitle={false} animated={true} />
        </motion.div>

        {/* Minimal Luxury Typography */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-6 flex flex-col items-center text-center"
        >
          <h1 className="font-f1-head font-black tracking-[0.25em] text-white text-base sm:text-lg uppercase italic -mr-[0.25em]">
            {EVENT_CONFIG.celebrantName}
          </h1>
          <p className="font-telemetry text-xs tracking-[0.3em] text-[#8E8E98] uppercase mt-1 -mr-[0.3em]">
            7TH BIRTHDAY GRAND PRIX
          </p>
        </motion.div>
      </motion.div>

      {/* Discreet Tap to Enter Cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ delay: 1.2, duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-telemetry text-[11px] tracking-[0.2em] text-[#8E8E98] uppercase z-10 text-center whitespace-nowrap -mr-[0.2em]"
      >
        TAP ANYWHERE TO ENTER
      </motion.div>
    </div>
  );
};
