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

## Fonts

`site/assets/fonts/` holds Google Sans and Google Sans Code (OFL), each as a latin file and a Vietnamese file split by `unicode-range` (`google-sans-latin.woff2`, `google-sans-vietnamese.woff2`, `google-sans-code-latin.woff2`, `google-sans-code-vietnamese.woff2`). Only the weight axis is kept (400-700); Google Sans GRAD is pinned to 0 and opsz to 18, its defaults. The latin files hold the characters the site uses plus a safety set (ASCII, Latin-1 letters, curly quotes, dashes, ellipsis, spaces, Θ, μ, →). If new copy uses a symbol outside that set, it renders in the system font: either avoid it or rebuild with the symbol added (to the script's unicodes and to the latin `unicode-range` in `site.css`). Rebuild from the untrimmed variable TTFs (google/fonts repo, `ofl/googlesans/GoogleSans[GRAD,opsz,wght].ttf` and `ofl/googlesanscode/GoogleSansCode[wght].ttf`), never from the trimmed files:

```bash
pip install --user fonttools brotli
LATIN="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0398,U+03BC,U+2000-200B,U+2013-2014,U+2018-201E,U+2020-2022,U+2026,U+2032-2033,U+2039-203A,U+2044,U+20AC,U+2122,U+2191-2193,U+2212,U+2215"
VIET="U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB"
for sub in latin viet; do
  [ $sub = latin ] && U=$LATIN out=latin || U=$VIET out=vietnamese
  python -m fontTools.subset "untrimmed/GoogleSans[GRAD,opsz,wght].ttf" --unicodes="$U" --layout-features+=tnum,pnum,ss01 --output-file=gs.ttf
  python -m fontTools varLib.instancer gs.ttf GRAD=0 opsz=18 wght=400:700 -o gs-i.ttf
  python -m fontTools.ttLib.woff2 compress -o "site/assets/fonts/google-sans-$out.woff2" gs-i.ttf
  python -m fontTools.subset "untrimmed/GoogleSansCode[wght].ttf" --unicodes="$U" --layout-features+=tnum,pnum,ss01 --output-file=gsc.ttf
  python -m fontTools varLib.instancer gsc.ttf wght=400:700 -o gsc-i.ttf
  python -m fontTools.ttLib.woff2 compress -o "site/assets/fonts/google-sans-code-$out.woff2" gsc-i.ttf
done
rm -f gs.ttf gs-i.ttf gsc.ttf gsc-i.ttf
```

File names stay the same, so no CSS or preload changes are needed. The Contact heading ("Let’s talk.") is drawn from Google Sans outlines: after rebuilding the font, regenerate it with `python docs/tools/contact-glyphs.py site/assets/fonts/google-sans-latin.woff2` and paste the SVG into the Contact h1.

## Automated checks

- **Deploy** (`.github/workflows/deploy.yml`): runs on every push to `main`; check the Actions tab if the site does not update. It stamps every `/assets/css/*.css` and `/assets/js/*.js` URL with `?v=<commit>` so browsers fetch fresh files after each deploy instead of serving a cached copy for up to 10 minutes. Keep those links as plain root-relative paths in the source; the stamp is added at deploy time.
- **Monthly link check** (`.github/workflows/link-check.yml`): runs on the 1st of each month and opens a GitHub issue listing broken links. Fix or unlink them, then close the issue. LinkedIn/Instagram/news sites that block bots (403/429/999) are treated as reachable. If a link is reported as a timeout, open it by hand before changing anything. `baristamagazine.com` (a phin article reference) times out from GitHub's runners every run but loads fine in a browser, so the workflow skips it (`--exclude`); the health check below covers it.

## Health check (monthly, or when the owner asks "is the site OK?")

Owned by devops; results go to the owner in one short report (problems first, then suggested upgrades).

1. Deploys: the last runs of "Deploy site to GitHub Pages" succeeded (GitHub REST API via `curl`; `gh` is not installed).
2. Live: `https://johnha.info/` returns 200, `johnha912.github.io` and `http://` redirect to it, every URL in `site/sitemap.xml` returns 200.
3. Links: no broken internal links in `site/` (guest folders excluded); external links return 200, or a known bot-block code (403/429/999) that opens fine in a browser. Open the links the workflow skips by hand (currently the Barista Magazine reference on the phin article).
4. Pages: the S-size browser self-check (`.claude/agents/orchestrator.md`) on Home, About, and Tech.
5. Budgets: Lighthouse mobile on Home (Performance ≥ 90, Accessibility ≥ 95) once a semester or after a design change.
6. Guest folders: each `site/<guest>/index.html` still has `<meta name="robots" content="noindex">`, so the boards stay out of search results.
7. Docs: `docs/STATUS.md` "Last updated" is not older than the newest owner decision, and its open questions are still open.

## Once a semester

- Check the three project cards on `site/tech/index.html` against their repos (releases, license, README claims such as the keeploop install command and the 7,804 → 23 funnel), and add a project only when it has a public repo.
- Update the education line if dates change; keep "2025 – 2028 (expected)" until graduation.
- Re-run a Lighthouse mobile audit on the home page (targets: Performance ≥ 90, Accessibility ≥ 95).

## Analytics and cookie consent

- Google Analytics 4 property "Personal Website" (`G-F5CQP78SJK`). The tag is in the shared `<head>` of every page, after a Consent Mode v2 block that defaults all storage to denied.
- The cookie banner and Cookie settings live in `site/assets/js/site.js` ("Cookie consent" section). The visitor's choice is stored in `localStorage` as `cookie-consent` (`{ v: 1, analytics, ts }`) and expires after 12 months. Bump `v` in both the head block and `site.js` if the cookie categories ever change, so everyone is asked again.
- If you add any new cookie or tracker, update `site/privacy/index.html` first.

## Domain

DNS lives at Namecheap and is changed only by the owner. See `docs/DOMAIN-MIGRATION.md`. Keep `site/CNAME` containing exactly `johnha.info`.
