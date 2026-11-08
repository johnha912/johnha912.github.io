# Family Visit: work log

Run log and design decisions for `site/family-visit/`. Not part of the graded deliverable; see `TEST-REPORT.md` and `QC-REPORT.md` for results.

## 1. Design plan (frontend-design skill, written before coding)

The skill's `SKILL.md` was read from `anthropics/skills` (`skills/frontend-design`) and followed directly. It was not installed into `.claude/skills/`: that folder is outside `site/family-visit/`, which the brief forbids touching, and the `/plugin` install is an owner action. No other design skill was used for this build.

**Subject, audience, job.** Three adult siblings in San Jose plan their parents' winter visit (SGN to San Jose, then NYC, Niagara Falls, Pennsylvania), mostly from their phones. The page's job is to show the confirmed plan at a glance, let each person approve or reject changes, and hold the conversation around them.

**Color** (light; a matched dark set follows `prefers-color-scheme`):

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#eef1f4` | Morning-frost background (cool, winter trip) |
| `--ink` | `#1e2833` | Slate-navy text |
| `--pine` | `#22664f` | Evergreen: confirmed rows, OK, primary actions |
| `--lantern` | `#8a510d` | Lantern amber: waiting for votes |
| `--cranberry` | `#a3354d` | No, rejected, errors |
| `--surface` | `#ffffff` | Table and chat panels |

Seven agent role colors (indigo, teal, wood, plum, moss, violet, olive) plus three member colors make the chat read as many participants.

**Type.** One family: Atkinson Hyperlegible Next (Google Fonts, with a system fallback stack). It was chosen because its character shapes (slashed zero, distinct I/l/1) keep prices, dates, and flight times unambiguous in a dense table. The scale is a major third: 13 / 16 / 18 / 22 / 28 px. Weights 400, 600, and 700.

**Layout.** One left-aligned column (max 64rem): title, then plan board, then chat, then a floating back-to-top button. No hero.
```
+---------------------------------------------+
| Family Visit (title)        Signed in as John|
| window . Live . Agents last active . dots    |
+---------------------------------------------+
| [Pending confirmation strip: OK / No x3]     |
| Date | City/leg | Transport | Stay | ...     |  <- route rail down the Date column
| o----                                        |
| o----                                        |
| Open decisions D1-D4                         |
+---------------------------------------------+
| Flights | San Jose | NYC | ... | General     |
| pinned summary                               |
| messages (scrolls inside the frame)          |
| [composer]  privacy reminder                 |
+---------------------------------------------+
                                  [Back to top]
```

**Principles.** Spend boldness in one place: the timeline is a timetable with a continuous route rail and a stop marker per row. Everything else is quiet: hairline separators in chat (a forum, not bubbles), no identical card kit, no all-caps eyebrows, no middle-dot meta strings, no arrows appended to buttons.

**Review against the brief and the skill's defaults list.** Things changed after review:
- A cream background with a terracotta accent was considered for "warm", but it is the first default on the skill's list. It was replaced with frost blue-grey plus lantern amber, which carry the warmth through the waiting state instead of the background.
- Status separators were drafted as "A · B · C". They became separate spans with spacing, because middle-dot meta strings are listed as a tell.
- An accent bar on the left edge of proposal cards was dropped in favor of a full outline whose color is the state.

**Motion.** GSAP 3.13.0 core, deferred, used only for `transform` and `opacity`. It covers new messages settling, proposal cards arriving or changing state, the pending strip appearing, and back-to-top show/hide. Everything is skipped under `prefers-reduced-motion` and when GSAP fails to load. Visibility never waits on an animation.

## 2. Decisions on open problems (owner's standing instruction)

Each entry: decision, alternatives rejected, why. All are flagged in `QC-REPORT.md` for Muse's live review.

1. **Whitelist stored as SHA-256 hashes, not addresses.**
   - Decision: `firestore.rules` and `config.js` hold the hex SHA-256 of each lower-cased email, and rules compare `hashing.sha256(token.email.lower())`.
   - Rejected: plain addresses in the rules file. The brief allows that, but the repo is public, so it would publish all three addresses.
   - Why: hashes keep the whitelist working while publishing no address. The emulator suite proves that hashing works in rules (test b).
   - Rules also require `email_verified == true` and the `google.com` sign-in provider.
2. **Test rules derived from the real file.**
   - Decision: `tests/run.mjs` swaps the three production hashes for hashes of fake accounts (`*@family-visit.test`) and fails unless exactly three were swapped.
   - Rejected: a separate test rules file, because it could drift from production.
   - Why: tests exercise the production rules text and never contain a real address.
3. **Agents write through the Admin SDK.**
   - Decision: proposals, pinned summaries, decisions, the heartbeat, and agent messages are written by Muse with the Admin SDK, which bypasses rules. People cannot create proposals or post as an agent.
   - Rejected: letting signed-in members create proposals or agent posts, because that would allow impersonating an agent.
   - The service-account credential is Muse's side (BLOCKED-EXTERNAL for this build); the data contract is in section 3.
4. **The 72-hour reminder is client-triggered, exactly once.**
   - Decision: any signed-in session that sees a pending proposal older than 72 hours writes a Coordinator message with the fixed id `reminder-<proposalId>`, plus `reminderSent: true`, in one batch. A second attempt becomes an update, which the rules refuse.
   - Rejected: relying on Muse's agent loop alone, which has no guarantee it is running.
   - Why: exactly-once is enforced by the server, not by timing.
