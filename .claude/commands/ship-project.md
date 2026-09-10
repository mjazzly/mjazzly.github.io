Mark a live project as shipped and publish. $ARGUMENTS is `A` or `B`, optionally followed by a label and a link, e.g. `A --label "SHIPPED · OCT 2026" --questions 20` or `B --label "SHIPPED · NOV 2026" https://app.powerbi.com/view?...`.

Steps:
1. Confirm with the user in one line that the artefact is actually live (the repo has all questions, or the Power BI link opens). If they say no, stop.
2. Run `python3 scripts/ship.py <args without any URL>`.
3. If a URL was given, add it inside the shipped card's `.impact` line (index.html) and the Status beat (casefiles.html) as a normal `<a href>` link, reusing existing markup.
4. `python3 scripts/check.py`; fix and rerun if needed.
5. Show the diff summary, then commit with `Ship Project <X>: unhide LIVE-<X> on index and casefiles` and push to origin main.
