/**
 * RAM SENA - NPC & Devotional Dialogue System (scripts/npcManager.js)
 * Manages static NPCs, divine darshan, lore dialogues, and devotional offerings.
 * 
 * SACRED IMMUTABLE RULE:
 * The player is a humble, generic devotee. Shri Ram, Lakshman, and Hanuman
 * are revered divine figures—never controlled or altered.
 */

class NPCManager {
  constructor() {
    this.npcs = [];
    this.floatingChants = [];
  }

  loadNPCsForMap(mapId) {
    this.npcs = [];

    if (mapId === 'camp1') {
      this.npcs = [
        // Revered Leaders in Camp 1
        {
          id: 'shri_ram',
          name: 'Shri Ram (मर्यादा पुरुषोत्तम)',
          x: 16, y: 5,
          symbol: '🏹',
          color: '#0284c7', // Radiant dark cloud hue (Neel-Megha-Shyama)
          aura: 'rgba(56, 189, 248, 0.45)',
          isDivine: true,
          title: 'Avatar of Dharma & Ocean of Compassion',
          dialogues: [
            'Beloved devotee, your humble service in this great cause is more precious than jewels. Serve with pure devotion and fearless heart.',
            'Dharma is protected not by pride, but by selfless surrender and truth. Walk in peace.',
            'The stones you gather with love carry the power to bridge any sea. May your mind always remain steady.'
          ]
        },
        {
          id: 'lakshman',
          name: 'Lakshman (श्री लक्ष्मण)',
          x: 18, y: 5,
          symbol: '🏹',
          color: '#ca8a04',
          aura: 'rgba(234, 179, 8, 0.4)',
          isDivine: true,
          title: 'Ever-Vigilant Guardian of Shri Ram',
          dialogues: [
            'Keep your vigilance sharp, valiant Vanar. We prepare to cross the ocean and root out the dark forces of adharma.',
            'Every stone brought forward is a blow against righteousness being wronged. Stand tall!'
          ]
        },
        {
          id: 'hanuman',
          name: 'Hanuman (पवनपुत्र हनुमान)',
          x: 14, y: 9,
          symbol: '🚩',
          color: '#ea580c',
          aura: 'rgba(249, 115, 22, 0.5)',
          isDivine: true,
          title: 'Embodiment of Pure Bhakti & Supreme Strength',
          dialogues: [
            'जय श्री राम! In every heartbeat, remember the holy name of Shri Ram. Nothing in all three worlds can resist the power of Ram Naam.',
            'Do not feel your seva is small. Even the tiny squirrel who rolled in the dust to fill cracks between the stones received the loving caress of Shri Ram!',
            'Serve with humility and courage. Victory belongs to Dharma!'
          ]
        },
        {
          id: 'sugreev',
          name: 'Sugreev (वानरराज सुग्रीव)',
          x: 12, y: 5,
          symbol: '👑',
          color: '#d97706',
          title: 'King of Kishkindha & General of the Sena',
          dialogues: [
            'The entire vanar host stands united under Shri Ram. See that every patrol is alert and stones are delivered swiftly to Nal and Neel.'
          ]
        },
        {
          id: 'jambavan',
          name: 'Jambavan (ऋक्षराज जाम्बवन्त)',
          x: 20, y: 5,
          symbol: '🐻',
          color: '#522610',
          title: 'Venerable Patriarch of the Bears',
          dialogues: [
            'Blessed is this day that our clans join hands for the supreme cause. Bear or Vanar, every one of us is an instrument of divine will.'
          ]
        },
        {
          id: 'vibhishan',
          name: 'Vibhishan (भक्त विभीषण)',
          x: 10, y: 5,
          symbol: '📿',
          color: '#475569',
          title: 'Devotee of Dharma & Refuge of Shri Ram',
          dialogues: [
            'I left the splendour of Lanka because truth cannot coexist with adharma. Shri Ram accepted me without hesitation. What mercy!'
          ]
        },
        {
          id: 'angad',
          name: 'Angad (युवराज अंगद)',
          x: 22, y: 5,
          symbol: '🛡️',
          color: '#b45309',
          title: 'Crown Prince of Kishkindha',
          dialogues: [
            'My mace and soul belong to Shri Ram! The demons of Lanka will soon discover the righteous strength of Kishkindha.'
          ]
        },
        // Fellow Soldiers in Camp 1
        {
          id: 'soldier_1',
          name: 'Vanar Warrior (साथी सैनिक)',
          x: 13, y: 14,
          symbol: '🐒',
          color: '#92400e',
          loreIndex: 0
        },
        {
          id: 'soldier_2',
          name: 'Riksha Warrior (भालू सेनानी)',
          x: 21, y: 14,
          symbol: '🐻',
          color: '#451a03',
          loreIndex: 1
        },
        {
          id: 'soldier_3',
          name: 'Vanar Scout (गुप्तचर)',
          x: 8, y: 18,
          symbol: '🐒',
          color: '#92400e',
          loreIndex: 2
        }
      ];
    } else if (mapId === 'forest1') {
      this.npcs = [
        {
          id: 'forager_1',
          name: 'Vanar Forager (फल संग्रहकर्ता)',
          x: 15, y: 12,
          symbol: '🐒',
          color: '#92400e',
          dialogues: [
            'Jai Shri Ram! The forest trees are rich with fruits. Shake any tree around to gather sweet berries, mangoes, and flowers for the camp!'
          ]
        },
        {
          id: 'quarry_bear',
          name: 'Stalwart Bear (पत्थर वाहक भालू)',
          x: 19, y: 15,
          symbol: '🐻',
          color: '#451a03',
          dialogues: [
            'I lift these massive mountain rocks on my shoulders! Carry as many as you can down to Nal and Neel at the southern beach.'
          ]
        }
      ];
    } else if (mapId === 'beach1') {
      this.npcs = [
        // Master Architects Nal & Neel
        {
          id: 'nal_neel',
          name: 'Nal & Neel (शिल्पकार नल-नील)',
          x: 17, y: 11,
          symbol: '🌊',
          color: '#0891b2',
          aura: 'rgba(6, 182, 212, 0.45)',
          title: 'Divine Architects of Ram Setu',
          isSetuArchitect: true,
          dialogues: [
            'Jai Shri Ram! Bring us the gathered stones from the northern forest. By divine blessing, every stone touched with the name of Ram floats upon the ocean waves!'
          ]
        },
        {
          id: 'beach_guard',
          name: 'Coast Patrol Vanar (तट रक्षक)',
          x: 12, y: 8,
          symbol: '🐒',
          color: '#92400e',
          dialogues: [
            'The southern breeze carries the fragrance of ocean spray. Nal and Neel are placing stones continuously—the bridge is growing closer to Lanka every hour!'
          ]
        }
      ];
    } else if (mapId === 'camp2') {
      this.npcs = [
        // Lanka Camp Leaders
        {
          id: 'shri_ram_lanka',
          name: 'Shri Ram (श्री राम)',
          x: 16, y: 5,
          symbol: '🏹',
          color: '#0284c7',
          aura: 'rgba(56, 189, 248, 0.45)',
          isDivine: true,
          dialogues: [
            'We stand upon Lanka. Protect the innocent and uphold Dharma without malice. Let our courage shine as a beacon of truth.',
            'He who seeks shelter with an open heart shall never be rejected. Keep your faith steadfast.'
          ]
        },
        {
          id: 'lakshman_lanka',
          name: 'Lakshman (श्री लक्ष्मण)',
          x: 18, y: 5,
          symbol: '🏹',
          color: '#ca8a04',
          aura: 'rgba(234, 179, 8, 0.4)',
          isDivine: true,
          dialogues: [
            'By the immense grace of Shri Ram and Hanuman’s heroic flight with Mount Dronagiri, the venom of Indrajit’s spear was shattered. I stand ready for victory!'
          ]
        },
        {
          id: 'sushena',
          name: 'Sushena Vaidya (राजवैद्य सुषेण)',
          x: 13, y: 10,
          symbol: '🌿',
          color: '#15803d',
          aura: 'rgba(34, 197, 94, 0.4)',
          title: 'Master Physician of the Sena',
          dialogues: [
            'Praise be to Hanuman Ji! When Lord Lakshman lay unconscious, Hanuman brought the entire mountain with Sanjeevani, Vishalyakarani, and Savarnakarani herbs before sunrise!',
            'I tend to the wounded warriors of the army with herbs and sacred water. No loyal soldier in Shri Ram\'s army will be left behind.'
          ]
        },
        {
          id: 'hanuman_lanka',
          name: 'Hanuman (महावीर हनुमान)',
          x: 20, y: 9,
          symbol: '🚩',
          color: '#ea580c',
          aura: 'rgba(249, 115, 22, 0.5)',
          isDivine: true,
          dialogues: [
            'The gates of Lanka tremble! The demonic illusions can never cloud the light of Dharma. Keep repeating "जय श्री राम" as you stand guard!'
          ]
        },
        {
          id: 'jambavan_lanka',
          name: 'Jambavan (ऋक्षराज जाम्बवन्त)',
          x: 22, y: 5,
          symbol: '🐻',
          color: '#522610',
          dialogues: [
            'The mighty Kumbhakarna has fallen before Shri Ram\'s divine arrow! The rakshasas are in disarray. Stay vigilant at the eastern gate to the battlefield.'
          ]
        },
        {
          id: 'vibhishan_lanka',
          name: 'Vibhishan (विभीषण)',
          x: 10, y: 5,
          symbol: '📿',
          color: '#475569',
          dialogues: [
            'Ravana’s pride has brought doom upon his own golden city. The end of tyranny is at hand.'
          ]
        },
        {
          id: 'soldier_lanka_1',
          name: 'Frontline Vanar (अग्रिम वानर)',
          x: 15, y: 14,
          symbol: '🐒',
          color: '#92400e',
          loreIndex: 3
        },
        {
          id: 'soldier_lanka_2',
          name: 'Frontline Bear (अग्रिम भालू सेनानी)',
          x: 19, y: 14,
          symbol: '🐻',
          color: '#451a03',
          loreIndex: 4
        }
      ];
    } else if (mapId === 'field') {
      this.npcs = [
        {
          id: 'battle_vanar',
          name: 'Vanguard Vanar (योद्धा वानर)',
          x: 4, y: 10,
          symbol: '🐒',
          color: '#92400e',
          dialogues: [
            'Forward, brothers! With claws, teeth, trees, and stones, we push back the demonic host! जय श्री राम!'
          ]
        },
        {
          id: 'battle_bear',
          name: 'Vanguard Bear (शूरवीर भालू)',
          x: 4, y: 14,
          symbol: '🐻',
          color: '#451a03',
          dialogues: [
            'Our bear brigade crushes the enemy chariots under heavy boulders! Stand together in Dharma!'
          ]
        }
      ];
    }
  }

