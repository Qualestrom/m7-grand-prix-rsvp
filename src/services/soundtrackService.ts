// Audio service for Hans Zimmer's F1 Theme with Low-Pass filter transition

type AudioListener = (isPlaying: boolean, isMuted: boolean, isMuffled: boolean) => void;

class SoundtrackService {
  private audio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private isMutedState = true; // Initially muted to guarantee instant playback on load
  private isPlayingState = false;
  private isMuffledState = true; // Starts in low-pass muffled mode on loading screen
  private listeners: Set<AudioListener> = new Set();
  private isConnected = false;

  public static readonly INTRO_OFFSET_SECONDS = 11.0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
      // Start track immediately in muted mode so it runs from the loading screen without browser block
      this.play().catch(() => {});
    }
  }

  private initAudio() {
    try {
      this.audio = new Audio('/audio/hans-zimmer-f1.m4a');
      this.audio.loop = true;
      this.audio.volume = 0.85;
      this.audio.muted = true; // Initialized muted
      this.audio.preload = 'auto';

      // Cut out the long quiet intro so music starts directly at the energetic racing beat
      const setStartOffset = () => {
        if (this.audio && this.audio.currentTime < SoundtrackService.INTRO_OFFSET_SECONDS) {
          try {
            this.audio.currentTime = SoundtrackService.INTRO_OFFSET_SECONDS;
          } catch {
            // Safe catch
          }
        }
      };

      this.audio.addEventListener('loadedmetadata', setStartOffset);
      this.audio.addEventListener('canplay', setStartOffset);

      // When the audio loops or restarts, ensure it doesn't replay the quiet 11-second intro
      this.audio.addEventListener('timeupdate', () => {
        if (
          this.audio &&
          this.audio.currentTime < SoundtrackService.INTRO_OFFSET_SECONDS &&
          !this.audio.seeking &&
          this.isPlayingState
        ) {
          try {
            this.audio.currentTime = SoundtrackService.INTRO_OFFSET_SECONDS;
          } catch {
            // Safe catch
          }
        }
      });

      this.audio.addEventListener('play', () => {
        this.isPlayingState = true;
        this.notify();
      });

      this.audio.addEventListener('pause', () => {
        this.isPlayingState = false;
        this.notify();
      });

      this.audio.addEventListener('ended', () => {
        this.isPlayingState = false;
        this.notify();
      });
    } catch {
      // Audio not supported in environment
    }
  }

  private setupWebAudioNodes() {
    if (this.isConnected || !this.audio || typeof window === 'undefined') return;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      this.audioCtx = new AudioContextClass();
      const source = this.audioCtx.createMediaElementSource(this.audio);

      // Low-pass Biquad Filter: cuts off trebles during the loading screen
      this.filterNode = this.audioCtx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      // Low warm frequency (1300 Hz)
      this.filterNode.frequency.setValueAtTime(
        this.isMuffledState ? 1300 : 20000,
        this.audioCtx.currentTime
      );
      this.filterNode.Q.setValueAtTime(1.0, this.audioCtx.currentTime);

      this.gainNode = this.audioCtx.createGain();
      // Gain starts at 0 since website is initially muted
      this.gainNode.gain.setValueAtTime(this.isMutedState ? 0 : 1, this.audioCtx.currentTime);

      source.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.isConnected = true;
    } catch {
      // Fallback to standard HTMLAudioElement if Web Audio fails
    }
  }

  public async resumeContext() {
    this.setupWebAudioNodes();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch {
        // Safe catch
      }
    }
  }

  /**
   * Set muffled state:
   * true = Low-pass filter active (1300 Hz) - deep bass rumble for loading screen
   * false = Trebles open (20,000 Hz) - full explosive sound for dramatic intro & pass
   */
  public setMuffled(muffled: boolean, rampSeconds = 0.45) {
    this.isMuffledState = muffled;
    this.resumeContext();

    if (this.filterNode && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      const targetFreq = muffled ? 1300 : 20000;
      this.filterNode.frequency.cancelScheduledValues(now);
      this.filterNode.frequency.setTargetAtTime(targetFreq, now, rampSeconds / 3);
    }
    this.notify();
  }

  /**
   * Opens trebles immediately (called when introduction starts)
   */
  public openTreble(rampSeconds = 0.4) {
    if (this.audio && this.audio.currentTime < SoundtrackService.INTRO_OFFSET_SECONDS) {
      try {
        this.audio.currentTime = SoundtrackService.INTRO_OFFSET_SECONDS;
      } catch {
        // Safe catch
      }
    }
    this.setMuffled(false, rampSeconds);
  }

  /**
   * Closes trebles back to muffled bass (called during loading screen)
   */
  public closeToBass(rampSeconds = 0.3) {
    this.setMuffled(true, rampSeconds);
  }

  public async play(): Promise<boolean> {
    if (!this.audio) return false;
    await this.resumeContext();
    if (this.audio.currentTime < SoundtrackService.INTRO_OFFSET_SECONDS) {
      try {
        this.audio.currentTime = SoundtrackService.INTRO_OFFSET_SECONDS;
      } catch {
        // Safe catch
      }
    }
    try {
      this.audio.muted = this.isMutedState;
      await this.audio.play();
      this.isPlayingState = true;
      this.notify();
      return true;
    } catch {
      try {
        this.audio.muted = true;
        await this.audio.play();
        this.isPlayingState = true;
      } catch {
        this.isPlayingState = false;
      }
      this.notify();
      return false;
    }
  }

  /**
   * Toggles mute without stopping the audio playback.
   */
  public toggleMute(): void {
    if (!this.audio) return;
    this.resumeContext();

    this.isMutedState = !this.isMutedState;
    this.audio.muted = this.isMutedState;

    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(
        this.isMutedState ? 0 : 1,
        this.audioCtx.currentTime
      );
    }

    if (!this.isMutedState) {
      this.play().catch(() => {});
    }

    this.notify();
  }

  public get isPlaying(): boolean {
    return this.isPlayingState;
  }

  public get isMuted(): boolean {
    return this.isMutedState;
  }

  public get isMuffled(): boolean {
    return this.isMuffledState;
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener(this.isPlayingState, this.isMutedState, this.isMuffledState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.isPlayingState, this.isMutedState, this.isMuffledState);
      } catch {
        // Safe dispatch
      }
    });
  }
}

export const soundtrackService = new SoundtrackService();
