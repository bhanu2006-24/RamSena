/**
 * RAM SENA - Map Manager & Scenario Coordinator (scripts/mapManager.js)
 * Coordinates the 7 maps, portal transitions, Setu construction progress, and tile queries.
 */

class MapManager {
  constructor() {
    this.maps = {};
    this.currentMap = null;
    this.currentMapId = 'camp1';
    this.phase = 1;

    // Ram Setu construction milestone (10 stones required)
    this.stonesDelivered = 0;
    this.targetStones = 10;
    this.isSetuCompleted = false;
  }

  registerMaps() {
    this.maps = {
      camp1: window.CAMP1_MAP,
      forest1: window.FOREST1_MAP,
      beach1: window.BEACH1_MAP,
      camp2: window.CAMP2_MAP,
      forest2: window.FOREST2_MAP,
      beach2: window.BEACH2_MAP,
      field: window.FIELD_MAP
    };

    // Default to camp1
    this.loadMap('camp1', 17, 14, false);
  }

  loadMap(mapId, spawnX = null, spawnY = null, announce = true) {
    const mapData = this.maps[mapId];
    if (!mapData) {
      console.warn(`Map "${mapId}" not found.`);
      return false;
    }

    this.currentMap = mapData;
    this.currentMapId = mapId;
    this.phase = mapData.phase;
    this.width = mapData.width;
    this.height = mapData.height;
    this.grid = mapData.grid;
    this.portals = mapData.portals || [];
    this.encounters = (mapData.encounters || []).map(enc => {
      const isDefeated = window.combatSystem && window.combatSystem.defeatedEncounters && window.combatSystem.defeatedEncounters.has(enc.id);
      return { ...enc, defeated: !!(enc.defeated || isDefeated) };
    });

    // Position player
    const px = spawnX !== null ? spawnX : (mapData.spawnX || 17);
    const py = spawnY !== null ? spawnY : (mapData.spawnY || 14);

    if (window.player) {
      window.player.x = px;
      window.player.y = py;
      window.player.visualX = px;
      window.player.visualY = py;
      window.player.prevX = px;
      window.player.prevY = py;
      window.player.moveProgress = 1.0;
      window.player.isMoving = false;
    }

    // Snap camera
    if (window.camera && window.game) {
      window.camera.snapTo(window.player, window.game.tileSize, this.width, this.height);
    }

    // Refresh NPCs for this map
    if (window.npcManager) {
      window.npcManager.loadNPCsForMap(mapId);
    }

    // Show Pokemon-style location banner on map transition
    if (window.uiManager) {
      window.uiManager.showLocationBanner(mapData.name, mapData.subtitle);
      if (announce) {
        window.uiManager.showDialogue(
          mapData.name,
          `${mapData.subtitle}. You tread mindfully with folded hands in service of Shri Ram.`
        );
      }
    }

    return true;
  }

  isWithinBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  getTile(x, y) {
    if (!this.isWithinBounds(x, y)) return null;
    return this.grid[y][x];
  }

  isWalkable(x, y) {
    if (!this.isWithinBounds(x, y)) return false;

    // Check NPC collision (NPCs occupy their tile)
    if (window.npcManager && window.npcManager.isOccupiedByNPC(x, y)) {
      return false;
    }

    // Check Battlefield Encounter spots collision
    if (this.currentMapId === 'field' && this.encounters) {
      const enc = this.encounters.find(e => e.x === x && e.y === y && !e.defeated);
      if (enc) {
        return false; // Interacting or walking up to them triggers battle
      }
    }

    // Check Ram Setu construction progress on beach1:
    // Unfinished bridge rows over water cannot be walked on until stones are placed!
    if (this.currentMapId === 'beach1' && y >= 19) {
      if (!this.isSetuCompleted) {
        const completedRows = Math.floor((this.stonesDelivered / this.targetStones) * 7);
        if ((y - 19) >= completedRows) {
          return false; // Open sea water; bridge has not reached here yet
        }
      }
    }

    // On beach2 (Lanka), cannot retreat north onto the ocean / Setu bridgehead:
    if (this.currentMapId === 'beach2' && y <= 0) {
      return false;
    }

    const tileType = this.grid[y][x];
    const props = window.TILE_PROPERTIES[tileType];
    return props ? props.walkable : false;
  }

