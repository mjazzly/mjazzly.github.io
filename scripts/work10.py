#!/usr/bin/env python3
"""Writes WORK-10's numbers onto aiwork.html from the sourced brief's records.

Reads ../sourced-brief (read only; never run git there):
  eval/results-graph/        every WORK-10 run record, its traces, stage0/ (recall, lines kept), spend.json
  eval/results-arms/         WORK-09's one agent on the six-file week (the comparison in stat 3)
  graph/prices.json          the smallest model's price line
  data/cases-grown/          the 207-file week
  WORK-10-DESIGN.md          the signed predictions, quoted word for word

Fills, on aiwork.html only:
  every <span data-w10="key"> or <div data-w10="key">: only its inside is replaced
  <!--W10:SHOWN--> ... <!--/W10:SHOWN-->              the visual, what the drafter was shown (brief 01_clean)
  <!--W10:PREDICTIONS--> ... <!--/W10:PREDICTIONS-->  the predictions beside the record

  python3 scripts/work10.py           write the page
  python3 scripts/work10.py --check   write nothing; exit 1 and name what differs from the records
A data-w10 key the script does not know stops it.
"""
import json, pathlib, re, statistics, sys, html

root = pathlib.Path(__file__).resolve().parent.parent
sb = root.parent / "sourced-brief"
rg = sb / "eval" / "results-graph"
page = root / "aiwork.html"
CASE = "01_clean"           # the brief the visual shows
WORDS = "no one two three four five six seven eight nine ten".split()

def load(p):
    return json.loads(p.read_text(encoding="utf-8"))

def fail(msg):
    sys.exit(f"work10.py: {msg}")

if not rg.is_dir():
    fail("../sourced-brief/eval/results-graph not found")

# ---- the runs -------------------------------------------------------------------------------------------
records = [load(p) for p in sorted(rg.glob("G*.json"))]
counted = [r for r in records if r.get("counted")]
def runs(arm):
    out = sorted((r for r in counted if r["arm"] == arm), key=lambda r: r["label"])
    if not out: fail(f"no counted run of arm {arm}")
    return out
def matched(r):
    v = r["verdict"]; return v["cases_matched"] + v["state_matched"]
def of(r):
    v = r["verdict"]; return v["of_cases"] + v["of_state"]
def per_brief(r):
    return r["cost_per_brief_usd"] if r.get("cost_per_brief_usd") is not None else r["node_record"]["cost_per_brief_usd"]
def cost(arm):
    return statistics.mean(per_brief(r) for r in runs(arm))
def traces(r):
    return [load(p) for p in sorted((rg / r["label"]).glob("*.trace.json"))]

P, F, K, V, PG, E = (runs(a) for a in ("P", "F", "K", "V", "PG", "E"))
for arm, rs in (("K", K), ("V", V), ("PG", PG), ("E", E)):
    if len(rs) != 1: fail(f"arm {arm} has {len(rs)} counted runs; the entry calls it a single run")
nbriefs = of(P[0])

arms09 = [load(p) for p in sorted((sb / "eval" / "results-arms").glob("W*-one-haiku-5-5.json"))]
arms09 = [r for r in arms09 if r.get("counted")]

# ---- stage 0: what search showed, and what keeping the week kept --------------------------------------
recall = load(rg / "stage0" / "recall.json")
recall_f = load(rg / "stage0" / "recall_F.json")["recall"]
K20, V20 = recall["recall"]["K"]["20"], recall["recall"]["V"]["20"]
full = lambda rc: sum(1 for c in rc.values() if c["found"] == c["of"])
if full(K20) != full(V20): fail("keyword and vector differ in briefs fully shown; stat 1 says alike")
v_found = {c["found"] for c in V20.values()}
if len(v_found) != 1: fail("the vector index showed a different count in some brief; stat 1 says the same in every brief")
needs = [c["of"] for c in K20.values()]
entries = recall["index_entries"]
kept = [len(x) for x in load(rg / "stage0" / "retrieved_F.json")["F"]["all"].values()]

grown = sb / "data" / "cases-grown" / CASE
gfiles = [p.name for p in grown.iterdir() if p.suffix in (".csv", ".md")]
archive = [n for n in gfiles if n.startswith("archive_")]
weeks = {n.split("_")[1] for n in archive}

prices = load(sb / "graph" / "prices.json")["claude-haiku-5-5"]["tiers"]
line = prices[0]["max_prompt_tokens"]; times = prices[1]["input"] / prices[0]["input"]

