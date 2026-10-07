# TOOLS.md — Toolchain Reference

The five tools the agent team uses on this project, what each one is for, and the rules that govern it. `BRIEF.md` §5 names the toolchain briefly; **this file carries the full rules**. If anything here conflicts with `BRIEF.md`, the brief wins — flag the conflict to the owner via the orchestrator.

Owner's machine: **Windows 11 PC**. All install steps below are for that machine.

---

## Phase 0 verification checklist (orchestrator runs this first)

Before the Phase 0 asset inventory, the orchestrator verifies the toolchain and reports the result to the owner. **A missing tool is reported, never silently worked around.**

- [ ] Node.js 18+ present (`node --version`)
- [ ] `playwright-cli --help` responds
- [ ] Ponytail plugin installed **and active** (listed by `/plugin`; its SessionStart hook only injects the ruleset when the plugin is installed — see the Ponytail section)
- [ ] `/graphify` available in Claude Code
- [ ] Contents of `.claude/skills/` match the **Installed skills log** at the bottom of this file — no unlogged skills

---

## 1. Playwright CLI

**What it is.** Microsoft's `@playwright/cli` (github.com/microsoft/playwright-cli) — a token-efficient browser-automation CLI built for coding agents. Instead of loading full page data into the agent's context, the agent drives a real browser through compact shell commands and reads back small element references.

**Why it's in this project.** It is the **tester's primary verification tool**: real-browser, real-viewport evidence for every page — screenshots, interaction tests, and console errors — instead of static markup checks alone.

**Install (owner, Windows 11).**

```powershell
npm install -g @playwright/cli@latest
playwright-cli install --skills
```

Requires Node.js 18+. (`npx @playwright/cli` also works without a global install.) The second command installs Playwright CLI's own Agent Skill into the project — log it in the Installed skills log below.

**Core commands.**

| Command | Use |
|---|---|
| `playwright-cli open <url>` | Open a page in the browser session |
| `playwright-cli goto <url>` | Navigate the current session |
| `playwright-cli snapshot` | Compact page structure with element refs (e.g. `e15`) |
| `playwright-cli click <ref>` / `type` / `press` | Interact with elements by ref |
| `playwright-cli screenshot` | Save a screenshot to disk |
| `playwright-cli console` | Read browser console output (errors/warnings) |
| `playwright-cli requests` | Inspect network requests |
| `playwright-cli close-all` | Close all sessions |

Sessions are supported via the `PLAYWRIGHT_CLI_SESSION` environment variable.

**Working rules (tester owns it; qc-reviewer consumes its output).**

- Serve the site locally first, then `open` **every page** at the **Samsung Galaxy viewport 360×740** and the **iPhone viewport 390×844**, plus the desktop widths (768 / 1024 / 1440).
- Exercise the interactive elements on every relevant page via `snapshot` + `click`: **mobile menu, Coffee Blog dropdown, theme toggle** (and the gallery lightbox).
- Save screenshots to **`test-reports/screenshots/`**, named so the page and viewport are obvious (e.g. `home-360x740.png`).
- Check `console` on every page — any error is a finding.
- Screenshots are **evidence attached to `TEST-REPORT.md` findings**. A defect without a screenshot or exact reproduction steps is an **incomplete** defect — the tester does not file it that way, and qc-reviewer sends it back if filed that way.

---

## 2. Ponytail

**What it is.** An open-source Claude Code plugin (github.com/DietrichGebert/ponytail, MIT) that biases the agent toward writing **minimal code**, via a seven-rung ladder applied *before* generating anything:

1. Does this need to exist at all? (YAGNI — skip it)
2. Already in this codebase? Reuse it.
3. Does the standard library do it?
4. Does the native platform (browser/HTML/CSS) do it natively?
5. Does an already-installed dependency do it?
6. Can it be one line?
7. Only then: write the minimum code that works.

Independent measurements (JetBrains, 80 paired tasks) found roughly **−15% code and −10% cost** — a useful bias, not magic.

**Why it's in this project.** frontend-dev implements with it, so the site's code stays lean: no framework where vanilla JS suffices, no utility library where CSS already does the job, no abstraction "for later."

