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

**Featured projects — the two highlights, in this order** (these are the Summer 2027 internship projects; they are the only featured projects anywhere on the site)

1. **Product Analytics ELT Pipeline** — the flagship. Metrics-first product analytics: Python ingestion, dbt models (staging → marts), Airflow scheduling, warehouse star schema, tests, dashboard. Status: **in progress**. Show it as a project card marked "In progress"; do not describe results it doesn't have yet.
2. **OmniRAG Data Platform Upgrade** — John's **solo** Python data-engineering layer on his fork of OmniRAG: corpus-scale incremental ingestion, Postgres + pgvector storage, data quality + lineage, eval analytics. Status: **in progress**. Show it as a project card marked "In progress"; do not describe results it doesn't have yet.

**Earlier work (NOT featured)**
- **OmniRAG (original team project)** — github.com/johnha912/rag-core-engine. A domain-aware Retrieval-Augmented Generation (RAG) engine built with Java 21 / Spring Boot, created with two teammates (Rui Song and Siyuan Liang) at Northeastern, Spring 2026. It is listed on the Tech page under an **"Earlier work"** heading only — it is **not** a featured highlight anywhere on the site, and the homepage does not spotlight it.
- **JOIN Order Optimization** — github.com/johnha912/JoinOrderOptimizationDP. CS 5800 Algorithms, Northeastern, Summer 2026, with teammate Yanglin "Elliot" Hu (formal byline: Nguyen Ha and Yanglin Hu; never "John and Yanglin"). Chain-query join-order optimizer using the Θ(n³) matrix-chain DP, compared against greedy and left-to-right heuristics on four real SQLite databases (Northwind, Chinook, Sakila, F1DB). Repo-verified result: left-to-right does 150.88× more intermediate work than the DP optimum on Sakila. Added by the owner 2026-10-07 under "Earlier work".
  - **v2 (solo, Fall 2026)** — github.com/johnha912/join-order-bench. John's own rebuild, done alone after the course: forces and times every join order of four TPC-H chain queries on DuckDB and Postgres 17, compares the DP, greedy, and each engine's own optimizer against that brute-force ground truth; dbt-duckdb warehouse with key/foreign-key tests, GitHub Actions CI, interactive Plotly report. Owner request 2026-10-08: the JOIN Order card shows two GitHub buttons, one per version. Stays under "Earlier work" (not featured).
- **jivec** — github.com/johnha912/jivec. CS 5008, Northeastern, Spring 2026, solo. From-scratch compiler in C11 for Jive (a teaching language designed by Professor Lothar Narins), targeting x86-64 NASM; seven stages from lexer to strings/heap/arrays. Added by the owner 2026-10-07 under "Earlier work".

**Interests** (kept from the old site)
- Coffee: pour over / flash brew, AeroPress, espresso, Vietnamese phin.
- Music.
- Photography.

## 3. Content inventory to migrate

| Page | Content |
|---|---|
| **Home** | Preserves the old landing page's structure, restyled — see "Homepage" below. No featured projects, no extra sections. |
| **About** | Structure preserved from the old site: H1 "About Me" → 3-photo horizontal collage → short intro paragraph → two columns: left **Educational Background** (Section 2 entries, newest first), right **Certificate** (linked entries — the IBM AI Engineering Professional Certificate from Section 2; flag any others as owner input) + **Badge** (Credly link). The intro and columns carry the career story: marketing & market research → financial engineering → computer science & data. |
| **Tech** | An internal **Projects** page (on the old site this button left the site to John's GitHub profile; now it stays on-site). A bento/grid card treatment may be used on this page. Featured highlights, **in this order**: (1) **Product Analytics ELT Pipeline** — marked "In progress"; (2) **OmniRAG Data Platform Upgrade** — marked "In progress". Below them, an **"Earlier work"** heading, newest first: JOIN Order Optimization, the original team OmniRAG, and jivec (each with a GitHub link) — never labeled featured. Skills grid (Python, pandas, NumPy, Streamlit, SQL, plus anything else already in this brief — no additions). |
| **Coffee** | Structure preserved from the old site: H1 "I'm a Coffee Lover" → **2×2 image-card grid** — Pour Over / Flash Brew, AeroPress, Espresso, Vietnamese Phin. Each card opens a **recipe article**: title → explainer/history → sections → steps/profile notes → references. Cards and article tops use the site's line-art brew icons; article bodies carry freely licensed Commons photos with on-page credits (owner request 2026-10-07; see `docs/IMAGE-CREDITS.md`). The Espresso article includes an interactive TDS brewing control chart. |
| **Music** | May stay an **external link** (SoundCloud, as on the old site) or become a simple internal gallery-led page — either is acceptable; owner's choice. **Current: internal `/music/` page (owner request 2026-10-08) with the three Fun Mix Radio tracks embedded newest first (#3, #2, #1) via click-to-load SoundCloud players.** |
| **Photography** | May stay an **external link** (Instagram, as on the old site) or become a simple internal gallery page — either is acceptable; owner's choice. If internal: the photos are the content; keep text minimal. **Current: external Instagram link.** |
| **Contact** | Internal page: one prominent **Email me** button (`mailto:johnha0912@gmail.com`) with a copy-address control, plus LinkedIn, GitHub, Instagram links. No form (owner decision 2026-10-07: no Notion-style form, just a button that opens email). |

**Homepage — preserve the old landing page's structure.** The layout does not change; only the styling does (Section 4's 2026 look is applied *to* this skeleton). Top to bottom:

1. **Header** — logo mark + "Nguyen 'John' Ha" on the left with the nav right beside it: **Home, About, Tech, "Coffee Blog"** (dropdown with the four brew guides: Pour Over / Flash Brew, AeroPress, Espresso, Vietnamese Phin), **Music, Photography, Contact**. The search icon and the Dark / Light toggle sit on the right. On phones the burger menu sits left of the logo (owner request 2026-10-07). (Owner request 2026-10-07: the header mirrors the homepage section stack so every section is one click away from any page.)
2. **Centered hero** — portrait image above the two-line welcome heading **"Welcome to / John's Portfolio!"** (correct spelling — the old site's "Porfolio" typo is silently fixed and never reproduced). **One** modern addition is allowed: a one-line positioning subtitle under the heading — "MSCS @ Northeastern University · Data Engineering Focus · Business/Marketing Roots" (owner correction 2026-10-07: always the full name, Northeastern University).
3. **Social row** — three circular buttons directly under the heading area: LinkedIn (linkedin.com/in/nguyenha912), GitHub (github.com/johnha912), Instagram (instagram.com/johnha.ns).
4. **Section button stack** — the signature element: five large, wide buttons in a vertical stack, in this order: **Tech, Coffee, Music, Photography, Contact**. This stack is the page's main navigation device. (Tech opens the internal Projects page; Music opens the internal Music page; Photography may link externally per the rows above; Contact opens the internal contact page/section.)
5. **Footer** — minimal, centered: a "Back to top" button (owner request 2026-10-07, on every page) above "© <year> Nguyen 'John' Ha".

There is **no other content** on the homepage — no featured-project spotlight, no interests strip, no extra sections. Any structural deviation from this mirror requires the owner's explicit approval at **GATE 2**.

Every page also needs: meta title, meta description, and Open Graph text (drafted by content-researcher).

## 4. Design direction (2026)

- **Dark-mode-first design**, with a one-button **Dark / Light** theme toggle that defaults to Dark (owner decision 2026-10-07; replaced the Light / Dark / System menu). Both modes are designed, not inverted afterthoughts.
- **Typography:** Inter (variable, self-hosted WOFF2) for a clean, Tesla-like look that renders identically on every phone and PC (owner decision 2026-10-07); JetBrains Mono for small technical labels.
- **Rounded photos:** images sit in rounded frames that become true squircles (`corner-shape: squircle`) in browsers that support it, with ordinary rounded corners elsewhere.
- **Mirrored homepage, restyled** — the home page keeps the old landing page's layout exactly as specced in Section 3; the styling in this section is applied to that skeleton, never a re-layout. A bento/grid card treatment may be used on the **Tech/Projects page** instead.
- **Large display typography** using a variable font; type is a design element, not a default.
- **Glassmorphism and soft-gradient accents, used sparingly** — seasoning, not the whole meal.
- **Scroll-reveal and micro-interaction animations** that **respect `prefers-reduced-motion`** — no animation without a reduced-motion fallback.
- **Sticky glass navigation bar.**
- **Project cards with real screenshots** from `site/assets/` — no stock imagery, no placeholder art in the shipped site.
- **Design tokens first:** colors, type scale, spacing, radii, and shadows are defined as tokens (in `DESIGN.md`, by the designer) *before* any page is built. All pages consume the tokens; no one-off values in page code.

## 5. Tech constraints

- **Fully static.** Deployable to **GitHub Pages via GitHub Actions**. Custom domain: `johnha.info` (via a `CNAME` file). **No server backend** of any kind.
- **Default stack: semantic HTML / CSS / vanilla JS.** Astro is allowed *only if* it still builds to plain static output in CI. No heavy CSS/JS frameworks.
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

| Agent | Model | Effort |
|---|---|---|
| orchestrator | Claude Opus 5.5 | high (**xhigh** for the Phase 1 plan) |
| designer | Claude Opus 5.5 | high (**xhigh** for the `DESIGN.md` design-system pass) |
| frontend-dev | Claude Opus 5.5 | medium-high (Sonnet is an acceptable budget fallback) |
| content-researcher | Sonnet | medium |
| qc-reviewer | Sonnet | medium |
| tester | Sonnet | medium |
| devops | Sonnet | medium |

Two rules:

1. **Every agent file pins its model.** Never leave a subagent unpinned — unpinned subagents can silently run on the more expensive Fable tier.
2. **Fable is escalation-only.** If Opus 5.5 at xhigh still fails on one specific hard problem, the orchestrator may escalate *that problem alone* to Fable, with the owner's awareness. Fable is never the default for any agent or phase.

## 8. Build phases

Phases are defined in `KICKOFF_PROMPT.md`: **Phase 0** asset check → **Phase 1** content → **GATE 1** → **Phase 2** design → **GATE 2** → **Phase 3** build → **Phase 4** QC + test loop → **Phase 5** deploy → **GATE 3** launch.
