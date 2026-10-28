# LESSONS.md

Mistakes this team made and the rule each one produced. Every agent reads this before working; the orchestrator passes the relevant lines into each brief.

Format: `YYYY-MM-DD | role | what went wrong -> rule`. Append only. A rule seen twice is promoted into the owning agent's file and marked `[promoted -> <agent>]`.

## Facts and copy

2026-10-07 | content-researcher | The old site's coffee references included fabricated, misattributed, and dead sources -> open every reference before it ships; cite only what the page actually says.
2026-10-07 | content-researcher | The school was written as "Northeastern" (owner correction) -> always "Northeastern University". [promoted -> content-researcher]
2026-10-08 | content-researcher | jivec was called a "solo" project (owner correction) -> "solo" only for self-initiated work; an assigned course project is "an individual course project". [promoted -> content-researcher]
2026-10-10 | content-researcher | The pour-over grind note contradicted the same article's troubleshooting tip -> check every new claim against the rest of the page it lands on.

## Specs and docs

2026-10-27 | orchestrator | `docs/STATUS.md` was 17 days stale and still said the domain switch was pending after it went live -> update STATUS in the same commit as every owner decision. [promoted -> orchestrator]
2026-10-27 | orchestrator | BRIEF still required a skills grid after the owner removed the Toolbox section -> when an owner request contradicts BRIEF, edit BRIEF in the same commit. [promoted -> orchestrator]
2026-10-27 | orchestrator | frontend-dev and tester files still described the old Light / Dark / System theme menu after it became a Dark / Light switch -> when a component changes, grep `.claude/agents/` and `docs/` for its old description. [promoted -> orchestrator]

## Build and test

2026-10-27 | tester | A full-page screenshot showed large blank areas because scroll-reveal cards never entered the viewport -> take full-page screenshots with `reducedMotion: 'reduce'`, which shows every card. [promoted -> tester]
2026-10-27 | tester | `npm root -g` fails inside the Claude Code sandbox, so `require('playwright-core')` could not be resolved -> use `playwright-cli`, or require the copy bundled with it by absolute path (`%APPDATA%/npm/node_modules/@playwright/cli/node_modules/playwright-core`). [promoted -> tester]
2026-10-27 | frontend-dev | Two link cards side by side on a 360 px phone had different heights -> paired cards get `height: 100%` and are checked at 360 px, where text wraps most.
2026-10-27 | devops | After a deploy the live About page showed new HTML with the old cached `site.css` (GitHub Pages caches for 10 minutes), so the paired cards stacked (owner report) -> the deploy stamps CSS/JS URLs with the commit hash; after a push, check the live page with a hard reload.
