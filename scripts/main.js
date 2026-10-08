/**
 * RAM SENA - Main Game Engine (scripts/main.js)
 * Fullscreen 2D Devotional RPG game loop, dynamic resolution scaling,
 * input handling, NPC/world interactions, and map transitions.
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Dynamic Fullscreen Resolution
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight;

    // Devotional RPG Tile Scale: Target ~14-15 tiles across viewport (110px - 130px per tile)
    this.tileSize = this.calculateTileSize();

    this.state = window.GAME_STATES.MENU;
    this.lastTime = performance.now();
    this.animClock = 0;

    this.initCanvas();
    this.initInput();
  }

  calculateTileSize() {
    // Retro RPG Scale: Target ~13-14 tiles across screen, ~8-9 vertically
    const sizeByW = Math.floor(window.innerWidth / 14);
    const sizeByH = Math.floor(window.innerHeight / 8.8);
    return Math.max(110, Math.min(145, Math.min(sizeByW, sizeByH)));
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

      // 4. If Dialogue is active, Z, Enter, Space, or E advances dialogue; Esc, X, or B hides/retreats
      if (window.uiManager && window.uiManager.isDialogueOpen()) {
        if (['KeyX', 'KeyB', 'Escape'].includes(e.code)) {
          if (window.combatSystem && window.combatSystem.inCombat) {
            window.combatSystem.retreatBattle();
          } else {
            window.uiManager.hideDialogue();
          }
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
      const choices = [];
      if (window.mapManager && window.mapManager.phase === 2) {
        choices.push({
          label: '🌅 Rest & Finish Day (रात का विश्राम / नई भोर)',
          action: () => this.finishDay()
        });
      }
      window.uiManager.showDialogue(
        'Sacred Yajna Altar (पवित्र यज्ञवेदी)',
        'The sacred fire blazes bright with clarified butter and holy chants. You offer prayers with folded hands (प्रणाम 🙏).',
        '🔥',
        choices
      );
    } else if (tile === window.TILE_TYPES.CAMP_TENT) {
      const choices = [];
      if (window.mapManager && window.mapManager.phase === 2) {
        choices.push({
          label: '🌅 Rest & Finish Day (रात का विश्राम / नई भोर)',
          action: () => this.finishDay()
        });
      }
      window.uiManager.showDialogue(
        'Royal Camp Pavilion (सेना शिविर)',
        'The army pavilion provides shelter and rest for the valiant warriors of Shri Ram.',
        '⛺',
        choices
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
        const currentStones = window.inventory ? (window.inventory.items.stones || 0) : 0;
        if (currentStones >= 1) {
          window.uiManager.showDialogue(
            'Carrying Sacred Stone (भार वहन)',
            'You are already carrying a heavy sacred boulder (🪨) on your shoulders! Carry it south to Nal or Neel at the ocean shore before lifting another.',
            '🪨'
          );
          return;
        }

        // Lift stone and remove it from the map grid so player cannot spam
        window.inventory.add('stones', 1);
        if (window.mapManager.grid && window.mapManager.grid[targetY]) {
          const mapId = window.mapManager.currentMapId || '';
          let replacementTile = window.TILE_TYPES.GRASS;
          if (mapId.startsWith('beach')) {
            replacementTile = window.TILE_TYPES.SAND;
          } else {
            const neighbors = [
              window.mapManager.grid[targetY - 1]?.[targetX],
              window.mapManager.grid[targetY + 1]?.[targetX],
              window.mapManager.grid[targetY]?.[targetX - 1],
              window.mapManager.grid[targetY]?.[targetX + 1]
            ];
            if (neighbors.filter(t => t === window.TILE_TYPES.SAND).length >= 2) {
              replacementTile = window.TILE_TYPES.SAND;
            }
          }
          window.mapManager.grid[targetY][targetX] = replacementTile;
        }

        window.uiManager.showDialogue(
          'Sacred Mountain Stone (सेतु शिला)',
          'You hoisted a heavy sacred boulder from Mount Mahendra (🪨)! Walk south to the beach and deliver it to Nal or Neel to build Ram Setu.',
          '🪨'
        );
        window.uiManager.addLog('Lifted a sacred stone (1/1 carried). Bring it to Nal or Neel at the beach.', 'service');
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

  finishDay() {
    if (window.combatSystem) {
      window.combatSystem.defeatedEncounters.clear();
    }
    if (window.FIELD_MAP && window.FIELD_MAP.encounters) {
      window.FIELD_MAP.encounters.forEach(e => e.defeated = false);
    }
    if (window.mapManager && window.mapManager.encounters) {
      window.mapManager.encounters.forEach(e => e.defeated = false);
    }

    if (window.player) {
      window.player.hp = window.player.maxHp;
    }

    this.campaignDay = (this.campaignDay || 1) + 1;

    if (window.uiManager) {
      window.uiManager.showDialogue(
        `Dawn of Day ${this.campaignDay} (रणभूमि की नई भोर)`,
        `The sacred morning sun rises across the sea! The Vanar Sena awakens with prayers and war chants.\n\nYour strength is completely restored (HP: ${window.player.maxHp}/${window.player.maxHp}). Demon hosts have rallied again across the Great Battlefield!`,
        '🌅',
        [
          {
            label: '⚔️ March to the Battlefield (रणभूमि चलें)',
            action: () => {
              window.uiManager.hideDialogue();
              window.mapManager.loadMap('field', 2, 12, true);
            }
          },
          {
            label: '⛺ Remain in Camp (शिविर में रहें)',
            action: () => {
              window.uiManager.hideDialogue();
              if (window.mapManager.currentMapId !== 'camp2') {
                window.mapManager.loadMap('camp2', 17, 14, true);
              }
            }
          }
        ]
      );
      window.uiManager.addLog(`🌅 Dawn of Day ${this.campaignDay}! All battlefield monsters have reappeared. Full HP restored.`, 'divine');
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
    const ar = window.assetRenderer;

    const bounds = window.camera.getVisibleBounds(ts, cols, rows);

    for (let r = bounds.startRow; r <= bounds.endRow; r++) {
      for (let c = bounds.startCol; c <= bounds.endCol; c++) {
        const tileType = grid[r][c];
        const screenPos = window.camera.worldToScreen(c * ts, r * ts);
        const sx = screenPos.x;
        const sy = screenPos.y;

        if (ar) {
          switch (tileType) {
            case window.TILE_TYPES.GRASS:
              ar.drawGrass(ctx, sx, sy, ts, c, r);
              break;
            case window.TILE_TYPES.GRASS_FLOWERS:
              ar.drawFlowers(ctx, sx, sy, ts, c, r);
              break;
            case window.TILE_TYPES.DIRT_PATH:
              {
                const mapId = window.mapManager.currentMapId;
                if (mapId === 'beach1' && r >= 19) {
                  // Ram Setu: Floating sacred stones across ocean water
                  const isComplete = window.mapManager.isSetuCompleted;
                  const stones = window.mapManager.stonesDelivered;
                  const completedRows = isComplete ? 7 : Math.floor((stones / window.mapManager.targetStones) * 7);
                  if ((r - 19) < completedRows) {
                    ar.drawSetuStoneBridge(ctx, sx, sy, ts, c, r, this.animClock);
                  } else {
                    // Open sea water until stones are placed!
                    ar.drawWater(ctx, sx, sy, ts, this.animClock, c, r);
                  }
                } else if (mapId === 'beach2' && r <= 5) {
                  // Northern landing of Ram Setu on Lanka water
                  ar.drawSetuStoneBridge(ctx, sx, sy, ts, c, r, this.animClock);
                } else if ((mapId === 'beach1' && r >= 5) || (mapId === 'beach2' && r >= 6 && r <= 19)) {
                  // Beach is pure sand! No artificial roads or kingdom stones
                  ar.drawSand(ctx, sx, sy, ts, c, r);
                } else {
                  // Forest / Jungle / Camp is the natural earthy mud trail
                  ar.drawPath(ctx, sx, sy, ts, c, r);
                }
              }
              break;
            case window.TILE_TYPES.SAND:
              ar.drawSand(ctx, sx, sy, ts, c, r);
              break;
            case window.TILE_TYPES.WATER:
              ar.drawWater(ctx, sx, sy, ts, this.animClock, c, r);
              break;
            case window.TILE_TYPES.TREE:
              ar.drawBaseGround(ctx, sx, sy, ts, c, r, window.mapManager.currentMapId);
              ar.drawTree(ctx, sx, sy, ts, this.animClock, c, r);
              break;
            case window.TILE_TYPES.COCONUT_TREE:
              ar.drawBaseGround(ctx, sx, sy, ts, c, r, window.mapManager.currentMapId);
              ar.drawCoconutPalm(ctx, sx, sy, ts, this.animClock, c, r);
              break;
            case window.TILE_TYPES.ROCK:
              ar.drawBaseGround(ctx, sx, sy, ts, c, r, window.mapManager.currentMapId);
              ar.drawRock(ctx, sx, sy, ts, c, r);
              break;
            case window.TILE_TYPES.SACRED_FIRE:
              ar.drawBaseGround(ctx, sx, sy, ts, c, r, window.mapManager.currentMapId);
              ar.drawYajnaAltar(ctx, sx, sy, ts, this.animClock, c);
              break;
            case window.TILE_TYPES.FLAG_BANNER:
              ar.drawBaseGround(ctx, sx, sy, ts, c, r, window.mapManager.currentMapId);
              ar.drawFlag(ctx, sx, sy, ts, this.animClock);
              break;
            case window.TILE_TYPES.CAMP_TENT:
              ar.drawBaseGround(ctx, sx, sy, ts, c, r, window.mapManager.currentMapId);
              ar.drawTent(ctx, sx, sy, ts, this.animClock, c, r);
              break;
            case window.TILE_TYPES.MOUNTAIN:
              ar.drawBaseGround(ctx, sx, sy, ts, c, r, window.mapManager.currentMapId);
              ar.drawMountain(ctx, sx, sy, ts, c, r);
              break;
            default:
              ar.drawGrass(ctx, sx, sy, ts, c, r);
              break;
          }
        }
      }
    }
  }

  renderFieldEncounters(ctx) {
    if (window.mapManager.currentMapId !== 'field' || !window.mapManager.encounters) return;

    const ts = this.tileSize;
    const ar = window.assetRenderer;
    window.mapManager.encounters.forEach(enc => {
      if (enc.defeated) return;

      const screenPos = window.camera.worldToScreen(enc.x * ts, enc.y * ts);
      const sx = screenPos.x;
      const sy = screenPos.y;

      if (ar && ar.drawDemonWarrior) {
        ar.drawDemonWarrior(ctx, sx, sy, ts, enc, this.animClock);
      }
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
