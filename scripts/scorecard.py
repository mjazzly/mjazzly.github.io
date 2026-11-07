#!/usr/bin/env python3
"""Writes the scorecard onto the site from the scorecard's records, in two places:

  aiwork.html     the WORK-05 table, between <!--SCORECARD--> and <!--/SCORECARD-->
  scorecard.html  the full page (the numbers, builds by model, the changes since the
                  last sweep, the version record), between <!--SCOREPAGE--> markers

No number is typed into either. The script asks the scorecard's own page.js to
summarise its results/ folder (the same code that writes SCORECARD.md), then
writes the HTML. Run from the repo root, with the scorecard repo beside this one:

  python3 scripts/scorecard.py                      # reads ../scorecard/results
  python3 scripts/scorecard.py --scorecard ~/Code/scorecard

It also writes the numbers in WORK-05's own text (the tile, the four numbers, the
Cost line): each sits in a <span data-sc="key">, and only the inside of that span is
replaced. A data-sc key the script does not know stops it.

  python3 scripts/scorecard.py --check              # write nothing; exit 1 if either page
                                                    # differs from the records (check.py runs this)

Needs Node 20 or later. Only what is between the markers is replaced.
"""
import argparse, datetime, html, json, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("--scorecard", default=str(ROOT.parent / "scorecard"))
ap.add_argument("--check", action="store_true", help="compare the pages with the records and write nothing")
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
const { modelTag } = await import(pathToFileURL(path.join(dir, "lib", "record.js")).href);
const settings = JSON.parse(fs.readFileSync(path.join(dir, "settings.json"), "utf8"));
const recs = loadRecords(path.join(dir, "results"));
const s = summarise(recs, settings);
const records = recs.map((r) => ({ sweep: r.sweep, cost_usd: r.cost_usd, counted: r.counted, refused: !!r.refused }));
const pick = (r) => r && { matched: r.matched, of_cases: r.of_cases, gates_held: r.gates_held, of_gates: r.of_gates,
  cost_usd: r.cost_usd, passed: r.passed, date: r.date, version: r.version, skill_version: r.skill_version,
  server_version: r.server_version, sweep: r.sweep, mode: r.mode };
const builds = Object.values(s.table).map((b) => ({ build: b.build, title: b.title, version: b.version,
  models: Object.fromEntries(Object.entries(b.models).map(([m, r]) => [m, pick(r)])),
  smallest: s.smallest[b.build]?.model_tag || null }));
const changes = (s.changes?.comparisons || []).map((c) => ({ title: c.title || c.build, model: c.model_tag, previous: c.previous || null,
  refused: c.refused || null, version: c.version, passed: c.passed, cost: c.cost,
  cases: (c.cases_changed || []).map((x) => ({ name: x.name || x.id, from: x.from, to: x.to })) }));
const versions = Object.entries(s.versions).flatMap(([build, vs]) => Object.values(vs).sort((a, b) => (a.since < b.since ? -1 : 1))
  .map((v) => ({ build, title: s.table[build]?.title || build, version: v.version, since: v.since,
    models: Object.fromEntries(Object.entries(v.models).map(([m, r]) => [m, pick(r)])) })));
