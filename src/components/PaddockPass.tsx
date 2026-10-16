import React from 'react';
import { motion } from 'framer-motion';
import { EVENT_CONFIG } from '../config/eventConfig';
import { M7Logo } from './M7Logo';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Trophy, 
  Flag, 
  CheckCircle2, 
  XCircle, 
  Sun, 
  Thermometer, 
  Activity,
  Compass
} from 'lucide-react';

interface PaddockPassProps {
  onConfirmGridSlot: () => void;
  onBoxDnf: () => void;
  onExploreCircuit: () => void;
}

export const PaddockPass: React.FC<PaddockPassProps> = ({
  onConfirmGridSlot,
  onBoxDnf,
  onExploreCircuit,
}) => {
  return (
    <div className="min-h-screen bg-carbon-pattern py-8 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative Track Atmosphere Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#E10600]/15 via-[#00D2BE]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-3xl z-10">
        {/* Top Breadcrumb & Round Indicator */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E10600] animate-ping" />
            <span className="font-telemetry text-xs tracking-wider text-[#00D2BE] font-bold">
              OFFICIAL EVENT BRIEFING // PADDOCK PASS
            </span>
          </div>
          <span className="font-telemetry text-xs text-[#8E8E93] bg-[#1F1F27] border border-[#2D2D3A] px-3 py-1 rounded">
            PASS NO: #M7-GP-2026-VIP
          </span>
        </div>

        {/* The VIP Paddock Pass Card (Sleek chamfered F1 broadcast badge) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#1C1C24] border-2 border-[#2E2E3C] rounded-2xl shadow-2xl overflow-hidden relative"
        >
          {/* Alternating Kerb Strip Across the Top Edge */}
          <div className="h-2 kerb-strip-h" />

          {/* Holographic Lanyard Slot Accent */}
          <div className="flex justify-center -mt-1 mb-4">
            <div className="w-28 h-2.5 bg-[#121218] border border-[#3A3A4A] rounded-full flex items-center justify-center">
              <div className="w-16 h-1 bg-[#252533] rounded-full" />
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {/* Header Section: Logo & Celebrant Pole Position */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-[#2B2B38]">
              <M7Logo size="md" showSubtitle={false} animated={false} />

              <div className="text-center sm:text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E10600]/15 border border-[#E10600]/40 rounded text-[#FF5E5B] text-xs font-telemetry font-bold mb-1">
                  <Trophy size={14} className="text-[#FFB800]" />
                  POLE POSITION • DRIVER #07
                </div>
                <h1 className="font-f1-head text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                  {EVENT_CONFIG.celebrantName}
                </h1>
                <p className="font-telemetry text-sm text-[#00D2BE] font-bold">
                  CELEBRATING 7 YEARS OF SPEED & JOY!
                </p>
              </div>
            </div>

            {/* F1 Grand Prix Title Strip */}
            <div className="my-6 bg-[#16161E] border-l-4 border-[#E10600] p-4 rounded-r-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-telemetry text-[11px] tracking-widest text-[#8E8E93] uppercase block">
                  {EVENT_CONFIG.subTitle}
                </span>
                <span className="font-f1-head text-lg sm:text-xl font-bold text-white tracking-wide">
                  {EVENT_CONFIG.eventTitle}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#252533] border border-[#383848] rounded text-[#FFB800] text-xs font-telemetry font-bold flex items-center gap-1.5">
                  <Flag size={14} /> LAP 7 OF 7
                </span>
              </div>
            </div>

            {/* Schedule & Venue Grid Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Date & Lights Out Time */}
              <div className="bg-[#171720] border border-[#2B2B38] p-4 rounded-xl flex items-start gap-3.5">
                <div className="p-3 bg-[#E10600]/15 border border-[#E10600]/30 rounded-lg text-[#E10600]">
                  <Calendar size={22} />
                </div>
                <div>
                  <span className="font-telemetry text-[10px] text-[#8E8E93] uppercase block">
                    GRAND PRIX DATE
                  </span>
                  <span className="font-f1-head text-sm sm:text-base font-bold text-white block mt-0.5">
                    {EVENT_CONFIG.date}
                  </span>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-telemetry text-[#00D2BE]">
                    <Clock size={13} />
                    <span>LIGHTS OUT: {EVENT_CONFIG.time}</span>
                  </div>
                </div>
              </div>

              {/* Circuit Venue & Paddock */}
              <div className="bg-[#171720] border border-[#2B2B38] p-4 rounded-xl flex items-start gap-3.5">
                <div className="p-3 bg-[#00D2BE]/15 border border-[#00D2BE]/30 rounded-lg text-[#00D2BE]">
                  <MapPin size={22} />
                </div>
                <div className="flex-1">
                  <span className="font-telemetry text-[10px] text-[#8E8E93] uppercase block">
                    RACE TRACK / VENUE LOCATION
                  </span>
                  <span className="font-f1-head text-sm sm:text-base font-bold text-white block mt-0.5">
                    {EVENT_CONFIG.venueName}
                  </span>
                  <p className="text-xs text-[#8E8E93] mt-1 line-clamp-2 leading-relaxed">
                    {EVENT_CONFIG.venueAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Weekend Grand Prix Timetable & Weather Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
              {/* Track Weather & Conditions */}
              <div className="bg-[#16161E] border border-[#2A2A38] p-4 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-telemetry text-[#8E8E93] uppercase border-b border-[#252533] pb-2">
                  <span className="flex items-center gap-1.5"><Sun size={14} className="text-[#FFB800]" /> CONDITIONS</span>
                  <span className="text-[#00D2BE] font-bold">OPTIMAL</span>
                </div>
                <div className="my-3 space-y-2 text-xs font-telemetry">
                  <div className="flex justify-between">
                    <span className="text-[#8E8E93]">WEATHER:</span>
                    <span className="text-white font-bold">{EVENT_CONFIG.weather.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E8E93] flex items-center gap-1"><Thermometer size={12} /> TRACK TEMP:</span>
                    <span className="text-[#FFB800] font-bold">{EVENT_CONFIG.weather.trackTemp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E8E93] flex items-center gap-1"><Activity size={12} /> LAP RECORD:</span>
                    <span className="text-[#00D2BE] font-bold">{EVENT_CONFIG.raceStats.lapRecord}</span>
                  </div>
                </div>
                <button
                  onClick={onExploreCircuit}
                  className="w-full py-2 bg-[#252533] hover:bg-[#303042] text-[#00D2BE] text-xs font-telemetry font-bold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#3A3A4D]"
                >
                  <Compass size={14} /> EXPLORE 3D CIRCUIT GUIDE
                </button>
              </div>

              {/* Race Weekend Timetable */}
              <div className="lg:col-span-2 bg-[#16161E] border border-[#2A2A38] p-4 rounded-xl">
                <div className="text-[11px] font-telemetry text-[#8E8E93] uppercase border-b border-[#252533] pb-2 flex justify-between">
                  <span>RACE DAY PROGRAM & PIT STOP TIMELINE</span>
                  <span className="text-[#FFB800]">ROUND 07</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 text-xs font-telemetry">
                  <div className="bg-[#1C1C24] p-2.5 rounded border-l-2 border-[#00D2BE]">
                    <span className="text-[#00D2BE] font-bold block text-[11px]">15:00 PHT</span>
                    <span className="text-white font-semibold">Paddock Doors Open & Driver Check-in</span>
                  </div>
                  <div className="bg-[#1C1C24] p-2.5 rounded border-l-2 border-[#FFB800]">
                    <span className="text-[#FFB800] font-bold block text-[11px]">15:45 PHT</span>
                    <span className="text-white font-semibold">Track Games & Junior Grand Prix Heats</span>
                  </div>
                  <div className="bg-[#1C1C24] p-2.5 rounded border-l-2 border-[#E10600]">
                    <span className="text-[#E10600] font-bold block text-[11px]">16:45 PHT</span>
                    <span className="text-white font-semibold">Cake Cutting & Birthday Pit Radio Anthem</span>
                  </div>
                  <div className="bg-[#1C1C24] p-2.5 rounded border-l-2 border-[#A855F7]">
                    <span className="text-[#A855F7] font-bold block text-[11px]">17:30 PHT</span>
                    <span className="text-white font-semibold">Podium Trophy Ceremony & Loot Bags</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION SECTION: Primary CTAs */}
            <div className="pt-4 border-t border-[#2B2B38]">
              <div className="text-center mb-4">
                <span className="font-telemetry text-xs tracking-wider text-[#8E8E93] uppercase">
                  FIA PIT WALL REQUIRES YOUR DRIVER STATUS FOR GRID CONFIRMATION
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4">
                {/* CTA 1: Confirm Grid Slot (I'll Go) */}
                <button
                  onClick={onConfirmGridSlot}
                  className="group relative flex-1 py-4 px-6 bg-gradient-to-r from-[#E10600] to-[#B30000] hover:from-[#FF1801] hover:to-[#CC0000] active:scale-[0.98] text-white font-f1-head font-black text-sm sm:text-base tracking-widest uppercase rounded-lg shadow-[0_0_30px_rgba(225,6,0,0.4)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 border-t border-white/30"
                >
                  <CheckCircle2 size={20} className="text-[#00D2BE] group-hover:scale-110 transition-transform" />
                  <span>CONFIRM GRID SLOT (I'LL GO)</span>
                </button>

                {/* CTA 2: Box / DNF (Can't make it) */}
                <button
                  onClick={onBoxDnf}
                  className="flex-1 py-4 px-6 bg-[#252531] hover:bg-[#2F2F3D] active:scale-[0.98] text-[#8E8E93] hover:text-white font-f1-head font-bold text-sm tracking-wider uppercase rounded-lg border border-[#3A3A4D] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5"
                >
                  <XCircle size={18} className="text-[#FF5E5B]" />
                  <span>BOX / DNF (CAN'T MAKE IT)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card Bottom Bar */}
          <div className="bg-[#14141B] px-6 py-3 border-t border-[#252533] flex items-center justify-between text-[10px] font-telemetry text-[#8E8E93]">
            <span>OFFICIAL M7 FORMULA 1 PADDOCK ACCREDITATION</span>
            <span className="text-[#00D2BE]">VALID FOR ADMISSION & LOOT PASS</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
