/**
 * RAM SENA - Player Controller (player.js)
 * Manages player grid movement, collision checks, stats, and rendering.
 * The player is a humble, generic Vanar (or Bear) devotee in Shri Ram's army.
 */

class Player {
  constructor(startX = 10, startY = 6) {
    this.x = startX;
    this.y = startY;
    this.prevX = startX;
    this.prevY = startY;

    // Movement interpolation for smooth visuals
    this.visualX = startX;
    this.visualY = startY;
    this.isMoving = false;
    this.moveProgress = 1.0;
    this.moveSpeed = 0.22; // Speed of lerp between tiles

    this.direction = 'down'; // 'up', 'down', 'left', 'right'
    this.hp = 100;
    this.maxHp = 100;
    this.role = 'Humble Vanar (सेवक)';
    this.symbol = '🐒'; // Generic Vanar placeholder asset

    // Animation tick for idle breathing
    this.animTime = 0;
  }

  tryMove(dx, dy) {
    // Only allow new movement if previous step is mostly finished
    if (this.moveProgress < 0.75) return false;

    const targetX = this.x + dx;
    const targetY = this.y + dy;

    // Update facing direction
    if (dx > 0) this.direction = 'right';
    else if (dx < 0) this.direction = 'left';
    else if (dy > 0) this.direction = 'down';
    else if (dy < 0) this.direction = 'up';

    // Check collision with map
    if (window.mapManager && window.mapManager.isWalkable(targetX, targetY)) {
      this.prevX = this.x;
      this.prevY = this.y;
      this.x = targetX;
      this.y = targetY;
      this.moveProgress = 0;
      this.isMoving = true;

      // Update HUD
      if (window.uiManager) {
        window.uiManager.updateCoordinates(this.x, this.y);
      }
      return true;
    } else {
      // Solid collision feedback
      if (window.uiManager && window.mapManager) {
        const tile = window.mapManager.getTile(targetX, targetY);
        if (tile !== null) {
          const props = TILE_PROPERTIES[tile];
          const name = props ? props.name : 'an obstacle';
          // Mild feedback occasionally
        }
      }
      return false;
    }
  }

  update(deltaTime) {
    this.animTime += deltaTime;

    // Interpolate visual position to grid position
    if (this.moveProgress < 1.0) {
      this.moveProgress += this.moveSpeed * (deltaTime / 16.6);
      if (this.moveProgress >= 1.0) {
        this.moveProgress = 1.0;
        this.isMoving = false;
      }
      this.visualX = this.prevX + (this.x - this.prevX) * this.moveProgress;
      this.visualY = this.prevY + (this.y - this.prevY) * this.moveProgress;
    } else {
      this.visualX = this.x;
      this.visualY = this.y;
    }
  }

  render(ctx, tileSize, offsetX, offsetY) {
    const px = offsetX + this.visualX * tileSize;
    const py = offsetY + this.visualY * tileSize;

    // Subtle idle float/breath offset
    const breathOffset = Math.sin(this.animTime * 0.005) * 1.5;

    ctx.save();

    // 1. Shadow underneath
    ctx.beginPath();
    ctx.ellipse(
      px + tileSize / 2,
      py + tileSize * 0.82,
      tileSize * 0.32,
      tileSize * 0.16,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // 2. Vanar Character Base Tile / Block (Rounded Rect)
    const padding = tileSize * 0.12;
    const size = tileSize - padding * 2;
    const rx = px + padding;
    const ry = py + padding + breathOffset;

    // Devotional subtle aura / halo
    const haloGrad = ctx.createRadialGradient(
      rx + size / 2, ry + size / 2, size * 0.2,
      rx + size / 2, ry + size / 2, size * 0.9
    );
    haloGrad.addColorStop(0, 'rgba(245, 158, 11, 0.28)');
    haloGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(rx + size / 2, ry + size / 2, size * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Character Body Box
    ctx.fillStyle = '#854d0e'; // Warm Vanar Ochre/Brown
    ctx.strokeStyle = '#f59e0b'; // Saffron edge
    ctx.lineWidth = 2.5;

    // Rounded rectangle
    const cornerRadius = 8;
    ctx.beginPath();
    ctx.roundRect(rx, ry, size, size, cornerRadius);
    ctx.fill();
    ctx.stroke();

    // 3. Tilak (Devotional mark on forehead/top center)
    ctx.fillStyle = '#ef4444'; // Red Kumkum
    ctx.beginPath();
    ctx.ellipse(rx + size / 2, ry + size * 0.22, 2.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Yellow Chandan dot
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(rx + size / 2, ry + size * 0.22, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 4. Vanar Emoji / Glyph in Center
    ctx.font = `${Math.floor(size * 0.52)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.symbol, rx + size / 2, ry + size * 0.58);

    // 5. Facing Indicator (small arrow or dot)
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    let indX = rx + size / 2;
    let indY = ry + size / 2;
    const indDist = size * 0.44;

    if (this.direction === 'up') indY -= indDist;
    else if (this.direction === 'down') indY += indDist;
    else if (this.direction === 'left') indX -= indDist;
    else if (this.direction === 'right') indX += indDist;

    ctx.arc(indX, indY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }
}

window.player = new Player(10, 6);
