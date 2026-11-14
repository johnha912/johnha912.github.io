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
2026-11-13 | frontend-dev | Coffee cards on phones had art frames of different sizes: a stretched grid card gave its extra row height to the aspect-ratio art, which then widened (release-gate QC) -> a card that is a grid with height:100% sets grid-template-rows (auto 1fr) so extra height goes to the text; measure every card's art box at 360/390/640.
2026-11-13 | frontend-dev | Search results still revealed one by one under reduced motion because the reduced-motion block zeroed animation-duration but not animation-delay -> the global reduced-motion block also sets animation-delay: 0s; check staggered UI with reduced motion on the first frame.
2026-11-13 | frontend-dev | The Home swash (pathLength="1") never drew: GSAP rounds px values by default, so strokeDashoffset snapped 1 -> 0 mid-tween and the stroke popped in; changing duration did nothing visible -> tween sub-pixel values (pathLength="1" dash offsets, small px values) with autoRound: false, and verify a draw by sampling the value per frame, not by reading the code.
2026-11-13 | frontend-dev | The Espresso chart box reserved 360/440px while Plotly drew 380/460px, so the page jumped 20px when the chart loaded on scroll (CLS 0.05; the owner saw Coffee pages "jumping") -> a lazy-loaded embed's reserved min-height must equal its rendered height; when changing one, change the other in the same edit.
2026-11-14 | frontend-dev | Second Espresso chart jump, found by the designer: espresso-chart.js picked 380/460 from the chart's own width (< 520px) but the CSS reserve switched on viewport width (48rem), so at 600-767px it reserved 380 and drew 460; QC had measured only 360 and 1440 -> compute a reserve from the same input the renderer uses (a container query on the element, not a media query), and measure layout shift at in-between widths (600-767) too.
2026-11-14 | frontend-dev | Brew chapters wrapped section.references in an outer section with the same aria-labelledby="refs", so screen readers listed two "References" landmarks (html-validate unique-landmark x8), and an opaque .brew background hid the fixed ambient glow the spec kept -> label only the innermost landmark a heading names, and when hiding a seam, paint the surfaces that need it (each chapter) instead of the whole page.
2026-11-13 | frontend-dev | Home stack rows in the first viewport on a 1440x900 screen were hidden by gsap.set only after the deferred scripts ran, so they could paint visible then jump hidden (QC note) -> any element that can sit in the first viewport gets its start state from the head class (html.motion-intro) in CSS, with the 1.5s safety net.
2026-11-07 | orchestrator | Lighthouse against `python -m http.server` (no gzip) scored Tech 88 after adding GSAP; the same page scored 97 from a compressing server -> measure Performance from a server that compresses like GitHub Pages (`npx serve site`).
2026-11-07 | orchestrator | Called a 6-minute link-check run "stalled" without checking how long a normal run takes (the scheduled run also takes about 5 minutes) -> compare against a past run's duration before calling a workflow slow.
2026-11-07 | orchestrator | Treated a link-check timeout as a one-off and raised the timeout and retries; the same link timed out again from GitHub's runners while loading in under a second elsewhere -> when a link loads by hand but times out in CI, it is blocking datacenter IPs: exclude it with a dated comment and add it to the manual health check instead of tuning timeouts.
