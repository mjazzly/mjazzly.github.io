#!/usr/bin/env python3
"""Write the data regions of dashboards.html from the dashboard's own records. Never type into them.

What it reads, all in ../data-answers (read only; this script never runs git there):
  dashboard/report/Branch review.Report   the position of every part of the report page (visual.json)
  results/dashboard/D*.json                the newest agreement record (the check's result)
  metrics.json                             the definitions, word for word
  lib/store.js over data/orders.csv        the guided read's numbers, computed by the data answers
                                           assistant's own code over the rows it reads (export batch 1)

What it writes into dashboards.html:
  <!--DASH:01-->     the picture and the guided read (its words are the constants below)
  <!--DASHRUN:01-->  the record's one line, in view above its fold: the check's run id and its result
  <!--DASHREC:01-->  the record behind the fold: the four numbers, what was left out and why, the definitions

Usage, from the repo root:
  python3 scripts/dashboards.py                    write both regions
  python3 scripts/dashboards.py --check            fail when the page is behind its records (scripts/check.py runs this)
  python3 scripts/dashboards.py --shoot            retake the desktop picture from the public link, then write
"""
import sys, re, json, glob, html, pathlib, subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
DA = ROOT.parent / "data-answers"
PAGE = ROOT / "dashboards.html"
PICS = ROOT / "dashboards"
DESKTOP = PICS / "dash-01-desktop.png"
URL = ("https://app.powerbi.com/view?r=eyJrIjoiYjFhM2Q3OGEtNzkwOS00ZjRlLWE0MDktY2RmMTNhNjUxODEyIiwidCI6ImY0ZjM0NzE0LWYz"
       "ZTEtNGY1NC04ZTg0LTYxYWQyYWQ3ZWRkNCIsImMiOjEwfQ%3D%3D")
REPORT = DA / "dashboard" / "report" / "Branch review.Report" / "definition" / "pages"
MONTH = "2025-12"          # the month the report opens on (its month slicer's default)
REPO = "https://github.com/mjazzly/data-answers/blob/main/"

# ---------- the guided read: the words, in the order the decision is made ----------
# Each step names the part of the report it lights (a visual id in the report's own files), the
# question that part answers, the decision it feeds, and a line read from the numbers below.
OPEN = {"q": "Which branches need attention next month?",
        "line": "Five parts of the page answer it, in the order the decision is made.",
        "go": "Show me"}
STEPS = [
    {"vis": "efd81aa51069ac7b3b06", "part": "The five cards",
     "q": "How did the month go across all branches?",
     "feeds": "It sets the bar every branch is judged against."},
    {"vis": "3a97575865e001e6d5e1", "part": "The branch table",
     "q": "Which branches fall short of that bar?",
     "feeds": "The shortlist for next month's attention."},
    {"vis": "d457b5fc8debc0290a98", "part": "Revenue by month",
     "q": "Is it one month, or a pattern?",
     "feeds": "Whether to act now or keep watching."},
    {"vis": "1d345d352d17adae1098", "part": "Revenue by category",
     "q": "Where in a branch does the revenue come from?",
     "feeds": "Which kind of product to look at first."},
    {"vis": "7e5a4c93a9c53b23cd18", "part": "Revenue by channel",
     "q": "Through which channel does it come?",
     "feeds": "Whether the fix belongs in store, online or by phone."},
]
FREE = {"q": "The amber mark, in plain words",
        "line": ("A branch is marked amber when more of its orders came back than across all branches, "
                 "or its revenue fell on the month before. The mark says where to look first, not what went wrong."),
        "again": "Start again"}
NEXT, BACK = "Next", "Back"

WORDS = "zero one two three four five six seven eight nine ten eleven twelve".split()
ORD = "highest second third fourth fifth sixth seventh eighth ninth tenth eleventh twelfth".split()

