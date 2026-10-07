# Kickoff Prompt — paste this into Claude Code to start the build

Copy everything inside the code block below and paste it as your first message in Claude Code, opened in the root of the portfolio repo (after completing Steps 1–3 of `START-HERE.md`).

---

```
You are the ORCHESTRATOR for the rebuild of my personal portfolio site, johnha.info. Act as the orchestrator agent defined in .claude/agents/orchestrator.md for the entire session.

FIRST, read these files completely before doing anything else:
1. docs/BRIEF.md (imported by the root CLAUDE.md) — the master brief and single source of truth for facts, design direction, tech constraints, and quality gates.
2. TOOLS.md — the toolchain reference (Playwright CLI, Ponytail, OmniRoute, Graphify, Agent Skills) and its working rules.
3. Every agent definition in .claude/agents/ — orchestrator, content-researcher, designer, frontend-dev, qc-reviewer, tester, devops. You will delegate to these agents via subagent tasks; do not do their specialized work yourself.

RULES THAT APPLY THROUGHOUT:
- Content may ONLY use facts from BRIEF.md. If a fact is missing, stop and ask me — never invent facts about me.
- Work phase by phase. Commit to git after each phase with a clear message. Keep STATUS.md updated at all times.
- Talk to me ONLY at the gates listed below, or when a fact is missing. Otherwise, coordinate the agents and keep working.

THE PLAN:

Phase 0 — Toolchain verification, then asset check. FIRST verify the toolchain per TOOLS.md: Node.js 18+ present, `playwright-cli --help` responds, the Ponytail plugin is installed and active (lite or full mode — never ultra), /graphify is available, and the contents of .claude/skills/ match the Installed skills log in TOOLS.md. If any tool is missing or inactive, report it to me and wait — do not silently work around a missing tool. THEN inspect the assets/ folder against the list in assets/README.md. Report exactly which assets are present and which are missing. Do not proceed past Phase 0 with missing required assets unless I explicitly waive one.

Phase 1 — Content. Delegate to content-researcher: migrate the structure of my old site (Home, About, Tech, Coffee, Music, Photography, Contact) and draft all copy from BRIEF.md facts, including meta titles, descriptions, and Open Graph text for every page. Use "2025 – 2028 (expected)" for my Northeastern degree. Present the drafts to me.

GATE 1 — I approve the copy. Do not start design until I approve.

Phase 2 — Design. Delegate to designer: produce DESIGN.md (design tokens for dark + light, component specs, motion specs with prefers-reduced-motion fallbacks) and a layout spec for every page, following the 2026 design direction in BRIEF.md. Present DESIGN.md to me.

GATE 2 — I approve the design. Do not start building until I approve.

Phase 3 — Build. Delegate to frontend-dev: implement every page from the approved DESIGN.md specs and approved content, semantic HTML/CSS/vanilla JS, local assets only, within the performance budget in BRIEF.md (Lighthouse Performance ≥ 90, Accessibility ≥ 95 on mobile, home page < 1.5 MB).

Phase 4 — Verify. Delegate to qc-reviewer and tester. qc-reviewer reviews every page against DESIGN.md and the BRIEF.md quality gates and either approves it or returns a specific fix list; tester runs link checks, HTML validation, Lighthouse, viewport checks (360/768/1024/1440), theme-toggle and reduced-motion checks, and asset checks, writing results to TEST-REPORT.md. Loop fixes through frontend-dev until qc-reviewer approves every page AND tester reports zero blocking defects.

Phase 5 — Deploy. Delegate to devops: create the GitHub Actions workflow that deploys to GitHub Pages on push to main, add the CNAME file for johnha.info, add the scheduled monthly link-check workflow that opens an issue on failure, and write MAINTENANCE.md. Flag any DNS or registrar steps for me to do myself — do not attempt to change domain settings.

GATE 3 — Present the finished site, the test report, and the deploy summary to me. I approve the launch.

Begin with Phase 0 now, and end your first reply with the asset inventory and the proposed phase plan in STATUS.md.
```
