import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Music, Check } from 'lucide-react';
import {
  soundtrackService,
  SOUNDTRACK_TRACKS,
  type SoundtrackTrack,
  type TrackId,
} from '../services/soundtrackService';

export const AudioController: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(soundtrackService.isPlaying);
  const [isMuted, setIsMuted] = useState<boolean>(soundtrackService.isMuted);
  const [currentTrack, setCurrentTrack] = useState<SoundtrackTrack>(
    soundtrackService.currentTrack
  );
  const [showMenu, setShowMenu] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = soundtrackService.subscribe((playing, muted, track) => {
      setIsPlaying(playing);
      setIsMuted(muted);
      setCurrentTrack(track);
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

  const handleSelectTrack = (trackId: TrackId, e: React.MouseEvent) => {
    e.stopPropagation();
    soundtrackService.switchTrack(trackId);
    setShowMenu(false);
  };

  const active = isPlaying && !isMuted;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-1.5">
        {/* Main Sound Play/Mute Button */}
        <button
          onClick={handleToggleSound}
          type="button"
          className={`px-3 py-2 rounded-full border transition-all duration-300 flex items-center gap-2 cursor-pointer backdrop-blur-md select-none shadow-lg ${
            active
              ? 'bg-[#151520]/85 border-[#00D2BE]/40 text-[#00D2BE] shadow-[0_0_15px_rgba(0,210,190,0.25)] hover:border-[#00D2BE]/70'
              : 'bg-[#12121A]/85 border-white/15 text-[#8E8E98] hover:text-white hover:border-white/30'
          }`}
          title={active ? 'Mute Soundtrack' : 'Play Soundtrack'}
          aria-label="Toggle Soundtrack"
        >
          {active ? (
            <>
              <div className="flex items-end gap-[2px] h-3.5 w-3.5">
                <span className="w-1 bg-[#00D2BE] rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-full" />
                <span className="w-1 bg-[#00D2BE] rounded-full animate-[pulse_0.9s_ease-in-out_infinite_0.2s] h-2/3" />
                <span className="w-1 bg-[#00D2BE] rounded-full animate-[pulse_0.75s_ease-in-out_infinite_0.4s] h-4/5" />
              </div>
              <span className="font-telemetry text-[11px] font-bold tracking-wider hidden sm:inline text-white">
                {currentTrack.artist.toUpperCase()}
              </span>
              <Volume2 size={14} className="text-[#00D2BE]" />
            </>
          ) : (
            <>
              <VolumeX size={14} className="text-[#8E8E98]" />
              <span className="font-telemetry text-[11px] font-bold tracking-wider hidden sm:inline">
                {currentTrack.artist.toUpperCase()}
              </span>
              <span className="text-[10px] font-telemetry uppercase text-[#8E8E98] hidden md:inline">
                (OFF)
              </span>
            </>
          )}
        </button>

        {/* Track Selector Dropdown Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          type="button"
          className={`p-2 rounded-full border transition-all backdrop-blur-md cursor-pointer shadow-md ${
            showMenu
              ? 'bg-[#E10600]/20 border-[#E10600] text-white'
              : 'bg-[#12121A]/85 border-white/15 text-[#8E8E98] hover:text-white hover:border-white/30'
          }`}
          title="Switch Soundtrack"
          aria-label="Switch Soundtrack"
        >
          <Music size={14} />
        </button>
      </div>

      {/* Track Menu */}
      {showMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-56 p-2 rounded-2xl bg-[#12121A]/95 border border-white/15 backdrop-blur-xl shadow-2xl flex flex-col gap-1 text-left z-50 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="px-2.5 py-1 text-[10px] font-telemetry text-[#8E8E98] uppercase tracking-wider font-bold">
            SELECT SOUNDTRACK
          </div>
          {SOUNDTRACK_TRACKS.map((t) => {
            const isSelected = currentTrack.id === t.id;
            return (
              <button
                key={t.id}
                onClick={(e) => handleSelectTrack(t.id, e)}
                type="button"
                className={`w-full px-2.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#00D2BE]/15 text-[#00D2BE] border border-[#00D2BE]/30 font-bold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex flex-col text-left min-w-0">
                  <span className="truncate font-f1-head text-xs">{t.title}</span>
                  <span className="text-[10px] font-telemetry text-[#8E8E98] truncate">
                    {t.artist}
                  </span>
                </div>
                {isSelected && <Check size={14} className="text-[#00D2BE] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
