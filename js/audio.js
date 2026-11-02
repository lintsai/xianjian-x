(function (root) {
  'use strict';

  const PalX = (root.PalX = root.PalX || {});

  // 16首原創東方仙俠長篇配樂（32~48拍 A-B 雙樂段結構，支援古箏、竹笛、洞簫、二胡、琵琶、編鐘玉磬、堂鼓木魚）
  const TRACKS = {
    title: {
      title: '燼月長歌',
      subtitle: '主題序曲 · 望舒天闕',
      mood: '蒼茫悠遠',
      instruments: '洞簫 · 古箏 · 玉磬',
      tempo: 390,
      leadInst: 'xiao',
      accInst: 'guzheng',
      lead: [
        62, 65, 69, 72, 74, 72, 69, null, 65, 67, 69, 65, 62, null, null, null,
        69, 72, 74, 77, 76, 74, 72, 69, 67, 69, 65, 62, 64, 62, null, null
      ],
      acc: [
        50, 57, 62, 65, 48, 55, 60, 64, 46, 53, 58, 62, 45, 52, 57, 62,
        46, 53, 58, 65, 48, 55, 60, 67, 50, 57, 62, 65, 50, 57, 62, null
      ],
      chime: [
        74, null, null, null, null, null, null, null, 72, null, null, null, null, null, null, null,
        81, null, null, null, null, null, null, null, 74, null, null, null, null, null, null, null
      ]
    },
    ferry_town: {
      title: '煙波聽雨',
      subtitle: '煙波鎮 · 聽雨渡',
      mood: '江南晨煙',
      instruments: '竹笛 · 古箏',
      tempo: 285,
      leadInst: 'dizi',
      accInst: 'guzheng',
      lead: [
        67, 69, 72, 74, 76, 74, 72, 69, 67, 64, 67, 69, 64, null, 62, null,
        64, 67, 69, 72, 74, 76, 79, 76, 74, 72, 69, 67, 72, null, null, null
      ],
      acc: [
        48, 55, 60, 64, 53, 57, 60, 64, 55, 59, 62, 67, 45, 52, 57, 60,
        41, 48, 53, 57, 43, 50, 55, 59, 45, 52, 57, 60, 48, 55, 60, 55
      ]
    },
    reed_marsh: {
      title: '蘆花孤舟',
      subtitle: '蘆花古渡 · 沉船灘',
      mood: '煙渚迷蹤',
      instruments: '洞簫 · 古箏 · 玉磬',
      tempo: 360,
      leadInst: 'xiao',
      accInst: 'guzheng',
      lead: [
        64, 67, 69, null, 72, 69, 67, 64, 62, 64, 67, null, 57, null, null, null,
        69, 72, 76, 74, 72, 69, 67, null, 64, 67, 62, 64, 57, null, null, null
      ],
      acc: [
        45, 52, 57, 60, 43, 50, 55, 59, 41, 48, 53, 57, 45, 52, 57, null,
        48, 55, 60, 64, 43, 50, 55, 59, 41, 48, 53, 57, 45, 52, 57, null
      ],
      chime: [
        null, null, null, null, 76, null, null, null, null, null, null, null, 69, null, null, null,
        null, null, null, null, 79, null, null, null, null, null, null, null, 69, null, null, null
      ]
    },
    bamboo_clinic: {
      title: '棲雲聽雪',
      subtitle: '棲雲竹海 · 白芷微主題',
      mood: '空谷幽蘭',
      instruments: '竹笛 · 古箏 · 玉磬',
      tempo: 325,
      leadInst: 'dizi',
      accInst: 'guzheng',
      lead: [
        69, 72, 77, 76, 72, 69, 67, null, 65, 67, 69, 72, 74, null, 72, null,
        77, 79, 81, 79, 77, 74, 72, 69, 67, 69, 72, 67, 65, null, null, null
      ],
      acc: [
        53, 60, 65, 69, 52, 57, 60, 64, 50, 57, 62, 65, 48, 55, 60, 64,
        46, 53, 58, 62, 48, 55, 60, 64, 50, 57, 62, 65, 53, 60, 65, null
      ],
      chime: [
        81, null, null, null, null, null, null, null, 77, null, null, null, null, null, null, null,
        84, null, null, null, null, null, null, null, 77, null, null, null, null, null, null, null
      ]
    },
    lantern_city: {
      title: '錦官燈影',
      subtitle: '錦官城 · 燈市與鎮遠鏢局',
      mood: '繁華俠氣',
      instruments: '竹笛 · 琵琶 · 木魚',
      tempo: 235,
      leadInst: 'dizi',
      accInst: 'pipa',
      percPattern: 'festive',
      lead: [
        67, 69, 71, 74, 76, 74, 71, 69, 67, 71, 74, 79, 76, null, 74, null,
        79, 76, 74, 71, 74, 76, 71, 69, 67, 69, 71, 67, 69, 71, 67, null
      ],
      acc: [
        43, 50, 55, 59, 48, 55, 60, 64, 43, 50, 55, 59, 50, 57, 62, 57,
        52, 59, 64, 59, 48, 55, 60, 55, 45, 52, 57, 52, 43, 50, 55, null
      ]
    },
    cave_mine: {
      title: '鬼哭幽泉',
      subtitle: '鬼哭礦脈 · 暗河溶洞',
      mood: '幽邃詭譎',
      instruments: '洞簫 · 琵琶 · 寒磬',
      tempo: 420,
      leadInst: 'xiao',
      accInst: 'pipa',
      lead: [
        59, null, 62, 64, 67, 64, 59, null, 57, null, 59, 62, 55, null, null, null,
        64, null, 67, 71, 69, 67, 64, null, 62, 59, 57, 59, 52, null, null, null
      ],
      acc: [
        40, 47, 52, null, 43, 50, 55, null, 45, 52, 57, null, 38, 45, 50, null,
        40, 47, 52, null, 42, 49, 54, null, 43, 50, 55, null, 40, 47, 52, null
      ],
      chime: [
        null, null, 76, null, null, null, null, null, null, null, 74, null, null, null, null, null,
        null, null, 79, null, null, null, null, null, null, null, 71, null, null, null, null, null
      ]
    },
    mountain_trail: {
      title: '落霞問劍',
      subtitle: '落霞山道 · 試劍古徑',
      mood: '雲嶺踏歌',
      instruments: '竹笛 · 古箏 · 琵琶',
      tempo: 265,
      leadInst: 'dizi',
      accInst: 'guzheng',
      percPattern: 'light',
      lead: [
        62, 65, 69, 74, 72, 69, 67, 69, 74, 76, 77, 74, 72, null, 69, null,
        77, 76, 74, 72, 69, 72, 74, 69, 67, 65, 62, 65, 62, null, null, null
      ],
      acc: [
        50, 57, 62, 57, 48, 55, 60, 55, 46, 53, 58, 53, 45, 52, 57, 52,
        46, 53, 58, 62, 48, 55, 60, 64, 43, 50, 55, 58, 50, 57, 62, null
      ]
    },
    immortal_sect: {
      title: '太微雲闕',
      subtitle: '玄霄劍宗 · 太微廣場',
      mood: '仙峰肅穆',
      instruments: '洞簫 · 古箏 · 編鐘',
      tempo: 380,
      leadInst: 'xiao',
      accInst: 'guzheng',
      lead: [
        67, 72, 74, 79, 76, 74, 72, null, 69, 72, 74, 72, 67, null, null, null,
        74, 76, 79, 81, 79, 76, 74, 72, 69, 72, 67, 64, 67, null, null, null
      ],
      acc: [
        48, 55, 60, 67, 45, 52, 57, 64, 41, 48, 53, 60, 43, 50, 55, 62,
        45, 52, 57, 64, 41, 48, 53, 60, 43, 50, 55, 62, 48, 55, 60, null
      ],
      chime: [
        72, null, null, null, null, null, null, null, 74, null, null, null, null, null, null, null,
        79, null, null, null, null, null, null, null, 72, null, null, null, null, null, null, null
      ]
    },
    sword_prison: {
      title: '七曜鎮魔',
      subtitle: '鎮魔劍獄 · 守劍孤魂',
      mood: '蒼涼悲壯',
      instruments: '二胡 · 古箏 · 編鐘 · 堂鼓',
      tempo: 395,
      leadInst: 'erhu',
      accInst: 'guzheng',
      percPattern: 'solemn',
      lead: [
        62, 65, 69, 68, 69, 65, 62, null, 60, 62, 65, 62, 57, null, null, null,
        69, 72, 74, 76, 74, 72, 69, 65, 64, 65, 62, 60, 62, null, null, null
      ],
      acc: [
        38, 45, 50, 57, 36, 43, 48, 55, 34, 41, 46, 53, 33, 40, 45, 52,
        38, 45, 50, 57, 34, 41, 46, 53, 36, 43, 48, 55, 38, 45, 50, null
      ],
      chime: [
        62, null, null, null, null, null, null, null, 57, null, null, null, null, null, null, null,
        69, null, null, null, null, null, null, null, 62, null, null, null, null, null, null, null
      ]
    },
    marsh_village: {
      title: '雲夢百草',
      subtitle: '百草懸空寨 · 雲珞主題',
      mood: '靈動奇趣',
      instruments: '竹笛 · 琵琶 · 木魚',
      tempo: 240,
      leadInst: 'dizi',
      accInst: 'pipa',
      percPattern: 'festive',
      lead: [
        69, 72, 74, 76, 79, 76, 74, 72, 69, 72, 67, 64, 69, null, 67, null,
        72, 74, 76, 79, 81, 79, 76, 74, 72, 74, 69, 67, 69, null, null, null
      ],
      acc: [
        45, 52, 57, 52, 48, 55, 60, 55, 43, 50, 55, 50, 45, 52, 57, 52,
        48, 55, 60, 55, 50, 57, 62, 57, 43, 50, 55, 50, 45, 52, 57, null
      ]
    },
    fire_sanctum: {
      title: '祝融炎脈',
      subtitle: '祝融地脈 · 赤炎熔窟',
      mood: '熾烈危局',
      instruments: '二胡 · 琵琶 · 堂鼓',
      tempo: 215,
      leadInst: 'erhu',
      accInst: 'pipa',
      percPattern: 'march',
      lead: [
        64, 64, 67, 69, 71, 69, 67, 64, 62, 64, 67, 62, 64, null, 59, null,
        71, 74, 76, 74, 71, 69, 67, 69, 71, 67, 64, 62, 64, null, null, null
      ],
      acc: [
        40, 52, 40, 52, 43, 55, 43, 55, 38, 50, 38, 50, 40, 47, 52, 40,
        45, 57, 45, 57, 43, 55, 43, 55, 38, 50, 42, 54, 40, 47, 52, null
      ]
    },
    memory_echo: {
      title: '壬戌舊夢',
      subtitle: '望舒古墟 · 十八年前燼夜',
      mood: '宿命迴響',
      instruments: '二胡 · 古箏 · 玉磬',
      tempo: 430,
      leadInst: 'erhu',
      accInst: 'guzheng',
      lead: [
        69, 71, 72, 76, 74, 72, 71, 69, 67, 69, 72, 69, 64, null, null, null,
        65, 69, 72, 74, 72, 69, 67, 64, 62, 65, 69, 67, 69, null, null, null
      ],
      acc: [
        45, 52, 57, 60, 43, 50, 55, 59, 41, 48, 53, 57, 40, 47, 52, 56,
        41, 48, 53, 57, 43, 50, 55, 59, 38, 45, 50, 53, 45, 52, 57, null
      ],
      chime: [
        76, null, null, null, null, null, null, null, 72, null, null, null, null, null, null, null,
        74, null, null, null, null, null, null, null, 69, null, null, null, null, null, null, null
      ]
    },
    sad: {
      title: '素心折柳',
      subtitle: '離情別緒 · 宿命之嘆',
      mood: '淒美哀婉',
      instruments: '二胡 · 古箏 · 孤磬',
      tempo: 480,
      leadInst: 'erhu',
      accInst: 'guzheng',
      lead: [
        69, 72, 69, 65, 62, null, 60, 62, 65, 69, 65, 62, 57, null, null, null,
        74, 76, 74, 72, 69, 65, 62, 65, 69, 67, 65, 64, 62, null, null, null
      ],
      acc: [
        50, 57, 62, null, 46, 53, 58, null, 48, 55, 60, null, 45, 52, 57, null,
        46, 53, 58, null, 48, 55, 60, null, 45, 52, 57, null, 50, 57, 62, null
      ],
      chime: [
        null, null, null, null, null, null, null, null, 74, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, 69, null, null, null, null, null, null, null
      ]
    },
    battle: {
      title: '劍氣縱橫',
      subtitle: '江湖交鋒 · 除魔衛道',
      mood: '疾風驟雨',
      instruments: '竹笛 · 琵琶 · 戰鼓',
      tempo: 175,
      leadInst: 'dizi',
      accInst: 'pipa',
      percPattern: 'battle',
      lead: [
        69, 69, 72, 74, 76, 74, 72, 69, 67, 69, 72, 67, 69, null, 64, 67,
        69, 72, 74, 76, 79, 76, 74, 72, 74, 76, 72, 69, 72, 69, 67, 69
      ],
      acc: [
        45, 57, 45, 57, 43, 55, 43, 55, 41, 53, 43, 55, 45, 52, 57, 45,
        45, 57, 48, 60, 43, 55, 45, 57, 41, 53, 43, 55, 45, 52, 57, 45
      ]
    },
    duel_boss: {
      title: '兵戈問道',
      subtitle: '強敵對決 · 鎮守首領',
      mood: '劍拔弩張',
      instruments: '二胡 · 琵琶 · 堂鼓',
      tempo: 155,
      leadInst: 'erhu',
      accInst: 'pipa',
      percPattern: 'boss',
      lead: [
        74, 76, 77, 76, 74, 72, 69, 72, 74, 77, 81, 77, 76, 74, 72, 69,
        72, 74, 76, 79, 77, 74, 72, 69, 71, 74, 76, 72, 74, null, 69, 72
      ],
      acc: [
        38, 50, 38, 50, 41, 53, 41, 53, 43, 55, 43, 55, 38, 50, 45, 38,
        36, 48, 36, 48, 38, 50, 38, 50, 40, 52, 43, 55, 38, 45, 50, 38
      ]
    },
    final_boss: {
      title: '歸墟蝕月',
      subtitle: '望舒天闕 · 最終決戰',
      mood: '傾天決死',
      instruments: '二胡 · 竹笛 · 古箏 · 編鐘 · 雷鼓',
      tempo: 145,
      leadInst: 'erhu',
      subLeadInst: 'dizi',
      accInst: 'guzheng',
      percPattern: 'boss',
      lead: [
        62, 65, 69, 74, 76, 74, 72, 69, 74, 77, 81, 79, 77, 76, 74, null,
        77, 79, 81, 84, 81, 79, 77, 74, 72, 74, 76, 72, 69, 72, 74, null,
        81, 77, 74, 69, 79, 76, 72, 67, 77, 74, 69, 65, 69, 72, 74, null
      ],
      acc: [
        38, 50, 57, 50, 38, 50, 57, 50, 34, 46, 53, 46, 36, 48, 55, 48,
        34, 46, 53, 58, 36, 48, 55, 60, 38, 50, 57, 62, 38, 45, 50, 57,
        34, 46, 53, 46, 36, 48, 55, 48, 33, 45, 52, 45, 38, 50, 57, 50
      ],
      chime: [
        74, null, null, null, null, null, null, null, 81, null, null, null, null, null, null, null,
        86, null, null, null, null, null, null, null, 74, null, null, null, null, null, null, null,
        81, null, null, null, 79, null, null, null, 77, null, null, null, 74, null, null, null
      ]
    }
  };

  // 相容舊版曲目代號
  const TRACK_ALIASES = {
    town: 'ferry_town',
    dungeon: 'cave_mine',
    boss: 'duel_boss'
  };

  PalX.TRACK_LIST = Object.keys(TRACKS).map((id) => ({
    id,
    title: TRACKS[id].title,
    subtitle: TRACKS[id].subtitle,
    mood: TRACKS[id].mood,
    instruments: TRACKS[id].instruments
  }));

  function midiToFreq(m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.echoIn = null;
      this.noiseBuf = null;
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
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.88;
        this.master.connect(this.ctx.destination);

        // 山谷殘響／廳堂回音匯流排
        const delayL = this.ctx.createDelay(1.0);
        const delayR = this.ctx.createDelay(1.0);
        const fb = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        const wet = this.ctx.createGain();

        delayL.delayTime.value = 0.24;
        delayR.delayTime.value = 0.37;
        fb.gain.value = 0.26;
        filter.type = 'lowpass';
        filter.frequency.value = 2100;
        wet.gain.value = 0.24;

        this.echoIn = this.ctx.createGain();
        this.echoIn.connect(filter);
        filter.connect(delayL);
        delayL.connect(delayR);
        delayR.connect(fb);
        fb.connect(filter);
        delayL.connect(wet);
        delayR.connect(wet);
        wet.connect(this.master);

        // 預建白噪音緩衝供氣音、木魚、鈸聲與風聲使用
        const len = Math.floor(this.ctx.sampleRate * 0.4);
        this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) {
          data[i] = Math.random() * 2 - 1;
        }
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

    resolveTrack(name) {
      if (!name) return null;
      const mapped = TRACK_ALIASES[name] || name;
      return TRACKS[mapped] ? mapped : null;
    }

    getTrackMeta(name) {
      const id = this.resolveTrack(name || this.currentTrack);
      if (!id) return null;
      const t = TRACKS[id];
      return { id, title: t.title, subtitle: t.subtitle, mood: t.mood, instruments: t.instruments };
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
      const resolved = this.resolveTrack(trackName);
      if (!resolved) return;
      if (this.currentTrack === resolved && this.timer) return;
      this.currentTrack = resolved;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      if (!this.enabled || typeof window === 'undefined') return;
      this.step = 0;
      const track = TRACKS[resolved];
      const len = track.lead.length;

      this.timer = setInterval(() => {
        if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
        const idx = this.step % len;
        const beatSec = track.tempo / 1000;

        const leadNote = track.lead[idx];
        const accNote = track.acc ? track.acc[idx % track.acc.length] : null;
        const chimeNote = track.chime ? track.chime[idx % track.chime.length] : null;

        if (leadNote) {
          const freq = midiToFreq(leadNote);
          this.playInstrument(track.leadInst || 'dizi', freq, beatSec * 1.08, 0.048);
          if (track.subLeadInst && idx % 2 === 0) {
            this.playInstrument(track.subLeadInst, freq * 2, beatSec * 0.85, 0.022);
          }
        }
        if (accNote) {
          this.playInstrument(track.accInst || 'guzheng', midiToFreq(accNote), beatSec * 1.25, 0.042);
        }
        if (chimeNote) {
          this.playChime(midiToFreq(chimeNote), beatSec * 2.4, 0.032);
        }
        if (track.percPattern) {
          this.triggerPercussion(track.percPattern, idx);
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

    connectOut(node, echoSend = 0.45) {
      if (!this.master) return;
      node.connect(this.master);
      if (this.echoIn && echoSend > 0) {
        const send = this.ctx.createGain();
        send.gain.value = echoSend;
        node.connect(send);
        send.connect(this.echoIn);
      }
    }

    playInstrument(inst, freq, dur, vol) {
      if (inst === 'xiao') return this.playXiao(freq, dur, vol);
      if (inst === 'erhu') return this.playErhu(freq, dur, vol);
      if (inst === 'pipa') return this.playPipa(freq, dur, vol);
      if (inst === 'guzheng') return this.playGuzheng(freq, dur, vol);
      return this.playDizi(freq, dur, vol);
    }

    // 竹笛：明亮清越，帶微弱竹膜泛音與氣息顫音
    playDizi(freq, dur, vol) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const vib = this.ctx.createOscillator();
      const vibG = this.ctx.createGain();
      const g2 = this.ctx.createGain();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 2, now);
      g2.gain.value = 0.18;

      vib.frequency.setValueAtTime(5.6, now);
      vibG.gain.setValueAtTime(freq * 0.011, now);
      vib.connect(vibG);
      vibG.connect(osc1.frequency);

      gain.gain.setValueAtTime(0.0008, now);
      gain.gain.linearRampToValueAtTime(vol, now + Math.min(0.055, dur * 0.22));
      gain.gain.exponentialRampToValueAtTime(0.0008, now + dur);

      osc1.connect(gain);
      osc2.connect(g2);
      g2.connect(gain);
      this.connectOut(gain, 0.55);

      osc1.start(now);
      osc2.start(now);
      vib.start(now);
      osc1.stop(now + dur + 0.03);
      osc2.stop(now + dur + 0.03);
      vib.stop(now + dur + 0.03);
    }

    // 洞簫：溫潤低迴，緩起氣音與深遠餘韻
    playXiao(freq, dur, vol) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const lp = this.ctx.createBiquadFilter();
      const vib = this.ctx.createOscillator();
      const vibG = this.ctx.createGain();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(freq * 2.4, now);

      vib.frequency.setValueAtTime(4.3, now);
      vibG.gain.setValueAtTime(freq * 0.009, now);
      vib.connect(vibG);
      vibG.connect(osc.frequency);

      gain.gain.setValueAtTime(0.0008, now);
      gain.gain.linearRampToValueAtTime(vol * 1.12, now + Math.min(0.11, dur * 0.35));
      gain.gain.exponentialRampToValueAtTime(0.0008, now + dur + 0.06);

      osc.connect(lp);
      lp.connect(gain);
      this.connectOut(gain, 0.72);

      osc.start(now);
      vib.start(now);
      osc.stop(now + dur + 0.08);
      vib.stop(now + dur + 0.08);
    }

    // 二胡：微滑音入弓、琴筒木質共鳴與深情揉弦
    playErhu(freq, dur, vol) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const bp = this.ctx.createBiquadFilter();
      const vib = this.ctx.createOscillator();
      const vibG = this.ctx.createGain();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq * 0.985, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.065);

      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(Math.min(2200, Math.max(680, freq * 2.2)), now);
      bp.Q.value = 1.65;

      vib.frequency.setValueAtTime(5.4, now);
      vibG.gain.setValueAtTime(0.001, now);
      vibG.gain.linearRampToValueAtTime(freq * 0.015, now + dur * 0.45);
      vib.connect(vibG);
      vibG.connect(osc.frequency);

      gain.gain.setValueAtTime(0.0008, now);
      gain.gain.linearRampToValueAtTime(vol * 1.15, now + Math.min(0.085, dur * 0.3));
      gain.gain.exponentialRampToValueAtTime(0.0008, now + dur + 0.04);

      osc.connect(bp);
      bp.connect(gain);
      this.connectOut(gain, 0.65);

      osc.start(now);
      vib.start(now);
      osc.stop(now + dur + 0.06);
      vib.stop(now + dur + 0.06);
    }

    // 古箏：雙弦微差共鳴＋撥弦高頻瞬態滑落
    playGuzheng(freq, dur, vol) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const lp = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 1.003, now);

      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(Math.min(4800, freq * 6.5), now);
      lp.frequency.exponentialRampToValueAtTime(Math.max(320, freq * 1.5), now + dur * 0.75);

      const g2 = this.ctx.createGain();
      g2.gain.value = 0.28;

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(vol * 1.15, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + dur + 0.08);

      osc1.connect(lp);
      osc2.connect(g2);
      g2.connect(lp);
      lp.connect(gain);
      this.connectOut(gain, 0.5);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + dur + 0.1);
      osc2.stop(now + dur + 0.1);
    }

    // 琵琶／中阮：清脆彈挑顆粒感
    playPipa(freq, dur, vol) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const click = this.ctx.createOscillator();
      const lp = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      const cg = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      click.type = 'square';
      click.frequency.setValueAtTime(freq * 3, now);

      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(Math.min(3800, freq * 5), now);
      lp.frequency.exponentialRampToValueAtTime(Math.max(280, freq * 1.3), now + dur * 0.55);

      cg.gain.setValueAtTime(vol * 0.35, now);
      cg.gain.exponentialRampToValueAtTime(0.0008, now + 0.025);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + dur * 0.85);

      osc.connect(lp);
      lp.connect(gain);
      click.connect(cg);
      cg.connect(gain);
      this.connectOut(gain, 0.3);

      osc.start(now);
      click.start(now);
      osc.stop(now + dur + 0.03);
      click.stop(now + 0.03);
    }

    // 編鐘／玉磬：清越泛音雙頻鐘磬聲
    playChime(freq, dur, vol) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const o1 = this.ctx.createOscillator();
      const o2 = this.ctx.createOscillator();
      const g1 = this.ctx.createGain();
      const g2 = this.ctx.createGain();

      o1.type = 'sine';
      o2.type = 'sine';
      o1.frequency.setValueAtTime(freq, now);
      o2.frequency.setValueAtTime(freq * 2.42, now);

      g1.gain.setValueAtTime(vol, now);
      g1.gain.exponentialRampToValueAtTime(0.0006, now + dur);
      g2.gain.setValueAtTime(vol * 0.38, now);
      g2.gain.exponentialRampToValueAtTime(0.0006, now + dur * 0.55);

      o1.connect(g1);
      o2.connect(g2);
      this.connectOut(g1, 0.78);
      this.connectOut(g2, 0.65);

      o1.start(now);
      o2.start(now);
      o1.stop(now + dur + 0.05);
      o2.stop(now + dur * 0.6);
    }

    triggerPercussion(pattern, idx) {
      if (pattern === 'battle') {
        if (idx % 4 === 0) this.playDrum(88, 0.058);
        else if (idx % 2 === 0) this.playDrum(132, 0.04);
        else if (idx % 4 === 3) this.playWoodblock(820, 0.024);
      } else if (pattern === 'boss') {
        if (idx % 4 === 0) this.playDrum(74, 0.072);
        else if (idx % 2 === 1) this.playDrum(118, 0.044);
        if (idx % 8 === 4) this.playWoodblock(960, 0.03);
      } else if (pattern === 'festive') {
        if (idx % 4 === 0) this.playWoodblock(720, 0.026);
        else if (idx % 4 === 2) this.playWoodblock(940, 0.02);
      } else if (pattern === 'light') {
        if (idx % 8 === 0) this.playDrum(110, 0.032);
        else if (idx % 4 === 2) this.playWoodblock(860, 0.018);
      } else if (pattern === 'solemn') {
        if (idx % 8 === 0) this.playDrum(68, 0.055);
      } else if (pattern === 'march') {
        if (idx % 4 === 0) this.playDrum(82, 0.052);
        else if (idx % 4 === 2) this.playDrum(116, 0.036);
      }
    }

    playDrum(freq, vol) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.16);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      osc.connect(gain);
      this.connectOut(gain, 0.22);
      osc.start(now);
      osc.stop(now + 0.18);
    }

    playWoodblock(freq, vol) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.72, now + 0.045);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.05);
      osc.connect(gain);
      this.connectOut(gain, 0.18);
      osc.start(now);
      osc.stop(now + 0.055);
    }

    // 保留相容方法供其他模組或外部呼叫
    playFlute(freq, dur, vol) {
      this.playDizi(freq, dur, vol);
    }

    playPluck(freq, dur, vol) {
      this.playGuzheng(freq, dur, vol);
    }

    sfx(type) {
      if (!this.enabled) return;
      this.resume();
      if (!this.ctx || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;

      if (type === 'cursor') {
        this.playPipa(660, 0.06, 0.038);
      } else if (type === 'step') {
        this.playWoodblock(320, 0.015);
      } else if (type === 'confirm') {
        this.playGuzheng(587.33, 0.1, 0.052);
        setTimeout(() => this.playGuzheng(880, 0.16, 0.052), 55);
      } else if (type === 'cancel') {
        this.playPipa(440, 0.09, 0.042);
        setTimeout(() => this.playPipa(330, 0.12, 0.04), 50);
      } else if (type === 'switch') {
        this.playChime(523.25, 0.35, 0.055);
        setTimeout(() => this.playChime(783.99, 0.45, 0.055), 80);
      } else if (type === 'coin') {
        this.playChime(1046.5, 0.18, 0.045);
        setTimeout(() => this.playChime(1318.5, 0.25, 0.048), 55);
      } else if (type === 'item' || type === 'chest') {
        const notes = [523.25, 587.33, 659.25, 783.99, 1046.5];
        notes.forEach((f, i) => {
          setTimeout(() => this.playGuzheng(f, 0.22, 0.062), i * 65);
        });
      } else if (type === 'slash' || type === 'whip' || type === 'sword') {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(type === 'whip' ? 960 : 560, now);
        osc.frequency.exponentialRampToValueAtTime(105, now + 0.15);
        g.gain.setValueAtTime(0.058, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(g);
        this.connectOut(g, 0.15);
        osc.start(now);
        osc.stop(now + 0.17);
      } else if (type === 'magic') {
        [523.25, 659.25, 783.99, 987.77, 1174.66].forEach((f, i) => {
          setTimeout(() => this.playDizi(f, 0.24, 0.045), i * 45);
        });
      } else if (type === 'heal') {
        [440, 523.25, 659.25, 880].forEach((f, i) => {
          setTimeout(() => this.playGuzheng(f, 0.28, 0.055), i * 70);
        });
      } else if (type === 'hit') {
        this.playDrum(120, 0.085);
      } else if (type === 'levelup' || type === 'victory') {
        const notes = [523.25, 659.25, 783.99, 1046.5, 987.77, 1174.66];
        notes.forEach((f, i) => {
          setTimeout(() => {
            this.playGuzheng(f, 0.3, 0.07);
            if (i === notes.length - 1) this.playChime(f, 0.7, 0.045);
          }, i * 85);
        });
      } else if (type === 'inn') {
        const notes = [392.0, 440.0, 523.25, 587.33, 659.25, 523.25];
        notes.forEach((f, i) => {
          setTimeout(() => this.playXiao(f, 0.36, 0.045), i * 120);
        });
      }
    }
  }

  PalX.audio = new SoundEngine();
})(typeof window !== 'undefined' ? window : globalThis);
