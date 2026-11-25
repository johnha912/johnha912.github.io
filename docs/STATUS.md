# STATUS.md

_Last updated: 2026-11-25_

## Where the build stands

**Mode since 2026-10-27: live site, maintenance.** Owner requests are triaged S / M / L and staffed per `.claude/agents/orchestrator.md`; mistakes are logged in `docs/LESSONS.md`.

| Phase | State | Notes |
|---|---|---|
| 0. Toolchain + assets | ✅ Done 2026-10-27 | Node.js 24, Playwright CLI, Ponytail, and Graphify are installed (see Toolchain below). |
| 1. Content | ✅ Drafted | All pages written from BRIEF facts and the old site's own copy. Awaiting GATE 1 review. |
| GATE 1 | ⏳ Owner | Review the copy on every page. |
| 2. Design | ✅ Drafted | `docs/DESIGN.md`. Awaiting GATE 2 review. |
| GATE 2 | ⏳ Owner | Approve the design system and layouts. |
| 3. Build | ✅ Done | Ten pages in `site/` plus a `/home/` redirect for the old Google Sites URL. |
| 4. QC + test | ✅ First pass | 11 pages × 360/390/1440 × dark/light: no horizontal scroll, no console errors, no broken internal links, all images have alt text, touch targets ≥ 44px. Home page ≈ 220 KB worst case (budget 1.5 MB). Lighthouse and HTML validation still to run with the full toolchain. |
| 5. Deploy | ✅ Pushed 2026-10-07 | `.github/workflows/deploy.yml`, `.github/workflows/link-check.yml`, `site/CNAME`. Pages source set to **GitHub Actions** by the owner on 2026-10-07. |
| GATE 3 | ✅ Live 2026-10-07 | https://johnha912.github.io serves `site/` via GitHub Actions (Pages source = GitHub Actions). All pages 200, docs/agents not published, live QA clean. The owner switched DNS: https://johnha.info serves the site over HTTPS and johnha912.github.io redirects to it (verified 2026-10-27). |

## Owner decisions (dated)

