/**
 * RAM SENA - Audio Engine (scripts/audio.js)
 * Manages background devotional bhajans (Bhajan1, Bhajan2, Bhajan3)
 * with user selection, looping, volume control, and sacred chimes.
 */

class AudioManager {
  constructor() {
    this.isMuted = false;
    // Load saved volume preference if any
    const savedVol = localStorage.getItem('ram_sena_bgm_vol');
    this.bgmVolume = savedVol !== null ? parseFloat(savedVol) : 0.40;
    if (isNaN(this.bgmVolume) || this.bgmVolume < 0) this.bgmVolume = 0.40;
    if (this.bgmVolume > 1) this.bgmVolume = 1;

    this.audioContext = null;

    // Available Devotional Bhajans in /assets/
    this.tracks = [
      { id: 0, name: 'Bhajan 1', file: 'assets/music/Bhajan1.mp3' },
      { id: 1, name: 'Bhajan 2 ', file: 'assets/music/Bhajan2.mp3' },
      { id: 2, name: 'Bhajan 3 ', file: 'assets/music/Bhajan3.mp3' }
    ];

    // Load saved track preference if any
    const savedTrack = localStorage.getItem('ram_sena_track_idx');
    this.currentTrackIndex = savedTrack !== null ? (parseInt(savedTrack, 10) || 0) : 0;
    if (this.currentTrackIndex < 0 || this.currentTrackIndex >= this.tracks.length) {
      this.currentTrackIndex = 0;
    }

    this.bgmAudio = new Audio(this.tracks[this.currentTrackIndex].file);
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = this.bgmVolume;
    this.isPlayingBGM = false;

    // Hail Audio (falls back to sacred temple chime)
    this.hailAudio = new Audio('assets/music/Bhajan1.mp3');
  }

  setVolume(volume) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('ram_sena_bgm_vol', this.bgmVolume);
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.isMuted ? 0 : this.bgmVolume;
    }
    return this.bgmVolume;
  }

  getVolumePercent() {
    return Math.round(this.bgmVolume * 100);
  }

  volumeUp(step = 0.05) {
    return this.setVolume(this.bgmVolume + step);
  }

  volumeDown(step = 0.05) {
    return this.setVolume(this.bgmVolume - step);
  }

  getAudioContext() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  startBGM() {
    if (this.isMuted) return;

    if (this.bgmAudio) {
      const playPromise = this.bgmAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlayingBGM = true;
          })
          .catch(() => {
            // Browser autoplay restrictions until user interacts
            this.isPlayingBGM = false;
          });
      }
    }
  }

  stopBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
    this.isPlayingBGM = false;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return this.isMuted;
  }

  setTrack(index) {
    this.currentTrackIndex = (index + this.tracks.length) % this.tracks.length;
    localStorage.setItem('ram_sena_track_idx', this.currentTrackIndex);

    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }

    this.bgmAudio = new Audio(this.tracks[this.currentTrackIndex].file);
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = this.bgmVolume;

    if (!this.isMuted) {
      const p = this.bgmAudio.play();
      if (p !== undefined) {
        p.then(() => {
          this.isPlayingBGM = true;
        }).catch(() => {
          this.isPlayingBGM = false;
        });
      }
    }

    return this.tracks[this.currentTrackIndex];
  }

  nextTrack() {
    return this.setTrack(this.currentTrackIndex + 1);
  }

  prevTrack() {
    return this.setTrack(this.currentTrackIndex - 1);
  }

  getCurrentTrack() {
    return this.tracks[this.currentTrackIndex];
  }

  /**
   * Hail Shri Ram! (जय श्री राम)
   */
  hailShriRam() {
    this.playTempleBell();

    const chaupais = [
      {
        verse: 'मंगल भवन अमंगल हारी।\nद्रवउ सुदसरथ अजिर बिहारी॥',
        meaning: 'May the abode of auspiciousness and dispeller of all sorrow, Shri Ram, shower His divine grace upon us!'
      },
      {
        verse: 'सीय राम मय सब जग जानी।\nकरहुँ प्रनाम जोरि जुग पानी॥',
        meaning: 'Knowing the entire cosmos to be permeated by Sita and Ram, I offer my humble prostrations with folded hands.'
      },
      {
        verse: 'दीन दयाल बिरिदु संभारी।\nहरहु नाथ मम संकट भारी॥',
        meaning: 'O Lord, mindful of Your vow as the protector of the humble and helpless, take away all grief and distress!'
      },
      {
        verse: 'राम नाम मनि दीप धरू जीह देहरीं द्वार।\nतुलसी भीतर बाहिरहुँ जौं चाहसि उजिआर॥',
        meaning: 'Place the jewel-lamp of Ram Naam on the threshold of your tongue if you desire divine radiance both within and without!'
      },
      {
        verse: 'होइहि सोइ जो राम रचि राखा।\nको करि तर्क बढ़ावै साखा॥',
        meaning: 'Whatever Shri Ram has ordained shall come to pass; keep unwavering faith in the divine will!'
      },
      {
        verse: 'जापर कृपा राम की होई।\nतापर कृपा करहिं सब कोई॥',
        meaning: 'He upon whom the grace of Shri Ram descends receives the loving grace and goodwill of all creation!'
      },
      {
        verse: 'रामहि केवल प्रेमु पिआरा।\nजानि लेउ जो जान निहारा॥',
        meaning: 'Shri Ram loves only pure, selfless love; let all who yearn to know Him understand this eternal truth!'
      }
    ];

    const pick = chaupais[Math.floor(Math.random() * chaupais.length)];

    if (window.uiManager) {
      window.uiManager.showDialogue(
        'श्री रामचरितमानस — पावन चौपाई',
        `${pick.verse}\n\n✦ भावार्थ: ${pick.meaning}`,
        '🚩'
      );
      if (window.uiManager.addLog) {
        window.uiManager.addLog(`जयघोष: ${pick.verse.split('\n')[0]}`, 'service');
      }
    }

    if (window.npcManager) {
      window.npcManager.echoChant(pick.verse.split('\n')[0]);
    }
  }

  /**
   * Resonant temple bell chime via Web Audio API
   */
  playTempleBell() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1056, ctx.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(528, ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.8);
    } catch (e) {}
  }

  playGatherSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  }
}

window.audioManager = new AudioManager();
