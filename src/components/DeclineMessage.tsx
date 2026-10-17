import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquareHeart, Send, CheckCircle2, User } from 'lucide-react';
import { rsvpService } from '../services/rsvpService';
import { M7Logo } from './M7Logo';
import { EVENT_CONFIG } from '../config/eventConfig';

interface DeclineMessageProps {
  onBack: () => void;
}

export const DeclineMessage: React.FC<DeclineMessageProps> = ({ onBack }) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
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
      await rsvpService.submitRsvp({
        guest_name: name.trim(),
        relationship: 'Guest',
        attending: false,
        companions: [],
        total_headcount: 0,
        message: message.trim(),
      });

      setIsSubmitting(false);
      setIsSubmitted(true);
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
                      LEAVE A MESSAGE
                    </h2>
                    <p className="text-xs text-[#8E8E98] font-telemetry mt-0.5">
                      We will miss you on the grid!
                    </p>
                  </div>
                  <M7Logo size="sm" showSubtitle={false} animated={false} />
                </div>

                {/* Broadcast Banner */}
                <div className="mb-4 p-3.5 bg-[#14141E] border border-white/10 rounded-2xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#E10600]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquareHeart size={16} className="text-[#FF1801]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-f1-head text-xs font-bold text-white uppercase tracking-wider">
                      BIRTHDAY BROADCAST
                    </h3>
                    <p className="font-telemetry text-[11px] text-[#A0A0B0] mt-0.5 leading-relaxed">
                      Leave a birthday wish for {EVENT_CONFIG.celebrantName}! Your message will be displayed on the screen during his 7th Birthday Grand Prix!
                    </p>
                  </div>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-[#E10600]/15 border border-[#E10600]/50 rounded-xl text-xs font-telemetry text-[#FF5E5B]">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-telemetry uppercase text-[#8E8E98] tracking-wider mb-1.5 font-bold flex items-center gap-1.5">
                      <User size={14} className="text-[#00D2BE]" />
                      YOUR NAME *
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name (e.g. Uncle Alex, Cousin Leo)"
                      className="w-full px-3.5 py-2.5 sm:py-3 bg-[#111118] border border-white/15 focus:border-[#00D2BE] focus:ring-1 focus:ring-[#00D2BE] rounded-xl text-white font-telemetry text-sm placeholder-[#555566] outline-none transition-all"
                    />
                  </div>

                  {/* Message Textarea */}
                  <div>
                    <label className="block text-xs font-telemetry uppercase text-[#8E8E98] tracking-wider mb-1.5 font-bold flex items-center gap-1.5">
                      <MessageSquareHeart size={14} className="text-[#FF1801]" />
                      YOUR BIRTHDAY MESSAGE
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Write your birthday wish for ${EVENT_CONFIG.celebrantName}...`}
                      className="w-full px-3.5 py-2.5 sm:py-3 bg-[#111118] border border-white/15 focus:border-[#FF1801] focus:ring-1 focus:ring-[#FF1801] rounded-xl text-white font-telemetry text-sm placeholder-[#555566] outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group w-full py-3.5 px-6 btn-f1-primary rounded-full font-f1-head font-black tracking-widest text-sm uppercase text-white flex items-center justify-center gap-3 cursor-pointer shadow-lg border border-white/20 transition-all disabled:opacity-50"
                    >
                      <span>
                        {isSubmitting ? 'TRANSMITTING MESSAGE...' : 'SEND BIRTHDAY WISH'}
                      </span>
                      <Send size={15} className="text-white group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-full bg-[#00D2BE]/20 border border-[#00D2BE]/40 flex items-center justify-center mb-3">
                  <CheckCircle2 size={28} className="text-[#00D2BE]" />
                </div>

                <h3 className="font-f1-head text-xl sm:text-2xl font-black text-white uppercase italic mb-1.5">
                  MESSAGE TRANSMITTED!
                </h3>

                <p className="font-telemetry text-xs text-[#A0A0B0] max-w-sm leading-relaxed mb-6">
                  Thank you, <span className="text-white font-bold">{name}</span>! Your birthday message has been received and will be broadcasted during {EVENT_CONFIG.celebrantName}'s 7th Birthday Grand Prix!
                </p>

                <button
                  onClick={onBack}
                  className="w-full py-3 px-6 btn-f1-primary rounded-full font-f1-head font-black tracking-widest text-xs sm:text-sm uppercase text-white transition-all cursor-pointer shadow-lg border border-white/20"
                >
                  RETURN TO INVITATION
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
