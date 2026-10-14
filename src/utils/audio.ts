// Web Audio procedural sound synthesizer & Speech Synthesis engine for Jayce's voice and Fortune soundscape

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  public initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      stopSpeaking();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Realistic mechanical fortune wheel tick sound (wood/acrylic peg snap)
  public playTick(pitchMultiplier: number = 1.0, volume: number = 0.35) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // 1. Transient click
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.015);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1400 * Math.max(0.6, pitchMultiplier), now);
      noiseFilter.Q.setValueAtTime(3, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(volume * 0.45, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);

      // 2. Body pop (damped tone)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const baseFreq = 420 * pitchMultiplier;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.035);

      oscGain.gain.setValueAtTime(volume * 0.6, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  // Deep dramatic tension rumble when entering the final millimeters
  public playDramaticSuspense() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 2.5);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 3.1);
    } catch {}
  }

  // Heartbeat thud during slow motion ticks
  public playHeartbeat() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  // "Мимо на миллиметр" shock chord
  public playMissTone() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const freqs = [180, 214, 256];
      freqs.forEach((f) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);

        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + 1.8);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + 2.1);
      });
    } catch {}
  }

  // Walkie-talkie radio beep
  public playRadioBeep() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  // Celebratory warm brotherly victory chords
  public playCelebrationChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const notes = [261.63, 329.63, 392.0, 523.25, 659.25];
      notes.forEach((freq, idx) => {
        const noteStart = now + idx * 0.1;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.25, noteStart + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 1.8);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 1.9);
      });
    } catch {}
  }
}

export const sound = new SoundEngine();

// Mobile tactile vibration helper
export function triggerHaptic(durationMs = 18) {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(durationMs);
    } catch {}
  }
}

// Clean text for speech synthesis: strips special symbols, dashes, slashes, bullets so speech sounds natural
export function sanitizeTextForSpeech(raw: string): string {
  return raw
    .replace(/[«»""''„“”]/g, '')
    .replace(/[—–-]/g, ' ')
    .replace(/[*★#№]/g, '')
    .replace(/[/\\|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// SPEECH SYNTHESIS ENGINE (Natural, masculine Russian voice for Jayce: pitch 0.9, rate 1.05)
let currentSpeechUtterance: SpeechSynthesisUtterance | null = null;

export function speakRussianText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  try {
    window.speechSynthesis.cancel();
    sound.initContext();
    sound.playRadioBeep();

    const cleanText = sanitizeTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ru-RU';
    utterance.rate = 1.05; // Energetic, modern natural tempo
    utterance.pitch = 0.9; // Confident, masculine older brother pitch

    // Choose best available Russian voice
    const voices = window.speechSynthesis.getVoices();
    const ruVoice =
      voices.find(
        (v) =>
          (v.lang.toLowerCase().startsWith('ru') || v.lang.toLowerCase().includes('ru')) &&
          (v.name.toLowerCase().includes('yuri') ||
            v.name.toLowerCase().includes('google') ||
            v.name.toLowerCase().includes('pavel') ||
            v.name.toLowerCase().includes('dmitri'))
      ) ||
      voices.find(
        (v) => v.lang.toLowerCase().startsWith('ru') || v.lang.toLowerCase().includes('ru')
      );

    if (ruVoice) {
      utterance.voice = ruVoice;
    }

    utterance.onstart = () => {
      currentSpeechUtterance = utterance;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      currentSpeechUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      currentSpeechUtterance = null;
      if (onEnd) onEnd();
    };

    currentSpeechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      currentSpeechUtterance = null;
    } catch {}
  }
}

export function isCurrentlySpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking;
}
