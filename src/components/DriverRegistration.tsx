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
  Send, 
  ArrowLeft, 
  Flag, 
  CheckCircle2, 
  Radio, 
  ShieldAlert,
  Sparkles,
  Baby,
  UserCheck
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

  // Total headcount: 1 primary driver + number of companions (if attending)
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
      // Formula 1 colors: Racing Red, DRS Gold, Telemetry Cyan, Pure White
      const colors = ['#E10600', '#FFB800', '#00D2BE', '#FFFFFF', '#000000'];
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors,
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });
      }, 250);
    } catch {
      // Fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!guestName.trim()) {
      setErrorMsg('Please enter your Driver / Guest name.');
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
      setErrorMsg('Failed to record telemetry. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-carbon-pattern py-8 px-4 flex flex-col items-center justify-center relative">
      <div className="w-full max-w-2xl z-10">
        {/* Top Back Navigation & Screen Badge */}
        <div className="flex items-center justify-between mb-4 px-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-telemetry text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> BACK TO PADDOCK PASS
          </button>
          <span className="font-telemetry text-xs text-[#00D2BE] font-bold">
            FIA DRIVER ACCREDITATION // FORM 07
          </span>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-[#1C1C24] border-2 border-[#2E2E3C] rounded-2xl shadow-2xl overflow-hidden relative"
        >
          {/* Top Kerb Accent Strip */}
          <div className="h-2 kerb-strip-h" />

          {/* Form Header */}
          <div className="p-6 sm:p-8 border-b border-[#2B2B38] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${attending ? 'bg-[#00D2BE]' : 'bg-[#FF5E5B]'}`} />
                <span className="font-telemetry text-[11px] uppercase tracking-widest text-[#8E8E93]">
                  {attending ? 'CONFIRMED GRID ENTRY' : 'PIT RETIREMENT (DNF)'}
                </span>
              </div>
              <h1 className="font-f1-head text-2xl font-black text-white uppercase">
                {attending ? 'DRIVER & PIT CREW REGISTRATION' : 'OFFICIAL PIT RADIO / DNF NOTICE'}
              </h1>
              <p className="text-xs text-[#8E8E93] font-telemetry mt-0.5">
                {EVENT_CONFIG.eventTitle} • {EVENT_CONFIG.date}
              </p>
            </div>

            <M7Logo size="sm" showSubtitle={false} animated={false} />
          </div>

          {/* Mode Switcher Toggle Pill */}
          <div className="bg-[#16161E] p-3 border-b border-[#2B2B38] flex justify-center">
            <div className="bg-[#101017] p-1 rounded-lg border border-[#2B2B38] flex w-full max-w-md">
              <button
                type="button"
                onClick={() => setAttending(true)}
                className={`flex-1 py-2 text-xs font-telemetry font-bold rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  attending
                    ? 'bg-[#E10600] text-white shadow-[0_0_15px_rgba(225,6,0,0.6)]'
                    : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                <CheckCircle2 size={15} /> CONFIRM GRID (ATTENDING)
              </button>
              <button
                type="button"
                onClick={() => setAttending(false)}
                className={`flex-1 py-2 text-xs font-telemetry font-bold rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  !attending
                    ? 'bg-[#2B2B38] text-[#FF5E5B] border border-[#3E3E4E]'
                    : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                <Flag size={15} /> BOX / DNF (CAN'T MAKE IT)
              </button>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {errorMsg && (
              <div className="p-3 bg-[#E10600]/15 border border-[#E10600] rounded-lg text-[#FF5E5B] text-xs font-telemetry flex items-center gap-2">
                <ShieldAlert size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Field 1: Primary Driver Name */}
            <div>
              <label className="block text-xs font-telemetry uppercase text-[#8E8E93] tracking-wider mb-2">
                1. PRIMARY DRIVER NAME (YOUR FULL NAME) *
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Lewis Hamilton / Tito Mark Santos"
                className="w-full px-4 py-3 bg-[#14141B] border border-[#333342] focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600] rounded-lg text-white font-telemetry text-sm placeholder-[#555562] outline-none transition-all"
              />
            </div>

            {/* Field 2: Relationship Selector */}
            <div>
              <label className="block text-xs font-telemetry uppercase text-[#8E8E93] tracking-wider mb-2">
                2. RELATIONSHIP TO CELEBRANT (MATTHEU AMARI) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {RELATIONSHIPS.map((rel) => {
                  const isSelected = relationship === rel;
                  return (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setRelationship(rel)}
                      className={`p-2.5 text-xs font-telemetry rounded-lg border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E10600]/20 border-[#E10600] text-white font-bold shadow-[0_0_12px_rgba(225,6,0,0.3)]'
                          : 'bg-[#14141B] border-[#2D2D3A] text-[#8E8E93] hover:text-white hover:border-[#3E3E50]'
                      }`}
                    >
                      {rel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Attending Mode: Pit Crew Companions Dynamic List */}
            {attending && (
              <div className="border-t border-[#2B2B38] pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-xs font-telemetry uppercase text-[#00D2BE] font-bold tracking-wider flex items-center gap-1.5">
                      <Users size={16} /> 3. PIT CREW COMPANIONS (+1s / FAMILY)
                    </label>
                    <p className="text-[11px] text-[#8E8E93] font-telemetry mt-0.5">
                      Specify names and toggle Kid/Adult for accurate catering & loot bag counts.
                    </p>
                  </div>

                  {/* Live Headcount Pill */}
                  <div className="bg-[#121218] border border-[#00D2BE]/40 px-3 py-1.5 rounded-lg text-right">
                    <span className="font-telemetry text-[10px] text-[#8E8E93] uppercase block">TOTAL SEATS</span>
                    <span className="font-telemetry font-bold text-sm text-[#00D2BE]">
                      {totalHeadcount} ({adultsCount} Adult{adultsCount > 1 ? 's' : ''}, {kidsCount} Kid{kidsCount > 1 ? 's' : ''})
                    </span>
                  </div>
                </div>

                {/* Companions Rows */}
                <div className="space-y-3 mb-4">
                  {companions.map((comp, idx) => (
                    <motion.div
                      key={comp.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 bg-[#14141B] p-2.5 rounded-lg border border-[#2B2B38]"
                    >
                      <span className="font-telemetry text-xs text-[#8E8E93] w-6 text-center">
                        #{idx + 1}
                      </span>
                      
                      {/* Companion Name Input */}
                      <input
                        type="text"
                        required
                        value={comp.fullName}
                        onChange={(e) => handleUpdateCompanionName(comp.id, e.target.value)}
                        placeholder={`Companion #${idx + 1} Full Name`}
                        className="flex-1 px-3 py-2 bg-[#1B1B24] border border-[#333342] rounded text-white font-telemetry text-xs placeholder-[#555562] outline-none focus:border-[#00D2BE]"
                      />

                      {/* Kid / Adult Toggle Badge */}
                      <button
                        type="button"
                        onClick={() => handleToggleCompanionType(comp.id)}
                        className={`px-3 py-1.5 rounded font-telemetry text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          comp.type === 'Kid'
                            ? 'bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/50'
                            : 'bg-[#00D2BE]/20 text-[#00D2BE] border border-[#00D2BE]/50'
                        }`}
                        title="Click to toggle between Kid and Adult"
                      >
                        {comp.type === 'Kid' ? <Baby size={14} /> : <UserCheck size={14} />}
                        <span>{comp.type.toUpperCase()}</span>
                      </button>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveCompanion(comp.id)}
                        className="p-2 text-[#8E8E93] hover:text-[#FF5E5B] hover:bg-[#251515] rounded transition-colors cursor-pointer"
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
                  className="w-full py-2.5 bg-[#20202C] hover:bg-[#282838] border border-dashed border-[#3D3D50] rounded-lg text-xs font-telemetry font-bold text-[#00D2BE] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus size={16} /> ADD PIT CREW COMPANION (+1)
                </button>
              </div>
            )}

            {/* Field 4: Pit Radio Birthday Message */}
            <div className="border-t border-[#2B2B38] pt-6">
              <label className="block text-xs font-telemetry uppercase text-[#8E8E93] tracking-wider mb-2 flex items-center gap-1.5">
                <Radio size={14} className="text-[#FFB800]" /> 
                {attending ? '4. BIRTHDAY PIT RADIO MESSAGE FOR MATTHEU' : '3. REGRETS / BIRTHDAY PIT RADIO MESSAGE'} (OPTIONAL)
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Radio check! Leave a birthday greeting or note for Mattheu Amari..."
                className="w-full px-4 py-3 bg-[#14141B] border border-[#333342] focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] rounded-lg text-white font-telemetry text-sm placeholder-[#555562] outline-none transition-all resize-none"
              />
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-lg font-f1-head font-black tracking-widest text-sm sm:text-base uppercase flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xl ${
                  attending
                    ? 'bg-[#E10600] hover:bg-[#FF1801] text-white shadow-[0_0_25px_rgba(225,6,0,0.5)] border-t border-white/30'
                    : 'bg-[#2B2B38] hover:bg-[#38384A] text-white border border-[#48485C]'
                }`}
              >
                {isSubmitting ? (
                  <span className="font-telemetry text-xs tracking-wider">TRANSMITTING TELEMETRY...</span>
                ) : (
                  <>
                    {attending ? <Sparkles size={18} className="text-[#00D2BE]" /> : <Send size={18} />}
                    <span>{attending ? 'TRANSMIT RSVP & SECURE GRID SLOT' : 'SUBMIT REGRETS TO PIT WALL'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
