import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { M7Logo } from './M7Logo';
import { EVENT_CONFIG } from '../config/eventConfig';
import { Gauge, Radio, Volume2, VolumeX, ArrowRight, ShieldCheck } from 'lucide-react';

interface TelemetryLoaderProps {
  onComplete: () => void;
}

export const TelemetryLoader: React.FC<TelemetryLoaderProps> = ({ onComplete }) => {
  const [lightsActive, setLightsActive] = useState<number>(0);
  const [lightsOut, setLightsOut] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [rpm, setRpm] = useState<number>(2400);
  const [gear, setGear] = useState<string>('N');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [readyToEnter, setReadyToEnter] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Web Audio F1 Starter Beeps & Engine Rev
  const playBeep = (freq: number = 880, duration: number = 0.14) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio fallback
    }
  };

  const playEngineRev = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.9);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.3);
    } catch {
      // Fallback
    }
  };

  // Telemetry buffer loading
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + 2;
        setRpm(3000 + Math.floor((next / 100) * 8800) + Math.floor(Math.random() * 150));
        return next;
      });
    }, 38);

    return () => clearInterval(interval);
  }, []);

  // 5-Red-Light Gantry Sequence
  useEffect(() => {
    let advanceTimer: ReturnType<typeof setTimeout> | null = null;
    const t1 = setTimeout(() => { setLightsActive(1); playBeep(700); }, 600);
    const t2 = setTimeout(() => { setLightsActive(2); playBeep(700); }, 1200);
    const t3 = setTimeout(() => { setLightsActive(3); playBeep(700); }, 1800);
    const t4 = setTimeout(() => { setLightsActive(4); playBeep(700); }, 2400);
    const t5 = setTimeout(() => { setLightsActive(5); playBeep(700); }, 3000);

    const outTimer = setTimeout(() => {
      setLightsActive(0);
      setLightsOut(true);
      setGear('1');
      setRpm(12200);
      playEngineRev();
      setReadyToEnter(true);
      // Automatically advance after a 2-second celebration
      advanceTimer = setTimeout(() => {
        onComplete();
      }, 2200);
    }, 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(outTimer);
      if (advanceTimer) clearTimeout(advanceTimer);
    };
  }, [onComplete]);

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col justify-between items-center bg-f1-ambient px-4 py-5 overflow-hidden">
      {/* Top Precision Broadcast Ticker */}
      <div className="w-full max-w-4xl flex items-center justify-between border-b border-white/[0.08] pb-3 text-xs font-telemetry">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#00D2BE] animate-ping" />
          <span className="text-[#00D2BE] font-bold tracking-wider">FIA TIMING SYSTEM ACTIVE</span>
          <span className="text-[#8E8E98] hidden sm:inline">• ROUND 07 OFFICIAL TELEMETRY</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[#8E8E98] hover:text-white transition-colors cursor-pointer text-[10px] font-bold"
          >
            {soundEnabled ? <Volume2 size={13} className="text-[#00D2BE]" /> : <VolumeX size={13} />}
            <span>{soundEnabled ? 'AUDIO ON' : 'MUTED'}</span>
          </button>

          <button
            onClick={onComplete}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#E10600]/25 hover:bg-[#E10600] border border-[#E10600]/60 text-white font-bold text-[10px] transition-all cursor-pointer shadow-sm"
          >
            <span>SKIP INTRO</span>
            <ArrowRight size={11} />
          </button>
          
          <div className="text-right text-[11px] font-telemetry hidden md:block">
            <span className="text-[#8E8E98]">CELEBRANT: </span>
            <span className="text-white font-bold">{EVENT_CONFIG.celebrantName.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Main Stage */}
      <div className="w-full max-w-xl flex flex-col items-center justify-center my-auto py-4 z-10">
        {/* The Re-engineered Authentic Formula 1 M7 Logo */}
        <M7Logo size="lg" showSubtitle={true} animated={true} className="mb-8" />

        {/* Industrial F1 Starting Gantry (Double-Bezel Architecture) */}
        <div className="w-full double-bezel mb-8">
          <div className="double-bezel-inner p-6 sm:p-8">
            {/* Top Red-and-White Kerb Metallic Inlay */}
            <div className="absolute top-0 left-0 right-0 kerb-inlay-h" />

            {/* Gantry Truss Beam Header */}
            <div className="flex items-center justify-between mb-5 px-1">
              <span className="font-telemetry text-[10px] tracking-[0.25em] text-[#8E8E98] uppercase font-bold flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[#00D2BE]" /> STARTING GANTRY // LIGHTS OUT
              </span>
              <span className="text-[10px] font-telemetry font-bold text-[#FFB800] bg-[#FFB800]/10 border border-[#FFB800]/30 px-2 py-0.5 rounded">
                FORMULA 7
              </span>
            </div>

            {/* The 5-Pod Starting Light Bank */}
            <div className="grid grid-cols-5 gap-3 sm:gap-5 max-w-md mx-auto bg-[#0A0A10] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-inner">
              {[1, 2, 3, 4, 5].map((podIndex) => {
                const isLit = lightsActive >= podIndex;
                return (
                  <div key={podIndex} className="flex flex-col items-center gap-2">
                    {/* Primary Heavy High-Intensity LED Pod */}
                    <div
                      className={`relative w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-150 ${
                        isLit ? 'gantry-pod-lit' : 'gantry-pod-off'
                      }`}
                    >
                      {/* Concentric Chrome Bezel Ring */}
                      <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
                      {/* Inner Filament Bulb */}
                      {isLit && (
                        <div className="w-5 h-5 rounded-full bg-white opacity-95 blur-[0.5px]" />
                      )}
                    </div>

                    {/* Secondary Strobe Pod */}
                    <div
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all duration-150 ${
                        isLit ? 'bg-[#FF1E1E] shadow-[0_0_12px_#FF1E1E]' : 'bg-[#150A0A] border border-white/5'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Gantry Status Announcement */}
            <div className="mt-5 text-center min-h-[32px] flex items-center justify-center">
              {lightsOut ? (
                <motion.button
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onComplete}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#FF1801] via-[#E10600] to-[#B30000] text-white font-f1-head font-black tracking-widest text-xs sm:text-sm uppercase rounded-xl shadow-[0_0_30px_rgba(225,6,0,0.8)] border border-white/40 cursor-pointer flex items-center gap-2 group"
                >
                  <span>🏁 LIGHTS OUT AND AWAY WE GO! 🏁</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              ) : (
                <div className="font-telemetry text-xs tracking-wider text-[#FFB800] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFB800] animate-ping" />
                  <span>PREPARING GRID • {lightsActive}/5 RED LIGHTS ACTIVE</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Real-Time Live Telemetry Metrics */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {/* Gauge 1: RPM */}
          <div className="bg-[#151520]/80 border border-white/[0.08] p-3.5 rounded-xl shadow-lg">
            <div className="flex items-center justify-between text-[#8E8E98] text-[10px] font-telemetry uppercase font-bold">
              <span className="flex items-center gap-1"><Gauge size={12} className="text-[#00D2BE]" /> ENGINE RPM</span>
              <span className="text-[#FFB800]">GEAR: {gear}</span>
            </div>
            <div className="mt-1.5 font-telemetry font-bold text-lg text-white">
              {rpm.toLocaleString()} <span className="text-xs text-[#8E8E98] font-normal">RPM</span>
            </div>
            <div className="w-full bg-white/[0.05] h-1.5 rounded-full mt-2 overflow-hidden flex">
              <div
                className="bg-gradient-to-r from-[#00D2BE] via-[#FFB800] to-[#E10600] h-full transition-all duration-75"
                style={{ width: `${Math.min(100, (rpm / 13500) * 100)}%` }}
              />
            </div>
          </div>

          {/* Gauge 2: Buffer */}
          <div className="bg-[#151520]/80 border border-white/[0.08] p-3.5 rounded-xl shadow-lg">
            <div className="flex items-center justify-between text-[#8E8E98] text-[10px] font-telemetry uppercase font-bold">
              <span className="flex items-center gap-1"><Radio size={12} className="text-[#00D2BE]" /> TELEMETRY</span>
              <span className="text-[#00D2BE]">{progress}%</span>
            </div>
            <div className="mt-1.5 font-telemetry font-bold text-lg text-white flex items-baseline justify-between">
              <span>{progress === 100 ? 'SYNCED' : 'BUFFERING'}</span>
            </div>
            <div className="w-full bg-white/[0.05] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#00D2BE] h-full transition-all duration-150 shadow-[0_0_8px_#00D2BE]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Gauge 3: Tires */}
          <div className="col-span-2 sm:col-span-1 bg-[#151520]/80 border border-white/[0.08] p-3.5 rounded-xl shadow-lg flex flex-col justify-between">
            <div className="text-[#8E8E98] text-[10px] font-telemetry uppercase font-bold flex items-center justify-between">
              <span>TIRE STRATEGY</span>
              <span className="text-[#00D2BE]">C5 SOFT</span>
            </div>
            <div className="flex items-center justify-around mt-1">
              <div className="flex flex-col items-center">
                <span className="w-6 h-6 rounded-full border-2 border-[#E10600] flex items-center justify-center text-[10px] font-bold text-[#E10600] bg-[#2E1010]">
                  S
                </span>
                <span className="text-[9px] font-telemetry text-[#8E8E98] mt-0.5">100°C</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-6 h-6 rounded-full border-2 border-[#FFB800] flex items-center justify-center text-[10px] font-bold text-[#FFB800] bg-[#282210]">
                  M
                </span>
                <span className="text-[9px] font-telemetry text-[#8E8E98] mt-0.5">MED</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white bg-[#222228]">
                  H
                </span>
                <span className="text-[9px] font-telemetry text-[#8E8E98] mt-0.5">HARD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Button-in-Button Luxury CTA */}
        <AnimatePresence>
          {readyToEnter && (
            <motion.div
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 25, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="w-full flex flex-col items-center"
            >
              <button
                onClick={onComplete}
                className="group relative w-full sm:w-auto px-8 py-4 btn-f1-primary rounded-full cursor-pointer flex items-center justify-center gap-4 border border-white/25"
              >
                <span className="font-f1-head font-black tracking-widest text-sm sm:text-base text-white uppercase">
                  ENTER PADDOCK / START ENGINE
                </span>
                {/* Button-in-button nested trailing circular icon */}
                <span className="w-9 h-9 rounded-full bg-black/30 border border-white/25 flex items-center justify-center group-hover:scale-110 group-hover:translate-x-1 transition-all duration-300">
                  <ArrowRight size={18} className="text-white" />
                </span>
              </button>
              <p className="font-telemetry text-[11px] text-[#8E8E98] mt-3">
                Access official VIP Paddock Pass for Mattheu Amari's 7th Grand Prix
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Broadcast Ticker */}
      <div className="w-full max-w-4xl border-t border-white/[0.08] pt-3 flex flex-col sm:flex-row items-center justify-between text-[11px] font-telemetry text-[#8E8E98] gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#E10600] text-white font-bold rounded text-[9px]">LIVE</span>
          <span>FIA FORMULA 7 GRAND PRIX • OFFICIAL INVITATION SYSTEM</span>
        </div>
        <div>
          SEASON 2026 • <span className="text-white font-bold">{EVENT_CONFIG.round}</span>
        </div>
      </div>
    </div>
  );
};
