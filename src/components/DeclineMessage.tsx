import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquareHeart, Send, CheckCircle2, User } from 'lucide-react';
import { rsvpService, type RsvpRecord } from '../services/rsvpService';
import { M7Logo } from './M7Logo';

interface DeclineMessageProps {
  existingRsvp?: RsvpRecord | null;
  onSuccess?: (record?: RsvpRecord) => void;
  onBack: () => void;
  onReRegister?: () => void;
}

export const DeclineMessage: React.FC<DeclineMessageProps> = ({
  existingRsvp = null,
  onSuccess,
  onBack,
  onReRegister,
}) => {
  const [name, setName] = useState(existingRsvp ? existingRsvp.guest_name : '');
  const [message, setMessage] = useState(existingRsvp?.message || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let updatedRecord: RsvpRecord | null = null;

      if (existingRsvp && existingRsvp.id) {
        // Update existing RSVP to attending = false
        const res = await rsvpService.updateRsvp(existingRsvp.id, {
          guest_name: name.trim(),
          attending: false,
          total_headcount: 0,
          companions: [],
          message: message.trim(),
        });
        updatedRecord = res.data || {
          ...existingRsvp,
          guest_name: name.trim(),
          attending: false,
          total_headcount: 0,
          companions: [],
          message: message.trim(),
        };
      } else {
        // New DNF RSVP
        const res = await rsvpService.submitRsvp({
          guest_name: name.trim(),
          relationship: 'Guest',
          attending: false,
          companions: [],
          total_headcount: 0,
          message: message.trim(),
        });
        updatedRecord = res.data || null;
      }

      setIsSubmitting(false);
      setIsSubmitted(true);

      if (onSuccess && updatedRecord) {
        onSuccess(updatedRecord);
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setErrorMsg('Failed to send message. Please try again.');
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
          {/* Top Red Kerb Inlay */}
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
                      {existingRsvp ? 'CANNOT MAKE IT TO THE PARTY' : 'LEAVE A BIRTHDAY MESSAGE'}
                    </h2>
                    <p className="font-telemetry text-xs text-[#8E8E98] mt-0.5">
                      {existingRsvp
                        ? 'We will miss you on the grid! Send Mattheu a birthday wish'
                        : 'Send Mattheu Amari your warm wishes for his 7th Birthday'}
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

                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-telemetry text-[#8E8E98] uppercase tracking-wider mb-1.5">
                      Your Full Name <span className="text-[#E10600]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aunt Sarah"
                        className="w-full px-4 py-2.5 pl-10 bg-[#12121A] border border-white/15 focus:border-[#00D2BE] rounded-xl text-white font-telemetry text-sm outline-none placeholder-[#555566] transition-colors"
                        autoFocus={!name}
                      />
                      <User size={16} className="absolute left-3.5 top-3 text-[#8E8E98]" />
                    </div>
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="block text-xs font-telemetry text-[#8E8E98] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <MessageSquareHeart size={14} className="text-[#FF5E5B]" />
                      <span>Birthday Pit Radio Message (Optional)</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Happy 7th Birthday Mattheu! Wish we could be there to race with you!`}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-[#12121A] border border-white/15 focus:border-[#00D2BE] rounded-xl text-white font-telemetry text-sm outline-none placeholder-[#555566] transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-full font-f1-head font-black tracking-widest text-sm uppercase text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg border border-white/20 transition-all bg-[#1F1F2C] hover:bg-[#2B2B3D] disabled:opacity-50"
                    >
                      <Send size={15} />
                      <span>{isSubmitting ? 'SENDING...' : existingRsvp ? 'UPDATE TO CANNOT ATTEND' : 'SEND MESSAGE'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="submitted"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                  <CheckCircle2 size={28} className="text-[#00D2BE]" />
                </div>

                <h3 className="font-f1-head text-xl font-black text-white uppercase italic">
                  MESSAGE TRANSMITTED!
                </h3>

                <p className="font-telemetry text-xs sm:text-sm text-[#8E8E98] mt-1 mb-5">
                  Thank you, <span className="text-white font-bold">{name}</span>. Your message has been beamed to Mattheu’s pit crew!
                </p>

                <div className="w-full flex flex-col gap-2.5">
                  {onReRegister && (
                    <button
                      onClick={onReRegister}
                      className="w-full py-3 px-6 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 font-telemetry font-bold text-xs uppercase tracking-wider text-white transition-all cursor-pointer"
                    >
                      CHANGED YOUR MIND? JOIN THE GRID
                    </button>
                  )}

                  <button
                    onClick={onBack}
                    className="w-full py-3 px-6 btn-f1-primary rounded-full font-f1-head font-black tracking-widest text-xs sm:text-sm uppercase text-white cursor-pointer shadow-lg border border-white/20 transition-all"
                  >
                    BACK TO INVITATION
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
