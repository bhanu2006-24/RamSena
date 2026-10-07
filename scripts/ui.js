/**
 * RAM SENA - UI & Menu Controller (scripts/ui.js)
 * Manages Title Menu, About Modal, Character Selection, Prologue Story,
 * Inventory Modal, Dialogue Box, Typewriter animation, and HUD elements.
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

    // Modals
    this.mainMenuModal = document.getElementById('main-menu-modal');
    this.aboutModal = document.getElementById('about-modal');
    this.characterModal = document.getElementById('character-modal');
    this.prologueModal = document.getElementById('prologue-modal');
    this.inventoryModal = document.getElementById('inventory-modal');

    // Buttons
    this.btnStartJourney = document.getElementById('btn-start-journey');
    this.btnOpenAbout = document.getElementById('btn-open-about');
    this.btnCloseAbout = document.getElementById('btn-close-about');
    this.btnChooseVanar = document.getElementById('choose-vanar');
    this.btnChooseRiksha = document.getElementById('choose-riksha');
    this.btnConfirmCharacter = document.getElementById('btn-confirm-character');
    this.btnBeginFromPrologue = document.getElementById('btn-begin-from-prologue');
    this.btnOpenInventory = document.getElementById('btn-open-inventory');
    this.btnCloseInventory = document.getElementById('btn-close-inventory');
    this.btnCraftGarland = document.getElementById('btn-craft-garland-modal');
    this.btnHailHUD = document.getElementById('btn-hail-ram');
    this.btnAudioToggle = document.getElementById('btn-audio-toggle');
    this.btnMapTravel = document.getElementById('btn-map-travel');
    this.travelModal = document.getElementById('travel-modal');
    this.btnCloseTravel = document.getElementById('btn-close-travel');

    this.selectedArchetype = 'vanar';
    this.logCount = 0;
    this.typewriterTimer = null;
    this.isTyping = false;
    this.currentFullText = '';

    this.initListeners();
  }

  initListeners() {
    // Tabs
    if (this.tabDialogueBtn && this.tabLogBtn) {
      this.tabDialogueBtn.addEventListener('click', () => this.switchTab('dialogue'));
      this.tabLogBtn.addEventListener('click', () => this.switchTab('log'));
    }

    // Title Screen Buttons
    if (this.btnStartJourney) {
      this.btnStartJourney.addEventListener('click', () => {
        this.openCharacterSelect();
      });
    }

    if (this.btnOpenAbout) {
      this.btnOpenAbout.addEventListener('click', () => {
        this.aboutModal.classList.remove('hidden');
      });
    }

    if (this.btnCloseAbout) {
      this.btnCloseAbout.addEventListener('click', () => {
        this.aboutModal.classList.add('hidden');
      });
    }

    // Character Select
    if (this.btnChooseVanar && this.btnChooseRiksha) {
      this.btnChooseVanar.addEventListener('click', () => this.selectArchetype('vanar'));
      this.btnChooseRiksha.addEventListener('click', () => this.selectArchetype('riksha'));
    }

    if (this.btnConfirmCharacter) {
      this.btnConfirmCharacter.addEventListener('click', () => {
        this.characterModal.classList.add('hidden');
        this.openPrologue();
      });
    }

    // Prologue Button
    if (this.btnBeginFromPrologue) {
      this.btnBeginFromPrologue.addEventListener('click', () => {
        this.prologueModal.classList.add('hidden');
        this.mainMenuModal.classList.add('hidden');
        this.startGameSession();
      });
    }

    // Inventory Modal
    if (this.btnOpenInventory) {
      this.btnOpenInventory.addEventListener('click', () => this.openInventory());
    }
    if (this.btnCloseInventory) {
      this.btnCloseInventory.addEventListener('click', () => this.inventoryModal.classList.add('hidden'));
    }
    if (this.btnCraftGarland) {
      this.btnCraftGarland.addEventListener('click', () => {
        if (window.inventory) {
          window.inventory.craftGarland();
          this.refreshInventoryUI();
        }
      });
    }

    // Hail Button
    if (this.btnHailHUD) {
      this.btnHailHUD.addEventListener('click', () => {
        if (window.audioManager) {
          window.audioManager.hailShriRam();
        }
      });
    }

    // Audio Toggle
    if (this.btnAudioToggle) {
      this.btnAudioToggle.addEventListener('click', () => {
        if (window.audioManager) {
          const muted = window.audioManager.toggleMute();
          this.btnAudioToggle.textContent = muted ? '🔇 Muted' : '🎵 Sound ON';
        }
      });
    }

    // Travel Modal
    if (this.btnMapTravel) {
      this.btnMapTravel.addEventListener('click', () => this.openTravelModal());
    }
    if (this.btnCloseTravel) {
      this.btnCloseTravel.addEventListener('click', () => this.travelModal.classList.add('hidden'));
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

  openCharacterSelect() {
    this.characterModal.classList.remove('hidden');
  }

  openPrologue() {
    this.prologueModal.classList.remove('hidden');
  }

  startGameSession() {
    if (window.audioManager) {
      window.audioManager.startBGM();
    }

    if (window.mapManager) {
      window.mapManager.registerMaps();
    }

    if (window.player) {
      window.player.setCharacterType(this.selectedArchetype);
    }

    if (window.game) {
      window.game.state = window.GAME_STATES.OVERWORLD;
    }

    const arch = window.player.role;
    this.addLog(`Joined Shri Ram's vanguard as ${arch}.`, 'service');
  }

  openInventory() {
    this.refreshInventoryUI();
    this.inventoryModal.classList.remove('hidden');
  }

  refreshInventoryUI() {
    if (!window.inventory || !window.player) return;

    document.getElementById('inv-stones').textContent = window.inventory.items.stones;
    document.getElementById('inv-fruits').textContent = window.inventory.items.fruits;
    document.getElementById('inv-flowers').textContent = window.inventory.items.flowers;
    document.getElementById('inv-coconuts').textContent = window.inventory.items.coconuts;
    document.getElementById('inv-garlands').textContent = window.inventory.items.garlands;
    document.getElementById('inv-wood').textContent = window.inventory.items.wood;

    document.getElementById('stat-hp').textContent = `${window.player.hp}/${window.player.maxHp}`;
    document.getElementById('stat-atk').textContent = window.player.attackStat;
    document.getElementById('stat-def').textContent = window.player.defenseStat;
    document.getElementById('stat-agi').textContent = window.player.agilityStat;
    document.getElementById('stat-role').textContent = window.player.role;

    document.getElementById('stat-setu-stones').textContent = window.mapManager ? window.mapManager.stonesDelivered : 0;
  }

  openTravelModal() {
    const listEl = document.getElementById('travel-map-list');
    listEl.innerHTML = '';

    const maps = [
      { id: 'camp1', name: 'Phase 1: Camp (Southern Shores)' },
      { id: 'forest1', name: 'Phase 1: Forest (Fruit Trees & Stones)' },
      { id: 'beach1', name: 'Phase 1: Beach (Nal & Neel Setu Site)' },
      { id: 'camp2', name: 'Phase 2: Lanka Camp (Sushena Vaidya)' },
      { id: 'forest2', name: 'Phase 2: Lanka Forest (No Stones)' },
      { id: 'beach2', name: 'Phase 2: Lanka Beach (View Setu)' },
      { id: 'field', name: 'Phase 2: The Battlefield (Rakshasa Encounters)' }
    ];

    maps.forEach(m => {
      const btn = document.createElement('button');
      btn.className = 'travel-btn';
      btn.textContent = m.name;
      btn.addEventListener('click', () => {
        this.travelModal.classList.add('hidden');
        window.mapManager.loadMap(m.id, null, null, true);
      });
      listEl.appendChild(btn);
    });

    this.travelModal.classList.remove('hidden');
  }

  showChantAura(text) {
    const banner = document.createElement('div');
    banner.className = 'chant-screen-banner';
    banner.innerHTML = `<span class="chant-glow">ॐ ${text} ॐ</span>`;
    document.getElementById('viewport-section').appendChild(banner);

    setTimeout(() => {
      banner.classList.add('fade-out');
      setTimeout(() => banner.remove(), 600);
    }, 1200);
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
    const typingSpeed = 14;

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
