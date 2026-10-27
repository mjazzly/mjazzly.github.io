#!/usr/bin/env python3
"""Draws the workflow diagrams on casefiles.html and built.html as inline SVG.

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
    lh = 11.5
    y0 = y - (n - 1) * lh / 2 + 3.5
    for i, ln in enumerate(lines):
        cls = "node-text light" if light else "node-text"
        out.append(f'<text class="{cls}" x="{x}" y="{y0 + i*lh:.1f}" text-anchor="middle">{esc(ln)}</text>')
    if stop_note:
        out.append(f'<text class="stop-text" x="{x}" y="{y0 + len(lines)*lh:.1f}" text-anchor="middle">{esc(stop_note)}</text>')
    return "\n".join(out)

def draw(spec):
    steps = spec["steps"]; lanes = spec["lanes"]; nodes = spec["nodes"]
    LH = spec.get("lane_h", 64)
    n = len(steps); CW = (W - LW) / n
    H = H0 + len(lanes) * LH + PAD_B
    step_delay = spec.get("step_delay", 0.3)
    g = [f'<svg class="diagram" viewBox="0 0 {W} {H:.0f}" role="img" aria-label="{esc(spec["alt"])}">']

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
    NW = CW - 14; NH = LH - 18
    for nd in nodes:
        li, si = nd["at"]
        x = LW + si * CW + 7; y = H0 + li * LH + 9
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
        stroke = ' style="stroke:var(--amber)"' if nd.get("stop") else ""
        g.append(f'<g class="d-pop" data-step="{si}" style="--delay:{d:.2f}s">')
        g.append(f'<rect class="{cls}" x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="5"{stroke}/>')
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
        dict(at=(0, 2), lines=["compares with", "known answers"], stop="pass first"),
        dict(at=(2, 3), lines=["prompt, tests,", "version", "written down"], kind="soft"),
        dict(at=(1, 4), lines=["runs the task", "the same way"]),
        dict(at=(0, 5), lines=["checks against", "the rules"], stop="pass first"),
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
        dict(at=(1, 0), lines=["rows, columns,", "country spread"], stop="count confirmed"),
        dict(at=(1, 1), lines=["geo cut and", "dedupe"], stop="count confirmed"),
        dict(at=(1, 2), lines=["emails out;", "contact columns", "dropped first"], stop="count confirmed"),
        dict(at=(2, 2), lines=["checks every", "address"], kind="soft"),
        dict(at=(1, 3), lines=["verdicts merged;", "invalid out,", "columns back"], stop="count confirmed"),
        dict(at=(1, 4), lines=["16 columns,", "a status on", "every record"], stop="count confirmed"),
        dict(at=(1, 5), lines=["file, email,", "slide copy,", "ledger line"], kind="ink"),
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
    lane_h=66,
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
        dict(at=(2, 4), lines=["tracker_lookup"], stop="2 matches: ask"),
        dict(at=(3, 4), lines=["contacts table", "(stands in for", "a CRM)"], kind="soft"),
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
        dict(at=(1, 3), lines=["compares each", "result with the", "expected one"], stop="pass, or named"),
        dict(at=(1, 4), lines=["result and cost", "saved; the page", "rebuilt"], kind="soft"),
    ],
    links=[((0,0),(1,1)), ((1,1),(1,2)), ((1,2),(2,2)), ((2,2),(1,3)), ((1,3),(1,4))],
)

FILES = {"casefiles.html": ["case-01", "case-02", "case-03"], "built.html": ["tracker", "harness"]}

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
