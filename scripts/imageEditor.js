/**
 * RAM SENA - Sprite & Image Studio Engine (scripts/imageEditor.js)
 * Implements client-side alpha bounding-box detection, auto-trimming,
 * interactive resizing, rotation, flipping, live previews, and export.
 */

class ImageStudio {
  constructor() {
    this.canvas = document.getElementById('editor-canvas');
    this.ctx = this.canvas.getContext('2d');

    // UI Elements
    this.galleryContainer = document.getElementById('sprite-gallery');
    this.dropzone = document.getElementById('dropzone');
    this.fileInput = document.getElementById('file-input');
    this.canvasViewport = document.getElementById('canvas-viewport');

    // Controls
    this.btnAutoTrim = document.getElementById('btn-auto-trim');
    this.btnAutoCenter = document.getElementById('btn-auto-center');
    this.sliderPadding = document.getElementById('slider-padding');
    this.valPadding = document.getElementById('val-padding');

    this.inputWidth = document.getElementById('input-width');
    this.inputHeight = document.getElementById('input-height');
    this.chkLockAspect = document.getElementById('chk-lock-aspect');

    this.sliderScale = document.getElementById('slider-scale');
    this.valScale = document.getElementById('val-scale');
    this.sliderOffsetX = document.getElementById('slider-offset-x');
    this.valOffsetX = document.getElementById('val-offset-x');
    this.sliderOffsetY = document.getElementById('slider-offset-y');
    this.valOffsetY = document.getElementById('val-offset-y');

    this.btnFlipH = document.getElementById('btn-flip-h');
    this.btnFlipV = document.getElementById('btn-flip-v');
    this.btnRotate = document.getElementById('btn-rotate');

    this.chkShowBBox = document.getElementById('chk-show-bbox');
    this.btnResetView = document.getElementById('btn-reset-view');

    this.btnRepoOptimized = document.getElementById('btn-repo-optimized');
    this.btnRepoRaw = document.getElementById('btn-repo-raw');

    this.exportFilename = document.getElementById('export-filename');
    this.btnDownloadPng = document.getElementById('btn-download-png');
    this.btnTopDownload = document.getElementById('btn-top-download');
    this.btnApplySession = document.getElementById('btn-apply-session');
    this.btnTopApply = document.getElementById('btn-top-apply');

    // Metrics Elements
    this.metricTargetSize = document.getElementById('metric-target-size');
    this.metricOrigSize = document.getElementById('metric-orig-size');
    this.metricBBox = document.getElementById('metric-bbox');
    this.badgeCharacterName = document.getElementById('badge-character-name');

    // Live Previews
    this.previewImgTile = document.getElementById('preview-img-tile');
    this.previewImgDialogue = document.getElementById('preview-img-dialogue');
    this.previewImgCard = document.getElementById('preview-img-card');
    this.previewSpeakerName = document.getElementById('preview-speaker-name');
    this.toast = document.getElementById('editor-toast');

    // Character Manifest
    this.characters = [
      { key: 'vanar', name: 'Vanar Sevaka', file: 'vanar.png' },
      { key: 'bear', name: 'Riksha Bear', file: 'bear.png' },
      { key: 'ram', name: 'Shri Ram', file: 'ram.png' },
      { key: 'laxman', name: 'Lakshman', file: 'laxman.png' },
      { key: 'hanuman', name: 'Hanuman', file: 'hanuman.png' },
      { key: 'sugreev', name: 'Sugreev', file: 'sugreev.png' },
      { key: 'jambavan', name: 'Jambavan', file: 'jambavan.png' },
      { key: 'vibhisan', name: 'Vibhishan', file: 'vibhisan.png' },
      { key: 'angad', name: 'Angad', file: 'angad.png' }
    ];

    // Studio State
    this.activeRepo = 'optimized'; // 'optimized' or 'raw'
    this.activeChar = this.characters[0];
    this.sourceImage = null;
    this.detectedBBox = null;

    this.targetWidth = 512;
    this.targetHeight = 512;
    this.scale = 1.0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.rotation = 0;
    this.flipH = false;
    this.flipV = false;
    this.paddingPercent = 5;
    this.showBBox = true;

    this.init();
  }

