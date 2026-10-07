/**
 * RAM SENA - Maps & Grid Definitions (maps.js)
 * Manages 2D grid arrays, tile types, collisions, and map templates for the 7 scenarios.
 */

const TILE_TYPES = {
  GRASS: 0,
  GRASS_FLOWERS: 1,
  DIRT_PATH: 2,
  TREE: 3,
  ROCK: 4,
  WATER: 5,
  SAND: 6,
  COCONUT_TREE: 7,
  MOUNTAIN: 8
};

const TILE_PROPERTIES = {
  [TILE_TYPES.GRASS]: {
    name: 'Grass',
    walkable: true,
    color: '#2d5a27',
    altColor: '#285222',
    symbol: ''
  },
  [TILE_TYPES.GRASS_FLOWERS]: {
    name: 'Flowering Meadow',
    walkable: true,
    color: '#2e5e29',
    symbol: '🌸'
  },
  [TILE_TYPES.DIRT_PATH]: {
    name: 'Sacred Path',
    walkable: true,
    color: '#5c4827',
    altColor: '#534021',
    symbol: ''
  },
  [TILE_TYPES.TREE]: {
    name: 'Forest Tree',
    walkable: false,
    color: '#183816',
    symbol: '🌳'
  },
  [TILE_TYPES.ROCK]: {
    name: 'Stone Boulder',
    walkable: false,
    color: '#475569',
    symbol: '🪨'
  },
  [TILE_TYPES.WATER]: {
    name: 'Sacred Ocean',
    walkable: false,
    color: '#1e3a8a',
    symbol: '🌊'
  },
  [TILE_TYPES.SAND]: {
    name: 'Shore Sand',
    walkable: true,
    color: '#b59a57',
    symbol: ''
  },
  [TILE_TYPES.COCONUT_TREE]: {
    name: 'Coconut Palm',
    walkable: false,
    color: '#14532d',
    symbol: '🌴'
  },
  [TILE_TYPES.MOUNTAIN]: {
    name: 'Sacred Mountain',
    walkable: false,
    color: '#334155',
    symbol: '⛰️'
  }
};

/**
 * Initial Bounded Camp Grid: 20 columns x 12 rows
 * Surrounded by solid trees and ancient stone borders.
 */
const INITIAL_CAMP_GRID = [
  // Row 0: North solid border
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  // Row 1
  [3, 0, 0, 0, 0, 0, 0, 1, 0, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 3],
  // Row 2
  [3, 0, 1, 0, 4, 0, 0, 0, 0, 2, 2, 0, 0, 0, 4, 0, 1, 0, 0, 3],
  // Row 3
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  // Row 4
  [3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3],
  // Row 5
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  // Row 6
  [3, 0, 1, 0, 0, 0, 0, 1, 0, 2, 2, 0, 1, 0, 0, 0, 1, 0, 0, 3],
  // Row 7
  [3, 0, 0, 0, 4, 0, 0, 0, 0, 2, 2, 0, 0, 0, 4, 0, 0, 0, 0, 3],
  // Row 8
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  // Row 9
  [3, 0, 1, 0, 0, 0, 0, 1, 0, 2, 2, 0, 1, 0, 0, 0, 1, 0, 0, 3],
  // Row 10
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  // Row 11: South solid border
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
];

class MapManager {
  constructor() {
    this.currentMapId = 'phase1_camp';
    this.currentPhase = 1;
    this.width = 20;
    this.height = 12;
    this.grid = INITIAL_CAMP_GRID;
    this.title = 'Vanar Camp (Phase 1)';
  }

  isWithinBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  getTile(x, y) {
    if (!this.isWithinBounds(x, y)) {
      return null;
    }
    return this.grid[y][x];
  }

  isWalkable(x, y) {
    if (!this.isWithinBounds(x, y)) {
      return false;
    }
    const tileType = this.grid[y][x];
    const props = TILE_PROPERTIES[tileType];
    return props ? props.walkable : false;
  }
}

// Global instance
window.mapManager = new MapManager();
