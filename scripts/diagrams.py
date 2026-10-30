#!/usr/bin/env python3
"""Draws the workflow diagrams on casefiles.html, built.html and aiwork.html as inline SVG.

Each diagram is a swimlane: steps across the top, who or what does each step
down the side, stop points marked in amber. The drawing is written from a
small spec below, so the geometry is the same on every page. Run from the
repo root to rewrite every diagram in place:

  python3 scripts/diagrams.py

Each diagram sits between <!--DIAGRAM:name--> and <!--/DIAGRAM:name--> in the
page; only what is between those markers is replaced.
"""
import pathlib, re

W = 720          # drawing width (fits the card at scale 1)
LW = 98          # the lane label column
H0 = 30          # the step header row
PAD_B = 6

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def node_text(x, y, lines, stop_note=None, light=False):
    out = []
    n = len(lines) + (1 if stop_note else 0)
    lh = 12.5
    y0 = y - (n - 1) * lh / 2 + 3.4
    for i, ln in enumerate(lines):
        cls = "node-text light" if light else "node-text"
        if "_" in ln: cls += " code"
        out.append(f'<text class="{cls}" x="{x}" y="{y0 + i*lh:.1f}" text-anchor="middle">{esc(ln)}</text>')
    if stop_note:
        out.append(f'<text class="stop-text" x="{x}" y="{y0 + len(lines)*lh:.1f}" text-anchor="middle">{esc(stop_note)}</text>')
    return "\n".join(out)

