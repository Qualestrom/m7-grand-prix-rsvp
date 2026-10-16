import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundtrackService } from '../services/soundtrackService';

export const AudioController: React.FC = () => {
  const [isMuted, setIsMuted] = useState<boolean>(soundtrackService.isMuted);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    // Proactively start sound automatically on mount
    soundtrackService.play().catch(() => {});

    const unsubscribe = soundtrackService.subscribe((_playing, muted) => {
      setIsMuted(muted);
    });

    // Let the users know for 4.5 seconds, then gracefully shrink into a circle button
    const shrinkTimer = setTimeout(() => {
      setIsExpanded(false);
    }, 4500);

    return () => {
      unsubscribe();
      clearTimeout(shrinkTimer);
    };
  }, []);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only mutes/unmutes the sound; the music continues playing in the background
    soundtrackService.toggleMute();

    // Briefly expand to show the feedback, then shrink back into a circle
    setIsExpanded(true);
    setTimeout(() => {
      setIsExpanded(false);
    }, 2200);
  };

  // Sound is enabled by default unless user explicitly chose Silent Mode
  const isSoundActive = !isMuted;
  const showText = isExpanded || isHovered;

  return (
    <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50">
      <button
        onClick={handleToggleMute}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        type="button"
        className={`group h-10 sm:h-11 rounded-full border transition-all duration-500 ease-in-out flex items-center cursor-pointer backdrop-blur-md select-none shadow-xl overflow-hidden ${
          showText
            ? 'px-3.5 sm:px-4 max-w-[260px]'
            : 'w-10 sm:w-11 justify-center p-0 max-w-[44px]'
        } ${
          isSoundActive
            ? 'bg-[#151520]/90 border-[#00D2BE]/50 text-[#00D2BE] shadow-[0_0_20px_rgba(0,210,190,0.25)] hover:border-[#00D2BE] hover:shadow-[0_0_25px_rgba(0,210,190,0.4)]'
            : 'bg-[#12121A]/90 border-white/15 text-[#8E8E98] hover:text-white hover:border-white/35 shadow-black/50'
        }`}
        title={isSoundActive ? 'Mute sound (Silent Mode)' : 'Unmute sound'}
        aria-label={isSoundActive ? 'Mute sound (Silent Mode)' : 'Unmute sound'}
      >
        {isSoundActive ? (
          <>
            {/* Animated Equalizer Waves */}
            <div className="flex items-end gap-[2px] h-3.5 w-3.5 shrink-0">
              <span className="w-1 bg-[#00D2BE] rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-full" />
              <span className="w-1 bg-[#00D2BE] rounded-full animate-[pulse_0.9s_ease-in-out_infinite_0.2s] h-2/3" />
              <span className="w-1 bg-[#00D2BE] rounded-full animate-[pulse_0.75s_ease-in-out_infinite_0.4s] h-4/5" />
            </div>

            {/* Stretched Prompt Text (Shrinks smoothly into circle) */}
            <span
              className={`font-telemetry text-xs sm:text-[13px] font-bold text-white tracking-wide whitespace-nowrap transition-all duration-500 ease-in-out ${
                showText ? 'max-w-[160px] opacity-100 ml-2 mr-2' : 'max-w-0 opacity-0 ml-0 mr-0'
              }`}
            >
              Want Silent Mode?
            </span>

            {/* Speaker Icon */}
            <Volume2
              size={17}
              className={`text-[#00D2BE] shrink-0 group-hover:scale-110 transition-transform ${
                !showText ? 'hidden' : ''
              }`}
            />
          </>
        ) : (
          <>
            {/* Muted Speaker Icon */}
            <VolumeX
              size={17}
              className="text-[#8E8E98] shrink-0 group-hover:text-white transition-colors"
            />

            {/* Muted Text (Shrinks smoothly into circle) */}
            <span
              className={`font-telemetry text-xs sm:text-[13px] font-bold text-[#8E8E98] group-hover:text-white tracking-wide whitespace-nowrap transition-all duration-500 ease-in-out ${
                showText ? 'max-w-[160px] opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0'
              }`}
            >
              Silent Mode
            </span>
          </>
        )}
      </button>
    </div>
  );
};
