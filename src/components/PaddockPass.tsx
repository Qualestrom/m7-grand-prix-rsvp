import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EVENT_CONFIG } from '../config/eventConfig';
import { M7Logo } from './M7Logo';
import { Calendar, Clock, ArrowRight, MapPin, Navigation } from 'lucide-react';

interface PaddockPassProps {
  onConfirmGridSlot: () => void;
  onBoxDnf?: () => void;
}

export const PaddockPass: React.FC<PaddockPassProps> = ({
  onConfirmGridSlot,
  onBoxDnf,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleAttendClick = () => {
    if (isConfirming) return;
    setIsConfirming(true);
    setTimeout(() => {
      setIsConfirming(false);
      onConfirmGridSlot();
    }, 1300);
  };
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-[#09090D] px-4 py-8 relative overflow-hidden">
      {/* Subtle Luxury Radial Vignette Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(225,6,0,0.14)_0%,rgba(9,9,13,0.98)_70%)] pointer-events-none" />

      {/* Main Luxury Invitation Container */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg z-10 my-auto double-bezel"
      >
        <div className="double-bezel-inner p-8 sm:p-10 flex flex-col items-center text-center">
          {/* Top Red-and-White Kerb Metallic Inlay */}
          <div className="absolute top-0 left-0 right-0 h-1.5 kerb-inlay-h" />

          {/* M7 Logo with Ambient Glow */}
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-6 pt-2"
          >
            <M7Logo size="md" showSubtitle={false} animated={false} />
          </motion.div>

          {/* Celebrant Name & Birthday */}
          <h1 className="font-f1-head text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">
            {EVENT_CONFIG.celebrantName}
          </h1>
          <p className="font-telemetry text-sm tracking-[0.25em] text-[#00D2BE] font-bold uppercase mt-1.5 mb-8">
            TURNING 7 • GRAND PRIX
          </p>

          {/* Party Details (Date, Time, Venue) */}
          <div className="w-full flex flex-col gap-3 mb-8">
            {/* Date & Time Row */}
            <div className="w-full grid grid-cols-2 gap-3">
              {/* Date */}
              <div className="bg-[#12121A] border border-white/10 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-inner">
                <Calendar size={18} className="text-[#E10600] mb-1.5" />
                <span className="font-telemetry text-[10px] text-[#8E8E98] uppercase font-bold tracking-wider">
                  DATE
                </span>
                <span className="font-f1-head text-xs sm:text-sm font-bold text-white mt-0.5">
                  {EVENT_CONFIG.date}
                </span>
              </div>

              {/* Time */}
              <div className="bg-[#12121A] border border-white/10 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-inner">
                <Clock size={18} className="text-[#00D2BE] mb-1.5" />
                <span className="font-telemetry text-[10px] text-[#8E8E98] uppercase font-bold tracking-wider">
                  TIME
                </span>
                <span className="font-f1-head text-xs sm:text-sm font-bold text-white mt-0.5">
                  {EVENT_CONFIG.time}
                </span>
              </div>
            </div>

            {/* Circuit Venue Card */}
            {EVENT_CONFIG.venueName && (
              <div className="w-full bg-[#12121A] border border-white/10 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left shadow-inner">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#E10600]/15 border border-[#E10600]/30 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-[#E10600]" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-telemetry text-[10px] text-[#8E8E98] uppercase font-bold tracking-wider block">
                      CIRCUIT VENUE
                    </span>
                    <p className="font-f1-head text-xs sm:text-sm font-bold text-white truncate">
                      {EVENT_CONFIG.venueName}
                    </p>
                    {EVENT_CONFIG.venueAddress && (
                      <p className="text-[11px] text-[#8E8E98] font-telemetry truncate">
                        {EVENT_CONFIG.venueAddress}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {EVENT_CONFIG.googleMapsUrl && (
                    <a
                      href={EVENT_CONFIG.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-[#E10600]/20 border border-white/10 hover:border-[#E10600]/40 text-white transition-all cursor-pointer flex items-center gap-1"
                      title="Open in Google Maps"
                    >
                      <MapPin size={12} className="text-[#E10600]" />
                      <span className="font-telemetry text-[10px] font-bold hidden sm:inline">MAP</span>
                    </a>
                  )}
                  {EVENT_CONFIG.wazeUrl && (
                    <a
                      href={EVENT_CONFIG.wazeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-[#00D2BE]/20 border border-white/10 hover:border-[#00D2BE]/40 text-white transition-all cursor-pointer flex items-center gap-1"
                      title="Open in Waze"
                    >
                      <Navigation size={12} className="text-[#00D2BE]" />
                      <span className="font-telemetry text-[10px] font-bold hidden sm:inline">WAZE</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Primary CTA: I Will Attend */}
          <button
            onClick={handleAttendClick}
            disabled={isConfirming}
            className="group w-full py-4 px-6 btn-f1-primary rounded-full cursor-pointer flex items-center justify-center gap-3 border border-white/25 shadow-xl transition-all disabled:opacity-90"
          >
            {isConfirming ? (
              <div className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="font-f1-head font-black tracking-widest text-sm sm:text-base text-white uppercase animate-pulse">
                  CONFIRMING GRID SLOT...
                </span>
              </div>
            ) : (
              <>
                <span className="font-f1-head font-black tracking-widest text-sm sm:text-base text-white uppercase">
                  I WILL ATTEND
                </span>
                <span className="w-8 h-8 rounded-full bg-black/30 border border-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight size={16} className="text-white" />
                </span>
              </>
            )}
          </button>

          {/* Subtle DNF / Can't make it link */}
          {onBoxDnf && (
            <button
              onClick={onBoxDnf}
              disabled={isConfirming}
              className="mt-4 text-xs font-telemetry text-[#8E8E98] hover:text-white transition-colors cursor-pointer"
            >
              Can't make it? Leave a message
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
