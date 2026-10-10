/**
 * RAM SENA - UI & Menu Engine (scripts/ui.js)
 * Implements:
 * - Clean screen (nothing showing during gameplay)
 * - Retro Devotional Start Menu (Keyboard navigable: BAG, HERO, SAVE, OPTION, EXIT)
 * - Retro Devotional Dialogue Box (with blinking cursor ▼)
 * - Fullscreen Title Screen (Matching Contract Demon reference)
 * - Fullscreen toggle button
 */

class UIManager {
  constructor() {
    // 1. Dialogue Elements
    this.textboxWrapper = document.getElementById('retro-textbox-wrapper');
    this.speakerTag = document.getElementById('retro-speaker-name');
    this.speakerImg = document.getElementById('retro-speaker-img');
    this.dialogueText = document.getElementById('retro-dialogue-text');
    this.cursorIndicator = document.getElementById('retro-cursor');
    this.choicesContainer = document.getElementById('retro-choices');
    this.btnDialogueClose = document.getElementById('btn-dialogue-close');

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
    this.btnBackToTitle = document.getElementById('btn-back-to-title');

    // 3. Modals
    this.aboutModal = document.getElementById('about-modal');
    this.btnCloseAbout = document.getElementById('btn-close-about');
    this.optionsModal = document.getElementById('options-modal');
    this.btnCloseOptions = document.getElementById('btn-close-options');
    this.optBgmToggle = document.getElementById('opt-bgm-toggle');
    this.optBhajanSelect = document.getElementById('opt-bhajan-select');
    this.optTextSpeed = document.getElementById('opt-text-speed');
    this.optVolumeSlider = document.getElementById('opt-volume-slider');
    this.btnVolDown = document.getElementById('btn-vol-down');
    this.btnVolUp = document.getElementById('btn-vol-up');
    this.optVolumeVal = document.getElementById('opt-volume-val');

    // 4. Retro Devotional Start Menu
    this.startMenu = document.getElementById('retro-start-menu');
    this.menuRows = document.querySelectorAll('.gba-menu-row');
    this.menuPlayerNameEl = document.getElementById('gba-player-name');
    this.menuIndex = 0; // 0: BAG, 1: HERO, 2: SAVE, 3: OPTION, 4: EXIT

    // 5. Bag & Sevaka Card
    this.bagModal = document.getElementById('retro-bag-modal');
    this.bagItemList = document.getElementById('bag-item-list');
    this.bagDetailIcon = document.getElementById('bag-detail-icon');
    this.bagDetailName = document.getElementById('bag-detail-name');
    this.bagDetailDesc = document.getElementById('bag-detail-desc');
    this.bagActionsContainer = document.getElementById('bag-actions-container');
    this.btnCloseBag = document.getElementById('btn-close-bag');
    this.btnQuickCraftGarland = document.getElementById('btn-quick-craft-garland');
    this.craftFlowerCount = document.getElementById('craft-flower-count');

    this.sevakaCardModal = document.getElementById('sevaka-card-modal');
    this.btnCloseSevakaCard = document.getElementById('btn-close-sevaka-card');

    // 6. Big Character Portrait & Dialogue Elements
    this.optBigPortrait = document.getElementById('opt-big-portrait');
    this.bigPortraitContainer = document.getElementById('retro-big-portrait-container');
    this.bigPortraitImg = document.getElementById('retro-big-portrait-img');
    this.bagGarlandCraftCard = document.getElementById('bag-garland-craft-card');

    this.showBigPortrait = localStorage.getItem('ram_sena_big_portrait') !== 'false';

    // 7. Interactive Modern RPG HUD Buttons
    this.hudBtnBag = document.getElementById('hud-btn-bag');
    this.hudBtnMenu = document.getElementById('hud-btn-menu');
    this.hudBtnOptions = document.getElementById('hud-btn-options');
    this.hudBtnHail = document.getElementById('hud-btn-hail');
    this.hudBtnFullscreen = document.getElementById('hud-btn-fullscreen');
    this.btnFullscreen = document.getElementById('btn-fullscreen-toggle');

    // State
    this.selectedArchetype = 'vanar';
    this.isArchetypeLocked = false;
    this.selectedBagItemKey = 'stones';
    this.typewriterTimer = null;
    this.isTyping = false;
    this.currentFullText = '';
    this.textSpeed = 12;

    this.initListeners();
    this.updateOptionsDisplay();
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
        this.updateOptionsDisplay();
        this.optionsModal.classList.remove('hidden');
        if (window.audioManager && !window.audioManager.isPlayingBGM && !window.audioManager.isMuted) {
          window.audioManager.startBGM();
        }
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

    const btnCloseAboutX = document.getElementById('btn-close-about-x');
    if (btnCloseAboutX) {
      btnCloseAboutX.addEventListener('click', () => {
        this.aboutModal.classList.add('hidden');
      });
    }

    if (this.btnCloseOptions) {
      this.btnCloseOptions.addEventListener('click', () => {
        this.optionsModal.classList.add('hidden');
      });
    }

    const btnCloseOptionsX = document.getElementById('btn-close-options-x');
    if (btnCloseOptionsX) {
      btnCloseOptionsX.addEventListener('click', () => {
        this.optionsModal.classList.add('hidden');
      });
    }

    // Dismiss modals when tapping backdrop outside the modal card
    if (this.optionsModal) {
      this.optionsModal.addEventListener('click', (e) => {
        if (e.target === this.optionsModal) this.optionsModal.classList.add('hidden');
      });
    }
    if (this.aboutModal) {
      this.aboutModal.addEventListener('click', (e) => {
        if (e.target === this.aboutModal) this.aboutModal.classList.add('hidden');
      });
    }
    if (this.sevakaCardModal) {
      this.sevakaCardModal.addEventListener('click', (e) => {
        if (e.target === this.sevakaCardModal) this.closeSevakaCard();
      });
    }

    // Modern HUD Buttons
    if (this.hudBtnBag) {
      this.hudBtnBag.addEventListener('click', () => this.toggleBag());
    }
    if (this.hudBtnMenu) {
      this.hudBtnMenu.addEventListener('click', () => this.toggleStartMenu());
    }
    if (this.hudBtnOptions) {
      this.hudBtnOptions.addEventListener('click', () => this.toggleOptions());
    }
    if (this.hudBtnHail) {
      this.hudBtnHail.addEventListener('click', () => {
        if (window.audioManager) window.audioManager.hailShriRam();
      });
    }
    if (this.hudBtnFullscreen) {
      this.hudBtnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    // Fullscreen button
    if (this.btnFullscreen) {
      this.btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    // Volume Controls
    if (this.optVolumeSlider) {
      this.optVolumeSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (window.audioManager) {
          window.audioManager.setVolume(val / 100);
          this.updateOptionsDisplay();
        }
      });
    }

    if (this.btnVolDown) {
      this.btnVolDown.addEventListener('click', () => {
        if (window.audioManager) {
          window.audioManager.volumeDown();
          this.updateOptionsDisplay();
        }
      });
    }

    if (this.btnVolUp) {
      this.btnVolUp.addEventListener('click', () => {
        if (window.audioManager) {
          window.audioManager.volumeUp();
          this.updateOptionsDisplay();
        }
      });
    }

    // Options Toggles
    if (this.optBgmToggle) {
      this.optBgmToggle.addEventListener('click', () => {
        if (window.audioManager) {
          window.audioManager.toggleMute();
          this.updateOptionsDisplay();
        }
      });
    }

    if (this.optBhajanSelect) {
      this.optBhajanSelect.addEventListener('click', () => {
        if (window.audioManager) {
          window.audioManager.nextTrack();
          this.updateOptionsDisplay();
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

    // Quick Garland Crafting Button
    if (this.btnQuickCraftGarland) {
      this.btnQuickCraftGarland.addEventListener('click', () => {
        if (window.inventory && window.inventory.craftGarland()) {
          this.renderBagItems();
          this.selectBagItem('garlands');
          this.updateBagCraftingStatus();
        }
      });
    }

    // Big Character Portrait Toggle
    if (this.optBigPortrait) {
      this.optBigPortrait.addEventListener('click', () => {
        this.showBigPortrait = !this.showBigPortrait;
        localStorage.setItem('ram_sena_big_portrait', this.showBigPortrait ? 'true' : 'false');
        this.updateOptionsDisplay();
      });
    }

    // Character Selection
    if (this.optVanar) {
      this.optVanar.addEventListener('click', () => {
        this.selectArchetype('vanar');
      });
    }

    if (this.optRiksha) {
      this.optRiksha.addEventListener('click', () => {
        this.selectArchetype('riksha');
      });
    }

    if (this.btnConfirmArchetype) {
      this.btnConfirmArchetype.addEventListener('click', () => {
        this.confirmCharacterAndStart();
      });
    }

    if (this.btnBackToTitle) {
      this.btnBackToTitle.addEventListener('click', () => {
        this.closeCharacterSelect();
      });
    }

    // GBA Start Menu Row clicks
    if (this.menuRows) {
      this.menuRows.forEach(row => {
        row.addEventListener('click', () => {
          const idx = parseInt(row.dataset.index, 10);
          this.menuIndex = idx;
          this.updateMenuCursor();
          this.triggerSelectedMenuAction();
        });
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

    // Dialogue box click to advance
    if (this.textboxWrapper) {
      this.textboxWrapper.addEventListener('click', (e) => {
        if (!e.target.closest('.retro-choice-btn') && !e.target.closest('.retro-dialogue-close-btn')) {
          this.advanceDialogue();
        }
      });
    }

    if (this.btnDialogueClose) {
      this.btnDialogueClose.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.hideDialogue();
      });
    }
  }

  selectArchetype(type) {
    this.selectedArchetype = type;
    const isVanar = type === 'vanar';

    if (this.optVanar) {
      this.optVanar.classList.toggle('selected', isVanar);
      const radio = this.optVanar.querySelector('.char-radio-indicator');
      if (radio) radio.textContent = isVanar ? '✓ SELECTED' : '○ SELECT';
    }

    if (this.optRiksha) {
      this.optRiksha.classList.toggle('selected', !isVanar);
      const radio = this.optRiksha.querySelector('.char-radio-indicator');
      if (radio) radio.textContent = !isVanar ? '✓ SELECTED' : '○ SELECT';
    }

    if (this.btnConfirmArchetype) {
      const heroText = isVanar ? '⚔️ BEGIN AS VANAR' : '⚔️ BEGIN AS RIKSHA';
      const textSpan = this.btnConfirmArchetype.querySelector('.btn-hero-text');
      if (textSpan) {
        textSpan.textContent = heroText;
      } else {
        this.btnConfirmArchetype.innerHTML = `<span class="btn-hero-text">${heroText}</span> <span class="kbd-hint">(Enter / Z)</span>`;
      }
    }
  }

  updateOptionsDisplay() {
    if (this.optBgmToggle && window.audioManager) {
      const isMuted = window.audioManager.isMuted;
      this.optBgmToggle.textContent = isMuted ? 'OFF' : 'ON';
      this.optBgmToggle.classList.toggle('opt-state-off', isMuted);
      this.optBgmToggle.classList.toggle('opt-state-on', !isMuted);
    }
    if (this.optBhajanSelect && window.audioManager) {
      const track = window.audioManager.getCurrentTrack();
      this.optBhajanSelect.textContent = track ? track.name : 'Bhajan 1';
    }
    if (window.audioManager) {
      const pct = window.audioManager.getVolumePercent();
      if (this.optVolumeSlider) this.optVolumeSlider.value = pct;
      if (this.optVolumeVal) this.optVolumeVal.textContent = `${pct}%`;
    }
    if (this.optTextSpeed) {
      if (this.textSpeed === 24) this.optTextSpeed.textContent = 'MEDIUM';
      else if (this.textSpeed === 6) this.optTextSpeed.textContent = 'INSTANT';
      else this.optTextSpeed.textContent = 'FAST';
    }
    if (this.optBigPortrait) {
      this.optBigPortrait.textContent = this.showBigPortrait ? 'ON' : 'OFF';
      this.optBigPortrait.classList.toggle('opt-state-off', !this.showBigPortrait);
      this.optBigPortrait.classList.toggle('opt-state-on', this.showBigPortrait);
    }
  }

  toggleBag() {
    if (this.isBagOpen()) {
      this.closeBag();
    } else {
      this.openBag();
    }
  }

  toggleOptions() {
    if (this.optionsModal && !this.optionsModal.classList.contains('hidden')) {
      this.optionsModal.classList.add('hidden');
    } else {
      this.updateOptionsDisplay();
      this.optionsModal.classList.remove('hidden');
    }
  }

  updateHUD() {
    const heroNameEl = document.getElementById('hud-hero-name');
    const avatarImgEl = document.getElementById('hud-avatar-img');
    const mapNameEl = document.getElementById('hud-map-name');
    const hpBarEl = document.getElementById('hud-hp-bar');
    const hpTextEl = document.getElementById('hud-hp-text');

    if (window.player) {
      if (heroNameEl) heroNameEl.textContent = window.player.typeId === 'riksha' ? 'RIKSHA SEVAKA' : 'VANAR SEVAKA';
      if (avatarImgEl) avatarImgEl.src = window.player.typeId === 'riksha' ? 'assets/images/bear_front.png' : 'assets/images/vanar_front.png';
      if (hpBarEl) {
        const pct = Math.max(0, Math.min(100, (window.player.hp / window.player.maxHp) * 100));
        hpBarEl.style.width = `${pct}%`;
      }
      if (hpTextEl) {
        hpTextEl.textContent = `${window.player.hp}/${window.player.maxHp} HP`;
      }
    }

    if (window.mapManager && window.mapManager.currentMap && mapNameEl) {
      mapNameEl.textContent = window.mapManager.currentMap.name || 'Southern Shore Camp';
    }
  }

  openCharacterSelect() {
    if (this.titleScreen) this.titleScreen.classList.add('hidden');
    if (this.charSelectScreen) this.charSelectScreen.classList.remove('hidden');
    if (window.audioManager && !window.audioManager.isPlayingBGM && !window.audioManager.isMuted) {
      window.audioManager.startBGM();
    }
  }

  closeCharacterSelect() {
    if (this.charSelectScreen) this.charSelectScreen.classList.add('hidden');
    if (this.titleScreen) this.titleScreen.classList.remove('hidden');
  }

  confirmCharacterAndStart() {
    this.charSelectScreen.classList.add('hidden');
    this.titleScreen.classList.add('hidden');

    this.isArchetypeLocked = true;

    if (window.player) {
      window.player.setCharacterType(this.selectedArchetype, true);
      window.player.isLocked = true;
    }

    if (this.menuPlayerNameEl) {
      this.menuPlayerNameEl.textContent = this.selectedArchetype === 'vanar' ? 'VANAR' : 'RIKSHA';
    }

    if (window.audioManager) {
      window.audioManager.startBGM();
    }

    if (window.mapManager) {
      window.mapManager.stonesDelivered = 0;
      window.mapManager.isSetuCompleted = false;
      window.mapManager.phase = 1;
      window.mapManager.registerMaps();
    }

    if (window.inventory) {
      window.inventory.items = {
        berries: 0,
        coconuts: 0,
        flowers: 0,
        fruits: 0,
        garlands: 0,
        stones: 0,
        wood: 0
      };
    }

    if (window.game) {
      window.game.state = window.GAME_STATES.OVERWORLD;
    }

    const archName = this.selectedArchetype === 'vanar' ? 'Vanar 🐒' : 'Riksha 🐻';
    const welcome = 
      `You enter the southern shore camp as a ${archName} in the army of Shri Ram! ` +
      `Explore freely. Press ENTER at any time to open your Bag & Menu. जय श्री राम!`;

    this.showDialogue('Southern Camp', welcome);
  }

  // ===================================================================
  // RETRO DEVOTIONAL START MENU
  // ===================================================================

  isMenuOpen() {
    return this.startMenu && !this.startMenu.classList.contains('hidden');
  }

  isBagOpen() {
    return this.bagModal && !this.bagModal.classList.contains('hidden');
  }

  isSevakaCardOpen() {
    return this.sevakaCardModal && !this.sevakaCardModal.classList.contains('hidden');
  }

  isDialogueOpen() {
    return this.textboxWrapper && !this.textboxWrapper.classList.contains('hidden');
  }

  isModalOpen() {
    const aboutOpen = this.aboutModal && !this.aboutModal.classList.contains('hidden');
    const optOpen = this.optionsModal && !this.optionsModal.classList.contains('hidden');
    return !!(aboutOpen || optOpen);
  }

  closeModals() {
    if (this.aboutModal) this.aboutModal.classList.add('hidden');
    if (this.optionsModal) this.optionsModal.classList.add('hidden');
  }

  isCharSelectOpen() {
    return this.charSelectScreen && !this.charSelectScreen.classList.contains('hidden');
  }

  isTitleScreenOpen() {
    return this.titleScreen && !this.titleScreen.classList.contains('hidden');
  }

  toggleStartMenu() {
    if (this.isMenuOpen()) {
      this.closeStartMenu();
    } else {
      this.openStartMenu();
    }
  }

  openStartMenu() {
    if (this.isBagOpen() || this.isSevakaCardOpen()) return;

    this.menuIndex = 0;
    if (this.menuPlayerNameEl && window.player) {
      this.menuPlayerNameEl.textContent = window.player.typeId === 'riksha' ? 'RIKSHA' : 'VANAR';
    }
    this.updateMenuCursor();
    this.startMenu.classList.remove('hidden');
  }

  closeStartMenu() {
    this.startMenu.classList.add('hidden');
  }

  navigateMenu(dir) {
    if (!this.isMenuOpen()) return;
    const total = this.menuRows.length || 5;
    this.menuIndex = (this.menuIndex + dir + total) % total;
    this.updateMenuCursor();
  }

  updateMenuCursor() {
    this.menuRows.forEach((row, idx) => {
      const cursor = row.querySelector('.gba-cursor');
      if (idx === this.menuIndex) {
        row.classList.add('selected');
        if (cursor) cursor.innerHTML = '▶';
      } else {
        row.classList.remove('selected');
        if (cursor) cursor.innerHTML = '&nbsp;';
      }
    });
  }

  triggerSelectedMenuAction() {
    const activeRow = this.menuRows[this.menuIndex];
    if (!activeRow) return;

    const action = activeRow.dataset.action;
    this.closeStartMenu();

    if (action === 'bag') {
      this.openBag();
    } else if (action === 'sevaka') {
      this.openSevakaCard();
    } else if (action === 'save') {
      this.saveGame();
    } else if (action === 'option') {
      this.updateOptionsDisplay();
      this.optionsModal.classList.remove('hidden');
    } else if (action === 'rest') {
      if (window.mapManager && window.mapManager.phase === 2) {
        if (window.game && window.game.finishDay) {
          window.game.finishDay();
        }
      } else {
        this.showDialogue(
          'Camp Rest (विश्राम)',
          'You sit by the holy altar and offer prayers to Shri Ram: "जय श्री राम!" (Resting to finish the day and respawn monsters is active during Phase 2 on the Battlefield & Lanka Camp).',
          '🙏'
        );
      }
    } else if (action === 'exit') {
      this.closeStartMenu();
    }
  }

  // ===================================================================
  // DEVOTIONAL SEVA SACK (INVENTORY MODAL)
  // ===================================================================

  openBag() {
    this.renderBagItems();
    this.selectBagItem(this.selectedBagItemKey);
    this.updateBagCraftingStatus();
    this.bagModal.classList.remove('hidden');
  }

  closeBag() {
    this.bagModal.classList.add('hidden');
  }

  updateBagCraftingStatus() {
    const inv = window.inventory ? window.inventory.items : {};
    const flowerCount = inv.flowers || 0;

    if (this.craftFlowerCount) {
      this.craftFlowerCount.textContent = `Flowers: ${flowerCount} / 5`;
    }

    if (this.btnQuickCraftGarland) {
      if (flowerCount >= 5) {
        this.btnQuickCraftGarland.textContent = '🌸 WEAVE SACRED GARLAND (READY!)';
        this.btnQuickCraftGarland.style.opacity = '1';
        this.btnQuickCraftGarland.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        this.btnQuickCraftGarland.style.borderColor = '#34d399';
        this.btnQuickCraftGarland.style.cursor = 'pointer';
      } else {
        const needed = 5 - flowerCount;
        this.btnQuickCraftGarland.textContent = `🌸 NEED ${needed} MORE FLOWER${needed > 1 ? 'S' : ''}`;
        this.btnQuickCraftGarland.style.opacity = '0.75';
        this.btnQuickCraftGarland.style.background = 'linear-gradient(135deg, #78350f 0%, #451a03 100%)';
        this.btnQuickCraftGarland.style.borderColor = '#d97706';
        this.btnQuickCraftGarland.style.cursor = 'pointer';
      }
    }
  }

  renderBagItems() {
    const inv = window.inventory ? window.inventory.items : {};
    const itemsData = [
      { key: 'stones', name: 'Sacred Stones', icon: '🪨', qty: inv.stones || 0 },
      { key: 'fruits', name: 'Wild Fruits', icon: '🍎', qty: inv.fruits || 0 },
      { key: 'flowers', name: 'Forest Flowers', icon: '🌸', qty: inv.flowers || 0 },
      { key: 'coconuts', name: 'Fresh Coconuts', icon: '🥥', qty: inv.coconuts || 0 },
      { key: 'garlands', name: 'Devotional Garlands', icon: '📿', qty: inv.garlands || 0 },
      { key: 'wood', name: 'Dry Wood', icon: '🪵', qty: inv.wood || 0 }
    ];

    this.bagItemList.innerHTML = '';
    itemsData.forEach(item => {
      const row = document.createElement('div');
      row.className = `retro-bag-item-row ${this.selectedBagItemKey === item.key ? 'active' : ''}`;
      row.innerHTML = `
        <span class="bag-item-label">${item.icon} ${item.name}</span>
        <span class="item-qty">×${String(item.qty).padStart(2, '0')}</span>
      `;
      row.addEventListener('click', () => {
        this.selectBagItem(item.key);
      });
      this.bagItemList.appendChild(row);
    });
  }

  selectBagItem(key) {
    this.selectedBagItemKey = key;
    const inv = window.inventory ? window.inventory.items : {};

    const itemDetails = {
      stones: { name: 'Sacred Stone', icon: '🪨', desc: 'Heavy mountain stone. Offered with devotion to Nal & Neel, who sanctify each stone through the sacred remembrance of Ram Naam so the Setu floats without sinking.' },
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

    // Show garland craft card ONLY when key is 'garlands'!
    if (this.bagGarlandCraftCard) {
      this.bagGarlandCraftCard.style.display = (key === 'garlands') ? 'flex' : 'none';
    }

    // Render Actions
    this.bagActionsContainer.innerHTML = '';

    this.updateBagCraftingStatus();

    const rows = this.bagItemList.querySelectorAll('.retro-bag-item-row');
    rows.forEach(r => {
      if (r.textContent.includes(detail.name)) {
        r.classList.add('active');
      } else {
        r.classList.remove('active');
      }
    });
  }

  openSevakaCard() {
    if (!window.player) return;

    const isBear = window.player.typeId === 'riksha';
    const avatarEl = document.getElementById('card-hero-avatar');
    if (avatarEl) avatarEl.src = isBear ? 'assets/images/bear_front.png' : 'assets/images/vanar_front.png';

    const hindiEl = document.getElementById('card-hero-hindi');
    if (hindiEl) hindiEl.textContent = isBear ? 'ऋक्ष सेवक • Heavy Warrior' : 'वानर सेवक • Swift Scout';

    const nameEl = document.getElementById('card-hero-name');
    if (nameEl) nameEl.textContent = isBear ? 'RIKSHA SEVAKA 🐻' : 'VANAR SEVAKA 🐒';

    const hpEl = document.getElementById('card-hp');
    if (hpEl) hpEl.textContent = `${window.player.hp}/${window.player.maxHp}`;
    
    const atkEl = document.getElementById('card-atk');
    if (atkEl) atkEl.textContent = window.player.attackStat;
    
    const defEl = document.getElementById('card-def');
    if (defEl) defEl.textContent = window.player.defenseStat;
    
    const agiEl = document.getElementById('card-agi');
    if (agiEl) agiEl.textContent = window.player.agilityStat;
    
    const delivered = window.mapManager ? (window.mapManager.stonesDelivered || 0) : 0;
    const target = window.mapManager ? (window.mapManager.targetStones || 10) : 10;
    const setuEl = document.getElementById('card-setu');
    if (setuEl) setuEl.textContent = delivered;
    
    const barEl = document.getElementById('card-setu-bar');
    if (barEl) {
      const pct = Math.min(100, Math.round((delivered / target) * 100));
      barEl.style.width = `${pct}%`;
    }

    this.sevakaCardModal.classList.remove('hidden');
  }

  closeSevakaCard() {
    this.sevakaCardModal.classList.add('hidden');
  }

  // ===================================================================
  // RETRO DEVOTIONAL DIALOGUE SYSTEM
  // ===================================================================

  getSpeakerImage(speaker) {
    if (!speaker) return null;
    const s = speaker.toLowerCase();

    // Devotional / prayer / hail dialogue comes from the player devotee
    if (s.includes('hail') || s.includes('devotional') || s.includes('prayer')) {
      return (window.player && window.player.typeId === 'riksha') ? 'assets/images/bear_front.png' : 'assets/images/vanar_front.png';
    }

    if (s.includes('rakshsa') || s.includes('demon') || s.includes('monster') || s.includes('sentry') || s.includes('commander') || s.includes('night-stalker') || s.includes('club-bearer')) {
      return 'assets/images/rakshsa.png';
    }
    if (s.includes('sushen')) return 'assets/images/sushena.png';
    if (/\bram\b/i.test(s) && !s.includes('sugreev') && !s.includes('balram')) return 'assets/images/ram.png';
    if (s.includes('laxman') || s.includes('lakshman') || s.includes('saumitri')) return 'assets/images/laxman.png';
    if (s.includes('hanuman') || s.includes('maruti') || s.includes('anjaneya') || s.includes('pavanputra')) return 'assets/images/hanuman.png';
    if (s.includes('sugreev') || s.includes('sugriva')) return 'assets/images/sugreev.png';
    if (s.includes('jambavan') || s.includes('jambvant') || s.includes('riksharaj')) return 'assets/images/jambavan.png';
    if (s.includes('vibhisan') || s.includes('vibhisana') || s.includes('vibhishan')) return 'assets/images/vibhisan.png';
    if (/\bneel\b/i.test(s) && !/\bnal\b/i.test(s)) return 'assets/images/neel.png';
    if (/\bnal\b/i.test(s)) return 'assets/images/nal.png';
    if (/\bneel\b/i.test(s)) return 'assets/images/neel.png';
    if (s.includes('bhaluu') || s.includes('bear warrior') || s.includes('bear soldier') || s.includes('stalwart bear') || s.includes('riksha warrior')) {
      return 'assets/images/bhaluu.png';
    }
    if (s.includes('vanarsena') || s.includes('vanar warrior') || s.includes('vanar scout') || s.includes('forager') || s.includes('guard') || s.includes('sainik') || s.includes('senik')) {
      return 'assets/images/vanarsena.png';
    }
    if (s.includes('bear') || s.includes('riksha')) return 'assets/images/bear_front.png';
    if (s.includes('vanar')) return 'assets/images/vanar_front.png';
    if (s.includes('humble') || s.includes('sevaka') || s.includes('devotee')) {
      return (window.player && window.player.typeId === 'riksha') ? 'assets/images/bear_front.png' : 'assets/images/vanar_front.png';
    }
    return (window.player && window.player.typeId === 'riksha') ? 'assets/images/bear_front.png' : 'assets/images/vanar_front.png';
  }

  showDialogue(speaker, text, icon = '', choices = [], onComplete = null) {
    this.textboxWrapper.classList.remove('hidden');

    if (this.speakerTag) {
      this.speakerTag.textContent = speaker ? `${icon ? icon + ' ' : ''}${speaker}` : '';
      this.speakerTag.style.display = speaker ? 'inline-flex' : 'none';
    }

    if (this.speakerImg) {
      const imgSrc = this.getSpeakerImage(speaker);
      if (imgSrc) {
        this.speakerImg.src = imgSrc;
        this.speakerImg.style.display = 'block';
      } else {
        this.speakerImg.style.display = 'none';
      }
    }

    // Big Character Portrait (Toggled via Options)
    if (this.bigPortraitContainer && this.bigPortraitImg) {
      if (this.showBigPortrait) {
        const imgSrc = this.getSpeakerImage(speaker);
        if (imgSrc) {
          this.bigPortraitImg.src = imgSrc;
          this.bigPortraitContainer.classList.remove('hidden');
        } else {
          this.bigPortraitContainer.classList.add('hidden');
        }
      } else {
        this.bigPortraitContainer.classList.add('hidden');
      }
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
    this.currentChoices = choices || [];
    this.currentOnComplete = onComplete || null;
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
        this.finishDialogue(this.currentChoices, this.currentOnComplete);
      }
    }, this.textSpeed);
  }

  skipTypewriter() {
    if (this.isTyping && this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
      this.dialogueText.textContent = this.currentFullText;
      this.isTyping = false;
      this.finishDialogue(this.currentChoices, this.currentOnComplete);
    }
  }

  finishDialogue(choices = [], onComplete = null) {
    if (this.cursorIndicator) {
      this.cursorIndicator.classList.add('active');
    }

    if (choices && choices.length > 0 && this.choicesContainer) {
      choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'retro-choice-btn';
        if (choice.label.includes('Cancel') || choice.label.includes('Leave') || choice.label.includes('Retreat') || choice.label.includes('वापस')) {
          btn.classList.add('choice-cancel');
        }
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
      if (!this.choicesContainer || this.choicesContainer.children.length === 0) {
        this.hideDialogue();
      }
    }
  }

  hideDialogue() {
    if (this.textboxWrapper) {
      this.textboxWrapper.classList.add('hidden');
    }
    if (this.bigPortraitContainer) {
      this.bigPortraitContainer.classList.add('hidden');
    }
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    this.isTyping = false;

    // Cleanly cancel combat state and restore overworld navigation if dialogue is dismissed
    if (window.combatSystem && window.combatSystem.inCombat) {
      window.combatSystem.inCombat = false;
      window.combatSystem.currentEnemy = null;
      window.combatSystem.activeEncounterId = null;
      window.combatSystem.disengageCooldownUntil = Date.now() + 800;
    }
    if (window.game && window.game.state === window.GAME_STATES.COMBAT) {
      window.game.state = window.GAME_STATES.OVERWORLD;
    }
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
      this.showDialogue('Save Completed', 'Saved the game! Your service is recorded in the sacred scrolls.');
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
        window.player.setCharacterType(data.archetype || 'vanar', true);
        window.player.isLocked = true;
      }

      if (this.menuPlayerNameEl) {
        this.menuPlayerNameEl.textContent = data.archetype === 'riksha' ? 'RIKSHA' : 'VANAR';
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

  showLocationBanner(title, subtitle) {
    // Screen kept clean
  }

  showChantAura(text) {
    // Screen kept clean; audio plays chant
  }

  addLog(msg, type = 'info') {}
  updateCoordinates(x, y) {}
  setPhaseText(text) {}
  updateRoleHUD(name, symbol) {}
}

window.uiManager = new UIManager();
