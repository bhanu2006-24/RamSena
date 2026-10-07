/**
 * RAM SENA - Turn-Based Combat Engine (scripts/combat.js)
 * Implements Pokemon RPG-style encounters on The Field (Map 7).
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
  }

  startBattle(encounterId = null, customEnemyName = null) {
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
    const hp = 95 + Math.floor(Math.random() * 35); // 95 to 130 HP
    const atk = 14 + Math.floor(Math.random() * 8);  // 14 to 22 Attack
    const def = 6 + Math.floor(Math.random() * 6);   // 6 to 12 Defense

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

    // Determine attacks based on player archetype
    const isBear = window.player.typeId === 'riksha';
    const moves = isBear ? [
      { label: '🐾 Crushing Paw (वज्र प्रहार)', action: () => this.playerAttack('Crushing Paw', 26) },
      { label: '🦷 Heavy Bite (मल्ल दन्त)', action: () => this.playerAttack('Heavy Bite', 24) },
      { label: '🪨 Hurl Boulder (महाशिला प्रक्षेप)', action: () => this.playerAttack('Hurl Boulder', 32) },
      { label: '🪵 Uprooted Trunk (वृक्ष प्रहार)', action: () => this.playerAttack('Uprooted Trunk', 28) }
    ] : [
      { label: '🐾 Swift Scratch (नख प्रहार)', action: () => this.playerAttack('Swift Scratch', 20) },
      { label: '🦷 Quick Bite (दन्त प्रहार)', action: () => this.playerAttack('Quick Bite', 22) },
      { label: '🪨 Throw Rock (शिला प्रक्षेप)', action: () => this.playerAttack('Throw Rock', 25) },
      { label: '🪵 Throw Wood (दण्ड प्रहार)', action: () => this.playerAttack('Throw Wood', 21) }
    ];

    if (window.uiManager) {
      const greeting = `A ferocious ${name} leaps from the shadows with weapons drawn! (HP: ${hp} • ATK: ${atk} • DEF: ${def})`;
      window.uiManager.showDialogue('Battle on the Field (रणभूमि)', greeting, '⚔️', moves);
      window.uiManager.addLog(`Encountered ${name} on the battlefield!`, 'info');
    }
  }

  playerAttack(moveName, baseDamage) {
    if (!this.inCombat || !this.currentEnemy || this.turn !== 'player') return;

    // Calculate damage taking enemy defense into account
    const statBonus = window.player.attackStat || 20;
    const netDamage = Math.max(8, Math.floor(baseDamage * (statBonus / 20) - this.currentEnemy.defense * 0.4));
    
    // Critical hit chance
    const isCrit = Math.random() < (window.player.critChance || 0.15);
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

    // Transition to enemy turn
    this.turn = 'enemy';
    setTimeout(() => {
      this.enemyTurn();
    }, 600);
  }

  enemyTurn() {
    if (!this.inCombat || !this.currentEnemy) return;

    const baseEnemyAtk = this.currentEnemy.attackPower;
    const playerDef = window.player.defenseStat || 10;
    const damage = Math.max(6, Math.floor(baseEnemyAtk - playerDef * 0.4));

    window.player.takeDamage(damage);
    window.uiManager.addLog(
      `${this.currentEnemy.name} strikes with demonic fury! You take ${damage} damage. (Player HP: ${window.player.hp}/${window.player.maxHp})`,
      'info'
    );

    // DIVINE INTERVENTION CHECK
    if (window.player.hp <= 0) {
      this.triggerDivineIntervention();
      return;
    }

    // Return turn to player
    this.turn = 'player';

    const isBear = window.player.typeId === 'riksha';
    const moves = isBear ? [
      { label: '🐾 Crushing Paw', action: () => this.playerAttack('Crushing Paw', 26) },
      { label: '🦷 Heavy Bite', action: () => this.playerAttack('Heavy Bite', 24) },
      { label: '🪨 Hurl Boulder', action: () => this.playerAttack('Hurl Boulder', 32) },
      { label: '🪵 Uprooted Trunk', action: () => this.playerAttack('Uprooted Trunk', 28) }
    ] : [
      { label: '🐾 Swift Scratch', action: () => this.playerAttack('Swift Scratch', 20) },
      { label: '🦷 Quick Bite', action: () => this.playerAttack('Quick Bite', 22) },
      { label: '🪨 Throw Rock', action: () => this.playerAttack('Throw Rock', 25) },
      { label: '🪵 Throw Wood', action: () => this.playerAttack('Throw Wood', 21) }
    ];

    if (window.uiManager) {
      window.uiManager.showDialogue(
        'Combat: Choose Your Action',
        `Enemy ${this.currentEnemy.name} HP: ${this.currentEnemy.hp}/${this.currentEnemy.maxHp}. Defend the sacred cause!`,
        '⚔️',
        moves
      );
    }
  }

  triggerDivineIntervention() {
    // Divine Intervention: Player never dies
    window.player.hp = Math.floor(window.player.maxHp * 0.5); // Grace restores strength
    if (this.currentEnemy) {
      this.currentEnemy.hp = 0;
    }

    if (window.uiManager) {
      window.uiManager.showDialogue(
        'Divine Grace (श्री राम कृपा)',
        'An arrow from Shri Ram strikes the enemy with radiant golden light! The rakshasa dissolves into dust instantly. You are protected by the Lord of the Universe.',
        '🏹',
        [
          { label: '🙏 Praise Shri Ram (जय श्री राम)', action: () => this.endBattle() }
        ]
      );
      window.uiManager.addLog(
        '✨ DIVINE INTERVENTION: An arrow from Shri Ram strikes the enemy!',
        'divine'
      );
    }
  }

  winBattle() {
    if (this.activeEncounterId && window.mapManager.encounters) {
      const enc = window.mapManager.encounters.find(e => e.id === this.activeEncounterId);
      if (enc) enc.defeated = true;
    }

    if (window.uiManager) {
      window.uiManager.showDialogue(
        'Victory in Dharma',
        `The ${this.currentEnemy.name} was repelled from the vanguard. You offer your devotion to Shri Ram and continue your march!`,
        '✨',
        [
          { label: 'Continue (आगे बढ़ें)', action: () => this.endBattle() }
        ]
      );
      window.uiManager.addLog(`Defeated ${this.currentEnemy.name}! Victory for the Sena.`, 'service');
    }
  }

  endBattle() {
    this.inCombat = false;
    this.currentEnemy = null;
    this.activeEncounterId = null;
    if (window.game) {
      window.game.state = window.GAME_STATES.OVERWORLD;
    }
  }
}

window.combatSystem = new CombatSystem();
