import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { rsvpService, type Companion, type RsvpRecord } from '../services/rsvpService';
import { getDeviceNavigationMapUrl } from '../services/mapUtils';
import { M7Logo } from './M7Logo';
import { 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  User, 
  Users, 
  Navigation, 
  Edit3, 
  XCircle, 
  ExternalLink 
} from 'lucide-react';
import { EVENT_CONFIG } from '../config/eventConfig';

interface DriverRegistrationProps {
  initialAttending?: boolean;
  existingRsvp?: RsvpRecord | null;
  onSuccess?: (confirmedData?: RsvpRecord) => void;
  onDeclineInstead?: (existing?: RsvpRecord) => void;
  onBack: () => void;
}

export const DriverRegistration: React.FC<DriverRegistrationProps> = ({
  initialAttending = true,
  existingRsvp = null,
  onSuccess,
  onDeclineInstead,
  onBack,
}) => {
  const [guestName, setGuestName] = useState<string>(existingRsvp ? existingRsvp.guest_name : '');
  const [companions, setCompanions] = useState<{ id: string; name: string }[]>(() => {
    if (existingRsvp && Array.isArray(existingRsvp.companions) && existingRsvp.companions.length > 0) {
      return existingRsvp.companions.map((c) => ({ id: c.id, name: c.fullName }));
    }
    return [];
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [confirmedRecord, setConfirmedRecord] = useState<RsvpRecord | null>(existingRsvp || null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const mapInfo = getDeviceNavigationMapUrl();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const handleAddCompanion = () => {
    setCompanions([
      ...companions,
      {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `comp-${Date.now()}-${Math.random()}`,
        name: '',
      },
    ]);
  };

  const handleUpdateCompanion = (id: string, name: string) => {
    setCompanions(companions.map((c) => (c.id === id ? { ...c, name } : c)));
  };

  const handleRemoveCompanion = (id: string) => {
    setCompanions(companions.filter((c) => c.id !== id));
  };

  const triggerF1Confetti = () => {
    try {
      const colors = ['#E10600', '#FFB800', '#00D2BE', '#FFFFFF'];
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.5 },
        colors,
      });
    } catch {
      // Ignore if canvas confetti is not supported
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!guestName.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedCompanions: Companion[] = companions
        .filter((c) => c.name.trim().length > 0)
        .map((c) => ({
          id: c.id,
          fullName: c.name.trim(),
          type: 'Adult',
        }));

      const totalHeadcount = 1 + formattedCompanions.length;

      let resultRecord: RsvpRecord | null = null;

      if (existingRsvp && existingRsvp.id) {
        // Update existing record
        const res = await rsvpService.updateRsvp(existingRsvp.id, {
          guest_name: guestName.trim(),
          attending: true,
          companions: formattedCompanions,
          total_headcount: totalHeadcount,
        });
        resultRecord = res.data || {
          ...existingRsvp,
          guest_name: guestName.trim(),
          attending: true,
          companions: formattedCompanions,
          total_headcount: totalHeadcount,
        };
      } else {
        // Create new record
        const res = await rsvpService.submitRsvp({
          guest_name: guestName.trim(),
          relationship: 'Guest',
          attending: initialAttending,
          companions: formattedCompanions,
          total_headcount: totalHeadcount,
          message: '',
        });
        resultRecord = res.data || null;
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
      setConfirmedRecord(resultRecord);
      triggerF1Confetti();

      if (onSuccess && resultRecord) {
        onSuccess(resultRecord);
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setErrorMsg('An error occurred while confirming your RSVP. Please try again.');
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onBack();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg my-auto double-bezel shadow-2xl relative"
      >
        <div className="double-bezel-inner p-5 sm:p-7 max-h-[90vh] overflow-y-auto custom-scrollbar">
          {/* Top Red-and-White Kerb Metallic Inlay */}
          <div className="absolute top-0 left-0 right-0 h-1.5 kerb-inlay-h" />

          {/* Close 'X' Button */}
          <button
            onClick={onBack}
            className="absolute top-3.5 right-3.5 p-2 rounded-full text-[#8E8E98] hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer z-10"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>

          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pt-1 pr-8">
                  <div>
                    <h2 className="font-f1-head text-lg sm:text-xl font-black text-white uppercase italic">
                      {existingRsvp ? 'MODIFY YOUR RSVP' : 'CONFIRM YOUR ATTENDANCE'}
                    </h2>
                    <p className="font-telemetry text-xs text-[#8E8E98] mt-0.5">
                      {existingRsvp ? 'Update your name or guest accompanies below' : 'Mattheu Amari’s 7th Birthday Grand Prix'}
                    </p>
                  </div>
                  <M7Logo size="sm" showSubtitle={false} animated={false} />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 bg-[#E10600]/15 border border-[#E10600] rounded-xl text-[#FF5E5B] text-xs font-telemetry">
                      {errorMsg}
                    </div>
                  )}

                  {/* Primary Guest Name Input */}
                  <div>
                    <label className="block text-xs font-telemetry text-[#8E8E98] uppercase tracking-wider mb-1.5">
                      Your Full Name <span className="text-[#E10600]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-2.5 pl-10 bg-[#12121A] border border-white/15 focus:border-[#00D2BE] rounded-xl text-white font-telemetry text-sm outline-none placeholder-[#555566] transition-colors"
                        autoFocus
                      />
                      <User size={16} className="absolute left-3.5 top-3 text-[#8E8E98]" />
                    </div>
                  </div>

                  {/* Accompanying Guests */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-telemetry text-[#8E8E98] uppercase tracking-wider flex items-center gap-1.5">
                        <Users size={14} className="text-[#00D2BE]" />
                        <span>Accompanying With You (+1s)</span>
                      </label>
                      <span className="text-[11px] font-telemetry text-[#00D2BE]">
                        {companions.filter((c) => c.name.trim()).length} Added
                      </span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {companions.map((comp, idx) => (
                        <div key={comp.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={comp.name}
                            onChange={(e) => handleUpdateCompanion(comp.id, e.target.value)}
                            placeholder={`Companion #${idx + 1} Name`}
                            className="flex-1 px-3 py-2 bg-[#12121A] border border-white/10 focus:border-[#00D2BE] rounded-lg text-white font-telemetry text-xs outline-none placeholder-[#555566]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveCompanion(comp.id)}
                            className="p-2 text-[#8E8E98] hover:text-[#E10600] bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                            title="Remove companion"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddCompanion}
                        className="w-full py-2.5 px-3 border border-dashed border-white/20 hover:border-[#00D2BE]/60 text-xs font-telemetry text-[#8E8E98] hover:text-white rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-white/[0.02] hover:bg-white/[0.05]"
                      >
                        <Plus size={14} className="text-[#00D2BE]" />
                        <span>ADD ACCOMPANYING GUEST</span>
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group w-full py-3.5 px-6 btn-f1-primary rounded-full font-f1-head font-black tracking-widest text-sm uppercase text-white flex items-center justify-center gap-3 cursor-pointer shadow-lg border border-white/20 transition-all disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'SAVING DETAILS...' : existingRsvp ? 'SAVE UPDATED RSVP' : 'CONFIRM RSVP'}</span>
                      <CheckCircle2 size={17} className="text-white" />
                    </button>
                  </div>

                  {/* Option to change mind and decline if already had an RSVP */}
                  {existingRsvp && onDeclineInstead && (
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => onDeclineInstead(existingRsvp)}
                        className="text-xs font-telemetry text-[#FF5E5B] hover:underline cursor-pointer"
                      >
                        Change your mind? Click here to decline
                      </button>
                    </div>
                  )}
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 flex flex-col items-center text-center"
              >
                {/* Success Icon */}
                <div className="w-14 h-14 rounded-full bg-[#00D2BE]/20 border border-[#00D2BE]/50 flex items-center justify-center mb-3">
                  <CheckCircle2 size={28} className="text-[#00D2BE]" />
                </div>

                <h3 className="font-f1-head text-xl sm:text-2xl font-black text-white uppercase italic">
                  GRID SLOT CONFIRMED!
                </h3>

                <p className="font-telemetry text-xs sm:text-sm text-[#00D2BE] font-bold tracking-wider uppercase mt-1 mb-4">
                  PADDOCK PASS ACTIVE // SPEC-M7
                </p>

                {/* Confirmed Details Summary Card */}
                <div className="w-full bg-[#12121A] border border-white/10 rounded-2xl p-4 text-left font-telemetry mb-5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#8E8E98] uppercase">PRIMARY DRIVER:</span>
                    <span className="text-white font-bold">{guestName}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#8E8E98] uppercase">ACCOMPANIES:</span>
                    <span className="text-[#FFB800] font-bold">
                      +{companions.filter((c) => c.name.trim()).length}
                    </span>
                  </div>

                  {companions.filter((c) => c.name.trim()).length > 0 && (
                    <div className="pt-1 border-t border-white/5">
                      <span className="text-[10px] text-[#8E8E98] uppercase block mb-1">Names:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {companions
                          .filter((c) => c.name.trim())
                          .map((c, i) => (
                            <span
                              key={c.id || i}
                              className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-[#E1E1F0]"
                            >
                              {c.name}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
                    <span className="text-[#8E8E98] uppercase">TOTAL PASSES:</span>
                    <span className="text-[#00D2BE] font-bold">
                      {1 + companions.filter((c) => c.name.trim()).length} VIP Passes
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-white/5 pt-1.5">
                    <span className="text-[#8E8E98] uppercase">VENUE:</span>
                    <span className="text-white font-bold">{EVENT_CONFIG.venueName}</span>
                  </div>
                </div>

                {/* Action Buttons: Native Phone Map Redirect & Modify/Decline */}
                <div className="w-full flex flex-col gap-2.5">
                  {/* Native Phone Map Redirect Button (Apple Maps on iOS, Google Maps on Android/Other) */}
                  <a
                    href={mapInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-5 rounded-full bg-[#00D2BE] hover:bg-[#20ebd7] text-[#0E0E14] font-telemetry font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,190,0.45)] transition-all cursor-pointer"
                  >
                    <Navigation size={16} />
                    <span>NAVIGATE IN {mapInfo.appName.toUpperCase()}</span>
                    <ExternalLink size={13} className="opacity-70" />
                  </a>

                  {/* Modify Details Button */}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="w-full py-2.5 px-5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 font-telemetry font-bold text-xs uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit3 size={14} className="text-[#FFB800]" />
                    <span>MODIFY DETAILS</span>
                  </button>

                  {/* Change mind / Can't attend button */}
                  {onDeclineInstead && confirmedRecord && (
                    <button
                      onClick={() => onDeclineInstead(confirmedRecord)}
                      className="w-full py-2 text-xs font-telemetry text-[#FF5E5B] hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <XCircle size={13} />
                      <span>Can't go anymore? Change mind to decline</span>
                    </button>
                  )}

                  {/* Return to invitation */}
                  <button
                    onClick={onBack}
                    className="w-full py-3 px-6 btn-f1-primary rounded-full font-f1-head font-black tracking-widest text-xs sm:text-sm uppercase text-white cursor-pointer shadow-lg border border-white/20 transition-all"
                  >
                    RETURN TO INVITATION
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
