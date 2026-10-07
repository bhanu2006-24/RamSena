/**
 * RAM SENA - 2D RPG Camera (scripts/camera.js)
 * Pokemon RPG-style scrolling camera that follows the player through the world.
 * Clamps to map borders and prevents the full map from being seen at once.
 */

class Camera {
  constructor(viewportWidth = 960, viewportHeight = 540) {
    this.x = 0;
    this.y = 0;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;

    // Follow smoothing factor (1.0 = instant lock, lower = silky smooth lag)
    this.smoothFactor = 0.18;
  }

  resize(width, height) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  update(player, tileSize, mapCols, mapRows) {
    const mapPixelWidth = mapCols * tileSize;
    const mapPixelHeight = mapRows * tileSize;

    // Target position: Center camera on player's visual center
    const playerCenterX = player.visualX * tileSize + tileSize / 2;
    const playerCenterY = player.visualY * tileSize + tileSize / 2;

    let targetX = playerCenterX - this.viewportWidth / 2;
    let targetY = playerCenterY - this.viewportHeight / 2;

    // Clamp camera within map boundaries if map is larger than viewport
    if (mapPixelWidth > this.viewportWidth) {
      targetX = Math.max(0, Math.min(targetX, mapPixelWidth - this.viewportWidth));
    } else {
      // Center map horizontally if smaller than viewport
      targetX = -(this.viewportWidth - mapPixelWidth) / 2;
    }

    if (mapPixelHeight > this.viewportHeight) {
      targetY = Math.max(0, Math.min(targetY, mapPixelHeight - this.viewportHeight));
    } else {
      // Center map vertically if smaller than viewport
      targetY = -(this.viewportHeight - mapPixelHeight) / 2;
    }

    // Smooth camera interpolation towards target
    this.x += (targetX - this.x) * this.smoothFactor;
    this.y += (targetY - this.y) * this.smoothFactor;
  }

  /**
   * Instantly snap camera to player position (e.g. on spawn or map change)
   */
  snapTo(player, tileSize, mapCols, mapRows) {
    const mapPixelWidth = mapCols * tileSize;
    const mapPixelHeight = mapRows * tileSize;

    const playerCenterX = player.visualX * tileSize + tileSize / 2;
    const playerCenterY = player.visualY * tileSize + tileSize / 2;

    let targetX = playerCenterX - this.viewportWidth / 2;
    let targetY = playerCenterY - this.viewportHeight / 2;

    if (mapPixelWidth > this.viewportWidth) {
      targetX = Math.max(0, Math.min(targetX, mapPixelWidth - this.viewportWidth));
    } else {
      targetX = -(this.viewportWidth - mapPixelWidth) / 2;
    }

    if (mapPixelHeight > this.viewportHeight) {
      targetY = Math.max(0, Math.min(targetY, mapPixelHeight - this.viewportHeight));
    } else {
      targetY = -(this.viewportHeight - mapPixelHeight) / 2;
    }

    this.x = targetX;
    this.y = targetY;
  }

  /**
   * Returns range of visible grid columns and rows for frustum culling
   */
  getVisibleBounds(tileSize, mapCols, mapRows) {
    const startCol = Math.max(0, Math.floor(this.x / tileSize));
    const endCol = Math.min(mapCols - 1, Math.ceil((this.x + this.viewportWidth) / tileSize));

    const startRow = Math.max(0, Math.floor(this.y / tileSize));
    const endRow = Math.min(mapRows - 1, Math.ceil((this.y + this.viewportHeight) / tileSize));

    return { startCol, endCol, startRow, endRow };
  }

  worldToScreen(worldX, worldY) {
    return {
      x: Math.round(worldX - this.x),
      y: Math.round(worldY - this.y)
    };
  }
}

window.camera = new Camera(960, 540);
