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
      if (window.mapManager && window.mapManager.isSetuCompleted) {
        // Phase 2: All divine leaders have crossed Ram Setu into Lanka!
        this.npcs = [
          {
            id: 'camp1_caretaker',
            name: 'Camp Caretaker Vanar (शिविर रक्षक)',
            x: 16, y: 6,
            symbol: '🐒',
            color: '#92400e',
            dialogues: [
              'Shri Ram, Lakshman, Hanuman, and the entire army have crossed Ram Setu into Lanka! The vanguard camp is established across the sea.'
            ]
          }
        ];
        return;
      }

      this.npcs = [
        // Revered Leaders in Camp 1
        {
          id: 'shri_ram',
          name: 'Shri Ram (मर्यादा पुरुषोत्तम)',
          x: 16, y: 6,
          symbol: '🏹',
          color: '#0284c7', // Radiant dark cloud hue (Neel-Megha-Shyama)
          aura: 'rgba(56, 189, 248, 0.45)',
          isDivine: true,
          title: 'Avatar of Dharma & Ocean of Compassion',
          dialogues: [
            'सनमुख होइ जीव मोहि जबहीं।\nजन्म कोटि अघ नासहिं तबहीं॥\n\nBeloved devotee, the moment a soul turns toward Me with devotion, countless sins of lifetimes dissolve. Serve with pure devotion and a fearless heart.',
            'सखा सोच त्यागहु बल मोरें।\nसब बिधि घटब काजु मैं तोरें॥\n\nAbandon all worry by my strength, dear friend. Every task will be fulfilled in righteousness. Dharma is protected not by pride, but by selfless surrender and truth.',
            'निर्मल मन जन सो मोहि पावा।\nमोहि कपट छल छिद्र न भावा॥\n\nHe who possesses a pure, innocent heart attains Me. The stones you gather with love carry the power to bridge any sea. May your mind always remain steady.'
          ]
        },
        {
          id: 'lakshman',
          name: 'Lakshman (श्री लक्ष्मण)',
          x: 18, y: 6,
          symbol: '🏹',
          color: '#ca8a04',
          aura: 'rgba(234, 179, 8, 0.4)',
          isDivine: true,
          title: 'Ever-Vigilant Guardian of Shri Ram',
          dialogues: [
            'धर्म न दूसर सत्य समाना।\nआगम निगम पुरान बखाना॥\n\nThere is no Dharma higher than Truth! Keep your vigilance sharp, valiant Vanar, as we prepare to cross the ocean and root out the dark forces of adharma.',
            'राम सखा रघुपति प्रिय केही।\nभरतहि प्रिय जेहि सिय पिउ देही॥\n\nEvery stone brought forward is an immortal contribution to righteousness. Stand tall and unwavering!'
          ]
        },
        {
          id: 'hanuman',
          name: 'Hanuman (पवनपुत्र हनुमान)',
          x: 14, y: 10,
          symbol: '🚩',
          color: '#ea580c',
          aura: 'rgba(249, 115, 22, 0.5)',
          isDivine: true,
          title: 'Embodiment of Pure Bhakti & Supreme Strength',
          dialogues: [
            'कवन सो काज कठिन जग माहीं।\nजो नहिं होइ तात तुम्ह पाहीं॥\n\nजय श्री राम! What task in all the three worlds is difficult when one has the grace of Shri Ram? Never consider any seva small—even the tiny squirrel received the loving caress of the Lord!',
            'प्रबिसि नगर कीजै सब काजा।\nहृदयं राखि कोसलपुर राजा॥\n\nKeep the King of Kosala (Shri Ram) enshrined in your heart, and every impossible task in life will be effortlessly accomplished!',
            'राम काज करिबे को आतुर।\nप्रभु चरित्र सुनिबे को रसिया॥\n\nIn every breath and heartbeat, remember the holy name of Shri Ram. Nothing in all three worlds can resist the power of Ram Naam!'
          ]
        },
        {
          id: 'sugreev',
          name: 'Sugreev (वानरराज सुग्रीव)',
          x: 11, y: 6,
          symbol: '👑',
          color: '#d97706',
          title: 'King of Kishkindha & General of the Sena',
          dialogues: [
            'राम काज लगि तव अवतारा।\nसुनतहिं हरष भयउ संसारा॥\n\nThe entire vanar host stands united under Shri Ram. See that every patrol is alert and stones are delivered swiftly to Nal and Neel.'
          ]
        },
        {
          id: 'jambavan',
          name: 'Jambavan (ऋक्षराज जाम्बवन्त)',
          x: 21, y: 6,
          symbol: '🐻',
          color: '#522610',
          title: 'Venerable Patriarch of the Bears',
          dialogues: [
            'पवन तनय बल पवन समाना।\nबुधि बिबेक बिग्यान निधाना॥\n\nBlessed is this day that our clans join hands for the supreme cause. Bear or Vanar, every one of us is an instrument of divine will.'
          ]
        },
        {
          id: 'vibhishan',
          name: 'Vibhishan (भक्त विभीषण)',
          x: 8, y: 6,
          symbol: '📿',
          color: '#475569',
          title: 'Devotee of Dharma & Refuge of Shri Ram',
          dialogues: [
            'कोटि बिप्र बध लागहिं जाहू।\nआएँ सरन तजउँ नहिं ताहू॥\n\nI left the splendour of Lanka because truth cannot coexist with adharma. Shri Ram accepted me the moment I took refuge at His lotus feet. What boundless mercy!'
          ]
        },
        {
          id: 'angad',
          name: 'Angad (युवराज अंगद)',
          x: 24, y: 6,
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
        // Master Architect Nal
        {
          id: 'nal',
          name: 'Nal (शिल्पकार नल)',
          x: 16, y: 11,
          symbol: '🌊',
          color: '#0891b2',
          aura: 'rgba(6, 182, 212, 0.45)',
          title: 'Divine Architect Nal (विश्वकर्मा-सुत)',
          isSetuArchitect: true,
          dialogues: [
            'लिखि लिखि नाम चलावहिं रामा।\nरचहिं सेतु जय जय सुखधामा॥\n\nJai Shri Ram! I am Nal, blessed son of Vishwakarma. Give me the sacred boulders from the forest; as we inscribe "राम", by divine grace each stone floats upon the ocean waves without sinking!',
            'Every stone must be aligned with devotion. Bring your boulders to me or Neel to bridge this mighty ocean!'
          ]
        },
        // Master Architect Neel
        {
          id: 'neel',
          name: 'Neel (शिल्पकार नील)',
          x: 18, y: 11,
          symbol: '🌊',
          color: '#0284c7',
          aura: 'rgba(2, 132, 199, 0.45)',
          title: 'Divine Architect Neel (विश्वकर्मा-सुत)',
          isSetuArchitect: true,
          dialogues: [
            'सिला तरहिं जिन पर प्रभु नामा।\nदेखि कौतुक सुख पावत रामा॥\n\nJai Shri Ram! I am Neel. While Nal measures the span toward Lanka, I secure and interlock the floating boulders upon the sea in Shri Ram\'s holy name!',
            'With each stone you carry from Mount Mahendra, the sacred Setu stretches further across the turbulent waters!'
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
    } else if (mapId === 'beach2') {
      this.npcs = [
        {
          id: 'beach_guard_lanka',
          name: 'Lanka Shore Sentinel (तट रक्षक सेनानी)',
          x: 15, y: 7,
          symbol: '🐒',
          color: '#92400e',
          dialogues: [
            'We stand firm on the shores of Lanka! The bridge behind us connects to Bharat, but our army moves only forward. Turning back from the battle of Dharma is unthinkable!',
            'Lord Ram and the commanders await in the Lanka Vanguard Camp to the south. March forward, valiant warrior!'
          ]
        },
        {
          id: 'beach_bear_lanka',
          name: 'Shore Watch Bear (तट पहरेदार भालू)',
          x: 19, y: 7,
          symbol: '🐻',
          color: '#451a03',
          dialogues: [
            'Our eyes scan the sea and the cliffs of Lanka. The entire army has landed safely. Advance southward to join the vanguard camp!'
          ]
        }
      ];
    } else if (mapId === 'camp2') {
      this.npcs = [
        // Lanka Camp Leaders
        {
          id: 'shri_ram_lanka',
          name: 'Shri Ram (श्री राम)',
          x: 16, y: 6,
          symbol: '🏹',
          color: '#0284c7',
          aura: 'rgba(56, 189, 248, 0.45)',
          isDivine: true,
          dialogues: [
            'सरनागत कहुँ जे तजहिं निज अनहित अनुमानि।\nते नर पावँर पापमय तिन्हहि बिलोकत हानि॥\n\nWe stand upon Lanka. Protect the innocent and uphold Dharma without malice. He who seeks shelter with an open heart shall never be rejected.',
            'दैहिक दैविक भौतिक तापा।\nराम राज नहिं काहुहि ब्यापा॥\n\nLet our courage shine as a beacon of truth. Keep your faith steadfast; victory belongs to Dharma!'
          ]
        },
        {
          id: 'lakshman_lanka',
          name: 'Lakshman (श्री लक्ष्मण)',
          x: 18, y: 6,
          symbol: '🏹',
          color: '#ca8a04',
          aura: 'rgba(234, 179, 8, 0.4)',
          isDivine: true,
          dialogues: [
            'राम टेक राखेहु मन माहीं।\nधर्म विजय संसय कछु नाहीं॥\n\nBy the immense grace of Shri Ram and Hanuman’s heroic flight with Mount Dronagiri, the venom of Indrajit’s spear was shattered. I stand ready for the supreme victory of righteousness!'
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
            'संजीवनी मूरि आनि जिआए।\nलखन राम हरष उर छाए॥\n\nPraise be to Hanuman Ji! When Lord Lakshman lay unconscious, Hanuman brought the entire mountain with Sanjeevani, Vishalyakarani, and Savarnakarani herbs before sunrise!',
            'I tend to the wounded warriors of the army with herbs and sacred water. No loyal soldier in Shri Ram\'s army will ever be left behind.'
          ]
        },
        {
          id: 'hanuman_lanka',
          name: 'Hanuman (महावीर हनुमान)',
          x: 20, y: 10,
          symbol: '🚩',
          color: '#ea580c',
          aura: 'rgba(249, 115, 22, 0.5)',
          isDivine: true,
          dialogues: [
            'महाबीर बिक्रम बजरंगी।\nकुमति निवार सुमति के संगी॥\n\nThe gates of Lanka tremble! The demonic illusions can never cloud the light of Dharma. Keep repeating "जय श्री राम" as you stand guard!'
          ]
        },
        {
          id: 'sugreev_lanka',
          name: 'Sugreev (वानरराज सुग्रीव)',
          x: 11, y: 6,
          symbol: '👑',
          color: '#d97706',
          title: 'King of Kishkindha',
          dialogues: [
            'Our vanguard holds the mountain pass firmly. Ensure the sentries maintain vigil!'
          ]
        },
        {
          id: 'jambavan_lanka',
          name: 'Jambavan (ऋक्षराज जाम्बवन्त)',
          x: 21, y: 6,
          symbol: '🐻',
          color: '#522610',
          dialogues: [
            'The mighty Kumbhakarna has fallen before Shri Ram\'s divine arrow! The rakshasas are in disarray. Stay vigilant at the eastern gate to the battlefield.'
          ]
        },
        {
          id: 'vibhishan_lanka',
          name: 'Vibhishan (विभीषण)',
          x: 8, y: 6,
          symbol: '📿',
          color: '#475569',
          dialogues: [
            'Ravana’s pride has brought doom upon his own golden city. The end of tyranny is at hand.'
          ]
        },
        {
          id: 'angad_lanka',
          name: 'Angad (युवराज अंगद)',
          x: 24, y: 6,
          symbol: '🛡️',
          color: '#b45309',
          title: 'Crown Prince of Kishkindha',
          dialogues: [
            'No power in Lanka can move the foot planted by faith in Shri Ram! Victory belongs to Dharma!'
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

    // 2. Special Setu stone delivery & Lanka crossing for Nal & Neel
    if (npc.isSetuArchitect) {
      const stones = window.inventory ? (window.inventory.items.stones || 0) : 0;
      if (stones > 0) {
        choices.push({
          label: `🪨 Offer ${stones} Stones to Build Setu`,
          action: () => {
            window.inventory.remove('stones', stones);
            window.mapManager.deliverStonesToSetu(stones);
          }
        });
      }
      if (window.mapManager && window.mapManager.stonesDelivered >= window.mapManager.targetStones) {
        choices.push({
          label: '⚔️ Cross Ram Setu to Lanka (Phase 2)',
          action: () => {
            window.mapManager.loadMap('beach2', 17, 6, true);
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
      'Nal and Neel possess the sacred boon: by remembering and chanting the holy name of Shri Ram, every stone offered with pure Bhakti floats upon the waves without sinking! The Setu grows steadily!',
      'I heard the elder Jambavan say that Hanuman leaped across the sea in a single boundless bound to find Mother Sita in Lanka!',
      'Mother Sita waits with supreme patience under the Ashoka tree. Soon, the vanar vanguard will liberate Lanka and restore Dharma!',
      'Did you hear? The titan Kumbhakarna attacked with fury, but fell before Shri Ram\'s golden arrow! The rakshasa kingdom shudders!',
      'When Lord Lakshman was wounded by the mystic weapon, Hanuman flew to the Himalayas and carried the entire Dronagiri mountain with Sanjeevani herbs before dawn! Lord Lakshman is completely healed!'
    ];
    return lores[index % lores.length];
  }

  echoChant(customText = null) {
    const sacredChants = [
      'जय श्री राम! 🙏',
      'मंगल भवन अमंगल हारी 🚩',
      'सियापति रामचन्द्र की जय! 🌸',
      'पवनसुत हनुमान की जय! 🚩',
      'जय रघुवीर समर्थ! 🏹',
      'कवन सो काज कठिन जग माहीं 🙏'
    ];
    this.npcs.forEach((npc, idx) => {
      const text = (customText && idx === 0) ? customText : sacredChants[(idx + Math.floor(Math.random() * sacredChants.length)) % sacredChants.length];
      this.floatingChants.push({
        x: npc.x,
        y: npc.y,
        text: text,
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

      const clock = window.game ? window.game.animClock : 0;
      const bob = Math.sin(clock * 0.003 + (npc.x * 2 + npc.y)) * 2.5;

      const spriteKey = window.spriteManager ? window.spriteManager.getSpriteKeyForNPC(npc.id) : null;
      const spriteImg = spriteKey && window.spriteManager ? window.spriteManager.getImage(spriteKey) : null;

      if (window.assetRenderer) {
        window.assetRenderer.drawCharacter(
          ctx,
          spriteImg,
          sx,
          sy,
          tileSize,
          bob,
          'down',
          npc.isDivine,
          npc.aura,
          false
        );
      }
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
