# site/assets/ — what goes here

> Images live in `site/assets/img/`, fonts in `site/assets/fonts/`. Current inventory and gaps are tracked in `docs/STATUS.md`.

This folder holds **every** media file the site uses. The rule from `BRIEF.md` is absolute: **local assets only, no hotlinking.** The old Google Sites is being retired and its image URLs will break — anything not in this folder will eventually be a dead image on the live site.

**Keep your originals elsewhere.** Full-resolution originals live in a backup folder *outside* the repo (e.g. `C:\Users\<you>\Pictures\portfolio-originals\`). This folder gets **web-optimized copies** only.

---

## Required assets

| File (suggested name) | What it is | Notes |
|---|---|---|
| `profile-portrait.webp` | Portrait photo of John for the Home hero and About page | High-resolution source; the shipped copy can be ~800px on the long edge. This is the most important photo on the site — pick a good one. |
| `about-collage-1.webp`, `about-collage-2.webp`, `about-collage-3.webp` | Three photos for the About page collage strip | The old About page opens with a 3-photo horizontal collage and the new one keeps that structure (BRIEF.md §3). |
| `project-elt-architecture.webp` | Product Analytics ELT Pipeline — architecture diagram | **Priority project image** (featured highlight #1 on Tech). |
| `project-elt-dashboard.webp` | Product Analytics ELT Pipeline — dashboard screenshot | **Priority project image** once the dashboard exists. Until then, use `project-elt-placeholder.webp`: a clean diagram or abstract visual, clearly not a fake product screenshot. |
| `project-omnirag-upgrade-dashboard.webp` | OmniRAG Data Platform Upgrade — ingestion / eval-metrics dashboard screenshot | **Priority project image** (featured highlight #2 on Tech). |
| `project-omnirag-architecture.webp` | Original team OmniRAG — architecture diagram | **Lower priority** — the original OmniRAG sits under "Earlier work" on Tech, not in the featured highlights. From the rag-core-engine repo, if available. |
| `project-omnirag-screenshot-1.webp` | Original team OmniRAG — UI / demo screenshot | **Lower priority** (Earlier work). One or two shots are enough. Real screenshots only — project cards ship with real images (BRIEF.md §4). |
| `coffee-pour-over.webp`, `coffee-aeropress.webp`, `coffee-espresso.webp`, `coffee-vietnamese-phin.webp` | Coffee page card images | One per brew guide — they form the 2×2 card grid on the Coffee page, and each card opens its recipe article. Your own setup/drinks. Add article photos with the same naming pattern (`coffee-<subject>.webp`). |
| `music-*.webp` | Music page photos | e.g. `music-instrument.webp`, `music-setup.webp`. |
| `photography-*.webp` | Photography page gallery | Your best shots — this page is gallery-led, so quantity and quality both matter. Name by subject: `photography-<subject>.webp`. |
| `resume.pdf` | Current resume | Linked from Tech/About. Make sure it's the version you want recruiters to see, and that it uses "2025 – 2028 (expected)" for Northeastern. |
| `favicon.svg` | Favicon source | Simple, readable at 16px. An SVG is the source of truth; the build can derive `.ico`/PNG fallbacks from it. |

## Naming convention

- **Lowercase only**, words separated by **hyphens**, **descriptive**: `profile-portrait.webp`, `coffee-v60.webp`, `photography-big-sur.webp`.
- No spaces, no underscores, no camera defaults (`IMG_2041.jpg` tells nobody anything).
- Prefix by section so the folder stays scannable: `profile-`, `project-`, `coffee-`, `music-`, `photography-`.

## Formats

| Content | Format |
|---|---|
| Photos | **WebP** (or AVIF where it helps) — never ship raw multi-MB JPEGs/PNGs from a camera |
| Icons, logos, favicon | **SVG** |
| Resume | **PDF** |
| Diagrams | SVG if vector, otherwise WebP |

## Before the build starts

Phase 0 of the build (see `KICKOFF_PROMPT.md`) checks this folder against the list above and reports anything missing. Save yourself a round-trip: populate everything in the "Required assets" table first, *then* paste the kickoff prompt.
