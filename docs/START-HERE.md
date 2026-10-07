# Portfolio Website Rebuild — Start Here

> **Repo layout update (2026-10-07):** the kit has been unpacked. Docs now live in `docs/`, the published site in `site/` (images in `site/assets/img/`), and the agent team in `.claude/agents/`. The root `CLAUDE.md` imports `docs/BRIEF.md`. Current progress and open questions: `docs/STATUS.md`.

**Owner:** Nguyen "John" Ha
**Goal:** Replace the old Google Sites portfolio at https://www.johnha.info with a modern, fast, self-hosted static site on GitHub Pages, built by Claude Code running a small team of subagents.

This kit contains everything you need. Follow the steps in order — don't skip the assets step; the whole build depends on it.

---

## What's in this kit

| File / folder | What it is |
|---|---|
| `BRIEF.md` | The master brief for the whole project. It doubles as the repo's `CLAUDE.md` — every agent reads it. |
| `KICKOFF_PROMPT.md` | The one prompt you paste into Claude Code to start the build. |
| `TOOLS.md` | The toolchain reference: Playwright CLI, Ponytail, OmniRoute (optional), Graphify, and Agent Skills — install steps, working rules, and cautions. |
| `DOMAIN-MIGRATION.md` | The step-by-step guide for switching the `johnha.info` domain from Google Sites to GitHub Pages at Namecheap — used at Step 6, after launch. |
| `.claude/agents/` | The subagent team — seven definitions (orchestrator, content-researcher, designer, frontend-dev, qc-reviewer, tester, devops) that Claude Code will use. |
| `assets/` | Where your images, resume, and favicon live. See `assets/README.md` for exactly what to put there. |

---

## Step 1 — Create the repo and clone it (Windows)

1. Go to github.com → **New repository**.
   - Name it exactly **`johnha912.github.io`** — this is GitHub Pages' convention for your personal user site (the repo name must match your username + `.github.io`). Do **not** name it `johnha.info`: your custom domain is attached separately via the `CNAME` file the devops agent creates, plus DNS records at your registrar — the repo name plays no part in it.
   - Set it to **Public** (required for free GitHub Pages), add **no** template files — the kit provides them.
2. Clone it to your Windows machine:

   ```powershell
   git clone https://github.com/johnha912/johnha912.github.io.git
   cd johnha912.github.io
   ```

## Step 2 — Copy this kit into the repo root

Copy these into the root of the cloned repo, keeping the folder structure exactly as-is:

- `BRIEF.md`
- `KICKOFF_PROMPT.md`
- `TOOLS.md`
- the `.claude/` folder (with `agents/` inside it)
- the `assets/` folder

Then make one extra copy: duplicate `BRIEF.md` and rename the copy to `CLAUDE.md`. Claude Code automatically reads `CLAUDE.md` in a project root, so the team always has the brief in context.

Commit this as your first commit:

```powershell
git add .
git commit -m "chore: add rebuild kit (brief, kickoff prompt, agent team, assets)"
git push
```

## Step 3 — Download your assets into `assets/` FIRST

Before you start Claude Code, gather your media into the `assets/` folder. `assets/README.md` lists exactly what's needed (profile photo, project screenshots — the ELT pipeline and OmniRAG-upgrade shots are the priority images — coffee/music/photography photos, resume PDF, favicon source).

**Why local assets matter:**

- The old site is a Google Sites site. When you retire it, **every image URL hosted there breaks** — your new site would be full of dead images.
- Hotlinking images from other services is slow and fragile: the other site can move, rename, or block the file at any time, and you have no control over it.
- Local files are **versioned with your code** (git tracks them), served from the same fast GitHub Pages CDN, and will keep working as long as the repo does.

**Keep two copies of every photo:**