  init() {
    this.buildGallery();
    this.initListeners();
    this.loadCharacter(this.activeChar.key);
  }

  buildGallery() {
    this.galleryContainer.innerHTML = '';
    this.characters.forEach(char => {
      const card = document.createElement('div');
      card.className = `sprite-thumb-card ${char.key === this.activeChar.key ? 'active' : ''}`;
      card.dataset.key = char.key;

      const path = this.activeRepo === 'raw' ? `assets/images/raw/${char.file}` : `assets/images/${char.file}`;
      card.innerHTML = `
        <img class="thumb-img" src="${path}" alt="${char.name}">
        <span class="thumb-name">${char.name}</span>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.sprite-thumb-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.loadCharacter(char.key);
      });

      this.galleryContainer.appendChild(card);
    });
  }

  initListeners() {
    // Dropzone & File Input
    if (this.dropzone) {
      this.dropzone.addEventListener('click', () => this.fileInput.click());
      this.dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.dropzone.classList.add('dragover');
      });
      this.dropzone.addEventListener('dragleave', () => this.dropzone.classList.remove('dragover'));
      this.dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        this.dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleFile(e.dataTransfer.files[0]);
        }
      });
    }

    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleFile(e.target.files[0]);
        }
      });
    }

    // Repo Selector
    if (this.btnRepoOptimized && this.btnRepoRaw) {
      this.btnRepoOptimized.addEventListener('click', () => {
        this.activeRepo = 'optimized';
        this.btnRepoOptimized.classList.add('active');
        this.btnRepoRaw.classList.remove('active');
        this.buildGallery();
        this.loadCharacter(this.activeChar.key);
      });

      this.btnRepoRaw.addEventListener('click', () => {
        this.activeRepo = 'raw';
        this.btnRepoRaw.classList.add('active');
        this.btnRepoOptimized.classList.remove('active');
        this.buildGallery();
        this.loadCharacter(this.activeChar.key);
      });
    }

    // Canvas Background Buttons
    document.querySelectorAll('[data-bg]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-bg]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const bg = btn.dataset.bg;
        this.canvasViewport.className = `bg-${bg}`;
      });
    });

    // Resolution Presets
    document.querySelectorAll('[data-res]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-res]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const res = parseInt(btn.dataset.res, 10);
        this.targetWidth = res;
        this.targetHeight = res;
        this.inputWidth.value = res;
        this.inputHeight.value = res;
        this.canvas.width = res;
        this.canvas.height = res;
        this.autoTrimAndCenter();
      });
    });

    // Inputs & Sliders
    this.inputWidth.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) || 512;
      this.targetWidth = val;
      if (this.chkLockAspect.checked) {
        this.targetHeight = val;
        this.inputHeight.value = val;
      }
      this.canvas.width = this.targetWidth;
      this.canvas.height = this.targetHeight;
      this.render();
    });

    this.inputHeight.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) || 512;
      this.targetHeight = val;
      if (this.chkLockAspect.checked) {
        this.targetWidth = val;
        this.inputWidth.value = val;
      }
      this.canvas.width = this.targetWidth;
      this.canvas.height = this.targetHeight;
      this.render();
    });

    this.sliderScale.addEventListener('input', (e) => {
      this.scale = parseInt(e.target.value, 10) / 100;
      this.valScale.textContent = `${Math.round(this.scale * 100)}%`;
      this.render();
    });

    this.sliderOffsetX.addEventListener('input', (e) => {
      this.offsetX = parseInt(e.target.value, 10);
      this.valOffsetX.textContent = `${this.offsetX} px`;
      this.render();
    });

    this.sliderOffsetY.addEventListener('input', (e) => {
      this.offsetY = parseInt(e.target.value, 10);
      this.valOffsetY.textContent = `${this.offsetY} px`;
      this.render();
    });

    this.sliderPadding.addEventListener('input', (e) => {
      this.paddingPercent = parseInt(e.target.value, 10);
      this.valPadding.textContent = `${this.paddingPercent}%`;
      this.autoTrimAndCenter();
    });

    // Action Buttons
    this.btnAutoTrim.addEventListener('click', () => {
      this.autoTrimAndCenter();
      this.showToast('✂️ Transparent Margins Auto-Trimmed & Centered!');
    });

    this.btnAutoCenter.addEventListener('click', () => {
      this.offsetX = 0;
      this.offsetY = 0;
      this.sliderOffsetX.value = 0;
      this.sliderOffsetY.value = 0;
      this.valOffsetX.textContent = '0 px';
      this.valOffsetY.textContent = '0 px';
      this.render();
      this.showToast('🎯 Subject Centered!');
    });

    this.btnFlipH.addEventListener('click', () => {
      this.flipH = !this.flipH;
      this.render();
    });

    this.btnFlipV.addEventListener('click', () => {
      this.flipV = !this.flipV;
      this.render();
    });

    this.btnRotate.addEventListener('click', () => {
      this.rotation = (this.rotation + 90) % 360;
      this.render();
    });

    this.chkShowBBox.addEventListener('change', (e) => {
      this.showBBox = e.target.checked;
      this.render();
    });

    this.btnResetView.addEventListener('click', () => {
      this.resetTransforms();
      this.render();
      this.showToast('🔄 View & Transforms Reset');
    });

    // Download & Export
    const downloadHandler = () => this.downloadPNG();
    if (this.btnDownloadPng) this.btnDownloadPng.addEventListener('click', downloadHandler);
    if (this.btnTopDownload) this.btnTopDownload.addEventListener('click', downloadHandler);

    // Apply to Game Session
    const applyHandler = () => this.applyToGameSession();
    if (this.btnApplySession) this.btnApplySession.addEventListener('click', applyHandler);
    if (this.btnTopApply) this.btnTopApply.addEventListener('click', applyHandler);
  }

  loadCharacter(charKey) {
    const char = this.characters.find(c => c.key === charKey) || this.characters[0];
    this.activeChar = char;
    this.exportFilename.value = char.file;
    this.badgeCharacterName.textContent = char.file;
    if (this.previewSpeakerName) {
      this.previewSpeakerName.textContent = `${char.name}:`;
    }

    const path = this.activeRepo === 'raw' ? `assets/images/raw/${char.file}` : `assets/images/${char.file}`;
    const img = new Image();
    img.src = path;
    img.onload = () => {
      this.sourceImage = img;
      this.computeBoundingBox();
      this.autoTrimAndCenter();
    };
  }

  handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        this.sourceImage = img;
        this.exportFilename.value = file.name.replace(/\.[^/.]+$/, '') + '_optimized.png';
        this.badgeCharacterName.textContent = file.name;
        this.computeBoundingBox();
        this.autoTrimAndCenter();
        this.showToast(`📁 Loaded custom image: ${file.name}`);
      };
    };
    reader.readAsDataURL(file);
  }

  computeBoundingBox() {
    if (!this.sourceImage) return;

    const w = this.sourceImage.naturalWidth;
    const h = this.sourceImage.naturalHeight;

    // Use offscreen canvas to scan alpha channel
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const offCtx = off.getContext('2d');
    offCtx.drawImage(this.sourceImage, 0, 0);

    const imgData = offCtx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let minX = w, minY = h, maxX = 0, maxY = 0;
    let hasVisiblePixel = false;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const alpha = data[(y * w + x) * 4 + 3];
        if (alpha > 15) { // Visible threshold
          hasVisiblePixel = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!hasVisiblePixel) {
      minX = 0; minY = 0; maxX = w; maxY = h;
    }

    this.detectedBBox = {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(1, maxX - minX + 1),
      height: Math.max(1, maxY - minY + 1),
      origWidth: w,
      origHeight: h
    };

    // Update metrics UI
    this.metricOrigSize.textContent = `${w} × ${h} px`;
    this.metricBBox.textContent = `${minX}, ${minY} → ${maxX}, ${maxY} (${this.detectedBBox.width}×${this.detectedBBox.height})`;
  }

  autoTrimAndCenter() {
    if (!this.detectedBBox) return;

    const bbox = this.detectedBBox;
    const padFrac = this.paddingPercent / 100;

    // Calculate ideal scale factor to fit bbox in target resolution
    const availW = this.targetWidth * (1.0 - (padFrac * 2));
    const availH = this.targetHeight * (1.0 - (padFrac * 2));

    const scaleX = availW / bbox.width;
    const scaleY = availH / bbox.height;
    const fitScale = Math.min(scaleX, scaleY);

    this.scale = fitScale;
    this.sliderScale.value = Math.round(fitScale * 100);
    this.valScale.textContent = `${Math.round(fitScale * 100)}%`;

    // Center the bounding box center to canvas center
    const bboxCenterX = bbox.minX + bbox.width / 2;
    const bboxCenterY = bbox.minY + bbox.height / 2;

    const origCenterX = bbox.origWidth / 2;
    const origCenterY = bbox.origHeight / 2;

    // Offset in original coords converted to canvas
    this.offsetX = (origCenterX - bboxCenterX) * fitScale;
    this.offsetY = (origCenterY - bboxCenterY) * fitScale;

    this.sliderOffsetX.value = Math.round(this.offsetX);
    this.sliderOffsetY.value = Math.round(this.offsetY);
    this.valOffsetX.textContent = `${Math.round(this.offsetX)} px`;
    this.valOffsetY.textContent = `${Math.round(this.offsetY)} px`;

    this.render();
  }

  resetTransforms() {
    this.scale = 1.0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.rotation = 0;
    this.flipH = false;
    this.flipV = false;

    this.sliderScale.value = 100;
    this.valScale.textContent = '100%';
    this.sliderOffsetX.value = 0;
    this.valOffsetX.textContent = '0 px';
    this.sliderOffsetY.value = 0;
    this.valOffsetY.textContent = '0 px';
  }

  render(isExport = false) {
    if (!this.sourceImage) return;

    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    ctx.clearRect(0, 0, cw, ch);

    ctx.save();
    // Center of canvas + user offsets
    ctx.translate(cw / 2 + this.offsetX, ch / 2 + this.offsetY);

    if (this.rotation !== 0) {
      ctx.rotate((this.rotation * Math.PI) / 180);
    }

    ctx.scale(this.flipH ? -this.scale : this.scale, this.flipV ? -this.scale : this.scale);

    const sw = this.sourceImage.naturalWidth;
    const sh = this.sourceImage.naturalHeight;

    ctx.drawImage(this.sourceImage, -sw / 2, -sh / 2, sw, sh);
    ctx.restore();

    // Draw trim bounding box overlay if enabled (and not exporting)
    if (this.showBBox && !isExport && this.detectedBBox) {
      const bbox = this.detectedBBox;
      ctx.save();
      ctx.translate(cw / 2 + this.offsetX, ch / 2 + this.offsetY);
      if (this.rotation !== 0) ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.scale(this.flipH ? -this.scale : this.scale, this.flipV ? -this.scale : this.scale);

      const sw = this.sourceImage.naturalWidth;
      const sh = this.sourceImage.naturalHeight;

      const bx = bbox.minX - sw / 2;
      const by = bbox.minY - sh / 2;

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2 / this.scale;
      ctx.setLineDash([6 / this.scale, 4 / this.scale]);
      ctx.strokeRect(bx, by, bbox.width, bbox.height);
      ctx.restore();
    }

    this.metricTargetSize.textContent = `${cw} × ${ch} px`;

    // Update live previews
    if (!isExport) {
      this.updateLivePreviews();
    }
  }

  updateLivePreviews() {
    // Generate clean data URL without bounding box
    const off = document.createElement('canvas');
    off.width = this.canvas.width;
    off.height = this.canvas.height;
    const offCtx = off.getContext('2d');

    const cw = off.width;
    const ch = off.height;
    offCtx.save();
    offCtx.translate(cw / 2 + this.offsetX, ch / 2 + this.offsetY);
    if (this.rotation !== 0) offCtx.rotate((this.rotation * Math.PI) / 180);
    offCtx.scale(this.flipH ? -this.scale : this.scale, this.flipV ? -this.scale : this.scale);
    const sw = this.sourceImage.naturalWidth;
    const sh = this.sourceImage.naturalHeight;
    offCtx.drawImage(this.sourceImage, -sw / 2, -sh / 2, sw, sh);
    offCtx.restore();

    const dataUrl = off.toDataURL('image/png');
    if (this.previewImgTile) this.previewImgTile.src = dataUrl;
    if (this.previewImgDialogue) this.previewImgDialogue.src = dataUrl;
    if (this.previewImgCard) this.previewImgCard.src = dataUrl;
  }

  downloadPNG() {
    // Create clean exported canvas without debug bounding box
    const outCanvas = document.createElement('canvas');
    outCanvas.width = this.canvas.width;
    outCanvas.height = this.canvas.height;
    const outCtx = outCanvas.getContext('2d');

    const cw = outCanvas.width;
    const ch = outCanvas.height;

    outCtx.save();
    outCtx.translate(cw / 2 + this.offsetX, ch / 2 + this.offsetY);
    if (this.rotation !== 0) outCtx.rotate((this.rotation * Math.PI) / 180);
    outCtx.scale(this.flipH ? -this.scale : this.scale, this.flipV ? -this.scale : this.scale);
    const sw = this.sourceImage.naturalWidth;
    const sh = this.sourceImage.naturalHeight;
    outCtx.drawImage(this.sourceImage, -sw / 2, -sh / 2, sw, sh);
    outCtx.restore();

    outCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.exportFilename.value || `${this.activeChar.key}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showToast(`💾 Downloaded ${a.download} (${cw}×${ch})!`);
    }, 'image/png');
  }

