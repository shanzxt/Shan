"""Writes a .webp sibling for every chart PNG under public/newsletter*/.

Run after dropping new issue images into public/ (needs Pillow):
    python scripts/make-webp.py
The site serves the .webp via <picture> and keeps the PNG as fallback and
for the full-size lightbox. `src/data/newsletter.test.js` fails if a
referenced PNG has no .webp sibling.
"""
from pathlib import Path

from PIL import Image

public = Path(__file__).resolve().parent.parent / "public"
for png in sorted(public.glob("newsletter*/**/*.png")):
    webp = png.with_suffix(".webp")
    if webp.exists() and webp.stat().st_mtime >= png.stat().st_mtime:
        continue
    Image.open(png).save(webp, "WEBP", quality=88, method=6)
    print(f"{png.relative_to(public)}: {png.stat().st_size // 1024} kB -> {webp.stat().st_size // 1024} kB")