  isOccupiedByNPC(x, y) {
    return this.npcs.some(npc => npc.x === x && npc.y === y);
  }

  getNPCAt(x, y) {
    return this.npcs.find(npc => npc.x === x && npc.y === y) || null;
  }

  interactWithNPC(npc) {
    if (!npc) return;

    // Build dialogue choices (Offerings & Talk)
    const choices = [];

    // 1. Talk / Listen to lore
    choices.push({
      label: '🙏 Talk & Listen',
      action: () => this.showNPCLoreDialogue(npc)
    });

    // 2. Special Setu stone delivery for Nal & Neel
    if (npc.isSetuArchitect) {
      const stones = window.inventory.items.stones;
      if (stones > 0) {
        choices.push({
          label: `🪨 Offer ${stones} Stones to Build Setu`,
          action: () => {
            window.inventory.remove('stones', stones);
            window.mapManager.deliverStonesToSetu(stones);
          }
        });
      }
    }

    // 3. Offering Fruits
    if (window.inventory.items.fruits > 0) {
      choices.push({
        label: '🍎 Offer Wild Fruits (फल अर्पण)',
        action: () => this.offerItemToNPC(npc, 'fruits', 'sweet wild fruits', '🍎')
      });
    }

    // 4. Offering Coconuts
    if (window.inventory.items.coconuts > 0) {
      choices.push({
        label: '🥥 Offer Fresh Coconut (श्रीफल अर्पण)',
        action: () => this.offerItemToNPC(npc, 'coconuts', 'a fresh coconut', '🥥')
      });
    }

    // 5. Offering Flowers
    if (window.inventory.items.flowers > 0) {
      choices.push({
        label: '🌸 Offer Forest Flowers (पुष्प अर्पण)',
        action: () => this.offerItemToNPC(npc, 'flowers', 'forest blossoms', '🌸')
      });
    }

    // 6. Offering Crafted Garland
    if (window.inventory.items.garlands > 0) {
      choices.push({
        label: '📿 Offer Devotional Garland (पुष्पमाला अर्पण)',
        action: () => this.offerItemToNPC(npc, 'garlands', 'a fragrant hand-woven garland', '📿')
      });
    }

    // Initial greeting
    const greeting = npc.title 
      ? `You bow with deep reverence before ${npc.name} (${npc.title}).`
      : `You stand beside ${npc.name}. They greet you with folded hands: "जय श्री राम!"`;

    if (window.uiManager) {
      window.uiManager.showDialogue(npc.name, greeting, npc.symbol, choices);
    }
  }

