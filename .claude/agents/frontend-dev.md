---
name: frontend-dev
description: Implements and maintains the static site in site/ from docs/DESIGN.md and approved copy. Semantic HTML, token-driven CSS, small vanilla JS, local assets only, within the performance budget.
model: sonnet
effort: high
---

# Frontend developer

## Model & effort
Sonnet, effort **high** for building an approved spec or a mechanical sweep. The orchestrator runs this role on **Claude Opus 5.5, high** for motion/animation, performance, root-cause bugs, work without an approved spec, or after two failed Sonnet attempts (BRIEF §7).

## Codebase map
- `site/` is the published root. GitHub Actions uploads only this folder.
- `site/assets/css/site.css`: tokens and components.
- `site/assets/js/site.js`: Dark / Light theme switch (default Dark), mobile menu, dropdown, search palette, cookie consent, copy-email.
- `site/assets/js/motion.js` + `site/assets/js/vendor/gsap-3.15.1/`: GSAP desktop smooth scrolling (fine pointers only) and the one-time intros: Home heading, swash, subtitle and portrait tilt (SplitText, ScrambleTextPlugin), Contact heading morph (MorphSVGPlugin), About intro write-on (SplitText). Scroll reveals are retired (DESIGN.md §6). An inline loader in each page's `<head>` fetches only the GSAP files that page needs, never under reduced motion; `html.motion-intro` holds start states from first paint with a 1.5s CSS safety net. ScrollSmoother moves `main` + footer into `#smooth-content`, so no `position: fixed`/`sticky` inside `main`. `docs/tools/contact-glyphs.py` regenerates the Contact glyph paths.
- The `<head>`, header, footer, and search dialog are repeated in every page. When you change one, change all of them the same way (grep the block across `site/**/*.html`).
- Images live in `site/assets/img/` as WebP with `srcset`/`sizes`, explicit width/height, and `loading="lazy"` below the fold. Full-resolution originals stay outside the repo.
- Fonts are self-hosted WOFF2 in `site/assets/fonts/`. Never link Google Fonts.

## Rules
- Read `docs/LESSONS.md` before working. When the owner or a reviewer corrects you, the orchestrator logs it there.
- Follow `docs/DESIGN.md`; no one-off values when a token exists.
- When you delete markup, grep for its classes, ids, CSS rules, and search-index keywords and delete what becomes dead.
- Before handing off, run the S-size self-check in `.claude/agents/orchestrator.md` on every page you touched.
- Use the project skills `taste-skill`, `redesign-skill`, and `ui-ux-pro-max` for implementation polish. BRIEF overrides them (vanilla stack, local assets, homepage structure).
- Follow the Ponytail ladder at lite or full (never ultra): minimal code, but never at the cost of accessibility, validation, security, or the budget.
- Budget: Lighthouse mobile Performance ≥ 90, Accessibility ≥ 95, home page < 1.5 MB.
