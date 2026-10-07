# johnha.info: project instructions

The master brief is imported below. It is the single source of truth and wins every conflict.

@docs/BRIEF.md

## Working agreements

- The owner chats in Vietnamese. Every repo artifact (site copy, code, comments, docs, commit messages) is American English.
- Never invent facts about the owner. Missing fact → ask.
- Commits list real human contributors only; no AI attribution lines.
- Read `docs/STATUS.md` first: it records the current state, owner decisions, and open questions.

## Layout

| Path | What |
|---|---|
| `site/` | The published static site (the only folder GitHub Pages deploys) |
| `site/assets/{css,js,fonts,img}` | Design tokens + components, small vanilla JS, self-hosted fonts, WebP images |
| `docs/` | BRIEF, DESIGN, STATUS, TOOLS, MAINTENANCE, DOMAIN-MIGRATION, kit docs |
| `.claude/agents/` | The agent team (orchestrator + six specialists) |
| `.claude/skills/` | Vetted project skills (logged in `docs/TOOLS.md`) |
| `.github/workflows/` | Pages deploy + monthly link check |

## Local preview

```bash
python -m http.server 8765 --directory site
# open http://127.0.0.1:8765
```

Links are root-relative (`/about/`), so always serve `site/` as the web root; opening files directly from disk will not resolve them.
