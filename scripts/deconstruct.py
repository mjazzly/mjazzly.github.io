#!/usr/bin/env python3
"""Writes the record-read parts of the Deconstruct page.

1. DECONSTRUCT-03's record: every name, line and cell of the piece, read from one
   counted run of the meeting tracker (../meeting-tracker-server/eval/, read only)
   and written into deconstruct.js between /*RECORD:03*/ and /*/RECORD:03*/.
   By default the newest counted, blind, completed run whose folder is kept in
   eval/runs/; --run picks another by its run id.
2. The page's no-JavaScript view of all three pieces: the as-published output,
   every layer and the rows, written into deconstruct.html between <!--DECON:NN-->
   and <!--/DECON:NN-->. It is computed by the page's own script, run through
   node, so the view without JavaScript and the page with it can never disagree.

  python3 scripts/deconstruct.py                      # write both
  python3 scripts/deconstruct.py --run E202611010805  # a chosen run
  python3 scripts/deconstruct.py --check              # exit 1 if either is out of date

Only what is between the markers is replaced. Rerun after any new counted run of the tracker.
"""
import argparse, csv, html, json, pathlib, re, subprocess, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
BUILD = ROOT.parent / "meeting-tracker-server" / "eval"
JS, PAGE = ROOT / "deconstruct.js", ROOT / "deconstruct.html"
esc = html.escape

# What DECONSTRUCT-03 reads from the record. The case is the one meeting on the record that holds
# all three phrasings; each variant names the line its row was read from, and the lines lit with it.
CASE = "02_meridian_pricing.txt"
VARIANTS = {
    "same": {"line": "5", "lines": ["5"]},          # "I will update the scenario B model ..."
    "next": {"line": "3", "lines": ["3", "4"]},     # the price list line, then "Agreed, that has to happen."
    "none": {"line": "6", "lines": ["6"]},          # "Someone also needs to brief the sales team ..."
}
OF = 5   # the harness scores five cases (verdict.five_matched, "of 5" in eval/run_eval.js)
TIERS = [("haiku", "smallest model"), ("sonnet", "standard model"), ("opus", "largest model")]
# Words the site never carries (CLAUDE.md, rule 4), as in scripts/outputs.py
SITE_SWAPS = [("Marketing Director", "Commercial Director")]

def swap(t):
    for a, b in SITE_SWAPS: t = t.replace(a, b)
    return t

def read_csv(p):
    with open(p, newline="", encoding="utf-8") as f: return list(csv.DictReader(f))

def runs():
    """Every counted, blind, completed run whose folder the build kept, newest first."""
    found = []
    for rec in sorted(BUILD.glob("results*/*.json")):
        if rec.parent.name == "results-sheet": continue
        r = json.loads(rec.read_text(encoding="utf-8"))
        folder = BUILD / "runs" / r.get("label", "")
        if r.get("counted") and r.get("blind") and r.get("completed") and (folder / "data" / "tracker.csv").exists():
            found.append((r["started_at"], r, folder))
    return [(r, f) for _, r, f in sorted(found, key=lambda x: x[0], reverse=True)]

def transcript(path):
    head, lines = {}, []
    for raw in path.read_text(encoding="utf-8").splitlines():
        m = re.match(r"\[(\d+)\] ([^:]+): (.*)", raw)
        if m: lines.append({"n": m.group(1), "who": m.group(2), "text": swap(m.group(3))})
        elif ": " in raw: k, v = raw.split(": ", 1); head[k.lower()] = v
    return head, lines

def segments(note):
    """A run's note, split where it turns to the next line it explains ("Line 3 ...")."""
    return [s.strip() for s in re.split(r"(?<=\.)\s+(?=Line \d)", note) if s.strip()]

