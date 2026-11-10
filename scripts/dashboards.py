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

DASH-02 (Rollout review) reads ../rollout-review (read only; never run git there):
  report/Rollout review.Report             the position of every part, page by page (visual.json)
  CHECK.md                                 the recorded check: the result line, and the expected answers the
                                           guided read's figures are taken from, by question number
  README.md                                the planted storylines, word for word, and the headcount
  PUBLISH.md                               the public link
and writes <!--DASH:02-->, <!--DASHRUN:02--> and <!--DASHREC:02--> the same way. A figure on the page that
is not in those files cannot be written: every line is a template filled from them.

Usage, from the repo root:
  python3 scripts/dashboards.py                    write every region
  python3 scripts/dashboards.py --check            fail when the page is behind its records (scripts/check.py runs this)
  python3 scripts/dashboards.py --shoot            retake DASH-01's desktop picture from the public link, then write
  python3 scripts/dashboards.py --shoot 02         retake DASH-02's page pictures from its public link, then write
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

# ======================================================================================================
# DASH-02, Rollout review: the data side of FRAME-04, counted against FRAME-01's nine checkpoints
# ======================================================================================================
RR = ROOT.parent / "rollout-review"
RR_REPORT = RR / "report" / "Rollout review.Report" / "definition" / "pages"
RR_REPO = "https://github.com/mjazzly/rollout-review/"
RR_PAGES = {"Rollout review": "review", "Where people sit": "sit", "Foundation": "foundation",
            "Refinement": "refinement", "Scale": "scale"}       # the report pages the guided read shows

def rr_pic(page): return PICS / f"dash-02-{RR_PAGES[page]}.png"

def rr_url():
    m = re.search(r"https://app\.powerbi\.com/view\?r=\S+", (RR / "PUBLISH.md").read_text())
    if not m: sys.exit("../rollout-review/PUBLISH.md no longer holds the public link")
    return m.group(0)

def rr_facts():
    """The figures the page may use, read from CHECK.md and README.md and nowhere else."""
    check, readme = (RR / "CHECK.md").read_text(), (RR / "README.md").read_text()
    rows = {}
    for line in check.splitlines():
        c = [x.strip() for x in line.strip().strip("|").split("|")]
        if len(c) == 5 and c[0].isdigit(): rows[int(c[0])] = {"q": c[2], "a": c[3], "ok": c[4]}
    res = re.search(r"\*\*Result: (\d+) of (\d+) matched\.\*\*", check)
    if not res: sys.exit("CHECK.md no longer opens with its result line")
    def need(pat, s, what):
        m = re.search(pat, s)
        if not m: sys.exit(f"CHECK.md or README.md: {what} no longer reads as expected")
        return m
    f = {"rows": rows, "matched": int(res.group(1)), "total": int(res.group(2))}
    m = need(r"^([\d.]+%), Not yet working \(threshold ([\d.]+%)\)", rows[3]["a"], "question 3"); f["tile"] = m.group(1)
    need(r"the (Refinement) tile", rows[3]["q"], "question 3's tile")
    m = need(r"The check-in places many people at ([\w ]+?), while the sources place them at ([\w ]+?), active", readme, "the Finance storyline")
    f["self_cp"], f["src_cp"] = m.groups()
    design = (RR / "DASH-02-DESIGN.md").read_text()
    need(rf"\| {re.escape(f['src_cp'])} \| [^|]+ \| One recurring task tied to a day of the week \|", design, "the Waiting to board lever")
    m = need(r"from (\d+) in month (\d+) to (\d+) in month (\d+)", readme, "the rules pattern"); f["rules"] = m.groups()
    m8 = need(r"Month 1: Rules and allowed use, (\d+) questions", rows[8]["a"], "question 8")
    if m8.group(1) != f["rules"][0]: sys.exit("README.md and CHECK.md disagree on month 1's rules questions")
    m = need(r"^\d items: (LIB-\d+), (LIB-\d+)$", rows[13]["a"], "question 13"); f["small"] = m.groups()
    need(r"Two items pass on the smaller model at half the tokens", readme, "the Technology storyline")
    m = need(r"^(LIB-\d+) \((\w+)\), taken up by (\w+) from (Week \d+)$", rows[16]["a"], "question 16"); f["taken"] = m.groups()
    m = need(r"([\d,]+) people with no names", readme, "the headcount"); f["people"] = m.group(1)
    m = need(r"Three stages and (\w+) checkpoints", readme, "the checkpoint count"); f["checkpoints"] = WORDS.index(m.group(1))
    sec = need(r"(?s)## Planted storylines\n(.*?)\n## ", readme, "the planted storylines").group(1)
    f["planted"] = [re.sub(r"\*\*(.+?)\*\*", r"\1", x) for x in re.findall(r"^\d\. (.+)$", sec, re.M)]
    f["between"] = need(r"(?m)^(People sits in between.*)$", sec, "the team with no story").group(1)
    f["pattern"] = need(r"(?m)^One more pattern is planted across all teams: (.*)$", sec, "the pattern across teams").group(1)
    return f

