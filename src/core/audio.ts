/**
 * AudioEngine — 100% procedural Web Audio. Zero audio files, zero copyright.
 * Soft pentatonic chimes rise with the combo, convolved through a generated
 * hall IR; thumps for placements; a quiet wind-drone ambience.
 * AudioContext is created lazily on the first user gesture (autoplay policy).
 */
import type { SaveSettings } from '../game/types';

const PENTA = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0];

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private wet: GainNode | null = null;
  private ambient: { stop: () => void } | null = null;
  private unlocked = false;

  constructor(private settings: SaveSettings) {}

  /** Call from any user-gesture handler (pointerdown once). */
  unlock(): void {
    if (this.unlocked) return;
    this.unlocked = true;
    try {
      this.ensure();
      this.startAmbient();
    } catch {
      /* audio unavailable — game stays fully playable silent */
    }
  }

  private ensure(): AudioContext {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return this.ctx;
    }
    const Ctor: typeof AudioContext =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = this.settings.sound ? 0.9 : 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 24;
    comp.ratio.value = 6;
    comp.attack.value = 0.004;
    comp.release.value = 0.24;
    master.connect(comp);
    comp.connect(ctx.destination);
    this.master = master;

    /* Generated hall reverb (synthetic IR — no samples). */
    const conv = ctx.createConvolver();
    const seconds = 1.6;
    const len = Math.floor(ctx.sampleRate * seconds);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.9);
      }
    }
    conv.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.22;
    wet.connect(conv);
    conv.connect(master);
    this.wet = wet;

    return ctx;
  }

  setMuted(muted: boolean): void {
    if (this.master && this.ctx) {
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setTargetAtTime(muted ? 0 : 0.9, t, 0.05);
    }
    if (muted) this.stopAmbient();
    else if (this.unlocked) this.startAmbient();
  }

  private noiseBuf(): AudioBuffer {
    const ctx = this.ensure();
    if (!this.cachedNoise) {
      /* One shared 2s noise buffer — every short burst reuses it. */
      this.cachedNoise = this.noiseBuffer(ctx, 2.0);
    }
    return this.cachedNoise;
  }

  private cachedNoise: AudioBuffer | null = null;

  private noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  private route(node: AudioNode, dryGain = 1): void {
    const ctx = this.ctx!;
    const master = this.master!;
    if (dryGain >= 1) {
      node.connect(master);
    } else {
      const g = ctx.createGain();
      g.gain.value = dryGain;
      node.connect(g);
      g.connect(master);
    }
    if (this.wet) node.connect(this.wet);
  }

  /* -------------------------------------------------------------- */
  /* SFX                                                             */
  /* -------------------------------------------------------------- */

  /** Rising pentatonic chime — step = current combo (capped). */
  chime(step: number, combo: number): void {
    try {
      const ctx = this.ensure();
      const t = ctx.currentTime;
      const freq = PENTA[Math.min(Math.max(step, 1) - 1, PENTA.length - 1)];
      const bright = 1 + Math.min(combo, 8) * 0.045;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.14 * bright, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);

      const pan = ctx.createStereoPanner();
      pan.pan.value = (Math.random() - 0.5) * 0.5;

      const o1 = ctx.createOscillator();
      o1.type = 'sine';
      o1.frequency.value = freq;
      const o2 = ctx.createOscillator();
      o2.type = 'triangle';
      o2.frequency.value = freq * 2.001;
      const g2 = ctx.createGain();
      g2.gain.value = 0.32;
      o1.connect(g);
      o2.connect(g2);
      g2.connect(g);
      g.connect(pan);
      this.route(pan);

      o1.start(t);
      o2.start(t);
      o1.stop(t + 1.05);
      o2.stop(t + 1.05);
    } catch {
      /* ignore */
    }
  }

  /** Soft wooden thump for a normal placement. */
  thump(): void {
    try {
      const ctx = this.ensure();
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(130, t);
      o.frequency.exponentialRampToValueAtTime(46, t + 0.2);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.42, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      o.connect(g);
      this.route(g, 1);
      o.start(t);
      o.stop(t + 0.26);

      const n = ctx.createBufferSource();
      n.buffer = this.noiseBuf();
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 260;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.14, t);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      n.connect(f);
      f.connect(ng);
      this.route(ng, 1);
      n.start(t);
    } catch {
      /* ignore */
    }
  }

  /** The slice: overhang shearing off. */
  slice(): void {
    try {
      const ctx = this.ensure();
      const t = ctx.currentTime;
      const n = ctx.createBufferSource();
      n.buffer = this.noiseBuf();
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 620 + Math.random() * 260;
      f.Q.value = 1.1;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.09, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
      n.connect(f);
      f.connect(g);
      this.route(g, 0.7);
      n.start(t);
    } catch {
      /* ignore */
    }
  }

  /** Minimal UI tick. */
  uiTick(): void {
    try {
      const ctx = this.ensure();
      const t = ctx.currentTime;
      const n = ctx.createBufferSource();
      n.buffer = this.noiseBuf();
      const f = ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 2400;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      n.connect(f);
      f.connect(g);
      this.route(g, 1);
      n.start(t);
    } catch {
      /* ignore */
    }
  }

  /** Milestone arpeggio. */
  milestone(): void {
    try {
      const ctx = this.ensure();
      [0, 2, 4].forEach((scaleIdx, i) => {
        const t = ctx.currentTime + i * 0.09;
        const freq = PENTA[scaleIdx + 3] ?? PENTA[PENTA.length - 1];
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = freq;
        o.connect(g);
        this.route(g, 0.8);
        o.start(t);
        o.stop(t + 0.85);
      });
    } catch {
      /* ignore */
    }
  }

  /** Soft riser when a run starts. */
  runStart(): void {
    try {
      const ctx = this.ensure();
      const t = ctx.currentTime;
      const n = ctx.createBufferSource();
      n.buffer = this.noiseBuf();
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(220, t);
      f.frequency.exponentialRampToValueAtTime(1400, t + 0.5);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.07, t + 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      n.connect(f);
      f.connect(g);
      this.route(g, 0.6);
      n.start(t);
      window.setTimeout(() => this.chime(1, 0), 260);
    } catch {
      /* ignore */
    }
  }

  /** Low melancholic pad when the tower falls. */
  gameOver(): void {
    try {
      const ctx = this.ensure();
      const t = ctx.currentTime;
      [98, 147.2].forEach((freq, i) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.1 - i * 0.03, t + 0.5);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
        o.connect(g);
        this.route(g, 0.5);
        o.start(t);
        o.stop(t + 2.3);
      });
      window.setTimeout(() => {
        try {
          const ctx2 = this.ensure();
          const t2 = ctx2.currentTime;
          const o = ctx2.createOscillator();
          o.type = 'sine';
          o.frequency.value = PENTA[4] * 0.75;
          const g = ctx2.createGain();
          g.gain.setValueAtTime(0.0001, t2);
          g.gain.exponentialRampToValueAtTime(0.08, t2 + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t2 + 1.4);
          o.connect(g);
          this.route(g, 0.6);
          o.start(t2);
          o.stop(t2 + 1.5);
        } catch {
          /* ignore */
        }
      }, 350);
    } catch {
      /* ignore */
    }
  }

  /* -------------------------------------------------------------- */
  /* Ambience                                                        */
  /* -------------------------------------------------------------- */

  private startAmbient(): void {
    if (this.ambient || !this.settings.sound || !this.ctx || !this.master) return;
    try {
      const ctx = this.ctx;
      const nodes: AudioNode[] = [];

      /* Wind: filtered noise with a slow LFO on the cutoff. */
      const wind = ctx.createBufferSource();
      wind.buffer = this.noiseBuffer(ctx, 2.0);
      wind.loop = true;
      const wf = ctx.createBiquadFilter();
      wf.type = 'lowpass';
      wf.frequency.value = 420;
      const wg = ctx.createGain();
      wg.gain.value = 0.014;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.07;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 0.008;
      lfo.connect(lfoG);
      lfoG.connect(wg.gain);
      wind.connect(wf);
      wf.connect(wg);
      wg.connect(this.master);
      wind.start();
      lfo.start();
      nodes.push(wind, lfo, wf, wg, lfoG);

      /* Drone: two quiet detuned sines. */
      [55, 82.41].forEach((freq, i) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.value = i === 0 ? 0.012 : 0.007;
        const l = ctx.createOscillator();
        l.frequency.value = 0.05 + i * 0.021;
        const lg = ctx.createGain();
        lg.gain.value = 0.004;
        l.connect(lg);
        lg.connect(g.gain);
        o.connect(g);
        g.connect(this.master!);
        o.start();
        l.start();
        nodes.push(o, l, g, lg);
      });

      this.ambient = {
        stop: () => {
          try {
            nodes.forEach((n) => {
              if (n instanceof AudioBufferSourceNode || n instanceof OscillatorNode) n.stop();
              n.disconnect();
            });
          } catch {
            /* ignore */
          }
        },
      };
    } catch {
      this.ambient = null;
    }
  }

  private stopAmbient(): void {
    this.ambient?.stop();
    this.ambient = null;
  }

  dispose(): void {
    this.stopAmbient();
    try {
      void this.ctx?.close();
    } catch {
      /* ignore */
    }
  }
}
