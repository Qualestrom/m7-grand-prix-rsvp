import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { rsvpService, type Companion } from '../services/rsvpService';
import { M7Logo } from './M7Logo';
import { ArrowLeft, Plus, Trash2, CheckCircle2, User, Users } from 'lucide-react';

interface DriverRegistrationProps {
  initialAttending?: boolean;
  onSuccess: () => void;
  onBack: () => void;
}

export const DriverRegistration: React.FC<DriverRegistrationProps> = ({
  initialAttending = true,
  onSuccess,
  onBack,
}) => {
  const [guestName, setGuestName] = useState<string>('');
  const [companions, setCompanions] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

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
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
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

      await rsvpService.submitRsvp({
        guest_name: guestName.trim(),
        relationship: 'Guest',
        attending: initialAttending,
        companions: formattedCompanions,
        total_headcount: 1 + formattedCompanions.length,
        message: '',
      });

      triggerF1Confetti();

      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess();
      }, 500);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setErrorMsg('Failed to save RSVP. Please retry.');
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-[#09090D] px-4 py-8 relative overflow-hidden">
      {/* Subtle Luxury Radial Vignette Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(225,6,0,0.12)_0%,rgba(9,9,13,0.98)_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10 my-auto"
      >
        {/* Top Back Navigation */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-telemetry text-[#8E8E98] hover:text-white mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>BACK TO INVITATION</span>
        </button>

        {/* Minimal Double-Bezel Form */}
        <div className="double-bezel">
          <div className="double-bezel-inner p-7 sm:p-8">
            {/* Top Red Kerb Inlay */}
            <div className="absolute top-0 left-0 right-0 h-1.5 kerb-inlay-h" />

            <div className="flex items-center justify-between mb-6 pt-1">
              <div>
                <h2 className="font-f1-head text-xl font-black text-white uppercase italic">
                  CONFIRM GRID SLOT
                </h2>
                <p className="text-xs text-[#8E8E98] font-telemetry mt-0.5">
                  Guest Registration
                </p>
              </div>
              <M7Logo size="sm" showSubtitle={false} animated={false} />
            </div>

            {errorMsg && (
              <div className="mb-5 p-3 bg-[#E10600]/15 border border-[#E10600]/50 rounded-xl text-xs font-telemetry text-[#FF5E5B]">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Field 1: Guest Name */}
              <div>
                <label className="block text-xs font-telemetry uppercase text-[#8E8E98] tracking-wider mb-2 font-bold flex items-center gap-1.5">
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
                  className="w-full px-4 py-3 bg-[#111118] border border-white/15 focus:border-[#00D2BE] focus:ring-1 focus:ring-[#00D2BE] rounded-xl text-white font-telemetry text-sm placeholder-[#555566] outline-none transition-all"
                />
              </div>

              {/* Field 2: Accompanies (If Any) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-telemetry uppercase text-[#8E8E98] tracking-wider font-bold flex items-center gap-1.5">
                    <Users size={14} className="text-[#FFB800]" />
                    ACCOMPANIES (OPTIONAL)
                  </label>
                  {companions.length > 0 && (
                    <span className="text-[11px] font-telemetry text-[#00D2BE]">
                      +{companions.length} accompany
                    </span>
                  )}
                </div>

                {/* Animated List of Companions */}
                <div className="space-y-2.5">
                  <AnimatePresence>
                    {companions.map((comp, idx) => (
                      <motion.div
                        key={comp.id}
                        layout
                        initial={{ opacity: 0, height: 0, y: -6 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={comp.name}
                          onChange={(e) => handleUpdateCompanion(comp.id, e.target.value)}
                          placeholder={`Accompany #${idx + 1} Name`}
                          className="flex-1 px-4 py-2.5 bg-[#111118] border border-white/10 focus:border-[#FFB800] rounded-xl text-white font-telemetry text-sm placeholder-[#555566] outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCompanion(comp.id)}
                          className="p-2.5 text-[#8E8E98] hover:text-[#FF5E5B] bg-[#171722] hover:bg-[#281515] border border-white/5 rounded-xl transition-colors cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <button
                    type="button"
                    onClick={handleAddCompanion}
                    className="w-full py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-dashed border-white/20 rounded-xl text-xs font-telemetry font-bold text-[#00D2BE] flex items-center justify-center gap-2 transition-colors cursor-pointer mt-1"
                  >
                    <Plus size={15} />
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
                  <span>
                    {isSubmitting ? 'SAVING...' : 'CONFIRM RSVP'}
                  </span>
                  <CheckCircle2 size={17} className="text-white" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
