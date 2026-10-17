import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Eye, 
  RotateCcw, 
  Play, 
  Pause, 
  Navigation, 
  MapPin
} from 'lucide-react';
import type { VenueRoute, RouteLandmark } from '../../config/routesConfig';

interface RouteTelemetryHUDProps {
  routes: VenueRoute[];
  activeRoute: VenueRoute;
  onSelectRoute: (routeId: 'route-1' | 'route-2' | 'route-3') => void;
  progress: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReplay: () => void;
  isOrbitMode: boolean;
  onToggleOrbit: () => void;
  activeLandmark: RouteLandmark | null;
  isSlowMo: boolean;
  onBack: () => void;
}

export const RouteTelemetryHUD: React.FC<RouteTelemetryHUDProps> = ({
  routes,
  activeRoute,
  onSelectRoute,
  progress,
  isPlaying,
  onTogglePlay,
  onReplay,
  isOrbitMode,
  onToggleOrbit,
  activeLandmark,
  isSlowMo,
  onBack,
}) => {
  // Speed simulation (slows down to 32 km/h during slow-mo, cruises at 180-220 km/h)
  const currentSpeed = isSlowMo
    ? 32
    : progress >= 0.98
    ? 0
    : 185 + Math.floor(Math.sin(progress * 15) * 25);

  const currentGear = isSlowMo
    ? '2'
    : progress >= 0.98
    ? 'P'
    : currentSpeed > 180
    ? '7'
    : '5';

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-3 sm:p-5">
      {/* 1. Top Section: Navigation Bar + Dynamic Landmark Slow-Motion Guidance Card */}
      <div className="flex flex-col gap-2 w-full">
        {/* Top Bar: Navigation, Route Selection Tabs, Camera Mode */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-auto">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="self-start md:self-auto px-4 py-2 rounded-full bg-[#12121A]/85 hover:bg-[#1C1C28] border border-white/15 text-white font-telemetry text-xs font-bold tracking-wider flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer shadow-lg"
          >
            <ArrowLeft size={16} className="text-[#E10600]" />
            <span>INVITATION</span>
          </button>

          {/* Route Tabs (Interactive Switcher) */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#0D0D14]/90 border border-white/15 backdrop-blur-md shadow-2xl overflow-x-auto max-w-full">
            {routes.map((route) => {
              const isSelected = route.id === activeRoute.id;
              return (
                <button
                  key={route.id}
                  onClick={() => onSelectRoute(route.id)}
                  className={`px-3 py-1.5 rounded-full font-telemetry text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#E10600] text-white shadow-lg'
                      : 'text-[#8E8E98] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-black/40 flex items-center justify-center text-[10px]">
                    {route.code}
                  </span>
                  <span className="hidden sm:inline">{route.name}</span>
                  <span className="sm:hidden">{route.shortTitle}</span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle (Chase vs Orbit) */}
          <button
            onClick={onToggleOrbit}
            className={`self-end md:self-auto px-3.5 py-2 rounded-full border font-telemetry text-xs font-bold uppercase tracking-wider flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer shadow-lg ${
              isOrbitMode
                ? 'bg-[#00D2BE] border-[#00D2BE] text-black shadow-[0_0_15px_rgba(0,210,190,0.5)]'
                : 'bg-[#12121A]/85 border-white/15 text-white hover:bg-[#1C1C28]'
            }`}
            title="Toggle Free-Look Orbit Camera"
          >
            <Eye size={15} />
            <span>{isOrbitMode ? 'ORBIT VIEW' : 'CHASE CAM'}</span>
          </button>
        </div>

        {/* Dynamic Landmark Slow-Motion Guidance Card (Tucked below the top bar) */}
        <div className="flex justify-center w-full px-2">
          <AnimatePresence>
            {isSlowMo && activeLandmark && (
              <motion.div
                key={activeLandmark.id}
                initial={{ opacity: 0, y: -16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto max-w-md w-full double-bezel shadow-2xl"
              >
                <div className="double-bezel-inner p-2.5 sm:p-3.5 bg-[#0E0E18]/95 backdrop-blur-xl border border-white/15 relative">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D2BE] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D2BE]" />
                      </span>
                      <span className="font-telemetry text-[9px] sm:text-[10px] font-black tracking-widest text-[#00D2BE] uppercase">
                        CINEMATIC SLOW-MO RECON
                      </span>
                    </div>
                    <span className="font-telemetry text-[9px] sm:text-[10px] text-[#FFB800] font-bold">
                      WAYPOINT {Math.round(progress * 100)}%
                    </span>
                  </div>

                  <h3 className="font-f1-head text-sm sm:text-base md:text-lg font-black text-white uppercase italic tracking-tight">
                    {activeLandmark.name}
                  </h3>

                  <p className="font-telemetry text-[11px] sm:text-xs text-[#E1E1F0] mt-0.5 leading-relaxed">
                    {activeLandmark.cueText}
                  </p>

                  <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-[11px] font-telemetry">
                    <span className="text-[#8E8E98] uppercase">ACTION:</span>
                    <span className="font-bold text-white uppercase flex items-center gap-1">
                      <Navigation size={12} className="text-[#00D2BE]" />
                      {activeLandmark.action.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. Bottom HUD: Telemetry Instruments & Playback Controls */}
      <div className="flex flex-col gap-2.5 pointer-events-auto w-full max-w-3xl mx-auto">
        {/* Progress Bar with Landmark Markers */}
        <div className="w-full bg-[#0D0D14]/85 border border-white/15 rounded-2xl p-3 backdrop-blur-md shadow-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-telemetry text-[#8E8E98]">
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-[#E10600]" />
              <span className="text-white font-bold truncate max-w-[200px] sm:max-w-none">
                {activeRoute.origin}
              </span>
            </div>
            <span className="text-[#00D2BE] font-bold">
              {(progress * activeRoute.distanceKm).toFixed(1)} / {activeRoute.distanceKm} KM
            </span>
          </div>

          {/* Spline Progress Track */}
          <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#E10600] via-[#FFB800] to-[#00D2BE] rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
            />
          </div>

          {/* Playback Controls & Telemetry Stats */}
          <div className="flex items-center justify-between pt-1">
            {/* Play/Pause & Replay */}
            <div className="flex items-center gap-2">
              <button
                onClick={onTogglePlay}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>

              <button
                onClick={onReplay}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Replay from Start"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Speedometer & Gear Readout */}
            <div className="flex items-center gap-3 font-telemetry">
              <div className="flex items-baseline gap-1">
                <span className="font-f1-head text-lg font-black text-white">
                  {currentSpeed}
                </span>
                <span className="text-[10px] text-[#8E8E98] uppercase">KM/H</span>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 border border-white/10">
                <span className="text-[10px] text-[#8E8E98]">GEAR</span>
                <span className="text-xs font-bold text-[#00D2BE]">{currentGear}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
