#!/usr/bin/env python3
"""Render each page to a PNG with headless Chromium, for review before a commit.
Usage: python3 scripts/shot.py out_dir [page ...]   (defaults to every page)
       python3 scripts/shot.py out_dir --tour       (every stop of both walks, as a reader lands on it)
       python3 scripts/shot.py out_dir --tour data  (one walk only: ai or data)
Drawings and reveals are played by scrolling the page to the bottom first.
"""
import sys, re, json, pathlib
from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).resolve().parent.parent
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
if "--tour" in sys.argv:
    # each stop that is on, of each walk (or only the one named after --tour: ai or data), opened at its own address,
    # the window as the reader sees it on arrival; a stop marked foot is shot again on a phone after Show me,
    # to see the tour card and the page's own question card clear of each other
    src = (root / "tour.js").read_text()
    pick = sys.argv[sys.argv.index("--tour") + 1:sys.argv.index("--tour") + 2]
    walks = [(name, pre, mark) for name, pre, mark in (("ai", "", "STOPS"), ("data", "data-", "STOPS:data")) if not pick or pick[0] == name]
    with sync_playwright() as p:
        b = p.chromium.launch()
        for name, pre, mark in walks:
            stops = [x for x in json.loads(re.search(r"/\*" + re.escape(mark) + r"\*/(.*?)/\*/" + re.escape(mark) + r"\*/", src, re.S).group(1)) if x["on"]]
            for k, st in enumerate(stops, 1):
                for width, height, tag in ((1180, 900, "desktop"), (390, 844, "phone")):
                    pg = b.new_page(viewport={"width": width, "height": height})
                    pg.goto((root / st["page"]).as_uri() + f"?tour={pre}{k}#{st['anchor']}"); pg.wait_for_timeout(3000)
                    pg.screenshot(path=str(out / f"tour-{name}-{k}-{tag}.png"))
                    if st.get("foot") and tag == "phone":
                        pg.locator(f"#{st['anchor']} button", has_text="Show me").first.click(); pg.wait_for_timeout(1500)
                        pg.screenshot(path=str(out / f"tour-{name}-{k}-{tag}-shown.png"))
                    pg.close()
        b.close()
    print("done"); sys.exit()
pages = sys.argv[2:] or ["index.html", "built.html", "aiwork.html", "dashboards.html", "clarity.html", "frames.html", "deconstruct.html", "scorecard.html", "output-01.html", "output-01-board.html", "output-02.html", "output-03.html", "output-04.html", "output-06.html", "casefiles.html", "operator.html", "models.html", "knowledge.html", "chapters.html"]
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