  showNPCLoreDialogue(npc) {
    let text = '';
    if (npc.dialogues && npc.dialogues.length > 0) {
      // Pick random or sequential dialogue
      const idx = Math.floor(Math.random() * npc.dialogues.length);
      text = npc.dialogues[idx];
    } else {
      text = this.getArmyLore(npc.loreIndex !== undefined ? npc.loreIndex : 0);
    }

    if (window.uiManager) {
      window.uiManager.showDialogue(npc.name, text, npc.symbol);
      window.uiManager.addLog(`Spoke with ${npc.name}: "${text.slice(0, 40)}..."`, 'info');
    }
  }

  offerItemToNPC(npc, itemKey, itemName, icon) {
    if (window.inventory.remove(itemKey, 1)) {
      let blessing = '';
      if (npc.id === 'shri_ram' || npc.id === 'shri_ram_lanka') {
        blessing = `Shri Ram receives your humble ${itemName} with radiant compassion. A wave of boundless peace fills your soul. "Blessed is your Bhakti, dear devotee."`;
      } else if (npc.id === 'hanuman' || npc.id === 'hanuman_lanka') {
        blessing = `Hanuman Ji bows his head with pure joy: "Every leaf, flower, and fruit offered with love to Shri Ram is infinite! May Ram Naam ever reside on your tongue!"`;
      } else if (npc.id === 'sushena') {
        blessing = `Sushena Vaidya accepts the ${itemName}: "The pure forest remedies and your devotional heart help strengthen the spirit of the entire army."`;
      } else {
        blessing = `${npc.name} receives your ${itemName} with folded hands: "जय श्री राम! Your noble seva nourishes our comrades!"`;
      }

      if (window.uiManager) {
        window.uiManager.showDialogue(npc.name, blessing, icon);
        window.uiManager.addLog(`Offered ${itemName} to ${npc.name}.`, 'service');
      }

      // Play sacred chime
      if (window.audioManager) {
        window.audioManager.playTempleBell();
      }
    }
  }