- **2026-11-25:** Add **datafromzero** to the Tech page, first in the list, above keeploop (owner request). It is the owner's open learning-roadmap project at datafromzero.github.io — four foundation stages then four career tracks, 208 lessons published, version 1.0.0 archived on Zenodo with a DOI. Three public repos under the `datafromzero` org (site, Data Engineer starter, ML starter), so the card carries a site button plus three GitHub buttons. Facts were taken from the **live site and its CHANGELOG, not the repo README**, because that README is stale and still says "in construction" — see the warning in BRIEF §2.
- **2026-11-25:** datafromzero card now says it is John's own work (owner: "dự án do tôi làm"; confirmed from the site's About page and footer, which credit Nguyen "John" Ha with his photo): label "Personal project · v1.0.0" instead of "Live · v1.0.0", and the lede reads "my free, open roadmap".
- **2026-10-07:** Communication in Vietnamese; all site/repo content in American English.
- **2026-10-07:** Font: a popular, Tesla-like sans that renders identically on phone and PC → **Inter** variable, self-hosted (plus JetBrains Mono for small labels). _Superseded 2026-11-13: Google Sans and Google Sans Code._
- **2026-10-07:** Photos in modern rounded frames → squircle corners (`corner-shape: squircle`) with rounded fallback.
- **2026-10-07:** Theme menu with **Light / Dark / System**; default System.
- **2026-10-07:** Accent color changed from blue to emerald green (hero gradient text, hover effects, links); no blue anywhere.
- **2026-10-07:** Add JoinOrderOptimizationDP and jivec to Tech under "Earlier work" (not featured). _Superseded 2026-11-13: jivec and the "Earlier work" heading left the Tech page._ Arrows: keep the diagonal arrow on external links (Music, Photography).
- **2026-10-07:** Coffee articles get real, freely licensed photos inside the article body (Wikimedia Commons; credited under each photo and in `docs/IMAGE-CREDITS.md`). The line-art icons stay on the Coffee Blog cards and at the top of each article. _Updated 2026-11-14: a hero photo opens each article and the line art sits in the "At a glance" card._
- **2026-10-07:** Espresso article gets an interactive TDS brewing control chart (Plotly, lazy-loaded, colors from the site's green palette, table view included).
- **2026-10-07:** Header logo inverts (with a short blink) on hover, focus, and press instead of tilting.
- **2026-10-07:** Footer gets a "Back to top" button on every page.
- **2026-10-07:** Coffee articles rewritten for SEO: keyword-focused titles, descriptions, and H1s; "At a glance" boxes; question-style headings and FAQs; byline and updated date; BlogPosting, BreadcrumbList, and Recipe structured data; internal links. Every reference re-verified: fabricated or misattributed sources from the old site were removed or corrected, and dead links replaced with live, checked sources.
- **2026-10-07:** Header logo: smooth invert plus a self-drawing accent ring and a press-in effect (replaces the blink).
- **2026-10-07:** Flash brew photo replaced with a V60 dripping onto ice in the server.
- **2026-10-07:** Always write the school as "Northeastern University" (never just "Northeastern").
- **2026-10-07:** Phin article: fewer phin photos; added an 1898 photo of a French priest among coffee trees near Tourane and a Ho Chi Minh City café scene. Espresso article: new crema photo. Flash brew photo cropped and color-graded warmer.
- **2026-10-07:** Google Analytics 4 (`G-F5CQP78SJK`) added to every page; verified live (page_view hits with the correct tid).
- **2026-10-07:** Professional cookie consent: Consent Mode v2 (default denied), banner with equal Accept all / Reject all plus Customize, Cookie settings link in the footer, analytics cookies removed on withdrawal, choice kept 12 months, and a new `/privacy/` page.
- **2026-10-07:** Credly profile URL is credly.com/users/johnha912.
- **2026-10-07:** Contact: no form, just one button that opens email to johnha0912@gmail.com (plus a copy button and social links).
- **2026-10-07:** Tech "Earlier work" cards show only the term and year (e.g. "Spring 2026"); no course numbers and no school name.
- **2026-10-07:** Featured project cards drop the "Flagship" and "Solo project" labels; only the "In progress" pill remains.
- **2026-10-07:** About collage order: survey presentation, trade showcase, then the food pantry volunteering photo last (it replaced the Google photo on 2026-10-07). On phones the survey presentation photo is the full-width one below two squares (trade showcase, food pantry).
- **2026-10-07:** Header nav adds the homepage sections (Tech, Music, Photography, Contact) next to Home, About, Coffee Blog on every page; the burger menu now covers widths below 960px so the longer nav fits.
- **2026-10-07:** Homepage subtitle in title case: "MSCS @ Northeastern University · Data Engineering Focus · Business/Marketing Roots" (MSCS stays all caps).
- **2026-10-07:** Header reordered to the common pattern: burger menu (phones) and logo on the left, nav links next to the logo, search and theme on the right. Theme is now a single Dark / Light toggle, default Dark; the System option is gone (replaces the earlier Light / Dark / System decision).
- **2026-10-07:** Add the taste-skill and UI UX Pro Max skills to the agent team (installed and logged in `docs/TOOLS.md`). Install Anthropic's `frontend-design` plugin (owner runs the command; see Toolchain).

- **2026-10-08:** Music becomes an internal `/music/` page embedding Fun Mix Radio #3, #2, #1 (in that order) from soundcloud.com/johnhamusic. Players load only on click (no SoundCloud cookies before then); the privacy page notes this.
- **2026-10-08:** Music players use SoundCloud's visual mode in square cards (three across on desktop, stacked on phones), with local cover art before play. Owner fact: besides data work, John is passionate about EDM; the Music intro says so.

- **2026-10-08:** JOIN Order Optimization card gets a v2 line (solo rebuild, Fall 2026) and two GitHub buttons: "v1 on GitHub" (JoinOrderOptimizationDP, team) and "v2 on GitHub" (join-order-bench, solo). Still under "Earlier work".
- **2026-10-08:** jivec is an individual course project assigned by Professor Lothar Narins at Northeastern University, not a solo project. Its card says so (the owner asked for the professor and school here, an exception to the 2026-10-07 "no school name" rule for Earlier work cards).

- **2026-10-10:** The theme toggle becomes a sun/moon pill switch (modeled on speedtest.net): both icons visible, an emerald thumb slides under the active theme. Still one tap, still Dark by default.
- **2026-10-10:** Pour-over grind note corrected: a finer grind drains slower (longer brew time) and extracts more. The old "finer grind, shorter brew time" line contradicted the article's own troubleshooting tip. The AeroPress note ("finer grind, shorter steep") stays: there the steep time is chosen, not a result.

- **2026-10-27:** The Tech page drops the "Toolbox" skills section entirely (its unused CSS removed too).
- **2026-10-27:** About right column renamed "Credentials": Credly and Kaggle sit side by side under "Badge & Profile", above the "Certificate" cards (IBM, then CS50).
- **2026-10-27:** About adds the Kaggle profile (kaggle.com/johnha9) as a "Profile" link card under Badge in the right column; Kaggle also joins the homepage `sameAs` structured data.
- **2026-10-27:** Team process upgraded for maintenance: size-based triage (S done in the main session, M with one reviewer that also runs browser checks, L with the full pipeline), `docs/LESSONS.md` learning loop with promotion into agent files, STATUS/BRIEF kept in sync in the same commit, and a defined health check in `docs/MAINTENANCE.md`.
- **2026-10-27:** Guest boards `/cs6120-team/` and `/ai-income-lab/` get `noindex` so they stay out of search results; the pages still open by direct link.
- **2026-11-02:** New guest folder `/chem-030a-thi-thu/`: a `noindex` CHEM 030A Exam 2 study app (4-hour Learn plan + 15 quizzes) built only from the owner's course kit. It is excluded from the link check and the sitemap.
- **2026-11-10:** New guest folder `/cs6140-midterm/`: a `noindex, nofollow` CS6140 Machine Learning midterm study hub (printable 109-page reference PDF with an outside-reading appendix (IBM, DeepLearning.AI), a quiz PDF, and 10 interactive quizzes with 78 questions) built only from the owner's course kit. Not linked from any page, excluded from the link check and the sitemap; remove it after the Nov 12 exam.
- **2026-11-10:** Owner request: `/cs6140-midterm/xem-them/` adds a Vietnamese "Xem thêm" page (an explicit owner exception to the English-only rule, inside this guest folder only) rewriting the intuition of two free DeepLearning.AI AI Notes (*Initializing neural networks*, *Parameter optimization in neural networks*, Katanforoosh & Kunin, 2019) on gradient descent, vanishing/exploding gradients, and Momentum/RMSprop/Adam, with sources cited in a separate box. Linked only from the study hub; `noindex, nofollow`.
- **2026-11-06:** Guest folder `/chem-030a-thi-thu/` removed (the exam is over); its link-check exclusion and agent-file mentions removed too.
- **2026-11-07:** GSAP added for smoother motion (self-hosted 3.15.1: core, ScrollTrigger, ScrollSmoother; new `site/assets/js/motion.js`). Inertial smooth scrolling on mouse/trackpad devices only (phones keep native scrolling), batched GSAP scroll reveals, and an eased spotlight on the home button stack. Reduced motion turns all of it off; if GSAP fails to load, the old reveal still runs. _Scroll reveals and the spotlight were retired 2026-11-13; smooth scrolling stays._ Mobile Lighthouse with compression: Home 97-98, Tech 97, About 94-95 (About was 89 without GSAP in the same run).
- **2026-11-08:** Guest folder `/lora-2dcd3d/` (the lora game) removed: the presentation is over (owner request). Its link-check exclusion and agent-file mentions removed too.
- **2026-11-16:** Coffee index on phones: one column of boxed cards (art, title, description, "N min read", arrow, like desktop), replacing the 2026-11-13 "2x2 on phones, box from 40rem" rule. Owner picked option "B" after a Webflow showcase review (Matteo Fabbiani, Relume, Osmo, Flowbase all run full-width boxed cards on phones with 16-24px corners and two-layer padding). Phones: 10px inset, concentric corners. Two columns now start at 48rem so a card never drops below ~330px.
- **2026-11-16:** Object-card corners fixed (owner report: on desktop the brew card frame cut across the art's corner). Cause: a plain-round `--r-xl` frame around a squircle `--r-lg` art with only an 8px inset. Now every object card (brew card, article hero, pager card, music track) uses outer radius = inner radius + inset, and brew/pager frames take the squircle shape with their art. Music tracks stay round on both layers.
- **2026-11-23:** Music page fixes (owner report: Play did nothing, tapping a title did nothing). Play did load the SoundCloud player, but under the cover: the cover's `scale` crop paints it above unpositioned siblings, so the player was hidden and untouchable. The iframe and Play button now sit on their own layer (`position: relative; z-index: 1`). Each track title is now the link to the track on SoundCloud, stretched over the whole title row; the icon stays as a visual cue (hidden from assistive tech and the tab order). On phones SoundCloud's widget shows its own "Listen in browser" step before playing.
- **2026-11-24:** Full-site check (owner request): deploys green (two transient GitHub "artifact not found" deploy failures on Nov 21/22, superseded by later green deploys), 0 broken internal links, external links fine apart from bot blocks (LinkedIn 429, Clive Coffee / Barista Hustle 403), 0 HTML errors, no JS errors, overflow, broken images or missing alt at 360/390/768/1024/1440 in both themes, mobile Lighthouse 98-100 / 100 / 100 / 100 on eight pages. Two keyboard fixes: Escape now closes the Coffee Blog dropdown even while the pointer or focus is on it (CSS opened it on :hover / :focus-within), and one Escape closes search (the search input used to eat the first press).
- **2026-11-24:** Guest folder `/family-visit/` (Family Visit planning forum) and its root `firestore.rules` removed: the project is cancelled (owner, 2026-11-24; an earlier note said it had moved to another domain). Its exclusion in every page's speculation-rules prefetch list removed too. The owner deletes the ten `family-visit-v5` … `v15` branches on GitHub (the session proxy cannot delete branches). Their last commits, to restore one if ever needed: v5 `0741ffc`, v6 `2ee10a5`, v7 `dfd5ea4`, v9 `3822f8f`, v10 `4d86b42`, v11 `410bf2c`, v12 `ddfcd7a`, v13 `6cdbf0f`, v14 `6ca694b`, v15 `7d1dba1` (v13–v15 are already in `main`).
- **2026-11-24:** Deploy workflow hardened: the deploy of #12 failed twice with "No artifacts named github-pages were found" right after a successful upload (fourth such failure since Nov 21). The workflow now uses current action majors (checkout v6, configure-pages v6, upload-pages-artifact v5, deploy-pages v5; the old ones ran on deprecated Node 20) and splits into `build` and `deploy` jobs, as in GitHub's Pages starter. `site/` has no dotfiles, so upload-pages-artifact v4+ skipping hidden files changes nothing.

### 2026-11-13: experiment branch `experiment/home-about-motion`

Owner decisions (spec files were in `docs/working/`; the facts now live in BRIEF and DESIGN):

- **Home:** index rows visible on load with an emerald wipe on hover and focus; heading letters enter upright (SplitText), two "o" letters start as emerald shapes; emerald swash kept and slowed to 1.6s `power1.inOut`; plain subtitle with emerald dots and a ScrambleText decode; portrait pops in straight and tilts at most 4deg on desktop pointers; Tech row description is "Data engineering projects".
- **About:** fully static and left-aligned in stacked sections; the journey list is removed; education as ledger rows with monochrome school logos (Northeastern University, WorldQuant University, Suffolk University, UEH); credentials as compact index rows; the intro paragraph gets a SplitText-based write-on once when it scrolls into view, on every device (about 35 KB accepted).
- **Site-wide "Index & Object":** scroll reveals retired; brew-article stat tiles become a ledger; Coffee index stays 2x2 on phones.
- **Contact:** "Let's talk." as SVG glyph outlines that morph in from emerald shapes (MorphSVGPlugin, Contact only), the lede removed, icon tiles (Option A) with a CSS spring hover. **Music:** one card per mix, outer box dropped. **Privacy:** theme copy says Dark / Light.
- **Tech:** only public repos tied to a data engineering career, in this order: keeploop (no role label), JOIN Order Optimization (v2 and v1 buttons), Mini Wrangling for a School Decision (self-initiated personal project). Removed: Product Analytics ELT Pipeline and OmniRAG Data Platform Upgrade (no public repo), the original OmniRAG, jivec. theta-coffee-lab not shown.
- **Coffee index (Concept 2):** from 40rem each card is one box (art, title, description, "N min read", arrow). Music cover originals in higher resolution requested if available.
- **Type and spacing:** token revision from the audit: body 17px with line height 1.6, 12px minimum, caps tracking 0.1em, seven line-height tokens, `--space-section` 64 to 96px, `--measure` 50ch, `--prose` 36rem.
- **Font:** Google Sans and Google Sans Code replace Inter and JetBrains Mono (self-hosted, latin and Vietnamese subsets).
- **Search palette:** CSS spring open with staggered results and a fast close (reduced motion: opacity only).
- **Speed:** Speculation Rules prefetch, font subsetting, GSAP only where a page uses it (smooth scrolling on fine pointers).
- **Team staffing** (owner delegated to the orchestrator): model and effort pins in BRIEF §7 and each agent file.
- **BRIEF §5 GSAP exception** extended to SplitText, ScrambleTextPlugin and MorphSVGPlugin (3.15.1).

### 2026-11-14: brew articles "Chapters" (Concept 3), docs sync, branch accepted

- **Owner accepted** the experiment branch and asked for the docs to be updated, then committed.
- **Chapters template** live in all four brew articles: transparent head with a hero photo, then full-bleed chapters on alternating `--bg` / `--band` surfaces with one warm band; the line art moved into the "At a glance" card. Round 2: from 60rem the text column is 46rem and body copy is 19px (`--fs-article`), ledes are at most 40ch, references are a full-width grid of numbered cards. New tokens: `--fs-article`, `--fs-chapter`, `--space-chapter`, `--band`, `--band-warm`.
- **12 new Commons photos**, three per article (credits in `docs/IMAGE-CREDITS.md`).
- **Espresso chart:** its reserved height is now a container query on `.chart-figure` at 520px, matching the renderer (fixes the 597-767px jump; see LESSONS 2026-11-14).
- **QC:** release gate passed after fixes. Layout shift (CLS) was 0 on 28 article runs. Phone page weights: AeroPress 271 KB, Pour Over 395 KB, Phin 493 KB, Espresso 736 KB (Espresso includes the lazy Plotly chart).
- **Deployed** to johnha.info (commit 54e0c51); README rewritten as an engineering overview (7e58a29).
- **Guest folder removed:** `/cs6140-midterm/` deleted at the owner's request (the midterm is over); its link-check exclusion and speculation-rules entry are gone.
- **Lighthouse (local, mobile, against live):** Accessibility 100 on all 10 pages. Performance was noisy because the machine was busy; on stable runs it was Coffee 93, Music 89, AeroPress 89, Contact 87, Espresso 84, About 84, Home 80-82. LCP is about 3 s, and Home, About and Contact load GSAP on phones for their intros.
- **Open items:** run the official PageSpeed Insights once the daily API quota resets, then make the pages under 90 lighter without dropping approved motion; optionally ask the owner for high-resolution Music cover originals (the current crop is about 344px); the Phin café photo is soft on a 2x desktop screen (1024px source); the desktop Coffee Blog submenu chevron is 26×44px (below the 44px target in width).

## Orchestrator decisions

- Repo layout: published site in `site/`, docs in `docs/`, agents and skills in `.claude/`. Only `site/` is deployed.
- Image mapping: hiking portrait → home hero; Google campus, survey presentation, and trade showcase → About collage; illustrated avatar → logo mark, favicon, and app icons. Originals backed up to `C:\Users\hmn19\Pictures\portfolio-originals\` and removed from the repo folder.
- Music → internal `/music/` page since 2026-10-08 (SoundCloud players, click to load); Photography → external Instagram link (no gallery photos provided yet).
- Coffee cards use original line-art illustrations because no coffee photos were provided. The old site's coffee images were third-party (NYT, Black Oak, AeroPress, etc.) and were not copied.
- Two coffee references whose URLs are dead (coffee-brewing-essentials.com, the De'Longhi article) keep their citation text without a link.
- Following taste-skill: no em-dashes in visible copy, no decorative section numbers, eyebrows only where they add information.

## Open questions for the owner

1. **CS50 certificate:** the old About page lists "edX: Computer Science for Python Programming by Harvard CS50". It is shown on the new About page; confirm it should stay.
2. ~~Credly badge link~~ Resolved 2026-10-07: the owner supplied credly.com/users/johnha912 (verified live). Its public badges: MSc in Financial Engineering (WorldQuant University), IBM AI Engineering Professional Certificate (V2), Deep Neural Networks with PyTorch, Deep Learning with TensorFlow, Computer Vision and Image Processing Essentials, Deep Learning Essentials with Keras, and Machine Learning with Python (Coursera). Should these appear individually on About?
3. **Resume PDF:** not provided. Add `site/assets/resume.pdf` to get a "Résumé" button on About/Tech.
4. ~~Project links/screenshots~~ Resolved 2026-11-13: the two in-progress projects have no public repo, so they came off the Tech page. Publish a repo first if one should return.
5. ~~Other public repos~~ Resolved 2026-11-13: the Tech page shows keeploop, JOIN Order Optimization and Mini Wrangling for a School Decision (see the 2026-11-13 entries).
6. **Homepage availability pill:** BRIEF allows only the subtitle as a homepage addition. The "Open to Summer 2027 internships" pill appears on About and Tech only (Contact lost it on 2026-11-13 with its lede). Approve it on Home too?
7. **Your own photos:** coffee articles now use licensed Commons photos; your own shots could replace them and could power an internal Photography gallery.
8. ~~Guest folders~~ Resolved 2026-10-27: the owner approved `noindex` on `/cs6120-team/` and `/ai-income-lab/` (`/lora-2dcd3d/` already had it; that folder was removed 2026-11-08); the health check verifies it stays.

## Toolchain

| Tool | State | Action |
|---|---|---|
| Node.js 18+ | ✅ v24.14.1 | none |
| Playwright CLI | ✅ installed (global npm) | none |
| Ponytail | ✅ installed (user-scope plugin, full mode) | none |
| Graphify | ✅ installed (CLI) | none |
| frontend-design (Anthropic) | ❌ not installed | inside Claude Code: `/plugin install frontend-design@claude-plugins-official` |
| Project skills | ✅ taste-skill, redesign-skill, ui-ux-pro-max | logged in `docs/TOOLS.md` |
| `.claude/agents/devops.md` | ✅ created | owner approved 2026-10-07 |
