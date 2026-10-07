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

    // Pokemon GBA/DS tile size (60px crisp tiles)
    this.tileSize = 60;

    this.state = window.GAME_STATES.MENU;
    this.lastTime = performance.now();
    this.animClock = 0;

    this.initCanvas();
    this.initInput();
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

    if (window.camera) {
      window.camera.resize(this.canvasWidth, this.canvasHeight);
    }
  }

  initInput() {
    window.addEventListener('keydown', (e) => {
      // Prevent browser scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key)) {
        e.preventDefault();
      }

      // 1. If Dialogue is active, Space or Enter advances dialogue
      if (window.uiManager && window.uiManager.textboxWrapper && !window.uiManager.textboxWrapper.classList.contains('hidden')) {
        if (e.code === 'Space' || e.code === 'Enter') {
          window.uiManager.advanceDialogue();
          return;
        }
      }

      // 2. Start Menu Toggle (Enter or Escape)
      if (e.code === 'Enter' || e.code === 'Escape') {
        if (this.state === window.GAME_STATES.OVERWORLD) {
          window.uiManager.toggleStartMenu();
          return;
        }
      }

      if (this.state !== window.GAME_STATES.OVERWORLD) return;

      // 3. Movement
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        window.player.tryMove(0, -1);
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        window.player.tryMove(0, 1);
      } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        window.player.tryMove(-1, 0);
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        window.player.tryMove(1, 0);
      }

      // 4. Quick Hotkeys
      if (e.code === 'KeyE') {
        this.handleInteract();
      } else if (e.code === 'KeyH') {
        if (window.audioManager) {
          window.audioManager.hailShriRam();
        }
      } else if (e.code === 'KeyB' || e.code === 'KeyI') {
        if (window.uiManager) {
          window.uiManager.openBag();
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

        ctx.fillStyle = props.color;
        ctx.fillRect(sx, sy, ts, ts);

        // Environmental Textures
        if (tileType === window.TILE_TYPES.GRASS) {
          if ((r + c) % 2 === 0) {
            ctx.fillStyle = props.altColor || '#22461e';
            ctx.fillRect(sx, sy, ts, ts);
          }
          ctx.fillStyle = 'rgba(74, 222, 128, 0.12)';
          ctx.fillRect(sx + ts * 0.25, sy + ts * 0.35, 2, 4);
          ctx.fillRect(sx + ts * 0.65, sy + ts * 0.6, 2, 5);
        } else if (tileType === window.TILE_TYPES.DIRT_PATH) {
          if ((r + c) % 2 === 0) {
            ctx.fillStyle = props.altColor || '#533e21';
            ctx.fillRect(sx, sy, ts, ts);
          }
          ctx.fillStyle = 'rgba(217, 119, 6, 0.18)';
          ctx.fillRect(sx + ts * 0.45, sy + ts * 0.45, 4, 3);
        } else if (tileType === window.TILE_TYPES.WATER) {
          const waveShift = Math.sin((this.animClock * 0.003) + (c * 0.5) + (r * 0.8)) * 3;
          ctx.fillStyle = 'rgba(147, 197, 253, 0.25)';
          ctx.fillRect(sx + ts * 0.2 + waveShift, sy + ts * 0.4, ts * 0.6, 3);
        } else if (tileType === window.TILE_TYPES.SAND) {
          if ((r + c) % 3 === 0) {
            ctx.fillStyle = 'rgba(254, 243, 199, 0.15)';
            ctx.fillRect(sx + ts * 0.3, sy + ts * 0.3, 3, 3);
          }
        }

        // Yajna Fire Flame
        if (tileType === window.TILE_TYPES.SACRED_FIRE) {
          const flameScale = 1.0 + Math.sin(this.animClock * 0.008 + c) * 0.15;
          ctx.font = `${Math.floor(ts * 0.65 * flameScale)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🔥', sx + ts / 2, sy + ts / 2);
        } else if (props.symbol) {
          ctx.font = `${Math.floor(ts * 0.56)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(props.symbol, sx + ts / 2, sy + ts / 2);
        }

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx, sy, ts, ts);
      }
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
