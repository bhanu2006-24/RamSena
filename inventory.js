/**
 * RAM SENA - Inventory & Service Offerings (inventory.js)
 * Manages gathered items for seva (stones, fruits, flowers, coconuts, garlands).
 */

class Inventory {
  constructor() {
    this.items = {
      stones: 0,
      fruits: 0,
      flowers: 0,
      coconuts: 0,
      garlands: 0
    };
  }

  add(itemKey, amount = 1) {
    if (this.items.hasOwnProperty(itemKey)) {
      this.items[itemKey] += amount;
      if (window.uiManager) {
        window.uiManager.addLog(`Gathered +${amount} ${this.formatItemName(itemKey)}.`, 'service');
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
      if (window.uiManager) {
        window.uiManager.addLog('With humble hands, you crafted a sacred garland 🌸 from 5 flowers.', 'service');
      }
      return true;
    }
    return false;
  }

  formatItemName(key) {
    switch (key) {
      case 'stones': return 'Sacred Stone (🪨)';
      case 'fruits': return 'Wild Fruit (🍎)';
      case 'flowers': return 'Forest Flower (🌸)';
      case 'coconuts': return 'Coconut (🥥)';
      case 'garlands': return 'Devotional Garland (📿)';
      default: return key;
    }
  }

  getSummary() {
    return `Stones: ${this.items.stones} | Fruits: ${this.items.fruits} | Flowers: ${this.items.flowers} | Coconuts: ${this.items.coconuts} | Garlands: ${this.items.garlands}`;
  }
}

window.inventory = new Inventory();
