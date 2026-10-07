/**
 * Divine Web Audio Engine & Generative Sacred Synthesizer
 * Generates pristine acoustic Tanpura drones, Bansuri resonances, Santoor shimmers,
 * and temple bell acoustics with real-time Web Audio Analyser node for waveforms.
 */

class DevotionalAudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentTrackId: string | null = null;
  private activeNodes: (OscillatorNode | AudioNode)[] = [];
  private sequenceTimer: number | null = null;
  private playbackStartTime: number = 0;
  private currentTime: number = 0;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private previewLimitSeconds: number = 30;
  private isPreviewOnly: boolean = false;
  private onTimeUpdateCallback: ((time: number, isPreviewEnded: boolean) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;

  constructor() {
    // Lazy initialize on first interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.85;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getAnalyser(): AnalyserNode | null {
    this.initContext();
    return this.analyser;
  }

  public getFrequencyData(dataArray: Uint8Array): void {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(dataArray);
    } else {
      dataArray.fill(0);
    }
  }

  public getWaveformData(dataArray: Uint8Array): void {
    if (this.analyser) {
      this.analyser.getByteTimeDomainData(dataArray);
    } else {
      dataArray.fill(128);
    }
  }

  public playTrack(
    trackId: string,
    keyNote: string = 'C#',
    isPreview: boolean = true,
    startTime: number = 0,
    onTimeUpdate?: (time: number, isPreviewEnded: boolean) => void,
    onEnded?: () => void
  ) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.stop();

    this.isPlaying = true;
    this.currentTrackId = trackId;
    this.isPreviewOnly = isPreview;
    this.currentTime = startTime;
    this.playbackStartTime = Date.now() - (startTime * 1000);
    this.onTimeUpdateCallback = onTimeUpdate || null;
    this.onEndedCallback = onEnded || null;

    const baseFreq = this.parseKeyNote(keyNote);

    // 1. Tanpura Root & Fifth drone layer (rich acoustic harmonic spectrum)
    this.createTanpuraDrone(baseFreq);

    // 2. Meditative Bansuri / Melodic phrasing sequence in classical Raga intervals
    this.startMelodicSequence(baseFreq);

    // 3. Sacred Temple Bell shimmer
    this.playTempleBell(baseFreq * 4);

    // Timer loop for time updating & preview limit enforcement
    this.sequenceTimer = window.setInterval(() => {
      if (!this.isPlaying) return;
      this.currentTime += 0.25;

      const isPreviewExceeded = this.isPreviewOnly && this.currentTime >= this.previewLimitSeconds;

      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.currentTime, isPreviewExceeded);
      }

      if (isPreviewExceeded) {
        this.stop();
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      }
    }, 250);
  }

  public pause() {
    this.isPlaying = false;
    if (this.sequenceTimer) {
      clearInterval(this.sequenceTimer);
      this.sequenceTimer = null;
    }
    this.stopNodes();
  }

  public resume(keyNote: string = 'C#') {
    if (this.currentTrackId) {
      this.playTrack(
        this.currentTrackId,
        keyNote,
        this.isPreviewOnly,
        this.currentTime,
        this.onTimeUpdateCallback || undefined,
        this.onEndedCallback || undefined
      );
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.sequenceTimer) {
      clearInterval(this.sequenceTimer);
      this.sequenceTimer = null;
    }
    this.stopNodes();
  }

  public seek(seconds: number, keyNote: string = 'C#') {
    this.currentTime = seconds;
    if (this.isPlaying && this.currentTrackId) {
      this.playTrack(
        this.currentTrackId,
        keyNote,
        this.isPreviewOnly,
        seconds,
        this.onTimeUpdateCallback || undefined,
        this.onEndedCallback || undefined
      );
    }
  }

  private stopNodes() {
    this.activeNodes.forEach(node => {
      try {
        if ('stop' in node && typeof node.stop === 'function') {
          node.stop();
        }
        node.disconnect();
      } catch {
        // Node already stopped
      }
    });
    this.activeNodes = [];
  }

  private parseKeyNote(note: string): number {
    // Tuned base frequencies for Indian classical drones
    const noteMap: Record<string, number> = {
      'C': 130.81,
      'C#': 136.1, // Sacred Om cosmic octave frequency
      'D': 146.83,
      'D#': 155.56,
      'E': 164.81,
      'F': 174.61,
      'F#': 185.00,
      'G': 196.00,
      'A': 220.00,
      'B': 246.94
    };
    const key = Object.keys(noteMap).find(k => note.toUpperCase().includes(k)) || 'C#';
    return noteMap[key] || 136.1;
  }

  private createTanpuraDrone(rootFreq: number) {
    if (!this.ctx || !this.masterGain) return;

    // Pa (Fifth), Sa (Octave), Sa (Octave), Sa (Root) strings
    const strings = [
      rootFreq * 1.5,   // Pa (Fifth)
      rootFreq * 2.0,   // High Sa
      rootFreq * 2.0,   // High Sa
      rootFreq          // Kharja Sa (Root)
    ];

    strings.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Rich sawtooth filtered to warm wooden resonance
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.random() * 0.4 - 0.2), this.ctx.currentTime);

      // Lowpass warmth
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650 + idx * 80, this.ctx.currentTime);
      filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      // Organic slow amplitude breathing (swar oscillation)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.15 + idx * 0.08, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      lfo.connect(gain.gain);
      lfo.start();

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();

      this.activeNodes.push(osc, gain, filter, lfo, lfoGain);
    });
  }

  private startMelodicSequence(rootFreq: number) {
    if (!this.ctx || !this.masterGain) return;

    // Classical Indian Raga Scale Intervals (Sa, Re, Ga, Ma, Pa, Dha, Ni, Sa)
    const scaleRatios = [1, 9 / 8, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 15 / 8, 2];
    
    let step = 0;
    const playNextNote = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      const ratio = scaleRatios[step % scaleRatios.length];
      const noteFreq = rootFreq * ratio * 2; // Bansuri / Flute range

      this.playFluteNote(noteFreq, 1.8);

      step = (step + Math.floor(Math.random() * 3) + 1) % scaleRatios.length;

      const nextInterval = 1400 + Math.random() * 800;
      if (this.isPlaying) {
        setTimeout(playNextNote, nextInterval);
      }
    };

    setTimeout(playNextNote, 600);
  }

  private playFluteNote(freq: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Warm bansuri vibrato
    vibrato.frequency.setValueAtTime(5.2, this.ctx.currentTime);
    vibratoGain.gain.setValueAtTime(freq * 0.015, this.ctx.currentTime);
    vibrato.connect(osc.frequency);
    vibrato.start();

    // Attack, Decay, Sustain, Release (Smooth devotional flute breath)
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.08, now + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.1);
    vibrato.stop(now + duration + 0.1);

    this.activeNodes.push(osc, gain, vibrato, vibratoGain);
  }

  public playTempleBell(freq: number = 880) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Metallic chime envelope
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 3.2);

    this.activeNodes.push(osc, gain);
  }
}

export const audioEngine = new DevotionalAudioEngine();