def draw(spec):
    steps = spec["steps"]; lanes = spec["lanes"]; nodes = spec["nodes"]
    LH = spec.get("lane_h", 72)
    n = len(steps); CW = (W - LW) / n
    H = H0 + len(lanes) * LH + PAD_B
    step_delay = spec.get("step_delay", 0.3)
    g = [f'<svg class="diagram cols-{n}" viewBox="0 0 {W} {H:.0f}" role="img" aria-label="{esc(spec["alt"])}">']

    # lanes
    for li, lane in enumerate(lanes):
        y = H0 + li * LH
        alt = " alt" if li % 2 else ""
        g.append(f'<rect class="lane{alt}" x="0" y="{y}" width="{W}" height="{LH}" rx="4"/>')
        for k, ln in enumerate(lane.split("|")):
            g.append(f'<text class="lane-label" x="10" y="{y + LH/2 + 4 - (len(lane.split("|"))-1)*6 + k*12:.1f}">{esc(ln)}</text>')

    # one column per step, behind the nodes (only these take the pointer): resting on it lights that step
    for i, st in enumerate(steps):
        x = LW + i * CW
        g.append(f'<rect class="hit" data-step="{i}" x="{x:.1f}" y="0" width="{CW:.1f}" height="{H - PAD_B}" rx="6"><title>Step {i+1}: {esc(st)}</title></rect>')

    # the lane label column is closed off by its own line, then a guide between every step
    g.append(f'<line class="guide solid" x1="{LW}" y1="{H0}" x2="{LW}" y2="{H - PAD_B}"/>')
    for i, st in enumerate(steps):
        x = LW + i * CW
        if i:
            g.append(f'<line class="guide" x1="{x:.1f}" y1="{H0}" x2="{x:.1f}" y2="{H - PAD_B}"/>')
        cx = x + CW / 2
        d = i * step_delay
        g.append(f'<g class="d-fade" data-step="{i}" style="--delay:{d:.2f}s">'
                 f'<text class="step-no" x="{cx:.1f}" y="11" text-anchor="middle">{i+1:02d}</text>'
                 f'<text class="step-name" x="{cx:.1f}" y="24" text-anchor="middle">{esc(st)}</text></g>')

    # geometry of each node, keyed by (lane index, step index)
    geo = {}
    NW = CW - 12; NH = LH - 18
    for nd in nodes:
        li, si = nd["at"]
        x = LW + si * CW + 6; y = H0 + li * LH + 9
        geo[(li, si)] = (x, y, NW, NH)

    # links first, so nodes sit on top
    for a, b in spec.get("links", []):
        (ax, ay, aw, ah) = geo[a]; (bx, by, bw, bh) = geo[b]
        d = max(a[1], b[1]) * step_delay + 0.18
        amber = f' amber' if spec.get("amber_links") else ''
        ds = f' data-step="{max(a[1], b[1])}"'
        if a[0] == b[0]:            # same lane: horizontal
            y = ay + ah / 2
            x1 = ax + aw; x2 = bx
            g.append(f'<line class="link d-draw{amber}"{ds} pathLength="1" x1="{x1:.1f}" y1="{y:.1f}" x2="{x2-4:.1f}" y2="{y:.1f}" style="--delay:{d:.2f}s"/>')
            g.append(f'<polygon class="head d-fade{amber}"{ds} points="{x2-6:.1f},{y-3.5:.1f} {x2:.1f},{y:.1f} {x2-6:.1f},{y+3.5:.1f}" style="--delay:{d+0.3:.2f}s"/>')
        elif a[1] == b[1]:          # same step: vertical
            x = ax + aw / 2
            if by > ay:
                y1 = ay + ah; y2 = by
                g.append(f'<line class="link d-draw{amber}"{ds} pathLength="1" x1="{x:.1f}" y1="{y1:.1f}" x2="{x:.1f}" y2="{y2-4:.1f}" style="--delay:{d:.2f}s"/>')
                g.append(f'<polygon class="head d-fade{amber}"{ds} points="{x-3.5:.1f},{y2-6:.1f} {x:.1f},{y2:.1f} {x+3.5:.1f},{y2-6:.1f}" style="--delay:{d+0.3:.2f}s"/>')
            else:
                y1 = ay; y2 = by + bh
                g.append(f'<line class="link d-draw{amber}"{ds} pathLength="1" x1="{x:.1f}" y1="{y1:.1f}" x2="{x:.1f}" y2="{y2+4:.1f}" style="--delay:{d:.2f}s"/>')
                g.append(f'<polygon class="head d-fade{amber}"{ds} points="{x-3.5:.1f},{y2+6:.1f} {x:.1f},{y2:.1f} {x+3.5:.1f},{y2+6:.1f}" style="--delay:{d+0.3:.2f}s"/>')
        elif any((a[0], s_) in geo for s_ in range(a[1] + 1, b[1] + 1)):
            # the run across would pass behind a box: leave from the top or bottom, then cross into the side
            x1 = ax + aw / 2
            y2 = by + bh / 2; x2 = bx
            y1 = ay + ah if by > ay else ay
            path = f'M{x1:.1f} {y1:.1f} V{y2:.1f} H{x2-4:.1f}'
            g.append(f'<path class="link d-draw{amber}"{ds} pathLength="1" d="{path}" style="--delay:{d:.2f}s"/>')
            g.append(f'<polygon class="head d-fade{amber}"{ds} points="{x2-6:.1f},{y2-3.5:.1f} {x2:.1f},{y2:.1f} {x2-6:.1f},{y2+3.5:.1f}" style="--delay:{d+0.3:.2f}s"/>')
        else:                       # elbow: out of the right edge, across the gap, into the top or bottom
            x1 = ax + aw; y1 = ay + ah / 2
            x2 = bx + bw / 2
            if by > ay:
                y2 = by
                path = f'M{x1:.1f} {y1:.1f} H{x2:.1f} V{y2-4:.1f}'
                g.append(f'<path class="link d-draw{amber}"{ds} pathLength="1" d="{path}" style="--delay:{d:.2f}s"/>')
                g.append(f'<polygon class="head d-fade{amber}"{ds} points="{x2-3.5:.1f},{y2-6:.1f} {x2:.1f},{y2:.1f} {x2+3.5:.1f},{y2-6:.1f}" style="--delay:{d+0.3:.2f}s"/>')
            else:
                y2 = by + bh
                path = f'M{x1:.1f} {y1:.1f} H{x2:.1f} V{y2+4:.1f}'
                g.append(f'<path class="link d-draw{amber}"{ds} pathLength="1" d="{path}" style="--delay:{d:.2f}s"/>')
                g.append(f'<polygon class="head d-fade{amber}"{ds} points="{x2-3.5:.1f},{y2+6:.1f} {x2:.1f},{y2:.1f} {x2+3.5:.1f},{y2+6:.1f}" style="--delay:{d+0.3:.2f}s"/>')

    # nodes
    for nd in nodes:
        li, si = nd["at"]; x, y, w, h = geo[(li, si)]
        d = si * step_delay + 0.08
        kind = nd.get("kind", "")
        cls = "node" + (" soft" if kind == "soft" else "") + (" ink" if kind == "ink" else "")
        if nd.get("stop"): cls += " stopbox"
        g.append(f'<g class="d-pop" data-step="{si}" style="--delay:{d:.2f}s">')
        g.append(f'<rect class="{cls}" x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="5"/>')
        g.append(node_text(x + w / 2, y + h / 2, nd["lines"], nd.get("stop"), light=(kind == "ink")))
        g.append('</g>')
        if nd.get("stop"):
            cx, cy = x + w - 2, y + 2
            g.append(f'<circle class="ring" data-step="{si}" cx="{cx:.1f}" cy="{cy:.1f}" r="6" style="--delay:{d+0.45:.2f}s"/>')
            g.append(f'<g class="d-pop" data-step="{si}" style="--delay:{d+0.3:.2f}s"><circle class="stop" cx="{cx:.1f}" cy="{cy:.1f}" r="6" style="fill:var(--panel)"/><circle class="stop-core" cx="{cx:.1f}" cy="{cy:.1f}" r="2.4"/></g>')

    g.append("</svg>")
    return "\n".join(g)


