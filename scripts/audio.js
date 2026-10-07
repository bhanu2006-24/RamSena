/**
 * RAM SENA - Audio Engine (scripts/audio.js)
 * Manages background devotional bhajans (Bhajan1, Bhajan2, Bhajan3)
 * with user selection, looping, volume control, and sacred chimes.
 */

class AudioManager {
  constructor() {
    this.isMuted = false;
    this.bgmVolume = 0.35; // Comfortable, serene devotional volume
    this.audioContext = null;

    // Available Devotional Bhajans in /assets/
    this.tracks = [
      { id: 0, name: 'Bhajan 1 (श्री राम स्तुति)', file: 'assets/Bhajan1.mp3' },
      { id: 1, name: 'Bhajan 2 (राम भजन तरंग)', file: 'assets/Bhajan2.mp3' },
      { id: 2, name: 'Bhajan 3 (जय श्री राम संकीर्तन)', file: 'assets/Bhajan3.mp3' }
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
    this.hailAudio = new Audio('assets/Bhajan1.mp3');
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

    const wasPlaying = this.isPlayingBGM;

    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }

    this.bgmAudio = new Audio(this.tracks[this.currentTrackIndex].file);
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = this.bgmVolume;

    if (wasPlaying && !this.isMuted) {
      this.bgmAudio.play().then(() => {
        this.isPlayingBGM = true;
      }).catch(() => {});
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
