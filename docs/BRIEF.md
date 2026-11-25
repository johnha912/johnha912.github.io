# BRIEF.md — Portfolio Rebuild Master Brief

> **This file is the master brief for rebuilding johnha.info. It lives at `docs/BRIEF.md`; the root `CLAUDE.md` imports it, so Claude Code loads it automatically and every agent on this project treats it as the single source of truth. If anything in this brief conflicts with an agent's instructions, this brief wins.** Repo layout: the published site is `site/`, project docs (this brief, `DESIGN.md`, `STATUS.md`, `TOOLS.md`, …) are in `docs/`, and agents/skills are in `.claude/`.

---

## 1. Mission

Rebuild **johnha.info** — currently a Google Sites site — as a modern, 2026-style personal portfolio: fully static, hosted on **GitHub Pages** with the custom domain `johnha.info`, built and maintained by a Claude Code agent team.

Keep the old site's spirit and sections (Home, About, Tech, Coffee, Music, Photography, Contact). Dramatically upgrade the design, performance, and polish. The site should feel current in 2026, load fast on a phone, and keep the old site's familiar structure — with John's projects presented properly on their own page instead of scattered across external links.

## 2. Owner facts (the ONLY facts content may use)

Content agents may **only** use the facts in this section. If a fact is missing, **flag it to the owner — never invent it.** No made-up job titles, dates, metrics, testimonials, or employers. Ever.

**Identity**
- Name: Nguyen "John" Ha
- GitHub: github.com/johnha912
- Socials: LinkedIn (linkedin.com/in/nguyenha912), GitHub (github.com/johnha912), Instagram (instagram.com/johnha.ns)
- Kaggle: kaggle.com/johnha9 (owner-provided 2026-10-27; shown on About under "Badge & Profile")
- Email: johnha0912@gmail.com (owner-provided 2026-10-07 for the Contact page `mailto:` button)
- Music: soundcloud.com/johnhamusic (from the old site)

**Current focus**
- MS Computer Science student at Northeastern University, Silicon Valley campus, transitioning from a business/marketing background (years in market research) into data.
- Targeting **data engineering / data analyst internships for Summer 2027**.
- Codes in Python (pandas, NumPy, Streamlit) and SQL.
- Completed the **IBM AI Engineering Professional Certificate** (Coursera credential link on the old About page).
- The old About page also lists **edX: Computer Science for Python Programming by Harvard CS50** and a **Credly** badge profile: credly.com/users/johnha912 (owner-confirmed URL 2026-10-07; the old URL nguyen-ha.c94c0c16 is dead). ⚠️ The CS50 entry is shown on the new About page pending the owner's confirmation at GATE 1.

**Education** (use exactly these; note the Northeastern date correction)
- Northeastern University, Silicon Valley — MSc Computer Science, **2025 – 2028 (expected)**. ⚠️ The old site says 2025–2027; that is wrong — John graduates after Spring 2028. Always use "2025 – 2028 (expected)".
- WorldQuant University (Remote) — MSc Financial Engineering, 2023–2025
- Suffolk University, Boston — MSc Marketing, 2018–2020
- University of Economics Ho Chi Minh City (UEH) — BS International Business, 2013–2017

