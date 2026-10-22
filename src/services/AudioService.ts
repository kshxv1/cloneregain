/**
 * Ambient Audio Synthesizer using Web Audio API
 * Generates procedural calm ambient noise: Rain, Brown noise, Waves, Lo-fi drone, and Bell chimes.
 * Requires zero external audio files.
 */

class AudioService {
  private ctx: AudioContext | null = null;
  private currentSourceNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private currentPreset = 'None';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(preset: string, volume = 0.5) {
    if (preset === 'None') {
      this.stop();
      return;
    }

    this.initContext();
    if (!this.ctx) return;

    this.stop();
    this.currentPreset = preset;
    this.isPlaying = true;

    // Master gain
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume * 0.35, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    if (preset === 'Rain') {
      this.startRainSound(this.gainNode);
    } else if (preset === 'Brown noise') {
      this.startBrownNoise(this.gainNode);
    } else if (preset === 'Waves') {
      this.startOceanWaves(this.gainNode);
    } else if (preset === 'Library' || preset === 'Lo-fi') {
      this.startLofiDrone(this.gainNode);
    }
  }

  setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(volume * 0.35, this.ctx.currentTime, 0.1);
    }
  }

  stop() {
    if (this.currentSourceNode) {
      try {
        (this.currentSourceNode as AudioBufferSourceNode).stop?.();
        this.currentSourceNode.disconnect();
      } catch {
        // Ignore disconnect errors
      }
      this.currentSourceNode = null;
    }
    this.isPlaying = false;
    this.currentPreset = 'None';
  }

  // Play a soft Tibetan singing bowl / meditation chime on timer completion
  playBell() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, now); // 528 Hz "Transformation & Miracles" Solfeggio frequency
      osc.frequency.exponentialRampToValueAtTime(520, now + 3);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 3.6);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  private startBrownNoise(destination: GainNode) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // boost volume
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(destination);
    whiteNoise.start(0);
    this.currentSourceNode = whiteNoise;
  }

  private startRainSound(destination: GainNode) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(destination);
    whiteNoise.start(0);
    this.currentSourceNode = whiteNoise;
  }

  private startOceanWaves(destination: GainNode) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.0;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter modulated by an LFO for wave swelling
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec wave period

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    whiteNoise.connect(filter);
    filter.connect(destination);
    whiteNoise.start(0);
    this.currentSourceNode = whiteNoise;
  }

  private startLofiDrone(destination: GainNode) {
    if (!this.ctx) return;
    // Harmonic warm drone (F minor chord: F2, C3, Ab3)
    const freqs = [87.31, 130.81, 207.65];
    const oscGroup = this.ctx.createGain();
    oscGroup.gain.setValueAtTime(0.3, this.ctx.currentTime);

    freqs.forEach(freq => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.connect(oscGroup);
      osc.start();
    });

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    oscGroup.connect(filter);
    filter.connect(destination);
    this.currentSourceNode = oscGroup;
  }
}

export const audioService = new AudioService();
