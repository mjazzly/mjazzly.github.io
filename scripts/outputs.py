#!/usr/bin/env python3
"""Writes the data region of each AI Work output page from one recorded run.

  output-01.html  meeting tracker        ../meeting-tracker-server/eval/runs/
  output-02.html  spreadsheet normaliser ../spreadsheet-normaliser/eval/runs/
  output-03.html  data answers           ../data-answers/eval/runs/
  output-04.html  sourced brief          ../sourced-brief/eval/runs/

Each page's frame (nav, hero, the words, footer) is hand-written. Everything
between <!--OUTPUT--> and <!--/OUTPUT--> is written here from the run folder:
no number, row or sentence in that region is typed by hand. By default the
latest counted run of each build is used, from the build's own eval/runs/ or from the
scorecard's sweeps, whichever is newer; --run picks another by its run id or label.

  python3 scripts/outputs.py                         # every page that exists
  python3 scripts/outputs.py 01                      # one page
  python3 scripts/outputs.py 01 --run E202610251246  # one page, a chosen run

The tracker's released board is copied into outputs/ and, when Playwright is
installed (it is for scripts/shot.py), pictured as a PNG beside it.
Only what is between the markers is replaced. Rerun after any new counted run.
"""
import argparse, csv, datetime, html, json, pathlib, re, shutil, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CODE = ROOT.parent
OUT = ROOT / "outputs"
esc = html.escape

# Words the site never carries (CLAUDE.md, rule 4), found in the synthetic contacts.
# Each is swapped for the site's own word wherever a run's text is shown.
# The page says so wherever a swap was made, so the reader knows the text was touched.
SITE_SWAPS = [("Marketing Director", "Commercial Director")]
SWAPPED = set()

def swap(text):
    for a, b in SITE_SWAPS:
        if a in text:
            SWAPPED.add(a)
            text = text.replace(a, b)
    return text

def ic(name):
    return f'<svg class="ic" aria-hidden="true"><use href="#ic-{name}"/></svg>'

def day(d):
    return datetime.date.fromisoformat(d[:10]).strftime("%-d %b %Y")

def md(text):
    """The little markdown a model writes in a reply: bold and code."""
    t = esc(swap(text))
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"`(.+?)`", r'<span class="mono">\1</span>', t)
    return t

def record_line(run):
    model = run["model"] + (f' at {run["effort"]} effort' if run.get("effort") else "")
    rid = run.get("label", run["run_id"]).split("-")[0]   # a sweep's run is named by its sweep, as on the scorecard
    return (f'<p class="out-run">{ic("circle-check")}<span>From run <b>{esc(rid)}</b>, '
            f'{esc(model)}, {day(run["date"])}</span></p>')

def counted_runs(repo):
    """Every counted, completed run that kept its folder, oldest first: the build's own runs in
    eval/runs/, and the scorecard's sweep runs of the build (their records in ../scorecard/results/
    point at the folder the sweep kept)."""
    runs = []
    def take(folder):
        f = folder / "result.json"
        if not f.exists(): return
        r = json.loads(f.read_text(encoding="utf-8"))
        if r.get("counted") and r.get("completed") and r.get("mode") != "mock":
            r["_folder"] = folder
            runs.append(r)
    for f in sorted((repo / "eval" / "results").glob("*.json")):
        r = json.loads(f.read_text(encoding="utf-8"))
        if r.get("counted") and r.get("completed"):
            take(repo / "eval" / "runs" / r.get("label", f.stem))
    sweeps = CODE / "scorecard"
    for f in sorted((sweeps / "results").glob(f"S*-{repo.name}-*.json")):
        r = json.loads(f.read_text(encoding="utf-8"))
        if r.get("counted") and not r.get("refused") and r.get("harness_record"):
            take((sweeps / r["harness_record"]).parent)
    seen, unique = set(), []
    for r in sorted(runs, key=lambda r: r.get("started_at", r.get("date", ""))):
        if r.get("label", r["run_id"]) not in seen:
            seen.add(r.get("label", r["run_id"]))
            unique.append(r)
    return unique

def pick(repo, wanted):
    runs = counted_runs(repo)
    if not runs:
        sys.exit(f"{repo.name}: no counted run with a run folder")
    if not wanted:
        return runs[-1]
    for r in runs:
        if wanted in (r.get("run_id"), r.get("label")):
            return r
    sys.exit(f"{repo.name}: no counted run {wanted}")

def write(page, block):
    path = ROOT / page
    src = path.read_text(encoding="utf-8")
    pat = re.compile(r"(<!--OUTPUT-->)(.*?)(<!--/OUTPUT-->)", re.S)
    if not pat.search(src):
        sys.exit(f"{page}: no <!--OUTPUT--> markers")
    path.write_text(pat.sub(lambda m: m.group(1) + "\n" + block + "\n" + m.group(3), src), encoding="utf-8")

