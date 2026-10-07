/**
 * RAM SENA - Combat Engine (scripts/combat.js)
 * Turn-based text-driven encounters against nameless Rakshasas.
 * 
 * SACRED IMMUTABLE RULE:
 * If the player's HP reaches 0, they do not die (NO GAME OVER).
 * Divine Intervention triggers:
 * "An arrow from Shri Ram strikes the enemy."
 * The enemy's HP instantly drops to 0, and the player survives.
 */

class CombatSystem {
  constructor() {
    this.inCombat = false;
    this.currentEnemy = null;
  }

  startBattle(enemyName = 'Nameless Rakshasa', enemyHp = 45) {
    this.inCombat = true;
    this.currentEnemy = {
      name: enemyName,
      hp: enemyHp,
      maxHp: enemyHp,
      attackPower: 14
    };

    if (window.game) {
      window.game.state = window.GAME_STATES.COMBAT;
    }

    if (window.uiManager) {
      window.uiManager.showDialogue(
        'Sacred Battlefield',
        `A fierce ${enemyName} attempts to obstruct the advance of the Sena! Defend with courage.`,
        '⚔️',
        [
          { label: '🐾 Scratch', action: () => this.playerAttack('Scratch', 12) },
          { label: '🦷 Bite', action: () => this.playerAttack('Bite', 14) },
          { label: '🪨 Throw Rock', action: () => this.playerAttack('Throw Rock', 18) },
          { label: '🪵 Throw Wood', action: () => this.playerAttack('Throw Wood', 15) }
        ]
      );
      window.uiManager.addLog(`Battle began with ${enemyName} (HP: ${enemyHp})`, 'info');
    }
  }

  playerAttack(attackName, damage) {
    if (!this.inCombat || !this.currentEnemy) return;

    this.currentEnemy.hp -= damage;
    window.uiManager.addLog(
      `${window.player.role} executes ${attackName}! Dealt ${damage} damage.`,
      'info'
    );

    if (this.currentEnemy.hp <= 0) {
      this.winBattle();
      return;
    }

    // Enemy responds after slight delay
    setTimeout(() => {
      this.enemyTurn();
    }, 500);
  }

  enemyTurn() {
    if (!this.inCombat || !this.currentEnemy) return;

    const damage = this.currentEnemy.attackPower;
    window.player.takeDamage(damage);
    window.uiManager.addLog(
      `${this.currentEnemy.name} lunges fiercely! You take ${damage} damage.`,
      'info'
    );

    // DIVINE INTERVENTION CHECK
    if (window.player.hp <= 0) {
      this.triggerDivineIntervention();
    }
  }

  triggerDivineIntervention() {
    // Divine Intervention: Player is never defeated.
    window.player.hp = 1;
    if (this.currentEnemy) {
      this.currentEnemy.hp = 0;
    }

    if (window.uiManager) {
      window.uiManager.showDialogue(
        'Divine Grace (श्री राम रक्षा)',
        'An arrow from Shri Ram strikes the enemy with radiant golden light! The rakshasa vanishes into mist. You are saved by the divine hand.',
        '🏹'
      );
      window.uiManager.addLog(
        '✨ Divine Intervention: An arrow from Shri Ram strikes the enemy!',
        'divine'
      );
    }

    this.endBattle();
  }

  winBattle() {
    if (window.uiManager) {
      window.uiManager.showDialogue(
        'Victory in Dharma',
        `The ${this.currentEnemy.name} was repelled. You bow your head in devotion and resume your march.`,
        '✨'
      );
      window.uiManager.addLog(`Victory! The obstacle was removed.`, 'service');
    }
    this.endBattle();
  }

  endBattle() {
    this.inCombat = false;
    this.currentEnemy = null;
    if (window.game) {
      window.game.state = window.GAME_STATES.OVERWORLD;
    }
  }
}

window.combatSystem = new CombatSystem();