5. **The 3rd OK applies the change, from the voter's browser.**
   - Decision: the vote is a Firestore transaction that re-reads the proposal, the table meta, and every touched row. It checks that each row still equals the proposal's `before` values, then writes rows, bumps `planMeta/table.version`, and marks the proposal `applied`.
   - The rules check all of it with `get()`/`getAfter()`: only your own vote changes, all three are OK, the version is bumped by one, every listed row carries `appliedProposal == id`, and the cells equal `after`.
   - Proposals touch at most 4 rows (rules have no loops, so the check is unrolled).
   - Rows are never deleted; a proposal can only add or change rows.
6. **Stale proposals cannot apply.** If any row changed after the proposal was written, the transaction aborts with "The table changed after this proposal was made". The agents must issue a new proposal.
7. **Voting needs a connection.** Transactions cannot run offline, so the vote buttons say so instead of queuing. Messages, unlike votes, queue offline.
8. **Presence uses a Firestore heartbeat, not RTDB.**
   - Decision: `presence/{member}` is written on open, every 45 s while visible, as `away` when hidden, and as `offline` on pagehide. Readers treat a `lastSeen` older than 90 s as offline.
   - Rejected: RTDB `onDisconnect`. It would add a second database and a second set of rules for one feature.
   - Firestore has no `onDisconnect`; the stale-heartbeat rule is the cleanup.
9. **Unread markers and drafts live in localStorage.** They are per-device conveniences. Sign-out clears every `fv-*` key, including the cached plan, for shared devices.
10. **Offline snapshot.**
    - Decision: the snapshot is the last plan this device saw live (localStorage), falling back to `timeline-seed.json` and `board.json`.
    - It is shown only on a device that has signed in as a member before. A device that never signed in gets the sign-in screen with an error, so signed-out visitors see no plan content.
11. **Connection health.**
    - Decision: a canary listener on `meta/heartbeat` decides "live". If the canary has served only cached data for more than 10 s while the browser is online, or a listener errors, the client cycles the network and resubscribes everything with backoff of 1, 2, 4 … 30 s. After 60 s of reconnecting, every watched query is also fetched from the server every 30 s until the canary is live again.
    - The emulator tests use `?timing=fast`, which works only on localhost, to shorten the 10 s and 60 s thresholds.
12. **Timeline rows needed a seed.** `board.json` has decisions, not day rows. `timeline-seed.json` holds four rows built only from the DATA section and D1, with "To be decided" or "Not set" wherever nothing is confirmed. Muse should seed `planRows/*` and `planMeta/table` from it (section 3).
13. **Mobile table.**
    - Decision: the table lives in its own horizontally scrolling region with a sticky Date column.
    - Rejected: stacked cards. Row-to-row comparison is the point of a timeline.
14. **Vote buttons for all three members.** Each card shows OK / No for John, Nickie, and Johnny as the brief requires. Only the signed-in person's pair is enabled; the other two pairs are disabled, show that person's live vote via `aria-pressed`, and say who can use them.
15. **Back-to-top placement.** The button starts bottom-right and moves up past the composer or any vote-button row underneath it. If that would take it more than halfway up the screen, it stays hidden until the obstacle scrolls away.
16. **Emulator project id.** In emulator mode the app uses the project id `demo-family-visit` (set in `config.js`), so emulator traffic can never reach live data.
17. **GSAP and Firebase from CDNs.** The brief requires them for this folder, which overrides the rest of the site's local-assets rule. GSAP is pinned to 3.13.0 and the Firebase SDK to 11.10.0.

## 3. Data contract for Muse (agent side)

All writes below use the Admin SDK. Timestamps are Firestore Timestamps.

| Path | Fields | Notes |
|---|---|---|
| `planRows/{rowId}` | `order` (int), `date`, `leg`, `transport`, `stay`, `activities`, `cost`, `status` (strings), `version` (int), `updatedBy`, `updatedAt`, `appliedProposal` | Seed once from `timeline-seed.json` with `version: 1`, `updatedBy: "seed"`, `appliedProposal: "seed-initial"`. After that, rows change only through proposals. |
| `planMeta/table` | `version` (int), `updatedAt`, `updatedBy`, `lastProposal` | Seed `version: 1`. Must exist before any proposal can apply. |
| `proposals/{id}` | `id`, `summary`, `threadId` (one of the 8 topic ids), `rowIds` (1-4 row ids), `changes: { rowId: { before: cells or null, after: cells } }`, `votes: { john, nickie, johnny }` all `"pending"`, `status: "pending"`, `createdAt`, `createdBy` (agent role name), `updatedBy`, `reminderSent: false` | "cells" = exactly the 8 cell fields above. `before` must equal the row's current cells (null for a new row). Never edit a proposal after creating it; issue a new one. |
| `threads/{topicId}` | `summary`, `summaryUpdatedAt`, `updatedBy` (agent role) | Topic ids: `flights`, `san-jose`, `nyc`, `niagara-falls`, `pennsylvania`, `budget`, `documents-visa`, `general`. |
| `threads/{topicId}/messages/{id}` | `id`, `threadId`, `authorKind: "agent"`, `role` (exact role name), `text`, `replyTo` (id or null), `createdAt`, `clientCreatedAt` (ms int), `deleted: false` | Role names: Coordinator, Flights & Travel, Stay & Home Prep, Itinerary & Food, Budget, Scout — Research & Verification, Visa & Documents. Optional seed: the two `board.json` discussion posts as `seed-discussion-1` and `seed-discussion-2` in `general`; the page shows them from `board.json` until then. |
| `decisions/{Dn}` | same shape as `board.json` decisions | Optional. If the collection is empty the page renders `board.json`. |
| `meta/heartbeat` | `lastActive`, `role` | Update whenever an agent acts; drives "Agents last active …". Also the page's connection canary (reading it is enough). |

