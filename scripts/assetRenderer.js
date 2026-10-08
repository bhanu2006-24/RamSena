/**
 * RAM SENA - Modular Asset & World Renderer (scripts/assetRenderer.js)
 * Dedicated rendering engine for all game environment structures, props, and sprites.
 * Easily customizable: edit asset styles, colors, or swap to external images here
 * without modifying the core game loop!
 */

class AssetRenderer {
  constructor() {
    // Configurable styles and parameters for all game assets
    this.config = {
      // Tree parameters
      tree: {
        widthRatio: 1.25,
        heightRatio: 1.45,
        canopyShadow: '#0a2e16',
        canopyMid: '#15803d',
        canopyLight: '#22c55e',
        canopyHighlight: '#86efac',
        trunkBase: '#451a03',
        trunkBark: '#78350f',
        fruitColor: '#fbbf24'
      },

      // Coconut Palm parameters (Tall, majestic, tropical)
      palm: {
        widthRatio: 1.85,
        heightRatio: 2.35,
        trunkColor: '#78350f',
        trunkRidge: '#92400e',
        frondDark: '#14532d',
        frondLight: '#22c55e',
        frondHighlight: '#86efac',
        coconutColor: '#451a03'
      },

      // Royal Pavilion & Camp Tent parameters (Spacious, dignified, Vedic army pavilions)
      tent: {
        widthRatio: 1.35,
        heightRatio: 1.28,
        canvasMain: '#c2410c',
        canvasStripe: '#ea580c',
        canvasGold: '#f59e0b',
        entranceInterior: '#1c1917',
        finialGold: '#fef08a',
        ropeColor: '#fef3c7'
      },

      // Sacred Yajna Fire parameters
      yajna: {
        widthRatio: 1.15,
        heightRatio: 1.18,
        brickBase: '#78350f',
        brickTop: '#9a3412',
        woodColor: '#292524',
        flameCore: '#fef08a',
        flameMid: '#ea580c',
        flameOuter: '#dc2626',
        glowAura: 'rgba(249, 115, 22, 0.45)',
        emberColor: 'rgba(254, 240, 138, 0.9)'
      },

      // Sacred Boulder parameters (Rugged, chiseled mountain granite)
      rock: {
        widthRatio: 0.92,
        heightRatio: 0.88,
        graniteBase: '#475569',
        graniteShadow: '#334155',
        graniteHighlight: '#94a3b8',
        creviceColor: '#1e293b',
        sacredGlow: 'rgba(245, 158, 11, 0.2)'
      },

      // Dharma Dhwaja Flag parameters
      flag: {
        staffColor: '#78350f',
        bannerSaffron: '#ea580c',
        goldTrim: '#fef08a',
        finial: '#f59e0b'
      },

      // Ocean Water parameters
      water: {
        deepBlue: '#1e3a8a',
        midBlue: '#2563eb',
        foamColor: 'rgba(191, 219, 254, 0.45)'
      },

      // Terrain Colors
      terrain: {
        grass1: '#264e22',
        grass2: '#20421d',
        grassTuft: 'rgba(74, 222, 128, 0.22)',
        path1: '#5c4627',
        path2: '#523d21',
        pathPebble: 'rgba(217, 119, 6, 0.22)',
        sand1: '#c29d59',
        sand2: '#b8924f'
      }
    };
  }

  // ===================================================================
  // 0. BASE GROUND RENDERER (UNIFIED SCENERY - NO ODD COLORED BOXES)
  // ===================================================================
  drawBaseGround(ctx, sx, sy, ts, col = 0, row = 0, mapId = 'camp1') {
    // If on beach map and in the sandy shoreline area: draw sand
    if (mapId === 'beach1') {
      if (row >= 5) {
        this.drawSand(ctx, sx, sy, ts, col, row);
        return;
      }
    } else if (mapId === 'beach2') {
      this.drawSand(ctx, sx, sy, ts, col, row);
      return;
    }
    // Default natural grass terrain for all other maps & areas
    this.drawGrass(ctx, sx, sy, ts, col, row);
  }