const modelInfo = settings.models.map((m) => ({ tag: modelTag(m), id: m.id, effort: m.effort }));
console.log(JSON.stringify({ models: s.models, modelInfo, builds, last: s.last, sweeps: s.sweeps, changes, versions, numbers: s.numbers, unpassed: s.unpassed, records }));
"""
out = subprocess.run(["node", "--input-type=module", "-e", JS, str(sc)], capture_output=True, text=True)
if out.returncode:
    sys.exit("node failed:\n" + out.stderr)
s = json.loads(out.stdout)

esc = html.escape
models = s["models"]
info = {m["tag"]: m for m in s["modelInfo"]}
def label(i, n):
    if n == 1: return "Model"
    return "Smallest model" if i == 0 else "Largest model" if i == n - 1 else f"Model {i + 1}"
labels = {m: label(i, len(models)) for i, m in enumerate(models)}
def model_id(tag):
    m = info.get(tag)
    if not m: return tag
    return m["id"] + (f", {m['effort']} effort" if m.get("effort") else "")
money = lambda x: "no cost" if x is None else f"US${x:.3f}"
money2 = lambda x: "no cost" if x is None else f"US${x:.2f}"
def day(d):
    return datetime.date.fromisoformat(d[:10]).strftime("%-d %b %Y")
def ic(name):
    return f'<svg class="ic" aria-hidden="true"><use href="#ic-{name}"/></svg>'
def split_version(v):
    # "v2.0 / 2.1.0" is the skill version and the tool server version
    parts = [p.strip() for p in str(v).split("/")]
    return parts[0], (parts[1] if len(parts) > 1 else "")
def move(v):
    # a version move names the skill; when only the tool server moved, it names the server instead
    (a, sa), (b, sb) = split_version(v["from"]), split_version(v["to"])
    return f"{esc(a)} to {esc(b)}" if a != b else f"server {esc(sa)} to {esc(sb)}"
state = lambda v: "a match" if v is True else "a miss" if v is False else "absent"
def case_name(x):
    return x["name"].split(". ", 1)[-1].split(":")[0]
def share_words(c):
    sh = c.get("share")
    if sh is None: return ""
    pct = round(sh * 100)
    if pct == 0: return "unchanged"
    return f"{'up' if pct > 0 else 'down'} {abs(pct)}%" + (", <b>moved</b>" if c.get("moved") else "")

# A carry: a build's newer version with no counted run on a model shows that model's run on the
# version before it, when nothing the model sees changed between the two (the skill, the tools'
# names, descriptions and schemas, the data, the answer key and the checker). Each carry is checked
# by hand between the two commits named here, and its cell says what it was carried from and why.
# It lapses by itself once the newer version has its own run on that model, or the build moves on.
CARRY = [
    {"build": "data-answers", "from": "v1.1 / 1.1.0", "to": "v1.1 / 1.2.0", "commits": ("5ecb66f", "81cf558"),
     "why": "the skill, the tools as the model sees them, the data, the answer key and the checker are unchanged"},
]
carried = []
for c in CARRY:
    b = next((x for x in s["builds"] if x["build"] == c["build"]), None)
    old = next((v for v in s["versions"] if v["build"] == c["build"] and v["version"] == c["from"]), None)
    if not b or b["version"] != c["to"] or not old:
        continue
    for m in models:
        if not b["models"].get(m) and old["models"].get(m):
            b["models"][m] = {**old["models"][m], "carried": c}
            carried.append((b["title"], m))
carry_note = (" A cell marked <b>carried</b> shows the run on the version before, because nothing the model sees changed between the two."
              if carried else "")

latest = max(r["date"] for b in s["builds"] for r in b["models"].values() if r)
max_cost = max([r["cost_usd"] or 0 for b in s["builds"] for r in b["models"].values() if r] + [0.001])

# ---------------------------------------------------------------- the WORK-05 table on aiwork.html
def cell_small(r, smallest):
    if not r:
        return '<td class="empty">no counted run</td>'
    cls = ("met" if r["passed"] else "notmet") + (" smallest" if smallest else "")
    verdict = ("bar met" if r["passed"] else "bar not met") + (" · smallest passing" if smallest else "")
    gates = f'gates <b>{r["gates_held"]} of {r["of_gates"]}</b>' if r.get("of_gates") is not None else "no gates"
    carry = (f'<span class="ver">carried from {esc(split_version(r["carried"]["from"])[1])}: nothing the model sees changed</span>'
             if r.get("carried") else "")
    return (f'<td class="{cls}"><b>{r["matched"]} of {r["of_cases"]}</b> cases<br>{gates}<br>{money(r["cost_usd"])}'
            f'<span class="verdict">{verdict}</span>{carry}</td>')

rows = []
for b in s["builds"]:
    any_r = next((r for r in b["models"].values() if r), {})
    ver = any_r.get("skill_version") or split_version(b["version"])[0]
    rows.append(f'      <tr><th scope="row"><b>{esc(b["title"])}</b><span class="ver">{esc(ver)}</span></th>'
                + "".join(cell_small(b["models"].get(m), b["smallest"] == m) for m in models) + "</tr>")

moved = []
for c in s["changes"]:
    if c["refused"]:
        moved.append(f'{esc(c["title"])} on the {labels.get(c["model"], c["model"]).lower()} was refused ({esc(c["refused"].get("gate", ""))})')
        continue
    bits = []
    if c["version"].get("changed"): bits.append(f'moved from {move(c["version"])}')
    for x in c["cases"]:
        bits.append(f'the case &ldquo;{esc(case_name(x))}&rdquo; from {state(x["from"])} to {state(x["to"])}')
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
    f'<p class="score-note">Written from the scorecard\'s records: the latest counted run of each build on each model. '
    "<b>Cases</b> are the build's own test cases, matched by its own checker; <b>gates</b> are its stop and decline cases; the cost is every token at the build's own prices, "
    f"with the cache counted. The bar is each build's own pass rule.{carry_note}{since}</p>",
    f'<p class="score-open"><a href="scorecard.html">{ic("grid")}Open the full scorecard</a><span>the changes since the last sweep and every version, on one page</span></p>',
])

# ---------------------------------------------------------------- the numbers in WORK-05's own text
WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]
word = lambda k: WORDS[k] if k < len(WORDS) else str(k)
NO_ARTICLE = {"data answers"}   # named without "the" on the site
def named(title):
    t = title.lower()
    return t if t in NO_ARTICLE else "the " + t
n = s["numbers"]
recs = s["records"]
sweep_of = lambda r: (r["sweep"] or "").rstrip("r")   # a rerun counts as part of its sweep
refused = sum(1 for r in recs if r["refused"])
# the sweeps CI ran: the workflow alone commits "[ci] sweep S..." to the scorecard's history
log = subprocess.run(["git", "-C", str(sc), "log", "--format=%s"], capture_output=True, text=True).stdout
ci = [m.group(1) for m in re.finditer(r"^\[ci\] sweep (S\d+)", log, re.M)]   # newest first
ci_cost = lambda sid, rerun: sum(r["cost_usd"] or 0 for r in recs if r["counted"] and not r["refused"]
                                 and (sweep_of(r) == sid if rerun else r["sweep"] == sid))
small = models[0]
on_small = [b for b in s["builds"] if b["smallest"] == small]
on_other = [b for b in s["builds"] if b["smallest"] and b["smallest"] != small]
no_pass = [b for b in s["builds"] if not b["smallest"]]
cost_of = lambda b: b["models"][b["smallest"]]["cost_usd"] or 0
both = sum(r["cost_usd"] or 0 for b in s["builds"] for r in b["models"].values() if r)

runs_basis = f'{n["runs"] - n["imported"]} from {n["sweeps"]} sweeps'
if ci: runs_basis += f', {len(ci)} of them in CI on the smallest model,'
runs_basis += (f' and {n["imported"]} brought in from the builds\' own earlier records, marked as brought in. '
               + ("<b>None was refused</b>; a refused run stays on the record and is never counted." if not refused
                  else f"<b>{refused} {'was' if refused == 1 else 'were'} refused</b>, kept on the record and never counted."))
if len(on_small) == len(s["builds"]):
    cost_basis = f'All {word(len(on_small))} builds pass on the smallest model.'
else:
    cost_basis = (f'{word(len(on_small)).capitalize()} build{"s pass" if len(on_small) != 1 else " passes"} on the smallest model for '
                  f'<b>{money2(sum(cost_of(b) for b in on_small))} together</b>')
    for b in on_other:
        cost_basis += f'; for {named(b["title"])} the smallest passing model is the {labels[b["smallest"]].split()[0].lower()}, {money2(cost_of(b))} of the total'
    if no_pass:
        cost_basis += "; no model yet passes " + " or ".join(esc(named(b["title"])) for b in no_pass)
    cost_basis += "."
cost_basis += f' Every build on both models: {money2(both)}.'
if ci:
    cost_basis += f' The last sweep in CI, on the smallest model only, cost {money2(ci_cost(ci[0], False))}'
    with_rerun = ci_cost(ci[0], True)
    cost_basis += (f' ({money2(with_rerun)} with its rerun).' if round(with_rerun, 2) != round(ci_cost(ci[0], False), 2) else ".")
values = {
    "builds": str(n["builds"]),
    "runs": str(n["runs"]),
    "runs_basis": runs_basis,
    "sweep_cost": money2(n.get("sweep_cost")) if n.get("sweep_cost") is not None else "no full sweep yet",
    "cost_basis": cost_basis,
    "ci_cost": money2(ci_cost(ci[0], False)) if ci else "no run",
}

stale = []
def settle(page, old, new):
    """Write the page, or under --check name what differs from the records."""
    if not args.check:
        page.write_text(new, encoding="utf-8"); return
    if old == new: return
    spans = lambda t: re.findall(r'<span data-sc="(\w+)">(.*?)</span>', t, re.S)
    for (k, a), (_, b) in zip(spans(old), spans(new)):
        if a != b: stale.append(f'{page.name}: data-sc="{k}" reads "{a}", the records give "{b}"')
    if re.sub(r'<span data-sc="\w+">.*?</span>', "", old, flags=re.S) != re.sub(r'<span data-sc="\w+">.*?</span>', "", new, flags=re.S):
        stale.append(f"{page.name}: the region written from the records differs from them")

page = ROOT / "aiwork.html"
src = page.read_text(encoding="utf-8")
pat = re.compile(r"(<!--SCORECARD-->)(.*?)(<!--/SCORECARD-->)", re.S)
if not pat.search(src):
    sys.exit("aiwork.html: no <!--SCORECARD--> markers")
new = pat.sub(lambda m: m.group(1) + "\n" + block + "\n" + m.group(3), src)
def fill(m):
    if m.group(2) not in values:
        sys.exit(f'aiwork.html: data-sc="{m.group(2)}" is not a number this script writes ({", ".join(values)})')
    return m.group(1) + values[m.group(2)] + m.group(3)
new = re.sub(r'(<span data-sc="(\w+)">).*?(</span>)', fill, new, flags=re.S)
settle(page, src, new)
if not args.check:
    print(f"aiwork.html: scorecard written ({len(s['builds'])} builds, {len(models)} models, records to {latest[:10]}; "
          f"{len(re.findall(r'data-sc=', new))} numbers in the text)")

# ---------------------------------------------------------------- the full page, scorecard.html
n = s["numbers"]
sweep_cost = n.get("sweep_cost")
tiles = [
    ("layers", str(n["builds"]), "builds, every one rerun by one command",
     f'The {["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"][n["builds"]] if n["builds"] < 10 else n["builds"]} builds on the AI Work page. '
     "Each keeps <b>its own test cases, its own checker and its own pass rule</b>; the scorecard runs them and takes their verdicts."),
    ("circle-check", str(n["runs"]), "counted runs on the record",
     (f'{n["runs"] - n["imported"]} from the scorecard\'s own sweeps and {n["imported"]} brought in from the builds\' earlier records. ' if n.get("imported") else "")
     + "<b>A run the model could have cheated on is refused</b> and never counted."),
    ("repeat", str(n["sweeps"]), "sweeps so far",
     "A sweep is <b>one run of every build on every model</b>, started by one command. The latest is compared with the one before it, build by build."),
    ("chart", money2(sweep_cost) if sweep_cost is not None else f'{n["builds"] - len(s["unpassed"])} of {n["builds"]}',
     "for one full sweep on the cheapest passing models" if sweep_cost is not None else "builds with a passing model",
     "Each build on <b>the smallest model that meets its bar</b>, every token at the build's own prices, with the cache counted." if sweep_cost is not None
     else "No model yet passes " + ", ".join(esc(u) for u in s["unpassed"]) + "."),
]
tile_html = "\n".join(
    f'    <div class="tile"><span class="badge">{ic(i)}</span><div class="n">{esc(num)}</div><div class="what">{what}</div><div class="basis">{basis}</div></div>'
    for i, num, what, basis in tiles)

def cell_big(r, smallest):
    if not r:
        return '<td class="empty">no counted run</td>'
    cls = ("met" if r["passed"] else "notmet") + (" smallest" if smallest else "")
    w = max(1.5, (r["cost_usd"] or 0) / max_cost * 100)
    gates = f'gates held <b>{r["gates_held"]} of {r["of_gates"]}</b>' if r.get("of_gates") is not None else "no gates in this set"
    verdict = (f'{ic("check")}bar met' if r["passed"] else "bar not met") + (" · smallest passing" if smallest else "")
    c = r.get("carried")
    carry = (f'<div class="held">Carried from {esc(split_version(c["from"])[1])}, run <span class="mono">{esc(r["sweep"])}</span>: '
             f'{esc(c["why"])} in {esc(split_version(c["to"])[1])}.</div>' if c else "")
    return (f'<td class="{cls}"><div class="cases">{r["matched"]} of {r["of_cases"]}<small>cases</small></div>'
            f'<div class="held">{gates}</div>'
            f'<div class="cost"><svg class="costbar" viewBox="0 0 100 6" preserveAspectRatio="none" aria-hidden="true"><rect class="track" width="100" height="6" rx="3"/><rect class="fill" width="{w:.1f}" height="6" rx="3"/></svg>{money(r["cost_usd"])}</div>'
            f'<span class="verdict">{verdict}</span>{carry}</td>')

big_rows = []
for b in s["builds"]:
    skill, server = split_version(b["version"])
    big_rows.append(f'        <tr><th scope="row"><b>{esc(b["title"])}</b><span class="ver">{esc(skill)}</span>'
                    + (f'<span class="ver faint">server {esc(server)}</span>' if server else "") + "</th>"
                    + "".join(cell_big(b["models"].get(m), b["smallest"] == m) for m in models) + "</tr>")
head = "".join(f'<th scope="col">{labels[m]}<span class="model-id">{esc(model_id(m))}</span></th>' for m in models)

change_rows = []
for c in s["changes"]:
    mlabel = labels.get(c["model"], c["model"]).lower()
    if c["refused"]:
        change_rows.append(f'        <tr><td><b>{esc(c["title"])}</b></td><td>{mlabel}</td><td>refused</td><td colspan="4">{esc(c["refused"].get("gate", ""))}: {esc(c["refused"].get("detail", ""))}</td></tr>')
        continue
    v = c["version"]
    ver = (f'<b>{move(v)}</b>' if v.get("changed") else esc(split_version(v["to"])[0]))
    cases = "<br>".join(f'<b>{esc(case_name(x))}</b>: {state(x["from"])} to {state(x["to"])}' for x in c["cases"]) or "none"
    cost = c["cost"]
    cost_txt = (f'{money(cost.get("from"))} to {money(cost.get("to"))}<br><span class="faint">{share_words(cost)}</span>' if c["previous"] else money(cost.get("to")))
    p = c["passed"]
    bar = (f'<b>{"met" if p["from"] else "not met"} to {"met" if p["to"] else "not met"}</b>' if p.get("changed") else ("met" if p["to"] else "not met"))
    prev = f'<span class="mono">{esc(c["previous"])}</span>' if c["previous"] else "first record"
    change_rows.append(f'        <tr><td><b>{esc(c["title"])}</b></td><td>{mlabel}</td><td>{prev}</td><td>{ver}</td><td>{cases}</td><td>{cost_txt}</td><td>{bar}</td></tr>')
tol = next((c["cost"].get("tolerance") for c in s["changes"] if c.get("cost")), 0.3) or 0.3

version_rows = []
for v in s["versions"]:
    skill, server = split_version(v["version"])
    cells = "".join(
        (f'<td>{v["models"][m]["matched"]} of {v["models"][m]["of_cases"]}, {"met" if v["models"][m]["passed"] else "not met"}</td>' if v["models"].get(m) else "<td></td>")
        for m in models)
    version_rows.append(f'        <tr><td><b>{esc(v["title"])}</b></td><td><span class="mono">{esc(skill)}</span>' + (f' <span class="faint">server {esc(server)}</span>' if server else "") + f'</td><td>{day(v["since"])}</td>{cells}</tr>')

page_block = "\n".join([
    '<section id="numbers">',
    '  <div class="tiles four">',
    tile_html,
    "  </div>",
    "</section>",
    "",
    '<section id="builds">',
    f'  <h2><span class="badge">{ic("grid")}</span>Builds by model</h2>',
    f'  <p class="lead">The latest counted run of each build on each model. <b>Cases</b> are the build\'s own test cases, matched by its own checker. <b>Gates</b> are the cases where the build must stop or decline. The cost is every token at the build\'s own prices, with the cache counted, and <b>the bars share one scale</b> across the table.{carry_note}</p>',
    '  <div class="panel table">',
    '    <table class="costs">',
    f'      <thead><tr><th scope="col">Build</th>{head}</tr></thead>',
    "      <tbody>",
    *big_rows,
    "      </tbody>",
    "    </table>",
    "  </div>",
    '  <p class="note">The <b>bar</b> is each build\'s own pass rule, and <b>smallest passing</b> marks the cheapest model that meets it.</p>',
    "</section>",
    "",
    '<section id="changes">',
    f'  <h2><span class="badge">{ic("repeat")}</span>Changes since the last sweep</h2>',
    f'  <p class="lead">Sweep <span class="mono">{esc(s["last"] or "")}</span>, each run set against the previous counted run of the same build on the same model. A case that changed state is named. A cost that moved by more than {round(tol * 100)}% is marked <b>moved</b>.</p>',
    '  <div class="panel table">',
    '    <table class="plain">',
    '      <thead><tr><th scope="col">Build</th><th scope="col">Model</th><th scope="col">Compared with</th><th scope="col">Version</th><th scope="col">Cases that changed</th><th scope="col">Cost</th><th scope="col">Bar</th></tr></thead>',
    "      <tbody>",
    *change_rows,
    "      </tbody>",
    "    </table>",
    "  </div>",
    '  <p class="note">A run id starting with <span class="mono">S</span> is one of the scorecard\'s own sweeps; <span class="mono">I</span> marks a run brought in from the build\'s own records.</p>',
    "</section>",
    "",
    '<section id="versions">',
    f'  <h2><span class="badge">{ic("list")}</span>Version record</h2>',
    '  <p class="lead">Every version of every build that has a counted run, with its latest result on each model. <b>A version moves only after a run</b>, and the run that earned it is on the record.</p>',
    '  <div class="panel table">',
    '    <table class="plain">',
    '      <thead><tr><th scope="col">Build</th><th scope="col">Version</th><th scope="col">First recorded</th>' + "".join(f'<th scope="col">{labels[m]}</th>' for m in models) + '</tr></thead>',
    "      <tbody>",
    *version_rows,
    "      </tbody>",
    "    </table>",
    "  </div>",
    "</section>",
])

page = ROOT / "scorecard.html"
src = page.read_text(encoding="utf-8")
pat = re.compile(r"(<!--SCOREPAGE-->)(.*?)(<!--/SCOREPAGE-->)", re.S)
if not pat.search(src):
    sys.exit("scorecard.html: no <!--SCOREPAGE--> markers")
new = pat.sub(lambda m: m.group(1) + "\n" + page_block + "\n" + m.group(3), src)
new = re.sub(r"(<!--ASOF-->).*?(<!--/ASOF-->)", lambda m: m.group(1) + "the latest sweep" + m.group(2), new, flags=re.S)   # no date: the site never shows when it was last updated (4 Nov 2026)
settle(page, src, new)
if args.check:
    if stale:
        print("\n".join(stale)); sys.exit(1)
    print(f"scorecard: both pages match the records to {latest[:10]}")
else:
    print(f"scorecard.html: page written ({len(s['changes'])} changes, {len(s['versions'])} version rows)")
