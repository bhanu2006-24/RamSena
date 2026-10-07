/**
 * RAM SENA - Combat System (combat.js)
 * Turn-based text-log battle engine for Phase 2: The Field.
 * 
 * CRITICAL SACRED RULE:
 * The player is a humble Vanar. If player HP reaches 0, there is NO GAME OVER.
 * Divine Intervention triggers:
 * "An arrow from Shri Ram strikes the enemy."
 * The enemy's HP instantly drops to 0, and the player survives.
 */

class CombatSystem {
  constructor() {
    this.inCombat = false;
    this.currentEnemy = null;
  }

  startBattle(enemyName = 'Nameless Rakshasa', enemyHp = 40) {
    this.inCombat = true;
    this.currentEnemy = {
      name: enemyName,
      hp: enemyHp,
      maxHp: enemyHp,
      attackPower: 15
    };

    if (window.uiManager) {
      window.uiManager.showDialogue(
        'Battle Encounter',
        `A fierce ${enemyName} stands before you! Prepare to defend the sacred cause!`,
        '⚔️',
        [
          { label: '🐾 Scratch', action: () => this.playerAttack('Scratch', 10) },
          { label: '🦷 Bite', action: () => this.playerAttack('Bite', 12) },
          { label: '🪨 Throw Rock', action: () => this.playerAttack('Throw Rock', 15) },
          { label: '🪵 Throw Wood', action: () => this.playerAttack('Throw Wood', 14) }
        ]
      );
      window.uiManager.addLog(`Encountered ${enemyName}! HP: ${enemyHp}`, 'info');
    }
  }

  playerAttack(attackName, damage) {
    if (!this.inCombat || !this.currentEnemy) return;

    this.currentEnemy.hp -= damage;
    window.uiManager.addLog(`Humble Vanar uses ${attackName}! Dealt ${damage} damage. Enemy HP: ${Math.max(0, this.currentEnemy.hp)}`, 'info');

    if (this.currentEnemy.hp <= 0) {
      this.winBattle();
      return;
    }

    // Enemy turn
    setTimeout(() => {
      this.enemyTurn();
    }, 600);
  }

  enemyTurn() {
    if (!this.inCombat || !this.currentEnemy) return;

    const damage = this.currentEnemy.attackPower;
    window.player.takeDamage(damage);
    window.uiManager.addLog(`${this.currentEnemy.name} strikes! You took ${damage} damage.`, 'info');

    // Check Player HP for DIVINE INTERVENTION
    if (window.player.hp <= 0) {
      this.triggerDivineIntervention();
    }
  }

  triggerDivineIntervention() {
    // DIVINE INTERVENTION: Player never dies. An arrow from Shri Ram protects them.
    window.player.hp = 1; // Preserve player life
    if (this.currentEnemy) {
      this.currentEnemy.hp = 0;
    }

    if (window.uiManager) {
      window.uiManager.showDialogue(
        'Divine Grace (श्री राम कृपा)',
        'An arrow from Shri Ram strikes the enemy with radiant light! The foe falls instantly. You are protected by divine grace.',
        '🏹'
      );
      window.uiManager.addLog('✨ Divine Intervention: An arrow from Shri Ram strikes the enemy!', 'divine');
    }

    this.endBattle();
  }

  winBattle() {
    if (window.uiManager) {
      window.uiManager.showDialogue(
        'Victory in Dharma',
        `The ${this.currentEnemy.name} has been overcome. The sacred march continues!`,
        '✨'
      );
      window.uiManager.addLog(`Defeated ${this.currentEnemy.name}!`, 'service');
    }
    this.endBattle();
  }

  endBattle() {
    this.inCombat = false;
    this.currentEnemy = null;
  }
}

window.combatSystem = new CombatSystem();
