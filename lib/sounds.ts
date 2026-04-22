type SoundType = 'correct' | 'wrong' | 'timer' | 'levelup' | 'badge';

const SOUND_MUTED_KEY = 'eng-app-sound-muted';

class SoundManager {
  private ctx: AudioContext | null = null;
  private buffers: Map<SoundType, AudioBuffer> = new Map();
  private muted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(SOUND_MUTED_KEY);
        this.muted = stored === 'true';
      } catch { /* ignore */ }
    }
  }

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return this.ctx;
  }

  /** Programmatically generate simple tones (no external files needed) */
  private generateTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainValue: number = 0.3
  ): void {
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    gainNode.gain.setValueAtTime(gainValue, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  play(sound: SoundType): void {
    if (this.muted || typeof window === 'undefined') return;
    try {
      switch (sound) {
        case 'correct':
          this.generateTone(523.25, 0.15, 'sine', 0.3); // C5
          setTimeout(() => this.generateTone(659.25, 0.2, 'sine', 0.3), 100); // E5
          break;
        case 'wrong':
          this.generateTone(220, 0.3, 'sawtooth', 0.2); // A3 buzzer
          break;
        case 'timer':
          this.generateTone(800, 0.05, 'square', 0.1);
          break;
        case 'levelup':
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
            setTimeout(() => this.generateTone(freq, 0.2, 'sine', 0.35), i * 120);
          });
          break;
        case 'badge':
          [659.25, 783.99, 987.77].forEach((freq, i) => {
            setTimeout(() => this.generateTone(freq, 0.18, 'sine', 0.3), i * 100);
          });
          break;
      }
    } catch { /* AudioContext may be blocked before user gesture */ }
  }

  mute(): void {
    this.muted = true;
    try { localStorage.setItem(SOUND_MUTED_KEY, 'true'); } catch { /* ignore */ }
  }

  unmute(): void {
    this.muted = false;
    try { localStorage.setItem(SOUND_MUTED_KEY, 'false'); } catch { /* ignore */ }
  }

  toggle(): boolean {
    if (this.muted) { this.unmute(); return false; }
    else { this.mute(); return true; }
  }

  get isMuted(): boolean { return this.muted; }
}

// Singleton instance
export const soundManager = typeof window !== 'undefined' ? new SoundManager() : null;

export function playSound(sound: SoundType): void {
  soundManager?.play(sound);
}
