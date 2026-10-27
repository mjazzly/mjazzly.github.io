#!/usr/bin/env python3
"""Render each page to a PNG with headless Chromium, for review before a commit.
Usage: python3 scripts/shot.py out_dir [page ...]   (defaults to every page)
Drawings and reveals are played by scrolling the page to the bottom first.
"""
import sys, pathlib
from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).resolve().parent.parent
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
pages = sys.argv[2:] or ["index.html", "built.html", "casefiles.html", "operator.html", "models.html", "knowledge.html"]
with sync_playwright() as p:
    b = p.chromium.launch()
    for page in pages:
        for width, tag in ((1180, "desktop"), (390, "phone")):
            pg = b.new_page(viewport={"width": width, "height": 900})
            pg.goto((root / page).as_uri()); pg.wait_for_timeout(600)
            # scroll through so every section reveals and every drawing plays, then settle
            h = pg.evaluate("document.body.scrollHeight")
            for y in range(0, h, 500):
                pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(120)
            pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(2800)
            pg.screenshot(path=str(out / f"{page[:-5]}-{tag}.png"), full_page=True)
            pg.close()
    b.close()
print("done")