# ---------------------------------------------------------------------------
# The diagrams. Lane index down, step index across, both from zero.
# "stop" is the amber mark and the words under the node: where the run halts
# until a person confirms, or where a rule halts it.
# ---------------------------------------------------------------------------

DIAGRAMS = {}

DIAGRAMS["case-01"] = dict(
    alt="Seven steps from a use case to a deliverable, with two stops: the prompt passes its test cases before it enters the library, and every output passes the checkpoint before it enters a deliverable",
    steps=["Use case", "Prompt", "Test", "Library", "Run", "Checkpoint", "Deliverable"],
    lanes=["Me", "The model", "The playbook"],
    nodes=[
        dict(at=(0, 0), lines=["names the", "task"]),
        dict(at=(0, 1), lines=["designs the", "prompt"]),
        dict(at=(1, 2), lines=["runs it on", "real cases"]),
        dict(at=(0, 2), lines=["checks against", "known answers"], stop="pass first"),
        dict(at=(2, 3), lines=["prompt, tests", "and version", "written down"], kind="soft"),
        dict(at=(1, 4), lines=["runs the task", "the same way"]),
        dict(at=(0, 5), lines=["checks output", "against rules"], stop="pass first"),
        dict(at=(2, 5), lines=["the checkpoint", "rules"], kind="soft"),
        dict(at=(0, 6), lines=["enters the", "deliverable"], kind="ink"),
    ],
    links=[((0,0),(0,1)), ((0,1),(1,2)), ((1,2),(0,2)), ((0,2),(2,3)), ((2,3),(1,4)), ((1,4),(0,5)), ((0,5),(0,6))],
)