def record(run_id=None):
    all_runs = runs()
    pick = [x for x in all_runs if not run_id or x[0]["run_id"] == run_id]
    if not pick: sys.exit(f"no counted run{' ' + run_id if run_id else ''} with a kept folder in {BUILD}")
    r, folder = pick[0]
    data = folder / "data"
    tracker, log = read_csv(data / "tracker.csv"), read_csv(data / "run_log.csv")
    expected = json.loads((BUILD / "expected" / CASE.replace(".txt", ".json")).read_text(encoding="utf-8"))
    head, lines = transcript(data / "transcripts" / CASE)
    tier = next((t for k, t in TIERS if k in r["model"]), None)
    if not tier: sys.exit(f"{r['model']}: no tier for this model; add it to TIERS")
    out = {"run": r["run_id"], "tier": tier, "matched": r["verdict"]["five_matched"], "of": OF,
           "decline": bool(r["verdict"]["decline_held"]),
           "transcript": {"file": CASE, "meeting": head.get("meeting", ""), "date": head.get("date", "not stated"), "lines": lines},
           "variants": {}}
    case_fails = r["cases"][CASE]["fails"]
    for key, v in VARIANTS.items():
        line = v["line"]
        row = next((x for x in tracker if x["transcript"] == CASE and x["source_line"] == line), None)
        exp = next(x for x in expected["rows"] if x["source_line"] == line)
        fails = [f for f in case_fails if re.search(rf"\bline {line}\b", f)]
        notes = [{"file": CASE, "text": swap(s)} for n in log if n["transcript"] == CASE and n["step"] == "note"
                 for s in segments(n["detail"]) if re.match(rf"Line {line}\b", s)]
        item = {"line": line, "lines": v["lines"], "expected": {"owner": exp["owner"], "due": exp["due"]}, "row": None, "closer": None}
        if row:
            item["row"] = {"id": row["action_id"], "action": swap(row["action"]), "owner": row["owner"], "company": swap(row["owner_company"]),
                           "due": row["due"], "status": row["status"], "closed_in": "", "closed_line": ""}
            m = re.match(r"((\d+)_[\w.]+) line (\d+)", row.get("closed_by", ""))
            if row["status"] == "closed" and m:
                cfile, cline = m.group(1), m.group(3)
                item["row"].update(closed_in=m.group(2), closed_line=cline)
                _, clines = transcript(data / "transcripts" / cfile)
                said = next(x for x in clines if x["n"] == cline)
                item["closer"] = {"file": cfile, "n": cline, "who": said["who"], "text": said["text"]}
                fails += [f for f in r["cases"].get(cfile, {}).get("fails", []) if f"{CASE} line {line}" in f]
                notes += [{"file": cfile, "text": swap(s)} for n in log if n["transcript"] == cfile and n["step"] == "note"
                          for s in segments(n["detail"]) if row["action_id"] in s and re.match(rf"Line {cline}\b", s)]
        else:
            fails = fails or [f"no row for source line {line}"]
        item["fails"] = fails
        item["matched"] = bool(row) and not fails
        item["notes"] = notes
        out["variants"][key] = item
    return out

# ---------- the no-JavaScript view, computed by the page's own script ----------
NODE = r"""
const m = require(process.argv[1]); const out = {};
for (const id of Object.keys(m.DATA)) {
  const d = m.DATA[id], c = m.pubs(d);
  out[id] = {o: m.OUT[id].out(c, d), floor: m.floorGroups(id, c, d)};
}
process.stdout.write(JSON.stringify(out));
"""

def node(js_text):
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(js_text)
    tmp = pathlib.Path(f.name)
    try:
        r = subprocess.run(["node", "-e", NODE, str(tmp)], capture_output=True, text=True)
    except FileNotFoundError:
        sys.exit("node is needed to write the no-JavaScript view (the page's own script computes it)")
    finally:
        tmp.unlink(missing_ok=True)
    if r.returncode: sys.exit("deconstruct.js did not run in node:\n" + r.stderr)
    return json.loads(r.stdout)

def block(text, name):
    m = re.search(rf"/\*{name}\*/(.*?)/\*/{name}\*/", text, re.S)
    if not m: sys.exit(f"deconstruct.js: no {name} markers")
    return json.loads(m.group(1))

