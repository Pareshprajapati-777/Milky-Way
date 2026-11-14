/**
 * Web Audio API Cosmic Sound Synthesizer Engine
 * Generates ambient space drones, warp swooshes, UI telemetry clicks,
 * and scientifically mapped planetary resonant frequencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientRunning: boolean = false;
  private ambientOscs: OscillatorNode[] = [];
  private planetOsc: OscillatorNode | null = null;
  private planetGain: GainNode | null = null;

  constructor() {
    // Lazy initialize on first interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.35, this.ctx.currentTime, 0.05);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Starts the continuous procedural ambient cosmic drone
   */
  public startAmbientDrone() {
    if (this.isAmbientRunning) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.isAmbientRunning = true;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.ambientGain.gain.exponentialRampToValueAtTime(0.2, this.ctx.currentTime + 3.0);
    this.ambientGain.connect(this.masterGain);

    // Filter for deep warm cosmic void
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);
    filter.connect(this.ambientGain);

    // Deep Sub Bass 55Hz (A1) & 82.4Hz (E2)
    const freqs = [48.0, 55.0, 82.41, 110.0];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Gentle LFO subtle detune
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + idx * 0.05, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);
      lfo.start();

      osc.connect(filter);
      osc.start();
      this.ambientOscs.push(osc);
    });
  }

  /**
   * Plays a cinematic futuristic UI click / confirmation sound
   */
  public playUiClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  /**
   * Plays a holographic hover blip
   */
  public playUiHover() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1800, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  /**
   * Plays a massive Warp Dive / Hyperspace acceleration sound
   */
  public playWarpSwoosh() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const duration = 2.4;

    // Pitch sweep oscillator
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';

    osc.frequency.setValueAtTime(60, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + duration * 0.4);
    osc.frequency.exponentialRampToValueAtTime(90, now + duration);

    // Filter sweep
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(120, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + duration * 0.4);
    filter.frequency.exponentialRampToValueAtTime(150, now + duration);
    filter.Q.setValueAtTime(3.0, now);

    oscGain.gain.setValueAtTime(0.01, now);
    oscGain.gain.exponentialRampToValueAtTime(0.4, now + duration * 0.35);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * Plays a resonant harmonic tone corresponding to a planet's NASA radio frequency
   */
  public playPlanetResonance(freqHz: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    // Fade out previous planet tone if any
    if (this.planetGain && this.planetOsc) {
      try {
        this.planetGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.2);
        this.planetOsc.stop(this.ctx.currentTime + 0.25);
      } catch {
        // ignore
      }
    }

    const now = this.ctx.currentTime;
    this.planetOsc = this.ctx.createOscillator();
    this.planetGain = this.ctx.createGain();

    this.planetOsc.type = 'sine';
    this.planetOsc.frequency.setValueAtTime(freqHz, now);

    this.planetGain.gain.setValueAtTime(0.01, now);
    this.planetGain.gain.linearRampToValueAtTime(0.18, now + 0.4);
    this.planetGain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

    this.planetOsc.connect(this.planetGain);
    this.planetGain.connect(this.masterGain);

    this.planetOsc.start(now);
    this.planetOsc.stop(now + 3.6);
  }
}

export const soundEngine = new SoundEngine();
