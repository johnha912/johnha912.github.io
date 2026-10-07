# MAINTENANCE.md

How to keep johnha.info healthy after launch.

## Everyday edits

- Pages are plain HTML in `site/` (one `index.html` per folder). Edit, preview, commit, push. Every push to `main` redeploys automatically.
- The `<head>`, header, footer, and search dialog are repeated on every page. Change them everywhere at once (search the repo for the block you are editing).
- New page checklist: copy an existing page, update `<title>`, description, canonical, and Open Graph tags; add it to `site/sitemap.xml` and to the `PAGES` search index in `site/assets/js/site.js`.

## Images

1. Keep the original in `C:\Users\hmn19\Pictures\portfolio-originals\`.
2. Export WebP copies at 2-3 widths (for example 480/800, or 360/560/840 for the portrait) into `site/assets/img/`, named `section-subject-width.webp`.
3. Reference them with `srcset`/`sizes`, explicit `width`/`height`, meaningful `alt`, and `loading="lazy"` unless the image is in the first screen.

## Automated checks

- **Deploy** (`.github/workflows/deploy.yml`): runs on every push to `main`; check the Actions tab if the site does not update.
- **Monthly link check** (`.github/workflows/link-check.yml`): runs on the 1st of each month and opens a GitHub issue listing broken links. Fix or unlink them, then close the issue. LinkedIn/Instagram/news sites that block bots (403/429/999) are treated as reachable.

## Once a semester

- Update project status pills ("In progress") and copy on `site/tech/index.html` as projects ship.
- Update the education line if dates change; keep "2025 – 2028 (expected)" until graduation.
- Re-run a Lighthouse mobile audit on the home page (targets: Performance ≥ 90, Accessibility ≥ 95).

## Analytics and cookie consent

- Google Analytics 4 property "Personal Website" (`G-F5CQP78SJK`). The tag is in the shared `<head>` of every page, after a Consent Mode v2 block that defaults all storage to denied.
- The cookie banner and Cookie settings live in `site/assets/js/site.js` ("Cookie consent" section). The visitor's choice is stored in `localStorage` as `cookie-consent` (`{ v: 1, analytics, ts }`) and expires after 12 months. Bump `v` in both the head block and `site.js` if the cookie categories ever change, so everyone is asked again.
- If you add any new cookie or tracker, update `site/privacy/index.html` first.

## Domain

DNS lives at Namecheap and is changed only by the owner. See `docs/DOMAIN-MIGRATION.md`. Keep `site/CNAME` containing exactly `johnha.info`.
