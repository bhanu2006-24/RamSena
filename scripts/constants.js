/**
 * RAM SENA - Global Constants (scripts/constants.js)
 * Defines tile properties, game states, directions, and character archetypes.
 */

const GAME_STATES = {
  MENU: 'MENU',
  OVERWORLD: 'OVERWORLD',
  DIALOGUE: 'DIALOGUE',
  COMBAT: 'COMBAT'
};

const CHARACTER_TYPES = {
  VANAR: {
    id: 'vanar',
    name: 'Vanar Sevaka (वानर)',
    subtitle: 'Agile & Devoted Monkey Devotee of Kishkindha',
    symbol: '🐒',
    color: '#b45309',
    borderColor: '#f59e0b',
    auraColor: 'rgba(245, 158, 11, 0.3)',
    hp: 100,
    speed: 0.22,
    lore: 'Filled with boundless energy and reverence, you leap forward to carry stones and offer wild fruits.'
  },
  RIKSHA: {
    id: 'riksha',
    name: 'Riksha Sevaka (ऋक्ष - भालू)',
    subtitle: 'Sturdy & Stalwart Bear Warrior of Jambavan’s Clan',
    symbol: '🐻',
    color: '#451a03',
    borderColor: '#d97706',
    auraColor: 'rgba(217, 119, 6, 0.35)',
    hp: 120,
    speed: 0.18,
    lore: 'Endowed with patient strength and ancient wisdom, you lift mighty boulders in devotion to Shri Ram.'
  }
};

const TILE_TYPES = {
  GRASS: 0,
  GRASS_FLOWERS: 1,
  DIRT_PATH: 2,
  TREE: 3,
  ROCK: 4,
  WATER: 5,
  SAND: 6,
  COCONUT_TREE: 7,
  MOUNTAIN: 8,
  SACRED_FIRE: 9,
  FLAG_BANNER: 10,
  CAMP_TENT: 11
};

const TILE_PROPERTIES = {
  [TILE_TYPES.GRASS]: {
    name: 'Lush Meadow',
    walkable: true,
    color: '#264e22',
    altColor: '#22461e',
    symbol: ''
  },
  [TILE_TYPES.GRASS_FLOWERS]: {
    name: 'Floral Clearing',
    walkable: true,
    color: '#295424',
    symbol: '🌸'
  },
  [TILE_TYPES.DIRT_PATH]: {
    name: 'Camp Pathway',
    walkable: true,
    color: '#5c4627',
    altColor: '#533e21',
    symbol: ''
  },
  [TILE_TYPES.TREE]: {
    name: 'Ancient Tree',
    walkable: false,
    color: '#143513',
    symbol: '🌳'
  },
  [TILE_TYPES.ROCK]: {
    name: 'Sacred Boulder',
    walkable: false,
    color: '#475569',
    symbol: '🪨'
  },
  [TILE_TYPES.WATER]: {
    name: 'Ocean Waters',
    walkable: false,
    color: '#1e3a8a',
    symbol: '🌊'
  },
  [TILE_TYPES.SAND]: {
    name: 'Shoreline Sand',
    walkable: true,
    color: '#c29d59',
    symbol: ''
  },
  [TILE_TYPES.COCONUT_TREE]: {
    name: 'Coconut Palm',
    walkable: false,
    color: '#134e27',
    symbol: '🌴'
  },
  [TILE_TYPES.MOUNTAIN]: {
    name: 'Sacred Hill',
    walkable: false,
    color: '#334155',
    symbol: '⛰️'
  },
  [TILE_TYPES.SACRED_FIRE]: {
    name: 'Sacred Yajna Fire',
    walkable: false,
    color: '#7c2d12',
    symbol: '🔥'
  },
  [TILE_TYPES.FLAG_BANNER]: {
    name: 'Dharma Dhwaja Banner',
    walkable: false,
    color: '#9a3412',
    symbol: '🚩'
  },
  [TILE_TYPES.CAMP_TENT]: {
    name: 'Camp Pavilion',
    walkable: false,
    color: '#78350f',
    symbol: '⛺'
  }
};

window.GAME_STATES = GAME_STATES;
window.CHARACTER_TYPES = CHARACTER_TYPES;
window.TILE_TYPES = TILE_TYPES;
window.TILE_PROPERTIES = TILE_PROPERTIES;
