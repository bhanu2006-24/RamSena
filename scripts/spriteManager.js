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
      bear_front: 'assets/images/bear_front.png',
      hanuman: 'assets/images/hanuman.png',
      laxman: 'assets/images/laxman.png',
      ram: 'assets/images/ram.png',
      sugreev: 'assets/images/sugreev.png',
      vanar: 'assets/images/vanar.png',
      vanar_front: 'assets/images/vanar_front.png',
      vibhisan: 'assets/images/vibhisan.png',
      jambavan: 'assets/images/jambavan.png'
    };

    this.images = {};
    this.loaded = {};
    this.loadAll();
  }

  loadAll() {
    for (const [key, path] of Object.entries(this.manifest)) {
      const customOverride = localStorage.getItem(`ram_sena_custom_sprite_${key}`);
      const img = new Image();
      img.src = customOverride || path;
      img.onload = () => {
        this.loaded[key] = true;
      };
      img.onerror = () => {
        if (customOverride) {
          img.src = path;
        } else {
          console.warn(`Failed to load sprite: ${path}`);
        }
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
    if (!npcId) return 'vanar';
    if (npcId.startsWith('shri_ram')) return 'ram';
    if (npcId.startsWith('lakshman')) return 'laxman';
    if (npcId.startsWith('hanuman')) return 'hanuman';
    if (npcId.startsWith('sugreev')) return 'sugreev';
    if (npcId.startsWith('jambavan')) return 'jambavan';
    if (npcId.startsWith('vibhishan')) return 'vibhisan';
    if (npcId.startsWith('angad')) return 'angad';
    if (npcId === 'sushena') return 'vanar';
    if (npcId === 'nal_neel') return 'vanar';
    if (npcId.includes('bear') || npcId.includes('riksha') || npcId.includes('bhaluu')) return 'bear';
    return 'vanar';
  }
}

window.spriteManager = new SpriteManager();
