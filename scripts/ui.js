/**
 * RAM SENA - UI & Dialogue Engine (scripts/ui.js)
 * Implements:
 * - Fullscreen Title Screen (Matching Contract Demon reference)
 * - Character Select (Permanent choice for playthrough)
 * - Authentic Pokemon Emerald Dialogue Box (Matching reference with blinking red cursor ▼)
 * - Pokemon In-Game Start Menu & Bag System
 * - LocalStorage Save & Load
 */

class UIManager {
  constructor() {
    // 1. Dialogue Elements (Pokemon Emerald style)
    this.textboxWrapper = document.getElementById('pokemon-textbox-wrapper');
    this.speakerTag = document.getElementById('poke-speaker-name');
    this.dialogueText = document.getElementById('poke-dialogue-text');
    this.cursorIndicator = document.getElementById('poke-cursor');
    this.choicesContainer = document.getElementById('poke-choices');

    // 2. Title Screen & Character Select
    this.titleScreen = document.getElementById('title-screen');
    this.btnTitleStart = document.getElementById('btn-title-start');
    this.btnTitleLoad = document.getElementById('btn-title-load');
    this.btnTitleOptions = document.getElementById('btn-title-options');
    this.btnTitleAbout = document.getElementById('btn-title-about');

    this.charSelectScreen = document.getElementById('character-select-screen');
    this.optVanar = document.getElementById('opt-vanar');
    this.optRiksha = document.getElementById('opt-riksha');
    this.btnConfirmArchetype = document.getElementById('btn-confirm-archetype');

    // 3. Modals
    this.aboutModal = document.getElementById('about-modal');
    this.btnCloseAbout = document.getElementById('btn-close-about');
    this.optionsModal = document.getElementById('options-modal');
    this.btnCloseOptions = document.getElementById('btn-close-options');
    this.optBgmToggle = document.getElementById('opt-bgm-toggle');
    this.optTextSpeed = document.getElementById('opt-text-speed');

    // 4. In-Game Start Menu & Bag
    this.menuTrigger = document.getElementById('in-game-menu-trigger');
    this.startMenu = document.getElementById('pokemon-start-menu');
    this.menuBtnBag = document.getElementById('menu-btn-bag');
    this.menuBtnSevaka = document.getElementById('menu-btn-sevaka');
    this.menuBtnHail = document.getElementById('menu-btn-hail');
    this.menuBtnSave = document.getElementById('menu-btn-save');
    this.menuBtnOptions = document.getElementById('menu-btn-options');
    this.menuBtnClose = document.getElementById('menu-btn-close');

    this.bagModal = document.getElementById('pokemon-bag-modal');
    this.bagItemList = document.getElementById('bag-item-list');
    this.bagDetailIcon = document.getElementById('bag-detail-icon');
    this.bagDetailName = document.getElementById('bag-detail-name');
    this.bagDetailDesc = document.getElementById('bag-detail-desc');
    this.bagActionsContainer = document.getElementById('bag-actions-container');
    this.btnCloseBag = document.getElementById('btn-close-bag');

    this.sevakaCardModal = document.getElementById('sevaka-card-modal');
    this.btnCloseSevakaCard = document.getElementById('btn-close-sevaka-card');

    // Location Banner
    this.locationBanner = document.getElementById('location-banner');
    this.locNameEl = document.getElementById('loc-name');
    this.locSubEl = document.getElementById('loc-sub');
    this.locBannerTimer = null;

    // State
    this.selectedArchetype = 'vanar';
    this.isArchetypeLocked = false;
    this.selectedBagItemKey = 'stones';
    this.typewriterTimer = null;
    this.isTyping = false;
    this.currentFullText = '';
    this.textSpeed = 12; // ms per char (Fast by default)

    this.initListeners();
  }