# ---------- the guided read: the words, one stop per finding, each a planted storyline ----------
OPEN02 = {"q": "Is the rollout working?",
          "line": "Five parts of the report answer it, one finding at each. The data is synthetic and the findings were planted.",
          "go": "Show me"}
STEPS02 = [
    {"page": "Rollout review", "vis": ["p0_foundation_panel", "p0_execution_panel", "p0_refinement_panel", "p0_scale_panel"],
     "part": "The four stage tiles", "q": "Which stage is not working yet?",
     "feeds": "Which stage gets the effort first.",
     "say": lambda f: f"Refinement alone: {f['tile']} of prompts pass on the smaller model in the run log."},
    {"page": "Where people sit", "vis": ["p1_gap_panel"],
     "part": "Check-in against source", "q": "Where does each view place Finance?",
     "feeds": "Which lever each team gets next.",
     "say": lambda f: f"Check-in: many at {f['self_cp']}. Sources: {f['src_cp']}. Lever: a recurring weekday task."},
    {"page": "Foundation", "vis": ["p2_month_panel"],
     "part": "Questions by month", "q": "Are people asking what is allowed, or about the work?",
     "feeds": "Whether to keep answering rules questions or build for the work.",
     "say": lambda f: "Question log: rules questions fall from {0} in month {1} to {2} in month {3}.".format(*f["rules"])},
    {"page": "Refinement", "vis": ["p4_main_panel"],
     "part": "Pass on a smaller model", "q": "What earns its place, and at what cost?",
     "feeds": "Which prompts can move to the smaller model.",
     "say": lambda f: "Run log: {0} and {1} pass on the smaller model, at half the tokens.".format(*f["small"])},
    {"page": "Scale", "vis": ["p5_taken_panel"],
     "part": "Taken up beyond the first team", "q": "Where has it changed the work?",
     "feeds": "Which prompts to offer the next team.",
     "say": lambda f: "Library's records: {0}, made by {1}, taken up by {2} from {3}.".format(*f["taken"])},
]
FREE02 = {"q": "The verdict, in plain words",
          "line": ("A stage reads Working when its figure meets the threshold printed under it, and Not yet working "
                   "when it does not. The thresholds are illustrative: a real programme sets its own."),
          "again": "Start again"}
ALT02 = {"Rollout review": "The Rollout review report's front page: four stage tiles, Foundation, Execution, Refinement and Scale, each with its figure, verdict, threshold and trend; the stage of each team at its baseline month and at the latest month; and the people who moved up since the last count.",
         "Where people sit": "The Where people sit page: people at each of the nine checkpoints by team; the check-in and the sources side by side by team, with Finance's higher bar the longest; movement since the last count; and each team's largest group with its lever.",
         "Foundation": "The Foundation page: uses ranked in the first and the last month; questions by month, rules questions falling as other uses rise; requests matched to a tested prompt; prompts tested against an answer key written first; and the usage baseline by team.",
         "Refinement": "The Refinement page: cases matched by each live prompt on the smaller model, with the two that pass in marine; the cost of the passing prompts; and the prompts retired or merged.",
         "Scale": "The Scale page: impact in people's own words by team; the share of people in the air against each team's baseline; and the uses taken up beyond the first team, with the team and week each was taken up."}

