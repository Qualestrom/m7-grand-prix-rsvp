import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundtrackService } from '../services/soundtrackService';

export const AudioController: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(soundtrackService.isPlaying);
  const [isMuted, setIsMuted] = useState<boolean>(soundtrackService.isMuted);

  useEffect(() => {
    const unsubscribe = soundtrackService.subscribe((playing, muted) => {
      setIsPlaying(playing);
      setIsMuted(muted);
    });
    return unsubscribe;
  }, []);

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPlaying) {
      soundtrackService.play();
    } else {
      soundtrackService.toggleMute();
    }
  };

  const active = isPlaying && !isMuted;

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={handleToggleSound}
        type="button"
        className={`px-3 py-2 rounded-full border transition-all duration-300 flex items-center gap-2 cursor-pointer backdrop-blur-md select-none shadow-lg ${
          active
            ? 'bg-[#151520]/85 border-[#00D2BE]/40 text-[#00D2BE] shadow-[0_0_15px_rgba(0,210,190,0.25)] hover:border-[#00D2BE]/70'
            : 'bg-[#12121A]/85 border-white/15 text-[#8E8E98] hover:text-white hover:border-white/30'
        }`}
        title={active ? 'Mute Soundtrack (Hans Zimmer)' : 'Play Soundtrack (Hans Zimmer)'}
        aria-label="Toggle Hans Zimmer Soundtrack"
      >
        {active ? (
          <>
            <div className="flex items-end gap-[2px] h-3.5 w-3.5">
              <span className="w-1 bg-[#00D2BE] rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-full" />
              <span className="w-1 bg-[#00D2BE] rounded-full animate-[pulse_0.9s_ease-in-out_infinite_0.2s] h-2/3" />
              <span className="w-1 bg-[#00D2BE] rounded-full animate-[pulse_0.75s_ease-in-out_infinite_0.4s] h-4/5" />
            </div>
            <span className="font-telemetry text-[11px] font-bold tracking-wider hidden sm:inline text-white">
              HANS ZIMMER • F1
            </span>
            <Volume2 size={14} className="text-[#00D2BE]" />
          </>
        ) : (
          <>
            <VolumeX size={14} className="text-[#8E8E98]" />
            <span className="font-telemetry text-[11px] font-bold tracking-wider hidden sm:inline">
              HANS ZIMMER • F1
            </span>
            <span className="text-[10px] font-telemetry uppercase text-[#8E8E98] hidden md:inline">
              (OFF)
            </span>
          </>
        )}
      </button>
    </div>
  );
};
