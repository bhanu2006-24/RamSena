/**
 * RAM SENA - Audio Engine (scripts/audio.js)
 * Manages background devotional music, sacred chants, and procedural Web Audio fallbacks.
 * Uses assets/audio/ram.mp3 and assets/audio/hail.mp3 if present, with graceful procedural synthesis.
 */

class AudioManager {
  constructor() {
    this.isMuted = false;
    this.bgmVolume = 0.22; // Low gentle devotional volume
    this.audioContext = null;

    // Background Audio Element
    this.bgmAudio = new Audio('assets/audio/ram.mp3');
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = this.bgmVolume;
    this.bgmAudioFailed = false;

    this.bgmAudio.addEventListener('error', () => {
      this.bgmAudioFailed = true;
      // Procedural synthesizer will take over seamlessly if desired
    });

    // Hail Audio Element
    this.hailAudio = new Audio('assets/audio/hail.mp3');
    this.hailAudio.volume = 0.6;
    this.hailAudioFailed = false;
    this.hailAudio.addEventListener('error', () => {
      this.hailAudioFailed = true;
    });

    // Procedural ambient generator state
    this.proceduralOsc = null;
    this.proceduralGain = null;
    this.isPlayingBGM = false;
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
    if (this.isMuted || this.isPlayingBGM) return;

    // Try playing MP3 first
    if (!this.bgmAudioFailed) {
      const playPromise = this.bgmAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlayingBGM = true;
          })
          .catch(() => {
            // Autoplay policy or missing file -> fall back to Web Audio drone
            this.startProceduralAmbience();
          });
      }
    } else {
      this.startProceduralAmbience();
    }
  }

  startProceduralAmbience() {
    if (this.isPlayingBGM || this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      // Create warm Tanpura-like meditative multi-harmonic drone (Sa-Pa fundamental)
      const baseFreq = 136.1; // Om frequency / C#

      this.proceduralGain = ctx.createGain();
      this.proceduralGain.gain.setValueAtTime(0.04, ctx.currentTime);
      this.proceduralGain.connect(ctx.destination);

      const freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2];
      freqs.forEach(f => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        osc.connect(this.proceduralGain);
        osc.start();
      });

      this.isPlayingBGM = true;
    } catch (e) {
      // Audio not permitted yet
    }
  }

  stopBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
    if (this.proceduralGain) {
      this.proceduralGain.gain.setValueAtTime(0, this.audioContext.currentTime);
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

  /**
   * Hail Shri Ram! (जय श्री राम)
   * Plays hail audio or resonant temple bell chime and triggers chant echo
   */
  hailShriRam() {
    if (!this.hailAudioFailed) {
      this.hailAudio.currentTime = 0;
      this.hailAudio.play().catch(() => {
        this.playTempleBell();
      });
    } else {
      this.playTempleBell();
    }

    // Trigger visual chant notification in UI
    if (window.uiManager) {
      window.uiManager.showChantAura('जय श्री राम! (Jai Shri Ram!)');
      window.uiManager.addLog('You raised your voice with pure Bhakti: "जय श्री राम!"', 'divine');
    }

    // Nearby army soldiers echo the chant
    if (window.npcManager) {
      window.npcManager.echoChant();
    }
  }

  /**
   * Procedural resonant temple bell / shankha chime
   */
  playTempleBell() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime); // Solfeggio 528Hz love/sacred frequency
      osc.frequency.exponentialRampToValueAtTime(1056, ctx.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(528, ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
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
