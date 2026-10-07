/**
 * RAM SENA - Player Entity (scripts/player.js)
 * Manages character stats, archetype stats (Vanar vs Riksha/Bear),
 * Pokemon-style grid movement, step completion, and rendering.
 */

class Player {
  constructor(startX = 17, startY = 14) {
    this.x = startX;
    this.y = startY;
    this.prevX = startX;
    this.prevY = startY;

    // Movement interpolation
    this.visualX = startX;
    this.visualY = startY;
    this.isMoving = false;
    this.moveProgress = 1.0;

    this.direction = 'down';

    // Default Archetype setup
    this.setCharacterType('vanar');

    this.animTimer = 0;
    this.stepCycle = 0;
  }

  setCharacterType(typeId) {
    const isBear = typeId.toLowerCase() === 'riksha';
    this.typeId = isBear ? 'riksha' : 'vanar';

    if (isBear) {
      this.typeName = 'Riksha Sevaka (ऋक्ष - भालू)';
      this.role = this.typeName;
      this.symbol = '🐻';
      this.color = '#451a03';
      this.borderColor = '#d97706';
      this.auraColor = 'rgba(217, 119, 6, 0.4)';
      this.hp = 130;
      this.maxHp = 130;
      this.attackStat = 28;
      this.defenseStat = 18;
      this.agilityStat = 14;
      this.critChance = 0.12;
      this.moveSpeed = 0.20;
    } else {
      this.typeName = 'Vanar Sevaka (वानर)';
      this.role = this.typeName;
      this.symbol = '🐒';
      this.color = '#854d0e';
      this.borderColor = '#f59e0b';
      this.auraColor = 'rgba(245, 158, 11, 0.35)';
      this.hp = 100;
      this.maxHp = 100;
      this.attackStat = 22;
      this.defenseStat = 11;
      this.agilityStat = 26;
      this.critChance = 0.22;
      this.moveSpeed = 0.24;
    }

    if (window.uiManager) {
      window.uiManager.updateRoleHUD(this.typeName, this.symbol);
    }
  }

  tryMove(dx, dy) {
    // Face direction immediately
    if (dx > 0) this.direction = 'right';
    else if (dx < 0) this.direction = 'left';
    else if (dy > 0) this.direction = 'down';
    else if (dy < 0) this.direction = 'up';

    if (this.moveProgress < 0.82) return false;

    const targetX = this.x + dx;
    const targetY = this.y + dy;

    // Check Battlefield Encounter initiation
    if (window.mapManager && window.mapManager.currentMapId === 'field') {
      const enc = window.mapManager.encounters.find(e => e.x === targetX && e.y === targetY && !e.defeated);
      if (enc) {
        window.combatSystem.startBattle(enc.id, enc.enemyType);
        return false;
      }
    }

    // Check walkability
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
    }

    return false;
  }

  update(deltaTime) {
    this.animTimer += deltaTime;

    if (this.moveProgress < 1.0) {
      this.moveProgress += this.moveSpeed * (deltaTime / 16.6);
      if (this.moveProgress >= 1.0) {
        this.moveProgress = 1.0;
        this.isMoving = false;
        this.onStepCompleted();
      }
      this.visualX = this.prevX + (this.x - this.prevX) * this.moveProgress;
      this.visualY = this.prevY + (this.y - this.prevY) * this.moveProgress;
    } else {
      this.visualX = this.x;
      this.visualY = this.y;
    }
  }

  onStepCompleted() {
    // Check if player stepped on a map portal
    if (window.mapManager) {
      window.mapManager.checkPortal(this.x, this.y);
    }
  }

  render(ctx, tileSize) {
    const screenPos = window.camera.worldToScreen(
      this.visualX * tileSize,
      this.visualY * tileSize
    );

    const sx = screenPos.x;
    const sy = screenPos.y;

    let bobY = 0;
    if (this.isMoving) {
      bobY = -Math.sin(this.moveProgress * Math.PI) * (tileSize * 0.12);
    } else {
      bobY = Math.sin(this.animTimer * 0.005) * 1.5;
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

    // 3. Body Box
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

    // 5. Archetype Symbol
    ctx.font = `${Math.floor(size * 0.54)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.symbol, rx + size / 2, ry + size * 0.58);

    // 6. Directional Pip
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

window.player = new Player(17, 14);