  getArmyLore(index) {
    const lores = [
      'Nal and Neel discovered a sacred blessing: every stone inscribed with "RAM" floats upon the waves without sinking! The Setu grows steadily!',
      'I heard the elder Jambavan say that Hanuman leaped across the sea in a single boundless bound to find Mother Sita in Lanka!',
      'Mother Sita waits with supreme patience under the Ashoka tree. Soon, the vanar vanguard will liberate Lanka and restore Dharma!',
      'Did you hear? The titan Kumbhakarna attacked with fury, but fell before Shri Ram\'s golden arrow! The rakshasa kingdom shudders!',
      'When Lord Lakshman was wounded by the mystic weapon, Hanuman flew to the Himalayas and carried the entire Dronagiri mountain with Sanjeevani herbs before dawn! Lord Lakshman is completely healed!'
    ];
    return lores[index % lores.length];
  }

  echoChant() {
    this.npcs.forEach(npc => {
      this.floatingChants.push({
        x: npc.x,
        y: npc.y,
        text: 'जय श्री राम! 🙏',
        opacity: 1.0,
        age: 0
      });
    });
  }

  update(deltaTime) {
    // Update floating chant auras
    for (let i = this.floatingChants.length - 1; i >= 0; i--) {
      const chant = this.floatingChants[i];
      chant.age += deltaTime;
      chant.opacity = Math.max(0, 1.0 - chant.age / 1800);
      if (chant.opacity <= 0) {
        this.floatingChants.splice(i, 1);
      }
    }
  }

  render(ctx, tileSize) {
    this.npcs.forEach(npc => {
      const screenPos = window.camera.worldToScreen(npc.x * tileSize, npc.y * tileSize);
      const sx = screenPos.x;
      const sy = screenPos.y;

      // Drop shadow
      ctx.beginPath();
      ctx.ellipse(sx + tileSize / 2, sy + tileSize * 0.85, tileSize * 0.32, tileSize * 0.16, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fill();

      // Aura if divine / leader
      if (npc.aura) {
        const auraGrad = ctx.createRadialGradient(
          sx + tileSize / 2, sy + tileSize / 2, tileSize * 0.1,
          sx + tileSize / 2, sy + tileSize / 2, tileSize * 0.8
        );
        auraGrad.addColorStop(0, npc.aura);
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(sx + tileSize / 2, sy + tileSize / 2, tileSize * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }

      // Base Body Box
      const size = tileSize * 0.76;
      const padding = (tileSize - size) / 2;
      const rx = sx + padding;
      const ry = sy + padding;

      ctx.fillStyle = npc.color || '#854d0e';
      ctx.strokeStyle = npc.isDivine ? '#fde047' : '#f59e0b';
      ctx.lineWidth = npc.isDivine ? 3 : 2;

      ctx.beginPath();
      ctx.roundRect(rx, ry, size, size, 8);
      ctx.fill();
      ctx.stroke();

      // Tilak
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.ellipse(rx + size / 2, ry + size * 0.2, 2.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Symbol / Emoji
      ctx.font = `${Math.floor(size * 0.52)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(npc.symbol, rx + size / 2, ry + size * 0.58);
    });

    // Render floating chant shouts
    this.floatingChants.forEach(chant => {
      const screenPos = window.camera.worldToScreen(chant.x * tileSize, chant.y * tileSize);
      const floatY = screenPos.y - (chant.age * 0.02);

      ctx.save();
      ctx.globalAlpha = chant.opacity;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 6;
      ctx.fillText(chant.text, screenPos.x + tileSize / 2, floatY);
      ctx.restore();
    });
  }
}

window.npcManager = new NPCManager();
