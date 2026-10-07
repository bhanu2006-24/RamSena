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
        widthRatio: 1.15,
        heightRatio: 1.35,
        canopyShadow: '#0f381e',
        canopyMid: '#15803d',
        canopyLight: '#22c55e',
        canopyHighlight: '#86efac',
        trunkBase: '#451a03',
        trunkBark: '#78350f',
        fruitColor: '#fbbf24'
      },

      // Coconut Palm parameters
      palm: {
        widthRatio: 1.1,
        heightRatio: 1.4,
        trunkColor: '#78350f',
        trunkRidge: '#92400e',
        frondDark: '#14532d',
        frondLight: '#22c55e',
        coconutColor: '#451a03'
      },

      // Royal Pavilion & Camp Tent parameters
      tent: {
        widthRatio: 1.25,
        heightRatio: 1.15,
        canvasMain: '#b45309',
        canvasStripe: '#d97706',
        canvasGold: '#f59e0b',
        entranceInterior: '#291e10',
        finialGold: '#fef08a',
        ropeColor: '#fef3c7'
      },

      // Sacred Yajna Fire parameters
      yajna: {
        widthRatio: 1.1,
        heightRatio: 1.15,
        brickBase: '#78350f',
        brickTop: '#9a3412',
        woodColor: '#292524',
        flameCore: '#fef08a',
        flameMid: '#ea580c',
        flameOuter: '#dc2626',
        glowAura: 'rgba(249, 115, 22, 0.55)',
        emberColor: 'rgba(254, 240, 138, 0.9)'
      },

      // Sacred Boulder parameters
      rock: {
        widthRatio: 0.95,
        heightRatio: 0.88,
        graniteBase: '#475569',
        graniteShadow: '#334155',
        graniteHighlight: '#94a3b8',
        sacredGlow: 'rgba(245, 158, 11, 0.25)'
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
        grassTuft: 'rgba(74, 222, 128, 0.25)',
        path1: '#5c4627',
        path2: '#523d21',
        pathPebble: 'rgba(217, 119, 6, 0.22)',
        sand1: '#c29d59',
        sand2: '#b8924f',
        campCarpet: '#6b2512',
        campCarpetBorder: '#b45309'
      }
    };
  }

  // ===================================================================
  // 1. TALL ANCIENT FOREST TREE (GBA Pokemon Style Canopy)
  // ===================================================================
  drawTree(ctx, sx, sy, ts, animClock = 0, col = 0, row = 0) {
    const cfg = this.config.tree;
    const cx = sx + ts / 2;
    const groundY = sy + ts * 0.92;
    const sway = Math.sin(animClock * 0.002 + col * 1.5 + row) * (ts * 0.025);

    const drawW = ts * cfg.widthRatio;
    const drawH = ts * cfg.heightRatio;
    const topY = groundY - drawH;

    // 1. Drop Shadow
    ctx.beginPath();
    ctx.ellipse(cx, groundY, ts * 0.44, ts * 0.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
    ctx.fill();

    // 2. Trunk with root flare
    ctx.fillStyle = cfg.trunkBase;
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.16, groundY);
    ctx.lineTo(cx - ts * 0.09, groundY - drawH * 0.42);
    ctx.lineTo(cx + ts * 0.09, groundY - drawH * 0.42);
    ctx.lineTo(cx + ts * 0.16, groundY);
    ctx.closePath();
    ctx.fill();

    // Trunk Bark Highlight
    ctx.fillStyle = cfg.trunkBark;
    ctx.fillRect(cx - ts * 0.05, groundY - drawH * 0.38, ts * 0.07, drawH * 0.35);

    // 3. Dense Multi-Tiered Foliage Canopy
    const foliageCenterY = topY + drawH * 0.38;

    // Layer A: Deep Shadow Base
    ctx.fillStyle = cfg.canopyShadow;
    ctx.beginPath();
    ctx.arc(cx - drawW * 0.22 + sway * 0.5, foliageCenterY + drawH * 0.08, drawW * 0.28, 0, Math.PI * 2);
    ctx.arc(cx + drawW * 0.22 + sway * 0.5, foliageCenterY + drawH * 0.08, drawW * 0.28, 0, Math.PI * 2);
    ctx.arc(cx + sway * 0.5, foliageCenterY - drawH * 0.12, drawW * 0.36, 0, Math.PI * 2);
    ctx.fill();

    // Layer B: Mid Lush Green
    ctx.fillStyle = cfg.canopyMid;
    ctx.beginPath();
    ctx.arc(cx - drawW * 0.16 + sway, foliageCenterY + drawH * 0.04, drawW * 0.26, 0, Math.PI * 2);
    ctx.arc(cx + drawW * 0.16 + sway, foliageCenterY + drawH * 0.04, drawW * 0.26, 0, Math.PI * 2);
    ctx.arc(cx + sway, foliageCenterY - drawH * 0.14, drawW * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Layer C: Sunlit Canopy Clusters
    ctx.fillStyle = cfg.canopyLight;
    ctx.beginPath();
    ctx.arc(cx - drawW * 0.1 + sway, foliageCenterY - drawH * 0.1, drawW * 0.2, 0, Math.PI * 2);
    ctx.arc(cx + drawW * 0.12 + sway, foliageCenterY - drawH * 0.06, drawW * 0.18, 0, Math.PI * 2);
    ctx.arc(cx + sway, foliageCenterY - drawH * 0.22, drawW * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Layer D: Bright Leaf Tips
    ctx.fillStyle = cfg.canopyHighlight;
    ctx.beginPath();
    ctx.arc(cx - drawW * 0.05 + sway, foliageCenterY - drawH * 0.24, drawW * 0.12, 0, Math.PI * 2);
    ctx.arc(cx + drawW * 0.06 + sway, foliageCenterY - drawH * 0.18, drawW * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Wild Fruits (Mangoes / Berries)
    if ((col + row) % 2 === 0) {
      ctx.fillStyle = cfg.fruitColor;
      ctx.beginPath();
      ctx.arc(cx - drawW * 0.18 + sway, foliageCenterY - drawH * 0.02, 4.5, 0, Math.PI * 2);
      ctx.arc(cx + drawW * 0.19 + sway, foliageCenterY + drawH * 0.04, 4.5, 0, Math.PI * 2);
      ctx.arc(cx + drawW * 0.02 + sway, foliageCenterY - drawH * 0.15, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ===================================================================
  // 2. COCONUT PALM
  // ===================================================================
  drawCoconutPalm(ctx, sx, sy, ts, animClock = 0, col = 0) {
    const cfg = this.config.palm;
    const cx = sx + ts / 2;
    const baseCy = sy + ts * 0.92;
    const sway = Math.sin(animClock * 0.0025 + col * 2) * (ts * 0.035);

    // Drop Shadow
    ctx.beginPath();
    ctx.ellipse(cx, baseCy, ts * 0.38, ts * 0.16, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.fill();

    // Curving Segmented Trunk
    const crownX = cx + sway;
    const crownY = sy + ts * 0.18;

    ctx.strokeStyle = cfg.trunkColor;
    ctx.lineWidth = ts * 0.15;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, baseCy);
    ctx.quadraticCurveTo(cx - ts * 0.15, sy + ts * 0.48, crownX, crownY);
    ctx.stroke();

    // Trunk Segment Ridges
    ctx.strokeStyle = cfg.trunkRidge;
    ctx.lineWidth = 2.5;
    for (let i = 1; i <= 4; i++) {
      const ty = baseCy - (i * ts * 0.17);
      ctx.beginPath();
      ctx.moveTo(cx - ts * 0.09, ty);
      ctx.lineTo(cx + ts * 0.05, ty - 3);
      ctx.stroke();
    }

    // Coconuts
    ctx.fillStyle = cfg.coconutColor;
    ctx.beginPath();
    ctx.arc(crownX - 5, crownY + 6, 5, 0, Math.PI * 2);
    ctx.arc(crownX + 5, crownY + 6, 5, 0, Math.PI * 2);
    ctx.arc(crownX, crownY + 11, 5, 0, Math.PI * 2);
    ctx.fill();

    // Arching Tropical Fronds
    ctx.strokeStyle = cfg.frondDark;
    ctx.lineWidth = 4.5;
    const angles = [-2.5, -1.9, -1.2, -0.6, 0.2, 0.7];
    angles.forEach(ang => {
      ctx.beginPath();
      ctx.moveTo(crownX, crownY);
      const endX = crownX + Math.cos(ang) * (ts * 0.52);
      const endY = crownY + Math.sin(ang) * (ts * 0.42) + 6;
      ctx.quadraticCurveTo(crownX + Math.cos(ang) * (ts * 0.3), crownY - ts * 0.12, endX, endY);
      ctx.stroke();
    });
  }

  // ===================================================================
  // 3. GRAND ROYAL MILITARY PAVILION / CAMP TENT
  // ===================================================================
  drawTent(ctx, sx, sy, ts, animClock = 0, col = 0, row = 0) {
    const cfg = this.config.tent;
    const cx = sx + ts / 2;
    const baseCy = sy + ts * 0.92;
    const w = ts * cfg.widthRatio;
    const h = ts * cfg.heightRatio;
    const topY = baseCy - h;

    // 1. Broad Ground Drop Shadow
    ctx.beginPath();
    ctx.ellipse(cx, baseCy, w * 0.46, ts * 0.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
    ctx.fill();

    // 2. Main Saffron Canvas Canopy
    ctx.fillStyle = cfg.canvasMain;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.44, baseCy);
    ctx.lineTo(cx, topY);
    ctx.lineTo(cx + w * 0.44, baseCy);
    ctx.closePath();
    ctx.fill();

    // 3. Side Canopy Flaps (Darker Depth)
    ctx.fillStyle = cfg.canvasStripe;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.44, baseCy);
    ctx.lineTo(cx, topY);
    ctx.lineTo(cx - w * 0.15, baseCy);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + w * 0.44, baseCy);
    ctx.lineTo(cx, topY);
    ctx.lineTo(cx + w * 0.15, baseCy);
    ctx.closePath();
    ctx.fill();

    // 4. Golden Center Stripe & Trim
    ctx.fillStyle = cfg.canvasGold;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.12, baseCy);
    ctx.lineTo(cx, topY);
    ctx.lineTo(cx + w * 0.12, baseCy);
    ctx.closePath();
    ctx.fill();

    // 5. Arched Entrance Curtain Opening
    ctx.fillStyle = cfg.entranceInterior;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.14, baseCy);
    ctx.quadraticCurveTo(cx, baseCy - h * 0.45, cx + w * 0.14, baseCy);
    ctx.closePath();
    ctx.fill();

    // 6. Brass Finial on Roof Ridge
    ctx.fillStyle = cfg.finialGold;
    ctx.beginPath();
    ctx.arc(cx, topY - 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // 7. Pegged Guy Ropes
    ctx.strokeStyle = cfg.ropeColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.38, baseCy - h * 0.15);
    ctx.lineTo(cx - w * 0.52, baseCy);
    ctx.moveTo(cx + w * 0.38, baseCy - h * 0.15);
    ctx.lineTo(cx + w * 0.52, baseCy);
    ctx.stroke();
  }

  // ===================================================================
  // 4. SACRED YAJNA ALTAR & BLAZING VEDIC FLAMES
  // ===================================================================
  drawYajnaAltar(ctx, sx, sy, ts, animClock = 0, col = 0) {
    const cfg = this.config.yajna;
    const cx = sx + ts / 2;
    const hearthY = sy + ts * 0.68;

    // 1. Terracotta/Stone Altar Kunda (Stepped Vedic Hearth)
    ctx.fillStyle = cfg.brickBase;
    ctx.fillRect(cx - ts * 0.42, hearthY + ts * 0.08, ts * 0.84, ts * 0.22);
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
    ctx.quadraticCurveTo(cx - ts * 0.18, hearthY - ts * 0.28, cx + flick1, hearthY - ts * 0.55);
    ctx.quadraticCurveTo(cx + ts * 0.18, hearthY - ts * 0.28, cx + ts * 0.28, hearthY + ts * 0.04);
    ctx.closePath();
    ctx.fill();

    // Middle Saffron Flame
    ctx.fillStyle = cfg.flameMid;
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.19, hearthY + ts * 0.04);
    ctx.quadraticCurveTo(cx - ts * 0.12, hearthY - ts * 0.22, cx + flick2, hearthY - ts * 0.42);
    ctx.quadraticCurveTo(cx + ts * 0.12, hearthY - ts * 0.22, cx + ts * 0.19, hearthY + ts * 0.04);
    ctx.closePath();
    ctx.fill();

    // Inner Radiant Golden Core
    ctx.fillStyle = cfg.flameCore;
    ctx.beginPath();
    ctx.moveTo(cx - ts * 0.11, hearthY + ts * 0.04);
    ctx.quadraticCurveTo(cx, hearthY - ts * 0.16, cx, hearthY - ts * 0.28);
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
  // 5. SACRED MOUNTAIN BOULDER
  // ===================================================================
  drawRock(ctx, sx, sy, ts) {
    const cfg = this.config.rock;
    const cx = sx + ts / 2;
    const cy = sy + ts / 2;
    const w = ts * cfg.widthRatio;
    const h = ts * cfg.heightRatio;

    // Drop Shadow
    ctx.beginPath();
    ctx.ellipse(cx, cy + h * 0.38, w * 0.42, h * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fill();

    // Angular Chiseled Granite Facets
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.36, cy + h * 0.28);
    ctx.lineTo(cx - w * 0.32, cy - h * 0.16);
    ctx.lineTo(cx - w * 0.12, cy - h * 0.38);
    ctx.lineTo(cx + w * 0.22, cy - h * 0.35);
    ctx.lineTo(cx + w * 0.38, cy - h * 0.06);
    ctx.lineTo(cx + w * 0.32, cy + h * 0.28);
    ctx.closePath();

    ctx.fillStyle = cfg.graniteBase;
    ctx.fill();

    // Shadow facet
    ctx.fillStyle = cfg.graniteShadow;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.36, cy + h * 0.28);
    ctx.lineTo(cx - w * 0.06, cy + 2);
    ctx.lineTo(cx + w * 0.32, cy + h * 0.28);
    ctx.closePath();
    ctx.fill();

    // Lit Top Highlight Ridge
    ctx.strokeStyle = cfg.graniteHighlight;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.32, cy - h * 0.16);
    ctx.lineTo(cx - w * 0.12, cy - h * 0.38);
    ctx.lineTo(cx + w * 0.22, cy - h * 0.35);
    ctx.stroke();

    // Subtle Sacred Golden Dust Aura (Ram Setu holiness)
    ctx.fillStyle = cfg.sacredGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.42, 0, Math.PI * 2);
    ctx.fill();
  }

  // ===================================================================
  // 6. DHARMA DHWAJA (SAFFRON BANNER)
  // ===================================================================
  drawFlag(ctx, sx, sy, ts, animClock = 0) {
    const cfg = this.config.flag;
    const poleX = sx + ts * 0.28;
    const baseCy = sy + ts * 0.92;
    const wave = Math.sin(animClock * 0.006) * 5;

    // Drop Shadow
    ctx.beginPath();
    ctx.ellipse(poleX, baseCy, ts * 0.2, ts * 0.09, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.fill();

    // Wooden Staff Pole
    ctx.strokeStyle = cfg.staffColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(poleX, baseCy);
    ctx.lineTo(poleX, sy + ts * 0.08);
    ctx.stroke();

    // Brass Finial Spearhead
    ctx.fillStyle = cfg.finial;
    ctx.beginPath();
    ctx.arc(poleX, sy + ts * 0.06, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Saffron Triangular Dharma Dhwaja
    ctx.fillStyle = cfg.bannerSaffron;
    ctx.beginPath();
    ctx.moveTo(poleX + 2, sy + ts * 0.1);
    ctx.quadraticCurveTo(poleX + ts * 0.35, sy + ts * 0.15 + wave * 0.5, poleX + ts * 0.65 + wave, sy + ts * 0.26);
    ctx.quadraticCurveTo(poleX + ts * 0.35, sy + ts * 0.38 - wave * 0.5, poleX + 2, sy + ts * 0.46);
    ctx.closePath();
    ctx.fill();

    // Gold Trim Edge
    ctx.strokeStyle = cfg.goldTrim;
    ctx.lineWidth = 1.8;
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

    // Grass blades
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

  drawCampGround(ctx, sx, sy, ts) {
    const cfg = this.config.terrain;
    ctx.fillStyle = cfg.campCarpet;
    ctx.fillRect(sx, sy, ts, ts);
    ctx.strokeStyle = cfg.campCarpetBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(sx + 2, sy + 2, ts - 4, ts - 4);
  }

  // ===================================================================
  // 10. LARGE, CRISP CHARACTER SPRITE RENDERING
  // ===================================================================
  drawCharacter(ctx, img, sx, sy, ts, bobY = 0, direction = 'down', isDivine = false, auraColor = null) {
    const cx = sx + ts / 2;
    const baseCy = sy + ts * 0.88;

    // 1. Drop Shadow
    ctx.beginPath();
    ctx.ellipse(cx, baseCy, ts * 0.38, ts * 0.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fill();

    // 2. Radiant Aura (If Leader / Divine)
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
      const drawH = ts * 1.05; // Large, prominent character
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

      // Radiant divine halo spark if divine figure
      if (isDivine) {
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(cx, posY + 4, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Fallback avatar block
      ctx.fillStyle = '#b45309';
      ctx.fillRect(cx - ts * 0.3, sy + ts * 0.2 + bobY, ts * 0.6, ts * 0.7);
    }
  }
}

// Global instance available across scripts
window.assetRenderer = new AssetRenderer();
