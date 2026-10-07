/**
 * RAM SENA - UI & Menu Engine (scripts/ui.js)
 * Implements:
 * - Clean screen (nothing showing during gameplay)
 * - Authentic GBA Pokemon Start Menu (Keyboard navigable: BAG, HERO, SAVE, OPTION, EXIT)
 * - Authentic Pokemon Emerald Dialogue Box (with blinking red cursor ▼)
 * - Fullscreen Title Screen (Matching Contract Demon reference)
 * - Fullscreen toggle button
 */

class UIManager {
  constructor() {
    // 1. Dialogue Elements
    this.textboxWrapper = document.getElementById('pokemon-textbox-wrapper');
    this.speakerTag = document.getElementById('poke-speaker-name');
    this.speakerImg = document.getElementById('poke-speaker-img');
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

    // 4. GBA Pokemon Start Menu
    this.startMenu = document.getElementById('pokemon-start-menu');
    this.menuRows = document.querySelectorAll('.gba-menu-row');
    this.menuPlayerNameEl = document.getElementById('gba-player-name');
    this.menuIndex = 0; // 0: BAG, 1: HERO, 2: SAVE, 3: OPTION, 4: EXIT

    // 5. Bag & Sevaka Card
    this.bagModal = document.getElementById('pokemon-bag-modal');
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

    // 6. Interactive Modern RPG HUD Buttons
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

    if (this.btnCloseOptions) {
      this.btnCloseOptions.addEventListener('click', () => {
        this.optionsModal.classList.add('hidden');
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
          const isMuted = window.audioManager.toggleMute();
          this.optBgmToggle.textContent = isMuted ? 'OFF' : 'ON';
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
          this.updateBagCraftingStatus();
        }
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
        if (!e.target.closest('.poke-choice-btn')) {
          this.advanceDialogue();
        }
      });
    }
  }

  selectArchetype(type) {
    this.selectedArchetype = type;
    if (type === 'vanar') {
      if (this.optVanar) this.optVanar.classList.add('selected');
      if (this.optRiksha) this.optRiksha.classList.remove('selected');
    } else {
      if (this.optRiksha) this.optRiksha.classList.add('selected');
      if (this.optVanar) this.optVanar.classList.remove('selected');
    }
  }

  updateOptionsDisplay() {
    if (this.optBgmToggle && window.audioManager) {
      this.optBgmToggle.textContent = window.audioManager.isMuted ? 'OFF' : 'ON';
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
      if (avatarImgEl) avatarImgEl.src = window.player.typeId === 'riksha' ? 'assets/images/bear.png' : 'assets/images/vanar.png';
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
      window.mapManager.registerMaps();
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
  // GBA POKEMON START MENU (Image 2 Reference)
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
    } else if (action === 'exit') {
      this.closeStartMenu();
    }
  }

  // ===================================================================
  // POKEMON BAG (INVENTORY MODAL)
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
      row.className = `poke-bag-item-row ${this.selectedBagItemKey === item.key ? 'active' : ''}`;
      row.innerHTML = `
        <span>${item.icon} ${item.name}</span>
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

    // Render Actions
    this.bagActionsContainer.innerHTML = '';

    if (key === 'flowers') {
      const count = inv.flowers || 0;
      const craftBtn = document.createElement('button');
      craftBtn.className = 'btn-poke-action';
      craftBtn.textContent = count >= 5 ? '🌸 CRAFT GARLAND (WEAVE 5)' : '🌸 NEED 5 TO CRAFT';
      if (count < 5) craftBtn.style.opacity = '0.5';
      craftBtn.addEventListener('click', () => {
        if (window.inventory && window.inventory.craftGarland()) {
          this.renderBagItems();
          this.selectBagItem('flowers');
          this.updateBagCraftingStatus();
        }
      });
      this.bagActionsContainer.appendChild(craftBtn);
    }

    this.updateBagCraftingStatus();

    const rows = this.bagItemList.querySelectorAll('.poke-bag-item-row');
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

    document.getElementById('card-hero-name').textContent = window.player.role;
    document.getElementById('card-hp').textContent = `${window.player.hp}/${window.player.maxHp}`;
    document.getElementById('card-atk').textContent = window.player.attackStat;
    document.getElementById('card-def').textContent = window.player.defenseStat;
    document.getElementById('card-agi').textContent = window.player.agilityStat;
    document.getElementById('card-setu').textContent = window.mapManager ? window.mapManager.stonesDelivered : 0;

    this.sevakaCardModal.classList.remove('hidden');
  }

  closeSevakaCard() {
    this.sevakaCardModal.classList.add('hidden');
  }

  // ===================================================================
  // POKEMON EMERALD DIALOGUE SYSTEM
  // ===================================================================

  getSpeakerImage(speaker) {
    if (!speaker) return null;
    const s = speaker.toLowerCase();
    if (s.includes('ram') && !s.includes('sugreev') && !s.includes('balram')) return 'assets/images/ram.png';
    if (s.includes('laxman') || s.includes('lakshman') || s.includes('saumitri')) return 'assets/images/laxman.png';
    if (s.includes('hanuman') || s.includes('maruti') || s.includes('anjaneya') || s.includes('pavanputra')) return 'assets/images/hanuman.png';
    if (s.includes('sugreev') || s.includes('sugriva')) return 'assets/images/sugreev.png';
    if (s.includes('jambavan') || s.includes('jambvant') || s.includes('riksharaj')) return 'assets/images/jambavan.png';
    if (s.includes('vibhisan') || s.includes('vibhisana') || s.includes('vibhishan')) return 'assets/images/vibhisan.png';
    if (s.includes('angad') || s.includes('angada') || s.includes('yuvaraj')) return 'assets/images/angad.png';
    if (s.includes('bear') || s.includes('riksha')) return 'assets/images/bear.png';
    if (s.includes('vanar') || s.includes('nal') || s.includes('neel') || s.includes('sushen')) return 'assets/images/vanar.png';
    if (s.includes('humble') || s.includes('sevaka') || s.includes('devotee')) {
      return (window.player && window.player.typeId === 'riksha') ? 'assets/images/bear.png' : 'assets/images/vanar.png';
    }
    return (window.player && window.player.typeId === 'riksha') ? 'assets/images/bear.png' : 'assets/images/vanar.png';
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
