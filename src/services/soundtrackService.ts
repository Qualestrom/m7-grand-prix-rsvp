// Global audio service for the Formula 1 background soundtrack

export type TrackId = 'hans-zimmer' | 'brian-tyler';

export interface SoundtrackTrack {
  id: TrackId;
  title: string;
  artist: string;
  src: string;
}

export const SOUNDTRACK_TRACKS: SoundtrackTrack[] = [
  {
    id: 'hans-zimmer',
    title: 'F1 Theme',
    artist: 'Hans Zimmer',
    src: '/audio/hans-zimmer-f1.m4a',
  },
  {
    id: 'brian-tyler',
    title: 'F1 Broadcast Theme',
    artist: 'Brian Tyler',
    src: '/audio/f1-theme.mp3',
  },
];

type AudioListener = (
  isPlaying: boolean,
  isMuted: boolean,
  currentTrack: SoundtrackTrack
) => void;

class SoundtrackService {
  private audio: HTMLAudioElement | null = null;
  private isMutedState = false;
  private isPlayingState = false;
  private currentTrackIdState: TrackId = 'hans-zimmer';
  private listeners: Set<AudioListener> = new Set();
  private hasUserInteracted = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
      this.setupGlobalUnlockListeners();
    }
  }

  public get currentTrack(): SoundtrackTrack {
    return (
      SOUNDTRACK_TRACKS.find((t) => t.id === this.currentTrackIdState) ||
      SOUNDTRACK_TRACKS[0]
    );
  }

  private initAudio() {
    try {
      this.audio = new Audio(this.currentTrack.src);
      this.audio.loop = true;
      this.audio.volume = 0.6;
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

  private setupGlobalUnlockListeners() {
    const unlock = () => {
      if (this.hasUserInteracted) return;
      this.hasUserInteracted = true;
      if (!this.isPlayingState && !this.isMutedState) {
        this.play();
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }

  public switchTrack(trackId: TrackId) {
    if (this.currentTrackIdState === trackId && this.audio) return;
    this.currentTrackIdState = trackId;
    const wasPlaying = this.isPlayingState;

    if (this.audio) {
      this.audio.pause();
      this.audio.src = this.currentTrack.src;
      this.audio.currentTime = 0;
      if (wasPlaying) {
        this.audio.play().catch(() => {});
      }
    }
    this.notify();
  }

  public async play(): Promise<boolean> {
    if (!this.audio) return false;
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

  public pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.isPlayingState = false;
    this.notify();
  }

  public toggle(): void {
    if (!this.audio) return;
    if (this.isPlayingState) {
      this.pause();
    } else {
      this.play();
    }
  }

  public toggleMute(): void {
    if (!this.audio) return;
    this.isMutedState = !this.isMutedState;
    this.audio.muted = this.isMutedState;
    if (!this.isMutedState && !this.isPlayingState) {
      this.play();
    }
    this.notify();
  }

  public get isPlaying(): boolean {
    return this.isPlayingState;
  }

  public get isMuted(): boolean {
    return this.isMutedState;
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener(this.isPlayingState, this.isMutedState, this.currentTrack);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const track = this.currentTrack;
    this.listeners.forEach((listener) => {
      try {
        listener(this.isPlayingState, this.isMutedState, track);
      } catch {
        // Safe dispatch
      }
    });
  }
}

export const soundtrackService = new SoundtrackService();
