/**
 * RAM SENA - UI & Start Menu Controller (scripts/ui.js)
 * Manages the start menu character selection (Vanar vs Riksha/Bear),
 * bottom 30% dialogue box, typewriter animation, and action logs.
 */

class UIManager {
  constructor() {
    // DOM Elements
    this.speakerNameEl = document.getElementById('speaker-name');
    this.speakerIconEl = document.getElementById('speaker-icon');
    this.dialogueTextEl = document.getElementById('dialogue-text');
    this.dialoguePromptEl = document.getElementById('dialogue-prompt');
    this.dialogueActionsEl = document.getElementById('dialogue-actions');
    this.logListEl = document.getElementById('log-list');
    this.logCountEl = document.getElementById('log-count');
    this.coordDisplayEl = document.getElementById('coord-display');
    this.phaseIndicatorEl = document.getElementById('phase-indicator');
    this.roleNameEl = document.getElementById('hud-role-name');
    this.roleIconEl = document.getElementById('hud-role-icon');

    this.tabDialogueBtn = document.getElementById('tab-dialogue');
    this.tabLogBtn = document.getElementById('tab-log');
    this.dialogueView = document.getElementById('dialogue-view');
    this.logView = document.getElementById('log-view');

    // Start Menu Modal
    this.startMenuModal = document.getElementById('start-menu-modal');
    this.btnChooseVanar = document.getElementById('choose-vanar');
    this.btnChooseRiksha = document.getElementById('choose-riksha');
    this.btnStartGame = document.getElementById('btn-start-game');
    this.btnOpenMenu = document.getElementById('btn-open-menu');

    this.selectedArchetype = 'vanar';
    this.logCount = 0;
    this.typewriterTimer = null;
    this.isTyping = false;
    this.currentFullText = '';

    this.initTabs();
    this.initStartMenu();
  }

  initTabs() {
    if (this.tabDialogueBtn && this.tabLogBtn) {
      this.tabDialogueBtn.addEventListener('click', () => this.switchTab('dialogue'));
      this.tabLogBtn.addEventListener('click', () => this.switchTab('log'));
    }
  }

  initStartMenu() {
    if (this.btnChooseVanar && this.btnChooseRiksha) {
      this.btnChooseVanar.addEventListener('click', () => {
        this.selectArchetype('vanar');
      });
      this.btnChooseRiksha.addEventListener('click', () => {
        this.selectArchetype('riksha');
      });
    }

    if (this.btnStartGame) {
      this.btnStartGame.addEventListener('click', () => {
        this.startGameSession();
      });
    }

    if (this.btnOpenMenu) {
      this.btnOpenMenu.addEventListener('click', () => {
        this.showStartMenu();
      });
    }
  }

  selectArchetype(typeId) {
    this.selectedArchetype = typeId;
    if (typeId === 'vanar') {
      this.btnChooseVanar.classList.add('selected');
      this.btnChooseRiksha.classList.remove('selected');
    } else {
      this.btnChooseRiksha.classList.add('selected');
      this.btnChooseVanar.classList.remove('selected');
    }

    if (window.player) {
      window.player.setCharacterType(typeId);
    }
  }

  showStartMenu() {
    if (this.startMenuModal) {
      this.startMenuModal.classList.remove('hidden');
      if (window.game) {
        window.game.state = window.GAME_STATES.MENU;
      }
    }
  }

  hideStartMenu() {
    if (this.startMenuModal) {
      this.startMenuModal.classList.add('hidden');
    }
  }

