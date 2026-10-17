import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Copy, Check, RotateCcw, ArrowLeft, Trophy } from 'lucide-react';
import { EVENT_CONFIG } from '../../config/eventConfig';

interface RouteArrivalCardProps {
  onReplay: () => void;
  onBack: () => void;
}

export const RouteArrivalCard: React.FC<RouteArrivalCardProps> = ({
  onReplay,
  onBack,
}) => {
  const [copied, setCopied] = useState(false);
  const fullAddress = "Block 5, Lot 27, Saint John Subdivision, Barangay Ibaba, City of Santa Rosa, Laguna";

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.93, y: 15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none"
    >
      <div className="w-full max-w-md double-bezel shadow-2xl relative">
        <div className="double-bezel-inner p-6 sm:p-8 text-center relative">
          {/* Top Red-and-White Kerb Metallic Inlay */}
          <div className="absolute top-0 left-0 right-0 h-1.5 kerb-inlay-h" />

          {/* Chequered Podium Icon */}
          <div className="w-16 h-16 rounded-full bg-[#00D2BE]/20 border border-[#00D2BE]/50 flex items-center justify-center mx-auto mb-4 mt-1">
            <Trophy size={32} className="text-[#00D2BE]" />
          </div>

          <h2 className="font-f1-head text-2xl font-black text-white uppercase italic">
            YOU HAVE ARRIVED!
          </h2>
          <p className="font-telemetry text-xs text-[#00D2BE] font-bold uppercase tracking-widest mt-0.5 mb-4">
            JSH EVENTS PLACE • VIP PADDOCK
          </p>

          {/* Exact Address Box */}
          <div className="bg-[#12121A] border border-white/10 rounded-2xl p-4 text-left font-telemetry text-xs mb-5 space-y-1.5 shadow-inner">
            <div className="flex items-center gap-2 text-[#E10600] font-bold">
              <MapPin size={16} />
              <span>CIRCUIT VENUE ADDRESS</span>
            </div>
            <p className="text-white font-semibold leading-relaxed">
              {fullAddress}
            </p>
            <button
              onClick={handleCopy}
              className="mt-2 w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-telemetry text-[11px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-[#00D2BE]" />
                  <span className="text-[#00D2BE]">ADDRESS COPIED TO CLIPBOARD</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>COPY EXACT ADDRESS</span>
                </>
              )}
            </button>
          </div>

          {/* Navigation Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            {EVENT_CONFIG.googleMapsUrl && (
              <a
                href={EVENT_CONFIG.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 rounded-xl bg-[#E10600]/20 hover:bg-[#E10600]/30 border border-[#E10600]/40 text-white font-telemetry font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <MapPin size={15} className="text-[#E10600]" />
                <span>GOOGLE MAPS</span>
              </a>
            )}

            {EVENT_CONFIG.wazeUrl && (
              <a
                href={EVENT_CONFIG.wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 rounded-xl bg-[#00D2BE]/20 hover:bg-[#00D2BE]/30 border border-[#00D2BE]/40 text-white font-telemetry font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Navigation size={15} className="text-[#00D2BE]" />
                <span>OPEN WAZE</span>
              </a>
            )}
          </div>

          {/* Replay and Return to Invitation */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={onReplay}
              className="w-full py-2.5 px-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white font-telemetry text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>REPLAY 3D FLYOVER</span>
            </button>

            <button
              onClick={onBack}
              className="w-full py-3 px-6 btn-f1-primary rounded-full font-f1-head font-black tracking-widest text-xs uppercase text-white cursor-pointer shadow-lg border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              <span>RETURN TO INVITATION</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
