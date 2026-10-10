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
    try {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch (e) {}

    this.playTempleBell();

    if (window.uiManager) {
      window.uiManager.showDialogue(
        'Devotional Hail',
        'You raise your voice with deep Bhakti: "जय श्री राम!" The whole camp echoes with reverence.',
        '🚩'
      );
    }

    if (window.npcManager) {
      window.npcManager.echoChant();
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
