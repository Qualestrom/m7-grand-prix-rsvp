// Audio service for Hans Zimmer's F1 Theme with Low-Pass filter transition

type AudioListener = (isPlaying: boolean, isMuted: boolean, isMuffled: boolean) => void;

class SoundtrackService {
  private audio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private isMutedState = false;
  private isPlayingState = false;
  private isMuffledState = true; // Starts in low-pass muffled mode on loading screen
  private listeners: Set<AudioListener> = new Set();
  private isConnected = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
      this.setupGlobalUnlockListeners();
      // Proactively attempt automatic sound playback on initial load
      this.play().catch(() => {});
    }
  }

  private initAudio() {
    try {
      this.audio = new Audio('/audio/hans-zimmer-f1.m4a');
      this.audio.loop = true;
      this.audio.volume = 0.75;
      this.audio.preload = 'auto';

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
      // Low bass cutoff frequency (360 Hz) for deep, muffled rumble
      this.filterNode.frequency.setValueAtTime(
        this.isMuffledState ? 360 : 20000,
        this.audioCtx.currentTime
      );
      this.filterNode.Q.setValueAtTime(1.2, this.audioCtx.currentTime);

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.isMutedState ? 0 : 1, this.audioCtx.currentTime);

      source.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.isConnected = true;
    } catch {
      // Fallback to standard HTMLAudioElement if Web Audio fails
    }
  }

  private setupGlobalUnlockListeners() {
    const unlock = () => {
      this.resumeContext();
      if (!this.isPlayingState) {
        this.play().catch(() => {});
      }
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  private async resumeContext() {
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
   * true = Low-pass filter active (360 Hz) - deep bass rumble for loading screen
   * false = Trebles open (20,000 Hz) - full explosive sound for dramatic intro & pass
   */
  public setMuffled(muffled: boolean, rampSeconds = 0.45) {
    this.isMuffledState = muffled;
    this.resumeContext();

    if (this.filterNode && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      const targetFreq = muffled ? 360 : 20000;
      this.filterNode.frequency.cancelScheduledValues(now);
      this.filterNode.frequency.setTargetAtTime(targetFreq, now, rampSeconds / 3);
    }
    this.notify();
  }

  /**
   * Opens trebles immediately (called when introduction starts)
   */
  public openTreble(rampSeconds = 0.4) {
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
    try {
      this.audio.muted = this.isMutedState;
      await this.audio.play();
      this.isPlayingState = true;
      this.notify();
      return true;
    } catch {
      this.isPlayingState = false;
      this.notify();
      return false;
    }
  }

  /**
   * Toggles mute without stopping the audio playback.
   * Music continues running in the background while muted.
   */
  public toggleMute(): void {
    if (!this.audio) return;
    this.isMutedState = !this.isMutedState;

    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(
        this.isMutedState ? 0 : 1,
        this.audioCtx.currentTime
      );
    }
    this.audio.muted = this.isMutedState;

    // Keep playing in background even when muted
    if (!this.isPlayingState) {
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