  initListeners() {
    // Title Screen
    if (this.btnTitleStart) {
      this.btnTitleStart.addEventListener('click', () => {
        this.openCharacterSelect();
      });
    }

    if (this.btnTitleLoad) {
      this.btnTitleLoad.addEventListener('click', () => {
        this.loadGame();
      });
    }

    if (this.btnTitleOptions) {
      this.btnTitleOptions.addEventListener('click', () => {
        this.optionsModal.classList.remove('hidden');
      });
    }

    if (this.btnTitleAbout) {
      this.btnTitleAbout.addEventListener('click', () => {
        this.aboutModal.classList.remove('hidden');
      });
    }

    if (this.btnCloseAbout) {
      this.btnCloseAbout.addEventListener('click', () => {
        this.aboutModal.classList.add('hidden');
      });
    }

    if (this.btnCloseOptions) {
      this.btnCloseOptions.addEventListener('click', () => {
        this.optionsModal.classList.add('hidden');
      });
    }

    // Options Toggles
    if (this.optBgmToggle) {
      this.optBgmToggle.addEventListener('click', () => {
        if (window.audioManager) {
          const isMuted = window.audioManager.toggleMute();
          this.optBgmToggle.textContent = isMuted ? 'OFF' : 'ON';
        }
      });
    }

    if (this.optTextSpeed) {
      this.optTextSpeed.addEventListener('click', () => {
        if (this.textSpeed === 12) {
          this.textSpeed = 24;
          this.optTextSpeed.textContent = 'MEDIUM';
        } else if (this.textSpeed === 24) {
          this.textSpeed = 6;
          this.optTextSpeed.textContent = 'INSTANT';
        } else {
          this.textSpeed = 12;
          this.optTextSpeed.textContent = 'FAST';
        }
      });
    }

    // Character Selection
    if (this.optVanar && this.optRiksha) {
      this.optVanar.addEventListener('click', () => {
        this.optVanar.classList.add('selected');
        this.optRiksha.classList.remove('selected');
        this.selectedArchetype = 'vanar';
      });

      this.optRiksha.addEventListener('click', () => {
        this.optRiksha.classList.add('selected');
        this.optVanar.classList.remove('selected');
        this.selectedArchetype = 'riksha';
      });
    }

    if (this.btnConfirmArchetype) {
      this.btnConfirmArchetype.addEventListener('click', () => {
        this.confirmCharacterAndStart();
      });
    }

    // In-Game Menu Toggle
    if (this.menuTrigger) {
      this.menuTrigger.addEventListener('click', () => {
        this.toggleStartMenu();
      });
    }

    if (this.menuBtnClose) {
      this.menuBtnClose.addEventListener('click', () => {
        this.closeStartMenu();
      });
    }

    if (this.menuBtnBag) {
      this.menuBtnBag.addEventListener('click', () => {
        this.closeStartMenu();
        this.openBag();
      });
    }

    if (this.menuBtnSevaka) {
      this.menuBtnSevaka.addEventListener('click', () => {
        this.closeStartMenu();
        this.openSevakaCard();
      });
    }

    if (this.menuBtnHail) {
      this.menuBtnHail.addEventListener('click', () => {
        this.closeStartMenu();
        if (window.audioManager) {
          window.audioManager.hailShriRam();
        }
      });
    }

    if (this.menuBtnSave) {
      this.menuBtnSave.addEventListener('click', () => {
        this.closeStartMenu();
        this.saveGame();
      });
    }

    if (this.menuBtnOptions) {
      this.menuBtnOptions.addEventListener('click', () => {
        this.closeStartMenu();
        this.optionsModal.classList.remove('hidden');
      });
    }

    if (this.btnCloseBag) {
      this.btnCloseBag.addEventListener('click', () => {
        this.bagModal.classList.add('hidden');
      });
    }

    if (this.btnCloseSevakaCard) {
      this.btnCloseSevakaCard.addEventListener('click', () => {
        this.sevakaCardModal.classList.add('hidden');
      });
    }

    // Advance dialogue on clicking anywhere on dialogue box
    if (this.textboxWrapper) {
      this.textboxWrapper.addEventListener('click', (e) => {
        if (!e.target.closest('.poke-choice-btn')) {
          this.advanceDialogue();
        }
      });
    }
  }

