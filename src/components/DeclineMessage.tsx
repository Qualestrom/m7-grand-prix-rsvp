import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquareHeart, Send, CheckCircle2, User } from 'lucide-react';
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
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-[#09090D] px-4 py-8 relative overflow-hidden select-none">
      {/* Subtle Luxury Radial Vignette Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(225,6,0,0.12)_0%,rgba(9,9,13,0.98)_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10 my-auto"
      >
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-telemetry text-[#8E8E98] hover:text-white mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>BACK TO INVITATION</span>
        </button>

        <div className="double-bezel">
          <div className="double-bezel-inner p-7 sm:p-8">
            {/* Top Red Kerb Inlay */}
            <div className="absolute top-0 left-0 right-0 h-1.5 kerb-inlay-h" />

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 pt-1">
                    <div>
                      <h2 className="font-f1-head text-xl font-black text-white uppercase italic">
                        THANK YOU!
                      </h2>
                      <p className="text-xs text-[#8E8E98] font-telemetry mt-0.5">
                        We will miss you on the grid
                      </p>
                    </div>
                    <M7Logo size="sm" showSubtitle={false} animated={false} />
                  </div>

                  {/* Birthday Screen Notice Banner */}
                  <div className="mb-6 p-4 bg-[#14141E] border border-white/10 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#E10600]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquareHeart size={16} className="text-[#FF1801]" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-f1-head text-xs font-bold text-white uppercase tracking-wider">
                        BIRTHDAY PARTY BROADCAST
                      </h3>
                      <p className="font-telemetry text-[11px] text-[#A0A0B0] mt-1 leading-relaxed">
                        Even if you cannot make it, leave a birthday wish for {EVENT_CONFIG.celebrantName}! Your message will be displayed on the big screen during his 7th Birthday Grand Prix!
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
                      <label className="block text-xs font-telemetry uppercase text-[#8E8E98] tracking-wider mb-2 font-bold flex items-center gap-1.5">
                        <User size={14} className="text-[#00D2BE]" />
                        YOUR NAME *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name (e.g. Uncle Alex, Cousin Leo)"
                        className="w-full px-4 py-3 bg-[#111118] border border-white/15 focus:border-[#00D2BE] focus:ring-1 focus:ring-[#00D2BE] rounded-xl text-white font-telemetry text-sm placeholder-[#555566] outline-none transition-all"
                      />
                    </div>

                    {/* Message Textarea */}
                    <div>
                      <label className="block text-xs font-telemetry uppercase text-[#8E8E98] tracking-wider mb-2 font-bold flex items-center gap-1.5">
                        <MessageSquareHeart size={14} className="text-[#FF1801]" />
                        YOUR BIRTHDAY MESSAGE
                      </label>
                      <textarea
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Write your birthday wish for ${EVENT_CONFIG.celebrantName}...`}
                        className="w-full px-4 py-3 bg-[#111118] border border-white/15 focus:border-[#FF1801] focus:ring-1 focus:ring-[#FF1801] rounded-xl text-white font-telemetry text-sm placeholder-[#555566] outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group w-full py-3.5 px-6 btn-f1-primary rounded-full font-f1-head font-black tracking-widest text-sm uppercase text-white flex items-center justify-center gap-3 cursor-pointer shadow-lg border border-white/20 transition-all disabled:opacity-50"
                      >
                        <span>
                          {isSubmitting ? 'TRANSMITTING MESSAGE...' : 'SEND BIRTHDAY WISH'}
                        </span>
                        <Send size={16} className="text-white group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#00D2BE]/20 border border-[#00D2BE]/40 flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} className="text-[#00D2BE]" />
                  </div>

                  <h3 className="font-f1-head text-2xl font-black text-white uppercase italic mb-2">
                    MESSAGE TRANSMITTED!
                  </h3>

                  <p className="font-telemetry text-xs text-[#A0A0B0] max-w-xs leading-relaxed mb-6">
                    Thank you, <span className="text-white font-bold">{name}</span>! Your birthday message has been received and will be displayed during {EVENT_CONFIG.celebrantName}'s 7th Birthday Grand Prix party!
                  </p>

                  <button
                    onClick={onBack}
                    className="w-full py-3 px-6 bg-white/[0.08] hover:bg-white/[0.12] border border-white/20 rounded-full font-telemetry font-bold text-xs uppercase tracking-wider text-white transition-all cursor-pointer"
                  >
                    RETURN TO INVITATION
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
