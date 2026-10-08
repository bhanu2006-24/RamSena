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
      bhaluu: 'assets/images/bhaluu.png',
      hanuman: 'assets/images/hanuman.png',
      laxman: 'assets/images/laxman.png',
      ram: 'assets/images/ram.png',
      rakshsa: 'assets/images/rakshsa.png',
      sugreev: 'assets/images/sugreev.png',
      sushena: 'assets/images/sushena.png',
      vanar: 'assets/images/vanar.png',
      vanar_front: 'assets/images/vanar_front.png',
      vanarsena: 'assets/images/vanarsena.png',
      nal: 'assets/images/nal.png',
      neel: 'assets/images/neel.png',
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
        } else if (key === 'nal' || key === 'neel') {
          // Graceful fallback to vanarsena until dedicated nal.png/neel.png provided
          img.src = 'assets/images/vanarsena.png';
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
    if (!npcId) return 'vanarsena';
    if (npcId === 'nal') return 'nal';
    if (npcId === 'neel') return 'neel';
    if (npcId === 'sushena') return 'sushena';
    if (npcId.startsWith('shri_ram')) return 'ram';
    if (npcId.startsWith('lakshman')) return 'laxman';
    if (npcId.startsWith('hanuman')) return 'hanuman';
    if (npcId.startsWith('sugreev')) return 'sugreev';
    if (npcId.startsWith('jambavan')) return 'jambavan';
    if (npcId.startsWith('vibhishan')) return 'vibhisan';
    if (npcId.startsWith('angad')) return 'angad';
    if (npcId.includes('rakshsa') || npcId.includes('demon') || npcId.startsWith('enc_')) return 'rakshsa';
    if (npcId.includes('bear') || npcId.includes('riksha') || npcId.includes('bhaluu') || npcId === 'soldier_2' || npcId === 'soldier_lanka_2') return 'bhaluu';
    if (npcId.includes('soldier') || npcId.includes('vanar') || npcId.includes('scout') || npcId.includes('forager') || npcId.includes('guard')) return 'vanarsena';
    return 'vanarsena';
  }
}

window.spriteManager = new SpriteManager();