def view(nid, d, res):
    o, groups = res["o"], res["floor"]
    p = ['<div class="nojs">']
    rec = d.get("record") or {}
    if rec.get("run"):
        p.append(f'<p class="dx-run"><svg class="ic" aria-hidden="true"><use href="#ic-circle-check"/></svg><span>From run <b>{esc(rec["run"])}</b>, the {esc(rec["tier"])}, read blind: the checker matched '
                 f'<b>{rec["matched"]} of {rec["of"]}</b> cases{" and the decline held." if rec["decline"] else "."}</span></p>')
    p.append(f'<div class="dx-out"><div class="dx-label">{esc(d["out"]["label"])}</div>')
    if o.get("cells"):
        p.append('<dl class="dx-cells">' + "".join(f'<div class="dx-cell {k}"><dt>{esc(t)}</dt><dd>{esc(o["cells"][k])}</dd></div>' for k, t in d["fields"]) + "</dl>")
    else:
        p.append(f'<div class="dx-big">{esc(o["big"])}</div>')
    p.append(f'<div class="dx-sub">{esc(o.get("sub", ""))}</div></div>')
    p.append('<p class="dx-hint">As published. What it rests on, a layer at a time:</p>')
    p.append('<ol class="dx-layers">')
    for k, l in enumerate(d["layers"], 1):
        li = [f'<li class="dx-layer{" floor" if l.get("floor") else ""}"><div class="dx-lh"><span class="dx-back">{k} back{" · the floor" if l.get("floor") else ""}</span><h3>{esc(l["name"])}</h3></div>',
              f'<p class="dx-what">{esc(l["what"])}</p>', f'<p class="dx-why">{esc(l["why"])}</p>']
        if l.get("options"):
            li.append('<p class="dx-optlist">The choices: ' + ", ".join(
                f'<b>{esc(t)}</b> (as published)' if v == l["pub"] else esc(t) for v, t in l["options"]) + ".</p>")
        if l.get("source"):
            li.append(f'<p class="dx-src"><a href="{esc(l["source"]["href"])}" target="_blank" rel="noopener">{esc(l["source"]["text"])}</a></p>')
        if l.get("live"):
            li.append(f'<div class="dx-live">{o["live"][l["key"]]}</div>')
        if l.get("floor"):
            li.append(f'<p class="dx-lit">{esc(o["litText"])}</p>')
            li.append(table(d, groups, o["lit"]))
        li.append("</li>")
        p.append("".join(li))
    p.append("</ol></div>")
    return "\n".join(p)

def table(d, groups, lit):
    cols, blank = d["columns"], d.get("blank", {})
    t = ['<div class="dx-rows"><table><thead><tr>' + "".join(f"<th>{esc(c[1])}</th>" for c in cols) + "</tr></thead>"]
    for g in groups:
        t.append("<tbody>")
        if g["label"]: t.append(f'<tr class="dx-group"><th colspan="{len(cols)}" scope="colgroup">{esc(g["label"])}</th></tr>')
        for r in g["rows"]:
            cells = []
            for k, (key, _) in enumerate(cols):
                v = r.get(key, "") or blank.get(key, "")
                cells.append(f'<th class="key">{esc(v)}</th>' if k == 0 else f"<td>{esc(v)}</td>")
            cls = ' class="lit"' if r["id"] in lit else ""
            t.append(f"<tr{cls}>" + "".join(cells) + "</tr>")
        t.append("</tbody>")
    t.append("</table></div>")
    return "".join(t)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--run"); ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    js, page = JS.read_text(encoding="utf-8"), PAGE.read_text(encoding="utf-8")
    rec = record(a.run)
    new_js = re.sub(r"(/\*RECORD:03\*/)(.*?)(/\*/RECORD:03\*/)",
                    lambda m: m.group(1) + json.dumps(rec, ensure_ascii=False, indent=1) + m.group(3), js, count=1, flags=re.S)
    res = node(new_js)
    new_page = page
    for nid in ("01", "02", "03"):
        d = block(new_js, f"PIECE:{nid}")
        if nid == "03": d["record"] = rec
        pat = re.compile(rf"(<!--DECON:{nid}-->)(.*?)(<!--/DECON:{nid}-->)", re.S)
        if not pat.search(new_page): sys.exit(f"deconstruct.html: no <!--DECON:{nid}--> markers")
        new_page = pat.sub(lambda m: m.group(1) + "\n" + view(nid, d, res[nid]) + "\n" + m.group(3), new_page, count=1)
    stale = [n for n, old, new in (("deconstruct.js", js, new_js), ("deconstruct.html", page, new_page)) if old != new]
    if a.check:
        for n in stale: print(f"{n}: DECONSTRUCT record or no-JavaScript view is out of date (run {rec['run']})")
        sys.exit(1 if stale else 0)
    JS.write_text(new_js, encoding="utf-8"); PAGE.write_text(new_page, encoding="utf-8")
    print(f"DECONSTRUCT-03 from run {rec['run']}; " + (", ".join(stale) + " written" if stale else "nothing changed"))

if __name__ == "__main__":
    main()