# ---------- the numbers, from the assistant's own code ----------
NODE = r"""
import fs from "node:fs"; import path from "node:path"; import os from "node:os"; import url from "node:url";
const DA = process.argv[1], MONTH = process.argv[2];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dash-"));
fs.copyFileSync(path.join(DA, "data", "orders.csv"), path.join(tmp, "orders.csv"));
const { Store } = await import(url.pathToFileURL(path.join(DA, "lib", "store.js")).href);
const s = await Store.open(tmp, "SITE");
const run = async (metric, dims, period) => {
  const b = await s.runMetric({ metric, dimensions: dims, filters: {}, period });
  if (b.status !== "ANSWER") throw new Error(metric + " " + period + ": " + b.status + " " + (b.message || b.question || ""));
  return dims.length ? Object.fromEntries(b.rows.map((r) => [r.group, r.value])) : b.value;
};
const out = { rows: (await s.meta()).rows, all: {}, by: {} };
for (const m of ["revenue", "net_revenue", "returns_rate", "average_order_value", "mom_growth"]) out.all[m] = await run(m, [], MONTH);
for (const m of ["net_revenue", "returns_rate", "mom_growth"]) out.by[m] = await run(m, ["branch"], MONTH);
out.months = await run("revenue", ["month"], MONTH.slice(0, 4));
out.category = await run("revenue_share", ["category"], MONTH);
out.channel = await run("revenue_share", ["channel"], MONTH);
await s.close(); fs.rmSync(tmp, { recursive: true, force: true });
console.log(JSON.stringify(out));
"""

def numbers():
    r = subprocess.run(["node", "--input-type=module", "-e", NODE, str(DA), MONTH], capture_output=True, text=True, cwd=str(ROOT))
    if r.returncode: sys.exit("the assistant's code did not run:\n" + r.stderr.strip())
    return json.loads(r.stdout)

def month_name(m, prev=False):
    import datetime
    y, mo = map(int, m.split("-"))
    if prev: y, mo = (y - 1, 12) if mo == 1 else (y, mo - 1)
    return datetime.date(y, mo, 1).strftime("%B")

def comma(v):
    a, _, b = v.partition(".")
    neg = a.startswith("-"); a = a.lstrip("-")
    return ("-" if neg else "") + f"{int(a):,}" + ("." + b if b else "")

def listing(xs):
    return xs[0] if len(xs) == 1 else ", ".join(xs[:-1]) + " and " + xs[-1]

def says(n):
    """One line per step, every number and name read from n."""
    a, mon, prev = n["all"], month_name(MONTH), month_name(MONTH, prev=True)
    g = float(a["mom_growth"])
    s1 = f"{mon}: {comma(a['revenue'])} revenue, {a['returns_rate']}% of orders returned, {'up' if g >= 0 else 'down'} {a['mom_growth'].lstrip('-')}% on {prev}."
    rate = float(a["returns_rate"])
    rank = sorted(n["by"]["net_revenue"], key=lambda b: -float(n["by"]["net_revenue"][b]))
    flagged = [b for b in rank if float(n["by"]["returns_rate"][b]) > rate or float(n["by"]["mom_growth"].get(b) or 0) < 0]
    s2 = f"{WORDS[len(flagged)].capitalize()} of {WORDS[len(rank)]} marked amber: {listing(flagged)}."
    ms = list(n["months"].items()); vals = [float(v) for _, v in ms]
    i = [m for m, _ in ms].index(MONTH); pos = sorted(vals, reverse=True).index(vals[i])
    streak = 0
    while i - streak > 0 and vals[i - streak] > vals[i - streak - 1]: streak += 1
    s3 = f"{mon} is the {ORD[pos]} of the {WORDS[len(ms)]} months" + (f", after {WORDS[streak]} rises in a row." if streak > 1 else ".")
    cat = sorted(n["category"].items(), key=lambda kv: -float(kv[1]))
    s4 = f"{cat[0][0]} brings {cat[0][1]}% of {mon}'s revenue; pick a branch and this follows."
    ch = sorted(n["channel"].items(), key=lambda kv: -float(kv[1]))
    s5 = f"{ch[0][0]} takes {ch[0][1]}% of {mon}'s revenue, {ch[-1][0]} the least."
    for s in (s1, s2, s3, s4, s5):
        if len(s.split()) > 15: sys.exit(f"answer line over fifteen words: {s}")
    return [s1, s2, s3, s4, s5], flagged, rank

# ---------- the report's own positions ----------
def boxes():
    pages = glob.glob(str(REPORT / "*" / "page.json"))
    if len(pages) != 1: sys.exit(f"expected one report page under {REPORT}, found {len(pages)}")
    pg = json.loads(pathlib.Path(pages[0]).read_text())
    vis = pathlib.Path(pages[0]).parent / "visuals"
    out = {}
    for st in STEPS:
        f = vis / st["vis"] / "visual.json"
        if not f.exists(): sys.exit(f"missing {f}: the report's visual ids changed, update STEPS")
        p = json.loads(f.read_text())["position"]
        out[st["vis"]] = [round(p[k]) for k in ("x", "y", "width", "height")]
    return (pg["width"], pg["height"]), out

# ---------- the record ----------
def record():
    rs = sorted(glob.glob(str(DA / "results" / "dashboard" / "D*.json")))
    if not rs: sys.exit("no agreement record in ../data-answers/results/dashboard")
    return json.loads(pathlib.Path(rs[-1]).read_text())