Deploy notes:
- Move `firestore.rules` into the Firebase project and deploy it (`firebase deploy --only firestore:rules`).
- `config.js` needs no change for production (`MODE = "auto"` picks production on johnha.info).

## 4. Run log

- Probed emulator support for `hashing.sha256().toHexString()` in rules before relying on it: allowed for the hashed test address, denied for any other.
- First suite run: 4 of 11 passed. A collection listener on `threads` was refused because the rule `tid in threadIds()` cannot be proven for a collection query, and the app treated that as "not a member". Fixed the rule and logged which listener is refused.
- Pagination loaded only one extra message: the first snapshot came from cache with a single message, so the "load earlier" cursor pointed at the newest one. The cursor now follows the live window until an older page loads.
- Opening a topic did not scroll to the newest message. Fixed.
- Test (e) first passed by luck: blocking the emulator route does not cut a stream that is already open. Added an emulator-only `fvTest.dropConnection()` that cycles the network, which reproduces a real drop.
- QC caught the back-to-top button lifting onto the next vote row up; replaced the single lift with an iterative search plus a hide fallback.
- QC screenshots showed blank space under the chat. Screen-reader-only spans inside the scrolling message list were positioned against the page; the list and cards are now positioned containers.
- Independent review (rules and client) found no rules hole and no XSS path. Client fixes from it: offline sign-out no longer hangs and now clears the DOM, localStorage, and the Firestore cache; "load earlier" reads from the server only; clear messages for stale or oversized proposals; reminder text pinned in the rules (free-text attempt now tested); reminder retry on transient errors; presence heartbeat only while live, with a 10-minute "away" window; one token-refresh retry before showing the denied screen; seed files fetched only after member sign-in. See `QC-REPORT.md`.
- Final run: 22 of 22 (12 end-to-end, 10 QC).

## 5. Post-delivery change — Muse, Nov 7, 2026 (owner decision: plan data only in Firestore)
The owner decided the trip plan must not be downloadable by link. `board.json` and `timeline-seed.json` were removed from `site/family-visit/` (the repo is public and the deploy publishes all of `site/`), and `loadSeedFiles()` in `app.js` is now a no-op: decisions, seeded discussion posts, and timeline rows come only from Firestore, seeded by the agents; the offline snapshot is the signed-in device's own cache. Test fixtures moved OUT of the repo: `tests/run.mjs` reads them from `FV_FIXTURES_DIR` (default: a `family-visit-fixtures/` folder next to the repo clone) and fails with a clear message if absent. `seedBaseline` now also seeds decisions + the two discussion posts from the board fixture, so the QC byte-identical check verifies the production Firestore path instead of the removed file fallback; its title assert now checks the static page title, and discussion timestamps are no longer compared (seeded posts carry real timestamps). The branch history was rewritten into a single commit so the removed files are not in the branch's history either; the original commit `60e1a25` may still exist in local clones — treat its two JSON files as already-seen and do not re-add them. Not re-run here: the emulator suite (needs the fixtures folder + Playwright/emulator on the dev machine) — Muse's live E2E covers the deployed build.

## 6. v2: Vietnamese UI, one chat, Plan, then Chat, then Details (branch `family-visit-v2`, 2026-11-07)

Owner feedback: fully Vietnamese, simpler, in the order Plan, then Bình luận (chat), then Chi tiết D1–D4, understandable by a first-time reader on a phone. Same v1 design language (frontend-design direction): same tokens, colors, route rail, and voting cards.

**What changed**
- **Vietnamese everywhere in the interface.**
  - Screens: sign-in, denied, loading, and the header ("Đăng nhập bằng Google", "Đăng xuất", "Đã đăng nhập: <tên>").
  - Status: connection and presence (Đang kết nối, Trực tuyến, Tạm vắng, Ngoại tuyến).
  - Plan: table headers per the brief, table-meta line, proposal cards and votes (Đồng ý / Không, Đang chờ), with the brief's gate sentence.
  - Chat: composer, reply, edit and delete, flags (đã sửa, đang gửi…).
  - Notices: offline banners and snapshot notices, every error message, and the back-to-top label.
  - Format: `<html lang="vi">`, dates as "7/11 lúc 09:14", relative times "vừa xong" / "N phút trước" / "N giờ trước".
  - Agent roles go through the brief's display map; the data keeps the English ids.
- **Order:** title, then Kế hoạch chuyến đi (pending strip and table), then Thảo luận, then Chi tiết các quyết định (D1–D4), then back-to-top. The page opens at scrollY 0. The chat keeps its newest message in view inside its own box, never by scrolling the page.
- **One chat:**
  - Removed: tabs, per-thread unread badges, per-thread "here" dots, and the eight `latest-*` listeners.
  - The chat always reads and writes `threads/general`, and presence always writes `thread: "general"`. Rules and data are unchanged.
- **D-links:**
  - Whole tokens matching `\bD\d{1,2}\b` become links, but only when that decision exists in the data. This covers table cells, proposal summaries, and before/after values.
  - A tap scrolls to `#decision-Dn` (smooth unless reduced motion is set), focuses it, and highlights it for 2 s.
  - Each link has a 44 px tap area via padding cancelled by negative margins, so the line layout does not move.
- **Decision cards:** the `intro` shows as a lead paragraph under the title. Resolved styling uses `resolved === true`, with `status === "resolved"` as a fallback, and adds a "Đã chốt" badge.
- **Short orientation lines** under each section heading, so nobody needs a second explanation: what the table is, what the chat is for, what D1–D4 are.

