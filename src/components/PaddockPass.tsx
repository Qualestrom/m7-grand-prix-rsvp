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
  Users,
  Shirt,
  MessageSquareHeart,
  Sliders,
  ChevronRight,
  X
} from 'lucide-react';

interface PaddockPassProps {
  onNavigateToAdmin?: () => void;
}

// Authentic F1 Pit Wall Radio Beep (Web Audio synthesizer)
const playRadioChirp = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Non-blocking fallback
  }
};

export const PaddockPass: React.FC<PaddockPassProps> = ({ onNavigateToAdmin }) => {
  // Modal pop-up state: keeps entire flow on the same page!
  const [activeModal, setActiveModal] = useState<'none' | 'register' | 'decline'>('none');
  const [userRsvp, setUserRsvp] = useState<RsvpRecord | null>(null);

  // Secret Pit Wall Admin state for mobile devices
  const [isPitWallUnlocked, setIsPitWallUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('m7_pitwall_mobile_unlocked') === 'true';
    }
    return false;
  });
  const [showUnlockToast, setShowUnlockToast] = useState<boolean>(false);
  const [isHoldingLogo, setIsHoldingLogo] = useState<boolean>(false);
  const [holdProgress, setHoldProgress] = useState<number>(0);

  // Gesture tracking refs
  const holdTimerRef = React.useRef<number | null>(null);
  const holdIntervalRef = React.useRef<number | null>(null);
  const didHoldUnlockRef = React.useRef<boolean>(false);
  const tapCountRef = React.useRef<number>(0);
  const lastTapTimeRef = React.useRef<number>(0);
  const lastTwoFingerTapRef = React.useRef<number>(0);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current !== null) window.clearTimeout(holdTimerRef.current);
      if (holdIntervalRef.current !== null) window.clearInterval(holdIntervalRef.current);
    };
  }, []);

  const unlockPitWall = () => {
    setIsPitWallUnlocked(true);
    setShowUnlockToast(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('m7_pitwall_mobile_unlocked', 'true');
    }
    // Mobile haptic vibration pattern (FIA telemetry burst buzz)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([35, 45, 35, 45, 65]);
      } catch {
        // Safe catch
      }
    }
    playRadioChirp();
  };

  const startHold = () => {
    didHoldUnlockRef.current = false;
    setIsHoldingLogo(true);
    setHoldProgress(0);
    const startTime = Date.now();
    const duration = 1200; // 1.2s hold duration

    if (holdIntervalRef.current !== null) window.clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setHoldProgress(progress);
    }, 40);

    if (holdTimerRef.current !== null) window.clearTimeout(holdTimerRef.current);
    holdTimerRef.current = window.setTimeout(() => {
      didHoldUnlockRef.current = true;
      cancelHold();
      unlockPitWall();
    }, duration);
  };

  const cancelHold = () => {
    setIsHoldingLogo(false);
    setHoldProgress(0);
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdIntervalRef.current !== null) {
      window.clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  const handleHeaderTap = () => {
    const now = Date.now();
    if (now - lastTapTimeRef.current < 550) {
      tapCountRef.current += 1;
    } else {
      tapCountRef.current = 1;
    }
    lastTapTimeRef.current = now;

    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      cancelHold();
      unlockPitWall();
    }
  };

  const handleContainerTouchStart = (e: React.TouchEvent) => {
    // 2-Finger Double Tap gesture anywhere on mobile screen
    if (e.touches.length === 2) {
      const now = Date.now();
      if (now - lastTwoFingerTapRef.current < 500) {
        unlockPitWall();
      }
      lastTwoFingerTapRef.current = now;
    }
  };

  const handleOpenAdmin = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (onNavigateToAdmin) {
      onNavigateToAdmin();
    } else {
      window.history.pushState(null, '', '/admin');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

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
    <div
      className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-[#09090D] px-4 py-8 relative overflow-hidden select-none"
      onTouchStart={handleContainerTouchStart}
    >
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

          {/* M7 Logo with Ambient Subtle Float & Secret Gesture Activation */}
          <div
            className="relative cursor-pointer select-none touch-manipulation mb-4 sm:mb-6 pt-1 sm:pt-2 inline-flex flex-col items-center"
            onTouchStart={startHold}
            onTouchEnd={() => {
              cancelHold();
              if (!didHoldUnlockRef.current) {
                handleHeaderTap();
              }
              didHoldUnlockRef.current = false;
            }}
            onTouchCancel={cancelHold}
            onMouseDown={startHold}
            onMouseUp={() => {
              cancelHold();
              if (!didHoldUnlockRef.current) {
                handleHeaderTap();
              }
              didHoldUnlockRef.current = false;
            }}
            onMouseLeave={cancelHold}
            role="button"
            tabIndex={0}
            aria-label="M7 Grand Prix Logo"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <M7Logo size="md" showSubtitle={false} animated={false} />
            </motion.div>

            {/* Secret Hold Progress Telemetry Scanner Ring */}
            <AnimatePresence>
              {isHoldingLogo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 -m-3 pointer-events-none flex flex-col items-center justify-center z-20"
                >
                  <div className="absolute inset-0 rounded-2xl border-2 border-[#00D2BE] animate-pulse shadow-[0_0_20px_rgba(0,210,190,0.45)]" />
                  <div className="absolute -bottom-6 px-2.5 py-0.5 rounded-full bg-black/90 border border-[#00D2BE]/60 text-[10px] font-telemetry font-bold text-[#00D2BE] tracking-widest uppercase shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D2BE] animate-ping" />
                    <span>SCANNING: {holdProgress}%</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Celebrant Name & Birthday */}
          <h1 className="font-f1-head text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white uppercase italic">
            {EVENT_CONFIG.celebrantName}
          </h1>

          <div className="mt-1 flex items-center justify-center">
            <span className="font-f1-head text-base sm:text-lg md:text-xl font-bold tracking-widest text-[#E10600] uppercase">
              {EVENT_CONFIG.eventTitle}
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

          {/* Attire / Outfit Theme Disclaimer Banner */}
          <div className="w-full p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-left mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFB800]/15 border border-[#FFB800]/30 flex items-center justify-center shrink-0">
              <Shirt size={16} className="text-[#FFB800]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-telemetry text-[10px] font-bold tracking-wider text-[#FFB800] uppercase">
                  ATTIRE & DRESS CODE
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-telemetry font-bold text-white uppercase tracking-wider">
                  NO THEME REQUIRED
                </span>
              </div>
              <p className="font-telemetry text-xs text-[#A0A0B0] mt-0.5 leading-snug">
                {EVENT_CONFIG.attireNotice}
              </p>
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

              {/* Highlighted Clickable Leave a Message Box */}
              <button
                onClick={handleOpenDecline}
                className="group w-full mt-3.5 py-3 px-5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/20 hover:border-[#FF5E5B]/50 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_0_18px_rgba(255,94,91,0.2)] active:scale-[0.99]"
              >
                <MessageSquareHeart size={15} className="text-[#FF5E5B] group-hover:scale-110 transition-transform shrink-0" />
                <span className="font-telemetry text-xs text-[#A0A0B0] group-hover:text-white transition-colors">
                  Can't make it? <span className="text-[#FF5E5B] group-hover:text-[#ff7875] font-bold underline underline-offset-2">Leave a Birthday Message</span>
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Subtle Pit Wall Telemetry Access Link (Hidden on mobile by default; revealed upon gesture activation) */}
        <div className="mt-4 text-center">
          {isPitWallUnlocked ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex flex-col items-center gap-1.5"
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00D2BE]/15 border border-[#00D2BE]/40 text-[9px] font-telemetry font-bold text-[#00D2BE] uppercase tracking-wider shadow-[0_0_10px_rgba(0,210,190,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D2BE] animate-ping" />
                <span>FIA PIT WALL LINK ACTIVE</span>
              </div>
              <a
                href="/admin"
                onClick={handleOpenAdmin}
                className="px-4 py-2 rounded-full bg-[#101018] hover:bg-[#161622] border border-[#00D2BE]/50 hover:border-[#00D2BE] text-xs font-telemetry text-[#00D2BE] hover:text-white transition-all shadow-[0_0_20px_rgba(0,210,190,0.25)] hover:shadow-[0_0_25px_rgba(0,210,190,0.45)] inline-flex items-center gap-2 cursor-pointer active:scale-95 group"
              >
                <Sliders size={13} className="text-[#00D2BE] group-hover:rotate-45 transition-transform" />
                <span className="font-bold tracking-wider uppercase">Pit Wall Telemetry & Admin Command</span>
                <ChevronRight size={13} className="text-[#00D2BE] group-hover:translate-x-0.5 transition-transform" />
              </a>
            </motion.div>
          ) : (
            /* Desktop only: Subtle text link. Mobile (< md): Completely hidden from guests! */
            <a
              href="/admin"
              onClick={handleOpenAdmin}
              className="hidden md:inline-flex text-[11px] font-telemetry text-[#8E8E98]/60 hover:text-[#00D2BE] transition-colors items-center gap-1 cursor-pointer"
            >
              <span>Pit Wall Telemetry & Admin Command</span>
            </a>
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

      {/* 4. Floating FIA Pit Wall Toast / HUD on mobile unlock */}
      <AnimatePresence>
        {showUnlockToast && (
          <motion.aside
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Pit Wall Telemetry Banner"
            className="fixed bottom-5 left-4 right-4 max-w-md mx-auto z-50 p-3.5 rounded-2xl bg-[#0D0D14]/95 border-2 border-[#00D2BE] shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(0,210,190,0.35)] backdrop-blur-xl flex items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#00D2BE]/15 border border-[#00D2BE]/40 flex items-center justify-center shrink-0">
                <Sliders size={18} className="text-[#00D2BE]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E10600] animate-pulse" />
                  <span className="font-f1-head font-bold text-xs text-white uppercase tracking-wider truncate">
                    PIT WALL UNLOCKED
                  </span>
                </div>
                <p className="font-telemetry text-[11px] text-[#A0A0B0] truncate">
                  Race Control stream online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleOpenAdmin}
                className="px-3.5 py-2 rounded-xl bg-[#00D2BE] hover:bg-[#20ebd7] text-[#0A0A10] font-f1-head font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-[0_0_15px_rgba(0,210,190,0.4)] transition-all cursor-pointer active:scale-95"
              >
                <span>ENTER</span>
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => setShowUnlockToast(false)}
                className="p-1.5 rounded-lg text-[#8E8E98] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Dismiss banner"
              >
                <X size={16} />
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};
