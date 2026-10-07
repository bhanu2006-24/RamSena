/**
 * RAM SENA - Player Entity (scripts/player.js)
 * Manages character stats, archetype (Vanar vs Riksha/Bear), Pokemon-style grid movement,
 * step interpolation, collision detection, and rendering.
 */

class Player {
  constructor(startX = 18, startY = 15) {
    this.x = startX;
    this.y = startY;
    this.prevX = startX;
    this.prevY = startY;

    // Smooth movement interpolation for Pokemon-like walking
    this.visualX = startX;
    this.visualY = startY;
    this.isMoving = false;
    this.moveProgress = 1.0;

    this.direction = 'down'; // 'up', 'down', 'left', 'right'

    // Character Archetype setup (default Vanar)
    this.setCharacterType('vanar');

    // Animation timer for walking steps and breathing
    this.animTimer = 0;
    this.stepCycle = 0;
  }

  setCharacterType(typeId) {
    const config = window.CHARACTER_TYPES[typeId.toUpperCase()] || window.CHARACTER_TYPES.VANAR;
    this.typeId = config.id;
    this.typeName = config.name;
    this.role = config.name;
    this.symbol = config.symbol;
    this.color = config.color;
    this.borderColor = config.borderColor;
    this.auraColor = config.auraColor;
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.moveSpeed = config.speed || 0.22;

    if (window.uiManager) {
      window.uiManager.updateRoleHUD(this.typeName, this.symbol);
    }
  }

  tryMove(dx, dy) {
    // Determine direction immediately (Pokemon responsive feel)
    if (dx > 0) this.direction = 'right';
    else if (dx < 0) this.direction = 'left';
    else if (dy > 0) this.direction = 'down';
    else if (dy < 0) this.direction = 'up';

    // Prevent new step if current step is still in progress
    if (this.moveProgress < 0.85) return false;

    const targetX = this.x + dx;
    const targetY = this.y + dy;

    // Check collision against current map
    if (window.mapManager && window.mapManager.isWalkable(targetX, targetY)) {
      this.prevX = this.x;
      this.prevY = this.y;
      this.x = targetX;
      this.y = targetY;
      this.moveProgress = 0;
      this.isMoving = true;
      this.stepCycle = (this.stepCycle + 1) % 4;

      if (window.uiManager) {
        window.uiManager.updateCoordinates(this.x, this.y);
      }
      return true;
    } else {
      // Gentle obstacle bump sound/log if needed
      return false;
    }
  }

  update(deltaTime) {
    this.animTimer += deltaTime;

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

  render(ctx, tileSize) {
    // Convert world coordinates to camera viewport screen position
    const screenPos = window.camera.worldToScreen(
      this.visualX * tileSize,
      this.visualY * tileSize
    );

    const sx = screenPos.x;
    const sy = screenPos.y;

    // Pokemon walking step bob animation
    let bobY = 0;
    if (this.isMoving) {
      bobY = -Math.sin(this.moveProgress * Math.PI) * (tileSize * 0.12);
    } else {
      bobY = Math.sin(this.animTimer * 0.005) * 1.5; // Idle breathing
    }

    ctx.save();

    // 1. Drop Shadow
    ctx.beginPath();
    ctx.ellipse(
      sx + tileSize / 2,
      sy + tileSize * 0.84,
      tileSize * 0.34,
      tileSize * 0.18,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.fill();

    // 2. Devotional Aura
    const size = tileSize * 0.78;
    const padding = (tileSize - size) / 2;
    const rx = sx + padding;
    const ry = sy + padding + bobY;

    const auraGrad = ctx.createRadialGradient(
      rx + size / 2, ry + size / 2, size * 0.15,
      rx + size / 2, ry + size / 2, size * 0.85
    );
    auraGrad.addColorStop(0, this.auraColor);
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(rx + size / 2, ry + size / 2, size * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // 3. Main Character Box
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.roundRect(rx, ry, size, size, 8);
    ctx.fill();
    ctx.stroke();

    // 4. Sacred Tilak Mark (Red Kumkum & Chandan)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.ellipse(rx + size / 2, ry + size * 0.22, 2.2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(rx + size / 2, ry + size * 0.22, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 5. Archetype Symbol / Emoji (🐒 for Vanar, 🐻 for Bear)
    ctx.font = `${Math.floor(size * 0.54)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.symbol, rx + size / 2, ry + size * 0.58);

    // 6. Directional Facing Pip
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    let indX = rx + size / 2;
    let indY = ry + size / 2;
    const indDist = size * 0.46;

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

window.player = new Player();
