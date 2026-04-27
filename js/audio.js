/* ============================================================
   FlowState — Audio Engine
   Web Audio API: 40Hz Binaural Beats, Brown Noise, NSDR Ambient
   
   All audio is synthesized in-browser. No external files.
   Uses separate gain nodes per source to avoid scheduling conflicts.
   ============================================================ */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.currentMode = 'silence'; // 'binaural' | 'brown' | 'silence'
    this.activeSource = null;     // { nodes: [], gain: GainNode }
    this.initialized = false;
    this.nsdrPlaying = false;
    this.nsdrNodes = null;
  }

  async init() {
    if (this.initialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      this.initialized = true;
    })();
    
    return this.initPromise;
  }

  /* ---- Mode Cycling ---- */

  getMode() {
    return this.currentMode;
  }

  async cycleMode() {
    await this.init();
    const modes = ['binaural', 'brown', 'silence'];
    const idx = modes.indexOf(this.currentMode);
    const next = modes[(idx + 1) % modes.length];
    await this.setMode(next);
    return next;
  }

  async setMode(mode) {
    if (mode === this.currentMode && this.activeSource) return;

    await this.init();
    if (this.ctx.state === 'suspended') await this.ctx.resume();

    // Fade out and disconnect old source
    if (this.activeSource) {
      const old = this.activeSource;
      old.gain.gain.cancelScheduledValues(this.ctx.currentTime);
      old.gain.gain.setValueAtTime(old.gain.gain.value, this.ctx.currentTime);
      old.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);
      setTimeout(() => {
        old.nodes.forEach(n => { try { n.stop(); } catch(e){} try { n.disconnect(); } catch(e){} });
        try { old.gain.disconnect(); } catch(e){}
      }, 1000);
      this.activeSource = null;
    }

    this.currentMode = mode;

    if (mode === 'binaural') this._startBinaural();
    else if (mode === 'brown') this._startBrownNoise();
  }

  /* ---- Binaural Beats (40Hz) ---- */
  /*  Two sine oscillators panned left/right.
      200Hz left, 240Hz right → 40Hz beat.
      40Hz gamma is associated with heightened attention & memory consolidation.
      Ref: Jirakittayakorn & Wongsawat, 2017 — Frontiers in Neuroscience */

  _startBinaural() {
    const masterGain = this.ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(this.ctx.destination);

    const merger = this.ctx.createChannelMerger(2);
    merger.connect(masterGain);

    const oscL = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.value = 200;
    const gainL = this.ctx.createGain();
    gainL.gain.value = 0.7; 
    oscL.connect(gainL);
    gainL.connect(merger, 0, 0);

    const oscR = this.ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.value = 240;
    const gainR = this.ctx.createGain();
    gainR.gain.value = 0.7; 
    oscR.connect(gainR);
    gainR.connect(merger, 0, 1);

    oscL.start();
    oscR.start();

    // Fade in
    masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 2);

    this.activeSource = {
      nodes: [oscL, oscR, gainL, gainR, merger],
      gain: masterGain
    };
  }

  /* ---- Brown Noise ---- */
  /*  Integrated white noise with low-pass filter.
      Lower frequencies promote relaxed concentration without masking speech.
      Ref: Rausch et al., 2014 — Journal of Cognitive Neuroscience */

  _startBrownNoise() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 280;
    filter.Q.value = 0.7;

    const masterGain = this.ctx.createGain();
    masterGain.gain.value = 0;

    source.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(this.ctx.destination);

    source.start();

    // Fade in
    masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.75, this.ctx.currentTime + 2); // Boosted from 0.35

    this.activeSource = {
      nodes: [source, filter],
      gain: masterGain
    };
  }

  /* ---- NSDR Ambient (10 minutes) ---- */
  /*  Layered Solfeggio tones (174Hz, 285Hz) with slow LFO tremolo.
      NSDR (Non-Sleep Deep Rest) protocol — Huberman Lab.
      Promotes parasympathetic activation and dopamine replenishment. */

  startNSDR(onComplete) {
    this.init();
    if (this.nsdrPlaying) return;
    this.nsdrPlaying = true;

    const duration = 600;
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(this.ctx.destination);

    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 174;

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 285;

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.025;
    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);

    const g1 = this.ctx.createGain();
    g1.gain.value = 0.07;
    const g2 = this.ctx.createGain();
    g2.gain.value = 0.04;

    osc1.connect(g1);
    osc2.connect(g2);
    g1.connect(gainNode);
    g2.connect(gainNode);

    osc1.start();
    osc2.start();
    lfo.start();

    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 12); // Boosted from 0.15
    gainNode.gain.setValueAtTime(0.4, this.ctx.currentTime + duration - 12);
    gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);

    osc1.stop(this.ctx.currentTime + duration);
    osc2.stop(this.ctx.currentTime + duration);
    lfo.stop(this.ctx.currentTime + duration);

    this.nsdrNodes = { gainNode, nodes: [osc1, osc2, lfo, g1, g2, lfoGain] };

    setTimeout(() => {
      this.nsdrPlaying = false;
      this.nsdrNodes = null;
      if (onComplete) onComplete();
    }, duration * 1000);
  }

  stopNSDR() {
    if (!this.nsdrPlaying || !this.nsdrNodes) return;
    const { gainNode, nodes } = this.nsdrNodes;
    gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
    setTimeout(() => {
      nodes.forEach(n => { try { n.stop(); } catch(e){} try { n.disconnect(); } catch(e){} });
      try { gainNode.disconnect(); } catch(e){}
      this.nsdrPlaying = false;
      this.nsdrNodes = null;
    }, 2500);
  }

  /* ---- Cleanup ---- */

  destroy() {
    this.setMode('silence');
    this.stopNSDR();
    if (this.ctx) this.ctx.close();
    this.initialized = false;
  }

  playFocusBell() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Fundamental: 432Hz sine
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 432;
    
    const gain1 = this.ctx.createGain();
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.9, now + 0.05); // Boosted from 0.4
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 3); // exponential decay
    
    // Harmonic octave: 864Hz sine
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 864;
    
    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.1, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 2);
    
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 3);
    osc2.stop(now + 3);
  }

  playBreakBell() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // 528Hz healing/resolution frequency
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 528;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.6, now + 0.1); // Boosted from 0.25
    gain.gain.exponentialRampToValueAtTime(0.001, now + 4); // longer ring
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 4);
  }

  playRestBell() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Gentle tibetan bowl — 396Hz with harmonic
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 396;
    
    const gain1 = this.ctx.createGain();
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.5, now + 0.08); // Boosted from 0.2
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
    
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 792;
    
    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.06, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
    
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 3.5);
    osc2.stop(now + 2.5);
  }

  playInhaleChime() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Low tone — signals inhale
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 280;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.06); // Boosted from 0.15
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 1.8);
  }

  playExhaleChime() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // High tone — signals exhale
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 528;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.06); // Boosted from 0.12
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 2);
  }
}

window.audioEngine = new AudioEngine();
