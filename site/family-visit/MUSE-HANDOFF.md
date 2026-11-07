# Handoff to Muse: v13 — MERGE TO MAIN (owner-approved, 2026-11-07)

The owner asks you to merge branch **`family-visit-v13`** into `main` and deploy.

1. **Merge `family-visit-v13`, not `family-visit-v12`.** v12 on GitHub still carries the
   pre-rewrite history; never merge or push from it. v13 sits directly on `main` (`1e331a3`)
   with 5 commits: v12 collapse + report tab (yours, cherry-picked), tests, v13 app, reports.
   A fast-forward merge is possible.
2. **Before merging:** run `node site/family-visit/tests/run.mjs --qc` with your private
   fixtures (`FV_FIXTURES_DIR`). The 39/39 in `tests/last-run.json` was run on synthetic
   fixtures of the same shape. If anything turns red, do not merge; report it.
   - Case (y)/B8 compares against `tests/b8-baseline.json`, measured on a 4-vCPU cloud VM. On
     another machine, re-measure the base first: check out `1e331a3`, copy in the new
     `tests/`, run with `FV_B8_LABEL=base FV_B8_MEASURE_ONLY=1 node site/family-visit/tests/run.mjs --qc --only="(y)"`,
     and point `FV_B8_BASELINE` at the resulting `b8-metrics-base.json`.
   - If the emulator answers 503 "Network closed…", set `JAVA_TOOL_OPTIONS=-Djava.net.preferIPv4Stack=true`.
3. **Deploy and check live** (hard reload; assets are `?v=13`, report `appVersion` "v13"):
   - Date column: one continuous green line, fully drawn without scrolling.
   - Thảo luận: scrolling a long thread on a phone feels smooth; "↻ Làm mới" works.
   - Thread collapse toggle appears under roots with replies (it never rendered in v12).
   - Backdrop: bright East Coast blues/seafoam/fog (owner request); ask the owner to confirm.
   - Báo lỗi right after sign-in sends instead of saying "Cần có mạng".
   - Never post test data on the live board.
4. Details: `QC-REPORT.md` (v13 section) and `WORK-LOG.md` (v13 addendum).

---

# Handoff to Muse: Family Visit board v2 → v4

Branch **`family-visit-v2`** (on top of current `main`, no conflicts). Not merged; merge after your live check.
Emulator suite: **26 of 26 passing** (`TEST-REPORT.md`, `QC-REPORT.md`). Design and decisions: `WORK-LOG.md` sections 6–8.

## 1. What ships in this branch
- **Vietnamese interface.** `<html lang="vi">`, dates as "7/11 lúc 09:14", and agent roles shown through the display map. The owner prefers **"ba mẹ"** (not "bố mẹ").
- **Page order:** Kế hoạch (plan table and pending votes), then Thảo luận (chat), then Chi tiết các quyết định (D1–D4), then a round back-to-top button.
- **One chat** on `threads/general`, with topic tags and an optional topic filter (section 2).
- **Liquid-glass look**, the Google Sans font (with Vietnamese subset), and GSAP 3.13 (core, ScrollTrigger, Flip, SplitText, ScrollToPlugin, CustomEase) from jsDelivr. Every effect is optional: reduced motion or a blocked CDN gives the same working page.
- **D section rebuilt for reading.**
  - A chip row at the top, then a card per decision.
  - Each card: a D badge, the short topic as title, the question under it, and a "Đã chốt" or "Chưa chốt" pill.
  - Then the `intro`, a "Kết luận" box when there is a resolution, and the options folded behind "Xem chi tiết (N mục)".
  - D-tokens in the table and proposal cards link to their card.
- **Bug fix (affects the live v1 too):** offline sign-out could come back signed in after a quick reload or tab close, and it reloaded into the browser's "no internet" page. Merging this fixes both.
- **`firestore.rules` unchanged**: nothing to redeploy.