**Problems found and solved (gap-filling mandate)**
1. **The v1 typeface had no Vietnamese glyphs.** Atkinson Hyperlegible Next ships only latin and latin-ext on Google Fonts; letters like ạ, ấ, and ở would fall back to a system font mid-word. It was switched to Be Vietnam Pro, drawn for Vietnamese and on Google Fonts with a `vietnamese` subset. Line-height went up slightly for stacked diacritics.
2. **The 72-hour reminder text is pinned in English by `firestore.rules`.**
   - Rather than change and redeploy the rules, the stored text stays as the rules require, and the chat renders `kind: "reminder"` messages from a Vietnamese template.
   - The proposal summary comes from the proposal doc, or is parsed back out of the stored text.
3. **Proposals filed under legacy threads.** Proposals now show in the one chat whatever their `threadId`, and the pending strip shows them all. A reminder is written to the proposal's own thread, so it is only visible when `threadId` is `general`. **Note for Muse:** file new proposals with `threadId: "general"`.
4. **QC screenshots leaked the plan.** The v1 `site/family-visit/qc/*.png` showed the real plan with prices, still downloadable after `board.json` was removed. They were deleted on this branch. `tests/run.mjs` now writes screenshots to `FV_QC_DIR` (default `../family-visit-qc/`, outside the repo). They remain in `main`'s git history: flagged to the owner.
5. **Accessibility labels must not carry data.** The proposal card's `aria-label` embedded the summary; it now uses `aria-labelledby` pointing at the summary heading. That lets the language audit treat attributes as interface text.
6. **The decisions section was a collapsible `<details>`.** It is now a plain section, so a D-link can never land on a hidden card.
7. **Loanword.** "chat" in an error message became "trò chuyện".

**Could not verify here**
- That the live Firestore content is all Vietnamese: this session has no access to the live project. If an English string shows up in live data, Muse should fix the data, not the UI.
- Live Google sign-in, real phones, and the on-screen keyboard: same as v1, BLOCKED-LIVE.

**Run log**
- The first v2 run had 21 of 24 passing:
  - D-link tap area measured 43 × 42 px; padding raised to 14/15 px.
  - The seed-fidelity check read the page before the decisions arrived; it now waits for them.
  - The reminder's proposal summary was not marked as data; it now is.
- Final run: 24 of 24.

## 7. v3 on the same branch: liquid-glass look, all fitting GSAP features, readable D section, Google Sans (owner request, 2026-11-07)

**Look: iPhone-style liquid glass.** The page sits on four soft color fields (pine, sky, lantern, rose) that drift slowly. Every main surface is frosted glass:
- Glass surfaces: title card, plan card, chat frame, decision cards, floating section bar, back-to-top, buttons, and vote buttons.
- Recipe: translucent gradient, `backdrop-filter: blur(22px) saturate(180%)`, a bright inner top edge, a soft drop shadow, and a specular highlight. The highlight sits behind the content and follows the pointer on desktop.
- The meaning colors are unchanged (evergreen = confirmed / OK, lantern = waiting, cranberry = No), and dark mode has its own glass set.
- Without `backdrop-filter`, panels fall back to near-opaque.

**Font: Google Sans.** Google Fonts now ships Google's own face with a `vietnamese` subset. Montserrat was the alternative; Google Sans reads better at small sizes and in the table.

**GSAP 3.13 (all plugins free since 3.13), every effect enhancement-only:** reduced motion and a blocked CDN both give the same working page. Reveals use opacity, never visibility, so nothing becomes unclickable.
- **Core + CustomEase:** a "liquid" settle curve; touch feedback (buttons give under the finger, then spring back with `elastic`); springy entrances for new messages and proposal cards; `quickTo` for the pointer-following glass highlight.
- **SplitText:** the title words rise on first load (sign-in card and board). The split is reverted afterwards, so the text and accessibility are unchanged.
- **ScrollTrigger:** sections below the fold rise in when reached; the backdrop drifts with scroll (parallax); a thin reading-progress line at the top; the table's route rail draws itself as the plan scrolls in (`--rail` feeds a `scaleY`); 8 triggers live.
- **ScrollToPlugin:** the D-links, the section bar, and back-to-top glide to their target and stop below the floating bar.
- **Flip:** opening or closing a decision card's details animates the card and slides every card below into place.
- **Floating section bar** ("Kế hoạch / Thảo luận / Chi tiết D"): appears once the title scrolls away, and a glass pill slides under the section in view.
- **Row glow:** rows a proposal just changed glow once when the table updates.

**D section, rebuilt for a first read (owner said it looked cluttered):**
1. **Chip row at the top:** one chip per decision ("D1 Lộ trình ✓", "D2 Visa"…) that jumps to the card.
2. **Card header:** a large D badge, filled green when decided. The short topic is the title and the full question sits under it in muted text, replacing the one long "D3 Flights: Multi-city flights for 2 adults (…)" line.
3. **Clear pill:** "Đã chốt" or "Chưa chốt", keyed on `resolved`.
4. **The `intro` as the lead sentence;** the conclusion in its own green "Kết luận" box; the status under a small "Tình trạng" label.
5. **Long option lists folded** behind "Xem chi tiết (N mục)" and expanded with Flip. A D-link from the table opens the card it lands on.
6. **Options that pack alternatives as "A | B | C"** show one alternative per line. The separators stay in the DOM (hidden), so every option is still the database string character for character, which the QC fidelity check verifies.

**Bugs found while testing (fixed):**
- **Offline sign-out could leave the user signed in.** Firebase's `signOut` ran after the sign-in screen was already showing, so a quick reload or tab close came back signed in (5 of 6 tries). This existed since v1; the old test passed on timing luck. Now a "Đang đăng xuất…" screen shows until Firebase has dropped the saved session.
- **Offline sign-out then reloaded into the browser's "no internet" page.** Now it stays on the sign-in screen and reloads itself when the connection returns. The test runs offline sign-out 5 of 5 times green and checks the user comes back signed out.
- **The glass highlight used `%` units in `quickTo` on a custom property,** which made GSAP print a warning. It now uses unitless numbers multiplied in CSS.

