import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EVENT_CONFIG } from '../config/eventConfig';
import { M7Logo } from './M7Logo';
import { PaddockPassBackdrop } from './PaddockPassBackdrop';
import { DriverRegistration } from './DriverRegistration';
import { DeclineMessage } from './DeclineMessage';
import { rsvpService, type RsvpRecord } from '../services/rsvpService';
import { getDeviceNavigationMapUrl } from '../services/mapUtils';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  MapPin, 
  Navigation, 
  Edit3, 
  XCircle, 
  ExternalLink,
  Users
} from 'lucide-react';

export const PaddockPass: React.FC = () => {
  // Modal pop-up state: keeps entire flow on the same page!
  const [activeModal, setActiveModal] = useState<'none' | 'register' | 'decline'>('none');
  const [userRsvp, setUserRsvp] = useState<RsvpRecord | null>(null);

  // Load persistent user RSVP on mount & verify against live Supabase cloud database
  useEffect(() => {
    // 1. Instant optimistic load from local storage
    const saved = rsvpService.getActiveUserRsvp();
    if (saved) {
      setUserRsvp(saved);
    }

    // 2. Live verification: if admin deleted their record in database, 
    // this automatically clears the local cache and reverts to a fresh invitation!
    rsvpService.verifyActiveUserRsvp().then((verified) => {
      setUserRsvp(verified);
    });
  }, []);

  const mapInfo = getDeviceNavigationMapUrl();

  const handleOpenRegister = () => {
    setActiveModal('register');
  };

  const handleOpenDecline = () => {
    setActiveModal('decline');
  };

  const handleCloseModal = () => {
    setActiveModal('none');
  };

  const handleRsvpSuccess = (record?: RsvpRecord) => {
    if (record) {
      setUserRsvp(record);
      rsvpService.saveActiveUserRsvp(record);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-[#09090D] px-4 py-8 relative overflow-hidden select-none">
      {/* 1. Rich Grand Prix Pit Wall Backdrops & F1 Circuit Watermark */}
      <PaddockPassBackdrop />

      {/* 2. Main Luxury Invitation Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg z-10 my-auto double-bezel"
      >
        <div className="double-bezel-inner p-5 sm:p-8 md:p-10 flex flex-col items-center text-center relative">
          {/* Top Red-and-White Kerb Metallic Inlay */}
          <div className="absolute top-0 left-0 right-0 h-1.5 kerb-inlay-h" />

          {/* M7 Logo with Ambient Subtle Float */}
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-4 sm:mb-6 pt-1 sm:pt-2"
          >
            <M7Logo size="md" showSubtitle={false} animated={false} />
          </motion.div>

          {/* Celebrant Name & Birthday */}
          <h1 className="font-f1-head text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white uppercase italic">
            {EVENT_CONFIG.celebrantName}
          </h1>

          <div className="mt-1 flex items-center gap-2">
            <span className="font-f1-head text-lg sm:text-xl font-bold tracking-widest text-[#E10600] uppercase">
              {EVENT_CONFIG.eventTitle}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D2BE]" />
            <span className="font-telemetry text-xs sm:text-sm font-bold text-[#8E8E98] uppercase">
              TURNING {EVENT_CONFIG.celebrantAge}
            </span>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent my-4 sm:my-6" />

          {/* Schedule & Timing Telemetry Cards */}
          <div className="w-full grid grid-cols-2 gap-3 text-left font-telemetry mb-4 sm:mb-6">
            {/* Date Card */}
            <div className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] text-[#8E8E98] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Calendar size={13} className="text-[#E10600]" />
                RACE DATE
              </span>
              <span className="font-f1-head font-bold text-xs sm:text-sm text-white">
                {EVENT_CONFIG.date}
              </span>
            </div>

            {/* Time Card */}
            <div className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] text-[#8E8E98] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Clock size={13} className="text-[#00D2BE]" />
                FORMATION LAP
              </span>
              <span className="font-f1-head font-bold text-xs sm:text-sm text-white">
                {EVENT_CONFIG.time}
              </span>
            </div>
          </div>

          {/* Venue Location Card */}
          <div className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 text-left mb-6 relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-telemetry text-[#8E8E98] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={13} className="text-[#E10600]" />
                GRAND PRIX VENUE
              </span>
              <span className="text-[10px] font-telemetry text-[#00D2BE] font-bold">
                SANTA ROSA, LAGUNA
              </span>
            </div>

            <div className="font-f1-head font-bold text-sm sm:text-base text-white">
              {EVENT_CONFIG.venueName}
            </div>

            <div className="font-telemetry text-xs text-[#8E8E98] mt-0.5 leading-relaxed">
              {EVENT_CONFIG.venueAddress}
            </div>

            {/* Map Links: Phone's native map + Waze */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <a
                href={mapInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 rounded-lg bg-[#00D2BE]/15 hover:bg-[#00D2BE]/25 border border-[#00D2BE]/30 hover:border-[#00D2BE]/60 text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(0,210,190,0.2)]"
              >
                <Navigation size={13} className="text-[#00D2BE]" />
                <span className="font-telemetry text-[11px] font-bold text-[#00D2BE]">
                  NAVIGATE ({mapInfo.appName.toUpperCase()})
                </span>
                <ExternalLink size={11} className="text-[#00D2BE]/70" />
              </a>

              {EVENT_CONFIG.wazeUrl && (
                <a
                  href={EVENT_CONFIG.wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-[#8E8E98] hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                  title="Open in Waze"
                >
                  <span className="font-telemetry text-[11px] font-bold">WAZE</span>
                </a>
              )}
            </div>
          </div>

          {/* 3. DYNAMIC STATUS & ACTIONS: CONFIRMED VS UNCONFIRMED VS DECLINED */}
          {userRsvp && userRsvp.attending ? (
            /* ==========================================
               CASE A: USER IS CONFIRMED (ATTENDING)
               ========================================== */
            <div className="w-full space-y-3">
              {/* Confirmed Details Badge Card */}
              <div className="w-full bg-[#12121A] border border-[#00D2BE]/40 rounded-2xl p-4 text-left font-telemetry shadow-[0_0_20px_rgba(0,210,190,0.15)] relative overflow-hidden">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00D2BE] animate-pulse" />
                    <span className="font-f1-head text-xs font-black text-[#00D2BE] tracking-wider uppercase">
                      YOUR GRID SLOT IS CONFIRMED!
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#00D2BE]/20 text-[#00D2BE] text-[10px] font-bold">
                    PADDOCK ACTIVE
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8E8E98] uppercase">CONFIRMED DRIVER:</span>
                    <span className="text-white font-bold">{userRsvp.guest_name}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#8E8E98] uppercase">TOTAL PASSES:</span>
                    <span className="text-[#00D2BE] font-bold">
                      {userRsvp.total_headcount} {userRsvp.total_headcount > 1 ? 'Passes' : 'Solo Pass'}
                    </span>
                  </div>

                  {Array.isArray(userRsvp.companions) && userRsvp.companions.length > 0 && (
                    <div className="pt-1.5 border-t border-white/5">
                      <span className="text-[10px] text-[#8E8E98] uppercase block mb-1 flex items-center gap-1">
                        <Users size={11} className="text-[#FFB800]" />
                        <span>Accompanying Guests ({userRsvp.companions.length}):</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {userRsvp.companions.map((c, i) => (
                          <span
                            key={c.id || i}
                            className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-[#E1E1F0]"
                          >
                            {c.fullName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Native Phone Map Action Button */}
              <a
                href={mapInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-full bg-[#00D2BE] hover:bg-[#20ebd7] text-[#0E0E14] font-telemetry font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,190,0.4)] transition-all cursor-pointer"
              >
                <Navigation size={15} />
                <span>OPEN DIRECTIONS IN {mapInfo.appName.toUpperCase()}</span>
                <ExternalLink size={13} className="opacity-70" />
              </a>

              {/* Modify Details & Change Mind Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenRegister}
                  className="flex-1 py-2.5 px-4 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white font-telemetry font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 size={13} className="text-[#FFB800]" />
                  <span>MODIFY DETAILS</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenDecline}
                  className="py-2.5 px-4 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[#FF5E5B] hover:text-white font-telemetry text-xs tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle size={13} />
                  <span>CANNOT GO</span>
                </button>
              </div>
            </div>
          ) : userRsvp && !userRsvp.attending ? (
            /* ==========================================
               CASE B: USER PREVIOUSLY DECLINED (DNF)
               ========================================== */
            <div className="w-full space-y-3">
              <div className="w-full bg-[#151520] border border-[#FF5E5B]/40 rounded-2xl p-4 text-left font-telemetry">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-f1-head text-xs font-bold text-[#FF5E5B] uppercase flex items-center gap-1.5">
                    <XCircle size={14} /> RSVP STATUS: CANNOT ATTEND (DNF)
                  </span>
                  <span className="text-[10px] text-[#8E8E98]">BOXED</span>
                </div>
                <p className="text-xs text-[#8E8E98] mt-1">
                  You marked that you won't be able to make it. Changed your mind? You can still join the grid!
                </p>
              </div>

              <button
                onClick={handleOpenRegister}
                className="group w-full py-4 px-6 btn-f1-primary rounded-full cursor-pointer flex items-center justify-center gap-3 border border-white/25 shadow-xl transition-all"
              >
                <span className="font-f1-head font-black tracking-widest text-sm uppercase text-white">
                  CHANGE MIND: ATTEND PARTY
                </span>
                <ArrowRight size={16} className="text-white group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            /* ==========================================
               CASE C: UNCONFIRMED (FIRST-TIME VISITOR)
               ========================================== */
            <div className="w-full flex flex-col items-center">
              {/* Primary CTA: I Will Attend (Opens Registration Pop-up Modal) */}
              <button
                onClick={handleOpenRegister}
                className="group w-full py-4 px-6 btn-f1-primary rounded-full cursor-pointer flex items-center justify-center gap-3 border border-white/25 shadow-xl transition-all"
              >
                <span className="font-f1-head font-black tracking-widest text-sm sm:text-base text-white uppercase">
                  I WILL ATTEND
                </span>
                <span className="w-8 h-8 rounded-full bg-black/30 border border-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight size={16} className="text-white" />
                </span>
              </button>

              {/* Subtle DNF / Can't make it link (Opens Decline Pop-up Modal) */}
              <button
                onClick={handleOpenDecline}
                className="mt-4 text-xs font-telemetry text-[#8E8E98] hover:text-white transition-colors cursor-pointer"
              >
                Can't make it? Leave a message
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* 3. Pop-up Modals: Registration & Decline Message (Unified Same Page Experience) */}
      <AnimatePresence>
        {activeModal === 'register' && (
          <DriverRegistration
            initialAttending={true}
            existingRsvp={userRsvp}
            onSuccess={(data) => {
              handleRsvpSuccess(data);
            }}
            onDeclineInstead={() => {
              handleCloseModal();
              setActiveModal('decline');
            }}
            onBack={handleCloseModal}
          />
        )}

        {activeModal === 'decline' && (
          <DeclineMessage
            existingRsvp={userRsvp}
            onSuccess={(data) => {
              handleRsvpSuccess(data);
            }}
            onBack={handleCloseModal}
            onReRegister={() => {
              handleCloseModal();
              setActiveModal('register');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