# ---------- the record ----------
SOURCES02 = [
    ("ic-message", "The question log", "One row per question asked: who asked, what it really was, how hard it was, and what was done.", "an office hours or help channel log"),
    ("ic-chart", "The usage dashboards", "Each person's active days, sessions and runs, week by week.", "the platform's admin export"),
    ("ic-book", "The library's records", "Each tested prompt's owner, version, limits and test result, and its runs by team and week.", "the library's run log"),
    ("ic-table", "The run log", "What each test run cost in tokens and how many of its cases it matched, on the standard and the smaller model.", "the test harness output"),
    ("ic-list", "The check-in", "FRAME-01's questions, answered by each person each month, ending with the checkpoint they place themselves at.", "a check-in form"),
]
# the site states each team's lever, never a problem: the README's own wording stays in the repo. Each swap names
# the checkpoint the storyline holds people at; its lever is read from the design note's checkpoint table
PLANTED_SWAPS = {("Finance", "The gap is the finding, and the problem is habit."): "Waiting to board",
                 ("Legal", "The problem is access and the first week."): "Ticket held"}

def lever(cp):
    m = re.search(rf"^\| \d \| [^|]+ \| {re.escape(cp)} \| [^|]+ \| ([^|]+?) \|$", (RR / "DASH-02-DESIGN.md").read_text(), re.M)
    if not m: sys.exit(f"DASH-02-DESIGN.md: no lever for {cp} in the checkpoint table")
    return m.group(1)
LINKED02 = [("README.md", "README.md", "What it is, the planted storylines, and how to rerun it."),
            ("generate.py", "generate.py", "The seeded generator that writes every table."),
            ("check.py", "check.py", "The check: answers every question straight from the tables."),
            ("CHECK.md", "CHECK.md", "The questions, the expected answers and the match record, question by question."),
            ("measures.md", "measures.md", "Every measure and placement rule, worded as the report carries it."),
            ("DICTIONARY.md", "DICTIONARY.md", "Every table and column, and the live system each stands in for."),
            ("DASH-02-DESIGN.md", "DASH-02-DESIGN.md", "The design note: the reader, the pages, and what was kept out on purpose."),
            ("report", "report", "The report's own files, page by page.")]

def rr_boxes():
    pages = {}
    for pj in glob.glob(str(RR_REPORT / "*" / "page.json")):
        pg = json.loads(pathlib.Path(pj).read_text())
        pages[pg["displayName"]] = (pathlib.Path(pj).parent, pg["width"], pg["height"])
    size, out = None, []
    for st in STEPS02:
        if st["page"] not in pages: sys.exit(f"the report has no page named {st['page']}: update STEPS02")
        d, w, h = pages[st["page"]]
        if size and size != (w, h): sys.exit("the report's pages differ in size")
        size = (w, h)
        xs = []
        for v in st["vis"]:
            f = d / "visuals" / v / "visual.json"
            if not f.exists(): sys.exit(f"missing {f}: the report's visual names changed, update STEPS02")
            p = json.loads(f.read_text())["position"]; xs.append([p["x"], p["y"], p["x"] + p["width"], p["y"] + p["height"]])
        x0, y0 = min(b[0] for b in xs), min(b[1] for b in xs); x1, y1 = max(b[2] for b in xs), max(b[3] for b in xs)
        out.append([round(x0), round(y0), round(x1 - x0), round(y1 - y0)])
    return size, out

def region_02(f, size, bx):
    W, H = size
    lines = [st["say"](f) for st in STEPS02]
    for s in lines:
        if len(s.split()) > 15: sys.exit(f"answer line over fifteen words: {s}")
    for p in RR_PAGES:
        if not rr_pic(p).exists(): sys.exit(f"{rr_pic(p).relative_to(ROOT)} is missing: run with --shoot 02")
    first = STEPS02[0]["page"]
    o = [f'<div class="db-stage" id="dash-02-stage" data-w="{W}" data-h="{H}">',
         f'<figure class="db-pic"><img src="{rr_pic(first).relative_to(ROOT)}" width="{W}" height="{H}" alt="{E(ALT02[first])}"></figure>',
         f'<ol class="db-steps" data-q="{E(OPEN02["q"])}" data-line="{E(OPEN02["line"])}" data-go="{E(OPEN02["go"])}" '
         f'data-next="{NEXT}" data-back="{BACK}" data-free-q="{E(FREE02["q"])}" data-free-line="{E(FREE02["line"])}" data-again="{E(FREE02["again"])}">']
    for st, line, b in zip(STEPS02, lines, bx):
        o.append(f'<li data-box="{" ".join(map(str, b))}" data-pic="{rr_pic(st["page"]).relative_to(ROOT)}" data-alt="{E(ALT02[st["page"]])}">'
                 f'<span class="db-part">{E(st["part"])} <span class="db-on">on {E(st["page"])}</span></span><h3>{E(st["q"])}</h3>'
                 f'<p class="db-feeds"><b>It feeds:</b> {E(st["feeds"])}</p><p class="db-say">{E(line)}</p></li>')
    o.append('</ol>')
    o.append(f'<p class="db-rule"><b>{E(FREE02["q"])}:</b> {E(FREE02["line"])}</p>')
    o.append('</div>')
    return "\n".join(o)