DIAGRAMS["case-02"] = dict(
    alt="Six stages from the export to the delivery pack; the assistant stops at every stage for the count to be confirmed, and the validation tool checks the emails outside the model",
    steps=["Export in", "Scope", "Emails out", "Verdicts in", "CRM format", "Delivery"],
    lanes=["Me", "Claude with|the skill", "Validation|tool"],
    nodes=[
        dict(at=(0, 0), lines=["drops the", "export in"]),
        dict(at=(1, 0), lines=["rows, columns", "and countries"], stop="count confirmed"),
        dict(at=(1, 1), lines=["cut to scope,", "duplicates out"], stop="count confirmed"),
        dict(at=(1, 2), lines=["emails sent out;", "names held back"], stop="count confirmed"),
        dict(at=(2, 2), lines=["checks every", "address"], kind="soft"),
        dict(at=(1, 3), lines=["results merged;", "invalid removed"], stop="count confirmed"),
        dict(at=(1, 4), lines=["16 columns, a", "status per record"], stop="count confirmed"),
        dict(at=(1, 5), lines=["file, email,", "slides and log"], kind="ink"),
        dict(at=(0, 5), lines=["sends the", "pack"]),
    ],
    links=[((0,0),(1,0)), ((1,0),(1,1)), ((1,1),(1,2)), ((1,2),(2,2)), ((2,2),(1,3)), ((1,3),(1,4)), ((1,4),(1,5)), ((1,5),(0,5))],
)

DIAGRAMS["case-03"] = dict(
    alt="Six steps from five platform exports to the dashboard; the pipeline standardises, applies the written cleaning rules, consolidates into one table and reconciles the row counts before the dashboard refreshes",
    steps=["Export", "Ingest", "Standardise", "Clean", "One table", "Dashboard"],
    lanes=["Five|platforms", "Power Query", "Dashboard"],
    nodes=[
        dict(at=(0, 0), lines=["every export", "dropped in", "one folder"]),
        dict(at=(1, 1), lines=["reads every", "file"]),
        dict(at=(1, 2), lines=["one naming and", "one format"]),
        dict(at=(1, 3), lines=["the written", "cleaning rules", "applied"], kind="soft"),
        dict(at=(1, 4), lines=["20+ metrics in", "one table"], stop="counts reconciled"),
        dict(at=(2, 5), lines=["refreshes from", "the table"], kind="ink"),
    ],
    links=[((0,0),(1,1)), ((1,1),(1,2)), ((1,2),(1,3)), ((1,3),(1,4)), ((1,4),(2,5))],
)

DIAGRAMS["tracker"] = dict(
    alt="Seven steps of the meeting tracker across four lanes: me, Claude with the skill, the tool server, and the files on disk; the tool server stops the run when a transcript is confidential, when a name matches two people, when a meeting has no actions, or when a date falls before its meeting",
    steps=["Start", "Find new", "Read", "Decide", "Look up", "Record", "Report"],
    lanes=["Me", "Claude with|the skill", "The tool|server", "Files on|disk"],
    lane_h=72,
    nodes=[
        dict(at=(0, 0), lines=['"Run the', 'tracker"']),
        dict(at=(1, 1), lines=["asks for new", "transcripts"]),
        dict(at=(2, 1), lines=["tracker_scan"], stop="confidential"),
        dict(at=(3, 1), lines=["transcripts", "folder"], kind="soft"),
        dict(at=(1, 2), lines=["asks for", "each one"]),
        dict(at=(2, 2), lines=["tracker_read_", "transcript"]),
        dict(at=(3, 2), lines=["one", "transcript"], kind="soft"),
        dict(at=(1, 3), lines=["picks actions,", "owners, dates"], kind="ink"),
        dict(at=(1, 4), lines=["asks who", "each name is"]),
        dict(at=(2, 4), lines=["tracker_lookup"], stop="two people: ask"),
        dict(at=(3, 4), lines=["contacts table", "(stands in", "for a CRM)"], kind="soft"),
        dict(at=(0, 4), lines=["answers if", "it stops"]),
        dict(at=(1, 5), lines=["asks to add", "the rows"]),
        dict(at=(2, 5), lines=["tracker_append"], stop="no actions: ask"),
        dict(at=(3, 5), lines=["tracker and", "run log"], kind="soft"),
        dict(at=(0, 5), lines=["answers if", "it stops"]),
        dict(at=(1, 6), lines=["writes the", "summary"]),
        dict(at=(2, 6), lines=["tracker_", "summary"]),
        dict(at=(3, 6), lines=["summary", "page"], kind="soft"),
        dict(at=(0, 6), lines=["reads the", "summary"], kind="ink"),
    ],
    links=[((0,0),(1,1)), ((1,1),(2,1)), ((2,1),(3,1)), ((1,1),(1,2)), ((1,2),(2,2)), ((2,2),(3,2)),
           ((1,2),(1,3)), ((1,3),(1,4)), ((1,4),(2,4)), ((2,4),(3,4)),
           ((1,4),(1,5)), ((1,5),(2,5)), ((2,5),(3,5)),
           ((1,5),(1,6)), ((1,6),(2,6)), ((2,6),(3,6)), ((1,6),(0,6))],
)