def metrics():
    return {m["name"]: m for m in json.loads((DA / "metrics.json").read_text())["metrics"]}

E = html.escape

def region_01(n, size, bx):
    lines, flagged, rank = says(n)
    W, H = size
    alt = (f"The Branch review report on its opening view, {month_name(MONTH)} {MONTH[:4]} and all branches: five cards, "
           f"the {WORDS[len(rank)]} branches ranked by net revenue with {WORDS[len(flagged)]} marked amber, revenue by month, "
           f"and revenue by category and by channel.")
    o = [f'<div class="db-stage" id="dash-01-stage" data-w="{W}" data-h="{H}">',
         f'<figure class="db-pic"><img src="{DESKTOP.relative_to(ROOT)}" width="{W}" height="{H}" alt="{E(alt)}"></figure>',
         f'<ol class="db-steps" data-q="{E(OPEN["q"])}" data-line="{E(OPEN["line"])}" data-go="{E(OPEN["go"])}" '
         f'data-next="{NEXT}" data-back="{BACK}" data-free-q="{E(FREE["q"])}" data-free-line="{E(FREE["line"])}" data-again="{E(FREE["again"])}">']
    for st, line in zip(STEPS, lines):
        x, y, w, h = bx[st["vis"]]
        o.append(f'<li data-box="{x} {y} {w} {h}"><span class="db-part">{E(st["part"])}</span><h3>{E(st["q"])}</h3>'
                 f'<p class="db-feeds"><b>It feeds:</b> {E(st["feeds"])}</p><p class="db-say">{E(line)}</p></li>')
    o.append('</ol>')
    o.append(f'<p class="db-rule"><b>{E(FREE["q"])}:</b> {E(FREE["line"])}</p>')
    o.append('</div>')
    return "\n".join(o)

def region_rec(rec, mets):
    ms = rec["model"]["metric_measures"]
    rows = re.search(r"\(([\d,]+) rows\)", rec["data_state"])
    if not rows: sys.exit("the record's data state no longer names its row count")
    if rec["misses"] or not rec["model"]["passed"]:
        sys.exit(f"the newest record {rec['run_id']} is not a pass: the page states only a passing check")
    run = (f'<p class="db-run"><svg class="ic" aria-hidden="true"><use href="#ic-circle-check"/></svg><span>From check <b>{rec["run_id"]}</b>, '
           f'on the report as committed: the model check passed and <b>{rec["matched"]} of {rec["total"]}</b> questions matched, with no miss.</span></p>')
    o = ['<div class="stats four">',
         f'<div class="stat"><span class="badge"><svg class="ic" aria-hidden="true"><use href="#ic-circle-check"/></svg></span><div class="n">{rec["matched"]} of {rec["total"]}</div>'
         f'<div class="what">questions matched</div><div class="basis">The dashboard\'s own measures, run on every question it can answer, against <b>the answers the data answers assistant is tested on</b>. A miss is named by its question.</div></div>',
         f'<div class="stat"><span class="badge"><svg class="ic" aria-hidden="true"><use href="#ic-hash"/></svg></span><div class="n">{rec["values_compared"]}</div>'
         f'<div class="what">values compared</div><div class="basis">Every number in each answer, a whole table where the question asks for one, each <b>rounded by the assistant\'s own rule</b> before it is compared.</div></div>',
         f'<div class="stat"><span class="badge"><svg class="ic" aria-hidden="true"><use href="#ic-list"/></svg></span><div class="n">{len(ms)}</div>'
         f'<div class="what">measures, named as the metrics</div><div class="basis">Each carries its metric\'s definition word for word as its description, <b>checked from the report\'s own files</b> before any number is compared.</div></div>',
         f'<div class="stat"><span class="badge"><svg class="ic" aria-hidden="true"><use href="#ic-layers"/></svg></span><div class="n">{rec["model"]["relationships"]}</div>'
         f'<div class="what">joins between tables</div><div class="basis">The report reads <b>one table</b>, so no number can be counted twice through a join. It shows export batch 1 only, {rows.group(1)} rows: the rows the live assistant reads.</div></div>',
         '</div>']
    # what the check leaves out, grouped by reason; a metric with no measure on the page is one reason
    groups, order = {}, []
    for x in rec["left_out"]:
        m = re.match(r"^(\w+) is not a measure on this page$", x["reason"])
        key = "a metric with no measure on this page" if m else x["reason"]
        if key not in groups: groups[key] = ([], []); order.append(key)
        groups[key][0].append(x["case"])
        if m: groups[key][1].append(m.group(1))
    o.append(f'<h4><svg class="ic" aria-hidden="true"><use href="#ic-hand"/></svg>What the check leaves out, and why</h4>')
    o.append('<p class="db-left">A question the dashboard cannot answer is left out and named, <b>never counted as a pass</b>.</p>')
    o.append('<ul class="words db-out">')
    for k in order:
        cases, names = groups[k]
        extra = f' ({", ".join(f"<code>{E(x)}</code>" for x in names)})' if names else ""
        first = k.split()[0]
        text = k if "_" in first else k[0].upper() + k[1:]       # a code name keeps its own case
        text = re.sub(r"\b(\w+_\w+)\b", r"<code>\1</code>", E(text))
        o.append(f'<li><b>{", ".join(cases)}.</b> {text}{extra}.</li>')
    o.append('</ul>')
    o.append('<h4><svg class="ic" aria-hidden="true"><use href="#ic-bookmark"/></svg>The definitions</h4>')
    o.append('<p class="db-left">Each measure in the report, with the definition it carries, copied from the assistant\'s own list.</p>')
    o.append('<ul class="words db-defs">')
    for name in ms:
        if name not in mets: sys.exit(f"{name} is in the record but not in metrics.json")
        o.append(f'<li><b><code>{E(name)}</code></b> {E(mets[name]["definition"])}</li>')
    o.append('</ul>')
    return run, "\n".join(o)

