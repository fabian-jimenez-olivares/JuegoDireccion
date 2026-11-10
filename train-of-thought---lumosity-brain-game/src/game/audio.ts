/**
 * Train of Thought - Web Audio API Synthesizer & Haptic Controller
 * Produces crisp mechanical clicks, steam chugs, harmonious chimes, and haptic feedback.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private hapticsEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setHaptics(enabled: boolean) {
    this.hapticsEnabled = enabled;
  }

  public getHaptics(): boolean {
    return this.hapticsEnabled;
  }

  public triggerHaptic(pattern: number | number[] = 20) {
    if (!this.hapticsEnabled) return;
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Haptics not available in some sandbox frames, ignore gracefully
    }
  }

  /**
   * Crisp mechanical click when flipping a track switch lever
   */
  public playSwitchClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.triggerHaptic(25);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);

    // Follow-up mechanical tooth snap
    const snap = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snap.type = 'square';
    snap.frequency.setValueAtTime(1600, now + 0.015);
    snap.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    snapGain.gain.setValueAtTime(0.12, now + 0.015);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    snap.connect(snapGain);
    snapGain.connect(this.ctx.destination);

    snap.start(now + 0.015);
    snap.stop(now + 0.05);
  }

  /**
   * Harmonious chime when a train reaches its matching colored station
   */
  public playSuccessDelivery(streak: number = 1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.triggerHaptic([30, 40, 40]);

    const now = this.ctx.currentTime;
    const baseFreq = 523.25; // C5
    // Elevate pitch with streak
    const noteMultipliers = [1, 1.25, 1.5, 1.75, 2.0];
    const pitch = baseFreq * (noteMultipliers[Math.min(streak - 1, noteMultipliers.length - 1)] || 1);

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(pitch, now);
    osc1.frequency.exponentialRampToValueAtTime(pitch * 1.5, now + 0.15);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(pitch * 2, now + 0.05);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.36);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.36);
  }

  /**
   * Soft warning buzzer when a train enters the wrong station
   */
  public playWrongDelivery() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.triggerHaptic([70, 50, 90]);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Subtle steam train chug-chug sound (called intermittently as train moves)
   */
  public playTrainChug() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // White noise burst filtered
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now);
    filter.Q.setValueAtTime(3, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(now);
  }

  /**
   * Train steam whistle
   */
  public playWhistle() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(740, now); // F#5
    osc1.frequency.linearRampToValueAtTime(780, now + 0.1);
    osc1.frequency.linearRampToValueAtTime(740, now + 0.35);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(925, now); // A#5
    osc2.frequency.linearRampToValueAtTime(975, now + 0.1);
    osc2.frequency.linearRampToValueAtTime(925, now + 0.35);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.06);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.42);
    osc2.stop(now + 0.42);
  }
}

export const soundEngine = new SoundEngine();