  openCharacterSelect() {
    this.charSelectScreen.classList.remove('hidden');
  }

  confirmCharacterAndStart() {
    this.charSelectScreen.classList.add('hidden');
    this.titleScreen.classList.add('hidden');

    // LOCK character permanently for playthrough
    this.isArchetypeLocked = true;

    if (window.player) {
      window.player.setCharacterType(this.selectedArchetype);
    }

    if (window.audioManager) {
      window.audioManager.startBGM();
    }

    if (window.mapManager) {
      window.mapManager.registerMaps();
    }

    if (window.game) {
      window.game.state = window.GAME_STATES.OVERWORLD;
    }

    const archName = this.selectedArchetype === 'vanar' ? 'Vanar (वानर) 🐒' : 'Riksha (ऋक्ष - भालू) 🐻';
    const welcome = 
      `You enter the southern camp of Shri Ram as a faithful ${archName}. ` +
      `The mighty ocean roars ahead. Speak to Shri Ram and your fellow soldiers, ` +
      `and offer whatever humble service you can. जय श्री राम!`;

    this.showDialogue('Southern Camp', welcome);
  }

  // ===================================================================
  // POKEMON EMERALD DIALOGUE SYSTEM
  // ===================================================================

  showDialogue(speaker, text, icon = '', choices = [], onComplete = null) {
    this.textboxWrapper.classList.remove('hidden');

    if (this.speakerTag) {
      this.speakerTag.textContent = speaker ? `${icon ? icon + ' ' : ''}${speaker}` : '';
      this.speakerTag.style.display = speaker ? 'inline-flex' : 'none';
    }

    if (this.choicesContainer) {
      this.choicesContainer.innerHTML = '';
    }

    if (this.cursorIndicator) {
      this.cursorIndicator.classList.remove('active');
    }

    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
    }

    this.currentFullText = text;
    this.dialogueText.textContent = '';
    this.isTyping = true;

    let charIndex = 0;

