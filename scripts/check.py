#!/usr/bin/env python3
"""Pre-publish checks for mjazzly.github.io. Exit 1 on any failure.
Run from the repo root: python3 scripts/check.py
"""
import re, sys, json, pathlib, html.parser, subprocess

PAGES = ["index.html", "built.html", "aiwork.html", "clarity.html", "frames.html", "deconstruct.html", "scorecard.html", "output-01.html", "output-01-board.html", "output-02.html", "output-03.html", "output-04.html", "output-06.html", "casefiles.html", "operator.html", "models.html", "knowledge.html", "chapters.html"]
BANNED_WORDS = ["marketing", "enablement", "agentic", "FDE", "real users"]   # never on the site, in any case
BANNED_CHARS = {"\u2014": "em dash", "\u2013": "en dash"}
failures = []

class Balance(html.parser.HTMLParser):
    VOID = {"meta", "link", "br", "img", "input", "hr", "source", "track"}
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
    want = ["aiwork.html", "casefiles.html", "built.html", "index.html#systems", "operator.html", "models.html", "clarity.html", "frames.html", "deconstruct.html", "knowledge.html", "chapters.html"]
    if order != want:
        failures.append(f"{page}: nav pages are {order}, run scripts/nav.py")

# The walk (tour.js): every stop that is on opens on a page of the site, at an anchor that exists, and lights
# parts that sit inside it; its words keep the site's rules; the start links point at stop 1 and count the stops
class Tree(html.parser.HTMLParser):
    VOID = Balance.VOID
    def __init__(self):
        super().__init__(); self.nodes = []; self.open = []
    def handle_starttag(self, t, a):
        a = dict(a)
        self.nodes.append({"tag": t, "id": a.get("id"), "cls": (a.get("class") or "").split(), "attrs": a,
                           "up": self.open[-1] if self.open else None})
        if t not in self.VOID: self.open.append(len(self.nodes) - 1)
    def handle_endtag(self, t):
        for k in range(len(self.open) - 1, -1, -1):
            if self.nodes[self.open[k]]["tag"] == t: del self.open[k:]; break

def simple(node, sel):
    m = re.fullmatch(r"([a-z0-9]*)((?:[#.][\w-]+)*)", sel)
    if not m: return False
    if m.group(1) and node["tag"] != m.group(1): return False
    for kind, name in re.findall(r"([#.])([\w-]+)", m.group(2)):
        if kind == "#" and node["id"] != name: return False
        if kind == "." and name not in node["cls"]: return False
    return True

def select(tree, query):
    *ups, last = query.split()
    found = []
    for i, node in enumerate(tree.nodes):
        if not simple(node, last): continue
        want, up = list(ups), node["up"]
        while want and up is not None:
            if simple(tree.nodes[up], want[-1]): want.pop()
            up = tree.nodes[up]["up"]
        if not want: found.append(node)
    return found

tour = pathlib.Path("tour.js")
if not tour.exists():
    failures.append("tour.js: missing")
