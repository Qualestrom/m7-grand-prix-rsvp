import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EVENT_CONFIG } from '../config/eventConfig';
import { soundtrackService } from '../services/soundtrackService';
import { FastForward, Zap } from 'lucide-react';

interface DramaticIntroProps {
  onComplete: () => void;
}

type IntroStage = 'name' | 'turning' | 'number' | 'full';

export const DramaticIntro: React.FC<DramaticIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<IntroStage>('name');

  useEffect(() => {
    // Open trebles with an explosive sweep as the introduction starts!
    soundtrackService.openTreble(0.35);
    soundtrackService.play();

    // Stage 1: Mattheu Amari (0.0s - 1.1s)
    const t1 = setTimeout(() => {
      setStage('turning');
    }, 1100);

    // Stage 2: is turning (1.1s - 2.0s)
    const t2 = setTimeout(() => {
      setStage('number');
    }, 2000);

    // Stage 3: 7 (2.0s - 2.9s)
    const t3 = setTimeout(() => {
      setStage('full');
    }, 2900);

    // Stage 4: full "Mattheu Amari is turning 7!" lockup (2.9s - 4.6s)
    const t4 = setTimeout(() => {
      onComplete();
    }, 4700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundtrackService.openTreble(0.1);
    soundtrackService.play();
    onComplete();
  };

  return (
    <div
      onClick={handleSkip}
      className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-[#09090D] relative overflow-hidden select-none cursor-pointer px-4"
    >
      {/* Dynamic F1 Broadcast Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(225,6,0,0.22)_0%,rgba(9,9,13,0.98)_70%)] pointer-events-none" />

      {/* Top Kerb Strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 kerb-inlay-h opacity-70" />

      {/* F1 Broadcast Telemetry HUD Corner Tags */}
      <div className="absolute top-5 left-5 font-telemetry text-[11px] text-[#8E8E98] tracking-[0.2em] uppercase flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#E10600] animate-ping" />
        <span className="text-[#E10600] font-bold">LIVE BROADCAST</span>
        <span className="hidden sm:inline text-white/30">•</span>
        <span className="hidden sm:inline">M7 GRAND PRIX</span>
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        type="button"
        className="absolute top-4 right-18 sm:right-28 z-40 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-[#8E8E98] hover:text-white font-telemetry text-[11px] tracking-widest uppercase transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
      >
        <span>SKIP</span>
        <FastForward size={13} />
      </button>

      {/* Central Dramatic Animation Container */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center justify-center text-center py-10 min-h-[320px]">
        <AnimatePresence mode="wait">
          {/* BEAT 1: "MATTHEU AMARI" */}
          {stage === 'name' && (
            <motion.div
              key="stage-name"
              initial={{ opacity: 0, scale: 1.35, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, filter: 'blur(8px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-2 text-[#E10600] font-telemetry text-xs tracking-[0.3em] uppercase font-bold mb-3">
                <Zap size={14} className="fill-[#E10600]" />
                <span>CHAMPIONSHIP DRIVER</span>
              </div>
              <h1 className="font-f1-head text-4xl sm:text-6xl md:text-7xl font-black italic tracking-tight text-white uppercase drop-shadow-[0_0_35px_rgba(225,6,0,0.6)]">
                {EVENT_CONFIG.celebrantName}
              </h1>
            </motion.div>
          )}

          {/* BEAT 2: "IS TURNING" */}
          {stage === 'turning' && (
            <motion.div
              key="stage-turning"
              initial={{ opacity: 0, scale: 0.8, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, scale: 1, letterSpacing: '0.28em' }}
              exit={{ opacity: 0, scale: 1.2, filter: 'blur(8px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <span className="font-telemetry text-xs text-[#8E8E98] tracking-[0.3em] uppercase mb-2">
                GRAND PRIX MILESTONE
              </span>
              <h2 className="font-f1-head text-3xl sm:text-5xl md:text-6xl font-black italic text-[#00D2BE] uppercase tracking-[0.25em] drop-shadow-[0_0_30px_rgba(0,210,190,0.6)]">
                IS TURNING
              </h2>
            </motion.div>
          )}

          {/* BEAT 3: "7" */}
          {stage === 'number' && (
            <motion.div
              key="stage-number"
              initial={{ opacity: 0, scale: 2.2, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.7, filter: 'blur(10px)' }}
              transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex flex-col items-center"
            >
              <span className="font-telemetry text-xs text-[#FFB800] tracking-[0.3em] uppercase mb-1 font-bold">
                RACE NUMBER
              </span>
              <div className="font-f1-head text-8xl sm:text-9xl md:text-[140px] font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white via-[#FF2A2A] to-[#E10600] leading-none drop-shadow-[0_0_50px_rgba(225,6,0,0.9)]">
                7
              </div>
            </motion.div>
          )}

          {/* BEAT 4: FULL ASSEMBLE "MATTHEU AMARI IS TURNING 7!" */}
          {stage === 'full' && (
            <motion.div
              key="stage-full"
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              {/* Telemetry Badge */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="px-3.5 py-1 rounded-full bg-[#E10600]/20 border border-[#E10600]/50 text-[#FF4D4D] font-telemetry text-xs font-bold tracking-[0.25em] uppercase mb-3 flex items-center gap-2 shadow-[0_0_20px_rgba(225,6,0,0.4)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-ping" />
                OFFICIAL INVITATION
              </motion.div>

              {/* Name */}
              <h1 className="font-f1-head text-3xl sm:text-5xl md:text-6xl font-black italic tracking-tight text-white uppercase drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
                {EVENT_CONFIG.celebrantName}
              </h1>

              {/* IS TURNING 7! */}
              <div className="mt-2 sm:mt-3 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                <span className="font-telemetry text-base sm:text-2xl md:text-3xl font-extrabold tracking-[0.25em] text-[#00D2BE] uppercase drop-shadow-[0_0_15px_rgba(0,210,190,0.5)]">
                  IS TURNING
                </span>
                <span className="font-f1-head text-4xl sm:text-6xl md:text-7xl font-black italic text-[#E10600] uppercase drop-shadow-[0_0_35px_rgba(225,6,0,0.9)] animate-pulse">
                  7!
                </span>
              </div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-telemetry text-xs sm:text-sm tracking-[0.35em] text-[#8E8E98] uppercase font-bold mt-4"
              >
                FORMULA 7 WORLD CHAMPIONSHIP
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Checkered Track Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 kerb-inlay-h opacity-70" />

      {/* Tap anywhere hint */}
      <div className="absolute bottom-5 font-telemetry text-[10px] tracking-[0.25em] text-[#8E8E98] uppercase">
        TAP ANYWHERE TO ENTER VIP PADDOCK
      </div>
    </div>
  );
};
