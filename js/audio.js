(function (root) {
  'use strict';

  const PalX = (root.PalX = root.PalX || {});

  const TRACKS = {
    title: {
      tempo: 420,
      flute: [62, 65, 69, 72, 69, null, 65, 62, 60, 62, 65, 69, 65, null, 62, null],
      pluck: [50, 57, 62, 65, 48, 55, 60, 64, 46, 53, 58, 62, 50, 57, 62, 57]
    },
    town: {
      tempo: 280,
      flute: [67, 69, 72, 74, 76, 74, 72, 69, 67, 64, 67, 69, 64, null, 62, null],
      pluck: [48, 55, 60, 64, 53, 57, 60, 64, 55, 59, 62, 67, 48, 55, 60, 55]
    },
    dungeon: {
      tempo: 460,
      flute: [57, null, 60, 64, 62, null, 57, null, 55, null, 57, 60, 52, null, null, null],
      pluck: [45, 52, 57, null, 43, 50, 55, null, 41, 48, 53, null, 40, 47, 52, null]
    },
    battle: {
      tempo: 185,
      flute: [69, 69, 72, 74, 76, 74, 72, 69, 67, 69, 72, 67, 69, null, 64, 67],
      pluck: [45, 57, 45, 57, 43, 55, 43, 55, 41, 53, 43, 55, 45, 52, 57, 45],
      drum: true
    },
    boss: {
      tempo: 155,
      flute: [74, 76, 77, 76, 74, 72, 69, 72, 74, 77, 81, 77, 76, 74, 72, 69],
      pluck: [38, 50, 38, 50, 41, 53, 41, 53, 43, 55, 43, 55, 38, 50, 45, 38],
      drum: true
    },
    sad: {
      tempo: 520,
      flute: [69, 72, 69, 65, 62, null, 60, 62, 65, 69, 65, 62, 57, null, null, null],
      pluck: [50, 57, 62, null, 46, 53, 58, null, 48, 55, 60, null, 45, 52, 57, null]
    }
  };

  function midiToFreq(m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.currentTrack = null;
      this.step = 0;
      this.timer = null;
    }

    init() {
      if (this.ctx || typeof window === 'undefined') return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try {
        this.ctx = new AC();
      } catch (e) {
        this.ctx = null;
      }
    }

    resume() {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      if (!this.enabled) {
        this.stopMusic();
      } else {
        this.resume();
        if (this.currentTrack) {
          const t = this.currentTrack;
          this.currentTrack = null;
          this.playMusic(t);
        }
      }
      return this.enabled;
    }

    playMusic(trackName) {
      if (!TRACKS[trackName]) return;
      if (this.currentTrack === trackName && this.timer) return;
      this.currentTrack = trackName;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      if (!this.enabled || typeof window === 'undefined') return;
      this.step = 0;
      const track = TRACKS[trackName];
      this.timer = setInterval(() => {
        if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
        const idx = this.step % track.flute.length;
        const fNote = track.flute[idx];
        const pNote = track.pluck[idx];
        if (fNote) this.playFlute(midiToFreq(fNote), track.tempo / 1000 * 0.95, 0.045);
        if (pNote) this.playPluck(midiToFreq(pNote), track.tempo / 1000 * 1.1, 0.04);
        if (track.drum && idx % 2 === 0) {
          this.playDrum(idx % 4 === 0 ? 85 : 130, 0.05);
        }
        this.step++;
      }, track.tempo);
    }

    stopMusic() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }

    playFlute(freq, dur, vol) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const vib = this.ctx.createOscillator();
      const vibGain = this.ctx.createGain();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      vib.frequency.setValueAtTime(5.2, now);
      vibGain.gain.setValueAtTime(freq * 0.012, now);
      vib.connect(vibGain);
      vibGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(vol, now + Math.min(0.07, dur * 0.25));
      gain.gain.exponentialRampToValueAtTime(0.0008, now + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      vib.start(now);
      osc.stop(now + dur + 0.02);
      vib.stop(now + dur + 0.02);
    }

    playPluck(freq, dur, vol) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    }

    playDrum(freq, vol) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.14);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    }

    sfx(type) {
      if (!this.enabled) return;
      this.resume();
      if (!this.ctx || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;

      if (type === 'cursor') {
        this.playPluck(660, 0.06, 0.04);
      } else if (type === 'confirm') {
        this.playPluck(587, 0.09, 0.055);
        setTimeout(() => this.playPluck(880, 0.14, 0.055), 55);
      } else if (type === 'item') {
        // 仙劍1經典獲得寶物五音上行音效!
        const notes = [523.25, 587.33, 659.25, 783.99, 1046.5];
        notes.forEach((f, i) => {
          setTimeout(() => this.playPluck(f, 0.18, 0.065), i * 65);
        });
      } else if (type === 'slash' || type === 'whip') {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(type === 'whip' ? 920 : 520, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.14);
        g.gain.setValueAtTime(0.06, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'magic') {
        [523, 659, 784, 987, 1175].forEach((f, i) => {
          setTimeout(() => this.playFlute(f, 0.22, 0.045), i * 45);
        });
      } else if (type === 'heal') {
        [440, 523, 659, 880].forEach((f, i) => {
          setTimeout(() => this.playPluck(f, 0.25, 0.055), i * 70);
        });
      } else if (type === 'hit') {
        this.playDrum(120, 0.085);
      } else if (type === 'levelup') {
        const notes = [523.25, 659.25, 783.99, 1046.5, 987.77, 1174.66];
        notes.forEach((f, i) => {
          setTimeout(() => this.playPluck(f, 0.26, 0.075), i * 85);
        });
      }
    }
  }

  PalX.audio = new SoundEngine();
})(typeof window !== 'undefined' ? window : globalThis);