else:
    tsrc = tour.read_text(encoding="utf-8")
    m = re.search(r"/\*STOPS\*/(.*?)/\*/STOPS\*/", tsrc, re.S)
    try: stops = json.loads(m.group(1)) if m else None
    except ValueError as e: stops = None; failures.append(f"tour.js: the stop list is not plain JSON ({e})")
    if m is None: failures.append("tour.js: no stop list between the STOPS markers")
    for ch, name in BANNED_CHARS.items():
        if ch in tsrc: failures.append(f"tour.js: {name} in the walk")
    words = " ".join(re.findall(r'"(?:try|shows)":\s*"([^"]*)"', tsrc) + re.findall(r'END_LINE = "([^"]*)"', tsrc))
    for w in BANNED_WORDS + [r"\bwar\b", r"\bthings?\b"]:
        if re.search(w, words, flags=re.I): failures.append(f"tour.js: banned word '{w}' in the card words")
    on = [s for s in (stops or []) if s.get("on")]
    for k, s in enumerate(on, 1):
        page = pathlib.Path(s["page"])
        if s["page"] not in PAGES or not page.exists():
            failures.append(f"tour.js stop {k}: page {s['page']} is not on the site"); continue
        src = page.read_text(encoding="utf-8")
        tree = Tree(); tree.feed(src)
        if not select(tree, "#" + s["anchor"]):
            failures.append(f"tour.js stop {k}: no #{s['anchor']} on {s['page']}"); continue
        scripts = "".join(pathlib.Path(x).read_text(encoding="utf-8") for x in re.findall(r'<script src="([\w.-]+\.js)', src) if pathlib.Path(x).exists())
        for q in s["lit"]:
            if not q.startswith("#" + s["anchor"] + " "):
                failures.append(f"tour.js stop {k}: lit part '{q}' does not start inside #{s['anchor']}")
            elif not select(tree, q):
                # a part the page's own script draws (the Check-in's printed pass) passes when that script names it
                drawn = re.search(r"[.]([\w-]+)$", q)
                if not (drawn and f'"{drawn.group(1)}"' in scripts):
                    failures.append(f"tour.js stop {k}: lit part '{q}' not found on {s['page']}")
        if s.get("open"):
            links = select(tree, s["open"])
            if not links or links[0]["tag"] != "a" or links[0]["attrs"].get("target") != "_blank":
                failures.append(f"tour.js stop {k}: its Open it link '{s['open']}' is not an outside link on {s['page']}")
        ic = f'id="ic-{s["icon"]}"'
        if ic not in src: failures.append(f"tour.js stop {k}: icon ic-{s['icon']} is not in the sprite")
    if on:
        first = f'href="{on[0]["page"]}?tour=1#{on[0]["anchor"]}"'
        say = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"][len(on)] + " stops"
        for page in ("index.html", "aiwork.html"):
            line = re.search(r'<p class="tour-start">(.*?)</p>', pathlib.Path(page).read_text(encoding="utf-8"))
            if not line or first not in line.group(1):
                failures.append(f"{page}: the start link does not point at stop 1 ({first})")
            elif say not in line.group(1):
                failures.append(f"{page}: the start link does not say '{say}'")

# WORK-05 and the Scorecard page against the scorecard's records: the table and every data-sc number
sc = pathlib.Path("..", "scorecard")
if not (sc / "results").is_dir():
    failures.append("../scorecard not found: WORK-05's numbers cannot be checked against its records")
else:
    try:
        fetched = subprocess.run(["git", "-C", str(sc), "fetch", "--quiet"], capture_output=True, timeout=30).returncode == 0
    except subprocess.TimeoutExpired:
        fetched = False
    behind = subprocess.run(["git", "-C", str(sc), "rev-list", "--count", "HEAD..@{u}"], capture_output=True, text=True).stdout.strip()
    if not fetched:
        print("note: ../scorecard could not be fetched; WORK-05 checked against its local records")
    elif behind not in ("", "0"):
        failures.append(f"../scorecard is {behind} commit(s) behind its origin: pull it, then run scripts/scorecard.py")
    r = subprocess.run([sys.executable, "scripts/scorecard.py", "--check"], capture_output=True, text=True)
    if r.returncode:
        failures += [f"{line}: run scripts/scorecard.py" for line in (r.stdout + r.stderr).strip().splitlines()]

# Deconstruct: every word of its pieces lives in deconstruct.js, so the word rules are checked there too;
# DECONSTRUCT-03's record and the page's no-JavaScript view must match what scripts/deconstruct.py writes
dj = pathlib.Path("deconstruct.js")
if not dj.exists():
    failures.append("deconstruct.js: missing")
else:
    dsrc = dj.read_text(encoding="utf-8")
    for ch, name in BANNED_CHARS.items():
        if ch in dsrc: failures.append(f"deconstruct.js: {dsrc.count(ch)} {name}(s)")
    for w in BANNED_WORDS + [r"\bwar\b", r"\bthings?\b"]:
        for m in re.finditer(w, dsrc, flags=re.I):
            failures.append(f"deconstruct.js: banned word '{w}' at line ~{dsrc[:m.start()].count(chr(10)) + 1}")
    if re.search(r"(?:US)?\$\s?\d|\bUSD\b|\bRM\s?\d", dsrc): failures.append("deconstruct.js: a money amount")
    r = subprocess.run([sys.executable, "scripts/deconstruct.py", "--check"], capture_output=True, text=True)
    if r.returncode:
        failures += [f"{line}: run scripts/deconstruct.py" for line in (r.stdout + r.stderr).strip().splitlines()]

if failures:
    print("CHECK FAILED"); [print(" -", f) for f in failures]; sys.exit(1)
print("CHECK PASSED: no dashes, no banned words, tags balanced, LIVE markers paired, nav shelves correct, every stop of the walk in place, scorecard numbers match its records, Deconstruct current with its record")
