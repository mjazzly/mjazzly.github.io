#!/usr/bin/env python3
"""Flip a hidden live-project block to SHIPPED on index.html and casefiles.html.

Usage (from the repo root):
  python3 scripts/ship.py A                 # ships Project A with label "SHIPPED · <current month year>"
  python3 scripts/ship.py B --label "SHIPPED · NOV 2026"
  python3 scripts/ship.py A --questions 20  # number of published questions written into the Case Files status beat

It never marks a project SHIPPED unless you run it, and it is idempotent.
"""
import argparse, datetime, pathlib, re, sys

ap = argparse.ArgumentParser()
ap.add_argument("project", choices=["A", "B"])
ap.add_argument("--label", default=None, help='status pill text, e.g. "SHIPPED · OCT 2026"')
ap.add_argument("--questions", type=int, default=20)
args = ap.parse_args()
label = args.label or f"SHIPPED · {datetime.date.today().strftime('%b %Y').upper()}"
month_year = datetime.date.today().strftime("%B %Y")

def unhide(src, key):
    """Turn <!--LIVE:key ...\\n...\\nLIVE:END--> into <!-- LIVE:key shipped -->\\n...\\n<!-- /LIVE:key -->"""
    pat = re.compile(r"<!--LIVE:" + re.escape(key) + r"[^\n]*\n(.*?)LIVE:END-->", re.S)
    return pat.sub(lambda m: f"<!-- LIVE:{key} shipped -->\n{m.group(1)}<!-- /LIVE:{key} -->", src)

def ship(page):
    p = pathlib.Path(page); s = p.read_text(encoding="utf-8")
    before = s
    s = unhide(s, "SECTION-OPEN"); s = unhide(s, "SECTION-CLOSE"); s = unhide(s, args.project)
    if args.project == "A":
        s = re.sub(r'<span class="sys-status">IN PROGRESS[^<]*</span>', f'<span class="sys-status">{label}</span>', s)
        s = s.replace("LIVE-A · SQL TRAIL · IN PROGRESS", f"LIVE-A · SQL TRAIL · {label}")
        s = re.sub(r"<p><b>In progress, September to October 2026\.</b> Trail pages are added here as each question passes review\.",
                   f"<p><b>Complete, {month_year}.</b> {args.questions} questions published with the query, the finding, and the review log.", s)
        s = s.replace("Trail pages land in <a href=\"casefiles.html\">Case Files</a> as each question passes review.",
                      "Full trail in <a href=\"casefiles.html\">Case Files</a>.")
    else:
        s = re.sub(r'<span class="sys-status">QUEUED[^<]*</span>', f'<span class="sys-status">{label}</span>', s)
        s = s.replace("LIVE-B · POWER BI DASHBOARD · QUEUED, OCTOBER TO NOVEMBER 2026", f"LIVE-B · POWER BI DASHBOARD · {label}")
    if s != before:
        p.write_text(s, encoding="utf-8"); print(f"{page}: Project {args.project} shipped ({label})")
    else:
        print(f"{page}: nothing to change (already shipped?)")

for page in ["index.html", "casefiles.html"]:
    ship(page)
print("Next: add the public link inside the shipped card if it is not there yet, then run scripts/check.py and /publish.")
