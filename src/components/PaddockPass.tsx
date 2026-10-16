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
  Compass,
  ShieldCheck
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
    <div className="min-h-[100dvh] bg-f1-ambient py-8 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative Atmosphere Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#E10600]/15 via-[#00D2BE]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-3xl z-10 my-auto">
        {/* Top Breadcrumb & Credential Pass Serial */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E10600] animate-ping" />
            <span className="font-telemetry text-xs tracking-wider text-[#00D2BE] font-bold">
              OFFICIAL VIP ACCREDITATION // FORMULA 7
            </span>
          </div>
          <span className="font-telemetry text-xs text-[#8E8E98] bg-white/[0.04] border border-white/10 px-3 py-1 rounded-full">
            PASS ID: #M7-GP-2026-VIP
          </span>
        </div>

        {/* The Luxury Double-Bezel VIP Paddock Pass */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="double-bezel"
        >
          <div className="double-bezel-inner">
            {/* Top Red-and-White Kerb Inlay */}
            <div className="h-2 kerb-inlay-h" />

            {/* Lanyard Grommet Slot (Physical Badge Aesthetic) */}
            <div className="flex justify-center -mt-1 mb-4">
              <div className="w-24 h-3 bg-[#0D0D14] border border-white/15 rounded-full flex items-center justify-center shadow-inner">
                <div className="w-12 h-1 bg-white/20 rounded-full" />
              </div>
            </div>

            {/* Iridescent Holographic Foil Security Strip */}
            <div className="mx-6 sm:mx-8 mb-6 h-3 rounded-full holo-foil border border-white/20 shadow-sm flex items-center justify-between px-4">
              <span className="text-[7px] font-telemetry tracking-widest text-white/80 uppercase font-black">
                FIA OFFICIAL HOLOGRAM
              </span>
              <span className="text-[7px] font-telemetry tracking-widest text-white/80 uppercase font-black">
                VERIFIED AUTHENTIC • ROUND 07
              </span>
            </div>

            <div className="px-6 sm:px-10 pb-8">
              {/* Header: Celebrant Pole Position & Logo */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
                <M7Logo size="md" showSubtitle={false} animated={false} />

                <div className="text-center sm:text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFB800]/15 border border-[#FFB800]/40 rounded-full text-[#FFB800] text-xs font-telemetry font-bold mb-1">
                    <Trophy size={13} />
                    POLE POSITION • DRIVER #07
                  </div>
                  <h1 className="font-f1-head text-2xl sm:text-3xl font-black tracking-tight text-white uppercase italic">
                    {EVENT_CONFIG.celebrantName}
                  </h1>
                  <p className="font-telemetry text-xs sm:text-sm text-[#00D2BE] font-bold mt-0.5">
                    TURNING 7 • GRAND PRIX CELEBRATION
                  </p>
                </div>
              </div>

              {/* Event Title Banner */}
              <div className="my-6 bg-gradient-to-r from-[#171722] to-[#1F1F2C] border-l-4 border-[#E10600] p-4 rounded-r-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div>
                  <span className="font-telemetry text-[10px] tracking-[0.25em] text-[#8E8E98] uppercase block font-bold">
                    {EVENT_CONFIG.subTitle}
                  </span>
                  <span className="font-f1-head text-lg sm:text-xl font-bold text-white tracking-wide block mt-0.5">
                    {EVENT_CONFIG.eventTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-black/40 border border-white/10 rounded-full text-[#FFB800] text-xs font-telemetry font-bold flex items-center gap-1.5">
                    <Flag size={13} /> LAP 7 OF 7
                  </span>
                </div>
              </div>

              {/* Schedule & Venue Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Date & Lights Out */}
                <div className="bg-[#151520]/80 border border-white/[0.08] p-4 rounded-2xl flex items-start gap-4 shadow-md">
                  <div className="p-3 bg-[#E10600]/15 border border-[#E10600]/30 rounded-xl text-[#E10600]">
                    <Calendar size={22} />
                  </div>
                  <div>
                    <span className="font-telemetry text-[10px] text-[#8E8E98] uppercase block font-bold tracking-wider">
                      GRAND PRIX DATE
                    </span>
                    <span className="font-f1-head text-sm sm:text-base font-bold text-white block mt-0.5">
                      {EVENT_CONFIG.date}
                    </span>
                    <div className="flex items-center gap-1.5 mt-2 text-xs font-telemetry text-[#00D2BE] font-bold">
                      <Clock size={13} />
                      <span>LIGHTS OUT: {EVENT_CONFIG.time}</span>
                    </div>
                  </div>
                </div>

                {/* Circuit Venue & Paddock */}
                <div className="bg-[#151520]/80 border border-white/[0.08] p-4 rounded-2xl flex items-start gap-4 shadow-md">
                  <div className="p-3 bg-[#00D2BE]/15 border border-[#00D2BE]/30 rounded-xl text-[#00D2BE]">
                    <MapPin size={22} />
                  </div>
                  <div className="flex-1">
                    <span className="font-telemetry text-[10px] text-[#8E8E98] uppercase block font-bold tracking-wider">
                      RACE TRACK / VENUE LOCATION
                    </span>
                    <span className="font-f1-head text-sm sm:text-base font-bold text-white block mt-0.5">
                      {EVENT_CONFIG.venueName}
                    </span>
                    <p className="text-xs text-[#8E8E98] mt-1 line-clamp-2 leading-relaxed font-telemetry">
                      {EVENT_CONFIG.venueAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Program Timetable & Conditions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                {/* Track Conditions */}
                <div className="bg-[#151520]/80 border border-white/[0.08] p-4 rounded-2xl flex flex-col justify-between shadow-md">
                  <div className="flex items-center justify-between text-[11px] font-telemetry text-[#8E8E98] uppercase border-b border-white/[0.08] pb-2 font-bold">
                    <span className="flex items-center gap-1.5"><Sun size={14} className="text-[#FFB800]" /> CONDITIONS</span>
                    <span className="text-[#00D2BE]">100% OPTIMAL</span>
                  </div>
                  <div className="my-3 space-y-2 text-xs font-telemetry">
                    <div className="flex justify-between">
                      <span className="text-[#8E8E98]">WEATHER:</span>
                      <span className="text-white font-bold">{EVENT_CONFIG.weather.condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E8E98] flex items-center gap-1"><Thermometer size={12} /> TRACK TEMP:</span>
                      <span className="text-[#FFB800] font-bold">{EVENT_CONFIG.weather.trackTemp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E8E98] flex items-center gap-1"><Activity size={12} /> LAP RECORD:</span>
                      <span className="text-[#00D2BE] font-bold">{EVENT_CONFIG.raceStats.lapRecord}</span>
                    </div>
                  </div>
                  <button
                    onClick={onExploreCircuit}
                    className="w-full py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-[#00D2BE] text-xs font-telemetry font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#00D2BE]/30 shadow-sm"
                  >
                    <Compass size={14} /> EXPLORE 3D CIRCUIT GUIDE
                  </button>
                </div>

                {/* Race Day Timetable */}
                <div className="lg:col-span-2 bg-[#151520]/80 border border-white/[0.08] p-4 rounded-2xl shadow-md">
                  <div className="text-[11px] font-telemetry text-[#8E8E98] uppercase border-b border-white/[0.08] pb-2 flex justify-between font-bold">
                    <span>RACE DAY PROGRAM & PIT STOP TIMELINE</span>
                    <span className="text-[#FFB800]">ROUND 07</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 text-xs font-telemetry">
                    <div className="bg-black/30 p-2.5 rounded-xl border-l-2 border-[#00D2BE]">
                      <span className="text-[#00D2BE] font-bold block text-[11px]">15:00 PHT</span>
                      <span className="text-white font-semibold">Paddock Check-in & Starter Snacks</span>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded-xl border-l-2 border-[#FFB800]">
                      <span className="text-[#FFB800] font-bold block text-[11px]">15:45 PHT</span>
                      <span className="text-white font-semibold">Track Games & Arcade Heats</span>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded-xl border-l-2 border-[#E10600]">
                      <span className="text-[#E10600] font-bold block text-[11px]">16:45 PHT</span>
                      <span className="text-white font-semibold">Cake Presentation & Birthday Pit Radio</span>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded-xl border-l-2 border-[#A855F7]">
                      <span className="text-[#A855F7] font-bold block text-[11px]">17:30 PHT</span>
                      <span className="text-white font-semibold">Podium Ceremony & VIP Loot Bags</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS (Button-in-Button Luxury Architecture) */}
              <div className="pt-5 border-t border-white/[0.08]">
                <div className="text-center mb-4">
                  <span className="font-telemetry text-xs tracking-wider text-[#8E8E98] uppercase font-bold flex items-center justify-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#00D2BE]" />
                    FIA PIT WALL REQUIRES DRIVER GRID REGISTRATION
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4">
                  {/* Primary CTA: Confirm Grid Slot */}
                  <button
                    onClick={onConfirmGridSlot}
                    className="group relative flex-1 py-4 px-6 btn-f1-primary rounded-full cursor-pointer flex items-center justify-between border border-white/25"
                  >
                    <span className="font-f1-head font-black text-sm sm:text-base tracking-widest text-white uppercase text-left">
                      CONFIRM GRID SLOT (I'LL GO)
                    </span>
                    {/* Nested Button-in-Button Icon */}
                    <span className="w-9 h-9 rounded-full bg-black/30 border border-white/25 flex items-center justify-center group-hover:scale-110 group-hover:translate-x-1 transition-all duration-300 ml-3 shrink-0">
                      <CheckCircle2 size={18} className="text-[#00D2BE]" />
                    </span>
                  </button>

                  {/* Secondary CTA: Box / DNF */}
                  <button
                    onClick={onBoxDnf}
                    className="group flex-1 py-4 px-6 btn-f1-secondary rounded-full cursor-pointer flex items-center justify-between text-[#8E8E98] hover:text-white"
                  >
                    <span className="font-f1-head font-bold text-sm tracking-wider uppercase text-left">
                      BOX / DNF (CAN'T MAKE IT)
                    </span>
                    {/* Nested Icon */}
                    <span className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-all duration-300 ml-3 shrink-0">
                      <XCircle size={18} className="text-[#FF5E5B]" />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-[#0D0D14] px-6 py-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-telemetry text-[#8E8E98]">
              <span>M7 GRAND PRIX • OFFICIAL PADDOCK ACCREDITATION</span>
              <span className="text-[#00D2BE] font-bold">VIP ADMISSION & PODIUM ACCESS</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
