#!/usr/bin/env python3
"""Render the 1200 x 630 images a link shows on LinkedIn, WhatsApp, Slack or email.
Usage: python3 scripts/preview.py            (writes preview.png and preview-frames.png at the site root)
       python3 scripts/preview.py frames     (writes only the one named: site or frames)
Rerun if the name line, the four frames or the palette changes.
preview.png: one white panel on the paper, the two seams beside the name, the eyebrow line, and the four pages a reader lands on.
preview-frames.png (frames.html): the same panel with the title Frames and the four frames as cells on the navy film strip,
read from the index cards in frames.html, with their pictograms from its icon sprite.
"""
import pathlib, re, sys, tempfile
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
  <div class="role">Data analyst. Six years of client-facing analytics, and AI workflows tested before they are trusted.</div>
  <div class="pages"><span class="on">Built</span><span>AI Work</span><span>Case Files</span><span>Systems</span></div>
  <div class="url">mjazzly.github.io</div>
</div>
</body></html>"""

# Frames: the four index cards from the page itself, so the image never says what the page does not
page = (root / "frames.html").read_text()
sprite = re.search(r"<!--ICONS-->(.*?)<!--/ICONS-->", page, re.S).group(1)
cells = "".join(
    '<div class="cell"><span class="badge"><svg class="ic"><use href="#ic-%s"/></svg></span>'
    '<span class="id">%s</span><span class="what">%s</span></div>' % m
    for m in re.findall(r'<a class="tile entry"[^>]*><span class="badge"><svg class="ic" aria-hidden="true"><use href="#ic-([a-z-]+)"/></svg></span>'
                        r'<span class="sys-id">([^<]+)</span><div class="what">([^<]+)</div>', page))
assert cells.count('class="cell"') == 4, "expected the four FRAME index cards in frames.html"
frames = html.split("</style>")[0] + """
  body{font-variant-ligatures:no-common-ligatures}
  .panel{padding:0 64px;display:flex;flex-direction:column;justify-content:center}
  .eyebrow{margin-bottom:18px}
  .name{font-size:88px}
  .top{display:flex;align-items:baseline;justify-content:space-between}
  .top .url{position:static}
  .strip{position:relative;margin-top:34px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px;background:#214A62;border-radius:14px;padding:32px 16px}
  .strip::before,.strip::after{content:"";position:absolute;left:20px;right:20px;height:10px;background:linear-gradient(90deg,rgba(243,244,246,.92) 0 13px,transparent 13px) 0 0/28px 10px repeat-x;border-radius:2px}
  .strip::before{top:11px}.strip::after{bottom:11px}
  .cell{background:#fff;border-radius:8px;padding:22px 20px 26px;display:grid;grid-template-columns:auto 1fr;align-items:center;column-gap:12px;row-gap:12px;align-content:start}
  .badge{display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:12px;background:#E4EDF3;color:#2C5F7C}
  .ic{width:24px;height:24px}
  .id{font-family:'IBM Plex Mono',monospace;font-size:17px;color:#7E8E92}
  .what{grid-column:1 / -1;font-weight:800;font-size:22px;line-height:1.25;letter-spacing:-.01em}
</style></head><body>""" + sprite + """
<div class="panel">
  <div class="eyebrow">Four frameworks for AI at work</div>
  <div class="top"><div class="name">Frames</div><div class="url">mjazzly.github.io/frames.html</div></div>
  <div class="strip">""" + cells + """</div>
</div>
</body></html>"""

pages = {"site": (html, "preview.png"), "frames": (frames, "preview-frames.png")}
chosen = sys.argv[1:] or list(pages)
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
    for name in chosen:
        src, out = pages[name]
        with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False) as f:
            f.write(src); path = f.name
        pg.goto(pathlib.Path(path).as_uri()); pg.wait_for_timeout(1500)
        pg.screenshot(path=str(root / out))
        print("wrote " + out)
    b.close()
