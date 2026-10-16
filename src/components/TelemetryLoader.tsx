import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { M7Logo } from './M7Logo';
import { EVENT_CONFIG } from '../config/eventConfig';
import { Gauge, Radio, Zap, Volume2, VolumeX } from 'lucide-react';

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

  // Synthesize realistic F1 starter beep and engine rev using Web Audio API
  const playBeep = (freq: number = 880, duration: number = 0.15) => {
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
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext policy fallback
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
      osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // Fallback
    }
  };

  // Progress telemetry percentage and RPM simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + 2;
        setRpm(3000 + Math.floor((next / 100) * 8500) + Math.floor(Math.random() * 200));
        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // Starting Gantry Lights sequence
  useEffect(() => {
    const timer1 = setTimeout(() => { setLightsActive(1); playBeep(700); }, 600);
    const timer2 = setTimeout(() => { setLightsActive(2); playBeep(700); }, 1200);
    const timer3 = setTimeout(() => { setLightsActive(3); playBeep(700); }, 1800);
    const timer4 = setTimeout(() => { setLightsActive(4); playBeep(700); }, 2400);
    const timer5 = setTimeout(() => { setLightsActive(5); playBeep(700); }, 3000);
    
    // Random F1 delay between 1.0s and 2.2s before lights out!
    const lightsOutTimer = setTimeout(() => {
      setLightsActive(0);
      setLightsOut(true);
      setGear('1');
      setRpm(11800);
      playEngineRev();
      setReadyToEnter(true);
    }, 4200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(lightsOutTimer);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center bg-carbon-pattern px-4 py-6 overflow-hidden">
      {/* Top Telemetry Header Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between border-b border-[#2A2A38] pb-3 text-xs font-telemetry">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00D2BE] animate-pulse"></span>
          <span className="text-[#00D2BE] font-bold">FIA TELEMETRY ONLINE</span>
          <span className="text-[#8E8E93] hidden sm:inline">| SYS. VER. 7.0-F1</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1F1F27] border border-[#383842] text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
            title="Toggle Engine Audio"
          >
            {soundEnabled ? <Volume2 size={14} className="text-[#00D2BE]" /> : <VolumeX size={14} />}
            <span className="text-[10px] uppercase font-bold">{soundEnabled ? 'SND ON' : 'MUTED'}</span>
          </button>
          
          <div className="text-right">
            <span className="text-[#8E8E93]">SESSION: </span>
            <span className="text-[#FFB800] font-bold">{EVENT_CONFIG.round} PRE-RACE</span>
          </div>
        </div>
      </div>

      {/* Main Center Stage */}
      <div className="w-full max-w-xl flex flex-col items-center justify-center my-auto py-8">
        {/* Animated Custom M7 Logo */}
        <M7Logo size="lg" showSubtitle={true} animated={true} className="mb-8" />

        {/* Official F1 5-Red-Light Starting Gantry */}
        <div className="w-full bg-[#1A1A22] border-2 border-[#2D2D3A] rounded-xl p-5 shadow-2xl relative mb-8">
          {/* Kerb Accent Bar on Top */}
          <div className="absolute top-0 left-0 right-0 h-1 kerb-strip-h rounded-t-xl" />

          <div className="text-center mb-3">
            <span className="font-telemetry text-[11px] tracking-widest text-[#8E8E93] uppercase">
              STARTING GANTRY // LIGHTS OUT SEQUENCE
            </span>
          </div>

          {/* Gantry Pods Array */}
          <div className="grid grid-cols-5 gap-2 sm:gap-4 max-w-md mx-auto bg-[#101017] p-4 rounded-lg border border-[#22222E]">
            {[1, 2, 3, 4, 5].map((podIndex) => {
              const isIlluminated = lightsActive >= podIndex;
              return (
                <div key={podIndex} className="flex flex-col items-center gap-2">
                  {/* Top LED Pod */}
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
                      isIlluminated
                        ? 'bg-[#E10600] border-[#FF5E5B] shadow-[0_0_25px_#E10600]'
                        : 'bg-[#201010] border-[#381B1B]'
                    }`}
                  >
                    {isIlluminated && (
                      <div className="w-4 h-4 rounded-full bg-white opacity-80 blur-[1px]"></div>
                    )}
                  </div>
                  {/* Bottom Secondary Pod */}
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border transition-all duration-150 ${
                      isIlluminated
                        ? 'bg-[#E10600] border-[#FF5E5B] shadow-[0_0_12px_#E10600]'
                        : 'bg-[#181111] border-[#2A1818]'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Status Banner Beneath Gantry */}
          <div className="mt-4 text-center">
            {lightsOut ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-block px-4 py-1.5 bg-[#E10600] text-white font-f1-head font-black tracking-widest text-xs sm:text-sm uppercase rounded shadow-[0_0_20px_rgba(225,6,0,0.8)]"
              >
                🏁 LIGHTS OUT AND AWAY WE GO! 🏁
              </motion.div>
            ) : (
              <div className="font-telemetry text-xs tracking-wider text-[#FFB800] animate-pulse">
                PREPARING FORMATION LAP • {lightsActive}/5 RED LIGHTS ACTIVE
              </div>
            )}
          </div>
        </div>

        {/* Live Telemetry Gauges & Tire Compounds */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {/* RPM & Gear Box */}
          <div className="bg-[#1C1C24] border border-[#2D2D3A] p-3 rounded-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8E8E93] text-[10px] font-telemetry uppercase">
              <span className="flex items-center gap-1"><Gauge size={12} /> ENGINE RPM</span>
              <span className="text-[#00D2BE] font-bold">GEAR: {gear}</span>
            </div>
            <div className="mt-2 font-telemetry font-bold text-lg sm:text-xl text-white">
              {rpm.toLocaleString()} <span className="text-xs text-[#8E8E93] font-normal">RPM</span>
            </div>
            {/* RPM Progress Bar */}
            <div className="w-full bg-[#121218] h-1.5 rounded-full mt-2 overflow-hidden flex">
              <div
                className="bg-gradient-to-r from-[#00D2BE] via-[#FFB800] to-[#E10600] h-full transition-all duration-75"
                style={{ width: `${Math.min(100, (rpm / 13000) * 100)}%` }}
              />
            </div>
          </div>

          {/* Telemetry Buffer Progress */}
          <div className="bg-[#1C1C24] border border-[#2D2D3A] p-3 rounded-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8E8E93] text-[10px] font-telemetry uppercase">
              <span className="flex items-center gap-1"><Radio size={12} /> TELEMETRY</span>
              <span className="text-[#00D2BE] font-bold">{progress}%</span>
            </div>
            <div className="mt-2 font-telemetry font-bold text-lg sm:text-xl text-white flex items-baseline justify-between">
              <span>{progress === 100 ? 'SYNCED' : 'BUFFERING'}</span>
              <Zap size={16} className="text-[#00D2BE] animate-bounce" />
            </div>
            <div className="w-full bg-[#121218] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#00D2BE] h-full transition-all duration-150 shadow-[0_0_8px_#00D2BE]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Tire Strategy Indicators */}
          <div className="col-span-2 sm:col-span-1 bg-[#1C1C24] border border-[#2D2D3A] p-3 rounded-lg flex flex-col justify-between">
            <div className="text-[#8E8E93] text-[10px] font-telemetry uppercase flex items-center justify-between">
              <span>TIRE STRATEGY</span>
              <span className="text-white font-bold">100°C OPT</span>
            </div>
            <div className="flex items-center justify-around mt-2">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full border-2 border-[#E10600] flex items-center justify-center text-[10px] font-bold text-[#E10600] bg-[#2E1212]">
                  S
                </div>
                <span className="text-[9px] font-telemetry text-[#8E8E93] mt-0.5">SOFT</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full border-2 border-[#FFB800] flex items-center justify-center text-[10px] font-bold text-[#FFB800] bg-[#292211]">
                  M
                </div>
                <span className="text-[9px] font-telemetry text-[#8E8E93] mt-0.5">MED</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white bg-[#26262B]">
                  H
                </div>
                <span className="text-[9px] font-telemetry text-[#8E8E93] mt-0.5">HARD</span>
              </div>
            </div>
            <div className="text-[9px] text-center font-telemetry text-[#00D2BE] mt-1">
              COMPOUND: C5 (FASTEST)
            </div>
          </div>
        </div>

        {/* Enter Paddock Button / Interactive Trigger */}
        <AnimatePresence>
          {readyToEnter && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-full flex flex-col items-center"
            >
              <button
                onClick={onComplete}
                className="group relative w-full sm:w-auto px-8 py-4 bg-[#E10600] hover:bg-[#FF1801] active:scale-95 text-white font-f1-head font-black tracking-widest text-sm sm:text-base uppercase rounded-md shadow-[0_0_35px_rgba(225,6,0,0.6)] transition-all duration-200 cursor-pointer overflow-hidden flex items-center justify-center gap-3 border-t border-white/30"
              >
                {/* Diagonal Highlight Sheen */}
                <span className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-25deg] transform -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out" />
                
                <span className="relative z-10">ENTER PADDOCK / START ENGINE</span>
                <span className="relative z-10 text-xl font-mono">→</span>
              </button>
              <p className="font-telemetry text-[11px] text-[#8E8E93] mt-2">
                Click to access Mattheu Amari's official VIP Paddock Pass
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Broadcast Ticker */}
      <div className="w-full max-w-4xl border-t border-[#2A2A38] pt-3 flex flex-col sm:flex-row items-center justify-between text-[11px] font-telemetry text-[#8E8E93] gap-2">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 bg-[#E10600] text-white font-bold rounded text-[9px]">LIVE</span>
          <span>FIA FORMULA 7 GRAND PRIX • OFFICIAL INVITATION SYSTEM</span>
        </div>
        <div>
          CELEBRANT: <span className="text-white font-bold uppercase">{EVENT_CONFIG.celebrantName}</span> (TURNING 7)
        </div>
      </div>
    </div>
  );
};
