/**
 * RAM SENA - UI & Dialogue Manager (ui.js)
 * Manages the dedicated bottom 30% black box for story, dialogue, and activity logs.
 */

class UIManager {
  constructor() {
    this.speakerNameEl = document.getElementById('speaker-name');
    this.speakerIconEl = document.getElementById('speaker-icon');
    this.dialogueTextEl = document.getElementById('dialogue-text');
    this.dialoguePromptEl = document.getElementById('dialogue-prompt');
    this.dialogueActionsEl = document.getElementById('dialogue-actions');
    this.logListEl = document.getElementById('log-list');
    this.logCountEl = document.getElementById('log-count');
    this.coordDisplayEl = document.getElementById('coord-display');
    this.phaseIndicatorEl = document.getElementById('phase-indicator');

    this.tabDialogueBtn = document.getElementById('tab-dialogue');
    this.tabLogBtn = document.getElementById('tab-log');
    this.dialogueView = document.getElementById('dialogue-view');
    this.logView = document.getElementById('log-view');

    this.logCount = 0;
    this.typewriterTimer = null;
    this.isTyping = false;
    this.currentFullText = '';

    this.initTabs();
  }

  initTabs() {
    if (this.tabDialogueBtn && this.tabLogBtn) {
      this.tabDialogueBtn.addEventListener('click', () => this.switchTab('dialogue'));
      this.tabLogBtn.addEventListener('click', () => this.switchTab('log'));
    }
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

  setPhaseText(text) {
    if (this.phaseIndicatorEl) {
      this.phaseIndicatorEl.textContent = text;
    }
  }

  /**
   * Display dialogue with animated typewriter effect or instant text
   */
  showDialogue(speaker, text, icon = '📜', choices = [], onComplete = null) {
    // Switch to dialogue tab automatically when dialogue is triggered
    this.switchTab('dialogue');

    if (this.speakerNameEl) this.speakerNameEl.textContent = speaker;
    if (this.speakerIconEl) this.speakerIconEl.textContent = icon;

    // Clear previous actions
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
    const typingSpeed = 16; // ms per character for snappy responsive feel

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

  /**
   * Add entry to activity / combat log
   */
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