**Test data now Vietnamese** (owner saw English in screenshots):
- The private fixtures (`FV_FIXTURES_DIR`) were translated with every price and time unchanged; a script asserted the dollar amounts match the originals.
- Every test-authored string (proposal summaries, chat messages, harness probes) is Vietnamese too.
- English in old screenshots was test data, never interface text.

Final run: 25 of 25 (12 end-to-end, 13 QC).

## 8. v4 on the same branch (owner request, 2026-11-07)
- **"Ba mẹ", not "bố mẹ":** every interface string, plus the test fixtures and test strings.
- **Back-to-top:** now a 52 px round glass button with the arrow only. `aria-label` and `title` are "Lên đầu trang"; the overlap-avoidance logic is unchanged.
- **One chat, checked:**
  - The page reads and writes only `threads/general`. A new test seeds a message in a legacy thread and confirms it never shows. There are no tabs.
- **Agents sort their own replies into topics:**
  - Agent messages carry `category` (8 fixed ids). The chat shows a topic tag on each tagged message.
  - A filter row ("Tất cả / Vé máy bay (3) / …") appears only when tagged messages exist.
  - A reply inherits the topic of the message it answers, and a proposal's topic comes from `category`, or else its legacy `threadId`.
  - Posting while a filter is on switches back to "Tất cả", so the new message never vanishes from view.
  - The data contract for Muse is in `MUSE-HANDOFF.md`.
- **Reply quotes:** "Trả lời X: …" lost the space after the colon (separate flex items), fixed with one inner span.
- **QC fidelity check:** now waits for the seeded discussion posts, not just the decisions and rows. It had read the page while only the cached newest message was loaded.
- Final run: 26 of 26 (13 end-to-end, 13 QC).

## v5 addendum (built by Muse, 2026-11-07 — owner authorized Muse to build directly; Claude Code was out of tokens)

- **Name chips in the header** (owner feedback: "Chỗ đăng xuất để thẻ như tên John Nickie Johnny để hiện rõ hơn"): `renderPresence()` now emits readable chips — status dot + name (15px semibold) + the status word visible (`Trực tuyến / Tạm vắng / Ngoại tuyến`, previously sr-only/title only) — and the signed-in member's chip gets `.pres--me` (pine highlight) plus a "Bạn" badge. CSS `.pres` enlarged to chip padding 8px 14px within the existing liquid-glass tokens; no data path, rules, or other section touched. Spec: `UI-V5-BRIEF.md` + `UI-V5-HANDOVER.md` in the goal workspace.
- **Tests:** the e2e presence test gained three assertions (exactly 3 chips; own chip carries the "Bạn" marker; the status word is visible text on a chip). The emulator suite was NOT run for v5 on Muse's VM (no Java / firebase-tools / Playwright there); `node --check` passes on `app.js` and `tests/e2e.mjs`. Verification gate for v5 is Muse's independent live E2E after merge, per the owner's standing protocol; the extended suite should be re-run on the dev machine at the next opportunity.

## v6 addendum (built by Muse, 2026-11-07 — owner screenshot feedback on v5)

- Owner clarified the v5 ask: the name chips themselves were fine, but (1) the "Bạn" badge added in v5 reads like a stray button — removed (`renderPresence` no longer emits `.pres-you`; the self chip keeps only the `.pres--me` highlight), and (2) the real target all along was the **sign-out control**: it used `.btn--quiet` (transparent background + border), so it looked like bare text and was easy to tap by mistake. `#signout` now uses a dedicated `.btn--signout` style — solid glass background, strong border, semibold label, full 44px button height — and the account row gap widened (s2 → s3) so it sits clearly apart from the account name.
- Tests: the v5 chip assertions updated (own chip highlighted; no `.pres-you` element exists). Emulator suite still not run on Muse's VM (no Java/firebase-tools/Playwright); live E2E after merge is the gate, as for v5.

## v7 addendum (built by Muse, 2026-11-07 — owner: "card tên cũ ok rồi, quay lại version trước")

- The owner reviewed v5/v6 from screenshots and directed: the v5 name-chip redesign was unnecessary — **revert the member name cards to the previous (v4) version**. `renderPresence()` and the `.pres` CSS block are restored byte-for-byte from the v4 code (small dot + name pills, status in title/sr-only), the v5/v6 chip assertions in `tests/e2e.mjs` are removed (file back to its v4 state), and the `.pres--me` / `.pres-text` styles are gone.
- **Kept from v6:** the sign-out card button (`.btn--signout`) — that was the owner's circled request ("chỗ khoanh đỏ là cần card"): the sign-out is now a real bordered button instead of bare text.

## v8 addendum (built by Muse, 2026-11-07 — cache-busting, post-incident adjustment)

