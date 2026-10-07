/**
 * RAM SENA - Sprite & Image Asset Manager (scripts/spriteManager.js)
 * Preloads, caches, and provides high-res character portraits and overworld sprites
 * for Shri Ram, Lakshman, Hanuman, Sugreev, Jambavan, Vibhishan, Angad, Vanar, and Bear.
 */

class SpriteManager {
  constructor() {
    this.manifest = {
      angad: 'assets/images/angad.png',
      bear: 'assets/images/bear.png',
      hanuman: 'assets/images/hanuman.png',
      laxman: 'assets/images/laxman.png',
      ram: 'assets/images/ram.png',
      sugreev: 'assets/images/sugreev.png',
      vanar: 'assets/images/vanar.png',
      vibhisan: 'assets/images/vibhisan.png'
    };

    this.images = {};
    this.loaded = {};
    this.loadAll();
  }

  loadAll() {
    for (const [key, path] of Object.entries(this.manifest)) {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        this.loaded[key] = true;
      };
      img.onerror = () => {
        console.warn(`Failed to load sprite: ${path}`);
      };
      this.images[key] = img;
    }
  }

  isLoaded(key) {
    return !!this.loaded[key];
  }

  getImage(key) {
    return this.images[key] || null;
  }

  getSpriteKeyForNPC(npcId) {
    switch (npcId) {
      case 'shri_ram': return 'ram';
      case 'lakshman': return 'laxman';
      case 'hanuman': return 'hanuman';
      case 'sugreev': return 'sugreev';
      case 'jambavan': return 'bear';
      case 'vibhishan': return 'vibhisan';
      case 'angad': return 'angad';
      case 'sushena': return 'vanar';
      case 'nal_neel': return 'vanar';
      default:
        if (npcId && npcId.includes('bear')) return 'bear';
        return 'vanar';
    }
  }
}

window.spriteManager = new SpriteManager();
