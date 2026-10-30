#!/usr/bin/env python3
"""Writes the scorecard table on aiwork.html (WORK-05) from the scorecard's records.

The numbers are never typed into the page. This script asks the scorecard's own
page.js to summarise its results/ folder (the same code that writes SCORECARD.md),
then writes the table between <!--SCORECARD--> and <!--/SCORECARD--> in aiwork.html.
Run from the repo root, with the scorecard repo beside this one:

  python3 scripts/scorecard.py                      # reads ../scorecard/results
  python3 scripts/scorecard.py --scorecard ~/Code/scorecard

Needs Node 20 or later. Only what is between the markers is replaced.
"""
import argparse, datetime, html, json, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("--scorecard", default=str(ROOT.parent / "scorecard"))
args = ap.parse_args()
sc = pathlib.Path(args.scorecard).expanduser().resolve()
if not (sc / "page.js").exists() or not (sc / "results").is_dir():
    sys.exit(f"no scorecard at {sc} (page.js and results/ expected)")

JS = r"""
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const dir = process.argv[1];
const { loadRecords } = await import(pathToFileURL(path.join(dir, "compare.js")).href);
const { summarise } = await import(pathToFileURL(path.join(dir, "page.js")).href);
const settings = JSON.parse(fs.readFileSync(path.join(dir, "settings.json"), "utf8"));
const s = summarise(loadRecords(path.join(dir, "results")), settings);
const pick = (r) => r && { matched: r.matched, of_cases: r.of_cases, gates_held: r.gates_held, of_gates: r.of_gates,
  cost_usd: r.cost_usd, passed: r.passed, date: r.date, version: r.version, skill_version: r.skill_version };
const builds = Object.values(s.table).map((b) => ({ build: b.build, title: b.title, version: b.version,
  models: Object.fromEntries(Object.entries(b.models).map(([m, r]) => [m, pick(r)])),
  smallest: s.smallest[b.build]?.model_tag || null }));
const changes = (s.changes?.comparisons || []).map((c) => ({ title: c.title || c.build, model: c.model_tag, refused: c.refused || null,
  version: c.version, passed: c.passed, cases: (c.cases_changed || []).map((x) => ({ name: x.name || x.id, from: x.from, to: x.to })) }));
console.log(JSON.stringify({ models: s.models, builds, last: s.last, changes, numbers: s.numbers }));
"""
out = subprocess.run(["node", "--input-type=module", "-e", JS, str(sc)], capture_output=True, text=True)
if out.returncode:
    sys.exit("node failed:\n" + out.stderr)
s = json.loads(out.stdout)

esc = html.escape
models = s["models"]
def label(i, n):
    if n == 1: return "Model"
    return "Smallest model" if i == 0 else "Largest model" if i == n - 1 else f"Model {i + 1}"
labels = {m: label(i, len(models)) for i, m in enumerate(models)}
money = lambda x: "no cost" if x is None else f"US${x:.3f}"
def day(d):
    return datetime.date.fromisoformat(d[:10]).strftime("%-d %b %Y")

def cell(r, smallest):
    if not r:
        return '<td class="empty">no counted run</td>'
    cls = ("met" if r["passed"] else "notmet") + (" smallest" if smallest else "")
    verdict = ("bar met" if r["passed"] else "bar not met") + (" · smallest passing" if smallest else "")
    gates = f'gates <b>{r["gates_held"]} of {r["of_gates"]}</b>' if r.get("of_gates") is not None else "no gates"
    return (f'<td class="{cls}"><b>{r["matched"]} of {r["of_cases"]}</b> cases<br>{gates}<br>{money(r["cost_usd"])}'
            f'<span class="verdict">{verdict}</span></td>')

rows = []
for b in s["builds"]:
    any_r = next((r for r in b["models"].values() if r), {})
    ver = any_r.get("skill_version") or b["version"]
    rows.append(f'      <tr><th scope="row"><b>{esc(b["title"])}</b><span class="ver">{esc(ver)}</span></th>'
                + "".join(cell(b["models"].get(m), b["smallest"] == m) for m in models) + "</tr>")

latest = max(r["date"] for b in s["builds"] for r in b["models"].values() if r)
state = lambda v: "a match" if v is True else "a miss" if v is False else "absent"
moved = []
for c in s["changes"]:
    if c["refused"]:
        moved.append(f'{esc(c["title"])} on the {labels.get(c["model"], c["model"]).lower()} was refused ({esc(c["refused"].get("gate", ""))})')
        continue
    bits = []
    if c["version"].get("changed"): bits.append(f'moved from {esc(c["version"]["from"].split(" / ")[0])} to {esc(c["version"]["to"].split(" / ")[0])}')
    for x in c["cases"]:
        name = x["name"].split(". ", 1)[-1].split(":")[0]
        bits.append(f'the case &ldquo;{esc(name)}&rdquo; from {state(x["from"])} to {state(x["to"])}')
    if c["passed"].get("changed"): bits.append("the bar is now " + ("met" if c["passed"]["to"] else "not met"))
    if bits: moved.append(f'{esc(c["title"])} on the {labels.get(c["model"], c["model"]).lower()}: ' + ", ".join(bits))
since = (f' In the latest sweep, against each build\'s previous run: <b>{"; ".join(moved)}</b>.' if moved
         else " The latest sweep changed no case.")

block = "\n".join([
    '<div class="scoretable">',
    '  <table>',
    '    <thead><tr><th scope="col">Build</th>' + "".join(f'<th scope="col">{labels[m]}</th>' for m in models) + "</tr></thead>",
    "    <tbody>",
    *rows,
    "    </tbody>",
    "  </table>",
    "</div>",
    f'<p class="score-note">Written from the scorecard\'s records on {day(latest)}: the latest counted run of each build on each model. '
    "<b>Cases</b> are the build's own test cases, matched by its own checker; <b>gates</b> are its stop and decline cases; the cost is every token at the build's own prices, "
    f"with the cache counted. The bar is each build's own pass rule.{since}</p>",
])

page = ROOT / "aiwork.html"
src = page.read_text(encoding="utf-8")
pat = re.compile(r"(<!--SCORECARD-->)(.*?)(<!--/SCORECARD-->)", re.S)
if not pat.search(src):
    sys.exit("aiwork.html: no <!--SCORECARD--> markers")
new = pat.sub(lambda m: m.group(1) + "\n" + block + "\n" + m.group(3), src)
page.write_text(new, encoding="utf-8")
print(f"aiwork.html: scorecard written ({len(s['builds'])} builds, {len(models)} models, records to {latest[:10]})")