spend = load(rg / "spend.json")

# forecast against measured, for the routes priced from counted tokens
diff = lambda r: (r["cost_usd"] - r["forecast_usd"]) / r["forecast_usd"]
close = max(abs(diff(r)) for r in P + F + PG)
if not all(r["cost_usd"] < r["forecast_usd"] / 2 for r in K + V): fail("a search run came in at half its forecast or more; How it runs says under half")
e_ratio = E[0]["cost_usd"] / E[0]["forecast_usd"]
if not 0.05 <= e_ratio <= 0.15: fail(f"the agent loop came in at {e_ratio:.2f} of its forecast; How it runs says about a tenth")

# PG: sentences released, and any that cite an earlier week; E: files read, any earlier-week read
def refs(claim):
    return [claim.get(k) for k in ("ref", "new_ref", "old_ref") if claim.get(k)]
def archived_released(tr):
    out = 0
    removed = {x.get("text") if isinstance(x, dict) else x for x in tr["submit_result"].get("removed", [])}
    for sents in tr["draft_brief_payload"]["sections"].values():
        for s in sents:
            if s["text"] in removed: continue
            if any(r.startswith("archive_") for c in s["claims"] for r in refs(c)): out += 1
    return out
pg_tr = traces(PG[0])
pg_sent = sum(t["submit_result"]["sentences_released"] for t in pg_tr)
pg_arch = sum(archived_released(t) for t in pg_tr)
kv_tr = traces(K[0]) + traces(V[0])
kv_sent = sum(t["submit_result"]["sentences_released"] for t in kv_tr)
kv_arch = sum(archived_released(t) for t in kv_tr)
e_reads = []
for t in traces(E[0]):
    files = [s["input"]["file"] for s in t["steps"] if s.get("type") == "tool" and s.get("tool") == "read_source"]
    e_reads.append(files)
e_n = [len(set(f)) for f in e_reads]
e_arch = sum(1 for f in e_reads for n in f if n.startswith("archive_"))

# ---- small writers ------------------------------------------------------------------------------------
def usd(x): return f"US${x:.4f}"
def usd2(x): return f"US${x:.2f}".replace(".00", "")
def span(a, b): return str(a) if a == b else f"{a} to {b}"
def num(n): return f"{n:,}"
def listing(xs): xs = [str(x) for x in xs]; return ", ".join(xs[:-1]) + " and " + xs[-1]
def bar(rs): return sum(1 for r in rs if r["verdict"]["passed"])
def marks(rs): return "".join("<i></i>" if r["verdict"]["passed"] else '<i class="miss"></i>' for r in rs)
def word(n): return WORDS[n] if n < len(WORDS) else str(n)

values = {
    "files": str(len(gfiles)), "earlier": str(len(archive)), "weeks": str(len(weeks)),
    "briefs": str(nbriefs),
    "search-full": f"{full(K20)} of {len(K20)}",
    "k-found": span(min(c["found"] for c in K20.values()), max(c["found"] for c in K20.values())),
    "needs": span(min(needs), max(needs)),
    "v-found": str(v_found.pop()),
    "f-full": f"{full(recall_f)} of {len(recall_f)}",
    "f-lines": span(min(kept), max(kept)),
    "grown-lines": span(num(min(entries.values())), num(max(entries.values()))),
    "f-bar": f"{bar(F)} of {len(F)}", "p-bar": f"{bar(P)} of {len(P)}",
    "pooled": f"{bar(P) + bar(F)} of {len(P) + len(F)}",
    "a1-bar": f"{bar(arms09)} of {len(arms09)}",
    "p-bar-w": f"{word(bar(P))} of {word(len(P))}", "f-bar-w": f"{word(bar(F))} of {word(len(F))}",
    "p-runs": listing(matched(r) for r in P), "f-runs": listing(matched(r) for r in F),
    "marks-P": marks(P), "marks-F": marks(F), "marks-K": marks(K), "marks-V": marks(V), "marks-PG": marks(PG), "marks-E": marks(E),
    "k-matched": f"{matched(K[0])} of {of(K[0])}", "v-matched": f"{matched(V[0])} of {of(V[0])}",
    "pg-matched": f"{matched(PG[0])} of {of(PG[0])}", "e-matched": f"{matched(E[0])} of {of(E[0])}",
    "pg-sentences": str(pg_sent), "pg-archived": "none" if pg_arch == 0 else str(pg_arch),
    "e-read": span(min(e_n), max(e_n)), "e-archived": "none" if e_arch == 0 else str(e_arch),
    "cost-P": usd(cost("P")), "cost-F": usd(cost("F")), "cost-K": usd(cost("K")), "cost-V": usd(cost("V")),
    "cost-PG": usd(cost("PG")), "cost-E": usd(cost("E")),
    "pg-times": str(round(cost("PG") / cost("F"))),
    "line": num(line), "times": word(round(times)),
    "spend": usd2(spend["total_usd"]), "cap": usd2(spend["cap_usd"]),
    "close": str(round(close * 100)),
    "checked": str(sum(r["briefs"] if r.get("briefs") else r["node_record"]["briefs"] for r in counted)),
    "counted-runs": str(len(counted)),
    "k": str(K[0]["lines_per_section"]),
    "verdict-runs": word(len(P)),
}
if len(P) != len(F): fail("the two routes in the verdict ran a different number of times; the record head says each ran the same")
if bar(P) - bar(F) != 1: fail("keeping this week is not one run short of the six-file week; stat 3 says one run short")
if any(r.get("retrieval_misses") for r in F): fail("a run keeping this week has a retrieval miss; the entry says every miss was in the drafting")
for c in recall_f:
    pl = load(rg / P[0]["label"] / f"{c}.trace.json")["lines"]; fl = load(rg / F[0]["label"] / f"{c}.trace.json")["lines"]
    if pl != fl: fail(f"{c}: the lines kept this week differ from the six-file week's; stat 3 says the same lines")

