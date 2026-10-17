import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { rsvpService, type Companion } from '../services/rsvpService';
import { M7Logo } from './M7Logo';
import { X, Plus, Trash2, CheckCircle2, User, Users, Compass, ArrowRight } from 'lucide-react';
import { EVENT_CONFIG } from '../config/eventConfig';

interface DriverRegistrationProps {
  initialAttending?: boolean;
  onSuccess?: (confirmedData?: { name: string; count: number }) => void;
  onBack: () => void;
  onOpenCircuitGuide?: () => void;
}

export const DriverRegistration: React.FC<DriverRegistrationProps> = ({
  initialAttending = true,
  onSuccess,
  onBack,
  onOpenCircuitGuide,
}) => {
  const [guestName, setGuestName] = useState<string>('');
  const [companions, setCompanions] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

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
        id: crypto.randomUUID ? crypto.randomUUID() : `comp-${Date.now()}-${Math.random()}`,
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
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 },
        colors,
      });
    } catch {
      // Fallback
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

      await rsvpService.submitRsvp({
        guest_name: guestName.trim(),
        relationship: 'Guest',
        attending: initialAttending,
        companions: formattedCompanions,
        total_headcount: totalHeadcount,
        message: '',
      });

      triggerF1Confetti();
      setIsSubmitting(false);
      setIsSubmitted(true);
      onSuccess?.({ name: guestName.trim(), count: totalHeadcount });
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setErrorMsg('Failed to save RSVP. Please retry.');
    }
  };

  return (
    <div
      onClick={(e) => {
        // Close modal when tapping the backdrop
        if (e.target === e.currentTarget) {
          onBack();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg my-auto double-bezel shadow-2xl relative"
      >
        <div className="double-bezel-inner p-5 sm:p-7 max-h-[90vh] overflow-y-auto custom-scrollbar">
          {/* Top Red Kerb Inlay */}
          <div className="absolute top-0 left-0 right-0 h-1.5 kerb-inlay-h" />

          {/* Close 'X' Button at top-right */}
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
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-5 pt-1 pr-8">
                  <div>
                    <h2 className="font-f1-head text-lg sm:text-xl font-black text-white uppercase italic">
                      CONFIRM GRID SLOT
                    </h2>
                    <p className="text-xs text-[#8E8E98] font-telemetry mt-0.5">
                      Guest Registration • {EVENT_CONFIG.celebrantName}'s 7th GP
                    </p>
                  </div>
                  <M7Logo size="sm" showSubtitle={false} animated={false} />
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-[#E10600]/15 border border-[#E10600]/50 rounded-xl text-xs font-telemetry text-[#FF5E5B]">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Field 1: Guest Name */}
                  <div>
                    <label className="block text-xs font-telemetry uppercase text-[#8E8E98] tracking-wider mb-1.5 font-bold flex items-center gap-1.5">
                      <User size={14} className="text-[#00D2BE]" />
                      YOUR NAME *
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-3.5 py-2.5 sm:py-3 bg-[#111118] border border-white/15 focus:border-[#00D2BE] focus:ring-1 focus:ring-[#00D2BE] rounded-xl text-white font-telemetry text-sm placeholder-[#555566] outline-none transition-all"
                    />
                  </div>

                  {/* Field 2: Accompanies (If Any) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-telemetry uppercase text-[#8E8E98] tracking-wider font-bold flex items-center gap-1.5">
                        <Users size={14} className="text-[#FFB800]" />
                        ACCOMPANIES (OPTIONAL)
                      </label>
                      {companions.length > 0 && (
                        <span className="text-[11px] font-telemetry text-[#00D2BE]">
                          +{companions.length} companion{companions.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Animated List of Companions */}
                    <div className="space-y-2">
                      <AnimatePresence>
                        {companions.map((comp, idx) => (
                          <motion.div
                            key={comp.id}
                            layout
                            initial={{ opacity: 0, height: 0, y: -6 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="text"
                              value={comp.name}
                              onChange={(e) => handleUpdateCompanion(comp.id, e.target.value)}
                              placeholder={`Accompany #${idx + 1} Name`}
                              className="flex-1 px-3.5 py-2 bg-[#111118] border border-white/10 focus:border-[#FFB800] rounded-xl text-white font-telemetry text-sm placeholder-[#555566] outline-none transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveCompanion(comp.id)}
                              className="p-2 text-[#8E8E98] hover:text-[#FF5E5B] bg-[#171722] hover:bg-[#281515] border border-white/5 rounded-xl transition-colors cursor-pointer shrink-0"
                              title="Remove"
                            >
                              <Trash2 size={14} />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <button
                        type="button"
                        onClick={handleAddCompanion}
                        className="w-full py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-dashed border-white/20 rounded-xl text-xs font-telemetry font-bold text-[#00D2BE] flex items-center justify-center gap-2 transition-colors cursor-pointer mt-1"
                      >
                        <Plus size={14} />
                        <span>ADD ACCOMPANY</span>
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
                      <span>{isSubmitting ? 'SAVING...' : 'CONFIRM RSVP'}</span>
                      <CheckCircle2 size={17} className="text-white" />
                    </button>
                  </div>
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

                <p className="font-telemetry text-xs sm:text-sm text-[#00D2BE] font-bold tracking-wider uppercase mt-1 mb-3">
                  PADDOCK PASS ACTIVE // SPEC-M7
                </p>

                {/* VIP Pass Summary Card */}
                <div className="w-full bg-[#12121A] border border-white/10 rounded-2xl p-4 text-left font-telemetry mb-5 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#8E8E98] uppercase">DRIVER:</span>
                    <span className="text-white font-bold">{guestName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#8E8E98] uppercase">ACCOMPANIES:</span>
                    <span className="text-[#FFB800] font-bold">
                      +{companions.filter((c) => c.name.trim()).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-white/5 pt-1.5">
                    <span className="text-[#8E8E98] uppercase">TOTAL PASSES:</span>
                    <span className="text-[#00D2BE] font-bold">
                      {1 + companions.filter((c) => c.name.trim()).length} VIP Passes
                    </span>
                  </div>
                </div>

                <div className="w-full flex flex-col gap-2.5">
                  {onOpenCircuitGuide && (
                    <button
                      onClick={onOpenCircuitGuide}
                      className="w-full py-3 px-5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 font-telemetry font-bold text-xs uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Compass size={15} className="text-[#00D2BE]" />
                      <span>EXPLORE 3D CIRCUIT GUIDE</span>
                      <ArrowRight size={14} className="text-white/60" />
                    </button>
                  )}

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