- **Originals** (full-resolution, straight from your phone/camera) → a backup folder *outside* the repo, e.g. `C:\Users\<you>\Pictures\portfolio-originals\`. Never edit or delete these.
- **Web-optimized copies** (resized, WebP/AVIF) → the repo's `assets/` folder. These are what the site actually serves. Claude Code's frontend-dev agent can help you optimize them; if a photo is ever over-compressed, you can regenerate it from the original.

## Step 3.5 — Install the toolchain

The team uses five tools (full reference: **`TOOLS.md`**). Install them now, before the first build session:

1. **Node.js 18+** — download from nodejs.org and install. Needed by Playwright CLI (and generally by this project's tooling).
2. **Playwright CLI** (the tester's browser-verification tool) — in PowerShell:

   ```powershell
   npm install -g @playwright/cli@latest
   playwright-cli install --skills
   ```

   The second command also installs Playwright CLI's Agent Skill into the project.
3. **Ponytail** (code-minimalism plugin for the builder agent) — start Claude Code once in any folder and run these two commands inside it:

   ```
   /plugin marketplace add DietrichGebert/ponytail
   /plugin install ponytail@ponytail
   ```

   ⚠️ It must be installed as a **plugin** like this — copying its `SKILL.md` into a skills folder does **not** activate it.
4. **Graphify** (knowledge-graph skill) — install it as a skill per the instructions in `TOOLS.md` §4, so `/graphify` is available in Claude Code.
5. **OmniRoute — OPTIONAL, skip it for the default build.** It's a self-hosted LLM router (Docker) described in `TOOLS.md` §3. The default build uses direct Claude models with the pins in `BRIEF.md`; skipping OmniRoute changes nothing about the build. Only set it up later, deliberately, if you want it.

Don't worry about getting every tool perfect — the orchestrator re-verifies the whole toolchain in Phase 0 and will tell you exactly what's missing.

## Step 4 — Start Claude Code and paste the kickoff prompt

1. Open a terminal in the repo root and start Claude Code:

   ```powershell
   cd johnha912.github.io
   claude
   ```

2. Open `KICKOFF_PROMPT.md`, copy the entire code block, and paste it as your first message.

That's it — the orchestrator agent takes it from there.

## Step 5 — What to expect: phased gates

The build runs in phases, and **nothing moves forward without your approval at three gates:**

| Gate | When | What you approve |
|---|---|---|
| **GATE 1** | After Phase 1 (content) | The drafted copy for every page. |
| **GATE 2** | After Phase 2 (design) | `DESIGN.md` — the design system and page layouts. |
| **GATE 3** | After Phase 5 (deploy setup) | The live launch on GitHub Pages with your `johnha.info` domain. |

Between gates, the agents work on their own: content-researcher drafts copy → designer specifies the design → frontend-dev builds → qc-reviewer and tester loop until every quality gate passes → devops wires up deployment. Only the **orchestrator** reports to you, and only at gates or when a fact is missing from `BRIEF.md` (agents are forbidden from inventing facts about you — they'll ask instead).

Progress is tracked in a `STATUS.md` file in the repo that the orchestrator keeps updated.

## Step 6 — Switch the domain (after GATE 3, your hands only)

The agents deploy the site to `johnha912.github.io`; pointing your real domain at it is a manual job at Namecheap that only you do. Follow **[DOMAIN-MIGRATION.md](DOMAIN-MIGRATION.md)** step by step: set the custom domain in GitHub Settings → Pages, replace the Google Sites DNS records at Namecheap with GitHub's four A records + the `www` CNAME, wait for propagation, then enable **Enforce HTTPS**. Until you do this, `johnha.info` keeps showing the old Google Sites page — the switch happens exactly when DNS propagates, so only start once the new site is verified at the `github.io` address.

## Reviewing the agents' work

- **Read the commits.** The orchestrator commits after each phase with clear messages, so `git log --oneline` tells the story of the build.
- **Use pull requests for phases if you want a review step.** Ask the orchestrator to open a PR per phase instead of committing to `main` — you can review the diff on GitHub, leave comments, and merge when happy.
- **Check the reports.** `TEST-REPORT.md` (from tester) and the QC review notes tell you exactly what was checked before anything ships.
- **You can stop or redirect at any gate.** Approving a gate is what authorizes the next phase — if something looks off, say so and the team reworks it before moving on.

---

*One content flag before you start: the old About page lists your Northeastern degree as 2025–2027, but you graduate after Spring 2028. `BRIEF.md` already uses "2025 – 2028 (expected)" everywhere — double-check GATE 1 copy reflects that.*
