/**
 * RAM SENA - Main Game Engine (scripts/main.js)
 * Orchestrates the Pokemon RPG-style game loop, camera rendering,
 * input dispatching, and state management.
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Native internal buffer resolution (16:9 ratio)
    this.canvasWidth = 960;
    this.canvasHeight = 540;

    // Pokemon RPG tile sizing: 52px per tile
    // At 52px, only ~18x10 tiles are visible in 960x540!
    // The large 36x28 map scrolls dynamically around the player.
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
    // Single key press action listeners
    window.addEventListener('keydown', (e) => {
      if (this.state !== window.GAME_STATES.OVERWORLD) return;

      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        window.player.tryMove(0, -1);
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        window.player.tryMove(0, 1);
      } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        window.player.tryMove(-1, 0);
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        window.player.tryMove(1, 0);
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

    const tile = window.mapManager.getTile(targetX, targetY);

    if (tile === window.TILE_TYPES.SACRED_FIRE) {
      window.uiManager.showDialogue(
        'Sacred Yajna Altar (पवित्र यज्ञवेदी)',
        'The holy fire blazes bright with ghee and sacred chants of the Rishis. You fold your hands in reverent prayer (प्रणाम 🙏).',
        '🔥'
      );
      window.uiManager.addLog('Offered prayers at the sacred Yajna fire.', 'service');
    } else if (tile === window.TILE_TYPES.FLAG_BANNER) {
      window.uiManager.showDialogue(
        'Dharma Dhwaja (धर्म ध्वज)',
        'The saffron banner flutters in the coastal breeze, bearing the emblem of the Sun Dynasty (Suryavansha).',
        '🚩'
      );
    } else if (tile === window.TILE_TYPES.TREE) {
      // Gather fruits or flowers
      const roll = Math.random();
      if (roll < 0.5) {
        window.inventory.add('fruits', 1);
        window.uiManager.showDialogue(
          'Ancient Grove',
          'You shook the wild fruit tree and gathered fresh sweet fruits for the camp.',
          '🍎'
        );
      } else {
        window.inventory.add('flowers', 2);
        window.uiManager.showDialogue(
          'Forest Flowers',
          'You collected 2 fragrant blossoms from the branches to weave garlands.',
          '🌸'
        );
      }
    } else if (tile === window.TILE_TYPES.COCONUT_TREE) {
      window.inventory.add('coconuts', 1);
      window.uiManager.showDialogue(
        'Coastal Coconut Palm',
        'You climbed the sturdy palm and brought down a fresh coconut for the army.',
        '🥥'
      );
    } else if (tile === window.TILE_TYPES.ROCK) {
      window.inventory.add('stones', 1);
      window.uiManager.showDialogue(
        'Sacred Stone',
        'You lifted a solid stone from the ground. This will be of noble use for building the Setu bridge.',
        '🪨'
      );
    } else {
      window.uiManager.addLog('You offer a respectful bow to your fellow soldiers (जय श्री राम).', 'service');
    }
  }

  start() {
    // Initial start camera snap
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

    // Process continuous movement when key is held
    if (this.state === window.GAME_STATES.OVERWORLD) {
      this.handleContinuousMovement();
      window.player.update(deltaTime);
      window.camera.update(
        window.player,
        this.tileSize,
        window.mapManager.width,
        window.mapManager.height
      );
    }

    // Render current frame
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

    // 1. Render Map World (within visible camera bounds)
    this.renderWorld(ctx);

    // 2. Render Player
    if (window.player) {
      window.player.render(ctx, this.tileSize);
    }

    // 3. Ambient Lighting & Vignette Overlay for RPG atmosphere
    this.renderAmbientOverlay(ctx);
  }

  renderWorld(ctx) {
    const ts = this.tileSize;
    const grid = window.mapManager.grid;
    const cols = window.mapManager.width;
    const rows = window.mapManager.height;

    // Frustum culling: Only draw tiles currently inside camera viewport
    const bounds = window.camera.getVisibleBounds(ts, cols, rows);

    for (let r = bounds.startRow; r <= bounds.endRow; r++) {
      for (let c = bounds.startCol; c <= bounds.endCol; c++) {
        const tileType = grid[r][c];
        const props = window.TILE_PROPERTIES[tileType] || window.TILE_PROPERTIES[window.TILE_TYPES.GRASS];

        const screenPos = window.camera.worldToScreen(c * ts, r * ts);
        const sx = screenPos.x;
        const sy = screenPos.y;

        // Base tile fill
        ctx.fillStyle = props.color;
        ctx.fillRect(sx, sy, ts, ts);

        // Environmental Texturing
        if (tileType === window.TILE_TYPES.GRASS) {
          if ((r + c) % 2 === 0) {
            ctx.fillStyle = props.altColor || '#22461e';
            ctx.fillRect(sx, sy, ts, ts);
          }
          // Soft grass texture specks
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
          // Animated wave ripples
          const waveShift = Math.sin((this.animClock * 0.003) + (c * 0.5) + (r * 0.8)) * 3;
          ctx.fillStyle = 'rgba(147, 197, 253, 0.25)';
          ctx.fillRect(sx + ts * 0.2 + waveShift, sy + ts * 0.4, ts * 0.6, 3);
        } else if (tileType === window.TILE_TYPES.SAND) {
          if ((r + c) % 3 === 0) {
            ctx.fillStyle = 'rgba(254, 243, 199, 0.15)';
            ctx.fillRect(sx + ts * 0.3, sy + ts * 0.3, 3, 3);
          }
        }

        // Animated Yajna Fire
        if (tileType === window.TILE_TYPES.SACRED_FIRE) {
          const flameScale = 1.0 + Math.sin(this.animClock * 0.008 + c) * 0.15;
          ctx.font = `${Math.floor(ts * 0.65 * flameScale)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🔥', sx + ts / 2, sy + ts / 2);
        } else if (props.symbol) {
          // Standard tile symbol
          ctx.font = `${Math.floor(ts * 0.56)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(props.symbol, sx + ts / 2, sy + ts / 2);
        }

        // Subtle tile boundary grid lines (classic Pokemon aesthetic)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx, sy, ts, ts);
      }
    }

    // Outer map border
    const mapOrigin = window.camera.worldToScreen(0, 0);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      mapOrigin.x,
      mapOrigin.y,
      cols * ts,
      rows * ts
    );
  }

  renderAmbientOverlay(ctx) {
    // Vignette lighting around edges of screen
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

// Start Game on page load
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
  window.game.start();
});