  checkPortal(playerX, playerY) {
    if (!this.portals) return null;
    const portal = this.portals.find(p => p.x === playerX && p.y === playerY);
    if (portal) {
      // Gate crossing to Lanka until Ram Setu is complete
      if (this.currentMapId === 'beach1' && (portal.targetMap === 'camp2' || portal.targetMap === 'beach2')) {
        if (!this.isSetuCompleted) {
          if (window.uiManager) {
            window.uiManager.showDialogue(
              'Nal & Neel (शिल्पकार नल-नील)',
              `The sacred Ram Setu is still being built! (${this.stonesDelivered}/${this.targetStones} stones placed). Carry stones from the northern forest to us to bridge the sea to Lanka!`,
              '🌊'
            );
            window.uiManager.addLog(`Ram Setu is incomplete (${this.stonesDelivered}/${this.targetStones}). Deliver more stones!`, 'warning');
          }
          if (window.player) {
            window.player.y = 24;
            window.player.visualY = 24;
          }
          return null;
        }
      }

      // Block any attempt to retreat from Lanka back to India
      if (this.currentMapId === 'beach2' && (portal.targetMap === 'beach1' || portal.targetMap === 'camp1')) {
        if (window.uiManager) {
          window.uiManager.showDialogue(
            'Lanka Beach Guard (तट रक्षक सेनानी)',
            'The Sena has crossed into Lanka! We do not retreat across the ocean—turning back is running from the battlefield of Dharma. Forward to victory with Shri Ram! (धर्मयुद्ध से पीछे हटना वर्जित है!)',
            '⚔️'
          );
        }
        return null;
      }

      this.loadMap(portal.targetMap, portal.targetX, portal.targetY, true);
      return portal;
    }
    return null;
  }

  /**
   * Setu Bridge construction contribution to Nal & Neel
   */
  deliverStonesToSetu(amount) {
    this.stonesDelivered += amount;

    if (this.stonesDelivered >= this.targetStones) {
      this.completeRamSetu();
    } else {
      const remaining = Math.max(0, this.targetStones - this.stonesDelivered);
      if (window.uiManager) {
        window.uiManager.showDialogue(
          'Nal & Neel (शिल्पकार नल-नील)',
          `Jai Shri Ram! You delivered a sacred mountain boulder into our hands. By divine devotion and the architectural boon of Vishwakarma, the stone floats gloriously upon the ocean! (${this.stonesDelivered}/${this.targetStones} stones in place. Need ${remaining} more to span the ocean). Go back north to Mount Mahendra for the next stone!`,
          '🌊'
        );
        window.uiManager.addLog(`Offered a sacred stone for Ram Setu (${this.stonesDelivered}/${this.targetStones}).`, 'service');
      }
    }
  }

  completeRamSetu() {
    this.isSetuCompleted = true;

    // Phase transition narrative
    const grandStory = 
      '✦ THE MIRACLE OF RAM SETU IS COMPLETE! ✦\n\n' +
      'By the divine grace of Shri Ram and the relentless devotion of every Vanar and Bear, ' +
      'the sacred floating boulders placed by architects Nal & Neel now form an unbreakable bridge spanning across the vast ocean! ' +
      'The entire Sena roars with devotion: "हर हर महादेव! जय श्री राम!" ' +
      'Shri Ram and the army are ready to cross over to Lanka. Phase 2: The War has begun!';

    if (window.uiManager) {
      window.uiManager.showDialogue(
        'The Sacred Crossing (सेतु निर्माण पूर्ण)',
        grandStory,
        '✨',
        [
          {
            label: '⚔️ Advance across Ram Setu to Lanka (Phase 2)',
            action: () => {
              this.loadMap('beach2', 17, 6, true);
            }
          },
          {
            label: '🏖️ Remain on Shore for now',
            action: () => {
              window.uiManager.hideDialogue();
            }
          }
        ]
      );
      window.uiManager.addLog('✨ RAM SETU COMPLETED! The army has crossed to Lanka!', 'divine');
    }
  }
}

window.mapManager = new MapManager();