def region_rec02(f):
    if f["matched"] != f["total"]: sys.exit(f"CHECK.md records {f['matched']} of {f['total']}: the page states only a full match")
    yes = sum(1 for r in f["rows"].values() if r["ok"].startswith("Yes"))
    if yes != f["total"] or len(f["rows"]) != f["total"]:
        sys.exit(f"CHECK.md: {yes} rows marked Yes of {len(f['rows'])}, but its result line says {f['matched']} of {f['total']}")
    check = RR_REPO + "blob/main/CHECK.md"
    run = (f'<p class="db-run"><svg class="ic" aria-hidden="true"><use href="#ic-circle-check"/></svg><span>From the recorded check in <b>CHECK.md</b>, '
           f'on the report as published: <a target="_blank" href="{check}" rel="noopener"><strong>{f["matched"]} of {f["total"]}</strong> questions matched</a>, with no miss.</span></p>')
    o = ['<div class="stats four">',
         f'<div class="stat"><span class="badge"><svg class="ic" aria-hidden="true"><use href="#ic-circle-check"/></svg></span><div class="n">{f["matched"]} of {f["total"]}</div>'
         f'<div class="what">questions matched</div><div class="basis">Each expected answer worked out by the check script <b>straight from the tables</b>, then read off the matching part of the report. Every page with numbers has a question on a planted storyline.</div></div>',
         f'<div class="stat"><span class="badge"><svg class="ic" aria-hidden="true"><use href="#ic-users"/></svg></span><div class="n">{f["people"]}</div>'
         f'<div class="what">people, all synthetic</div><div class="basis">Six teams over 24 weeks and six check-ins, <b>written from a fixed seed</b>, so every rerun gives the same tables. No names, and nothing in currency: cost is counted in tokens.</div></div>',
         f'<div class="stat"><span class="badge"><svg class="ic" aria-hidden="true"><use href="#ic-stairs"/></svg></span><div class="n">{f["checkpoints"]}</div>'
         f'<div class="what">checkpoints, each person placed twice</div><div class="basis">Every month, once by their own check-in and once <b>by stated rules over the sources</b>. The two sit side by side and are never blended.</div></div>',
         f'<div class="stat"><span class="badge"><svg class="ic" aria-hidden="true"><use href="#ic-database"/></svg></span><div class="n">{len(SOURCES02)}</div>'
         f'<div class="what">sources, each named on its page</div><div class="basis">The four from FRAME-04 and the check-in from FRAME-01. <b>A measure that cannot be read from one does not go on the report.</b></div></div>',
         '</div>']
    o.append(f'<h4><svg class="ic" aria-hidden="true"><use href="#ic-table"/></svg>The five sources</h4>')
    o.append('<p class="db-left">Each table stands in for a live system, so a real rollout swaps in an export with the same columns.</p>')
    o.append('<ul class="words db-defs">')
    for _, name, what, live in SOURCES02:
        o.append(f'<li><b>{E(name)}.</b> {E(what)} Stands in for {E(live)}.</li>')
    o.append('<li><b>Beside them.</b> A training register and a roster say who attended which session and who holds a seat.</li>')
    o.append('</ul>')
    o.append(f'<h4><svg class="ic" aria-hidden="true"><use href="#ic-sprout"/></svg>The planted storylines</h4>')
    o.append('<p class="db-left">Synthetic data with nothing in it gives pages with nothing to say. '
             '<b>These storylines were planted in the data by the generator</b>, and each stop of the read above is one of them.</p>')
    o.append('<ul class="words db-out">')
    for s in f["planted"]:
        for (team, old), cp in PLANTED_SWAPS.items():
            if s.startswith(team):
                if old not in s or cp not in s: sys.exit(f"README.md: the {team} storyline no longer reads '{old}' or names {cp}")
                lv = lever(cp)
                s = s.replace(old, f"The lever is {lv[0].lower()}{lv[1:]}.")
        head, _, rest = s.partition(". ")
        o.append(f'<li><b>{E(head)}.</b> {E(rest)}</li>')
    o.append(f'<li><b>Every team.</b> {E(f["pattern"][0].upper() + f["pattern"][1:])}</li>')
    o.append(f'<li><b>People.</b> {E(re.sub(r"^People sits", "Sits", f["between"]))}</li>')
    o.append('</ul>')
    o.append('<h4><svg class="ic" aria-hidden="true"><use href="#ic-link"/></svg>Where to look in the code</h4>')
    o.append('<ul class="words checks">')
    o.append(f'<li><a target="_blank" href="{RR_REPO.rstrip("/")}" rel="noopener"><b>mjazzly/rollout-review</b></a> The whole build: the generator, the tables, the check and the report.</li>')
    for path, label, what in LINKED02:
        kind = "tree" if (RR / path).is_dir() else "blob"
        if not (RR / path).exists(): sys.exit(f"linked from the page but not in ../rollout-review: {path}")
        o.append(f'<li><a target="_blank" href="{RR_REPO}{kind}/main/{path}" rel="noopener"><b>{E(label)}</b></a> {E(what)}</li>')
    o.append('</ul>')
    return run, "\n".join(o)