def picture(html_file, png_file, width, height):
    """Pictures a released page, cropped to its content; returns the height used."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print(f"  {png_file.name}: not pictured (Playwright is not installed here); the copy beside it is current")
        return None
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": width, "height": height}, device_scale_factor=2)
        pg.goto(html_file.resolve().as_uri()); pg.wait_for_timeout(400)
        # the lowest edge of anything drawn on the page, plus the page's own side margin
        bottom = pg.evaluate("""() => { let m = 0; for (const el of document.querySelectorAll('.page *')) {
            const r = el.getBoundingClientRect(); if (r.height && r.width) m = Math.max(m, r.bottom); }
            const pad = parseFloat(getComputedStyle(document.querySelector('.page')).paddingLeft) || 40;
            return Math.ceil(m + pad); }""")
        h = min(height, bottom)
        pg.screenshot(path=str(png_file), clip={"x": 0, "y": 0, "width": width, "height": h})
        b.close()
    print(f"  {png_file.name}: pictured")
    return h

# ---------------------------------------------------------------- output-01, meeting tracker
TRACKER_TRANSCRIPT = "04_halden_finance.txt"   # the transcript shown beside its rows: the one the two-people stop held
TRACKER_GATE = 1                                # Gate 1, a name that matches two people

def tracker(wanted):
    repo = CODE / "meeting-tracker-server"
    run = pick(repo, wanted)
    data = run["_folder"] / "data"
    rid = run["run_id"]

    # the transcript, line by line
    raw = (data / "transcripts" / TRACKER_TRANSCRIPT).read_text(encoding="utf-8").splitlines()
    head = dict(re.match(r"(\w+): (.*)", l).groups() for l in raw if re.match(r"(Meeting|Date|Attendees): ", l))
    lines = [m.groups() for l in raw if (m := re.match(r"\[(\d+)\] ([^:]+): (.*)", l))]

    rows = [r for r in csv.DictReader(open(data / "tracker.csv", encoding="utf-8")) if r["transcript"] == TRACKER_TRANSCRIPT]
    by_line = {}
    for r in rows:
        by_line.setdefault(r["source_line"], []).append(r["action_id"])
    log = list(csv.DictReader(open(data / "run_log.csv", encoding="utf-8")))
    notes = [l["detail"] for l in log if l["transcript"] == TRACKER_TRANSCRIPT and l["step"] == "note"]

    line_html = []
    for n, who, said in lines:
        ids = by_line.get(n)
        attrs = f' data-src="l{n}" tabindex="0"' if ids else ""
        chips = "".join(f'<span class="aid">{esc(a)}</span>' for a in ids or [])
        line_html.append(f'        <li class="lit"{attrs}><span class="ln">{n}</span><span class="said"><b>{esc(who)}</b> {esc(swap(said))}{chips}</span></li>')

    row_html = []
    for r in rows:
        owner = esc(r["owner"])
        if r["owner_company"]:
            owner += f'<span class="sub">{esc(swap(r["owner_role"]))}, {esc(r["owner_company"])}</span>'
        else:
            owner = f'<span class="none">{owner}</span>'
        due = f'<b>{esc(r["due"])}</b>' + (f'<span class="sub">{esc(swap(r["due_note"]))}</span>' if r["due_note"] else "")
        row_html.append(f'        <li class="row lit" data-src="l{esc(r["source_line"])}" tabindex="0">'
                        f'<p class="row-top"><span class="mono">{esc(r["action_id"])}</span><span class="st {esc(r["status"])}">{esc(r["status"])}</span><span class="mono src">line {esc(r["source_line"])}</span></p>'
                        f'<p class="act">{esc(swap(r["action"]))}</p>'
                        f'<div class="row-cols"><p><span class="k">Owner</span>{owner}</p><p><span class="k">Due</span>{due}</p></div></li>')

    # the gate: the code's stop, the question as the model asked it, the answer, and what the log did next
    stop = next(l for l in log if l["step"] == "stop" and l["detail"].startswith(f"Gate {TRACKER_GATE} "))
    stop_at = stop["timestamp"]
    who = re.search(r": (.+?) matches", stop["detail"])
    who = who.group(1) if who else ""
    talk = json.loads((run["_folder"] / "transcript.json").read_text(encoding="utf-8"))["transcript"]
    reply_i = next(i for i, m in enumerate(talk) if m["who"] == "person" and i > 0)
    asked = next(m["text"] for m in reversed(talk[:reply_i]) if m["who"] == "model")
    items = re.split(r"\n(?=\d+\. )", asked)
    question = next(x for x in items if re.search(rf"Gate {TRACKER_GATE}\b", x) and TRACKER_TRANSCRIPT in x)
    question = re.sub(r"^\d+\. ", "", question.strip())
    answer = talk[reply_i]["text"]
    parts = re.split(r"(?<=\.) ", answer)
    answer_html = " ".join(f"<b>{md(p)}</b>" if who and who in p else md(p) for p in parts)
    after = [l for l in log if l["transcript"] == TRACKER_TRANSCRIPT and l["timestamp"] > stop_at and l["step"] in ("lookup", "append")]
    after_html = "".join(f'<li><span class="k">{esc(l["step"])}, {esc(l["result"])}</span>{esc(swap(l["detail"]))}</li>' for l in after)

    # the released page: the board, copied and pictured
    OUT.mkdir(exist_ok=True)
    board = OUT / f"{rid}-board.html"
    for old in OUT.glob("*-board.*"):   # an earlier run's board leaves with its run
        if not old.name.startswith(f"{rid}-"):
            old.unlink()
    shutil.copyfile(run["_folder"] / "board.html", board)
    shot = board.with_suffix(".png")
    shot_h = picture(board, shot, 1123, 794)   # A4 landscape at 96 dpi, the size the board is set for
    if shot_h is None and shot.exists():   # not pictured here: keep the size of the picture already beside it
        shot_h = int.from_bytes(shot.read_bytes()[20:24], "big") // 2
    shot_h = shot_h or 794

    summary = (data / f"summary_{rid}.md").read_text(encoding="utf-8")
    counts = re.search(r"^Transcripts read:.*$", summary, re.M)

    stop_html, question_html = esc(swap(stop["detail"])), md(question)
    as_written = ("The question and the answer are as they were written, except one job title in the synthetic contacts, "
                  "which this site shows under another name.") if SWAPPED else \
                 "The question and the answer are as they were written."

    block = "\n".join([
        record_line(run),
        "",
        '<section id="pair">',
        f'  <h2><span class="badge">{ic("message")}</span>One transcript, and the rows it became</h2>',
        '  <p class="lead"><b>Point at a line</b> to light the row it became, or at a row to light the line it came from. A line with no row was read as no action, and the run\'s note says why.</p>',
        '  <div class="pair linked">',
        f'    <div class="panel side" data-peek="The transcript, {esc(TRACKER_TRANSCRIPT)}">',
        f'      <p class="side-head"><span class="badge badge-s">{ic("file")}</span>The transcript<span class="mono">{esc(TRACKER_TRANSCRIPT)}</span></p>',
        f'      <p class="meta"><b>{esc(head.get("Meeting", ""))}</b><br>{esc(head.get("Date", "date not stated"))} · {esc(head.get("Attendees", ""))}</p>',
        '      <ol class="lines">',
        *line_html,
        "      </ol>",
        "    </div>",
        '    <div class="panel side" data-peek="The tracker">',
        f'      <p class="side-head"><span class="badge badge-s">{ic("table")}</span>The tracker<span class="mono">tracker.csv</span></p>',
        '      <ol class="rows">',
        *row_html,
        "      </ol>",
        *(f'      <p class="run-note"><b>The run\'s note on this transcript.</b> {esc(swap(n))}</p>' for n in notes),
        "    </div>",
        "  </div>",
        "</section>",
        "",
        '<section id="gate">',
        f'  <h2><span class="badge amber">{ic("hand")}</span>Where it stopped and asked</h2>',
        f'  <p class="lead">The run reached this transcript and <b>the code would not let it append</b> until a person chose between two contacts. {as_written}</p>',
        '  <div class="panel flow">',
        f'    <div class="step"><span class="badge amber">{ic("stop")}</span><div><p class="step-k">The code stopped the run</p><p class="log">{stop_html}</p></div></div>',
        f'    <div class="step"><span class="badge">{ic("message")}</span><div><p class="step-k">The question, as asked</p><p class="said">{question_html}</p></div></div>',
        f'    <div class="step"><span class="badge">{ic("user")}</span><div><p class="step-k">The answer it was given</p><p class="said">{answer_html}</p></div></div>',
        f'    <div class="step"><span class="badge">{ic("check")}</span><div><p class="step-k">What the log shows next</p><ul class="log">{after_html}</ul></div></div>',
        "  </div>",
        "</section>",
        "",
        '<section id="board">',
        f'  <h2><span class="badge">{ic("grid")}</span>The page it released</h2>',
        f'  <p class="lead">The action board the run wrote once every answer was in. <b>{esc(counts.group(0)) if counts else ""}</b></p>',
        f'  <a class="board-shot" href="output-01-board.html"><img src="outputs/{shot.name}" width="1123" height="{shot_h}" loading="lazy" alt="The action board from the run: where the week\'s commitments stand, with every open action by owner and due date."></a>',
        f'  <p class="note"><a href="output-01-board.html">Open the board at full size</a></p>',
        "</section>",
    ])
    write("output-01.html", block)
    view = "\n".join([
        record_line(run),
        f'<div class="board-stage" data-w="1123" data-h="{shot_h}"><iframe src="outputs/{board.name}" width="1123" height="{shot_h}" title="The action board as the run released it"></iframe></div>',
    ])
    write("output-01-board.html", view)
    print(f"output-01.html: run {rid} ({run['model']}), {len(lines)} lines, {len(rows)} rows, gate {TRACKER_GATE}")

# ---------------------------------------------------------------- output-03, data answers
ANSWER_QUESTIONS = ["A02", "A03", "A07", "A09"]   # a single figure, a figure by group, a filtered rate, a growth figure
ANSWER_REFUSAL = "R01"                            # a metric the system does not define, with the nearest one it does

def answers(wanted):
    repo = CODE / "data-answers"
    run = pick(repo, wanted)
    talk = json.loads((run["_folder"] / "transcript.json").read_text(encoding="utf-8"))["transcript"]
    metrics = json.loads((repo / "metrics.json").read_text(encoding="utf-8"))["metrics"]

    # each question as asked, and the block the code returned for it
    asked, built, q = {}, {}, None
    for m in talk:
        if m["who"] == "harness" and m.get("text", "").startswith("question "):
            q = m["text"].split()[-1]
        elif q and m["who"] == "person" and q not in asked:
            asked[q] = m["text"]
        elif q and m["who"] == "tool" and m.get("name") in ("run_metric", "compare_periods"):
            r = json.loads(m["result"])
            if r.get("status") in ("ANSWER", "REFUSED"):
                built[q] = r
    used = {}
    for qid in ANSWER_QUESTIONS + [ANSWER_REFUSAL]:
        r = built[qid]
        used[qid] = r.get("metric") if r["status"] == "ANSWER" else r.get("nearest")

    def unit(u):
        return "" if u in ("amount", "orders") else f'<small>{esc(u)}</small>'
    def shown(v, u=None):
        """A number as a reader expects it: thousands separated, amounts to two places, counts whole; anything else as written."""
        try:
            n = float(v)
        except (TypeError, ValueError):
            return esc(str(v))
        if u == "orders" or (n == int(n) and u != "amount"): return f"{int(n):,}"
        return f"{n:,.2f}"
    def filters(f):
        return ", ".join(f'{esc(k)} is {esc(" or ".join(v))}' for k, v in f.items()) or "none"

    q_html = []
    for qid in ANSWER_QUESTIONS + [ANSWER_REFUSAL]:
        q_html.append(f'        <li class="lit" data-src="{qid}" tabindex="0"><span class="ln">{qid}</span><span class="said">{esc(asked[qid])}</span></li>')

    a_html = []
    for qid in ANSWER_QUESTIONS:
        r = built[qid]
        if r.get("rows"):
            groups = "".join(f'<tr><td>{esc(g["group"])}</td><td class="num">{shown(g["value"], r["unit"])}{unit(r["unit"])}</td></tr>' for g in r["rows"])
            figure = f'<table class="groups"><thead><tr><th scope="col">{esc(", ".join(r["dimensions"]))}</th><th scope="col" class="num">{esc(r["metric"])}</th></tr></thead><tbody>{groups}</tbody></table>'
        else:
            figure = f'<p class="figure-n">{shown(r["value"], r["unit"])}{unit(r["unit"])}</p>'
        period = esc(r["period"]) + (f', against {esc(r["previous_period"])}' if r.get("previous_period") else "") \
                 + (f' against {esc(r["period_b"])}' if r.get("period_b") else "")
        a_html.append("\n".join([
            f'      <div class="ans panel lit" data-src="{qid} m-{esc(r["metric"])}" tabindex="0">',
            f'        <p class="ans-top"><span class="mono">{esc(r["answer_id"])}</span><span class="st">{esc(r["tool"])}</span></p>',
            f"        {figure}",
            '        <dl class="facts">',
            f'          <div><dt>Metric</dt><dd><b class="mono">{esc(r["metric"])}</b> {esc(r["definition"])}</dd></div>',
            f'          <div><dt>Period</dt><dd>{period}</dd></div>',
            f'          <div><dt>Filters</dt><dd>{filters(r["filters"])}</dd></div>',
            f'          <div><dt>Computed over</dt><dd>{shown(r["rows_over"])} of {shown(r["data_rows"])} rows, data version {r["data_version"]}</dd></div>',
            f'          <div><dt>Lineage</dt><dd>{esc(r["lineage"])}</dd></div>',
            "        </dl>",
            f'        <p class="sql">{esc(r["sql"])}</p>',
            "      </div>",
        ]))
    r = built[ANSWER_REFUSAL]
    a_html.append("\n".join([
        f'      <div class="ans panel refused lit" data-src="{ANSWER_REFUSAL} m-{esc(r.get("nearest") or "")}" tabindex="0">',
        f'        <p class="ans-top"><span class="mono">{ANSWER_REFUSAL}</span><span class="st refused">{esc(r["status"].lower())}, gate {esc(r["gate"])}</span></p>',
        f'        <p class="said">{esc(r["message"])}</p>',
        '        <dl class="facts">',
        f'          <div><dt>Reason</dt><dd class="mono">{esc(r["reason"])}</dd></div>',
        f'          <div><dt>Nearest metric</dt><dd><b class="mono">{esc(r.get("nearest") or "none")}</b></dd></div>',
        "        </dl>",
        "      </div>",
    ]))

    lit_metrics = set(used.values())
    m_html = []
    for m in metrics:
        attrs = f' data-src="m-{esc(m["name"])}" tabindex="0"' if m["name"] in lit_metrics else ""
        m_html.append(f'        <li class="lit"{attrs}><b class="mono">{esc(m["name"])}</b>{esc(m["definition"])}</li>')

    block = "\n".join([
        record_line(run),
        "",
        '<section id="pair">',
        f'  <h2><span class="badge">{ic("message")}</span>Questions as asked, answers as the code built them</h2>',
        '  <p class="lead"><b>Point at an answer</b> to light the question it answers and the metric definition it used. Every figure comes from a metric defined in code; <b>the model chooses the metric, the code computes it</b> and returns the block shown here.</p>',
        '  <div class="pair linked">',
        '    <div class="stack-side">',
        '      <div class="panel side" data-peek="The questions">',
        f'        <p class="side-head"><span class="badge badge-s">{ic("message")}</span>The questions</p>',
        '        <ol class="lines">',
        *q_html,
        "        </ol>",
        "      </div>",
        '      <div class="panel side" data-peek="The metrics">',
        f'        <p class="side-head"><span class="badge badge-s">{ic("book")}</span>The metrics<span class="mono">metrics.json</span></p>',
        '        <ul class="metrics">',
        *m_html,
        "        </ul>",
        "      </div>",
        "    </div>",
        '    <div class="answers" data-peek="The answers">',
        *a_html,
        "    </div>",
        "  </div>",
        "</section>",
    ])
    write("output-03.html", block)
    print(f"output-03.html: run {run['run_id']} ({run['model']}), {len(ANSWER_QUESTIONS)} answers, refusal {ANSWER_REFUSAL}")

# ---------------------------------------------------------------- output-04, sourced brief
BRIEF_CASE = "01_clean"   # the week with every source in play and every section filled
BRIEF_SHORT = 12          # a file with more lines than this shows only the lines the page cites

def slug(ref):
    return "s-" + re.sub(r"[^A-Za-z0-9]+", "-", ref).strip("-").lower()

def brief(wanted):
    repo = CODE / "sourced-brief"
    run = pick(repo, wanted)
    week = run["_folder"] / BRIEF_CASE
    page_md = next(week.glob("brief_2*.md")).read_text(encoding="utf-8").splitlines()
    removed_md = (week / "unsourced.md").read_text(encoding="utf-8").splitlines()
    claims = list(csv.DictReader(open(week / "claims.csv", encoding="utf-8")))

    # the released page, line by line, each sentence carrying its references
    cited, page_html, n, first_cite = set(), [], 0, []
    for line in page_md:
        if line.startswith("# "):
            page_html.append(f'        <p class="doc-title">{esc(line[2:])}</p>')
        elif line.startswith("## "):
            page_html.append(f'        <p class="doc-h">{esc(line[3:])}</p>')
        elif line.startswith("- "):
            m = re.match(r"- (.*?)\s*\[([^\]]+)\]$", line)
            if not m:
                page_html.append(f'        <p class="doc-s lit">{esc(line[2:])}</p>')
                continue
            text, refs = m.group(1), [r.strip() for r in m.group(2).split(";")]
            cited.update(refs)
            for r in refs:
                if r.split(" ", 1)[0] not in first_cite:
                    first_cite.append(r.split(" ", 1)[0])
            n += 1
            chips = "".join(f'<span class="ref">{esc(r)}</span>' for r in refs)
            page_html.append(f'        <p class="doc-s lit" data-src="{" ".join(slug(r) for r in refs)}" tabindex="0">{esc(text)}{chips}</p>')
        elif line.strip():
            page_html.append(f'        <p class="doc-meta">{esc(line)}</p>')

    # the sources, each line or row with the id a sentence cites it by
    read = re.search(r"Sources read: (.*?)\. Declined", "\n".join(page_md))
    files = [f.strip() for f in read.group(1).split(",")] if read else []
    by_file = {}
    for r in cited:
        by_file.setdefault(r.split(" ", 1)[0], set()).add(r)

    def item(ref, inner):
        on = f' data-src="{slug(ref)}" tabindex="0"' if ref in cited else ""
        return f'          <li class="lit"{on}>{inner}</li>'

    src_html = []
    for f in first_cite:   # in the order the page first cites them
        if f not in by_file:
            continue
        path = week / f
        items, note = [], ""
        if f == "tracker.csv":
            for r in csv.DictReader(open(path, encoding="utf-8")):
                ref = f"tracker.csv {r['action_id']}"
                items.append(item(ref, f'<span class="ln">{esc(r["action_id"])}</span><span class="said">{esc(r["action"])}<span class="sub">{esc(r["owner"])} · {esc(r["status"])} · due {esc(r["due"])}</span></span>'))
        elif f == "answers.csv":
            for r in csv.DictReader(open(path, encoding="utf-8")):
                ref = f"answers.csv {r['answer_id']}"
                unit = "%" if r["unit"] == "%" else ""
                items.append(item(ref, f'<span class="ln">{esc(r["question_id"])}</span><span class="said"><b class="mono">{esc(r["metric"])}</b> {esc(r["period"])}: <b>{shown(r["value"], r.get("unit"))}{unit}</b><span class="sub mono">{esc(r["answer_id"])}</span></span>'))
        else:
            lines = path.read_text(encoding="utf-8").splitlines()
            rows = list(csv.reader(lines)) if f.endswith(".csv") else None
            show = range(1, len(lines) + 1)
            if len(lines) > BRIEF_SHORT:
                show = sorted(int(r.rsplit(" ", 1)[1]) for r in by_file[f])
                note = f'<p class="src-note">{len(lines)} lines; the lines this page cites</p>'
            for i in show:
                text = lines[i - 1]
                if not text.strip() or (rows and i == 1):
                    continue
                if rows:   # a log line: the file, the step and what it says
                    head = rows[0]
                    rec = dict(zip(head, rows[i - 1]))
                    text = " · ".join(x for x in (rec.get("file"), rec.get("step"), rec.get("detail")) if x)
                items.append(item(f"{f} line {i}", f'<span class="ln">{i}</span><span class="said">{esc(text)}</span>'))
        src_html += [f'        <p class="src-file">{ic("file")}<span class="mono">{esc(f)}</span></p>', note,
                     f'        <ul class="lines src" data-peek="{esc(f)}">', *items, "        </ul>"]
    uncited = [f for f in files if f not in by_file]

    # what was removed, and every claim checked
    removed = [l for l in removed_md if l.strip() and not l.startswith("#")]
    kinds = {}
    for c in claims:
        k = kinds.setdefault(c["kind"], [0, 0])
        k[0] += 1
        k[1] += c["result"] == "pass"
    passed = sum(v[1] for v in kinds.values())
    kind_html = "".join(f'<li><b>{v[1]} of {v[0]}</b>{esc(k)}</li>' for k, v in sorted(kinds.items(), key=lambda kv: -kv[1][0]))

    block = "\n".join([
        record_line(run),
        "",
        '<section id="pair">',
        f'  <h2><span class="badge">{ic("file")}</span>The week\'s sources, and the page released from them</h2>',
        '  <p class="lead"><b>Point at a sentence</b> to light the source line it came from, or at a source line to light every sentence that cites it. Each sentence ends with its references, and <b>the code checked every claim against them</b> before the page was released.</p>',
        '  <div class="pair linked">',
        '    <div class="panel side">',
        f'      <p class="side-head"><span class="badge badge-s">{ic("folder")}</span>The sources</p>',
        *[h for h in src_html if h],
        (f'        <p class="src-note">Also read, cited by no sentence: {esc(", ".join(uncited))}.</p>' if uncited else ""),
        "    </div>",
        '    <div class="panel side doc" data-peek="The page as released">',
        f'      <p class="side-head"><span class="badge badge-s">{ic("clipboard")}</span>The page as released</p>',
        '      <div class="doc-body">',
        *page_html,
        "      </div>",
        "    </div>",
        "  </div>",
        "</section>",
        "",
        '<section id="removed">',
        f'  <h2><span class="badge amber">{ic("shield")}</span>What the code took out</h2>',
        '  <p class="lead">A sentence with a claim its reference does not hold, or with anything checkable left unreferenced, is removed whole and listed here with the reason. The page is released with what remains. <b>This is the list as the run wrote it.</b></p>',
        '  <div class="panel flow">',
        f'    <div class="step"><span class="badge amber">{ic("stop")}</span><div><p class="step-k">Removed from this page</p>'
        + "".join(f'<p class="said">{md(l.lstrip("- "))}</p>' for l in removed) + "</div></div>",
        f'    <div class="step"><span class="badge">{ic("circle-check")}</span><div><p class="step-k">Every claim the code checked, {passed} of {len(claims)} held</p><ul class="kinds">{kind_html}</ul></div></div>',
        "  </div>",
        "</section>",
    ])
    write("output-04.html", block)
    print(f"output-04.html: run {run['run_id']} ({run['model']}), week {BRIEF_CASE}, {n} sentences, {len(claims)} claims, {len(removed)} removed lines")

# ---------------------------------------------------------------- output-02, spreadsheet normaliser
NORM_FILES = ["02_stray_a.xlsx", "03_fmt_b.xlsx", "01_clean_b.xlsx"]   # titles and totals; text dates, separators and a held row; another set of headers
NORM_ROWS = 2                                                           # data rows shown from each file, and merged rows taken from each

def normaliser(wanted):
    import openpyxl
    repo = CODE / "spreadsheet-normaliser"
    run = pick(repo, wanted)
    data = run["_folder"] / "data"
    log = list(csv.DictReader(open(data / "decision_log.csv", encoding="utf-8")))
    merged = list(csv.DictReader(open(data / "merged.csv", encoding="utf-8")))
    held = list(csv.DictReader(open(data / "held_rows.csv", encoding="utf-8")))
    summary = sorted(data.glob("summary_*.md"))[-1].read_text(encoding="utf-8")
    fields = list(merged[0].keys()) if merged else []
    schema_fields = [f for f in fields if f not in ("source_file", "source_row", "added_run")]

    def shown(v):
        if v is None: return ""
        if isinstance(v, datetime.datetime): return v.date().isoformat()
        if isinstance(v, float) and v.is_integer(): return str(int(v))
        return str(v)
    def rid(f, r): return "r-" + re.sub(r"[^a-z0-9]+", "-", f"{f}-{r}".lower())

    mapping, reasons, notes, header_row, stray = {}, {}, {}, {}, {}
    for l in log:
        f = l["file"]
        if f not in NORM_FILES: continue
        if l["step"] == "scan" and (m := re.search(r"header row (\d+)", l["detail"])):
            header_row[f] = int(m.group(1))
        elif l["step"] == "map" and l["target"]:
            mapping.setdefault(f, {})[l["source"]] = l["target"]
            reasons.setdefault(l["target"], []).append((l["source"], f, l["detail"]))
        elif l["step"].startswith(("drop_", "parse_", "hold_")):
            if l["step"].startswith("drop_"):
                stray.setdefault(f, set()).add(int(l["source"].split()[-1]))
            what = f'{l["source"]}: ' if l["source"] else ""
            notes.setdefault(f, []).append(f'{what}{l["detail"]}')

    file_html = []
    for f in NORM_FILES:
        ws = openpyxl.load_workbook(data / "files" / f, data_only=True).active
        grid = [[shown(c) for c in row] for row in ws.iter_rows(values_only=True)]
        width = max(len(r) for r in grid)
        hr = header_row[f]
        header = grid[hr - 1]
        set_aside = stray.get(f, set())
        data_rows = [n for n in range(hr + 1, len(grid) + 1) if n not in set_aside]
        held_here = {int(h["source_row"]) for h in held if h["file"] == f}
        keep = sorted(set(data_rows[:NORM_ROWS]) | (held_here & set(data_rows)))
        show = sorted(set(keep) | {n for n in set_aside if n > hr})
        rows_html = []
        for n in range(1, hr):
            r = grid[n - 1]
            rows_html.append(f'<tr class="stray"><td class="rn">{n}</td><td colspan="{width}">{esc(" ".join(c for c in r if c)) or "blank row"}</td></tr>')
        th = "".join('<th scope="col" class="lit"' + (f' data-src="f-{esc(mapping[f][h])}" tabindex="0"' if h in mapping.get(f, {}) else "") + f'>{esc(h)}</th>' for h in header)
        rows_html.append(f'<tr class="head"><td class="rn">{hr}</td>{th}</tr>')
        last = hr
        for n in show:
            if n > last + 1:
                rows_html.append(f'<tr class="gap"><td class="rn"></td><td colspan="{width}">{n - last - 1} more rows</td></tr>')
            r = grid[n - 1]
            if n in set_aside:
                cells = "".join(f"<td>{esc(c)}</td>" for c in r) if any(r) else f'<td colspan="{width}">blank row</td>'
                rows_html.append(f'<tr class="stray"><td class="rn">{n}</td>{cells}</tr>')
            else:
                cls = " held" if n in held_here else ""
                rows_html.append(f'<tr class="lit{cls}" data-src="{rid(f, n)}" tabindex="0"><td class="rn">{n}</td>' + "".join(f"<td>{esc(c)}</td>" for c in r) + "</tr>")
            last = n
        if len(grid) > last:
            rows_html.append(f'<tr class="gap"><td class="rn"></td><td colspan="{width}">{len(grid) - last} more rows</td></tr>')
        note_html = "".join(f"<li>{esc(swap(x))}</li>" for x in notes.get(f, []))
        file_html.append("\n".join(x for x in [
            f'      <div class="panel side sheet" data-peek="{esc(f)}">',
            f'        <p class="side-head"><span class="badge badge-s">{ic("table")}</span><span class="mono">{esc(f)}</span></p>',
            f'        <div class="grid-wrap"><table class="sheet-t">{"".join(rows_html)}</table></div>',
            (f'        <ul class="sheet-notes">{note_html}</ul>' if note_html else ""),
            "      </div>",
        ] if x))

    # the merged table: the first rows that came from each file shown
    mrows = []
    for f in NORM_FILES:
        mrows += [r for r in merged if r["source_file"] == f][:NORM_ROWS]
    mth = "".join('<th scope="col" class="lit"' + (f' data-src="f-{esc(c)}" tabindex="0"' if c in schema_fields else "") + f'>{esc(c)}</th>' for c in fields)
    mtd = "".join(f'<tr class="lit" data-src="{rid(r["source_file"], r["source_row"])}" tabindex="0">' + "".join(f"<td>{esc(r[c])}</td>" for c in fields) + "</tr>" for r in mrows)

    why = []
    for field in schema_fields:
        by_file = {f: src for src, f, _ in reasons.get(field, [])}
        said = list(dict.fromkeys(swap(d) for _, _, d in reasons.get(field, [])))
        why.append(f'<tr class="lit" data-src="f-{esc(field)}" tabindex="0"><th scope="row" class="mono">{esc(field)}</th>'
                   + "".join(f"<td><b>{esc(by_file.get(f, ''))}</b></td>" for f in NORM_FILES)
                   + "<td>" + "<br>".join(esc(d) for d in said) + "</td></tr>")
    why_head = "<tr><th scope=\"col\">Field</th>" + "".join(f'<th scope="col" class="mono">{esc(f)}</th>' for f in NORM_FILES) + '<th scope="col">The reason logged</th></tr>'

    h = held[0] if held else None
    recon = re.search(r"^\*\*Reconciled:\*\*.*$", summary, re.M)

    block = "\n".join(x for x in [
        record_line(run),
        "",
        '<section id="pair" class="linked">',
        f'  <h2><span class="badge">{ic("table")}</span>Three files as they arrived</h2>',
        '  <p class="lead">Each branch sends its own layout: title rows, blank lines, totals, its own header names and its own way of writing a date. <b>Point at a header</b> to light the merged column it became and the reason the run gave for it; <b>point at a row</b> to light it in the merged table.</p>',
        '  <div class="sheets">',
        *file_html,
        "  </div>",
        f'  <h2 class="after"><span class="badge">{ic("layers")}</span>One table out</h2>',
        '  <div class="panel side" data-peek="The merged table">',
        f'    <p class="side-head"><span class="badge badge-s">{ic("database")}</span>The merged table<span class="mono">merged.csv</span></p>',
        f'    <div class="grid-wrap"><table class="sheet-t merged"><thead><tr>{mth}</tr></thead><tbody>{mtd}</tbody></table></div>',
        f'    <p class="src-note">{len(merged)} rows in all; shown here, the first {NORM_ROWS} from each file above.</p>',
        "  </div>",
        '  <div class="panel side why" data-peek="Why each header went where it did">',
        f'    <p class="side-head"><span class="badge badge-s">{ic("list")}</span>Why each header went where it did<span class="mono">decision_log.csv</span></p>',
        f'    <div class="grid-wrap"><table class="sheet-t why-t"><thead>{why_head}</thead><tbody>{"".join(why)}</tbody></table></div>',
        "  </div>",
        "</section>",
        "",
        '<section id="held">',
        f'  <h2><span class="badge amber">{ic("hand")}</span>What was held, and the count that closes</h2>',
        '  <p class="lead">A value that fails its type is held with its reason and never rewritten. Every row read is accounted for in the summary the run wrote.</p>',
        '  <div class="panel flow">',
        (f'    <div class="step"><span class="badge amber">{ic("stop")}</span><div><p class="step-k">Held row, {esc(h["file"])} row {esc(h["source_row"])}</p>'
         f'<p class="said"><b class="mono">{esc(h["record_id"])}</b> {esc(h["field"])} reads <b>{esc(h["value"])}</b>: {esc(h["reason"])}</p></div></div>') if h else "",
        (f'    <div class="step"><span class="badge">{ic("check")}</span><div><p class="step-k">The reconciliation</p><p class="said">{md(recon.group(0))}</p></div></div>') if recon else "",
        "  </div>",
        "</section>",
    ] if x is not None)
    write("output-02.html", block)
    print(f"output-02.html: run {run['run_id']} ({run['model']}), files {', '.join(NORM_FILES)}, {len(mrows)} merged rows shown")

BUILDS = {"01": tracker, "02": normaliser, "03": answers, "04": brief}

ap = argparse.ArgumentParser()
ap.add_argument("pages", nargs="*", help="01 to 04; every page that exists when left out")
ap.add_argument("--run", help="a run id or label, when the latest counted run is not wanted")
args = ap.parse_args()
todo = args.pages or [k for k in BUILDS if (ROOT / f"output-{k}.html").exists()]
if args.run and len(todo) != 1:
    sys.exit("--run picks a run for one page: name the page too")
for k in todo:
    if k not in BUILDS:
        sys.exit(f"output-{k}: not written by this script yet")
    BUILDS[k](args.run)