- Root cause found during v6/v7 verification: browsers (the owner's phone, the test browser) kept executing a **stale cached `app.js`** after deploys — the owner's screenshot showed v5 while v6 was live, and the v7 browser check first read the old build. The served files were correct; the clients were not fetching them.
- Adjustment: `index.html` now loads `app.css?v=8` and `app.js?v=8`. **Standing rule for every future release: bump the `?v=` number in both tags**, so each deploy forces a fresh download on every device. (Reminder lives here and in QC-REPORT v8.)

## v9 addendum (built by Muse, 2026-11-07 — Báo lỗi / Report Issue)

- Owner's request: a Report Issue control any of the 3 hosts can use; the report must reach the
  agent team's side chat so the team checks and fixes it. Owner surveyed placements with Muse
  (floating bottom-right / next to sign-out / side tab) via 3 rendered previews and picked
  **kiểu C: a vertical tab on the right edge**, in **liquid glass** so page text stays readable
  underneath instead of being covered.
- Build: `#report-tab` (fixed, right edge, vertically centred, .glass, vertical text + flag icon,
  ≥44px) visible only on the board screen; opens `#report-sheet`, a glass bottom sheet with 4
  category chips (display/stuck/content/other), one textarea, and auto context (reporter,
  timestamps, user agent, appVersion "v9"). Submit writes ONE doc to the new `issues` collection
  with `status: "open"`.
- Rules: `issues` match added (member create with exact-shape validation, member read, no client
  update/delete — status changes are Admin-SDK only) and DEPLOYED via the Firebase Rules API
  (ruleset c69774f8…, release cloud.firestore now points at it; source of truth stays
  `firestore.rules` in this repo).
- Plumbing: `agent_loop.py issues` lists open reports, `issue-done <id> <resolved|wontfix> <note>`
  closes them; the watcher hook now polls issues alongside unanswered messages (30-min local
  suppression, key `issue:<id>`) and its prompt + AGENT-LOOP.md gained an "Issue reports" section:
  acknowledge on the board, triage against live data, fix content/data issues via normal tools,
  code defects stay open for a build from the owner's chat, ALWAYS surface reports in the chat.
- Assets bumped to ?v=9 per the standing cache rule. One emulator test added (14th e2e): the tab
  files exactly one open issue under the reporter's name.

## v10 addendum (built by Muse, 2026-11-07 — Reception: instant acknowledgement + typing signal)

- Owner's complaint, verbatim in substance: he posted at 12:07 and saw silence — "không ổn".
  Root cause was latency, not loss: the sweep polls every ~3 min and a substantive answer takes
  minutes more. The fix is a **reception layer**, split from the sweep:
- `hidden_files/reception.py` (run every ~20 s by the new `family-visit-reception` hook, which
  never wakes an agent): for each unacknowledged human message it writes ONE agent message
  (role **Reception / Tiếp nhận**, `kind: "ack"`, replyTo = the message) — "Đã nhận tin của
  <Name>. Tiếp nhận đã chuyển cho team — team đang xem và sẽ trả lời ngay tại đây." — and records
  the id in `meta/agentState.acked`. It also maintains `meta/typing` (active while any human
  message is unprocessed; refreshed ≤50 s so the page's 120 s staleness window holds).
- Contract change in `agent_loop.py pending()`: acks are receipts, NOT replies — the sweep still
  owes every acked message a substantive answer. Reception skips messages that already have a
  real agent reply, so a late ack never lands after the answer.
- Page: AGENTS gains Reception ("Tiếp nhận", teal); ack messages render as a compact centred
  receipt pill (✓ + text + time), never a bubble, excluded from topic filters/counts; a typing
  bar above the composer ("Nhóm trợ lý đang soạn trả lời…" with animated dots, reduced-motion
  safe) follows `meta/typing` (active + fresher than 120 s). Assets ?v=10; report appVersion "v10".
- Also fixed in passing: the D2 decision doc still read open after the family's visa news (the
  sweep's apply tool has no decision write path) — set to Đã chốt / resolved with the resolution
  text, matching D1's shape.

## v11 addendum (built by Muse, 2026-11-07 — Slack-style thread stacking)

- Owner's request: replies must stack under the message they answer ("như slack") so a
  conversation is easy to track and re-read, instead of replies drifting to their own
  timestamp position while other messages land in between.
- Display-side only — no data or contract change. `renderMessages()` now computes each
  message's thread root (following `replyTo` to the top of the chain, ≤10 hops, within
  the loaded/filtered set) and sorts by (root time, root-first, own time). A reply whose
  root is not loaded renders as a root and regroups when the root loads.
- Reply nodes get `.msg--thread`: indented (`clamp(14px, 5vw, 40px)`) with a pine left
  rail. Reception acks join their message's thread position but keep their flat receipt
  style (no indent). Proposals stay top-level cards at their own time. The grouping is
  part of the node signature, so a message re-renders when its grouping changes.
- Assets ?v=11; report appVersion "v11".
- Same build, folded in before merge (owner screenshot, 2026-11-07 12:18 PT): the plan
  table's status cell rendered as a 999px-radius pill, so long statuses ("Đã chốt tuyến
  (D1); thứ tự và ngày còn mở") wrapped into a lumpy balloon. `.row-status` is now a
  block-level rounded tag filling its cell (`border-radius: var(--r-sm)`, comfortable
  padding/line-height, `text-wrap: balance` so wrapped lines come out even) and the
  status column gets an 11rem minimum width. No text is clipped or truncated anywhere.

## v12 addendum (built by Muse, 2026-11-07 — thread collapse toggle)

- Owner's follow-up to v11: stacking is "gần giống Slack chứ chưa giống" — Slack also
  lets you fold a thread away. v12 adds the missing piece: a root message with ≥1 real
  reply gets a pill toggle under it — "Thu gọn N trả lời" / "Xem N trả lời" (chevron,
  ≥44px, `aria-expanded`). Collapsing hides the whole stack (nested replies and the
  reception ack ride along); the root never hides. The count excludes acks (receipts
  are not replies). State is per-session (`S.collapsedThreads`), cleared on sign-out;
  a thread that gains a new reply while collapsed stays collapsed with a fresh count.
- The toggle is managed after the node-diff pass in `renderMessages()`, so reused
  nodes, editing state and signatures are untouched. Assets ?v=12; appVersion "v12".
- Same build, folded in before merge (owner, 2026-11-07 12:24 PT): "Nút báo lỗi chưa
  transparent" — the Báo lỗi tab used the shared `.glass` gradient whose top stop is
  72% white, so over the plan table it read as a solid white tab hiding the text
  beneath (visible in the owner's 12:18 screenshot). The tab now overrides with a
  genuinely transparent frost: white 32%→15%→9% gradient, blur 16px + saturate kept
  (the liquid-glass refraction), lighter border/inner highlight, plus a dark-scheme
  variant (dark glass 40%→14%). Only the tab changed; the sheet/panel keep full glass
  for readability. Touch target and behaviour unchanged.

## v13 addendum (2026-11-07 — static route rail, smooth chat scroll, "Làm mới", test pack A/B)

Branch `family-visit-v12`, rebuilt on the rewritten `main` (`1e331a3`): the two v12 commits
were cherry-picked (authors kept), then v13 on top. Not merged; Muse merges, deploys and
checks live.

**Fix 1 — the Date-column rail is one continuous, static line (owner request).**
- Cause (from the code and the B5 base measurement): one 2 px segment per row inside each
  `th.c-date`, stopping at the cell's padding box, so every 1 px row border was a seam; the
  first segment started at the first dot and the last stopped at the last dot; the color was
  a per-row gradient at 55% opacity (so it restarted on every row); and `motion.railDraw`
  scrubbed `--rail` into `transform: scaleY()` with GSAP ScrollTrigger, so the line was only
  partly drawn until scrolled (base, 360 px, page not scrolled: `scaleY(0.587)`).
- Now: `.rail` covers its cell including the row border (`bottom: -1px`), the line reaches
  1 px into the row above (`top: -1px`), and it is an opaque solid color
  (`color-mix(in srgb, var(--pine) 60%, var(--bg))`) so the 1 px overlap is invisible. No
  transform, no animation, no custom property. `railDraw`, `railTrigger`, `--rail` and the
  first/last-row clamps are deleted (motion.js, app.js, app.css). Dots unchanged.
- Untouched: the sticky Date column, the table's own scroll region on phones, the
  GSAP-blocked page, reduced motion.

**Fix 2 — chat scrolling (owner: "chưa mượt, bị chậm/khựng").** Measured first (B8 below),
then changed only what the numbers pointed at.
- What the profile showed: the stalls were not the scroll handlers and not the blur. At
  base the B8 run had long tasks of 600–1000 ms right after "load earlier messages": every
  history node got a GSAP entrance tween, and GSAP reads computed style when a tween starts,
  so 49 tweens = 49 forced layouts, twice (tween creation, then GSAP's lazy init on the next
  frame). Chrome trace: one 726 ms task, 614 ms of it in small Layouts; one 671 ms
  animation-frame task, 585 ms in Layouts, all under `gsap` `Al`.
- Changes in `renderMessages()` (display order, collapse, acks and votes unchanged; cases
  (p), (q), (r)/B1, (t)/B3 are the safety net and pass):
  1. Thread root cached per message id (`replyTo` never changes); a chain cut by a parent
     that is not loaded yet is not cached; the cache resets with the topic filter.
  2. Sort tie-break uses one shared `Intl.Collator` (same order as `localeCompare`).
  3. Keyed DOM update instead of `replaceChildren(all)`: remove what left, insert/move only
     nodes that are out of place (a new message at the end is one insert).
  4. The collapse pass writes `hidden`, `aria-expanded` and the label only when they change;
     the topic chips are rebuilt only when a count or the active chip changes.
  5. No layout read before writes: "near the bottom" is kept by the scroll listener instead
     of being read at the start of each render; `loadOlder()` reads `scrollHeight`/
     `scrollTop` before any write and restores the position with one read + one write.
  6. Entrance motion only for live arrivals, at most 4 per render; a history page renders
     without entrance tweens (those nodes land above the screen). This one removed the stalls.
- Numbers (B8, medians of 3, 4x CPU, 390 px): base `1e331a3` long-task total 2039 ms, worst
  710 ms; with changes 1–5 only: 1281 ms, worst 627 ms (−37%, layout 1557 → 1237 ms); with
  change 6 as well: 63 ms, worst 80 ms. Details in QC-REPORT v13.
- Glass kept. Two cheap render changes: vote buttons inside chat proposal cards drop their
  own `backdrop-filter` (they sit on the card's gradient, where the blur is not visible, and
  each card had six); the backdrop orbs drift only on fine pointers (desktop) and pause
  while the chat is scrolled (`motion.holdBackdrop`). Not used: `content-visibility` on
  messages — iOS Safari has no scroll anchoring, so estimated heights would make the list
  jump while scrolling up through history.

**Owner request (mid-task) — "Làm mới" in Thảo luận.** A bar at the top of the chat frame:
"↻ Làm mới" (≥ 44 px) reads the newest chat page, the pinned summary, the typing signal and
the proposals straight from the server (`connection.refresh()`, the same path as a polling
round), jumps to the newest message, and says "Đã cập nhật lúc HH:MM[, có N tin mới]." If
the connection was not live it also nudges a reconnect. Offline: "Chưa làm mới được: cần có
mạng…", and the button stays usable. Case (z).

**Owner request (mid-task) — background palette.** "Đổi hình nền màu gradient vibe bờ đông,
sáng; nền hiện tại hơi cảm giác mexican." The warm fields (orange `--orb-3`, pink `--orb-4`
next to green) are replaced by a bright East Coast morning: Atlantic sky blue, harbor blue,
seafoam and sea fog, on a cooler page background (`--bg: #edf2f8`); the dark scheme gets the
same hues, dimmed. Orb classes renamed to match (`orb--atlantic`, `--harbor`, `--seafoam`,
`--fog`); the reading-progress bar ends in sky blue instead of lantern orange. Accent and
status colors (pine, lantern, cranberry) are unchanged. Owner to confirm on a phone.

**Other fixes found by the new tests.**
- v12 thread collapse never showed its toggle: `renderMessages()` grouped replies under
  `it.threadKey`, which was never assigned, so every count was 0. (q) fails on the v12 code
  as committed (`55d4ace`, run log in the QC report) and passes in v13 (`it.threadKey =
  root.key`). The v12 QC entry "PASS by code" did not hold.
- Pinned summary box: `max-height: 9em; overflow-y: auto` made a 3-sentence summary scroll
  inside its box at 360 px (B4 base: scrollHeight 128 > clientHeight 116). The cap is gone;
  the summary always shows in full.

- Báo lỗi refused reports right after sign-in: the sheet required the live connection to be
  up, and for a few seconds after sign-in (longer on a slow network) it is still
  "connecting" while the device is online. The user saw "Cần có mạng…" and nothing was sent.
  This was the intermittent (n) failure (red once at base, once in a v13 run). Reproduced 4/4
  with the emulator stream slowed by 400 ms. Now the sheet waits up to 8 s for the connection
  when the device is online, then sends (4/4 sent in the same repro); offline it still refuses
  at once. (n) now also reports the sheet's own error line when it fails.

**Test changes (no test was weakened).**
- (p): counted every `li[data-key]`, so it failed whenever the board seeds agent posts (the
  fixtures do); it now ignores `seed-discussion-*`. Same assertions.
- "No dead control": the known-handler list predated the Báo lỗi tab (v9) and the thread
  toggle (v12); it now accepts `report-tab`, `refresh-chat`, `data-rcat`,
  `data-report-close` and `data-thread`.
- New: (r) B1, (s) B2, (t) B3, (u) B4, (v) B5, (w) B6, (x) B7, (y) B8, (z) refresh button.
  `harness.js` gains `del`, `admin.mjs` gains `updateDoc` (dotted partial update).
- B8 compares with `tests/b8-baseline.json` (measured at `1e331a3` on the same VM). The
  numbers are machine-dependent: re-measure the base on another machine before comparing.

Assets `?v=13` (both tags); `motion.js?v=13` and `live.js?v=13` in the imports too, so a
cached v12 module is never mixed with the v13 app; report `appVersion: "v13"`.

**Lessons (this round).**
- v12's collapse shipped as "PASS by code" with its test never run, and the toggle never
  rendered -> a change is PASS only with a `last-run.json` that shows its test green.
- Two old tests were red at base for test reasons (a hard-coded message count; a button
  inventory not updated when Báo lỗi was added) -> when adding seed data or a control, run the
  whole suite and update inventory tests in the same commit.
- GSAP entrance tweens on a page of history forced one layout per node -> never tween nodes
  that render off screen; cap entrance motion per render.

## v14 — threads collapsed by default (owner request, 2026-11-07)
Owner: "fix nút thu gọn chỗ chat với agents, mặc định là thu gọn sẵn, ai muốn xem mới bấm cho bung ra". Change (app.js only): the session set is inverted — `expandedThreads` now holds the threads the reader opened; every thread renders collapsed until its toggle is clicked. Replying into a thread (Trả lời button or sending the reply) opens that thread, so your own reply and the team's answers under it are never hidden from you. Choices are per-session only: a fresh page load starts all collapsed again. Tests (q) and (t) rewritten to the new spec: (q) asserts the collapsed default, (t) asserts arrivals keep a closed thread closed (count follows, acks uncounted) and an opened thread open. appVersion v14, assets ?v=14.

## v15 addendum (2026-11-08 — phone density)

- Owner: "kích cỡ hiện tại xem trên điện thoại hơi lớn quá". Researched platform sizes first,
  then applied them to phones only (`@media (max-width: 47.99rem)`); desktop is unchanged.
  - Apple HIG Typography (Dynamic Type, Large/default): Body 17 pt, Title 3 20 pt, Title 2
    22 pt, Subhead 15, Footnote 13; iOS default 17 pt, minimum 11 pt.
  - Material 3 type scale: Body Large 16, Body Medium 14, Title Large 22, Headline Small 24.
  - Web mobile guidance: body 16 px with ~1.5 line height; inputs ≥ 16 px (iOS Safari zooms
    smaller ones).
  - Touch targets: 44 pt (Apple), 48 dp (Material), 44 × 44 CSS px (WCAG 2.5.5 AAA), 24 px AA floor.
- What was too big (measured at 390 px): line height 1.6; 18 px for proposal titles, vote
  buttons, D titles and D intros (above iOS's 17 pt body); 50 px vote buttons; 24 px card
  padding on a 16 px page margin. The first screen held the title and one vote row.
- Phone values now: line height 1.5 (headings 1.25); `--fs-md` 17 px, `--fs-lg` 20 px; body
  and composer stay 16 px; section leads 15 px; vote buttons 44 px / 16 px text; title card
  padding 16 px; plan, proposal, decision and message cards 12–16 px; table cells 10/12 px;
  section gap 24 px. All touch targets still ≥ 44 px.
- Measured (synthetic fixtures, emulator, reduced motion): page height 4160 → 3699 px at
  390 px (−11%), 4145 → 3703 at 360, 4100 → 3691 at 412; proposal card 590 → 516 px; title
  card 256 → 225 px; plan heading 329 → 282 px from the top; table width +8 px. The first
  screen at 390 px now shows all three vote rows.
- Assets `?v=15`; `appVersion: "v15"`. Suite 39/39.
