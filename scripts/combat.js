/**
 * RAM SENA - Turn-Based Combat Engine (scripts/combat.js)
 * Implements turn-based heroic devotional encounters on The Field (Map 7).
 * Archetype-specific attacks (Bear has higher attack/HP; Vanar has speed/agility).
 * 
 * SACRED IMMUTABLE RULE:
 * If the player's HP reaches 0, they do not die (NO GAME OVER).
 * Divine Intervention triggers:
 * "An arrow from Shri Ram strikes the enemy."
 * The enemy's HP drops to 0, and the player survives.
 */

class CombatSystem {
  constructor() {
    this.inCombat = false;
    this.currentEnemy = null;
    this.turn = 'player'; // 'player' | 'enemy'
    this.activeEncounterId = null;
    this.defeatedEncounters = new Set();
    this.disengageCooldownUntil = 0;
  }

  getPlayerMoves() {
    const isBear = window.player && window.player.typeId === 'riksha';
    const moves = isBear ? [
      { label: '🐾 Crushing Paw (वज्र प्रहार)', action: () => this.playerAttack('Crushing Paw', 28) },
      { label: '🦷 Heavy Bite (मल्ल दन्त)', action: () => this.playerAttack('Heavy Bite', 26) },
      { label: '🪨 Hurl Boulder (महाशिला प्रक्षेप)', action: () => this.playerAttack('Hurl Boulder', 34) },
      { label: '🪵 Uprooted Trunk (वृक्ष प्रहार)', action: () => this.playerAttack('Uprooted Trunk', 30) }
    ] : [
      { label: '🐾 Swift Scratch (नख प्रहार)', action: () => this.playerAttack('Swift Scratch', 22) },
      { label: '🦷 Quick Bite (दन्त प्रहार)', action: () => this.playerAttack('Quick Bite', 24) },
      { label: '🪨 Throw Rock (शिला प्रक्षेप)', action: () => this.playerAttack('Throw Rock', 28) },
      { label: '🪵 Throw Wood (दण्ड प्रहार)', action: () => this.playerAttack('Throw Wood', 23) }
    ];

    moves.push({
      label: '↩️ Retreat / Cancel (पीछे हटें)',
      action: () => this.retreatBattle()
    });

    return moves;
  }

  startBattle(encounterId = null, customEnemyName = null) {
    if (this.inCombat) return;
    if (this.disengageCooldownUntil && Date.now() < this.disengageCooldownUntil) {
      return;
    }

    this.activeEncounterId = encounterId;
    this.inCombat = true;
    this.turn = 'player';

    // Generate randomized enemy stats
    const enemyNames = [
      'Lanka Sentry Rakshasa',
      'Shadow Archer Rakshasa',
      'Heavy Club-Bearer Rakshasa',
      'Demonic Vanguard Commander',
      'Fierce Night-Stalker Rakshasa'
    ];
    const name = customEnemyName || enemyNames[Math.floor(Math.random() * enemyNames.length)];
    const hp = 85 + Math.floor(Math.random() * 30); // 85 to 115 HP
    const atk = 14 + Math.floor(Math.random() * 8);  // 14 to 22 Attack
    const def = 4 + Math.floor(Math.random() * 6);   // 4 to 10 Defense

    this.currentEnemy = {
      name,
      hp,
      maxHp: hp,
      attackPower: atk,
      defense: def
    };

    if (window.game) {
      window.game.state = window.GAME_STATES.COMBAT;
    }

    const moves = this.getPlayerMoves();

    if (window.uiManager) {
      const greeting = `A ferocious ${name} leaps from the shadows with weapons drawn! (HP: ${hp} • ATK: ${atk} • DEF: ${def})\nChoose your move:`;
      window.uiManager.showDialogue(name, greeting, '⚔️', moves);
      window.uiManager.addLog(`⚔️ Encountered ${name} on the battlefield!`, 'info');
    }
  }

  playerAttack(moveName, baseDamage) {
    if (!this.inCombat || !this.currentEnemy || this.turn !== 'player') return;

    // Clear buttons immediately so player cannot spam during animation
    if (window.uiManager && window.uiManager.choicesContainer) {
      window.uiManager.choicesContainer.innerHTML = '';
    }

    // Calculate damage taking enemy defense into account
    const statBonus = (window.player && window.player.attackStat) || 20;
    const netDamage = Math.max(10, Math.floor(baseDamage * (statBonus / 20) - this.currentEnemy.defense * 0.35));
    
    // Critical hit chance
    const isCrit = Math.random() < ((window.player && window.player.critChance) || 0.18);
    const finalDamage = isCrit ? Math.floor(netDamage * 1.5) : netDamage;

    this.currentEnemy.hp = Math.max(0, this.currentEnemy.hp - finalDamage);

    const critText = isCrit ? ' (CRITICAL STRIKE! 🔥)' : '';
    window.uiManager.addLog(
      `${window.player.role} executes ${moveName}! Dealt ${finalDamage} damage${critText}. Enemy HP: ${this.currentEnemy.hp}/${this.currentEnemy.maxHp}`,
      'info'
    );

    if (this.currentEnemy.hp <= 0) {
      this.winBattle();
      return;
    }

    // Show strike message then queue enemy counter
    this.turn = 'enemy';
    if (window.uiManager) {
      window.uiManager.showDialogue(
        window.player.role,
        `${window.player.role} strikes with ${moveName}! Dealt ${finalDamage} damage${critText}! (${this.currentEnemy.name} HP: ${this.currentEnemy.hp}/${this.currentEnemy.maxHp})`,
        '💥',
        []
      );
    }

    setTimeout(() => {
      this.enemyTurn();
    }, 700);
  }

