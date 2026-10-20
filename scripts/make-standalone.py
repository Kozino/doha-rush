#!/usr/bin/env python3
"""Turn the Vite production build into one offline, downloadable HTML file."""
from __future__ import annotations

import base64
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
OUT = ROOT.parent / 'DOHA-RUSH.html'


def as_data(path: Path, mime: str) -> str:
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode('ascii')}"


def main() -> None:
    index = (DIST / 'index.html').read_text(encoding='utf-8')
    css = next((DIST / 'assets').glob('*.css')).read_text(encoding='utf-8')
    js = next((DIST / 'assets').glob('*.js')).read_text(encoding='utf-8')
    css = css.replace('url(/fonts/barlow.ttf)', f"url('{as_data(ROOT / 'public/fonts/barlow.ttf', 'font/ttf')}')")
    css = css.replace('url(/fonts/dm.ttf)', f"url('{as_data(ROOT / 'public/fonts/dm.ttf', 'font/ttf')}')")
    index = index.replace('href="/favicon.svg"', f"href=\"{as_data(ROOT / 'public/favicon.svg', 'image/svg+xml')}\"")
    index = re.sub(r'\s*<link rel="stylesheet"[^>]+>', lambda _: '\n    <style>' + css + '</style>', index)
    # No dynamic JS chunks are generated: Three.js, the game and UI are all in this one file.
    js = re.sub(r'</script', r'<\\/script', js, flags=re.IGNORECASE)
    index = re.sub(r'\s*<script type="module"[^>]*></script>', lambda _: '\n    <script type="module">' + js + '</script>', index)
    if '/assets/' in index or 'url(/fonts/' in index:
        raise RuntimeError('Unbundled asset reference remains in standalone HTML')
    OUT.write_text(index, encoding='utf-8')
    print(f'Wrote {OUT} ({OUT.stat().st_size:,} bytes, no network dependencies)')


if __name__ == '__main__':
    main()
