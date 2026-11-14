# johnha.info

Personal portfolio of **Nguyen "John" Ha**, an MS Computer Science student at Northeastern University (Silicon Valley) focused on data engineering. It is a fully static site served by GitHub Pages: plain HTML, CSS, and JavaScript, with no framework and no build step.

**Live:** [johnha.info](https://johnha.info) · [LinkedIn](https://www.linkedin.com/in/nguyenha912/) · [GitHub](https://github.com/johnha912) · [Email](mailto:johnha0912@gmail.com)

## Overview

| Page | Path | Content |
|---|---|---|
| Home | `/` | Portrait hero, social links, and the five-row section index |
| About | `/about/` | Background, education, credentials |
| Tech | `/tech/` | Public projects: [keeploop](https://github.com/johnha912/keeploop), [JOIN Order Optimization](https://github.com/johnha912/join-order-bench) (v1 and v2), [Mini Wrangling for a School Decision](https://github.com/johnha912/mini-wrangling-for-school-decision) |
| Coffee Blog | `/coffee-blog/` | Four brew guides; the espresso guide has an interactive TDS brewing control chart (Plotly) |
| Music | `/music/` | Fun Mix Radio tracks with click-to-load SoundCloud players |
| Contact | `/contact/` | Email and social links |
| Privacy | `/privacy/` | Analytics and cookie policy |

Photography links out to Instagram. A few unrelated standalone pages live in their own folders under `site/`.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Markup and styling | Semantic HTML, one token-driven stylesheet (`site.css`) | No runtime cost; dark and light themes share one set of design tokens |
| Scripting | Vanilla JS (`site.js`, `motion.js`, `espresso-chart.js`) | Theme switch, mobile menu, command-palette search, cookie consent, chart |
| Motion | GSAP 3.15 (self-hosted), CSS transitions | Desktop smooth scrolling and three one-time intros; everything honors `prefers-reduced-motion`, and phones skip GSAP on pages without an intro |
| Charts | Plotly.js basic bundle (self-hosted) | Loaded only when the espresso chart scrolls into view |
| Fonts | Google Sans and Google Sans Code, variable WOFF2, subset to Latin and Vietnamese | Identical rendering on every device, about 64 KB for all four files |
| Images | Responsive WebP with `srcset` / `sizes`, lazy-loaded below the fold | Phones never download desktop-size files |
| Analytics | Google Analytics 4 with Consent Mode v2 | Nothing is stored until the visitor accepts the cookie banner |
| Hosting and CI | GitHub Pages, GitHub Actions | Deploy on every push to `main`; monthly link check |

## Performance and quality

Measured on the local build before the 2026-11-14 release, in Chrome via Playwright:

| Check | Result |
|---|---|
| Cumulative Layout Shift | 0 on the four brew guides at seven widths from 360 to 1440 px while scrolling the full page; under 0.001 on every other page |
| Horizontal scroll | None from 360 to 1440 px |
| Page weight (transfer) | Home 128 KB, Tech 83 KB, Coffee index 64 KB; brew guides on a phone 271 to 493 KB, espresso 736 KB including Plotly |
| Text contrast | At least 4.5:1 on every surface in both themes |
| Links | All internal links and assets resolve; external links are checked monthly in CI |

Budgets (from the project brief): Lighthouse mobile Performance ≥ 90 and Accessibility ≥ 95, home page under 1.5 MB, touch targets ≥ 44 px.

## Repository layout

```
site/                     Published site (the only folder deployed)
  <page>/index.html       One folder per page
  assets/css/site.css     Design tokens and all components
  assets/js/              site.js, motion.js, espresso-chart.js, vendor/gsap-3.15.1/
  assets/vendor/          Plotly basic bundle
  assets/fonts/           Self-hosted WOFF2 fonts and their licenses
  assets/img/             WebP images, icons, favicons
  sitemap.xml, robots.txt, CNAME, site.webmanifest, 404.html
docs/                     Brief, design system, status, lessons, tooling, maintenance
docs/tools/               Helper scripts (e.g. contact-glyphs.py regenerates the Contact heading glyphs)
.github/workflows/        deploy.yml (Pages deploy), link-check.yml (monthly link check)
.claude/                  Agent and skill definitions used to build and maintain the site
```

## Local development

Links are root-relative (`/about/`), so serve `site/` as the web root:

```bash
python -m http.server 8765 --directory site
# open http://127.0.0.1:8765
```

For performance measurements, use a server that compresses like GitHub Pages:

```bash
npx serve site -l 8765
```

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`:

1. Stamps CSS and JS URLs with the short commit SHA, so browsers never pair new HTML with a cached stylesheet.
2. Uploads `site/` only; docs and tooling stay out of the artifact.
3. Publishes to GitHub Pages behind the `johnha.info` custom domain.

`.github/workflows/link-check.yml` runs [lychee](https://github.com/lycheeverse/lychee) on the 1st of each month and opens an issue when a link breaks. Domain setup is documented in [`docs/DOMAIN-MIGRATION.md`](docs/DOMAIN-MIGRATION.md); upkeep in [`docs/MAINTENANCE.md`](docs/MAINTENANCE.md).

## Documentation

| File | Purpose |
|---|---|
| [`docs/BRIEF.md`](docs/BRIEF.md) | Requirements, content facts, budgets, quality gates |
| [`docs/DESIGN.md`](docs/DESIGN.md) | Design tokens, components, motion rules |
| [`docs/STATUS.md`](docs/STATUS.md) | Current state, decisions, open items |
| [`docs/LESSONS.md`](docs/LESSONS.md) | Past defects and the rule each one produced |
| [`docs/IMAGE-CREDITS.md`](docs/IMAGE-CREDITS.md) | Source and license of every third-party image |

## Credits and license

- Coffee photos are freely licensed images from Wikimedia Commons, credited under each photo and listed in [`docs/IMAGE-CREDITS.md`](docs/IMAGE-CREDITS.md).
- [Plotly.js](https://plotly.com/javascript/) (MIT). [GSAP](https://gsap.com/) (GSAP standard license, included in `site/assets/js/vendor/gsap-3.15.1/`).
- Fonts: [Google Sans](https://github.com/googlefonts/googlesans) and [Google Sans Code](https://github.com/googlefonts/googlesans-code) (SIL Open Font License 1.1).
- Vendored design skills under `.claude/skills/` (MIT): [taste-skill](https://github.com/Leonxlnx/taste-skill) by Leonxlnx and [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) by Next Level Builder.

© Nguyen "John" Ha. Photos and written content: all rights reserved.
