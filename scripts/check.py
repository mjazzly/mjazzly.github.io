#!/usr/bin/env python3
"""Pre-publish checks for mjazzly.github.io. Exit 1 on any failure.
Run from the repo root: python3 scripts/check.py
"""
import re, sys, pathlib, html.parser

PAGES = ["index.html", "built.html", "aiwork.html", "clarity.html", "scorecard.html", "output-01.html", "output-01-board.html", "output-02.html", "output-03.html", "output-04.html", "casefiles.html", "operator.html", "models.html", "knowledge.html", "chapters.html"]
BANNED_WORDS = ["marketing", "enablement", "agentic", "FDE", "real users"]   # never on the site, in any case
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
    # nav: the three shelves, in order, with every page under its shelf (written by scripts/nav.py)
    shelves = re.findall(r'data-shelf="([a-z]+)"', src)
    if shelves != ["craft", "compass", "bookshelf"]:
        failures.append(f"{page}: shelves are {shelves}, run scripts/nav.py")
    navm = re.search(r'<nav class="top.*?</nav>', src, re.S)
    order = re.findall(r'class="go" href="([^"]+)"', navm.group(0)) if navm else []
    want = ["aiwork.html", "casefiles.html", "built.html", "index.html#systems", "operator.html", "models.html", "clarity.html", "knowledge.html", "chapters.html"]
    if order != want:
        failures.append(f"{page}: nav pages are {order}, run scripts/nav.py")

if failures:
    print("CHECK FAILED"); [print(" -", f) for f in failures]; sys.exit(1)
print("CHECK PASSED: no dashes, no banned words, tags balanced, LIVE markers paired, nav shelves correct")
