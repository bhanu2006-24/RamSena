/**
 * RAM SENA - Main Game Engine (scripts/main.js)
 * Fullscreen 2D Pokemon RPG game loop, dynamic resolution scaling,
 * input handling, NPC/world interactions, and map transitions.
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Dynamic Fullscreen Resolution
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight;

    // Pokemon GBA Scale: Target ~15 tiles across viewport (110px - 130px per tile)
    this.tileSize = this.calculateTileSize();

    this.state = window.GAME_STATES.MENU;
    this.lastTime = performance.now();
    this.animClock = 0;

    this.initCanvas();
    this.initInput();
  }

  calculateTileSize() {
    // Authentic GBA Pokemon Scale: Target ~15 tiles across screen
    return Math.max(105, Math.min(130, Math.floor(window.innerWidth / 15)));
  }

  initCanvas() {
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight;
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.tileSize = this.calculateTileSize();

    if (window.camera) {
      window.camera.resize(this.canvasWidth, this.canvasHeight);
    }
  }

  initInput() {
    // Unlock BGM on first user interaction
    const unlockAudio = () => {
      if (window.audioManager && !window.audioManager.isPlayingBGM && !window.audioManager.isMuted) {
        window.audioManager.startBGM();
      }
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    window.addEventListener('keydown', (e) => {
      // Prevent browser scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key)) {
        e.preventDefault();
      }

      // 0. Global Volume Hotkeys (+ / -)
      if (e.code === 'Equal' || e.code === 'NumpadAdd' || e.key === '+') {
        if (window.audioManager) {
          window.audioManager.volumeUp();
          if (window.uiManager) window.uiManager.updateOptionsDisplay();
        }
        return;
      }
      if (e.code === 'Minus' || e.code === 'NumpadSubtract' || e.key === '-') {
        if (window.audioManager) {
          window.audioManager.volumeDown();
          if (window.uiManager) window.uiManager.updateOptionsDisplay();
        }
        return;
      }

      // 1. If modals (About, Options) are open, X, B, or Esc closes them
      if (window.uiManager && window.uiManager.isModalOpen()) {
        if (['KeyX', 'KeyB', 'Escape'].includes(e.code)) {
          window.uiManager.closeModals();
          return;
        }
      }

      // 2. If Character Selection screen is open
      if (window.uiManager && window.uiManager.isCharSelectOpen()) {
        if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(e.code)) {
          const cur = window.uiManager.selectedArchetype;
          window.uiManager.selectArchetype(cur === 'vanar' ? 'riksha' : 'vanar');
          return;
        }
        if (['Enter', 'KeyZ', 'Space'].includes(e.code)) {
          window.uiManager.confirmCharacterAndStart();
          return;
        }
        if (['KeyX', 'KeyB', 'Escape'].includes(e.code)) {
          window.uiManager.closeCharacterSelect();
          return;
        }
        return;
      }

      // 3. If Title Screen is open
      if (window.uiManager && window.uiManager.isTitleScreenOpen()) {
        if (['Enter', 'KeyZ', 'Space'].includes(e.code)) {
          window.uiManager.openCharacterSelect();
          return;
        }
        return;
      }

      // 4. If Dialogue is active, Z, Enter, Space, or E advances dialogue; Esc or X hides it
      if (window.uiManager && window.uiManager.isDialogueOpen()) {
        if (['KeyX', 'Escape'].includes(e.code)) {
          window.uiManager.hideDialogue();
          return;
        }
        if (['KeyZ', 'KeyE', 'Enter', 'Space'].includes(e.code)) {
          window.uiManager.advanceDialogue();
          return;
        }
        return;
      }

      // 5. If GBA Start Menu is open, Up/Down navigates, Z/Enter selects, X/Esc/M closes
      if (window.uiManager && window.uiManager.isMenuOpen()) {
        if (e.code === 'KeyW' || e.code === 'ArrowUp') {
          window.uiManager.navigateMenu(-1);
          return;
        } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
          window.uiManager.navigateMenu(1);
          return;
        } else if (e.code === 'KeyZ' || e.code === 'Enter' || e.code === 'KeyE') {
          window.uiManager.triggerSelectedMenuAction();
          return;
        } else if (['KeyX', 'KeyB', 'KeyM', 'Escape'].includes(e.code)) {
          window.uiManager.closeStartMenu();
          return;
        }
      }

      // 6. If Bag or Sevaka Card is open, X, Esc, or B closes it
      if (window.uiManager && window.uiManager.isBagOpen()) {
        if (['KeyX', 'KeyB', 'KeyI', 'Escape'].includes(e.code)) {
          window.uiManager.closeBag();
          return;
        }
      }

      if (window.uiManager && window.uiManager.isSevakaCardOpen()) {
        if (['KeyX', 'Escape'].includes(e.code)) {
          window.uiManager.closeSevakaCard();
          return;
        }
      }

      // 7. Overworld Direct Hotkeys
      if (['KeyB', 'KeyI'].includes(e.code)) {
        if (window.uiManager) {
          window.uiManager.toggleBag();
          return;
        }
      }

      if (e.code === 'KeyO') {
        if (window.uiManager) {
          window.uiManager.toggleOptions();
          return;
        }
      }

      if (e.code === 'KeyM') {
        if (window.uiManager) {
          window.uiManager.toggleStartMenu();
          return;
        }
      }

      // 8. Overworld Movement & Action Controls
      if (this.state !== window.GAME_STATES.OVERWORLD) return;

      // Start Button: Opens/Toggles GBA Start Menu
      if (e.code === 'Enter') {
        if (window.uiManager) {
          window.uiManager.toggleStartMenu();
        }
        return;
      }

      // Interact: Z, E, or Space
      if (['KeyZ', 'KeyE', 'Space'].includes(e.code)) {
        this.handleInteract();
        return;
      }

      // Movement: Arrows or WASD
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        window.player.tryMove(0, -1);
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        window.player.tryMove(0, 1);
      } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        window.player.tryMove(-1, 0);
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        window.player.tryMove(1, 0);
      }

      // Hail Shortcut (H)
      if (e.code === 'KeyH') {
        if (window.audioManager) {
          window.audioManager.hailShriRam();
        }
      }
    });
  }

  handleInteract() {
    if (this.state !== window.GAME_STATES.OVERWORLD) return;

    // Tile directly in front of player
    let targetX = window.player.x;
    let targetY = window.player.y;

    if (window.player.direction === 'up') targetY -= 1;
    else if (window.player.direction === 'down') targetY += 1;
    else if (window.player.direction === 'left') targetX -= 1;
    else if (window.player.direction === 'right') targetX += 1;

    // 1. Check NPC interaction
    if (window.npcManager) {
      const npc = window.npcManager.getNPCAt(targetX, targetY) || window.npcManager.getNPCAt(window.player.x, window.player.y);
      if (npc) {
        window.npcManager.interactWithNPC(npc);
        return;
      }
    }

    // 2. Check Battlefield Encounter on Field map
    if (window.mapManager && window.mapManager.currentMapId === 'field') {
      const enc = window.mapManager.encounters.find(e => e.x === targetX && e.y === targetY && !e.defeated);
      if (enc) {
        window.combatSystem.startBattle(enc.id, enc.enemyType);
        return;
      }
    }

    // 3. Environment tile interactions
    const tile = window.mapManager.getTile(targetX, targetY);

    if (tile === window.TILE_TYPES.SACRED_FIRE) {
      window.uiManager.showDialogue(
        'Sacred Yajna Altar (पवित्र यज्ञवेदी)',
        'The sacred fire blazes bright with clarified butter and holy chants. You offer prayers with folded hands (प्रणाम 🙏).',
        '🔥'
      );
    } else if (tile === window.TILE_TYPES.FLAG_BANNER) {
      window.uiManager.showDialogue(
        'Dharma Dhwaja (धर्म ध्वज)',
        'The saffron flag flutters in the sea breeze, carrying the seal of Suryavansha.',
        '🚩'
      );
    } else if (tile === window.TILE_TYPES.TREE) {
      this.interactWithRandomTree();
    } else if (tile === window.TILE_TYPES.COCONUT_TREE) {
      window.inventory.add('coconuts', 1);
      window.uiManager.showDialogue(
        'Coconut Palm',
        'You climbed the sturdy palm and brought down a fresh coconut (श्रीफल 🥥) for the army.',
        '🥥'
      );
    } else if (tile === window.TILE_TYPES.ROCK) {
      if (window.mapManager.phase === 1) {
        window.inventory.add('stones', 1);
        window.uiManager.showDialogue(
          'Sacred Mountain Stone',
          'You lifted a solid stone (🪨). Bring it to Nal and Neel on the beach to build Ram Setu!',
          '🪨'
        );
      } else {
        window.uiManager.showDialogue(
          'Ancient Boulders of Lanka',
          'Heavy stones that withstand the wind and war of Lanka.',
          '🪨'
        );
      }
    } else if (tile === window.TILE_TYPES.MOUNTAIN) {
      window.uiManager.showDialogue(
        'Sacred Foothills',
        'Towering peaks where holy sages meditate. You bow with reverence to the earth.',
        '⛰️'
      );
    } else {
      window.uiManager.showDialogue('Humble Vanar', 'You bow with folded hands: "जय श्री राम!"', '🙏');
    }
  }

  interactWithRandomTree() {
    const roll = Math.random();

    if (roll < 0.25) {
      window.inventory.add('fruits', 1);
      window.uiManager.showDialogue(
        'Wild Fruit Tree',
        'You shook the lush branches and a ripe golden Mango (आम 🥭) dropped into your hands!',
        '🥭'
      );
    } else if (roll < 0.45) {
      window.inventory.add('fruits', 1);
      window.uiManager.showDialogue(
        'Wild Fruit Tree',
        'You gathered sweet forest berries (बेर 🍒), sweet as Mata Shabari\'s devotion.',
        '🍒'
      );
    } else if (roll < 0.65) {
      window.inventory.add('fruits', 1);
      window.uiManager.showDialogue(
        'Wild Fruit Tree',
        'You gathered wild forest fruits (🍎 / 🫐) to nourish the soldiers.',
        '🍎'
      );
    } else if (roll < 0.85) {
      window.inventory.add('flowers', 2);
      window.uiManager.showDialogue(
        'Flowering Tree',
        'Fragrant blossoms (🌸) fluttered down into your hands! Collect 5 to weave a garland in your Bag.',
        '🌸'
      );
    } else {
      window.inventory.add('wood', 1);
      window.uiManager.showDialogue(
        'Forest Tree',
        'You gathered sturdy dry branches (🪵) for the campfires.',
        '🪵'
      );
    }
  }

  start() {
    if (window.mapManager) {
      window.mapManager.registerMaps();
    }

    if (window.camera && window.player) {
      window.camera.snapTo(
        window.player,
        this.tileSize,
        window.mapManager.width,
        window.mapManager.height
      );
    }

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  gameLoop(currentTime) {
    const deltaTime = Math.min(currentTime - this.lastTime, 100);
    this.lastTime = currentTime;
    this.animClock += deltaTime;

    if (this.state === window.GAME_STATES.OVERWORLD) {
      this.handleContinuousMovement();
      window.player.update(deltaTime);
      window.camera.update(
        window.player,
        this.tileSize,
        window.mapManager.width,
        window.mapManager.height
      );
      if (window.npcManager) {
        window.npcManager.update(deltaTime);
      }
      if (window.uiManager) {
        window.uiManager.updateHUD();
      }
    }

    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  handleContinuousMovement() {
    if (window.player.moveProgress >= 0.88) {
      const { dx, dy } = window.inputHandler.getMovementVector();
      if (dx !== 0 || dy !== 0) {
        window.player.tryMove(dx, dy);
      }
    }
  }

  render() {
    const ctx = this.ctx;

    // Clear background
    ctx.fillStyle = '#040711';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 1. Render World Tiles
    this.renderWorld(ctx);

    // 2. Render Field Encounters
    this.renderFieldEncounters(ctx);

    // 3. Render NPCs
    if (window.npcManager) {
      window.npcManager.render(ctx, this.tileSize);
    }

    // 4. Render Player
    if (window.player) {
      window.player.render(ctx, this.tileSize);
    }

    // 5. Ambient Vignette
    this.renderAmbientOverlay(ctx);
  }

  renderWorld(ctx) {
    const ts = this.tileSize;
    const grid = window.mapManager.grid;
    const cols = window.mapManager.width;
    const rows = window.mapManager.height;

    const bounds = window.camera.getVisibleBounds(ts, cols, rows);

    for (let r = bounds.startRow; r <= bounds.endRow; r++) {
      for (let c = bounds.startCol; c <= bounds.endCol; c++) {
        const tileType = grid[r][c];
        const props = window.TILE_PROPERTIES[tileType] || window.TILE_PROPERTIES[window.TILE_TYPES.GRASS];

        const screenPos = window.camera.worldToScreen(c * ts, r * ts);
        const sx = screenPos.x;
        const sy = screenPos.y;

        // Base ground fill
        ctx.fillStyle = props.color;
        ctx.fillRect(sx, sy, ts, ts);

        // Modern Procedural Tile Rendering
        switch (tileType) {
          case window.TILE_TYPES.GRASS:
            this.drawGrass(ctx, sx, sy, ts, r, c);
            break;
          case window.TILE_TYPES.GRASS_FLOWERS:
            this.drawFlowers(ctx, sx, sy, ts, r, c);
            break;
          case window.TILE_TYPES.DIRT_PATH:
            if ((r + c) % 2 === 0) {
              ctx.fillStyle = props.altColor || '#533e21';
              ctx.fillRect(sx, sy, ts, ts);
            }
            ctx.fillStyle = 'rgba(217, 119, 6, 0.18)';
            ctx.fillRect(sx + ts * 0.45, sy + ts * 0.45, 4, 3);
            break;
          case window.TILE_TYPES.SAND:
            if ((r + c) % 3 === 0) {
              ctx.fillStyle = 'rgba(254, 243, 199, 0.15)';
              ctx.fillRect(sx + ts * 0.3, sy + ts * 0.3, 3, 3);
            }
            break;
          case window.TILE_TYPES.WATER:
            this.drawWater(ctx, sx, sy, ts, this.animClock, c, r);
            break;
          case window.TILE_TYPES.TREE:
            this.drawTree(ctx, sx, sy, ts, this.animClock, c, r);
            break;
          case window.TILE_TYPES.COCONUT_TREE:
            this.drawCoconutTree(ctx, sx, sy, ts, this.animClock, c, r);
            break;
          case window.TILE_TYPES.ROCK:
            this.drawRock(ctx, sx, sy, ts);
            break;
          case window.TILE_TYPES.MOUNTAIN:
            this.drawMountain(ctx, sx, sy, ts);
            break;
          case window.TILE_TYPES.SACRED_FIRE:
            this.drawSacredFire(ctx, sx, sy, ts, this.animClock, c);
            break;
          case window.TILE_TYPES.FLAG_BANNER:
            this.drawFlagBanner(ctx, sx, sy, ts, this.animClock);
            break;
          case window.TILE_TYPES.CAMP_TENT:
            this.drawCampTent(ctx, sx, sy, ts);
            break;
          default:
            if (props.symbol) {
              ctx.font = `${Math.floor(ts * 0.56)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(props.symbol, sx + ts / 2, sy + ts / 2);
            }
            break;
        }

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx, sy, ts, ts);
      }
    }
  }

  drawGrass(ctx, sx, sy, ts, r, c) {
    if ((r + c) % 2 === 0) {
      ctx.fillStyle = '#22461e';
      ctx.fillRect(sx, sy, ts, ts);
    }
    ctx.fillStyle = 'rgba(74, 222, 128, 0.22)';
    ctx.fillRect(sx + ts * 0.2, sy + ts * 0.4, 2, 5);
    ctx.fillRect(sx + ts * 0.24, sy + ts * 0.36, 2, 6);
    ctx.fillRect(sx + ts * 0.7, sy + ts * 0.65, 2, 5);
    ctx.fillRect(sx + ts * 0.74, sy + ts * 0.61, 2, 7);
  }

  drawFlowers(ctx, sx, sy, ts, r, c) {
    this.drawGrass(ctx, sx, sy, ts, r, c);
    const flowers = [
      { x: sx + ts * 0.28, y: sy + ts * 0.32, color: '#f472b6', size: 3.5 },
      { x: sx + ts * 0.72, y: sy + ts * 0.45, color: '#fb7185', size: 4 },
      { x: sx + ts * 0.45, y: sy + ts * 0.75, color: '#fbcfe8', size: 3 }
    ];

    flowers.forEach(f => {
      ctx.fillStyle = f.color;
      for (let i = 0; i < 5; i++) {
        const ang = (i * 2 * Math.PI) / 5;
        ctx.beginPath();
        ctx.arc(f.x + Math.cos(ang) * (f.size * 0.8), f.y + Math.sin(ang) * (f.size * 0.8), f.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size * 0.45, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawTree(ctx, sx, sy, ts, clock, c, r) {
    const cx = sx + ts / 2;
    const cy = sy + ts / 2;
    const sway = Math.sin(clock * 0.002 + c * 1.5 + r) * 2;

    // Drop Shadow
    ctx.beginPath();
    ctx.ellipse(cx, sy + ts * 0.86, ts * 0.38, ts * 0.16, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Trunk
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.12, sy + ts * 0.85);
    ctx.lineTo(cx - ts * 0.07, cy);
    ctx.lineTo(cx + ts * 0.07, cy);
    ctx.lineTo(cx + ts * 0.12, sy + ts * 0.85);
    ctx.closePath();
    ctx.fill();

    // Bark highlight
    ctx.fillStyle = '#78350f';
    ctx.fillRect(cx - ts * 0.04, cy + ts * 0.08, ts * 0.05, ts * 0.28);

    // Deep Canopy Layer 1 (Dark Shadow Green)
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.arc(cx - ts * 0.2 + sway * 0.5, cy - ts * 0.05, ts * 0.26, 0, Math.PI * 2);
    ctx.arc(cx + ts * 0.2 + sway * 0.5, cy - ts * 0.05, ts * 0.26, 0, Math.PI * 2);
    ctx.arc(cx + sway * 0.5, cy - ts * 0.22, ts * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Mid Foliage Layer 2 (Lush Emerald)
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(cx - ts * 0.14 + sway, cy - ts * 0.1, ts * 0.24, 0, Math.PI * 2);
    ctx.arc(cx + ts * 0.14 + sway, cy - ts * 0.1, ts * 0.24, 0, Math.PI * 2);
    ctx.arc(cx + sway, cy - ts * 0.24, ts * 0.27, 0, Math.PI * 2);
    ctx.fill();

    // Canopy Highlight Layer 3 (Golden Sunlit Crest)
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(cx - ts * 0.08 + sway, cy - ts * 0.22, ts * 0.16, 0, Math.PI * 2);
    ctx.arc(cx + ts * 0.08 + sway, cy - ts * 0.26, ts * 0.14, 0, Math.PI * 2);
    ctx.fill();

    // Scattered Ripe Wild Fruits
    if ((c + r) % 2 === 0) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx - ts * 0.16 + sway, cy - ts * 0.12, 3, 0, Math.PI * 2);
      ctx.arc(cx + ts * 0.15 + sway, cy - ts * 0.06, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawCoconutTree(ctx, sx, sy, ts, clock, c, r) {
    const cx = sx + ts / 2;
    const baseCy = sy + ts * 0.88;
    const sway = Math.sin(clock * 0.0025 + c * 2) * 2.5;

    // Drop Shadow
    ctx.beginPath();
    ctx.ellipse(cx, baseCy, ts * 0.32, ts * 0.14, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Curved Trunk
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = ts * 0.14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, baseCy);
    ctx.quadraticCurveTo(cx - ts * 0.12, sy + ts * 0.45, cx + sway, sy + ts * 0.26);
    ctx.stroke();

    // Trunk ridges
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2;
    for (let i = 1; i <= 3; i++) {
      const ty = baseCy - (i * ts * 0.18);
      ctx.beginPath();
      ctx.moveTo(cx - ts * 0.08, ty);
      ctx.lineTo(cx + ts * 0.04, ty - 2);
      ctx.stroke();
    }

    const crownX = cx + sway;
    const crownY = sy + ts * 0.24;

    // Coconuts
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(crownX - 4, crownY + 4, 3.5, 0, Math.PI * 2);
    ctx.arc(crownX + 4, crownY + 4, 3.5, 0, Math.PI * 2);
    ctx.arc(crownX, crownY + 7, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Palm Fronds
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 3.5;
    const angles = [-2.4, -1.8, -1.2, -0.6, 0.2];
    angles.forEach(ang => {
      ctx.beginPath();
      ctx.moveTo(crownX, crownY);
      const endX = crownX + Math.cos(ang) * (ts * 0.45);
      const endY = crownY + Math.sin(ang) * (ts * 0.35) + 4;
      ctx.quadraticCurveTo(crownX + Math.cos(ang) * (ts * 0.25), crownY - ts * 0.1, endX, endY);
      ctx.stroke();
    });
  }

  drawRock(ctx, sx, sy, ts) {
    const cx = sx + ts / 2;
    const cy = sy + ts / 2;

    // Drop Shadow
    ctx.beginPath();
    ctx.ellipse(cx, sy + ts * 0.82, ts * 0.38, ts * 0.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
    ctx.fill();

    // Sacred Boulder (Angular chiseled facets)
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.34, cy + ts * 0.25);
    ctx.lineTo(cx - ts * 0.3, cy - ts * 0.15);
    ctx.lineTo(cx - ts * 0.1, cy - ts * 0.35);
    ctx.lineTo(cx + ts * 0.2, cy - ts * 0.32);
    ctx.lineTo(cx + ts * 0.35, cy - ts * 0.05);
    ctx.lineTo(cx + ts * 0.3, cy + ts * 0.25);
    ctx.closePath();

    ctx.fillStyle = '#475569';
    ctx.fill();

    // Shadow facet
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.34, cy + ts * 0.25);
    ctx.lineTo(cx - ts * 0.05, cy);
    ctx.lineTo(cx + ts * 0.3, cy + ts * 0.25);
    ctx.closePath();
    ctx.fill();

    // Lit top facet & highlight ridge
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.3, cy - ts * 0.15);
    ctx.lineTo(cx - ts * 0.1, cy - ts * 0.35);
    ctx.lineTo(cx + ts * 0.2, cy - ts * 0.32);
    ctx.stroke();

    // Sacred golden dust aura
    ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
    ctx.beginPath();
    ctx.arc(cx, cy, ts * 0.38, 0, Math.PI * 2);
    ctx.fill();
  }

  drawMountain(ctx, sx, sy, ts) {
    const cx = sx + ts / 2;

    // Drop Shadow
    ctx.beginPath();
    ctx.ellipse(cx, sy + ts * 0.88, ts * 0.44, ts * 0.15, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();

    // Left Peak
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.42, sy + ts * 0.86);
    ctx.lineTo(cx - ts * 0.18, sy + ts * 0.15);
    ctx.lineTo(cx + ts * 0.05, sy + ts * 0.86);
    ctx.closePath();
    ctx.fill();

    // Right Peak
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.2, sy + ts * 0.86);
    ctx.lineTo(cx + ts * 0.15, sy + ts * 0.08);
    ctx.lineTo(cx + ts * 0.44, sy + ts * 0.86);
    ctx.closePath();
    ctx.fill();

    // Summit Crest
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(cx + ts * 0.15, sy + ts * 0.08);
    ctx.lineTo(cx + ts * 0.08, sy + ts * 0.28);
    ctx.lineTo(cx + ts * 0.15, sy + ts * 0.24);
    ctx.lineTo(cx + ts * 0.24, sy + ts * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  drawSacredFire(ctx, sx, sy, ts, clock, c) {
    const cx = sx + ts / 2;
    const cy = sy + ts * 0.62;

    // Altar Hearth Base
    ctx.fillStyle = '#78350f';
    ctx.fillRect(cx - ts * 0.38, cy + ts * 0.08, ts * 0.76, ts * 0.22);
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(cx - ts * 0.34, cy + ts * 0.05, ts * 0.68, ts * 0.06);

    // Crossed Sacrificial Logs
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.22, cy + ts * 0.12);
    ctx.lineTo(cx + ts * 0.22, cy + ts * 0.02);
    ctx.moveTo(cx + ts * 0.22, cy + ts * 0.12);
    ctx.lineTo(cx - ts * 0.22, cy + ts * 0.02);
    ctx.stroke();

    // Ambient Radiant Glow Aura
    const glow = ctx.createRadialGradient(cx, cy - ts * 0.1, ts * 0.05, cx, cy - ts * 0.1, ts * 0.75);
    glow.addColorStop(0, 'rgba(249, 115, 22, 0.55)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy - ts * 0.1, ts * 0.75, 0, Math.PI * 2);
    ctx.fill();

    // Animated Flame Tongues
    const flicker1 = Math.sin(clock * 0.015 + c) * 3;
    const flicker2 = Math.cos(clock * 0.012 + c) * 3;

    // Outer Crimson Flame
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.24, cy + ts * 0.04);
    ctx.quadraticCurveTo(cx - ts * 0.15, cy - ts * 0.25, cx + flicker1, cy - ts * 0.45);
    ctx.quadraticCurveTo(cx + ts * 0.15, cy - ts * 0.25, cx + ts * 0.24, cy + ts * 0.04);
    ctx.closePath();
    ctx.fill();

    // Mid Amber Flame
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.16, cy + ts * 0.04);
    ctx.quadraticCurveTo(cx - ts * 0.1, cy - ts * 0.2, cx + flicker2, cy - ts * 0.35);
    ctx.quadraticCurveTo(cx + ts * 0.1, cy - ts * 0.2, cx + ts * 0.16, cy + ts * 0.04);
    ctx.closePath();
    ctx.fill();

    // Inner Radiant Golden Core
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.09, cy + ts * 0.04);
    ctx.quadraticCurveTo(cx, cy - ts * 0.14, cx, cy - ts * 0.24);
    ctx.quadraticCurveTo(cx, cy - ts * 0.14, cx + ts * 0.09, cy + ts * 0.04);
    ctx.closePath();
    ctx.fill();

    // Rising Sacred Embers
    for (let i = 0; i < 3; i++) {
      const sparkAge = (clock * 0.0018 + i * 0.33) % 1;
      const sparkY = cy - ts * 0.2 - (sparkAge * ts * 0.45);
      const sparkX = cx + Math.sin(clock * 0.008 + i * 2) * (ts * 0.18);
      ctx.fillStyle = `rgba(254, 240, 138, ${1 - sparkAge})`;
      ctx.fillRect(sparkX, sparkY, 2.5, 2.5);
    }
  }

  drawFlagBanner(ctx, sx, sy, ts, clock) {
    const poleX = sx + ts * 0.28;
    const baseCy = sy + ts * 0.88;
    const wave = Math.sin(clock * 0.006) * 4;

    // Drop Shadow
    ctx.beginPath();
    ctx.ellipse(poleX, baseCy, ts * 0.18, ts * 0.08, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Wooden Staff Pole
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(poleX, baseCy);
    ctx.lineTo(poleX, sy + ts * 0.12);
    ctx.stroke();

    // Brass Finial Spearhead
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(poleX, sy + ts * 0.1, 4, 0, Math.PI * 2);
    ctx.fill();

    // Saffron Triangular Dharma Dhwaja
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(poleX + 2, sy + ts * 0.14);
    ctx.quadraticCurveTo(poleX + ts * 0.3, sy + ts * 0.18 + wave * 0.5, poleX + ts * 0.58 + wave, sy + ts * 0.28);
    ctx.quadraticCurveTo(poleX + ts * 0.3, sy + ts * 0.38 - wave * 0.5, poleX + 2, sy + ts * 0.46);
    ctx.closePath();
    ctx.fill();

    // Gold trim edge
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  drawCampTent(ctx, sx, sy, ts) {
    const cx = sx + ts / 2;
    const cy = sy + ts * 0.88;

    // Drop Shadow
    ctx.beginPath();
    ctx.ellipse(cx, cy, ts * 0.42, ts * 0.16, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fill();

    // Main Pavilion Canvas
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.4, cy);
    ctx.lineTo(cx, sy + ts * 0.16);
    ctx.lineTo(cx + ts * 0.4, cy);
    ctx.closePath();
    ctx.fill();

    // Golden Side Flaps
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.4, cy);
    ctx.lineTo(cx, sy + ts * 0.16);
    ctx.lineTo(cx - ts * 0.1, cy);
    ctx.closePath();
    ctx.fill();

    // Entrance Archway Curtain
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.12, cy);
    ctx.lineTo(cx, cy - ts * 0.28);
    ctx.lineTo(cx + ts * 0.12, cy);
    ctx.closePath();
    ctx.fill();

    // Guy Ropes
    ctx.strokeStyle = '#fef3c7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.35, cy - ts * 0.05);
    ctx.lineTo(cx - ts * 0.48, cy);
    ctx.moveTo(cx + ts * 0.35, cy - ts * 0.05);
    ctx.lineTo(cx + ts * 0.48, cy);
    ctx.stroke();
  }

  drawWater(ctx, sx, sy, ts, clock, c, r) {
    const waveShift = Math.sin((clock * 0.003) + (c * 0.6) + (r * 0.9)) * 5;

    // Ocean Gradient
    const waterGrad = ctx.createLinearGradient(sx, sy, sx, sy + ts);
    waterGrad.addColorStop(0, '#1d4ed8');
    waterGrad.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(sx, sy, ts, ts);

    // Wave ripples
    ctx.fillStyle = 'rgba(191, 219, 254, 0.35)';
    ctx.fillRect(sx + ts * 0.1 + waveShift, sy + ts * 0.35, ts * 0.6, 3);
    ctx.fillRect(sx + ts * 0.3 - waveShift * 0.5, sy + ts * 0.7, ts * 0.5, 2.5);

    // Specular Sun Glint
    const glint = Math.sin(clock * 0.005 + c + r);
    if (glint > 0.7) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fillRect(sx + ts * 0.5 + waveShift * 0.3, sy + ts * 0.5, 3, 3);
    }
  }

  renderFieldEncounters(ctx) {
    if (window.mapManager.currentMapId !== 'field' || !window.mapManager.encounters) return;

    const ts = this.tileSize;
    window.mapManager.encounters.forEach(enc => {
      if (enc.defeated) return;

      const screenPos = window.camera.worldToScreen(enc.x * ts, enc.y * ts);
      const sx = screenPos.x;
      const sy = screenPos.y;

      const auraGrad = ctx.createRadialGradient(
        sx + ts / 2, sy + ts / 2, ts * 0.1,
        sx + ts / 2, sy + ts / 2, ts * 0.75
      );
      auraGrad.addColorStop(0, 'rgba(225, 29, 72, 0.45)');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(sx + ts / 2, sy + ts / 2, ts * 0.7, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = `${Math.floor(ts * 0.65)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(enc.symbol || '👹', sx + ts / 2, sy + ts / 2);
    });
  }

  renderAmbientOverlay(ctx) {
    const grad = ctx.createRadialGradient(
      this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth * 0.35,
      this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth * 0.75
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(3, 5, 10, 0.55)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }
}

// Bootstrap game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
  window.game.start();
});
