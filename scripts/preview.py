#!/usr/bin/env python3
"""Render preview.png, the 1200 x 630 image a link to the site shows on LinkedIn, WhatsApp, Slack or email.
Usage: python3 scripts/preview.py        (writes preview.png at the site root; rerun if the name line or the palette changes)
One white panel on the paper, the two seams beside the name, the eyebrow line, and the four pages a reader lands on.
"""
import pathlib, tempfile
from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).resolve().parent.parent
html = """<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;800&family=IBM+Plex+Mono:wght@400&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;width:1200px;height:630px;background:#F3F4F6;font-family:'Manrope',system-ui,sans-serif;color:#172529}
  .panel{position:absolute;left:60px;top:60px;right:60px;bottom:60px;background:#fff;border-radius:28px;padding:64px 80px;box-sizing:border-box}
  .eyebrow{font-family:'IBM Plex Mono',monospace;font-size:22px;color:#7E8E92;letter-spacing:.01em;margin-bottom:26px}
  .eyebrow span{margin:0 10px}
  .name{display:flex;align-items:baseline;gap:18px;font-weight:800;font-size:96px;letter-spacing:-.03em;line-height:1}
  .seam{display:inline-block;width:22px;height:22px;border-radius:5px;transform:translateY(-6px)}
  .silver{background:#2C5F7C}.gold{background:#B07E23}
  .role{margin-top:30px;font-weight:600;font-size:30px;line-height:1.35;color:#2C5F7C;max-width:880px}
  .pages{position:absolute;left:80px;bottom:64px;display:flex;gap:12px}
  .pages span{font-weight:600;font-size:22px;color:#4F6166;background:#E4EDF3;padding:12px 22px;border-radius:999px}
  .pages span.on{background:#2C5F7C;color:#fff}
  .url{position:absolute;right:80px;bottom:76px;font-family:'IBM Plex Mono',monospace;font-size:22px;color:#7E8E92}
</style></head><body>
<div class="panel">
  <div class="eyebrow">Data Analyst<span>·</span>AI Workflows<span>·</span>Kuala Lumpur</div>
  <div class="name"><i class="seam silver"></i>Megat Jazly<i class="seam gold"></i></div>
  <div class="role">Six years of client-facing analytics, delivered as systems that can be checked. AI systems built to take over a real task, each with its test record and its code.</div>
  <div class="pages"><span class="on">Built</span><span>AI Work</span><span>Case Files</span><span>Systems</span></div>
  <div class="url">mjazzly.github.io</div>
</div>
</body></html>"""

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False) as f:
        f.write(html); path = f.name
    pg.goto(pathlib.Path(path).as_uri()); pg.wait_for_timeout(1500)
    pg.screenshot(path=str(root / "preview.png"))
    b.close()
print("wrote preview.png")