  // ===================================================================
  // 1. TALL ANCIENT FOREST TREE (GBA Pokemon Style Dense Canopy)
  // ===================================================================
  drawTree(ctx, sx, sy, ts, animClock = 0, col = 0, row = 0) {
    const cfg = this.config.tree;
    const cx = sx + ts / 2;
    const groundY = sy + ts * 0.94;
    const sway = Math.sin(animClock * 0.002 + col * 1.5 + row) * (ts * 0.025);

    const drawW = ts * cfg.widthRatio;
    const drawH = ts * cfg.heightRatio;
    const topY = groundY - drawH;

    // 1. Soft Natural Ground Drop Shadow
    ctx.beginPath();
    ctx.ellipse(cx, groundY, ts * 0.46, ts * 0.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
    ctx.fill();

    // 2. Trunk with root flare
    ctx.fillStyle = cfg.trunkBase;
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.18, groundY);
    ctx.lineTo(cx - ts * 0.1, groundY - drawH * 0.44);
    ctx.lineTo(cx + ts * 0.1, groundY - drawH * 0.44);
    ctx.lineTo(cx + ts * 0.18, groundY);
    ctx.closePath();
    ctx.fill();

    // Trunk Bark Texture
    ctx.fillStyle = cfg.trunkBark;
    ctx.fillRect(cx - ts * 0.05, groundY - drawH * 0.4, ts * 0.08, drawH * 0.36);

    // 3. Dense Multi-Tiered Foliage Canopy
    const foliageCenterY = topY + drawH * 0.38;

    // Layer A: Deep Shadow Base
    ctx.fillStyle = cfg.canopyShadow;
    ctx.beginPath();
    ctx.arc(cx - drawW * 0.24 + sway * 0.5, foliageCenterY + drawH * 0.08, drawW * 0.3, 0, Math.PI * 2);
    ctx.arc(cx + drawW * 0.24 + sway * 0.5, foliageCenterY + drawH * 0.08, drawW * 0.3, 0, Math.PI * 2);
    ctx.arc(cx + sway * 0.5, foliageCenterY - drawH * 0.12, drawW * 0.38, 0, Math.PI * 2);
    ctx.fill();

    // Layer B: Mid Lush Green
    ctx.fillStyle = cfg.canopyMid;
    ctx.beginPath();
    ctx.arc(cx - drawW * 0.18 + sway, foliageCenterY + drawH * 0.04, drawW * 0.28, 0, Math.PI * 2);
    ctx.arc(cx + drawW * 0.18 + sway, foliageCenterY + drawH * 0.04, drawW * 0.28, 0, Math.PI * 2);
    ctx.arc(cx + sway, foliageCenterY - drawH * 0.14, drawW * 0.34, 0, Math.PI * 2);
    ctx.fill();

    // Layer C: Sunlit Canopy Clusters
    ctx.fillStyle = cfg.canopyLight;
    ctx.beginPath();
    ctx.arc(cx - drawW * 0.1 + sway, foliageCenterY - drawH * 0.1, drawW * 0.22, 0, Math.PI * 2);
    ctx.arc(cx + drawW * 0.12 + sway, foliageCenterY - drawH * 0.06, drawW * 0.2, 0, Math.PI * 2);
    ctx.arc(cx + sway, foliageCenterY - drawH * 0.22, drawW * 0.24, 0, Math.PI * 2);
    ctx.fill();

    // Layer D: Bright Leaf Highlights
    ctx.fillStyle = cfg.canopyHighlight;
    ctx.beginPath();
    ctx.arc(cx - drawW * 0.05 + sway, foliageCenterY - drawH * 0.25, drawW * 0.13, 0, Math.PI * 2);
    ctx.arc(cx + drawW * 0.07 + sway, foliageCenterY - drawH * 0.18, drawW * 0.11, 0, Math.PI * 2);
    ctx.fill();

    // Wild Fruits (Mangoes / Berries)
    if ((col + row) % 2 === 0) {
      ctx.fillStyle = cfg.fruitColor;
      ctx.beginPath();
      ctx.arc(cx - drawW * 0.19 + sway, foliageCenterY - drawH * 0.02, 5, 0, Math.PI * 2);
      ctx.arc(cx + drawW * 0.2 + sway, foliageCenterY + drawH * 0.04, 5, 0, Math.PI * 2);
      ctx.arc(cx + drawW * 0.02 + sway, foliageCenterY - drawH * 0.15, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ===================================================================
  // 2. TALL MAJESTIC COCONUT PALM (TOWERS ABOVE CHARACTERS, TROPICAL FRONDS)
  // ===================================================================
  drawCoconutPalm(ctx, sx, sy, ts, animClock = 0, col = 0, row = 0) {
    const cfg = this.config.palm;
    const cx = sx + ts / 2;
    const baseCy = sy + ts * 0.94;
    const sway = Math.sin(animClock * 0.0022 + col * 2 + row) * (ts * 0.06);

    // 1. Soft Natural Ground Drop Shadow
    ctx.beginPath();
    ctx.ellipse(cx, baseCy, ts * 0.44, ts * 0.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.fill();

    // 2. Tall Curved Trunk Rising High Above the Tile (2.3x Tile Height)
    const palmHeight = ts * cfg.heightRatio;
    const crownX = cx + sway;
    const crownY = baseCy - palmHeight;

    // Curved trunk line
    ctx.strokeStyle = cfg.trunkColor;
    ctx.lineWidth = ts * 0.14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, baseCy);
    ctx.quadraticCurveTo(cx - ts * 0.22, baseCy - palmHeight * 0.45, crownX, crownY);
    ctx.stroke();

    // Segmented Trunk Ridges
    ctx.strokeStyle = cfg.trunkRidge;
    ctx.lineWidth = 3;
    for (let i = 1; i <= 6; i++) {
      const t = i / 7;
      const ty = baseCy - (palmHeight * t);
      const tx = cx - (ts * 0.22 * Math.sin(t * Math.PI)) * 0.8 + (sway * t);
      ctx.beginPath();
      ctx.moveTo(tx - ts * 0.08, ty);
      ctx.lineTo(tx + ts * 0.08, ty - 4);
      ctx.stroke();
    }

    // 3. Cluster of Fresh Coconuts at Crown
    ctx.fillStyle = cfg.coconutColor;
    ctx.beginPath();
    ctx.arc(crownX - 7, crownY + 8, 6.5, 0, Math.PI * 2);
    ctx.arc(crownX + 7, crownY + 8, 6.5, 0, Math.PI * 2);
    ctx.arc(crownX, crownY + 14, 6.5, 0, Math.PI * 2);
    ctx.arc(crownX - 3, crownY + 17, 6, 0, Math.PI * 2);
    ctx.fill();

    // 4. Broad Sweeping Tropical Palm Fronds
    const frondLength = ts * 0.95;
    const frondAngles = [
      -2.8, -2.3, -1.8, -1.2, -0.6, -0.1, 0.4, 0.9
    ];

    frondAngles.forEach((ang, idx) => {
      const tipX = crownX + Math.cos(ang) * frondLength + sway * 0.6;
      const tipY = crownY + Math.sin(ang) * (frondLength * 0.65) + 12;
      const midX = crownX + Math.cos(ang) * (frondLength * 0.55);
      const midY = crownY - ts * 0.25 + Math.sin(ang) * (frondLength * 0.3);

      // Main Stem
      ctx.strokeStyle = idx % 2 === 0 ? cfg.frondDark : cfg.frondLight;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(crownX, crownY);
      ctx.quadraticCurveTo(midX, midY, tipX, tipY);
      ctx.stroke();

      // Leaf Leaflets
      ctx.strokeStyle = cfg.frondLight;
      ctx.lineWidth = 2.2;
      for (let s = 0.25; s <= 0.9; s += 0.15) {
        const lx = crownX + (midX - crownX) * s;
        const ly = crownY + (midY - crownY) * s;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + Math.sin(ang) * 9, ly + Math.cos(ang) * 9);
        ctx.stroke();
      }
    });
  }

  // ===================================================================
  // 3. GRAND ROYAL MILITARY PAVILION / CAMP TENT
  // ===================================================================
  drawTent(ctx, sx, sy, ts, animClock = 0, col = 0, row = 0) {
    const cfg = this.config.tent;
    const cx = sx + ts / 2;
    const baseCy = sy + ts * 0.94;
    const w = ts * cfg.widthRatio;
    const h = ts * cfg.heightRatio;
    const topY = baseCy - h;

    // 1. Broad Natural Ground Drop Shadow
    ctx.beginPath();
    ctx.ellipse(cx, baseCy, w * 0.5, ts * 0.22, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fill();

    // 2. Main Saffron Canvas Canopy
    ctx.fillStyle = cfg.canvasMain;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.48, baseCy);
    ctx.lineTo(cx, topY);
    ctx.lineTo(cx + w * 0.48, baseCy);
    ctx.closePath();
    ctx.fill();

    // 3. Side Canopy Flaps (Depth shading)
    ctx.fillStyle = cfg.canvasStripe;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.48, baseCy);
    ctx.lineTo(cx, topY);
    ctx.lineTo(cx - w * 0.18, baseCy);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + w * 0.48, baseCy);
    ctx.lineTo(cx, topY);
    ctx.lineTo(cx + w * 0.18, baseCy);
    ctx.closePath();
    ctx.fill();

    // 4. Golden Center Royal Stripe & Crest
    ctx.fillStyle = cfg.canvasGold;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.14, baseCy);
    ctx.lineTo(cx, topY);
    ctx.lineTo(cx + w * 0.14, baseCy);
    ctx.closePath();
    ctx.fill();

