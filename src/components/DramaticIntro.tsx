import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EVENT_CONFIG } from '../config/eventConfig';
import { soundtrackService } from '../services/soundtrackService';
import { RaceTrackPOV } from './circuit3d/RaceTrackPOV';
import { FastForward, Zap, Trophy, Flag } from 'lucide-react';

interface DramaticIntroProps {
  onComplete: () => void;
}

type IntroStage = 'name' | 'turning' | 'number' | 'full';

export const DramaticIntro: React.FC<DramaticIntroProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<IntroStage>('name');

  useEffect(() => {
    // Open trebles with an explosive sweep as the introduction starts!
    soundtrackService.openTreble(0.45);
    soundtrackService.play();

    // Slower, immersive pacing:
    // Stage 1: Mattheu Amari (0.0s - 2.6s)
    const t1 = setTimeout(() => {
      setStage('turning');
    }, 2600);

    // Stage 2: is turning (2.6s - 5.2s)
    const t2 = setTimeout(() => {
      setStage('number');
    }, 5200);

    // Stage 3: 7 (5.2s - 7.8s)
    const t3 = setTimeout(() => {
      setStage('full');
    }, 7800);

    // Stage 4: full "Mattheu Amari is turning 7!" lockup (7.8s - 11.2s)
    const t4 = setTimeout(() => {
      onComplete();
    }, 11200);

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
      {/* 3D POV Race Track & Battling F1 Cars Background */}
      <RaceTrackPOV />

      {/* Top Kerb Strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 kerb-inlay-h opacity-70 z-10" />

      {/* F1 Broadcast Telemetry HUD Header */}
      <div className="absolute top-5 left-5 font-telemetry text-[11px] text-[#8E8E98] tracking-[0.2em] uppercase flex items-center gap-2 z-10">
        <span className="w-2 h-2 rounded-full bg-[#E10600] animate-ping" />
        <span className="text-[#E10600] font-bold">LIVE ON TRACK</span>
        <span className="hidden sm:inline text-white/30">•</span>
        <span className="hidden sm:inline">COCKPIT POV // M7 GRAND PRIX</span>
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        type="button"
        className="absolute top-4 right-18 sm:right-32 z-40 px-3 py-1.5 rounded-full bg-[#151520]/80 hover:bg-[#151520] border border-white/15 hover:border-white/40 text-[#8E8E98] hover:text-white font-telemetry text-[11px] tracking-widest uppercase transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md shadow-lg"
      >
        <span>SKIP</span>
        <FastForward size={13} />
      </button>

      {/* Central Dramatic Animation Container */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center justify-center text-center py-10 min-h-[340px]">
        <AnimatePresence mode="wait">
          {/* BEAT 1: "MATTHEU AMARI" */}
          {stage === 'name' && (
            <motion.div
              key="stage-name"
              initial={{ opacity: 0, scale: 1.3, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, filter: 'blur(10px)' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 text-[#E10600] font-telemetry text-xs sm:text-sm tracking-[0.35em] uppercase font-bold mb-4 bg-black/60 px-4 py-1.5 rounded-full border border-[#E10600]/30 backdrop-blur-md shadow-[0_0_20px_rgba(225,6,0,0.3)]"
              >
                <Zap size={14} className="fill-[#E10600] text-[#E10600]" />
                <span>CHAMPIONSHIP DRIVER • POLE POSITION</span>
              </motion.div>

              <h1 className="font-f1-head text-4xl sm:text-6xl md:text-7xl font-black italic tracking-tight text-white uppercase drop-shadow-[0_0_40px_rgba(225,6,0,0.8)]">
                {EVENT_CONFIG.celebrantName}
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="font-telemetry text-xs sm:text-sm tracking-[0.3em] text-[#8E8E98] uppercase font-semibold mt-4"
              >
                2026 WORLD CHAMPIONSHIP
              </motion.p>
            </motion.div>
          )}

          {/* BEAT 2: "IS TURNING" */}
          {stage === 'turning' && (
            <motion.div
              key="stage-turning"
              initial={{ opacity: 0, scale: 0.8, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, scale: 1, letterSpacing: '0.28em' }}
              exit={{ opacity: 0, scale: 1.25, filter: 'blur(10px)' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-2 text-[#00D2BE] font-telemetry text-xs tracking-[0.3em] uppercase font-bold mb-3 bg-black/60 px-4 py-1.5 rounded-full border border-[#00D2BE]/30 backdrop-blur-md">
                <Flag size={14} className="text-[#00D2BE]" />
                <span>OFFICIAL RACING MILESTONE</span>
              </div>

              <h2 className="font-f1-head text-3xl sm:text-5xl md:text-6xl font-black italic text-[#00D2BE] uppercase tracking-[0.25em] drop-shadow-[0_0_35px_rgba(0,210,190,0.8)]">
                IS TURNING
              </h2>

              <p className="font-telemetry text-xs tracking-[0.3em] text-[#8E8E98] uppercase font-semibold mt-4">
                FULL SPEED INTO THE NEXT CHAPTER
              </p>
            </motion.div>
          )}

          {/* BEAT 3: "7" */}
          {stage === 'number' && (
            <motion.div
              key="stage-number"
              initial={{ opacity: 0, scale: 2.5, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.65, filter: 'blur(12px)' }}
              transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-2 text-[#FFB800] font-telemetry text-xs tracking-[0.3em] uppercase mb-2 font-bold bg-black/60 px-4 py-1.5 rounded-full border border-[#FFB800]/30 backdrop-blur-md">
                <Trophy size={14} className="text-[#FFB800]" />
                <span>CHAMPIONSHIP RACE NUMBER</span>
              </div>

              <div className="font-f1-head text-9xl sm:text-[140px] md:text-[170px] font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white via-[#FF3333] to-[#E10600] leading-none drop-shadow-[0_0_65px_rgba(225,6,0,1)] animate-pulse">
                7
              </div>
            </motion.div>
          )}

          {/* BEAT 4: FULL GRAND ASSEMBLE "MATTHEU AMARI IS TURNING 7!" */}
          {stage === 'full' && (
            <motion.div
              key="stage-full"
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              {/* Telemetry Badge */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="px-4 py-1.5 rounded-full bg-black/75 border border-[#E10600]/60 text-[#FF4D4D] font-telemetry text-xs font-bold tracking-[0.25em] uppercase mb-3 flex items-center gap-2 shadow-[0_0_25px_rgba(225,6,0,0.5)] backdrop-blur-md"
              >
                <span className="w-2 h-2 rounded-full bg-[#E10600] animate-ping" />
                OFFICIAL GRAND PRIX INVITATION
              </motion.div>

              {/* Name */}
              <h1 className="font-f1-head text-3xl sm:text-5xl md:text-6xl font-black italic tracking-tight text-white uppercase drop-shadow-[0_0_35px_rgba(255,255,255,0.6)]">
                {EVENT_CONFIG.celebrantName}
              </h1>

              {/* IS TURNING 7! */}
              <div className="mt-2 sm:mt-3 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                <span className="font-telemetry text-base sm:text-2xl md:text-3xl font-extrabold tracking-[0.25em] text-[#00D2BE] uppercase drop-shadow-[0_0_20px_rgba(0,210,190,0.6)]">
                  IS TURNING
                </span>
                <span className="font-f1-head text-4xl sm:text-6xl md:text-7xl font-black italic text-[#E10600] uppercase drop-shadow-[0_0_45px_rgba(225,6,0,1)] animate-pulse">
                  7!
                </span>
              </div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="font-telemetry text-xs sm:text-sm tracking-[0.35em] text-[#8E8E98] uppercase font-bold mt-4"
              >
                FORMULA 7 WORLD CHAMPIONSHIP
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Checkered Track Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 kerb-inlay-h opacity-70 z-10" />
    </div>
  );
};