    this.typewriterTimer = setInterval(() => {
      if (charIndex < text.length) {
        this.dialogueText.textContent += text.charAt(charIndex);
        charIndex++;
      } else {
        clearInterval(this.typewriterTimer);
        this.typewriterTimer = null;
        this.isTyping = false;
        this.finishDialogue(choices, onComplete);
      }
    }, this.textSpeed);
  }

  skipTypewriter() {
    if (this.isTyping && this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
      this.dialogueText.textContent = this.currentFullText;
      this.isTyping = false;
      this.finishDialogue();
    }
  }

  finishDialogue(choices = [], onComplete = null) {
    if (this.cursorIndicator) {
      this.cursorIndicator.classList.add('active');
    }

    if (choices && choices.length > 0 && this.choicesContainer) {
      choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'poke-choice-btn';
        btn.innerHTML = choice.label;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (choice.action) choice.action();
        });
        this.choicesContainer.appendChild(btn);
      });
    }

    if (onComplete) onComplete();
  }

  advanceDialogue() {
    if (this.isTyping) {
      this.skipTypewriter();
    } else {
      // If no choices are pending, close dialogue
      if (!this.choicesContainer || this.choicesContainer.children.length === 0) {
        this.hideDialogue();
      }
    }
  }

  hideDialogue() {
    if (this.textboxWrapper) {
      this.textboxWrapper.classList.add('hidden');
    }
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    this.isTyping = false;
  }

  // ===================================================================
  // POKEMON START MENU & BAG
  // ===================================================================

  toggleStartMenu() {
    if (this.startMenu.classList.contains('hidden')) {
      this.openStartMenu();
    } else {
      this.closeStartMenu();
    }
  }

  openStartMenu() {
    this.startMenu.classList.remove('hidden');
  }

  closeStartMenu() {
    this.startMenu.classList.add('hidden');
  }

  openBag() {
    this.renderBagItems();
    this.selectBagItem(this.selectedBagItemKey);
    this.bagModal.classList.remove('hidden');
  }

  renderBagItems() {
    const inv = window.inventory ? window.inventory.items : {};
    const itemsData = [
      { key: 'stones', name: 'Sacred Stones', icon: '🪨', qty: inv.stones || 0, desc: 'Heavy mountain stones. Bring them to Nal & Neel at the beach to build Ram Setu!' },
      { key: 'fruits', name: 'Wild Fruits', icon: '🍎', qty: inv.fruits || 0, desc: 'Sweet forest fruits (Mango, Berries, Apple, Jamun). Offer them to Shri Ram or commanders for blessings.' },
      { key: 'flowers', name: 'Forest Flowers', icon: '🌸', qty: inv.flowers || 0, desc: 'Fragrant forest blossoms. Collect 5 blossoms to weave a devotional garland (पुष्पमाला).' },
      { key: 'coconuts', name: 'Fresh Coconuts', icon: '🥥', qty: inv.coconuts || 0, desc: 'Sacred coconuts gathered from coastal palms. Auspicious offering for the holy altar.' },
      { key: 'garlands', name: 'Devotional Garlands', icon: '📿', qty: inv.garlands || 0, desc: 'Hand-woven sacred flower garlands woven with pure Bhakti. Offer to Shri Ram or Hanuman.' },
      { key: 'wood', name: 'Dry Wood', icon: '🪵', qty: inv.wood || 0, desc: 'Sturdy dry branches gathered from the forest for sacred campfires and defense.' }
    ];

    this.bagItemList.innerHTML = '';
    itemsData.forEach(item => {
      const row = document.createElement('div');
      row.className = `poke-bag-item-row ${this.selectedBagItemKey === item.key ? 'active' : ''}`;
      row.innerHTML = `
        <span>${item.icon} ${item.name}</span>
        <span class="item-qty">×${String(item.qty).padStart(2, '0')}</span>
      `;
      row.addEventListener('click', () => {
        this.selectBagItem(item.key, item);
      });
      this.bagItemList.appendChild(row);
    });
  }

  selectBagItem(key) {
    this.selectedBagItemKey = key;
    const inv = window.inventory ? window.inventory.items : {};

    const itemDetails = {
      stones: { name: 'Sacred Stone', icon: '🪨', desc: 'Heavy stone for Nal & Neel to inscribe with "RAM" to construct the Setu bridge across the sea.' },
      fruits: { name: 'Wild Fruit', icon: '🍎', desc: 'Ripe forest fruit. Offer to Shri Ram, Lakshman, Hanuman, or fellow soldiers for divine blessings.' },
      flowers: { name: 'Forest Flower', icon: '🌸', desc: 'Fragrant blossom. When you hold 5 or more flowers, you can weave a devotional garland (पुष्पमाला)!' },
      coconuts: { name: 'Fresh Coconut', icon: '🥥', desc: 'Sacred coastal coconut (श्रीफल). Ideal offering for prayer and sustenance.' },
      garlands: { name: 'Devotional Garland', icon: '📿', desc: 'A fragrant hand-woven garland (पुष्पमाला) woven with pure love and devotion.' },
      wood: { name: 'Dry Wood', icon: '🪵', desc: 'Sturdy forest branches for campfires, barricades, and tool crafting.' }
    };

    const detail = itemDetails[key] || itemDetails.stones;
    this.bagDetailIcon.textContent = detail.icon;
    this.bagDetailName.textContent = detail.name;
    this.bagDetailDesc.textContent = detail.desc;

    // Render Actions
    this.bagActionsContainer.innerHTML = '';

    if (key === 'flowers') {
      const count = inv.flowers || 0;
      const craftBtn = document.createElement('button');
      craftBtn.className = 'btn-poke-action';
      craftBtn.textContent = count >= 5 ? '🌸 CRAFT GARLAND (WEAVE 5)' : '🌸 NEED 5 TO CRAFT';
      if (count < 5) {
        craftBtn.style.opacity = '0.5';
      }
      craftBtn.addEventListener('click', () => {
        if (window.inventory && window.inventory.craftGarland()) {
          this.renderBagItems();
          this.selectBagItem('flowers');
        }
      });
      this.bagActionsContainer.appendChild(craftBtn);
    }

    // Update active highlight in list
    const rows = this.bagItemList.querySelectorAll('.poke-bag-item-row');
    rows.forEach(r => r.classList.remove('active'));
    this.renderBagItems();
  }

  openSevakaCard() {
    if (!window.player) return;

    document.getElementById('card-hero-name').textContent = window.player.role;
    document.getElementById('card-hp').textContent = `${window.player.hp}/${window.player.maxHp}`;
    document.getElementById('card-atk').textContent = window.player.attackStat;
    document.getElementById('card-def').textContent = window.player.defenseStat;
    document.getElementById('card-agi').textContent = window.player.agilityStat;
    document.getElementById('card-setu').textContent = window.mapManager ? window.mapManager.stonesDelivered : 0;

    this.sevakaCardModal.classList.remove('hidden');
  }

  // ===================================================================
  // SAVE & LOAD SYSTEM
  // ===================================================================

  saveGame() {
    try {
      const saveData = {
        archetype: window.player.typeId,
        x: window.player.x,
        y: window.player.y,
        mapId: window.mapManager.currentMapId,
        stonesDelivered: window.mapManager.stonesDelivered,
        isSetuCompleted: window.mapManager.isSetuCompleted,
        inventory: window.inventory.items
      };

      localStorage.setItem('ram_sena_save', JSON.stringify(saveData));
      this.showDialogue('Sacred Record', 'Your service and steps have been preserved in the sacred scrolls! (Game Saved 💾)');
    } catch (e) {
      this.showDialogue('Save Error', 'Unable to record progress to browser memory.');
    }
  }

  loadGame() {
    try {
      const raw = localStorage.getItem('ram_sena_save');
      if (!raw) {
        alert('No saved journey found in memory. Please start a New Game!');
        return;
      }

      const data = JSON.parse(raw);

      this.titleScreen.classList.add('hidden');
      this.isArchetypeLocked = true;

      if (window.player) {
        window.player.setCharacterType(data.archetype || 'vanar');
      }

      if (window.audioManager) {
        window.audioManager.startBGM();
      }

      if (window.mapManager) {
        window.mapManager.registerMaps();
        window.mapManager.stonesDelivered = data.stonesDelivered || 0;
        window.mapManager.isSetuCompleted = !!data.isSetuCompleted;
        window.mapManager.loadMap(data.mapId || 'camp1', data.x || 17, data.y || 14, false);
      }

      if (window.inventory && data.inventory) {
        window.inventory.items = data.inventory;
      }

      if (window.game) {
        window.game.state = window.GAME_STATES.OVERWORLD;
      }

      this.showDialogue('Resuming Journey', 'Your sacred journey in the vanguard has resumed. Welcome back!');
    } catch (e) {
      alert('Failed to load saved progress.');
    }
  }

  // Location notification banner
  showLocationBanner(title, subtitle) {
    if (!this.locationBanner) return;

    if (this.locNameEl) this.locNameEl.textContent = title;
    if (this.locSubEl) this.locSubEl.textContent = subtitle;

    this.locationBanner.classList.remove('hidden');

    if (this.locBannerTimer) clearTimeout(this.locBannerTimer);
    this.locBannerTimer = setTimeout(() => {
      this.locationBanner.classList.add('hidden');
    }, 2800);
  }

  showChantAura(text) {
    const banner = document.createElement('div');
    banner.className = 'chant-screen-banner';
    banner.innerHTML = `<span class="chant-glow">ॐ ${text} ॐ</span>`;
    document.getElementById('canvas-container').appendChild(banner);

    setTimeout(() => {
      banner.classList.add('fade-out');
      setTimeout(() => banner.remove(), 600);
    }, 1200);
  }

  addLog(msg, type = 'info') {
    // Activity log maintained in background for events
    console.log(`[RamSena Log] [${type}] ${msg}`);
  }

  updateCoordinates(x, y) {
    // Background tracking
  }

  setPhaseText(text) {
    // Background tracking
  }
}

window.uiManager = new UIManager();