## 2. What the agents must do (data contract changes)
1. **Post every agent message to `threads/general/messages`.** Other thread collections are legacy and are **not shown** anywhere.
2. **Tag each agent message with `category`.** The agent picks it by subject; nobody else will.

   | `category` | Shown as | Use for |
   |---|---|---|
   | `flights` | Vé máy bay | flights, airports, tickets |
   | `san-jose` | San Jose | the San Jose days, home prep |
   | `nyc` | New York | NYC days, stays, food |
   | `niagara-falls` | Thác Niagara | the Niagara leg |
   | `pennsylvania` | Pennsylvania | the Pennsylvania leg |
   | `budget` | Ngân sách | money, totals, price checks |
   | `documents-visa` | Giấy tờ & Visa | visa, passports, documents (never post numbers) |
   | `general` | Chung | cross-cutting or none of the above |

   - When an agent replies to a person's message, use the topic that message belongs to. A person's reply automatically inherits the topic of the message it answers.
   - Any other value shows no tag. A message with no `category` still shows, just without a tag.
3. **Message shape** (Admin SDK): `id`, `threadId: "general"`, `authorKind: "agent"`, `role` (English role id, e.g. `"Flights & Travel"`), `category`, `text` (Vietnamese), `replyTo` (id or null), `createdAt`, `clientCreatedAt` (ms), `deleted: false`. `topic` is optional and shows as a bold first line.
4. **Proposals:** set `threadId: "general"`. The 72-hour reminder is written to the proposal's own thread, so it is invisible otherwise. Optionally add `category` from the table above.
   - Keep `summary` short (one line), at most 4 rows per proposal, and never edit a proposal after creating it.
   - The reminder is stored with the English template the rules require; the page renders it in Vietnamese.
5. **Decisions (`decisions/Dn`):**
   - `intro`: 1–2 plain Vietnamese sentences.
   - `resolved: true` once decided.
   - **`topic`: short (2–4 words).** It is now the card title, with `question` as the full sentence under it.
   - Inside one option, separate alternatives with **`" | "`**; the page shows one alternative per line.
6. **Plan rows:** write references as `D1`…`D4` (e.g. "(phương án ở D3)"). They become links on their own.
7. **Pinned summary:** `threads/general.summary`, in Vietnamese. The heartbeat (`meta/heartbeat`) is unchanged.
8. **All agent text in Vietnamese, using "ba mẹ".** Proper nouns (San Jose, NYC, airline names, airport codes) stay as they are.

## 3. Please verify live (cannot be done in the emulator)
- **Real Google sign-in** on an iPhone and an Android phone (popup, or redirect when the popup is blocked).
- **Two real devices:** messages appear live; a proposal gets three OK votes (on a test proposal you then remove) and one No freezes it.
- **Glass and motion on real phones:** smoothness and heat. On iPhone, also with Settings → Accessibility → Reduce Motion turned on.
- **Navigation:** tapping D3 in the table glides to the D3 card and opens it; the floating section bar appears after scrolling; the back-to-top button never covers the chat box or vote buttons.
- **Offline sign-out on a phone:** turn on airplane mode, tap Đăng xuất, turn airplane mode off. The page must come back signed out.
- **Live data in Vietnamese:** look for any English left inside Firestore content. Fix the data, not the UI.
- **Rest of johnha.info:** a regression pass (nothing outside `site/family-visit/` changed).

## 4. Open items for the owner or Muse
- **Git history:** `main`'s history still contains the v1 `board.json` and the v1 QC screenshots, which showed the plan with prices. This branch deletes the screenshots from `site/`. Removing them from history needs a rewrite of `main`; that is the owner's call.
- **Test fixtures stay private** (`FV_FIXTURES_DIR`). If your copy is still English, it works, but screenshots will show English data. Mine was translated with every price unchanged.
- **QC screenshots** are written to `FV_QC_DIR` (default `../family-visit-qc/`), never into `site/`.

## 5. How to run the tests
```bash
export FIREBASE_BIN=/path/to/firebase FV_FIXTURES_DIR=/path/to/family-visit-fixtures FV_QC_DIR=/path/to/family-visit-qc
node site/family-visit/tests/run.mjs --qc     # 13 end-to-end + 13 QC checks, emulator only
node site/family-visit/tests/run.mjs --serve  # page + emulator for manual checks
```
