Publish the current site changes. $ARGUMENTS is the commit message (if empty, write one from the diff, imperative, one line).

Steps, in order, stopping on any failure:
1. `git status` and `git diff --stat`; summarise what changed in two lines.
2. `python3 scripts/check.py`. If it fails, fix the listed issues in place (following CLAUDE.md), rerun until it passes. Never bypass it.
3. `git add -A`, `git commit -m "<message>"`, `git push origin main`.
4. Report the commit hash, the files changed, and remind the user the page redeploys at https://mjazzly.github.io in about a minute.