**Install (owner, inside Claude Code) — plugin install is mandatory.**

```
/plugin marketplace add DietrichGebert/ponytail
/plugin install ponytail@ponytail
```

⚠️ **Critical:** Ponytail only activates when installed as a **plugin** — its SessionStart hook injects the ruleset at session start. Merely copying its `SKILL.md` into `.claude/skills/` does **not** activate it (verified in independent testing). The orchestrator confirms activation in Phase 0.

**Working rules.**

- Applies to **frontend-dev's implementation work only**, in **`lite` or `full` mode**. **`ultra` mode is forbidden on this project** — it trims too aggressively for a site whose design richness is a requirement.
- Ponytail's minimalism **never overrides**:
  - `BRIEF.md`'s requirements — accessibility, the performance budget, the quality gates in §6;
  - validation, error handling, and security — which **Ponytail itself explicitly excludes** from its minimalism.
- Ponytail does **NOT** apply to:
  - the **designer's** specs or `DESIGN.md` (minimal code, maximal design intent — the design system is not "over-building"), or
  - the **content-researcher's** copy (minimalism is for code, not words).

---

## 3. OmniRoute — OPTIONAL, off by default

**What it is.** An open-source, self-hosted AI gateway / LLM router (github.com/diegosouzapw/OmniRoute, MIT) that runs as a Docker container and exposes **one OpenAI-compatible endpoint** at `http://localhost:20128/v1`, routing across 350+ providers (many with free tiers) with fallback strategies and a dashboard.

**Status on this project: optional and OFF by default.** The default path is unchanged: direct Claude models with the model pins in `BRIEF.md` §7. **Nothing in this project requires OmniRoute, and skipping it changes nothing about the build.**

