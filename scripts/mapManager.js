/**
 * RAM SENA - Map Manager (scripts/mapManager.js)
 * Manages active map states, tile queries, and collisions.
 */

class MapManager {
  constructor() {
    this.currentMap = null;
    this.loadMap(window.CAMP_MAP_DATA);
  }

  loadMap(mapData) {
    this.currentMap = mapData;
    this.id = mapData.id;
    this.phase = mapData.phase;
    this.name = mapData.name;
    this.width = mapData.width;
    this.height = mapData.height;
    this.grid = mapData.grid;
    this.spawnX = mapData.spawnX || 10;
    this.spawnY = mapData.spawnY || 10;
  }

  isWithinBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  getTile(x, y) {
    if (!this.isWithinBounds(x, y)) return null;
    return this.grid[y][x];
  }

  isWalkable(x, y) {
    if (!this.isWithinBounds(x, y)) return false;
    const tileType = this.grid[y][x];
    const props = window.TILE_PROPERTIES[tileType];
    return props ? props.walkable : false;
  }
}

window.mapManager = new MapManager();