DIAGRAMS["harness"] = dict(
    alt="The test harness in five steps: expected results written first, a fresh folder, Claude run through the API with only the skill, a checker that compares every case, and the record",
    steps=["Expected", "Fresh folder", "Run blind", "Check", "Record"],
    lanes=["Me", "The harness|(a script)", "Claude through|the API"],
    nodes=[
        dict(at=(0, 0), lines=["writes the", "expected result", "for every case"]),
        dict(at=(1, 1), lines=["test transcripts", "and contacts", "copied in, only"]),
        dict(at=(1, 2), lines=["the skill and", "'run the tracker';", "gate answers fixed"]),
        dict(at=(2, 2), lines=["runs every case", "on any model tier"], kind="ink"),
        dict(at=(1, 3), lines=["compares each result", "with the expected one"], stop="pass, or named"),
        dict(at=(1, 4), lines=["result and cost", "saved; the page", "rebuilt"], kind="soft"),
    ],
    links=[((0,0),(1,1)), ((1,1),(1,2)), ((1,2),(2,2)), ((2,2),(1,3)), ((1,3),(1,4))],
)

DIAGRAMS["versions"] = dict(
    alt="How a version is earned, in six steps across three lanes: the expected results are written first, the harness runs the case set blind and checks every case, a miss is named with its line, one rule in the skill changes and the version number moves, and the same cases are run again and recorded",
    steps=["Expected", "Run blind", "Check", "Name the miss", "Fix the rule", "Rerun"],
    lanes=["Me", "The harness|(a script)", "The skill|(the rules)"],
    nodes=[
        dict(at=(0, 0), lines=["writes the", "expected result", "for every case"]),
        dict(at=(1, 1), lines=["runs the case set", "on a chosen", "model tier"]),
        dict(at=(1, 2), lines=["compares each", "result with the", "expected one"], stop="pass, or named"),
        dict(at=(0, 3), lines=["reads the miss", "by its line"], kind="ink"),
        dict(at=(2, 4), lines=["one rule changes;", "the version", "number moves"], kind="soft"),
        dict(at=(1, 5), lines=["same cases, same", "answers; the run", "and cost recorded"]),
    ],
    links=[((0,0),(1,1)), ((1,1),(1,2)), ((1,2),(0,3)), ((0,3),(2,4)), ((2,4),(1,5))],
)

