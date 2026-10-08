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

  setCharacterType(typeId, force = false) {
    if (this.isLocked && !force) {
      return;
    }
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

    if (window.uiManager && window.uiManager.updateRoleHUD) {
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
      bobY = Math.sin(this.animTimer * 0.005) * 2;
    }

    const spriteKey = this.typeId === 'riksha' ? 'bear' : 'vanar';
    const spriteImg = window.spriteManager ? window.spriteManager.getImage(spriteKey) : null;

    if (window.assetRenderer) {
      window.assetRenderer.drawCharacter(
        ctx,
        spriteImg,
        sx,
        sy,
        tileSize,
        bobY,
        this.direction,
        false,
        this.auraColor,
        true
      );
    }
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }
}

window.player = new Player(17, 14);
