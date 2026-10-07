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
    this.encounters = mapData.encounters || [];

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

    // Update UI HUD
    if (window.uiManager) {
      const phaseBadgeText = `Phase ${this.phase}: ${this.phase === 1 ? 'Ram Setu' : 'Lanka (The War)'} • ${mapData.name}`;
      window.uiManager.setPhaseText(phaseBadgeText);
      window.uiManager.updateCoordinates(px, py);

      if (announce) {
        window.uiManager.showDialogue(
          mapData.name,
          `${mapData.subtitle}. You tread mindfully with folded hands in service of Shri Ram.`,
          '🚩'
        );
        window.uiManager.addLog(`Entered ${mapData.name}.`, 'info');
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

    const tileType = this.grid[y][x];
    const props = window.TILE_PROPERTIES[tileType];
    return props ? props.walkable : false;
  }

  checkPortal(playerX, playerY) {
    if (!this.portals) return null;
    const portal = this.portals.find(p => p.x === playerX && p.y === playerY);
    if (portal) {
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

    if (this.stonesDelivered >= this.targetStones && !this.isSetuCompleted) {
      this.completeRamSetu();
    } else {
      const remaining = Math.max(0, this.targetStones - this.stonesDelivered);
      if (window.uiManager) {
        window.uiManager.showDialogue(
          'Nal & Neel (Divine Architects)',
          `Jai Shri Ram! You placed ${amount} sacred stones into our hands. We inscribe "RAM" upon each stone and place them upon the waves—behold, they float! (${this.stonesDelivered}/${this.targetStones} stones in place. Need ${remaining} more).`,
          '🌊'
        );
        window.uiManager.addLog(`Placed ${amount} stones for Ram Setu (${this.stonesDelivered}/${this.targetStones}).`, 'service');
      }
    }
  }

  completeRamSetu() {
    this.isSetuCompleted = true;

    // Phase transition narrative
    const grandStory = 
      '✦ THE MIRACLE OF RAM SETU IS COMPLETE! ✦\n\n' +
      'By the divine grace of Shri Ram and the relentless devotion of every Vanar and Bear, ' +
      'millions of floating stones bearing the holy name "RAM" now form an unbreakable bridge spanning across the vast ocean! ' +
      'The entire Sena roars with devotion: "हर हर महादेव! जय श्री राम!" ' +
      'Shri Ram and the army have crossed over to Lanka. Phase 2: The War has begun!';

    if (window.uiManager) {
      window.uiManager.showDialogue(
        'The Sacred Crossing (सेतु निर्माण पूर्ण)',
        grandStory,
        '✨',
        [
          {
            label: '⚔️ Advance to Lanka Camp (Phase 2)',
            action: () => {
              this.loadMap('camp2', 17, 14, true);
            }
          }
        ]
      );
      window.uiManager.addLog('✨ RAM SETU COMPLETED! The army has crossed to Lanka!', 'divine');
    }
  }
}

window.mapManager = new MapManager();