DIAGRAMS["normaliser"] = dict(
    alt="Seven steps of the spreadsheet normaliser across four lanes: me, Claude with the skill, the tool server, and the files on disk; the tool server declines a confidential file, stops when a column has two plausible targets, holds a value that fails its type, and stops when cleaning changes the row count",
    steps=["Start", "Scan", "Propose", "Check", "Parse", "Append", "Report"],
    lanes=["Me", "Claude with|the skill", "The tool|server", "Files on|disk"],
    lane_h=72,
    nodes=[
        dict(at=(0, 0), lines=['"Normalise', 'the folder"']),
        dict(at=(1, 1), lines=["asks what", "is new"]),
        dict(at=(2, 1), lines=["norm_scan"], stop="confidential"),
        dict(at=(3, 1), lines=["the files", "folder"], kind="soft"),
        dict(at=(1, 2), lines=["a field per", "header, with", "a reason"], kind="ink"),
        dict(at=(2, 3), lines=["norm_propose"], stop="two targets: ask"),
        dict(at=(0, 3), lines=["answers if", "it stops"]),
        dict(at=(2, 4), lines=["every value", "against its type"], stop="fails: held"),
        dict(at=(3, 4), lines=["held rows", "and columns"], kind="soft"),
        dict(at=(2, 5), lines=["counts", "reconciled"], stop="rows lost: ask"),
        dict(at=(3, 5), lines=["merged table,", "append only"], kind="soft"),
        dict(at=(0, 5), lines=["answers if", "it stops"]),
        dict(at=(1, 6), lines=["writes the", "summary"]),
        dict(at=(2, 6), lines=["norm_", "summary"]),
        dict(at=(3, 6), lines=["summary and", "decision log"], kind="soft"),
        dict(at=(0, 6), lines=["reads the", "summary"], kind="ink"),
    ],
    links=[((0,0),(1,1)), ((1,1),(2,1)), ((2,1),(3,1)), ((1,1),(1,2)), ((1,2),(2,3)),
           ((2,3),(2,4)), ((2,4),(3,4)), ((2,4),(2,5)), ((2,5),(3,5)),
           ((2,5),(1,6)), ((1,6),(2,6)), ((2,6),(3,6)), ((1,6),(0,6))],
)

DIAGRAMS["answers"] = dict(
    alt="Seven steps of data answers across four lanes: me, Claude with the skill, the tool server, and the table and logs on disk; Claude refuses a question about one person, the tool server refuses a metric or dimension nobody has defined, and stops to ask when a period or a branch cannot be matched to the data",
    steps=["Ask", "List", "Choose", "Check", "Match", "Compute", "Answer"],
    lanes=["Me", "Claude with|the skill", "The tool|server", "Table and|logs"],
    lane_h=72,
    nodes=[
        dict(at=(0, 0), lines=['"Returns rate', 'by branch, Q3"']),
        dict(at=(1, 1), lines=["reads the", "metric list"]),
        dict(at=(2, 1), lines=["list_metrics"]),
        dict(at=(3, 1), lines=["twelve metrics", "in code"], kind="soft"),
        dict(at=(1, 2), lines=["picks metric,", "filters, period"], stop="a person: refuse"),
        dict(at=(2, 3), lines=["run_metric"], stop="unknown: refuse"),
        dict(at=(2, 4), lines=["period and", "branch names"], stop="unclear: ask"),
        dict(at=(0, 4), lines=["answers if", "it stops"]),
        dict(at=(2, 5), lines=["the query,", "run in code"]),
        dict(at=(3, 5), lines=["orders table,", "rows counted"], kind="soft"),
        dict(at=(2, 6), lines=["builds the", "answer block"]),
        dict(at=(3, 6), lines=["answer log", "and run id"], kind="soft"),
        dict(at=(1, 6), lines=["adds one", "plain sentence"]),
        dict(at=(0, 6), lines=["number with", "its definition"], kind="ink"),
    ],
    links=[((0,0),(1,1)), ((1,1),(2,1)), ((2,1),(3,1)), ((1,1),(1,2)), ((1,2),(2,3)),
           ((2,3),(2,4)), ((2,4),(2,5)), ((2,5),(3,5)), ((2,5),(2,6)), ((2,6),(3,6)),
           ((2,6),(1,6)), ((1,6),(0,6))],
)