**Projects shown on the Tech page, in this order** (owner decision 2026-11-13: show only public repos related to a data engineering career; no "featured" or "Earlier work" labels; facts below are from each repo's README, read 2026-11-13)

1. **datafromzero** — datafromzero.github.io (owner request 2026-11-25). *From A1 to AI*: a free, open roadmap for learning data from zero, for people who only know spreadsheets. Four foundation stages — Excel and Sheets (22 lessons), SQL (39), Python (28), advanced core (44) — then four career tracks: Data Analyst (18), Data Engineer (31), Data Scientist (16), ML / AI Engineer (10). **208 lessons published**, counted from the live roadmap page at datafromzero.github.io/start/ on 2026-11-25. Version **1.0.0** released 2026-11-25 and archived on Zenodo with a DOI, so a lesson can be cited. Built with Astro + Starlight, deployed to GitHub Pages; lesson pages ship no JavaScript beyond the framework's own and a mobile Lighthouse run (performance ≥ 90, accessibility ≥ 95) is an enforced build gate. Content CC BY 4.0, code MIT. Three public repos, all under the `datafromzero` org: the site (`datafromzero/datafromzero.github.io`), the Data Engineer starter (`datafromzero/de-pipeline-starter`, which the DE track builds checkpoint by checkpoint — API and file ingestion, incremental and idempotent loads, quality gates, Airflow, dbt, Spark), and the ML starter (`datafromzero/ml-starter`). ⚠️ **The site repo's own README is stale** — it still says "in construction" and that the repo "currently holds the design handoff and the specification". The facts above come from the live site and `CHANGELOG.md`, not that README; re-read both rather than the README when updating this card.
2. **keeploop** — github.com/johnha912/keeploop (PyPI: pypi.org/project/keeploop). A small open-source Python tool that makes AI coding assistants prove their work. The AI proposes one change at a time, an evaluation script the user approves scores it, and the change is kept only if it beats the best score by more than the evaluation's own measured noise; otherwise it is reverted and a lesson is logged. Works with Claude Code, Codex, Cursor and Gemini CLI, has no dependencies, installs from PyPI (`pipx install keeploop`), MIT license. Stack: Python 3.10+, git, pytest, GitHub Actions. The card carries no role label (owner decision 2026-11-13). It is developer tooling for AI-assisted work, not a data pipeline: never call it one.
3. **JOIN Order Optimization** — two versions on one card, both with a GitHub button (owner request 2026-10-08), plus an "Interactive report" button (johnha912.github.io/join-order-bench/).
   - **v1, Summer 2026** — github.com/johnha912/JoinOrderOptimizationDP. CS 5800 Algorithms, Northeastern University, with teammate Yanglin "Elliot" Hu (formal byline: Nguyen Ha and Yanglin Hu; never "John and Yanglin"). Chain-query join-order optimizer using the Θ(n³) matrix-chain DP, compared against greedy and left-to-right heuristics on four real SQLite databases (Northwind, Chinook, Sakila, F1DB). Repo-verified result: left-to-right does 150.88× more intermediate work than the DP optimum on Sakila.
   - **v2 (solo, Fall 2026)** — github.com/johnha912/join-order-bench. John's own rebuild, done alone after the course: forces and times every join order of four TPC-H chain queries on DuckDB and Postgres 17, compares the DP, greedy, and each engine's own optimizer against that brute-force ground truth; dbt-duckdb warehouse with key/foreign-key tests, GitHub Actions CI, interactive Plotly report.
4. **Mini Wrangling for a School Decision** — github.com/johnha912/mini-wrangling-for-school-decision. A self-initiated personal project, not coursework (owner decision 2026-11-13). A reproducible pandas pipeline that joins crime statistics, university program and location data, and startup-metro rankings to shortlist universities for a military veteran pursuing IT / MIS programs: 7,804 universities → 23 candidates in 4 cities (San Jose, Austin, Los Angeles, San Diego). Stack: Python, pandas, Plotly Dash, pytest, GitHub Actions. The README's AI Disclosure says it was built with Claude Code: the author chose the scenario, datasets and criteria and wrote the original analysis; the AI refactored it into the package, CLI, charts, app, tests and CI.

**Removed from the Tech page (owner decision 2026-11-13; facts kept for reference, do not show)**
- **Product Analytics ELT Pipeline** and **OmniRAG Data Platform Upgrade** — the two former "in progress" featured projects. Neither has a public repo, so neither can be linked or described. If one is published later, the owner decides whether it returns.
- **OmniRAG (original team project)** — github.com/johnha912/rag-core-engine. Domain-aware RAG engine in Java 21 / Spring Boot, built with Rui Song and Siyuan Liang at Northeastern University, Spring 2026.
- **jivec** — github.com/johnha912/jivec. CS 5008, Northeastern University, Spring 2026. An individual course project assigned by Professor Lothar Narins, not a solo project (owner correction 2026-10-08: never call it "solo"). From-scratch compiler in C11 for Jive (a teaching language designed by Professor Lothar Narins), targeting x86-64 NASM.
- **theta-coffee-lab** — not shown (owner decision 2026-11-13).

**Interests** (kept from the old site)
- Coffee: pour over / flash brew, AeroPress, espresso, Vietnamese phin.
- Music.
- Photography.

## 3. Content inventory to migrate

| Page | Content |
|---|---|
| **Home** | Preserves the old landing page's structure, restyled — see "Homepage" below. No featured projects, no extra sections. |
| **About** | Fully static and left-aligned, stacked sections (owner decision 2026-11-13, replacing the two-column layout): H1 "About Me" (same size and alignment as the old site) → 3-photo horizontal collage → short intro paragraph, as wide as the collage → **Educational Background** (Section 2 entries as ledger rows, newest first, each with a monochrome school logo) → **Credentials** as compact index rows: first **Badge & Profile** (Credly and Kaggle; owner request 2026-10-27), then **Certificate** (linked entries — the IBM AI Engineering Professional Certificate from Section 2; flag any others as owner input) → closing callout, no card. The separate "journey" list (Marketing → Financial engineering → CS & data) was removed; the career story lives in the intro paragraph. The one motion exception to "fully static": the intro writes itself on with a GSAP effect when it scrolls into view, once, on every device that allows motion. |
| **Tech** | An internal **Projects** page (on the old site this button left the site to John's GitHub profile; now it stays on-site). Public repos only, in this order (owner decision 2026-11-13, extended by owner request 2026-11-25; see Section 2): (1) **datafromzero** (site button plus three GitHub buttons: site, Data Engineer starter, ML starter), (2) **keeploop**, (3) **JOIN Order Optimization** (v2 and v1, one GitHub button each), (4) **Mini Wrangling for a School Decision**. No "featured" or "In progress" labels. The former in-progress projects, the original OmniRAG and jivec are no longer shown. No skills grid: the "Toolbox" section was removed (owner decision 2026-10-27). |
| **Coffee** | Structure preserved from the old site: H1 "I'm a Coffee Lover" → **image-card grid** — Pour Over / Flash Brew, AeroPress, Espresso, Vietnamese Phin. Each card is one box at every width holding the art, title, description, "N min read" and an arrow, with concentric corners so the art sits inside the frame: one column on phones, two columns from 48rem (owner decision 2026-11-16, option "B" after a Webflow showcase review, replacing the 2026-11-13 "2×2 on phones" rule). Each card opens a **recipe article** laid out as "Chapters" (owner decision 2026-11-14): a hero photo opens the article, then full-bleed sections that each hold one idea (At a glance → What is → profile → steps → tip → FAQ → references, in the article's own order). The line-art brew icon appears on the cards and inside the "At a glance" card, not at the article top. Article bodies carry freely licensed Commons photos (five to seven per article) with on-page credits (owner request 2026-10-07; see `docs/IMAGE-CREDITS.md`). The Espresso article includes an interactive TDS brewing control chart. |
| **Music** | May stay an **external link** (SoundCloud, as on the old site) or become a simple internal gallery-led page — either is acceptable; owner's choice. **Current: internal `/music/` page (owner request 2026-10-08) with the three Fun Mix Radio tracks embedded newest first (#3, #2, #1) via click-to-load SoundCloud players.** Layout (owner decision 2026-11-13): one card per mix with the cover cropped to its inner art, the title and a SoundCloud icon link inside, a "Latest" pill on #3, and a closing row with the cookie note and an "All tracks" button; no outer box. |
| **Photography** | May stay an **external link** (Instagram, as on the old site) or become a simple internal gallery page — either is acceptable; owner's choice. If internal: the photos are the content; keep text minimal. **Current: external Instagram link.** |
| **Contact** | Internal page: one prominent **Email me** button (`mailto:johnha0912@gmail.com`) with a copy-address control, plus LinkedIn, GitHub, Instagram links. No form (owner decision 2026-10-07: no Notion-style form, just a button that opens email). Owner decisions 2026-11-13: the heading "Let's talk." is inline SVG glyph outlines whose letters morph in from a simple emerald shape, once; the old lede is removed; the three social links are icon tiles (icon, name, handle). |

**Homepage — preserve the old landing page's structure.** The layout does not change; only the styling does (Section 4's 2026 look is applied *to* this skeleton). Top to bottom:

1. **Header** — logo mark + "Nguyen 'John' Ha" on the left with the nav right beside it: **Home, About, Tech, "Coffee Blog"** (dropdown with the four brew guides: Pour Over / Flash Brew, AeroPress, Espresso, Vietnamese Phin), **Music, Photography, Contact**. The search icon and the Dark / Light toggle sit on the right. On phones the burger menu sits left of the logo (owner request 2026-10-07). (Owner request 2026-10-07: the header mirrors the homepage section stack so every section is one click away from any page.)
2. **Centered hero** — portrait image above the two-line welcome heading **"Welcome to / John's Portfolio!"** (correct spelling — the old site's "Porfolio" typo is silently fixed and never reproduced). **One** modern addition is allowed: a one-line positioning subtitle under the heading — "MSCS @ Northeastern University · Data Engineering Focus · Business/Marketing Roots" (owner correction 2026-10-07: always the full name, Northeastern University). The subtitle is a plain line with emerald dot separators and no tags or cards (owner decision 2026-11-13).
3. **Social row** — three circular buttons directly under the heading area: LinkedIn (linkedin.com/in/nguyenha912), GitHub (github.com/johnha912), Instagram (instagram.com/johnha.ns).
4. **Section button stack** — the signature element: five large, wide rows in a vertical stack, in this order: **Tech, Coffee, Music, Photography, Contact**. Since 2026-11-13 the rows are editorial index rows on hairline rules, visible on load (no scroll entrance), each with a one-line description (Tech: "Data engineering projects") and an emerald wipe on hover and focus. This stack is the page's main navigation device. (Tech opens the internal Projects page; Music opens the internal Music page; Photography may link externally per the rows above; Contact opens the internal contact page/section.)
5. **Footer** — minimal, centered: a "Back to top" button (owner request 2026-10-07, on every page) above "© <year> Nguyen 'John' Ha".

There is **no other content** on the homepage — no featured-project spotlight, no interests strip, no extra sections. Any structural deviation from this mirror requires the owner's explicit approval at **GATE 2**.

Every page also needs: meta title, meta description, and Open Graph text (drafted by content-researcher).

## 4. Design direction (2026)

- **Dark-mode-first design**, with a **Dark / Light** sun/moon sliding switch that defaults to Dark (owner decision 2026-10-07, replacing the Light / Dark / System menu; switch style from 2026-10-10). Both modes are designed, not inverted afterthoughts.
- **Typography:** Google Sans (variable, self-hosted WOFF2) for a clean look that renders identically on every phone and PC; Google Sans Code for small technical labels (owner decision 2026-11-13, replacing Inter and JetBrains Mono from 2026-10-07: Inter is overused by AI-built sites).
- **Rounded photos:** images sit in rounded frames that become true squircles (`corner-shape: squircle`) in browsers that support it, with ordinary rounded corners elsewhere.
- **Mirrored homepage, restyled** — the home page keeps the old landing page's layout exactly as specced in Section 3; the styling in this section is applied to that skeleton, never a re-layout. A card treatment may be used on the **Tech/Projects page** instead.
- **Large display typography** using a variable font; type is a design element, not a default.
- **Glassmorphism and soft-gradient accents, used sparingly** — seasoning, not the whole meal.
- **Purposeful micro-interactions and one-time intro animations** (Home heading, Contact heading, About intro) that **respect `prefers-reduced-motion`** — no animation without a reduced-motion fallback. Scroll reveals are retired site-wide (owner decision 2026-11-13); the one scroll-triggered effect is the About intro write-on.
- **Sticky glass navigation bar.**
- **Project cards built from real repo facts** — no stock imagery, no placeholder art in the shipped site. The Tech cards carry no screenshots today; any image added later must be a real one from `site/assets/`.
- **Design tokens first:** colors, type scale, spacing, radii, and shadows are defined as tokens (in `DESIGN.md`, by the designer) *before* any page is built. All pages consume the tokens; no one-off values in page code.

## 5. Tech constraints

- **Fully static.** Deployable to **GitHub Pages via GitHub Actions**. Custom domain: `johnha.info` (via a `CNAME` file). **No server backend** of any kind.
- **Default stack: semantic HTML / CSS / vanilla JS.** Astro is allowed *only if* it still builds to plain static output in CI. No heavy CSS/JS frameworks. Exception: **GSAP 3.15.1** (self-hosted in `site/assets/js/vendor/gsap-3.15.1/`) drives smooth scrolling on desktop pointers (core + ScrollTrigger + ScrollSmoother; owner request 2026-11-07) and the one-time intro animations: **SplitText** and **ScrambleTextPlugin** on Home, **SplitText** on About, **MorphSVGPlugin** on Contact only (owner decisions 2026-11-13). Pages without an intro load no GSAP on phones.
- **Performance budget (hard limits):**
  - Lighthouse **Performance ≥ 90** and **Accessibility ≥ 95** on mobile.
  - Images optimized (WebP/AVIF), lazy-loaded below the fold.
  - Total home page weight **< 1.5 MB**.
- **Analytics & consent (owner request 2026-10-07):** Google Analytics 4, measurement ID `G-F5CQP78SJK` (existing property "Personal Website", stream "My Website"; never create a new one). The tag sits right after `<head>` on every page with Google Consent Mode v2: all storage defaults to denied, and analytics cookies are set only after the visitor accepts in the cookie banner. A `/privacy/` page explains this; the footer links to it and to "Cookie settings".
- **Local assets only.** Every image the site uses lives in `site/assets/` in this repo. No hotlinking, ever — the old Google Sites is being retired and its URLs will die.

### Toolchain

Five tools support the build. **`TOOLS.md` carries the full rules for all five**; this is the summary.

- **Playwright CLI** — the tester's primary verification tool: real-browser checks and screenshots at phone and desktop viewports (see `TOOLS.md`).
- **Ponytail** — code-minimalism ladder governing **frontend-dev's implementation only**, at `lite` or `full` mode (**never `ultra`**). It never overrides accessibility, validation, security, the performance budget, or the §6 quality gates — and it does not apply to the designer's specs or the content-researcher's copy.
- **Graphify** — a queryable knowledge graph of the repo; the orchestrator runs `/graphify .` at the **end of Phases 1, 2, and 3** and on material structure changes. Agents query the graph before large file reads.
- **Agent Skills** — project skills live in `.claude/skills/`; **only the orchestrator may add one**, each addition is vetted (its `SKILL.md` and scripts read first) and logged in `TOOLS.md`.
- **OmniRoute** — **optional and off by default.** The default path is direct Claude models with the §7 pins. If the owner ever enables it, the §7 model table must first be re-mapped to OmniRoute's provider-prefixed model IDs — through the gateway, a pinned model is a routing request, not a guarantee.

### Mobile-first — non-negotiable

Recruiters often open portfolio links on a phone (an iPhone or a Samsung), so this site is designed for **phone screens first** and enhanced for desktop — never desktop-first.

- Layouts start at **360px** and scale up; desktop is the enhancement, not the baseline.
- **Touch targets ≥ 44px.** The header nav and the homepage button stack must be thumb-friendly, with a proper mobile menu.
- **No horizontal scrolling at any width.**
- Images are responsive (`srcset`/`sizes`) so phones never download desktop-weight files.
- The performance budgets above are **measured on mobile** (Moto-class throttling), not on a fast desktop connection.

## 6. Quality gates (nothing ships without passing ALL of these)

1. qc-reviewer approves the page (see `.claude/agents/qc-reviewer.md`).
2. tester passes the page (see `.claude/agents/tester.md`).
3. Responsive from **360px to 1440px and up** — no broken layouts, no horizontal scroll.
4. **No broken links** (internal or external).
5. **Valid HTML.**
6. **Every image has meaningful alt text.**
7. Lighthouse budgets from Section 5 are met.
8. **Mobile-first checks pass** — no horizontal scroll at 360/390px, touch targets ≥ 44px, mobile menu fully functional, homepage button stack thumb-friendly (see §5, "Mobile-first — non-negotiable").

## 7. Team roster

Seven subagents (one orchestrator + six specialists), defined in `.claude/agents/`. **Only the orchestrator talks to the owner, and only at approval gates or when a fact is missing.**

| Agent | Role |
|---|---|
| **orchestrator** | Leads the build: turns this brief into a phased plan, delegates in order (designer → frontend-dev → qc-reviewer → tester → devops), maintains `STATUS.md`, and is the **only** agent that reports to the owner at gates. |
| **content-researcher** | Migrates and drafts all site copy from the facts in Section 2 and the owner's assets; flags missing facts instead of inventing them. |
| **designer** | Owns the design system: produces `DESIGN.md` (tokens, components, motion) and per-page layout specs before any code is written. Writes no production site code. |
| **frontend-dev** | Implements the site from `DESIGN.md` specs and approved content drafts, within the performance budget. |
| **qc-reviewer** | Reviews built pages against `DESIGN.md` and Section 6; approves a page or sends it back with a specific fix list. Never vague feedback. |
| **tester** | Runs automated checks (links, HTML validation, Lighthouse, viewports, assets) and reports defects with reproduction steps in `TEST-REPORT.md`. |
| **devops** | Owns the GitHub Actions deploy to GitHub Pages, the `CNAME` file, a scheduled monthly link-check that keeps the site alive, and `MAINTENANCE.md`. Never touches DNS/domain settings — those steps are flagged for the owner. |

### Model & effort assignments

Every agent runs the model and effort below. The same assignment is restated in each agent's own file (`.claude/agents/<agent>.md`, "Model & effort" section).

Re-staffed by the orchestrator 2026-11-13 (owner delegated the choice): the default fits routine work; the orchestrator passes the "per job" override when the job calls for it.

| Agent | Default model · effort | Per job |
|---|---|---|
| orchestrator | Claude Opus 5.5 · high | **xhigh** for an L-size plan |
| designer | Claude Opus 5.5 · high | **xhigh** for a full design-system pass |
| frontend-dev | Sonnet · high | **Opus 5.5 · high** for motion/animation, performance, root-cause bugs, or work without an approved spec; also after two failed Sonnet attempts on the same task |
| content-researcher | Sonnet · medium | docs sync (BRIEF/STATUS/DESIGN) stays medium; never low on site copy |
| qc-reviewer | Sonnet · medium | **Opus 5.5 · high** for the one full-site release gate before a deploy (the strongest model audits, in a fresh session) |
| tester | Sonnet · medium | **Haiku** for pure counting runs (link check, page weight) |
| devops | Sonnet · low | **medium** when a workflow file changes |

Two rules:

1. **Every agent file pins its model.** Never leave a subagent unpinned — unpinned subagents can silently run on the more expensive Fable tier.
2. **Fable is escalation-only.** If Opus 5.5 at xhigh still fails on one specific hard problem, the orchestrator may escalate *that problem alone* to Fable, with the owner's awareness. Fable is never the default for any agent or phase.

## 8. Build phases

Phases are defined in `KICKOFF_PROMPT.md`: **Phase 0** asset check → **Phase 1** content → **GATE 1** → **Phase 2** design → **GATE 2** → **Phase 3** build → **Phase 4** QC + test loop → **Phase 5** deploy → **GATE 3** launch.
