/**
 * RAM SENA - Main Game Engine (scripts/main.js)
 * Coordinates the Pokemon RPG game loop, camera rendering,
 * NPC and environment interactions, hotkeys, and game states.
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.canvasWidth = 960;
    this.canvasHeight = 540;

    // Pokemon RPG tile size: 52px
    this.tileSize = 52;

    this.state = window.GAME_STATES.MENU;
    this.lastTime = performance.now();
    this.animClock = 0;

    this.initCanvas();
    this.initInput();
  }

  initCanvas() {
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;

    if (window.camera) {
      window.camera.resize(this.canvasWidth, this.canvasHeight);
    }

    window.addEventListener('resize', () => {
      if (window.camera) {
        window.camera.resize(this.canvasWidth, this.canvasHeight);
      }
    });
  }

  initInput() {
    window.addEventListener('keydown', (e) => {
      if (this.state !== window.GAME_STATES.OVERWORLD) return;

      // Movement
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        window.player.tryMove(0, -1);
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        window.player.tryMove(0, 1);
      } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        window.player.tryMove(-1, 0);
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        window.player.tryMove(1, 0);
      }

      // Hotkeys
      if (e.code === 'KeyH') {
        // Hail Shri Ram
        if (window.audioManager) {
          window.audioManager.hailShriRam();
        }
      } else if (e.code === 'KeyI') {
        // Open Inventory
        if (window.uiManager) {
          window.uiManager.openInventory();
        }
      } else if (e.code === 'KeyM') {
        // Travel map
        if (window.uiManager) {
          window.uiManager.openTravelModal();
        }
      }
    });
  }

  handleInteract() {
    if (this.state !== window.GAME_STATES.OVERWORLD) return;

    // Determine target tile in front of player
    let targetX = window.player.x;
    let targetY = window.player.y;

    if (window.player.direction === 'up') targetY -= 1;
    else if (window.player.direction === 'down') targetY += 1;
    else if (window.player.direction === 'left') targetX -= 1;
    else if (window.player.direction === 'right') targetX += 1;

    // 1. Check NPC interaction (front tile or current tile)
    if (window.npcManager) {
      const npc = window.npcManager.getNPCAt(targetX, targetY) || window.npcManager.getNPCAt(window.player.x, window.player.y);
      if (npc) {
        window.npcManager.interactWithNPC(npc);
        return;
      }
    }

    // 2. Check Battlefield Encounter spot
    if (window.mapManager && window.mapManager.currentMapId === 'field') {
      const enc = window.mapManager.encounters.find(e => e.x === targetX && e.y === targetY && !e.defeated);
      if (enc) {
        window.combatSystem.startBattle(enc.id, enc.enemyType);
        return;
      }
    }

    // 3. Environmental Tile Interactions
    const tile = window.mapManager.getTile(targetX, targetY);

    if (tile === window.TILE_TYPES.SACRED_FIRE) {
      window.uiManager.showDialogue(
        'Sacred Yajna Altar (पवित्र यज्ञवेदी)',
        'The holy fire blazes bright with clarified butter (ghee) and ancient Vedic chants. You offer flowers and bow your head in devotion.',
        '🔥'
      );
      window.uiManager.addLog('Offered reverent prayer at the sacred Yajna fire.', 'service');
    } else if (tile === window.TILE_TYPES.FLAG_BANNER) {
      window.uiManager.showDialogue(
        'Dharma Dhwaja (धर्म ध्वज)',
        'The saffron banner flutters in the ocean breeze, bearing the emblem of the Sun Dynasty (Suryavansha).',
        '🚩'
      );
    } else if (tile === window.TILE_TYPES.TREE) {
      // Random tree yield: Different fruits, flowers, or wood!
      this.interactWithRandomTree();
    } else if (tile === window.TILE_TYPES.COCONUT_TREE) {
      window.inventory.add('coconuts', 1);
      window.uiManager.showDialogue(
        'Coconut Palm (श्रीफल वृक्ष)',
        'You climbed the sturdy coastal palm and brought down a fresh coconut (श्रीफल 🥥) for the army.',
        '🥥'
      );
    } else if (tile === window.TILE_TYPES.ROCK) {
      if (window.mapManager.phase === 1) {
        window.inventory.add('stones', 1);
        window.uiManager.showDialogue(
          'Sacred Mountain Stone',
          'With determined hands, you lifted a solid stone from the ground (🪨). Take it to Nal and Neel on the beach to build Ram Setu!',
          '🪨'
        );
      } else {
        window.uiManager.showDialogue(
          'Ancient Boulders of Lanka',
          'Heavy stones that withstand the roaring winds of the island.',
          '🪨'
        );
      }
    } else if (tile === window.TILE_TYPES.MOUNTAIN) {
      window.uiManager.showDialogue(
        'Sacred Foothills',
        'Ancient towering peaks where sages perform penance. You fold your hands with reverence to Mother Earth (भूमि वंदना 🙏).',
        '⛰️'
      );
    } else {
      window.uiManager.addLog('You offer a respectful bow with folded hands (प्रणाम 🙏).', 'service');
    }
  }

  interactWithRandomTree() {
    const roll = Math.random();

    if (roll < 0.25) {
      // Mango
      window.inventory.add('fruits', 1);
      window.uiManager.showDialogue(
        'Wild Fruit Tree',
        'You shook the lush branches and a ripe, golden Mango (आम 🥭) dropped into your hands! Ready to offer in the camp.',
        '🥭'
      );
    } else if (roll < 0.45) {
      // Shabari's Sweet Berries
      window.inventory.add('fruits', 1);
      window.uiManager.showDialogue(
        'Wild Fruit Tree',
        'You gathered sweet forest berries (बेर 🍒), reminiscent of the sweet devotion of Mata Shabari.',
        '🍒'
      );
    } else if (roll < 0.65) {
      // Jamun / Apple
      window.inventory.add('fruits', 1);
      window.uiManager.showDialogue(
        'Wild Fruit Tree',
        'You shook the ancient tree and collected crisp wild forest fruits (🍎 / 🫐) for your comrades.',
        '🍎'
      );
    } else if (roll < 0.85) {
      // Fragrant Flowers
      window.inventory.add('flowers', 2);
      window.uiManager.showDialogue(
        'Flowering Tree',
        'A shower of sweet-scented blossoms (🌸) fluttered down from the branches. Collect 5 to weave a garland!',
        '🌸'
      );
    } else {
      // Dry Wood
      window.inventory.add('wood', 1);
      window.uiManager.showDialogue(
        'Ancient Forest Tree',
        'You gathered sturdy dry branches (🪵) suitable for campfires and defense.',
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
    ctx.fillStyle = '#060911';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 1. Render World Tiles
    this.renderWorld(ctx);

    // 2. Render Battlefield Encounter Markers if on Field map
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

        // Environmental Patterns
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

        // Yajna Fire Animation
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

    // Draw Portals Highlights
    if (window.mapManager.portals) {
      window.mapManager.portals.forEach(p => {
        const screenPos = window.camera.worldToScreen(p.x * ts, p.y * ts);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenPos.x + 2, screenPos.y + 2, ts - 4, ts - 4);
      });
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

      // Dark red ominous aura
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

      // Enemy Symbol
      ctx.font = `${Math.floor(ts * 0.65)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(enc.symbol || '👹', sx + ts / 2, sy + ts / 2);
    });
  }

  renderAmbientOverlay(ctx) {
    const grad = ctx.createRadialGradient(
      this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth * 0.35,
      this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth * 0.72
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
