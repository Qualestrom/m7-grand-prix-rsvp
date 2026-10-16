import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { rsvpService, type Companion } from '../services/rsvpService';
import { EVENT_CONFIG } from '../config/eventConfig';
import { M7Logo } from './M7Logo';
import { 
  Users, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Flag, 
  CheckCircle2, 
  Radio, 
  ShieldAlert,
  Sparkles,
  Baby,
  UserCheck,
  Send
} from 'lucide-react';

interface DriverRegistrationProps {
  initialAttending?: boolean;
  onSuccess: (attending: boolean) => void;
  onBack: () => void;
}

const RELATIONSHIPS = [
  'Family / Relative',
  'Ninong / Ninang',
  'Schoolmate / Friend',
  'Family Friend',
] as const;

export const DriverRegistration: React.FC<DriverRegistrationProps> = ({
  initialAttending = true,
  onSuccess,
  onBack,
}) => {
  const [attending, setAttending] = useState<boolean>(initialAttending);
  const [guestName, setGuestName] = useState<string>('');
  const [relationship, setRelationship] = useState<string>(RELATIONSHIPS[0]);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const totalHeadcount = attending ? 1 + companions.length : 1;
  const kidsCount = companions.filter((c) => c.type === 'Kid').length;
  const adultsCount = 1 + companions.filter((c) => c.type === 'Adult').length;

  const handleAddCompanion = () => {
    const newComp: Companion = {
      id: crypto.randomUUID ? crypto.randomUUID() : `comp-${Date.now()}-${Math.random()}`,
      fullName: '',
      type: 'Kid',
    };
    setCompanions([...companions, newComp]);
  };

  const handleUpdateCompanionName = (id: string, name: string) => {
    setCompanions(
      companions.map((c) => (c.id === id ? { ...c, fullName: name } : c))
    );
  };

  const handleToggleCompanionType = (id: string) => {
    setCompanions(
      companions.map((c) =>
        c.id === id ? { ...c, type: c.type === 'Kid' ? 'Adult' : 'Kid' } : c
      )
    );
  };

  const handleRemoveCompanion = (id: string) => {
    setCompanions(companions.filter((c) => c.id !== id));
  };

  const triggerF1Confetti = () => {
    try {
      const colors = ['#E10600', '#FFB800', '#00D2BE', '#FFFFFF', '#000000'];
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: colors,
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
          colors: colors,
        });
      }, 200);
    } catch {
      // Fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!guestName.trim()) {
      setErrorMsg('Please specify your Driver / Guest name.');
      return;
    }

    if (attending) {
      for (let i = 0; i < companions.length; i++) {
        if (!companions[i].fullName.trim()) {
          setErrorMsg(`Please specify full name for Pit Crew Companion #${i + 1}.`);
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      await rsvpService.submitRsvp({
        guest_name: guestName.trim(),
        relationship,
        attending,
        companions: attending ? companions : [],
        total_headcount: totalHeadcount,
        message: message.trim(),
      });

      if (attending) {
        triggerF1Confetti();
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess(attending);
      }, 600);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setErrorMsg('Telemetry synchronization failed. Please retry.');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-f1-ambient py-8 px-4 flex flex-col items-center justify-center relative">
      <div className="w-full max-w-2xl z-10 my-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-4 px-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-telemetry text-[#8E8E98] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> BACK TO PADDOCK PASS
          </button>
          <span className="font-telemetry text-xs text-[#00D2BE] font-bold">
            FIA DRIVER ACCREDITATION // FORM 07
          </span>
        </div>

        {/* Double-Bezel Form Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="double-bezel"
        >
          <div className="double-bezel-inner">
            {/* Top Kerb Inlay */}
            <div className="h-2 kerb-inlay-h" />

            {/* Form Header */}
            <div className="p-6 sm:p-8 border-b border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${attending ? 'bg-[#00D2BE]' : 'bg-[#FF5E5B]'}`} />
                  <span className="font-telemetry text-[11px] uppercase tracking-widest text-[#8E8E98] font-bold">
                    {attending ? 'CONFIRMED GRID ENTRY' : 'OFFICIAL RETIREMENT (DNF)'}
                  </span>
                </div>
                <h1 className="font-f1-head text-2xl font-black text-white uppercase italic">
                  {attending ? 'DRIVER & PIT CREW ENTRY' : 'PIT RADIO / DNF NOTICE'}
                </h1>
                <p className="text-xs text-[#8E8E98] font-telemetry mt-0.5">
                  {EVENT_CONFIG.eventTitle} • {EVENT_CONFIG.date}
                </p>
              </div>

              <M7Logo size="sm" showSubtitle={false} animated={false} />
            </div>

            {/* Mode Switcher Toggle Pill */}
            <div className="bg-[#101018] p-3 border-b border-white/[0.08] flex justify-center">
              <div className="bg-[#181824] p-1.5 rounded-full border border-white/10 flex w-full max-w-md shadow-inner">
                <button
                  type="button"
                  onClick={() => setAttending(true)}
                  className={`flex-1 py-2 text-xs font-telemetry font-bold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    attending
                      ? 'btn-f1-primary text-white shadow-md'
                      : 'text-[#8E8E98] hover:text-white'
                  }`}
                >
                  <CheckCircle2 size={15} /> CONFIRM GRID (ATTENDING)
                </button>
                <button
                  type="button"
                  onClick={() => setAttending(false)}
                  className={`flex-1 py-2 text-xs font-telemetry font-bold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    !attending
                      ? 'bg-white/[0.08] text-[#FF5E5B] border border-[#FF5E5B]/40'
                      : 'text-[#8E8E98] hover:text-white'
                  }`}
                >
                  <Flag size={15} /> BOX / DNF (CAN'T MAKE IT)
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {errorMsg && (
                <div className="p-3 bg-[#E10600]/15 border border-[#E10600] rounded-xl text-[#FF5E5B] text-xs font-telemetry flex items-center gap-2">
                  <ShieldAlert size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Field 1: Primary Driver Name */}
              <div>
                <label className="block text-xs font-telemetry uppercase text-[#8E8E98] tracking-wider mb-2 font-bold">
                  1. PRIMARY DRIVER NAME (YOUR FULL NAME) *
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Lewis Hamilton / Uncle Carlos"
                  className="w-full px-4 py-3 bg-[#0F0F16] border border-white/15 focus:border-[#00D2BE] focus:ring-1 focus:ring-[#00D2BE] rounded-xl text-white font-telemetry text-base placeholder-[#555566] outline-none transition-all shadow-inner"
                />
              </div>

              {/* Field 2: Relationship Selector */}
              <div>
                <label className="block text-xs font-telemetry uppercase text-[#8E8E98] tracking-wider mb-2 font-bold">
                  2. RELATIONSHIP TO CELEBRANT (MATTHEU AMARI) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {RELATIONSHIPS.map((rel) => {
                    const isSelected = relationship === rel;
                    return (
                      <button
                        key={rel}
                        type="button"
                        onClick={() => setRelationship(rel)}
                        className={`p-3 text-xs font-telemetry rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#E10600]/20 border-[#E10600] text-white font-bold shadow-[0_0_15px_rgba(225,6,0,0.35)]'
                            : 'bg-[#0F0F16] border-white/10 text-[#8E8E98] hover:text-white hover:border-white/20'
                        }`}
                      >
                        {rel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Attending Mode: Pit Crew Companions (+1s) Dynamic List */}
              {attending && (
                <div className="border-t border-white/[0.08] pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className="text-xs font-telemetry uppercase text-[#00D2BE] font-bold tracking-wider flex items-center gap-1.5">
                        <Users size={16} /> 3. PIT CREW COMPANIONS (+1s / FAMILY)
                      </label>
                      <p className="text-[11px] text-[#8E8E98] font-telemetry mt-0.5">
                        Specify companion names and toggle Kid/Adult for accurate catering & loot bag counts.
                      </p>
                    </div>

                    {/* Live Headcount Gauge */}
                    <div className="bg-[#0F0F16] border border-[#00D2BE]/40 px-3.5 py-1.5 rounded-xl text-right shadow-inner">
                      <span className="font-telemetry text-[9px] text-[#8E8E98] uppercase block font-bold">TOTAL SEATS</span>
                      <span className="font-telemetry font-bold text-sm text-[#00D2BE]">
                        {totalHeadcount} ({adultsCount} Adult{adultsCount > 1 ? 's' : ''}, {kidsCount} Kid{kidsCount > 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>

                  {/* Companion Rows */}
                  <div className="space-y-3 mb-4">
                    {companions.map((comp, idx) => (
                      <motion.div
                        key={comp.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 bg-[#0F0F16] p-2.5 rounded-xl border border-white/10 shadow-sm"
                      >
                        <span className="font-telemetry text-xs text-[#8E8E98] w-6 text-center font-bold">
                          #{idx + 1}
                        </span>
                        
                        <input
                          type="text"
                          required
                          value={comp.fullName}
                          onChange={(e) => handleUpdateCompanionName(comp.id, e.target.value)}
                          placeholder={`Companion #${idx + 1} Full Name`}
                          className="flex-1 px-3 py-2 bg-[#171722] border border-white/10 rounded-lg text-white font-telemetry text-sm placeholder-[#555566] outline-none focus:border-[#00D2BE]"
                        />

                        {/* Kid / Adult Toggle Badge */}
                        <button
                          type="button"
                          onClick={() => handleToggleCompanionType(comp.id)}
                          className={`px-3 py-1.5 rounded-lg font-telemetry text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            comp.type === 'Kid'
                              ? 'bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/50'
                              : 'bg-[#00D2BE]/20 text-[#00D2BE] border border-[#00D2BE]/50'
                          }`}
                          title="Click to toggle between Kid and Adult"
                        >
                          {comp.type === 'Kid' ? <Baby size={13} /> : <UserCheck size={13} />}
                          <span>{comp.type.toUpperCase()}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveCompanion(comp.id)}
                          className="p-2 text-[#8E8E98] hover:text-[#FF5E5B] hover:bg-[#251212] rounded-lg transition-colors cursor-pointer"
                          title="Remove Companion"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Add Companion Button */}
                  <button
                    type="button"
                    onClick={handleAddCompanion}
                    className="w-full py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-dashed border-white/20 rounded-xl text-xs font-telemetry font-bold text-[#00D2BE] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Plus size={16} /> ADD PIT CREW COMPANION (+1)
                  </button>
                </div>
              )}

              {/* Field 4: Pit Radio Greeting */}
              <div className="border-t border-white/[0.08] pt-6">
                <label className="block text-xs font-telemetry uppercase text-[#8E8E98] tracking-wider mb-2 flex items-center gap-1.5 font-bold">
                  <Radio size={14} className="text-[#FFB800]" /> 
                  {attending ? '4. BIRTHDAY PIT RADIO MESSAGE FOR MATTHEU' : '3. REGRETS / BIRTHDAY GREETING'} (OPTIONAL)
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Radio check! Leave a birthday greeting or note for Mattheu Amari..."
                  className="w-full px-4 py-3 bg-[#0F0F16] border border-white/15 focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] rounded-xl text-white font-telemetry text-sm placeholder-[#555566] outline-none transition-all resize-none shadow-inner"
                />
              </div>

              {/* Luxury Button-in-Button Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`group w-full py-4 px-6 rounded-full font-f1-head font-black tracking-widest text-sm sm:text-base uppercase flex items-center justify-between transition-all cursor-pointer border ${
                    attending
                      ? 'btn-f1-primary text-white border-white/25'
                      : 'btn-f1-secondary text-white border-white/10'
                  }`}
                >
                  <span className="text-left">
                    {isSubmitting
                      ? 'TRANSMITTING TELEMETRY...'
                      : attending
                      ? 'TRANSMIT RSVP & SECURE GRID SLOT'
                      : 'SUBMIT REGRETS TO PIT WALL'}
                  </span>
                  
                  {/* Nested Button-in-Button Icon */}
                  <span className="w-9 h-9 rounded-full bg-black/30 border border-white/25 flex items-center justify-center group-hover:scale-110 group-hover:translate-x-1 transition-all duration-300 ml-3 shrink-0">
                    {attending ? (
                      <Sparkles size={18} className="text-[#00D2BE]" />
                    ) : (
                      <Send size={16} className="text-white" />
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
