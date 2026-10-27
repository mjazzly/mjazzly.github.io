#!/usr/bin/env python3
"""Renders favicon.svg to favicon-32.png and apple-touch-icon.png (180px). Run from the repo root."""
import pathlib
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parent.parent
svg = (root / "favicon.svg").read_text()
with sync_playwright() as p:
    b = p.chromium.launch()
    for size, name in ((32, "favicon-32.png"), (180, "apple-touch-icon.png")):
        sized = svg.replace("<svg ", '<svg width="%d" height="%d" ' % (size, size), 1)
        pg = b.new_page(viewport={"width": size, "height": size}, device_scale_factor=1)
        pg.set_content('<html><body style="margin:0;background:transparent">' + sized + '</body></html>')
        pg.screenshot(path=str(root / name), omit_background=True); pg.close()
    b.close()
print("favicons written")
