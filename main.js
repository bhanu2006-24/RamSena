/**
 * RAM SENA - Main Game Loop & Renderer (main.js)
 * Manages canvas initialization, input dispatching, rendering loop, and game state.
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Logical dimensions
    this.canvasWidth = 960;
    this.canvasHeight = 540;

    // Grid sizing
    this.cols = window.mapManager.width;
    this.rows = window.mapManager.height;
    this.tileSize = 40; // Computed dynamically in resize
    this.offsetX = 0;
    this.offsetY = 0;

    this.lastTime = performance.now();
    this.keysDown = {};

    this.initCanvas();
    this.initInput();
    this.initStory();
  }

  initCanvas() {
    // Set internal resolution
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;

    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    // Calculate tile size and centering offsets based on grid dimensions
    const availableWidth = this.canvasWidth;
    const availableHeight = this.canvasHeight;

    const maxTileW = Math.floor(availableWidth / this.cols);
    const maxTileH = Math.floor(availableHeight / this.rows);
    this.tileSize = Math.min(maxTileW, maxTileH);

    const totalGridWidth = this.cols * this.tileSize;
    const totalGridHeight = this.rows * this.tileSize;

    this.offsetX = Math.floor((availableWidth - totalGridWidth) / 2);
    this.offsetY = Math.floor((availableHeight - totalGridHeight) / 2);
  }

  initInput() {
    window.addEventListener('keydown', (e) => {
      // Prevent browser scrolling with arrow keys or space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key)) {
        e.preventDefault();
      }

      this.keysDown[e.code] = true;

      // Typewriter skip on Space
      if (e.code === 'Space') {
        if (window.uiManager && window.uiManager.isTyping) {
          window.uiManager.skipTypewriter();
          return;
        }
      }

      // Grid Movement on keydown for snappy single-tile step
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        window.player.tryMove(0, -1);
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        window.player.tryMove(0, 1);
      } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        window.player.tryMove(-1, 0);
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        window.player.tryMove(1, 0);
      } else if (e.code === 'KeyE') {
        this.handleInteraction();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown[e.code] = false;
    });
  }

  handleInteraction() {
    if (window.uiManager) {
      window.uiManager.addLog('You look around attentively with folded hands (Pranam 🙏).', 'service');
    }
  }

  initStory() {
    if (window.uiManager) {
      const welcomeMessage = 
        'The dawn sun casts golden rays over the shores of the southern ocean. ' +
        'You are a humble Vanar in the mighty army of Shri Ram. ' +
        'Walk through the camp using WASD or Arrow Keys, ready to offer your humble service.';

      window.uiManager.showDialogue('Camp of the Vanar Sena', welcomeMessage, '🚩');
      window.uiManager.addLog('Humble Vanar entered the encampment.', 'info');
      window.uiManager.updateCoordinates(window.player.x, window.player.y);
    }
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  gameLoop(currentTime) {
    const deltaTime = Math.min(currentTime - this.lastTime, 100); // Clamp delta
    this.lastTime = currentTime;

    // Handle held key continuous stepping
    this.handleContinuousInput();

    // Update
    window.player.update(deltaTime);

    // Render
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  handleContinuousInput() {
    // If a key is held down and player is ready for next tile
    if (window.player.moveProgress >= 0.95) {
      if (this.keysDown['KeyW'] || this.keysDown['ArrowUp']) {
        window.player.tryMove(0, -1);
      } else if (this.keysDown['KeyS'] || this.keysDown['ArrowDown']) {
        window.player.tryMove(0, 1);
      } else if (this.keysDown['KeyA'] || this.keysDown['ArrowLeft']) {
        window.player.tryMove(-1, 0);
      } else if (this.keysDown['KeyD'] || this.keysDown['ArrowRight']) {
        window.player.tryMove(1, 0);
      }
    }
  }

  render() {
    const ctx = this.ctx;

    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw Map Grid
    this.renderMap(ctx);

    // Draw Player
    window.player.render(ctx, this.tileSize, this.offsetX, this.offsetY);
  }

  renderMap(ctx) {
    const grid = window.mapManager.grid;
    const ts = this.tileSize;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const tileType = grid[r][c];
        const props = TILE_PROPERTIES[tileType] || TILE_PROPERTIES[TILE_TYPES.GRASS];

        const x = this.offsetX + c * ts;
        const y = this.offsetY + r * ts;

        // Base tile fill
        ctx.fillStyle = props.color;
        ctx.fillRect(x, y, ts, ts);

        // Visual tile patterns & variations
        if (tileType === TILE_TYPES.GRASS) {
          // Subtle natural grass shade variation
          if ((r + c) % 2 === 0) {
            ctx.fillStyle = props.altColor || '#285222';
            ctx.fillRect(x, y, ts, ts);
          }
          // Subtle grass blade specks
          ctx.fillStyle = 'rgba(74, 222, 128, 0.15)';
          ctx.fillRect(x + ts * 0.3, y + ts * 0.4, 2, 4);
          ctx.fillRect(x + ts * 0.7, y + ts * 0.6, 2, 5);
        } else if (tileType === TILE_TYPES.GRASS_FLOWERS) {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
          ctx.beginPath();
          ctx.arc(x + ts * 0.4, y + ts * 0.4, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (tileType === TILE_TYPES.DIRT_PATH) {
          // Path texture
          if ((r + c) % 2 === 0) {
            ctx.fillStyle = props.altColor || '#534021';
            ctx.fillRect(x, y, ts, ts);
          }
          ctx.fillStyle = 'rgba(217, 119, 6, 0.15)';
          ctx.fillRect(x + ts * 0.5, y + ts * 0.5, 3, 2);
        }

        // Tile Symbols / Emojis (for Trees, Rocks, Flowers)
        if (props.symbol) {
          ctx.font = `${Math.floor(ts * 0.58)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(props.symbol, x + ts / 2, y + ts / 2);
        }

        // Elegant subtle grid cell border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, ts, ts);
      }
    }

    // Outer grid border glow
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      this.offsetX,
      this.offsetY,
      this.cols * ts,
      this.rows * ts
    );
  }
}

// Bootstrap game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
  window.game.start();
});