DIAGRAMS["brief"] = dict(
    alt="Seven steps of the sourced brief across four lanes: me, Claude with the skill, the tool server, and the week folder on disk; the tool server declines a confidential source, Claude stops when two sources disagree, and the code takes off the page any sentence whose claims fail their source",
    steps=["Ask", "Read", "Compare", "Draft", "Check", "Release", "Report"],
    lanes=["Me", "Claude with|the skill", "The tool|server", "Week|folder"],
    lane_h=72,
    nodes=[
        dict(at=(0, 0), lines=['"Write this', "week's brief\""]),
        dict(at=(1, 1), lines=["reads every", "source"]),
        dict(at=(2, 1), lines=["read_source"], stop="confidential"),
        dict(at=(3, 1), lines=["six sources", "for the week"], kind="soft"),
        dict(at=(1, 2), lines=["two sources,", "one fact"], stop="disagree: ask"),
        dict(at=(0, 2), lines=["answers if", "it stops"]),
        dict(at=(1, 3), lines=["five sections,", "a claim per", "fact"], kind="ink"),
        dict(at=(2, 4), lines=["checks each", "claim"], stop="fails: removed"),
        dict(at=(2, 5), lines=["releases what", "passed"]),
        dict(at=(3, 5), lines=["page, removed", "list, claims"], kind="soft"),
        dict(at=(1, 6), lines=["reads the", "result back"]),
        dict(at=(0, 6), lines=["a page with", "every source"], kind="ink"),
    ],
    links=[((0,0),(1,1)), ((1,1),(2,1)), ((2,1),(3,1)), ((1,1),(1,2)), ((1,2),(1,3)),
           ((1,3),(2,4)), ((2,4),(2,5)), ((2,5),(3,5)), ((2,5),(1,6)), ((1,6),(0,6))],
)

DIAGRAMS["scorecard"] = dict(
    alt="Seven steps of the scorecard across four lanes: me, the scorecard script, each build's own harness, and the results on disk; the scorecard refuses a build whose file has a field missing, refuses a run whose copy holds the expected answers, and counts a run that returns no verdict as a fail",
    steps=["Start", "Read", "Copy", "Guard", "Run", "Verdict", "Compare"],
    lanes=["Me", "The scorecard|(a script)", "Each build's|own harness", "Results|on disk"],
    lane_h=72,
    nodes=[
        dict(at=(0, 0), lines=["one command,", "every build"]),
        dict(at=(1, 1), lines=["reads the file", "in each build"], stop="missing: refuse"),
        dict(at=(3, 1), lines=["four builds,", "a file each"], kind="soft"),
        dict(at=(1, 2), lines=["a fresh copy", "per build", "and model"]),
        dict(at=(1, 3), lines=["scans for the", "answer files"], stop="found: refuse"),
        dict(at=(2, 4), lines=["its own cases", "on each model"], kind="ink"),
        dict(at=(1, 5), lines=["takes the", "verdict"], stop="none: a fail"),
        dict(at=(1, 6), lines=["records it,", "compares with", "the last run"]),
        dict(at=(3, 6), lines=["one record per", "run; scorecard", "rebuilt"], kind="soft"),
        dict(at=(0, 6), lines=["what changed,", "the cheapest", "passing model"], kind="ink"),
    ],
    links=[((0,0),(1,1)), ((1,1),(3,1)), ((1,1),(1,2)), ((1,2),(1,3)), ((1,3),(2,4)), ((2,4),(1,5)),
           ((1,5),(1,6)), ((1,6),(3,6)), ((1,6),(0,6))],
)

FILES = {"casefiles.html": ["case-01", "case-02", "case-03"], "built.html": ["tracker", "harness"], "aiwork.html": ["versions", "normaliser", "answers", "brief", "scorecard"]}

if __name__ == "__main__":
    root = pathlib.Path(__file__).resolve().parent.parent
    for page, names in FILES.items():
        p = root / page
        if not p.exists():
            continue
        s = p.read_text(encoding="utf-8")
        for name in names:
            pat = re.compile(r"(<!--DIAGRAM:" + name + r"-->)(.*?)(<!--/DIAGRAM:" + name + r"-->)", re.S)
            if not pat.search(s):
                print(f"{page}: no markers for {name}"); continue
            s = pat.sub(lambda m: m.group(1) + '\n<div class="scroll">\n' + draw(DIAGRAMS[name]) + "\n</div>\n" + m.group(3), s)
        p.write_text(s, encoding="utf-8")
        print(f"{page}: diagrams written")