  startGameSession() {
    this.hideStartMenu();

    if (window.player) {
      window.player.setCharacterType(this.selectedArchetype);
      // Spawn player at camp center
      window.player.x = window.mapManager.spawnX;
      window.player.y = window.mapManager.spawnY;
      window.player.visualX = window.mapManager.spawnX;
      window.player.visualY = window.mapManager.spawnY;

      // Snap camera directly to player
      if (window.camera && window.game) {
        window.camera.snapTo(
          window.player,
          window.game.tileSize,
          window.mapManager.width,
          window.mapManager.height
        );
      }
    }

    if (window.game) {
      window.game.state = window.GAME_STATES.OVERWORLD;
    }

    const archData = window.CHARACTER_TYPES[this.selectedArchetype.toUpperCase()];
    const introText = 
      `You enter the camp as a ${archData.name}. ${archData.lore} ` +
      `The mighty ocean roars in the distance as Shri Ram's vanguard prepares for the sacred crossing. ` +
      `Use WASD or Arrow Keys to explore the encampment.`;

    this.showDialogue('Southern Camp of the Sena', introText, archData.symbol);
    this.addLog(`Joined the army as ${archData.name}.`, 'service');
  }

  switchTab(tabName) {
    if (tabName === 'dialogue') {
      this.tabDialogueBtn.classList.add('active');
      this.tabLogBtn.classList.remove('active');
      this.dialogueView.classList.add('active');
      this.logView.classList.remove('active');
    } else {
      this.tabLogBtn.classList.add('active');
      this.tabDialogueBtn.classList.remove('active');
      this.logView.classList.add('active');
      this.dialogueView.classList.remove('active');
    }
  }

  updateCoordinates(x, y) {
    if (this.coordDisplayEl) {
      this.coordDisplayEl.textContent = `(${x}, ${y})`;
    }
  }

  updateRoleHUD(name, symbol) {
    if (this.roleNameEl) this.roleNameEl.textContent = name;
    if (this.roleIconEl) this.roleIconEl.textContent = symbol;
  }

  setPhaseText(text) {
    if (this.phaseIndicatorEl) {
      this.phaseIndicatorEl.textContent = text;
    }
  }

  showDialogue(speaker, text, icon = '📜', choices = [], onComplete = null) {
    this.switchTab('dialogue');

    if (this.speakerNameEl) this.speakerNameEl.textContent = speaker;
    if (this.speakerIconEl) this.speakerIconEl.textContent = icon;

    if (this.dialogueActionsEl) {
      this.dialogueActionsEl.innerHTML = '';
    }

    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
    }

    this.currentFullText = text;
    this.dialogueTextEl.textContent = '';
    this.isTyping = true;

    if (this.dialoguePromptEl) {
      this.dialoguePromptEl.style.display = 'none';
    }

    let charIndex = 0;
    const typingSpeed = 15;

    this.typewriterTimer = setInterval(() => {
      if (charIndex < text.length) {
        this.dialogueTextEl.textContent += text.charAt(charIndex);
        charIndex++;
      } else {
        clearInterval(this.typewriterTimer);
        this.typewriterTimer = null;
        this.isTyping = false;
        this.finishDialogue(choices, onComplete);
      }
    }, typingSpeed);
  }

  skipTypewriter() {
    if (this.isTyping && this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
      this.dialogueTextEl.textContent = this.currentFullText;
      this.isTyping = false;
      if (this.dialoguePromptEl) {
        this.dialoguePromptEl.style.display = 'flex';
      }
    }
  }

  finishDialogue(choices = [], onComplete = null) {
    if (this.dialoguePromptEl) {
      this.dialoguePromptEl.style.display = 'flex';
    }

    if (choices && choices.length > 0 && this.dialogueActionsEl) {
      choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.innerHTML = choice.label;
        btn.addEventListener('click', () => {
          if (choice.action) choice.action();
        });
        this.dialogueActionsEl.appendChild(btn);
      });
    }

    if (onComplete) onComplete();
  }

  addLog(message, type = 'info') {
    this.logCount++;
    if (this.logCountEl) {
      this.logCountEl.textContent = this.logCount;
    }

    if (this.logListEl) {
      const li = document.createElement('li');
      li.className = `log-item ${type}`;

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      li.innerHTML = `<span class="log-time">[${timeStr}]</span> ${message}`;
      this.logListEl.prepend(li);
    }
  }
}

window.uiManager = new UIManager();