# ---- the visual: what the drafter was shown, one brief, four routes ----------------------------------
def shown(r):
    t = load(rg / r["label"] / f"{CASE}.trace.json")
    return t["lines"], len(t["files"])
need = K20[CASE]["of"]
STEPS = [
    ("K", "Search by keyword", "big", K[0], K20[CASE]["found"]),
    ("V", "Search by meaning", "big", V[0], V20[CASE]["found"]),
    ("PG", "Read everything", "small", PG[0], need if PG[0]["recall_by_case"][CASE]["found"] == need else None),
    ("F", "Keep this week", "big", F[0], recall_f[CASE]["found"]),
]
steps = []
for key, name, size, r, found in STEPS:
    lines, nf = shown(r)
    wk = [0 if ref.startswith("archive_") else 1 for ref in lines]
    if found is None: fail("Read everything did not show every needed line in the visual's brief")
    steps.append(dict(key=key, name=name, size=size, lines=wk, n=len(wk), w=sum(wk), found=found, cost=usd(cost(key)), files=nf))
if steps[3]["found"] != need: fail("Keep this week missed a needed line in the visual's brief; its step says all")
if steps[3]["w"] != steps[3]["n"]: fail("Keep this week kept a line from an earlier week; its step says every line is this week's")
if steps[2]["w"] != steps[3]["n"]: fail("Read everything and Keep this week differ in this week's lines")

def say(s):
    if s["key"] == "K":
        return (f"Each square is one line the drafter was handed for this brief, picked by a keyword search for each of the brief's five sections. "
                f"<b>{s['w']} of these {s['n']} lines are from this week's files</b>, and <b>{s['found']} of those are among the {need} the brief needs</b>.")
    if s["key"] == "V":
        return (f"The same five sections, searched by what the words mean, through a <b>vector index</b>. "
                f"<b>{s['w']} of these {s['n']} lines are from this week's files</b>, and <b>{s['found']} of those are among the {need} the brief needs</b>.")
    if s["key"] == "PG":
        return (f"Every line in the folder, handed over in one go: <b>{num(s['n'])} lines</b>, drawn smaller here so all of them fit. "
                f"<b>{s['w']} are from this week's files</b>, and they hold <b>all {need}</b> the brief needs.")
    return (f"Each file's week read from its own contents, and <b>only this week's files kept</b>: <b>{s['n']} lines</b>. "
            f"They hold <b>all {need}</b> the brief needs.")