def shoot02():
    from playwright.sync_api import sync_playwright
    PICS.mkdir(exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1280, "height": 800}, device_scale_factor=2)
        pg.goto(rr_url()); pg.wait_for_selector(".displayArea", timeout=90000); pg.wait_for_timeout(10000)
        for i, name in enumerate(RR_PAGES):
            if i: pg.locator(".displayArea button, .displayArea [role=button]").filter(has_text=name).first.click(); pg.wait_for_timeout(9000)
            box = pg.evaluate("(() => { const r = document.querySelector('.displayArea').getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })()")
            if [round(v) for v in box[2:]] != [1280, 720]: sys.exit(f"the {name} canvas is {box[2:]}, not 1280 by 720: the page size changed")
            pg.screenshot(path=str(rr_pic(name)), clip={"x": box[0], "y": box[1], "width": box[2], "height": box[3]})
            print(f"written: {rr_pic(name).relative_to(ROOT)}")
        b.close()

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
    if "--shoot" in args:
        shoot02() if args[args.index("--shoot") + 1:args.index("--shoot") + 2] == ["02"] else shoot()
    if not DESKTOP.exists(): sys.exit(f"{DESKTOP.relative_to(ROOT)} is missing: run with --shoot")
    size, bx = boxes()
    src = PAGE.read_text(encoding="utf-8")
    new = fill(src, "DASH:01", region_01(numbers(), size, bx))
    run, rec = region_rec(record(), metrics())
    new = fill(new, "DASHRUN:01", run)
    new = fill(new, "DASHREC:01", rec)
    facts, (size2, bx2) = rr_facts(), rr_boxes()
    new = fill(new, "DASH:02", region_02(facts, size2, bx2))
    run2, rec2 = region_rec02(facts)
    new = fill(new, "DASHRUN:02", run2)
    new = fill(new, "DASHREC:02", rec2)
    # every report link on the page is one of the two public links, and DASH-02's sits in its own entry
    for href in re.findall(r'href="(https://app\.powerbi\.com/[^"]+)"', new):
        if href not in (URL, rr_url()): sys.exit(f"a report link on the page is neither public link: {href[:60]}")
    d2 = new.split('<section id="dash-02"', 1)[-1]
    if rr_url() not in d2: sys.exit("the DASH-02 entry does not link the public link in ../rollout-review/PUBLISH.md")
    # the head's data line is typed, so it is held to the records: the headcount from README, the rest from the design note
    design = (RR / "DASH-02-DESIGN.md").read_text()
    want = f"{facts['people']} people, six teams, 24 weeks, six check-ins"
    if want not in d2.split("</section>", 1)[0]: sys.exit(f"the DASH-02 data line no longer reads '{want}'")
    for phrase in ("six teams", "24 weeks", "six check-ins"):
        if phrase not in design: sys.exit(f"DASH-02-DESIGN.md no longer says '{phrase}'")
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
