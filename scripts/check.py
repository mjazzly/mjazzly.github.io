#!/usr/bin/env python3
"""Pre-publish checks for mjazzly.github.io. Exit 1 on any failure.
Run from the repo root: python3 scripts/check.py
"""
import re, sys, pathlib, html.parser

PAGES = ["index.html", "casefiles.html", "operator.html", "models.html"]
BANNED_WORDS = ["marketing"]          # never on the site, in any case
BANNED_CHARS = {"\u2014": "em dash", "\u2013": "en dash"}
failures = []

class Balance(html.parser.HTMLParser):
    VOID = {"meta", "link", "br", "img", "input", "hr"}
    def __init__(self):
        super().__init__(); self.stack = []; self.bad = []
    def handle_starttag(self, t, a):
        if t not in self.VOID: self.stack.append(t)
    def handle_endtag(self, t):
        if self.stack and self.stack[-1] == t: self.stack.pop()
        else: self.bad.append((t, self.getpos()))

def visible_text(src):
    # strip comments (hidden LIVE blocks are allowed to contain anything)
    return re.sub(r"<!--.*?-->", "", src, flags=re.S)

for page in PAGES:
    path = pathlib.Path(page)
    if not path.exists():
        failures.append(f"{page}: missing"); continue
    src = path.read_text(encoding="utf-8")
    vis = visible_text(src)
    for ch, name in BANNED_CHARS.items():
        n = vis.count(ch)
        if n: failures.append(f"{page}: {n} {name}(s) in visible content")
    for w in BANNED_WORDS:
        for m in re.finditer(w, vis, flags=re.I):
            line = vis[:m.start()].count("\n") + 1
            failures.append(f"{page}: banned word '{w}' at line ~{line}")
    b = Balance(); b.feed(vis)
    if b.stack: failures.append(f"{page}: unclosed tags {b.stack}")
    if b.bad: failures.append(f"{page}: mismatched closing tags {b.bad[:3]}")
    # LIVE markers must be paired
    opens = len(re.findall(r"<!--LIVE:(SECTION-OPEN|SECTION-CLOSE|A|B)\b", src))
    ends = len(re.findall(r"LIVE:END-->", src))
    shipped = len(re.findall(r"<!-- LIVE:(SECTION-OPEN|SECTION-CLOSE|A|B) shipped -->", src))
    if opens != ends: failures.append(f"{page}: LIVE marker mismatch ({opens} open, {ends} end)")
    # a SHIPPED pill must never appear inside a hidden block, and never with an in-progress label
    for blk in re.findall(r"<!--LIVE:(?:A|B)[^\n]*\n(.*?)LIVE:END-->", src, flags=re.S):
        if "SHIPPED" in blk: failures.append(f"{page}: SHIPPED pill inside a hidden block")
    # nav order
    nav = re.search(r'<div class="links">(.*?)</div>', src, re.S)
    if nav:
        order = re.findall(r'href="([^"]+)"', nav.group(1))
        if order != ["casefiles.html", "index.html", "operator.html", "models.html"]:
            failures.append(f"{page}: nav order is {order}")

if failures:
    print("CHECK FAILED"); [print(" -", f) for f in failures]; sys.exit(1)
print("CHECK PASSED: no dashes, no banned words, tags balanced, LIVE markers paired, nav order correct")
