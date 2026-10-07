#!/usr/bin/env python3
"""
RAM SENA - Sprite Optimizer & Auto-Cropper (scripts/optimize_sprites.py)
Automatically trims excessive transparent padding from character PNGs,
centers the character subject, and resizes to crisp standard square sprite dimensions (512x512).
Preserves the high-resolution original images in assets/images/raw/.
"""

import os
import shutil
from PIL import Image

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
IMAGES_DIR = os.path.join(PROJECT_ROOT, 'assets', 'images')
RAW_BACKUP_DIR = os.path.join(IMAGES_DIR, 'raw')

TARGET_SIZE = (512, 512)
PADDING_RATIO = 0.05  # 5% breathing room around the bounding box

def optimize_all():
    os.makedirs(RAW_BACKUP_DIR, exist_ok=True)
    
    files = [f for f in sorted(os.listdir(IMAGES_DIR)) if f.lower().endswith('.png')]
    print(f"Found {len(files)} PNG images in {IMAGES_DIR}...")
    
    for filename in files:
        file_path = os.path.join(IMAGES_DIR, filename)
        raw_backup_path = os.path.join(RAW_BACKUP_DIR, filename)
        
        # 1. Back up raw original if not already backed up
        if not os.path.exists(raw_backup_path):
            shutil.copy2(file_path, raw_backup_path)
            print(f"  [Backup] Saved original to raw/{filename}")
        
        # 2. Process image from the raw original
        src_path = raw_backup_path if os.path.exists(raw_backup_path) else file_path
        with Image.open(src_path) as img:
            img = img.convert('RGBA')
            orig_w, orig_h = img.size
            orig_size_bytes = os.path.getsize(src_path)
            
            # Detect non-transparent bounding box
            bbox = img.getbbox()
            if not bbox:
                print(f"  [Skip] {filename} is completely transparent.")
                continue
            
            # Crop to character subject
            cropped = img.crop(bbox)
            cw, ch = cropped.size
            
            # Calculate padded square canvas
            max_dim = max(cw, ch)
            padded_dim = int(max_dim * (1.0 + (PADDING_RATIO * 2)))
            
            square_img = Image.new('RGBA', (padded_dim, padded_dim), (0, 0, 0, 0))
            paste_x = (padded_dim - cw) // 2
            paste_y = (padded_dim - ch) // 2
            square_img.paste(cropped, (paste_x, paste_y), mask=cropped)
            
            # Resize with high-quality Lanczos resampling
            final_img = square_img.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
            
            # Save optimized output
            final_img.save(file_path, 'PNG', optimize=True)
            new_size_bytes = os.path.getsize(file_path)
            
            reduction = ((orig_size_bytes - new_size_bytes) / orig_size_bytes) * 100
            print(f"  [OK] {filename}: {orig_w}x{orig_h} ({orig_size_bytes//1024}KB) -> trimmed & centered to {TARGET_SIZE[0]}x{TARGET_SIZE[1]} ({new_size_bytes//1024}KB, -{reduction:.1f}%)")

    print("\nOptimization complete! All sprites are now trimmed, centered, and sized to 512x512.")

if __name__ == '__main__':
    optimize_all()