  enemyTurn() {
    if (!this.inCombat || !this.currentEnemy) return;

    const baseEnemyAtk = this.currentEnemy.attackPower;
    const playerDef = (window.player && window.player.defenseStat) || 10;
    const damage = Math.max(5, Math.floor(baseEnemyAtk - playerDef * 0.35));

    if (window.player) {
      window.player.takeDamage(damage);
    }

    window.uiManager.addLog(
      `${this.currentEnemy.name} strikes with demonic fury! You take ${damage} damage. (HP: ${window.player.hp}/${window.player.maxHp})`,
      'info'
    );

    // DIVINE INTERVENTION CHECK
    if (window.player && window.player.hp <= 0) {
      this.triggerDivineIntervention();
      return;
    }

    // Return turn to player
    this.turn = 'player';
    const moves = this.getPlayerMoves();

    if (window.uiManager) {
      window.uiManager.showDialogue(
        this.currentEnemy.name,
        `${this.currentEnemy.name} counter-attacks dealing ${damage} damage! (Your HP: ${window.player.hp}/${window.player.maxHp} • Enemy HP: ${this.currentEnemy.hp}/${this.currentEnemy.maxHp})\nChoose your next action:`,
        '⚔️',
        moves
      );
    }
  }

  triggerDivineIntervention() {
    // Divine Intervention: Player never dies
    if (window.player) {
      window.player.hp = Math.floor(window.player.maxHp * 0.6);
    }
    if (this.currentEnemy) {
      this.currentEnemy.hp = 0;
    }

    if (this.activeEncounterId) {
      this.defeatedEncounters.add(this.activeEncounterId);
      if (window.mapManager && window.mapManager.encounters) {
        const enc = window.mapManager.encounters.find(e => e.id === this.activeEncounterId);
        if (enc) enc.defeated = true;
      }
    }

    if (window.uiManager) {
      window.uiManager.showDialogue(
        'Divine Grace (श्री राम कृपा)',
        'An arrow from Shri Ram strikes the enemy with radiant golden light! The rakshasa dissolves into dust instantly. You are protected by the Lord of the Universe!',
        '🏹',
        [
          {
            label: '🙏 Praise Shri Ram (जय श्री राम)',
            action: () => {
              this.endBattle();
            }
          }
        ]
      );
      window.uiManager.addLog(
        '✨ DIVINE INTERVENTION: An arrow from Shri Ram strikes the enemy!',
        'divine'
      );
    }
  }

  winBattle() {
    if (this.activeEncounterId) {
      this.defeatedEncounters.add(this.activeEncounterId);
      if (window.mapManager && window.mapManager.encounters) {
        const enc = window.mapManager.encounters.find(e => e.id === this.activeEncounterId);
        if (enc) enc.defeated = true;
      }
    }

    const allDefeated = window.mapManager && window.mapManager.encounters && window.mapManager.encounters.every(e => e.defeated || e.id === this.activeEncounterId);

    const choices = [
      {
        label: 'Continue March (आगे बढ़ें)',
        action: () => {
          this.endBattle();
        }
      }
    ];

    if (allDefeated) {
      choices.unshift({
        label: '🌅 Finish Day & Rest (दिन समाप्त करें - नया सवेरा)',
        action: () => {
          this.endBattle();
          if (window.game && window.game.finishDay) {
            window.game.finishDay();
          }
        }
      });
    }

    if (window.uiManager) {
      const victoryMsg = allDefeated
        ? `The ${this.currentEnemy.name} was repelled! ✦ ALL ENEMY BATTALIONS ON THE BATTLEFIELD HAVE BEEN DEFEATED TODAY! ✦\nYou may finish the day to rest and rally for tomorrow\'s battles, or continue patrolling.`
        : `The ${this.currentEnemy.name} was defeated! The vanguard path is clear. You offer your devotion to Shri Ram and continue your march!`;

      window.uiManager.showDialogue(
        'Victory in Dharma',
        victoryMsg,
        '✨',
        choices
      );
      window.uiManager.addLog(`✨ Defeated ${this.currentEnemy.name}! Victory for the Sena.`, 'service');
    }
  }

  retreatBattle() {
    this.disengageCooldownUntil = Date.now() + 800;
    if (window.uiManager) {
      window.uiManager.addLog(
        `↩️ Disengaged from ${this.currentEnemy ? this.currentEnemy.name : 'enemy'}. Regrouping with the Sena!`,
        'info'
      );
    }
    this.endBattle();
  }

  endBattle() {
    this.inCombat = false;
    this.currentEnemy = null;
    this.activeEncounterId = null;

    if (window.game) {
      window.game.state = window.GAME_STATES.OVERWORLD;
    }

    if (window.uiManager && window.uiManager.isDialogueOpen()) {
      window.uiManager.hideDialogue();
    }
  }
}

window.combatSystem = new CombatSystem();