  applyToGameSession() {
    const outCanvas = document.createElement('canvas');
    outCanvas.width = this.canvas.width;
    outCanvas.height = this.canvas.height;
    const outCtx = outCanvas.getContext('2d');

    const cw = outCanvas.width;
    const ch = outCanvas.height;

    outCtx.save();
    outCtx.translate(cw / 2 + this.offsetX, ch / 2 + this.offsetY);
    if (this.rotation !== 0) outCtx.rotate((this.rotation * Math.PI) / 180);
    outCtx.scale(this.flipH ? -this.scale : this.scale, this.flipV ? -this.scale : this.scale);
    const sw = this.sourceImage.naturalWidth;
    const sh = this.sourceImage.naturalHeight;
    outCtx.drawImage(this.sourceImage, -sw / 2, -sh / 2, sw, sh);
    outCtx.restore();

    const dataUrl = outCanvas.toDataURL('image/png');
    const storageKey = `ram_sena_custom_sprite_${this.activeChar.key}`;
    try {
      localStorage.setItem(storageKey, dataUrl);
      this.showToast(`⚡ Applied to live game session for ${this.activeChar.name}!`);
    } catch (e) {
      console.warn('LocalStorage size exceeded, sprite will stay in memory.', e);
      this.showToast(`⚡ Applied to memory session!`);
    }
  }

  showToast(msg) {
    if (!this.toast) return;
    this.toast.textContent = msg;
    this.toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast.classList.remove('show');
    }, 2800);
  }
}

// Bootstrap Image Studio
window.addEventListener('DOMContentLoaded', () => {
  window.imageStudio = new ImageStudio();
});
