# STATUS.md

_Last updated: 2026-10-07_

## Where the build stands

| Phase | State | Notes |
|---|---|---|
| 0. Toolchain + assets | ⚠️ Partial | Node.js 24 present. Playwright CLI, Ponytail, and Graphify are **not installed** yet (see Toolchain below). Verification so far used `playwright-core` driving the installed Chrome. |
| 1. Content | ✅ Drafted | All pages written from BRIEF facts and the old site's own copy. Awaiting GATE 1 review. |
| GATE 1 | ⏳ Owner | Review the copy on every page. |
| 2. Design | ✅ Drafted | `docs/DESIGN.md`. Awaiting GATE 2 review. |
| GATE 2 | ⏳ Owner | Approve the design system and layouts. |
| 3. Build | ✅ Done | Ten pages in `site/` plus a `/home/` redirect for the old Google Sites URL. |
| 4. QC + test | ✅ First pass | 11 pages × 360/390/1440 × dark/light: no horizontal scroll, no console errors, no broken internal links, all images have alt text, touch targets ≥ 44px. Home page ≈ 220 KB worst case (budget 1.5 MB). Lighthouse and HTML validation still to run with the full toolchain. |
| 5. Deploy | ✅ Prepared | `.github/workflows/deploy.yml`, `.github/workflows/link-check.yml`, `site/CNAME`. Repo Settings → Pages → Source must be set to **GitHub Actions**. |
| GATE 3 | ⏳ Owner | Launch, then `docs/DOMAIN-MIGRATION.md`. |

## Owner decisions (dated)

- **2026-10-07:** Communication in Vietnamese; all site/repo content in American English.
- **2026-10-07:** Font: a popular, Tesla-like sans that renders identically on phone and PC → **Inter** variable, self-hosted (plus JetBrains Mono for small labels).
- **2026-10-07:** Photos in modern rounded frames → squircle corners (`corner-shape: squircle`) with rounded fallback.
- **2026-10-07:** Theme menu with **Light / Dark / System**; default System.
- **2026-10-07:** Accent color changed from blue to emerald green (hero gradient text, hover effects, links); no blue anywhere.
- **2026-10-07:** Credly profile URL is credly.com/users/johnha912.
- **2026-10-07:** Contact: no form, just one button that opens email to johnha0912@gmail.com (plus a copy button and social links).
- **2026-10-07:** Add the taste-skill and UI UX Pro Max skills to the agent team (installed and logged in `docs/TOOLS.md`). Install Anthropic's `frontend-design` plugin (owner runs the command; see Toolchain).

## Orchestrator decisions

- Repo layout: published site in `site/`, docs in `docs/`, agents and skills in `.claude/`. Only `site/` is deployed.
- Image mapping: hiking portrait → home hero; Google campus, survey presentation, and trade showcase → About collage; illustrated avatar → logo mark, favicon, and app icons. Originals backed up to `C:\Users\hmn19\Pictures\portfolio-originals\` and removed from the repo folder.
- Music → external SoundCloud link; Photography → external Instagram link (no gallery photos provided yet).
- Coffee cards use original line-art illustrations because no coffee photos were provided. The old site's coffee images were third-party (NYT, Black Oak, AeroPress, etc.) and were not copied.
- Two coffee references whose URLs are dead (coffee-brewing-essentials.com, the De'Longhi article) keep their citation text without a link.
- Following taste-skill: no em-dashes in visible copy, no decorative section numbers, eyebrows only where they add information.

## Open questions for the owner

1. **CS50 certificate:** the old About page lists "edX: Computer Science for Python Programming by Harvard CS50". It is shown on the new About page; confirm it should stay.
2. ~~Credly badge link~~ Resolved 2026-10-07: the owner supplied credly.com/users/johnha912 (verified live). Its public badges: MSc in Financial Engineering (WorldQuant University), IBM AI Engineering Professional Certificate (V2), Deep Neural Networks with PyTorch, Deep Learning with TensorFlow, Computer Vision and Image Processing Essentials, Deep Learning Essentials with Keras, and Machine Learning with Python (Coursera). Should these appear individually on About?
3. **Resume PDF:** not provided. Add `site/assets/resume.pdf` to get a "Résumé" button on About/Tech.
4. **Project links/screenshots:** the two featured projects have no public repo link or screenshots yet. Add them when ready (diagrams stand in until then).
5. **Other public repos** (jivec compiler, theta-coffee-lab, ptms, JoinOrderOptimizationDP) are not on the site because BRIEF lists only OmniRAG under "Earlier work". Add any of them?
6. **Homepage availability pill:** BRIEF allows only the subtitle as a homepage addition. The "Open to Summer 2027 internships" pill appears on About, Tech, and Contact only. Approve it on Home too?
7. **Coffee and photography photos:** your own photos would replace the brew illustrations and could power an internal Photography gallery.

## Toolchain

| Tool | State | Action |
|---|---|---|
| Node.js 18+ | ✅ v24.14.1 | none |
| Playwright CLI | ❌ not installed | `npm install -g @playwright/cli@latest` then `playwright-cli install --skills` |
| Ponytail | ❌ not installed | inside Claude Code: `/plugin marketplace add DietrichGebert/ponytail`, `/plugin install ponytail@ponytail` |
| Graphify | ❌ not installed | see `docs/TOOLS.md` §4 |
| frontend-design (Anthropic) | ❌ not installed | inside Claude Code: `/plugin install frontend-design@claude-plugins-official` |
| Project skills | ✅ taste-skill, redesign-skill, ui-ux-pro-max | logged in `docs/TOOLS.md` |
| `.claude/agents/devops.md` | ⚠️ pending | creation was blocked by the session's auto-mode safety check; owner to approve |