def visual():
    picks = "".join(f'<li><button type="button" class="dv-pick" data-go="{i}" aria-pressed="{"true" if i == 0 else "false"}">{s["name"]}</button></li>' for i, s in enumerate(steps))
    panes = []
    for i, s in enumerate(steps):
        squares = "".join('<i class="w"></i>' if x else "<i></i>" for x in s["lines"])
        panes.append(f'''<div class="dv-step" data-i="{i}" role="group" aria-label="{s["name"]}">
  <h5 class="dv-name">{s["name"]}</h5>
  <div class="dv-field {s["size"]}" aria-hidden="true">{squares}</div>
  <p class="dv-key"><span><i class="w"></i>a line from this week's files</span><span><i></i>a line from an earlier week</span></p>
  <p class="dv-order">The squares sit in the order the lines were handed to the drafter, file by file; the order carries no ranking.</p>
  <div class="dv-under">
    <p class="dv-say">{say(s)}</p>
    <dl class="dv-nums"><div><dt>{s["found"]} of {need}</dt><dd>lines the brief needs, shown</dd></div><div><dt>{s["cost"]}</dt><dd>a brief, the mean of the route's runs</dd></div></dl>
  </div>
</div>''')
    return f'''
<div class="dv" data-dv>
<p class="dv-lead">One brief, the first test week, with the folder grown to {steps[0]["files"]} files. <b>Four ways to choose the lines the drafter reads.</b> <span class="dv-js" hidden>Pick one, or press Next.</span></p>
<ul class="dv-picks" hidden>{picks}</ul>
<div class="dv-stage" aria-live="polite">
{chr(10).join(panes)}
</div>
<div class="dv-ctl" hidden><button type="button" class="dv-next">Next</button><button type="button" class="dv-back">Back</button></div>
</div>
'''

# ---- the predictions, word for word from the design note, beside the record -------------------------
design = (sb / "WORK-10-DESIGN.md").read_text(encoding="utf-8")
block = design.split("## Megat's predictions", 1)[1].split("\n## ", 1)[0]
said = []
for para in re.split(r"\n\s*\n", block):
    para = para.strip()
    if not para or para.startswith("Written") or para.startswith("Signed"): continue
    for ln in para.splitlines():
        ln = ln.strip()
        said.append(ln[2:] if ln.startswith("- ") else ln)
results = [
    f"Keyword {values['search-full']}, vector {full(V20)} of {len(V20)}",
    values["f-full"],
    values["p-bar"],
    values["f-bar"],
    f"No, none of the {kv_sent} sentences they released cites an earlier week" if kv_arch == 0 else f"Yes, {kv_arch}",
    values["pg-matched"],
    values["e-matched"],
]
if len(said) != len(results): fail(f"the design note holds {len(said)} predictions; the table expects {len(results)}")
def predictions():
    rows = "".join(f'<tr><td>{html.escape(p)}</td><td><b>{html.escape(r)}</b></td></tr>' for p, r in zip(said, results))
    return f'''
<div class="scoretable predictions">
  <table>
    <thead><tr><th scope="col">Predicted, word for word</th><th scope="col">On the record</th></tr></thead>
    <tbody>{rows}</tbody>
  </table>
</div>
'''

# ---- write or check -----------------------------------------------------------------------------------
old = page.read_text(encoding="utf-8")
new = old
for mark, body in (("SHOWN", visual()), ("PREDICTIONS", predictions())):
    pat = re.compile(r"(<!--W10:" + mark + r"-->)(.*?)(<!--/W10:" + mark + r"-->)", re.S)
    if not pat.search(new): fail(f"aiwork.html: no <!--W10:{mark}--> markers")
    new = pat.sub(lambda m: m.group(1) + body + m.group(3), new)
def fillin(m):
    key = m.group(3)
    if key not in values: fail(f'aiwork.html: data-w10="{key}" is not a value this script writes')
    return m.group(1) + values[key] + m.group(4)
new = re.sub(r'(<(span|div)\b[^>]*\bdata-w10="([\w-]+)"[^>]*>).*?(</\2>)', fillin, new, flags=re.S)

if "--check" in sys.argv:
    if new != old:
        get = lambda t: dict((k, v) for _, _, k, v in re.findall(r'(<(span|div)\b[^>]*\bdata-w10="([\w-]+)"[^>]*>)(.*?)</\2>', t, re.S))
        a, b = get(old), get(new)
        stale = [f'aiwork.html: data-w10="{k}" reads "{a.get(k)}", the records give "{b[k]}"' for k in b if a.get(k) != b[k]]
        print("\n".join(stale) or "aiwork.html: the WORK-10 visual or predictions differ from the records"); sys.exit(1)
    sys.exit(0)
page.write_text(new, encoding="utf-8")
print(f"aiwork.html: WORK-10 written ({len(re.findall(r'data-w10=', new))} numbers, {len(steps)} steps, {len(said)} predictions)")
