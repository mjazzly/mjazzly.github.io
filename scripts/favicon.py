#!/usr/bin/env python3
"""Renders favicon.svg to the site's raster icons. Run from the repo root.

favicon-32.png        browser tabs
favicon-192.png       search results and Android home screens (Google wants a square of at least 48px; 192 is 4 x 48)
apple-touch-icon.png  iOS home screen (180px)
favicon.ico           the address browsers and crawlers try without being told (16, 32 and 48px in one file)
"""
import io, pathlib
from PIL import Image
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parent.parent
svg = (root / "favicon.svg").read_text()

def render(browser, size):
    sized = svg.replace("<svg ", '<svg width="%d" height="%d" ' % (size, size), 1)
    pg = browser.new_page(viewport={"width": size, "height": size}, device_scale_factor=1)
    pg.set_content('<html><body style="margin:0;background:transparent">' + sized + '</body></html>')
    png = pg.screenshot(omit_background=True); pg.close()
    return png

with sync_playwright() as p:
    b = p.chromium.launch()
    for size, name in ((32, "favicon-32.png"), (192, "favicon-192.png"), (180, "apple-touch-icon.png")):
        (root / name).write_bytes(render(b, size))
    frames = [Image.open(io.BytesIO(render(b, s))).convert("RGBA") for s in (16, 32, 48)]
    b.close()
frames[-1].save(root / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)], append_images=frames[:-1])
print("favicons written")
