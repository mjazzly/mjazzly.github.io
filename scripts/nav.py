#!/usr/bin/env python3
"""The site's navigation: three shelves (Craft, Compass, Bookshelf), each
opening a panel with one line under every page, written into every page in
place of the <nav class="top"> block. Edit GROUPS here, run it, never hand-edit
a page's nav.

Run from the repo root:  python3 scripts/nav.py
"""
import pathlib, re

GROUPS = [
    ("craft", "Craft", "wrench", "What I have made, and the test record behind each piece", [
        ("aiwork.html",    "AI Work",    "cpu",    "Five AI systems, each with its test record"),
        ("casefiles.html", "Case Files", "folder", "Three client systems, told end to end"),
        ("built.html",     "Built",      "puzzle", "Everything built with Claude, from prompt to app"),
        ("index.html#systems", "Systems", "layers", "The systems I run in client work, and my stack"),
    ]),
    ("compass", "Compass", "compass", "How I think, decide and work", [
        ("operator.html", "Operator", "user",   "How I work, read through three assessments"),
        ("models.html",   "Models",   "repeat", "The five models I build by"),
        ("clarity.html",  "Clarity",  "zap",    "Four short games on working with AI"),
    ]),
    ("bookshelf", "Bookshelf", "book", "Ideas I keep, from other people and my own", [
        ("knowledge.html", "Knowledge", "bookmark", "Ideas worth keeping, learned from other people"),
        ("chapters.html",  "Chapters",  "sprout",   "Lessons from the road, in my own words"),
    ]),
]

# which page each file counts as (pages that live under an entry point at it)
HERE = {
    "index.html": "index.html#systems",
    "scorecard.html": "aiwork.html", "output-01.html": "aiwork.html", "output-01-board.html": "aiwork.html",
    "output-02.html": "aiwork.html", "output-03.html": "aiwork.html", "output-04.html": "aiwork.html",
}

PAGES = ["index.html", "built.html", "aiwork.html", "clarity.html", "scorecard.html", "output-01.html", "output-01-board.html", "output-02.html", "output-03.html", "output-04.html", "casefiles.html", "operator.html", "models.html", "knowledge.html", "chapters.html"]

def ic(name, cls="ic"):
    return f'<svg class="{cls}" aria-hidden="true"><use href="#ic-{name}"/></svg>'

def nav(page):
    here = HERE.get(page, page)
    home = page == "index.html"
    out = [f'<nav class="top{" is-home" if home else ""}" aria-label="Site"><div class="wrap">',
           '  <a class="brand" href="index.html"><span class="seam silver" aria-hidden="true"></span><span class="brand-name">Megat Jazly</span><span class="seam" aria-hidden="true"></span></a>',
           '  <div class="shelves">']
    for gid, label, icon, line, items in GROUPS:
        mine = any(href == here for href, *_ in items) and not home
        out.append(f'    <details class="shelf{" active" if mine else ""}" data-shelf="{gid}">')
        out.append(f'      <summary aria-controls="menu-{gid}">{label}{ic("chevron", "ic chev")}</summary>')
        out.append(f'      <div class="menu" id="menu-{gid}"><div class="wrap"><div class="menu-card">')
        out.append(f'        <div class="menu-head"><span class="badge badge-s">{ic(icon)}</span><span><b>{label}</b><span class="menu-line">{line}</span></span></div>')
        out.append('        <div class="menu-items">')
        for href, name, pic, desc in items:
            cur = ' aria-current="page"' if href == here else ""
            out.append(f'          <a class="go" href="{href}"{cur}><span class="badge badge-s">{ic(pic)}</span><span><b>{name}</b><span class="go-line">{desc}</span></span></a>')
        out.append('        </div>')
        out.append('      </div></div></div>')
        out.append('    </details>')
    out.append('  </div>')
    out.append('</div></nav>')
    return "\n".join(out)

if __name__ == "__main__":
    root = pathlib.Path(__file__).resolve().parent.parent
    for page in PAGES:
        p = root / page
        if not p.exists(): continue
        s = p.read_text(encoding="utf-8")
        s, n = re.subn(r'<nav class="top[^"]*"[^>]*>.*?</nav>', lambda m: nav(page), s, count=1, flags=re.S)
        p.write_text(s, encoding="utf-8")
        print(page, "nav written" if n else "NO NAV FOUND")