    // 5. Arched Entrance Draped Curtain
    ctx.fillStyle = cfg.entranceInterior;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.16, baseCy);
    ctx.quadraticCurveTo(cx, baseCy - h * 0.5, cx + w * 0.16, baseCy);
    ctx.closePath();
    ctx.fill();

    // 6. Brass Finial Trident / Spearhead on Roof Ridge
    ctx.fillStyle = cfg.finialGold;
    ctx.beginPath();
    ctx.arc(cx, topY - 3, 5, 0, Math.PI * 2);
    ctx.fill();

    // 7. Pegged Guy Ropes
    ctx.strokeStyle = cfg.ropeColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.42, baseCy - h * 0.18);
    ctx.lineTo(cx - w * 0.56, baseCy);
    ctx.moveTo(cx + w * 0.42, baseCy - h * 0.18);
    ctx.lineTo(cx + w * 0.56, baseCy);
    ctx.stroke();
  }

  // ===================================================================
  // 4. SACRED YAJNA ALTAR & BLAZING VEDIC FLAMES
  // ===================================================================
  drawYajnaAltar(ctx, sx, sy, ts, animClock = 0, col = 0) {
    const cfg = this.config.yajna;
    const cx = sx + ts / 2;
    const hearthY = sy + ts * 0.72;

    // 1. Terracotta/Stone Altar Kunda (Stepped Vedic Hearth)
    ctx.fillStyle = cfg.brickBase;
    ctx.fillRect(cx - ts * 0.44, hearthY + ts * 0.08, ts * 0.88, ts * 0.22);
    ctx.fillStyle = cfg.brickTop;
    ctx.fillRect(cx - ts * 0.38, hearthY + ts * 0.04, ts * 0.76, ts * 0.08);

    // 2. Crossed Sacred Samidha Logs
    ctx.strokeStyle = cfg.woodColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.26, hearthY + ts * 0.12);
    ctx.lineTo(cx + ts * 0.26, hearthY);
    ctx.moveTo(cx + ts * 0.26, hearthY + ts * 0.12);
    ctx.lineTo(cx - ts * 0.26, hearthY);
    ctx.stroke();

    // 3. Ambient Radiant Glow Aura
    const glow = ctx.createRadialGradient(cx, hearthY - ts * 0.1, ts * 0.05, cx, hearthY - ts * 0.1, ts * 0.85);
    glow.addColorStop(0, cfg.glowAura);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, hearthY - ts * 0.1, ts * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // 4. Blazing Organic Flames
    const flick1 = Math.sin(animClock * 0.015 + col) * (ts * 0.05);
    const flick2 = Math.cos(animClock * 0.012 + col) * (ts * 0.04);

    // Outer Crimson Flame
    ctx.fillStyle = cfg.flameOuter;
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.28, hearthY + ts * 0.04);
    ctx.quadraticCurveTo(cx - ts * 0.18, hearthY - ts * 0.28, cx + flick1, hearthY - ts * 0.58);
    ctx.quadraticCurveTo(cx + ts * 0.18, hearthY - ts * 0.28, cx + ts * 0.28, hearthY + ts * 0.04);
    ctx.closePath();
    ctx.fill();

    // Middle Saffron Flame
    ctx.fillStyle = cfg.flameMid;
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.19, hearthY + ts * 0.04);
    ctx.quadraticCurveTo(cx - ts * 0.12, hearthY - ts * 0.22, cx + flick2, hearthY - ts * 0.44);
    ctx.quadraticCurveTo(cx + ts * 0.12, hearthY - ts * 0.22, cx + ts * 0.19, hearthY + ts * 0.04);
    ctx.closePath();
    ctx.fill();

    // Inner Radiant Golden Core
    ctx.fillStyle = cfg.flameCore;
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.11, hearthY + ts * 0.04);
    ctx.quadraticCurveTo(cx, hearthY - ts * 0.16, cx, hearthY - ts * 0.3);
    ctx.quadraticCurveTo(cx, hearthY - ts * 0.16, cx + ts * 0.11, hearthY + ts * 0.04);
    ctx.closePath();
    ctx.fill();

    // 5. Rising Sacred Embers
    for (let i = 0; i < 4; i++) {
      const sparkAge = (animClock * 0.0016 + i * 0.25) % 1;
      const sparkY = hearthY - ts * 0.2 - (sparkAge * ts * 0.55);
      const sparkX = cx + Math.sin(animClock * 0.007 + i * 2) * (ts * 0.2);
      ctx.fillStyle = `rgba(254, 240, 138, ${1 - sparkAge})`;
      ctx.fillRect(sparkX, sparkY, 3, 3);
    }
  }

  // ===================================================================
  // 5. SACRED MOUNTAIN BOULDER (NATURAL CHISELED ROCK EMBEDDED IN GROUND)
  // ===================================================================
  drawRock(ctx, sx, sy, ts, col = 0, row = 0) {
    const cfg = this.config.rock;
    const cx = sx + ts / 2;
    const groundY = sy + ts * 0.88;
    const w = ts * cfg.widthRatio;
    const h = ts * cfg.heightRatio;
    const cy = groundY - h * 0.48;

    // 1. Soft Ground Drop Shadow
    ctx.beginPath();
    ctx.ellipse(cx, groundY, w * 0.46, ts * 0.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
    ctx.fill();

    // 2. Chiseled Solid Granite Boulder Facets
    ctx.fillStyle = cfg.graniteBase;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.42, groundY);
    ctx.lineTo(cx - w * 0.45, cy);
    ctx.lineTo(cx - w * 0.25, cy - h * 0.45);
    ctx.lineTo(cx + w * 0.18, cy - h * 0.48);
    ctx.lineTo(cx + w * 0.44, cy - h * 0.1);
    ctx.lineTo(cx + w * 0.38, groundY);
    ctx.closePath();
    ctx.fill();

    // 3. Shaded Lower & Right Facets (Depth)
    ctx.fillStyle = cfg.graniteShadow;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.1, cy);
    ctx.lineTo(cx + w * 0.18, cy - h * 0.48);
    ctx.lineTo(cx + w * 0.44, cy - h * 0.1);
    ctx.lineTo(cx + w * 0.38, groundY);
    ctx.lineTo(cx - w * 0.15, groundY);
    ctx.closePath();
    ctx.fill();

    // 4. Highlighted Sunlit Facets
    ctx.fillStyle = cfg.graniteHighlight;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.45, cy);
    ctx.lineTo(cx - w * 0.25, cy - h * 0.45);
    ctx.lineTo(cx + w * 0.18, cy - h * 0.48);
    ctx.lineTo(cx - w * 0.05, cy - h * 0.15);
    ctx.closePath();
    ctx.fill();

    // 5. Crevice fissures
    ctx.strokeStyle = cfg.creviceColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.18, cy - h * 0.25);
    ctx.lineTo(cx - w * 0.05, cy + h * 0.1);
    ctx.lineTo(cx + w * 0.12, cy + h * 0.18);
    ctx.stroke();

    // 6. Sacred Golden Bhakti Aura (for Ram Setu stones)
    ctx.fillStyle = cfg.sacredGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.42, 0, Math.PI * 2);
    ctx.fill();
  }

  // ===================================================================
  // 6. DHARMA DHWAJA (SAFFRON BANNER ON NATURAL GROUND)
  // ===================================================================
  drawFlag(ctx, sx, sy, ts, animClock = 0) {
    const cfg = this.config.flag;
    const poleX = sx + ts * 0.32;
    const baseCy = sy + ts * 0.94;
    const wave = Math.sin(animClock * 0.006) * 5;

    // 1. Soft Natural Ground Drop Shadow
    ctx.beginPath();
    ctx.ellipse(poleX, baseCy, ts * 0.22, ts * 0.1, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.fill();

    // 2. Wooden Staff Pole
    ctx.strokeStyle = cfg.staffColor;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(poleX, baseCy);
    ctx.lineTo(poleX, sy + ts * 0.08);
    ctx.stroke();

    // 3. Brass Finial Spearhead
    ctx.fillStyle = cfg.finial;
    ctx.beginPath();
    ctx.arc(poleX, sy + ts * 0.06, 5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Saffron Triangular Dharma Dhwaja
    ctx.fillStyle = cfg.bannerSaffron;
    ctx.beginPath();
    ctx.moveTo(poleX + 2, sy + ts * 0.1);
    ctx.quadraticCurveTo(poleX + ts * 0.35, sy + ts * 0.15 + wave * 0.5, poleX + ts * 0.65 + wave, sy + ts * 0.26);
    ctx.quadraticCurveTo(poleX + ts * 0.35, sy + ts * 0.38 - wave * 0.5, poleX + 2, sy + ts * 0.46);
    ctx.closePath();
    ctx.fill();

    // Gold Trim Edge
    ctx.strokeStyle = cfg.goldTrim;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // ===================================================================
  // 7. NATURAL FIELD BLOSSOMS
  // ===================================================================
  drawFlowers(ctx, sx, sy, ts, col = 0, row = 0) {
    this.drawGrass(ctx, sx, sy, ts, col, row);

    const flowers = [
      { x: sx + ts * 0.26, y: sy + ts * 0.32, color: '#f472b6', size: ts * 0.08 },
      { x: sx + ts * 0.74, y: sy + ts * 0.46, color: '#fb7185', size: ts * 0.09 },
      { x: sx + ts * 0.46, y: sy + ts * 0.76, color: '#fbcfe8', size: ts * 0.07 }
    ];

    flowers.forEach(f => {
      // Petals
      ctx.fillStyle = f.color;
      for (let i = 0; i < 5; i++) {
        const ang = (i * 2 * Math.PI) / 5;
        ctx.beginPath();
        ctx.arc(f.x + Math.cos(ang) * (f.size * 0.75), f.y + Math.sin(ang) * (f.size * 0.75), f.size * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
      // Golden Pollen Center
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // ===================================================================
  // 8. OCEAN WATER & WAVES
  // ===================================================================
  drawWater(ctx, sx, sy, ts, animClock = 0, col = 0, row = 0) {
    const cfg = this.config.water;
    const waveShift = Math.sin((animClock * 0.003) + (col * 0.6) + (row * 0.9)) * 6;

    const grad = ctx.createLinearGradient(sx, sy, sx, sy + ts);
    grad.addColorStop(0, cfg.midBlue);
    grad.addColorStop(1, cfg.deepBlue);
    ctx.fillStyle = grad;
    ctx.fillRect(sx, sy, ts, ts);

    // Wave foam ripples
    ctx.fillStyle = cfg.foamColor;
    ctx.fillRect(sx + ts * 0.1 + waveShift, sy + ts * 0.35, ts * 0.65, 3.5);
    ctx.fillRect(sx + ts * 0.3 - waveShift * 0.5, sy + ts * 0.72, ts * 0.55, 3);

    // Specular sunlight glint
    const glint = Math.sin(animClock * 0.005 + col + row);
    if (glint > 0.75) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fillRect(sx + ts * 0.5 + waveShift * 0.3, sy + ts * 0.5, 3.5, 3.5);
    }
  }

  // ===================================================================
  // 9. TERRAIN GROUND TILES
  // ===================================================================
  drawGrass(ctx, sx, sy, ts, col = 0, row = 0) {
    const cfg = this.config.terrain;
    ctx.fillStyle = (col + row) % 2 === 0 ? cfg.grass2 : cfg.grass1;
    ctx.fillRect(sx, sy, ts, ts);

    // Subtle grass blades
    ctx.fillStyle = cfg.grassTuft;
    ctx.fillRect(sx + ts * 0.22, sy + ts * 0.38, 2, 6);
    ctx.fillRect(sx + ts * 0.26, sy + ts * 0.34, 2, 7);
    ctx.fillRect(sx + ts * 0.68, sy + ts * 0.65, 2, 6);
    ctx.fillRect(sx + ts * 0.72, sy + ts * 0.61, 2, 8);
  }

  drawPath(ctx, sx, sy, ts, col = 0, row = 0) {
    const cfg = this.config.terrain;
    ctx.fillStyle = (col + row) % 2 === 0 ? cfg.path2 : cfg.path1;
    ctx.fillRect(sx, sy, ts, ts);

    ctx.fillStyle = cfg.pathPebble;
    ctx.fillRect(sx + ts * 0.42, sy + ts * 0.42, 5, 4);
    ctx.fillRect(sx + ts * 0.72, sy + ts * 0.25, 4, 3);
  }

  drawSand(ctx, sx, sy, ts, col = 0, row = 0) {
    const cfg = this.config.terrain;
    ctx.fillStyle = (col + row) % 3 === 0 ? cfg.sand2 : cfg.sand1;
    ctx.fillRect(sx, sy, ts, ts);

    if ((col + row) % 2 === 0) {
      ctx.fillStyle = 'rgba(254, 243, 199, 0.22)';
      ctx.fillRect(sx + ts * 0.35, sy + ts * 0.35, 3, 3);
    }
  }

  // ===================================================================
  // 10. LARGE, CRISP CHARACTER SPRITE RENDERING (NO YELLOW DOTS!)
  // ===================================================================
  drawCharacter(ctx, img, sx, sy, ts, bobY = 0, direction = 'down', isDivine = false, auraColor = null, isSheet = null) {
    const cx = sx + ts / 2;
    const baseCy = sy + ts * 0.9;

    // 1. Natural Ground Drop Shadow
    ctx.beginPath();
    ctx.ellipse(cx, baseCy, ts * 0.4, ts * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fill();

    // 2. Radiant Divine/Leader Aura (Soft halo glow gradient at feet)
    if (auraColor) {
      const auraGrad = ctx.createRadialGradient(cx, sy + ts / 2 + bobY, ts * 0.12, cx, sy + ts / 2 + bobY, ts * 0.85);
      auraGrad.addColorStop(0, auraColor);
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, sy + ts / 2 + bobY, ts * 0.85, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Draw Character Sprite
    if (img && img.complete && img.naturalWidth) {
      // Detect 2x2 directional sheet (Vanar and Bear sprites)
      const isDirectionalSheet = (isSheet !== null)
        ? isSheet
        : (img.src && (img.src.includes('vanar.png') || img.src.includes('bear.png') || img.src.includes('bhaluu') || img.src.includes('vanarsena')));

      if (isDirectionalSheet) {
        // 2x2 directional sprite sheet:
        // Top-Left (0, 0): Facing Down (Front)
        // Top-Right (sw, 0): Facing Up (Back)
        // Bottom-Left (0, sh): Facing Left
        // Bottom-Right (sw, sh): Facing Right
        const sw = img.naturalWidth / 2;
        const sh = img.naturalHeight / 2;
        let sx_src = 0;
        let sy_src = 0;

        if (direction === 'up') {
          sx_src = sw;
          sy_src = 0; // Top-Right: Facing Up / Back
        } else if (direction === 'left') {
          sx_src = 0;
          sy_src = sh; // Bottom-Left: Facing Left
        } else if (direction === 'right') {
          sx_src = sw;
          sy_src = sh; // Bottom-Right: Facing Right
        } else {
          // 'down' or default
          sx_src = 0;
          sy_src = 0; // Top-Left: Facing Down / Front
        }

        const drawH = ts * 1.25; // Large, prominent, heroic
        const drawW = drawH;
        const posX = cx - drawW / 2;
        const posY = sy + ts - drawH + bobY - 2;

        ctx.drawImage(img, sx_src, sy_src, sw, sh, posX, posY, drawW, drawH);
      } else {
        // Single full-character portrait/sprite (Shri Ram, Lakshman, Hanuman, Sugreev, etc.)
        const drawH = ts * 1.25;
        const aspect = img.naturalWidth / img.naturalHeight;
        const drawW = drawH * aspect;
        const posX = cx - drawW / 2;
        const posY = sy + ts - drawH + bobY - 2;

        ctx.save();
        // Mirror horizontally if facing left
        if (direction === 'left') {
          ctx.translate(posX + drawW, posY);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, drawW, drawH);
        } else {
          ctx.drawImage(img, posX, posY, drawW, drawH);
        }
        ctx.restore();
      }
    } else {
      // Fallback avatar block
      ctx.fillStyle = '#b45309';
      ctx.fillRect(cx - ts * 0.3, sy + ts * 0.2 + bobY, ts * 0.6, ts * 0.7);
    }
  }

  // ===================================================================
  // 11. BATTLEFIELD ENCOUNTER DEMON SPRITE
  // ===================================================================
  drawDemonWarrior(ctx, sx, sy, ts, enc, animClock = 0) {
    const cx = sx + ts / 2;
    const cy = sy + ts / 2;

    // Ominous Crimson Aura
    const auraGrad = ctx.createRadialGradient(cx, cy, ts * 0.1, cx, cy, ts * 0.8);
    auraGrad.addColorStop(0, 'rgba(225, 29, 72, 0.5)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, ts * 0.75, 0, Math.PI * 2);
    ctx.fill();

    // Demon figure silhouette / armor
    const bob = Math.sin(animClock * 0.005) * 3;
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.ellipse(cx, cy + ts * 0.35, ts * 0.32, ts * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark armor torso
    ctx.fillStyle = '#4c0519';
    ctx.fillRect(cx - ts * 0.22, cy - ts * 0.2 + bob, ts * 0.44, ts * 0.45);

    // Glowing Crimson Eyes
    ctx.fillStyle = '#fb7185';
    ctx.fillRect(cx - ts * 0.12, cy - ts * 0.08 + bob, 5, 4);
    ctx.fillRect(cx + ts * 0.06, cy - ts * 0.08 + bob, 5, 4);

    // Horns
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.15, cy - ts * 0.2 + bob);
    ctx.lineTo(cx - ts * 0.25, cy - ts * 0.38 + bob);
    ctx.moveTo(cx + ts * 0.15, cy - ts * 0.2 + bob);
    ctx.lineTo(cx + ts * 0.25, cy - ts * 0.38 + bob);
    ctx.stroke();
  }
}

// Global instance available across scripts
window.assetRenderer = new AssetRenderer();
