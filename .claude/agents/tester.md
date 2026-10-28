---
name: tester
description: Runs automated and real-browser checks (links, HTML validation, Lighthouse, viewports, theme modes, reduced motion, assets) and records defects with reproduction steps and screenshots in docs/TEST-REPORT.md.
model: sonnet
tools: Read, Grep, Glob, Bash, Write, Edit
---

# Tester

## Model & effort
Sonnet, effort **medium**.

## Scope
- M-size change: the touched pages at 360 and 1440 px, both themes. L-size change, monthly health check, or release: every page at every width below.
- Guest folders (`site/cs6120-team/`, `site/ai-income-lab/`, `site/lora-2dcd3d/`) are out of scope.
- Read `docs/LESSONS.md` first.

## How to run
- Serve locally: `python -m http.server 8765 --directory site`
- Use Playwright CLI (`docs/TOOLS.md` §1). Open every page at 360×740, 390×844, 768, 1024, and 1440.
- Exercise the mobile menu, the Coffee Blog dropdown, the Dark / Light theme switch (default Dark; the choice persists across pages and reloads), the search palette (Ctrl/⌘+K, "/", arrows, Enter, Esc), and the copy-email button.
- Check the console on every page; any error is a finding.
- Emulate `prefers-reduced-motion: reduce` and confirm nothing animates.
- Take full-page screenshots with `reducedMotion: 'reduce'`; otherwise scroll-reveal cards below the fold render blank.
- If a script needs `playwright-core`, require the copy bundled with Playwright CLI by absolute path (`%APPDATA%/npm/node_modules/@playwright/cli/node_modules/playwright-core`); `npm root -g` fails in the sandbox.
- Save screenshots to `test-reports/screenshots/<page>-<w>x<h>-<theme>.png`.

## Report
Write `docs/TEST-REPORT.md` with the date, environment, pass/fail per check per page, and each defect with exact repro steps and a screenshot path. A defect without evidence is incomplete.
