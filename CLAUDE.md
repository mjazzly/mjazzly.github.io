# mjazzly.github.io, working rules for Claude Code

This is Megat Jazly's portfolio site (GitHub Pages, branch `main`, no build step: the HTML files are the site).
Positioning (re-led 1 Oct 2026): **data analyst as the door, AI workflows as the headline**. The eyebrow reads "Data Analyst · AI Workflows · Kuala Lumpur"; SQL appears only in the stack list, the certs and the hidden live blocks; never in the title, eyebrow, thesis, meta descriptions or any sentence that calls it a foundation, specialism or current focus (Megat is still learning SQL and has paused it to focus on AI). The word "enablement" stays off the site. The AI toolkit is Megat's own practice; never write it as team adoption at a client or employer. Every edit must keep all of this.

## Files
- `index.html` Systems page and homepage (hero, hidden Live projects block, principles, systems, stack, certs)
- `casefiles.html` Case Files (hidden Live projects block first, then client case files CASE-01 to CASE-03)
- `operator.html` how he works (assessment spine); `models.html` mental models
- `style.css` shared stylesheet. Do not edit it unless the user asks explicitly.
- `scripts/check.py` pre-publish checks (run before every commit)
- `scripts/ship.py` flips a hidden live-project block to SHIPPED

## Hard rules
1. **Patch, never regenerate.** Edit the existing HTML in place with minimal diffs. Never rewrite a whole page.
2. **Reuse existing classes only** (`.sys`, `.sys-head`, `.sys-id`, `.sys-status`, `.impact`, `.case`, `.case-top`, `.case-body`, `.beat`, `.beat-label`, `.slot`, `.principle`, `.stack-group`, `.certs`). No inline styles, no new CSS.
3. **No em dashes or en dashes anywhere.** Use commas, colons, or "to" for ranges. Hyphens inside compound words are fine.
4. **The word "marketing" never appears on the site**, in any form. Use "commercial", "paid channels", "CRM", "account-based".
5. **Status pills are truthful.** IN PROGRESS, QUEUED, IN PRODUCTION, SHIPPED. Never write SHIPPED by hand; only `scripts/ship.py` does that, and only when the artefact is live.
6. **Hidden live blocks** sit inside `<!--LIVE:... LIVE:END-->` comments. Leave them hidden until the user says the project is done. Never put `--` inside those comments.
7. **Nav order** on every page: Case Files, Systems, Operator, Models.
8. **Case Files keep the arc:** Context, Problem, Approach, System, Result (or Status), Principle. No client stakeholder names ever; client company names are fine.
9. **Numbers must match the CV**: 90%, 20+, 2,300+, 9 to 10. If a number changes, tell the user it must change on the CV too.
10. Run `python3 scripts/check.py` before every commit. Fix failures, do not bypass them.

## Commit and push
- Commit messages: imperative, one line, what changed and where. Example: `Ship Project A: unhide LIVE-A on index and casefiles`.
- Push to `origin main`. GitHub Pages redeploys in about a minute; the live URL is https://mjazzly.github.io.
- Never force-push. Never rewrite history. If `git pull` conflicts, stop and show the user the conflict.

## Shipping a project
- `python3 scripts/ship.py A` (or `B`), optionally `--label "SHIPPED · OCT 2026" --questions 20`.
- Then add the public link inside the shipped card if the user gives one (Power BI publish-to-web URL for B).
- Then `scripts/check.py`, then commit and push.
