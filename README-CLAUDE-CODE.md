# One-time setup (five minutes)

1. In Terminal on the MacBook, go to your local clone and pull:
   ```
   cd ~/path/to/mjazzly.github.io
   git pull
   ```
2. Copy everything from this `site` folder over the repo (same filenames; it adds `CLAUDE.md`, `README-CLAUDE-CODE.md`, `scripts/`, and `.claude/commands/`).
3. Start Claude Code from the repo root:
   ```
   claude
   ```
4. First publish (the reframed site with live blocks hidden):
   ```
   /publish Reframe site for data analyst positioning, live projects hidden until shipped
   ```
   Claude Code will ask permission for `git push`; approve it. Check https://mjazzly.github.io a minute later.

# Everyday use

- Change wording, add a cert, edit a system card:
  `/update add "Power BI PL-300" to the certifications list with year 2026`
  then `/publish` when happy.
- The day Project A is complete (all questions in the repo):
  `/ship-project A --questions 20`
- The day the Power BI dashboard is public:
  `/ship-project B https://app.powerbi.com/view?r=...`

`scripts/check.py` runs before every commit and blocks dashes, the word marketing, broken tags, and a SHIPPED pill inside a hidden block. If it fails, Claude Code fixes the issue and reruns it; it will not bypass it.