**If the owner ever enables it** (his decision, never an agent's):

- Claude Code connects by pointing `ANTHROPIC_BASE_URL` at `http://localhost:20128/v1` and setting `ANTHROPIC_AUTH_TOKEN` to an OmniRoute-issued key — in `.claude/settings.json`, with the **real key only in `.claude/settings.local.json` (machine-local, never committed)**; any key shown in committed files is a placeholder. Alternatively: `omniroute run claude --model <provider/model>`.
- Model IDs are **provider-prefixed** (e.g. `cc/claude-opus-…`, `kr/…`, `or/…`).

**Two cautions, always stated when OmniRoute is discussed:**

1. **A pinned model becomes a routing request, not a guarantee.** With a gateway in the middle, the gateway decides which provider/model actually serves each request. Before OmniRoute is used at all, the owner must **re-map the `BRIEF.md` §7 model table to OmniRoute model IDs** — until then, the §7 pins are understood to be direct-Claude pins.
2. **Prompts and code leave Anthropic's systems.** Anything routed through third-party or free-tier providers is processed on their infrastructure. The **owner decides** which providers are acceptable for his code and content.

**Conservative suggested use, if enabled at all:** bulk, low-judgment work only (tester runs, content drafts) — never as a silent replacement for the pinned Opus agents (orchestrator, designer, frontend-dev).

**Devops boundary:** OmniRoute is local developer infrastructure only. It is **never deployed**, and the GitHub Pages site must never depend on it; nothing in the deploy workflow changes because of it.

---

## 4. Graphify

**What it is.** An AI coding-assistant skill (github.com/safishamsi/graphify; PyPI package `graphifyy`). Running **`/graphify .`** in Claude Code reads a folder — code, docs, images — and builds a **persistent, queryable knowledge graph** of it in `graphify-out/`:

- `graph.html` — interactive graph view,
- `GRAPH_REPORT.md` — key nodes, surprising connections, suggested questions,
- `graph.json` — the machine-readable graph.

A SHA256 cache means re-runs only process changed files. Agents **query the graph instead of re-reading raw files**, which saves large amounts of context on every lookup.

**Why it's in this project.** As the repo grows (brief, content drafts, design system, pages, tests), the graph becomes the team's shared map — frontend-dev and qc-reviewer especially should query it before opening large parts of the repo.

**Working rules.**

- The **orchestrator runs `/graphify .`**:
  - at the **end of Phase 1** (brief + content),
  - at the **end of Phase 2** (design system added),
  - at the **end of Phase 3** (full site built),
  - and **whenever the repo structure changes materially**.
- Agents **query `graphify-out/graph.json` / read `GRAPH_REPORT.md` before large file reads** — graph first, raw files only for the detail the graph points to.
- **Repo hygiene:** commit `graph.json` and `GRAPH_REPORT.md`. Whether `graph.html` and the `cache/` folder are gitignored is an **orchestrator decision, recorded in `STATUS.md`**.

---

## 5. Agent Skills

**What it is.** The open **Agent Skills** format: portable `SKILL.md` packages (name + description + instructions, optionally with scripts) that an agent loads on demand. In Claude Code, **project skills** live in `.claude/skills/<skill-name>/SKILL.md`; personal skills in `~/.claude/skills/`. Skills are installed from GitHub repos/registries by adding the skill folder — several tools in this very toolchain (Playwright CLI, Graphify) themselves ship as skills.

**Working rules.**

- Skills for this project live in **`.claude/skills/`**.
- **Only the orchestrator may add a skill.** Every addition is logged in the **Installed skills log** below (name, source URL, date, why) before the skill is used.
- A skill is **third-party code and instructions**. Before any untrusted skill is activated, its `SKILL.md` **and any bundled scripts are read in full** by the orchestrator. No exceptions.
- The project **starts with two skills**: the **Playwright CLI skill** (installed by `playwright-cli install --skills`) and **Graphify**.

### Installed skills log

| Skill | Source | Date added | Why |
|---|---|---|---|
| Playwright CLI | `playwright-cli install --skills` (github.com/microsoft/playwright-cli) | _(orchestrator fills in at install)_ | Tester's primary browser-verification tool — see §1 |
| Graphify | github.com/safishamsi/graphify (PyPI: `graphifyy`) | _(orchestrator fills in at install)_ | Queryable knowledge graph of the repo — see §4 |

| taste-skill (`design-taste-frontend`) | github.com/Leonxlnx/taste-skill @ `b482f7a`, folder `skills/taste-skill` (MIT) | 2026-10-07 | Owner request: anti-"AI slop" design taste rules and a pre-flight checklist for designer, frontend-dev, and qc-reviewer. Instructions only, no scripts. Reviewed in full before install. |
| redesign-skill (`redesign-existing-projects`) | github.com/Leonxlnx/taste-skill @ `b482f7a`, folder `skills/redesign-skill` (MIT) | 2026-10-07 | Owner request: audit-first workflow for upgrading the existing site. Instructions only, no scripts. Reviewed in full before install. |
| ui-ux-pro-max | github.com/nextlevelbuilder/ui-ux-pro-max-skill @ `477bcb2`, folder `.claude/skills/ui-ux-pro-max` (MIT) | 2026-10-07 | Owner request: searchable style/color/typography/UX database. SKILL.md and references read in full; the five Python scripts were reviewed (standard library only, no network, no subprocess, no eval; writes only under `design-system/` when `--persist` is passed). Test fixtures were not vendored. |

_(Orchestrator: append a row for every skill added after these two — name, source URL, date, and why. A skill that isn't in this log doesn't run.)_

### Notes on the vendored skills

- **BRIEF wins over the skills.** taste-skill defaults to React + Tailwind + Motion, picsum/Unsplash images, an off-center hero, and discourages Inter. This project is vanilla HTML/CSS/JS, uses local assets only, keeps the old centered homepage, and uses Inter by owner choice. Apply the skills' taste rules (copy self-audit, em-dash ban, one accent, motivated motion, contrast checks), not their stack defaults.
- **Running ui-ux-pro-max:** its SKILL.md shows `${CLAUDE_PLUGIN_ROOT}/.claude/skills/...`; as a project skill, run it from the repo root as `python .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>`. Do not pass `--persist` unless the orchestrator approves (it writes a `design-system/` folder).
- **Anthropic `frontend-design` plugin:** available in the official marketplace (`claude-plugins-official`). Plugins are installed by the owner inside Claude Code: `/plugin install frontend-design@claude-plugins-official`.