# ---------- the pictures ----------
def shoot():
    from playwright.sync_api import sync_playwright
    PICS.mkdir(exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1280, "height": 1160}, device_scale_factor=2)
        pg.goto(URL); pg.wait_for_selector(".displayArea", timeout=90000)
        pg.wait_for_function("document.querySelectorAll('.visualContainer').length >= 10", timeout=90000)
        pg.wait_for_timeout(9000)
        box = pg.evaluate("(() => { const r = document.querySelector('.displayArea').getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })()")
        if [round(v) for v in box[2:]] != [1280, 1100]: sys.exit(f"the report canvas is {box[2:]}, not 1280 by 1100: the page size changed")
        fonts = pg.evaluate("[...document.querySelectorAll('*')].filter(e => !e.children.length && e.textContent.trim() === 'Revenue by category').map(e => getComputedStyle(e).fontFamily)")
        pg.screenshot(path=str(DESKTOP), clip={"x": box[0], "y": box[1], "width": box[2], "height": box[3]})
        b.close()
    print(f"desktop picture written: {DESKTOP.relative_to(ROOT)}; the title font as served: {', '.join(sorted(set(fonts)))}")

# ---------- writing ----------
def fill(src, name, body):
    pat = re.compile(rf"(<!--{name}-->\n)(?:.*?\n)?(<!--/{name}-->)", re.S)
    if not pat.search(src): sys.exit(f"dashboards.html: missing the {name} markers")
    return pat.sub(lambda m: m.group(1) + body + "\n" + m.group(2), src)

LINKED = ["dashboard/report/Branch review.SemanticModel/definition/tables/fct_orders.tmdl", "dashboard/agreement.dax",
          "scripts/check_dashboard.js", "results/dashboard", "transform/models/mart/fct_orders.sql", "metrics.json",
          "eval/expected/cases.json", "dashboard/DESIGN.md"]

def main():
    args = sys.argv[1:]
    if "--shoot" in args: shoot()
    if not DESKTOP.exists(): sys.exit(f"{DESKTOP.relative_to(ROOT)} is missing: run with --shoot")
    size, bx = boxes()
    src = PAGE.read_text(encoding="utf-8")
    new = fill(src, "DASH:01", region_01(numbers(), size, bx))
    run, rec = region_rec(record(), metrics())
    new = fill(new, "DASHRUN:01", run)
    new = fill(new, "DASHREC:01", rec)
    missing = [x for x in LINKED if not (DA / x).exists()]
    for href in re.findall(r'href="https://github\.com/mjazzly/data-answers/(?:blob|tree)/main/([^"]+)"', new):
        if not (DA / href.replace("%20", " ")).exists(): missing.append(href)
    if missing: sys.exit("linked from the page but not in ../data-answers: " + ", ".join(sorted(set(missing))))
    if "--check" in args:
        if new != src: sys.exit("dashboards.html is behind its records")
        return
    if new != src: PAGE.write_text(new, encoding="utf-8"); print("dashboards.html written")
    else: print("dashboards.html already current")

if __name__ == "__main__":
    main()
