/**
 * RAM SENA (राम सेना) - Mobile & Touch Controls Engine (scripts/touchControls.js)
 * 
 * Features:
 * 1. Click / Tap to Move & Interact:
 *    - Click anywhere on the world to navigate the devotee smoothly.
 *    - Click directly on an NPC, tree, boulder, or altar to walk to it and interact!
 *    - Golden sacred ripple feedback marker at clicked spot.
 * 2. Mobile & Tablet Virtual Joystick:
 *    - ONLY visible on mobile, tablet, or touch-screen devices.
 *    - Completely hidden on desktop to preserve 100% clean PC gaming experience.
 *    - Smooth 360° analog thumbstick with 4-way discrete RPG step quantization.
 * 3. Mobile Retro Action Buttons:
 *    - [A]: Interact / Confirm (Z key).
 *    - [B]: Devotional Sack / Cancel (B / Esc key).
 *    - [M]: Retro Start Menu (M key).
 *    - [🙏]: Hail "जय श्री राम!" (H key).
 */

(function () {
  'use strict';

  class TouchControlsManager {
    constructor() {
      this.isTouchDevice = false;
      this.joystickActive = false;
      this.joystickOrigin = { x: 0, y: 0 };
      this.currentVector = { x: 0, y: 0 };
      this.activeDirection = null;
      this.joystickInterval = null;
      this.maxRadius = 38; // px

      // Click-to-Move Pathfinding state
      this.currentPath = [];
      this.targetInteractionTile = null;
      this.pathStepInterval = null;

      this.init();
    }

    init() {
      // 1. Detect Touch Device capability
      this.checkTouchCapability();

      // 2. Setup DOM Elements for Mobile Controls
      this.createMobileDOMElements();

      // 3. Bind Virtual Joystick & Action Buttons
      this.bindJoystickEvents();
      this.bindActionButtons();

      // 4. Bind Click / Tap to Move on Game Canvas (Works on Desktop & Mobile!)
      this.bindClickToMove();

      // 5. Watch for keyboard or direct input to cancel active auto-walk path
      this.bindInputOverride();
    }

    checkTouchCapability() {
      const hasTouch = (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(hover: none) and (pointer: coarse)').matches
      );

      if (hasTouch) {
        this.enableTouchMode();
      } else {
        // Fallback: Enable on first touchstart if user touches screen (e.g. convertible laptops)
        const onFirstTouch = () => {
          this.enableTouchMode();
          window.removeEventListener('touchstart', onFirstTouch);
        };
        window.addEventListener('touchstart', onFirstTouch, { passive: true });
      }
    }

    enableTouchMode() {
      this.isTouchDevice = true;
      document.body.classList.add('touch-device');
      this.updateVisibility();
      this.startModalObserver();
    }

    startModalObserver() {
      if (this.modalObserver) return;
      const app = document.getElementById('game-app') || document.body;
      this.modalObserver = new MutationObserver(() => {
        this.updateVisibility();
      });
      this.modalObserver.observe(app, {
        attributes: true,
        subtree: true,
        attributeFilter: ['class', 'style']
      });
    }

    isAnyModalOrScreenOpen() {
      const getHidden = (id) => {
        const el = document.getElementById(id);
        if (!el) return true;
        return el.classList.contains('hidden') || el.style.display === 'none';
      };

      const titleHidden = getHidden('title-screen');
      const charSelectHidden = getHidden('character-select-screen');
      const bagHidden = getHidden('retro-bag-modal');
      const sevakaHidden = getHidden('sevaka-card-modal');
      const optionsHidden = getHidden('options-modal');
      const aboutHidden = getHidden('about-modal');
      const dialogueHidden = getHidden('retro-textbox-wrapper');

      return (
        !titleHidden ||
        !charSelectHidden ||
        !bagHidden ||
        !sevakaHidden ||
        !optionsHidden ||
        !aboutHidden ||
        !dialogueHidden
      );
    }

    updateVisibility() {
      if (!this.isTouchDevice) return;
      const joystickEl = document.getElementById('touch-joystick-container');
      const actionsEl = document.getElementById('touch-actions-panel');
      if (!joystickEl || !actionsEl) return;

      const isModalOpen = this.isAnyModalOrScreenOpen();
      if (isModalOpen) {
        document.body.classList.add('modal-open');
        joystickEl.style.display = 'none';
        actionsEl.style.display = 'none';
        this.cancelActiveMovement();
      } else {
        document.body.classList.remove('modal-open');
        joystickEl.style.display = 'flex';
        actionsEl.style.display = 'flex';
      }
    }

    cancelActiveMovement() {
      this.stopJoystickLoop();
      this.cancelAutoWalk();
    }

    createMobileDOMElements() {
      const app = document.getElementById('game-app') || document.body;

      // Check if already injected
      if (!document.getElementById('touch-joystick-container')) {
        const joystickContainer = document.createElement('div');
        joystickContainer.id = 'touch-joystick-container';
        joystickContainer.innerHTML = `
          <div class="joystick-base" id="joystick-base">
            <div class="joystick-thumb" id="joystick-thumb"></div>
          </div>
        `;
        app.appendChild(joystickContainer);
      }

      if (!document.getElementById('touch-actions-panel')) {
        const actionsPanel = document.createElement('div');
        actionsPanel.id = 'touch-actions-panel';
        actionsPanel.innerHTML = `
          <div class="touch-cluster-aux">
            <button class="touch-action-btn touch-btn-menu" id="touch-btn-menu" title="Menu (M)">
              <span class="btn-label">M</span>
              <span class="btn-sublabel">MENU</span>
            </button>
            <button class="touch-action-btn touch-btn-hail" id="touch-btn-hail" title="Hail Shri Ram (H)">
              <span class="btn-label">🙏</span>
              <span class="btn-sublabel">HAIL</span>
            </button>
          </div>
          <div class="touch-cluster-main">
            <button class="touch-action-btn touch-btn-b" id="touch-btn-b" title="Sack / Back (B)">
              <span class="btn-label">B</span>
              <span class="btn-sublabel">BAG</span>
            </button>
            <button class="touch-action-btn touch-btn-a" id="touch-btn-a" title="Action / Talk (Z)">
              <span class="btn-label">A</span>
              <span class="btn-sublabel">ACT</span>
            </button>
          </div>
        `;
        app.appendChild(actionsPanel);
      }
    }

    // ===================================================================
    // VIRTUAL JOYSTICK ENGINE
    // ===================================================================
    bindJoystickEvents() {
      const base = document.getElementById('joystick-base');
      const thumb = document.getElementById('joystick-thumb');
      if (!base || !thumb) return;

      let touchId = null;

      const handleStart = (clientX, clientY, identifier) => {
        this.cancelAutoWalk();
        this.joystickActive = true;
        touchId = identifier;

        const rect = base.getBoundingClientRect();
        this.joystickOrigin = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };

        handleMove(clientX, clientY);
        this.startJoystickLoop();
      };

      const handleMove = (clientX, clientY) => {
        if (!this.joystickActive) return;

        const rawDx = clientX - this.joystickOrigin.x;
        const rawDy = clientY - this.joystickOrigin.y;
        const dist = Math.hypot(rawDx, rawDy);

        const clampedDist = Math.min(dist, this.maxRadius);
        const angle = Math.atan2(rawDy, rawDx);

        const thumbX = Math.cos(angle) * clampedDist;
        const thumbY = Math.sin(angle) * clampedDist;

        thumb.style.transform = `translate(${thumbX}px, ${thumbY}px)`;

        // Quantize into 4-direction RPG movement
        if (dist > 10) {
          const deg = (angle * 180 / Math.PI + 360) % 360;
          if (deg >= 45 && deg < 135) {
            this.activeDirection = { dx: 0, dy: 1, dir: 'down' };
          } else if (deg >= 135 && deg < 225) {
            this.activeDirection = { dx: -1, dy: 0, dir: 'left' };
          } else if (deg >= 225 && deg < 315) {
            this.activeDirection = { dx: 0, dy: -1, dir: 'up' };
          } else {
            this.activeDirection = { dx: 1, dy: 0, dir: 'right' };
          }
        } else {
          this.activeDirection = null;
        }
      };

      const handleEnd = () => {
        this.joystickActive = false;
        this.activeDirection = null;
        touchId = null;
        thumb.style.transform = 'translate(0px, 0px)';
        this.stopJoystickLoop();
      };

      // Touch events
      base.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const t = e.changedTouches[0];
        handleStart(t.clientX, t.clientY, t.identifier);
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        if (!this.joystickActive) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === touchId) {
            e.preventDefault();
            handleMove(t.clientX, t.clientY);
            break;
          }
        }
      }, { passive: false });

      window.addEventListener('touchend', (e) => {
        if (!this.joystickActive) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === touchId) {
            handleEnd();
            break;
          }
        }
      });

      window.addEventListener('touchcancel', handleEnd);

      // Mouse drag emulation for testing on desktop browser devtools
      base.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleStart(e.clientX, e.clientY, 'mouse');

        const onMouseMove = (ev) => handleMove(ev.clientX, ev.clientY);
        const onMouseUp = () => {
          handleEnd();
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });
    }

    startJoystickLoop() {
      if (this.joystickInterval) return;
      this.joystickInterval = setInterval(() => {
        if (!this.joystickActive || !this.activeDirection) return;
        if (!window.player || !window.mapManager) return;

        // Ensure dialogue or modals don't move character
        if (window.uiManager) {
          if (window.uiManager.isDialogueOpen() || 
              window.uiManager.isMenuOpen() || 
              window.uiManager.isBagOpen() || 
              window.uiManager.isCharSelectOpen() ||
              window.uiManager.isTitleScreenOpen()) {
            return;
          }
        }

        window.player.tryMove(this.activeDirection.dx, this.activeDirection.dy);
      }, 140);
    }

    stopJoystickLoop() {
      if (this.joystickInterval) {
        clearInterval(this.joystickInterval);
        this.joystickInterval = null;
      }
    }

    // ===================================================================
    // MOBILE RETRO ACTION BUTTONS
    // ===================================================================
    bindActionButtons() {
      const btnA = document.getElementById('touch-btn-a');
      const btnB = document.getElementById('touch-btn-b');
      const btnMenu = document.getElementById('touch-btn-menu');
      const btnHail = document.getElementById('touch-btn-hail');

      const triggerHaptic = () => {
        if (navigator.vibrate) navigator.vibrate(12);
      };

      const attachFastTap = (element, callback) => {
        if (!element) return;
        let lastTapTime = 0;

        const handleTap = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const now = Date.now();
          if (now - lastTapTime < 320) return; // Prevent double trigger
          lastTapTime = now;
          triggerHaptic();
          callback();
        };

        element.addEventListener('pointerdown', (e) => {
          if (e.isPrimary) handleTap(e);
        });

        element.addEventListener('click', (e) => {
          handleTap(e);
        });
      };

      // Button A: Interact / Confirm
      attachFastTap(btnA, () => {
        if (window.uiManager) {
          if (window.uiManager.isCharSelectOpen()) {
            window.uiManager.confirmCharacterAndStart();
            return;
          }
          if (window.uiManager.isTitleScreenOpen()) {
            window.uiManager.openCharacterSelect();
            return;
          }
          if (window.uiManager.isDialogueOpen()) {
            window.uiManager.advanceDialogue();
            return;
          }
          if (window.uiManager.isMenuOpen()) {
            window.uiManager.triggerSelectedMenuAction();
            return;
          }
        }

        if (window.game) {
          if (typeof window.game.handleInteract === 'function') {
            window.game.handleInteract();
          } else if (typeof window.game.interactWithWorld === 'function') {
            window.game.interactWithWorld();
          }
        }
      });

      // Button B: Devotional Sack / Cancel
      attachFastTap(btnB, () => {
        if (window.uiManager) {
          if (window.uiManager.isDialogueOpen()) {
            if (window.combatSystem && window.combatSystem.inCombat) {
              window.combatSystem.retreatBattle();
            } else {
              window.uiManager.hideDialogue();
            }
            return;
          }
          if (window.uiManager.isBagOpen()) {
            window.uiManager.toggleBag();
            return;
          }
          if (window.uiManager.isMenuOpen()) {
            window.uiManager.toggleStartMenu();
            return;
          }
          if (window.uiManager.isCharSelectOpen()) {
            window.uiManager.closeCharacterSelect();
            return;
          }
          // If in normal play, toggle Bag
          window.uiManager.toggleBag();
        }
      });

      // Button M: Retro Start Menu
      attachFastTap(btnMenu, () => {
        if (window.uiManager && window.uiManager.toggleStartMenu) {
          window.uiManager.toggleStartMenu();
        }
      });

      // Button H: Hail "जय श्री राम!"
      attachFastTap(btnHail, () => {
        if (window.game && window.game.hailShriRam) {
          window.game.hailShriRam();
        }
      });
    }

    // ===================================================================
    // CLICK / TAP TO MOVE & INTERACT (UNIVERSAL: DESKTOP & MOBILE)
    // ===================================================================
    bindClickToMove() {
      const canvas = document.getElementById('gameCanvas');
      if (!canvas) return;

      canvas.addEventListener('pointerdown', (e) => {
        // Only trigger on primary mouse button or touch
        if (e.button !== undefined && e.button !== 0) return;

        // Ignore clicks if clicking on UI overlay elements
        if (e.target !== canvas) return;
        if (e.clientX < 150 && e.clientY > window.innerHeight - 150 && this.isTouchDevice) {
          // Inside joystick zone
          return;
        }

        // Check if dialogues or menus are open
        if (window.uiManager) {
          if (window.uiManager.isDialogueOpen()) {
            if (window.uiManager.isTyping) {
              window.uiManager.skipTypewriter();
            } else {
              window.uiManager.hideDialogue();
            }
            return;
          }
          if (window.uiManager.isMenuOpen() || 
              window.uiManager.isBagOpen() || 
              window.uiManager.isCharSelectOpen() || 
              window.uiManager.isTitleScreenOpen()) {
            return;
          }
        }

        if (!window.player || !window.mapManager || !window.camera || !window.game) return;

        // 1. Calculate Canvas Screen Coordinates
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const screenX = (e.clientX - rect.left) * scaleX;
        const screenY = (e.clientY - rect.top) * scaleY;

        // 2. Convert Screen to World Tile Coordinates
        const worldX = screenX + window.camera.x;
        const worldY = screenY + window.camera.y;
        const ts = window.game.tileSize;
        const targetTileX = Math.floor(worldX / ts);
        const targetTileY = Math.floor(worldY / ts);

        // 3. Spawn Visual Click Ripple Feedback
        this.spawnClickMarker(e.clientX, e.clientY);

        // 4. Handle Immediate Interaction if player clicked adjacent tile
        const px = window.player.x;
        const py = window.player.y;
        const manhattanDist = Math.abs(px - targetTileX) + Math.abs(py - targetTileY);

        if (manhattanDist <= 1) {
          // Face the target tile
          if (targetTileX > px) window.player.direction = 'right';
          else if (targetTileX < px) window.player.direction = 'left';
          else if (targetTileY > py) window.player.direction = 'down';
          else if (targetTileY < py) window.player.direction = 'up';

          if (window.game) {
            if (typeof window.game.handleInteract === 'function') {
              window.game.handleInteract();
            } else if (typeof window.game.interactWithWorld === 'function') {
              window.game.interactWithWorld();
            }
          }
          return;
        }

        // 5. Pathfind towards clicked tile (or nearest adjacent walkable tile if prop/NPC)
        this.navigateTowardsTile(targetTileX, targetTileY);
      });
    }

    spawnClickMarker(clientX, clientY) {
      const marker = document.createElement('div');
      marker.className = 'click-destination-marker';
      marker.style.left = `${clientX}px`;
      marker.style.top = `${clientY}px`;
      document.body.appendChild(marker);

      setTimeout(() => {
        if (marker.parentNode) marker.parentNode.removeChild(marker);
      }, 700);
    }

    navigateTowardsTile(targetX, targetY) {
      const mm = window.mapManager;
      const player = window.player;
      if (!mm || !player) return;

      const startX = player.x;
      const startY = player.y;

      const isWalkable = mm.isWalkable(targetX, targetY);
      let goalX = targetX;
      let goalY = targetY;
      let isPropInteraction = false;

      // If clicked on an obstacle or NPC, pick the closest adjacent walkable tile
      if (!isWalkable) {
        isPropInteraction = true;
        const neighbors = [
          { x: targetX, y: targetY - 1 },
          { x: targetX, y: targetY + 1 },
          { x: targetX - 1, y: targetY },
          { x: targetX + 1, y: targetY }
        ].filter(n => mm.isWalkable(n.x, n.y));

        if (neighbors.length === 0) return;

        // Sort by distance to current player position
        neighbors.sort((a, b) => {
          const distA = Math.hypot(a.x - startX, a.y - startY);
          const distB = Math.hypot(b.x - startX, b.y - startY);
          return distA - distB;
        });
        goalX = neighbors[0].x;
        goalY = neighbors[0].y;
      }

      // BFS Shortest Path Algorithm on Map Grid (Ultra fast on 34x26)
      const path = this.findPathBFS(startX, startY, goalX, goalY);
      if (!path || path.length === 0) return;

      this.currentPath = path;
      this.targetInteractionTile = isPropInteraction ? { x: targetX, y: targetY } : null;

      this.startAutoWalk();
    }

    findPathBFS(startX, startY, goalX, goalY) {
      const mm = window.mapManager;
      if (startX === goalX && startY === goalY) return [];

      const queue = [{ x: startX, y: startY, path: [] }];
      const visited = new Set();
      visited.add(`${startX},${startY}`);

      const directions = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 }
      ];

      while (queue.length > 0) {
        const current = queue.shift();

        if (current.x === goalX && current.y === goalY) {
          return current.path;
        }

        // Limit search horizon to 120 steps to prevent stalls
        if (current.path.length > 55) continue;

        for (const d of directions) {
          const nx = current.x + d.dx;
          const ny = current.y + d.dy;
          const key = `${nx},${ny}`;

          if (!visited.has(key) && (mm.isWalkable(nx, ny) || (nx === goalX && ny === goalY))) {
            visited.add(key);
            queue.push({
              x: nx,
              y: ny,
              path: [...current.path, { dx: d.dx, dy: d.dy, x: nx, y: ny }]
            });
          }
        }
      }

      return null;
    }

    startAutoWalk() {
      this.cancelAutoWalk();

      const stepOnce = () => {
        if (!this.currentPath || this.currentPath.length === 0) {
          this.cancelAutoWalk();
          // If was heading to an interactive prop/NPC, trigger interaction upon arrival
          if (this.targetInteractionTile && window.player && window.game) {
            const tx = this.targetInteractionTile.x;
            const ty = this.targetInteractionTile.y;
            const px = window.player.x;
            const py = window.player.y;

            if (tx > px) window.player.direction = 'right';
            else if (tx < px) window.player.direction = 'left';
            else if (ty > py) window.player.direction = 'down';
            else if (ty < py) window.player.direction = 'up';

            if (window.game) {
              if (typeof window.game.handleInteract === 'function') {
                window.game.handleInteract();
              } else if (typeof window.game.interactWithWorld === 'function') {
                window.game.interactWithWorld();
              }
            }
          }
          this.targetInteractionTile = null;
          return;
        }

        const nextStep = this.currentPath[0];
        if (window.player && window.player.moveProgress >= 0.85) {
          const moved = window.player.tryMove(nextStep.dx, nextStep.dy);
          if (moved) {
            this.currentPath.shift();
          } else {
            // Path blocked by unexpected entity
            this.cancelAutoWalk();
          }
        }
      };

      stepOnce();
      this.pathStepInterval = setInterval(stepOnce, 130);
    }

    cancelAutoWalk() {
      if (this.pathStepInterval) {
        clearInterval(this.pathStepInterval);
        this.pathStepInterval = null;
      }
      this.currentPath = [];
    }

    bindInputOverride() {
      // Any physical keyboard press immediately interrupts auto-walk for responsive feel
      window.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
          this.cancelAutoWalk();
        }
      });
    }
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.touchControlsManager = new TouchControlsManager();
    });
  } else {
    window.touchControlsManager = new TouchControlsManager();
  }
})();
