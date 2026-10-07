/**
 * RAM SENA - Inventory & Devotional Crafting (scripts/inventory.js)
 * Tracks seva resources: sacred stones, wild fruits (Mango, Berries, Apple, Jamun),
 * forest flowers, coconuts, wood, and crafted garlands.
 */

class Inventory {
  constructor() {
    this.items = {
      stones: 0,
      fruits: 0,
      flowers: 0,
      coconuts: 0,
      garlands: 0,
      wood: 0
    };

    // Devotional Seva counters
    this.stats = {
      stonesOfferedToSetu: 0,
      offeringsMade: 0,
      garlandsCrafted: 0
    };
  }

  add(itemKey, amount = 1) {
    if (this.items.hasOwnProperty(itemKey)) {
      this.items[itemKey] += amount;
      if (window.audioManager) {
        window.audioManager.playGatherSound();
      }
      if (window.uiManager) {
        window.uiManager.addLog(
          `Gathered +${amount} ${this.formatItemName(itemKey)}.`,
          'service'
        );
      }
      return true;
    }
    return false;
  }

  remove(itemKey, amount = 1) {
    if (this.items.hasOwnProperty(itemKey) && this.items[itemKey] >= amount) {
      this.items[itemKey] -= amount;
      return true;
    }
    return false;
  }

  canCraftGarland() {
    return this.items.flowers >= 5;
  }

  craftGarland() {
    if (this.canCraftGarland()) {
      this.items.flowers -= 5;
      this.items.garlands += 1;
      this.stats.garlandsCrafted += 1;

      if (window.audioManager) {
        window.audioManager.playTempleBell();
      }

      if (window.uiManager) {
        window.uiManager.showDialogue(
          'Devotional Offering Created (पुष्पमाला)',
          'With pure Bhakti and mindful hands, you wove 5 fragrant forest blossoms into a sacred garland (पुष्पमाला 📿) to offer to Shri Ram or the holy vanguard commanders.',
          '📿'
        );
        window.uiManager.addLog('Crafted a devotional garland from 5 flowers.', 'service');
      }
      return true;
    } else {
      if (window.uiManager) {
        window.uiManager.showDialogue(
          'Insufficient Flowers',
          `You need 5 forest flowers to weave a sacred garland. You currently have ${this.items.flowers} flowers. Shake more trees and flowering clearings!`,
          '🌸'
        );
      }
      return false;
    }
  }

  formatItemName(key) {
    switch (key) {
      case 'stones': return 'Sacred Stone (🪨)';
      case 'fruits': return 'Wild Fruits (🍎/🥭)';
      case 'flowers': return 'Forest Flower (🌸)';
      case 'coconuts': return 'Fresh Coconut (🥥)';
      case 'garlands': return 'Devotional Garland (📿)';
      case 'wood': return 'Dry Wood (🪵)';
      default: return key;
    }
  }

  getSummary() {
    return `Stones: ${this.items.stones} | Fruits: ${this.items.fruits} | Flowers: ${this.items.flowers} | Coconuts: ${this.items.coconuts} | Garlands: ${this.items.garlands} | Wood: ${this.items.wood}`;
  }
}

window.inventory = new Inventory();
