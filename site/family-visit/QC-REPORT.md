# Family Visit: QC report

## v4 (branch `family-visit-v2`, 2026-11-07): "ba mẹ", round back-to-top, one chat with agent topics

| Check | Result | Evidence |
|---|---|---|
| One chat only | PASS | New test: a message in a legacy thread is never shown; no tabs; every post is stored in `threads/general`. |
| Agent topics | PASS | Tags render ("Vé máy bay"); filter chips "Tất cả / Vé máy bay (2) / Ngân sách (1)"; a reply inherits its parent's topic; filtering shows one topic; posting while filtered resets to "Tất cả". `v3-chat-topics-1280.png` |
| Back-to-top: round glass arrow, ≥ 44 px, avoids the composer and vote buttons | PASS | 52 × 52 px; back-to-top QC (0 overlaps in 4 positions). `back-to-top-360.png` |
| "Ba mẹ" everywhere | PASS | `grep` finds no "bố mẹ" in the page, the scripts, the tests, or the fixtures. |
| Vietnamese audit with topic chips on screen | PASS | 2,850 interface words, 0 English (place names in topic labels allowed: San Jose, New York, Niagara, Pennsylvania). |
| Full suite | PASS | 26 of 26. |

Handoff notes for Muse: `MUSE-HANDOFF.md`.

---

## v3: liquid glass, GSAP, readable D section, Google Sans (branch `family-visit-v2`, 2026-11-07)

`node site/family-visit/tests/run.mjs --qc` passed 25 of 25 against the emulator, with Vietnamese fixtures (screenshots in `FV_QC_DIR`, outside the repo).

| Check | Result | Evidence |
|---|---|---|
| GSAP core + ScrollTrigger + Flip + SplitText + ScrollToPlugin + CustomEase load and run | PASS | QC "liquid glass + GSAP": all six present, 8 ScrollTriggers live. |
| Glass surfaces render | PASS | The plan card computes `backdrop-filter: blur(22px) saturate(1.8)`. `v3-dock-390.png`, `v3-details-open-390.png`. |
| Google Sans renders Vietnamese | PASS | `document.fonts.check('16px "Google Sans"', "ấ ở ữ")` is true. |
| Floating section bar | PASS | Hidden at the top, shown after scrolling. Tapping "Chi tiết D" scrolled to the section and moved the active pill (`aria-current`). |
| D section: chips, badge + topic, pill, intro, conclusion, folded details | PASS | Details open and close (Flip). A table D-link opens the card it lands on (phone pass, 360 and 390 px). The fidelity check still matches every topic, question, intro, status, resolution, and option to the data, character for character. |
| Same page with GSAP blocked, and with reduced motion | PASS | "Full flow with the GSAP CDN blocked" (the route blocks core and every plugin). Full-page screenshots run with reduced motion. |
| Vietnamese audit, touch targets, no horizontal scroll, layout order | PASS | 2,754 interface words with 0 English; every control ≥ 44 px measured at rest; scrollWidth 360 / 390; opens at scrollY 0. |
| Offline sign-out | PASS (fixed bug) | Previously a quick reload could come back signed in, and an offline reload hit the browser's error page. Now it stays signed out, waits on the sign-in screen offline, and reloads itself when back online (5 of 5 repeated runs green). |
| Console clean | PASS | The GSAP unit warning from the glass highlight is fixed; 0 errors in the sign-in, post, reload cycle and in the GSAP feature test. |
| Real-phone feel of blur and motion (frame rate, battery) | BLOCKED-LIVE | A headless browser cannot judge smoothness on a real iPhone or Android. Muse should check on a phone. |

---

## v2: Vietnamese UI, one chat, Plan, then Chat, then Details (branch `family-visit-v2`, 2026-11-07)

Evidence: `node site/family-visit/tests/run.mjs --qc` passed 24 of 24 (12 end-to-end, 12 QC), run against the Firebase Local Emulator Suite. Per-test detail is in `tests/last-run.json`.
- **Fixtures:** read from `FV_FIXTURES_DIR`, outside the repo. They are the v1 seed files plus test-only `intro` text for D1–D4 and `resolved: true` on D1.
- **Screenshots:** now written outside the repo (`FV_QC_DIR`, default `../family-visit-qc/`), because they show the seeded plan and `site/` is published. The eight v1 screenshots in `site/family-visit/qc/` showed the real plan, including prices, so they were deleted on this branch. They remain in `main`'s git history (see the open risk below).

| Check | Result | Evidence |
|---|---|---|
| (a) No user-visible English left in the interface, runtime audit | PASS | QC "Vietnamese UI audit". Every visible text node plus every `aria-label`, `title`, and `placeholder` on 6 screens: sign-in, denied, board, reply + delete confirm, edit, and offline. That is 2,460 words with 0 English hits. Database content (marked `data-c`) is excluded. |
| (a) Same check on the source, static grep | PASS | Every string literal in `app.js`, `gate.js`, `live.js`, `motion.js`, and `index.html` was scanned with the same word list. Of 24 hits, none is visible text; each is an intentional exception listed below. |
| (a) `<html lang="vi">`, vi-VN dates, Vietnamese relative times | PASS | The audit asserts `lang="vi"`. Dates render as "7/11 lúc 09:14"; relative times as "vừa xong", "N phút trước", and "N giờ trước". |
| (a) Agent role names through the display map | PASS | Seeded agent posts render "Điều phối" and "Vé & Di chuyển" (the QC seed check compares them against the map). The data still holds the English role ids. |
| (b) Emulator suite re-run green | PASS | 12 of 12 end-to-end tests, including (a) live two-session sync, (b) whitelist, (c) offline exactly once, (d) malformed writes, (e) reconnect and polling, (e2) offline snapshot, and (f) the 3-of-3 gate. |
| (b) Vote gate after the decisions section moved | PASS | Test (f): no change at 2 OK (rows JSON and table HTML byte-identical), applied at the 3rd OK with version bumps, and one No froze the proposal with the table byte-identical. Forged applies were refused. |
| (c) 360 px: plan first, chat by scrolling, D-link to the card | PASS | Opened at scrollY 0 with "Kế hoạch chuyến đi" at 244 px. The composer is reachable by scrolling. Tapping D3 in the table (tap area 53 × 48 px) brought `#decision-D3` into the top half of the screen and highlighted it. Evidence: `v2-first-screen-360.png`, `v2-dlink-target-360.png`. |
| (c) 390 px: same | PASS | Same results, scrollWidth 390. |
| (c) Layout order at 360 and 1440 px | PASS | At 360 px: title 0, plan table 1040, chat 1682, details 2526. At 1440 px: 0, 699, 1199, 2069. Both opened at scrollY 0. Evidence: `layout-360.png`, `layout-1440.png`. |
| (c) No horizontal page scroll, targets ≥ 44 px | PASS | scrollWidth 360 / 390. Every visible control, the D-links included, is ≥ 44 × 44 px. |
| (d) Sign-in gate | PASS | Test (b): non-member refused, plus unverified-email and non-Google sign-ins. |
| (d) Realtime two-session sync | PASS | Test (a): seen 524 ms after send, no reload. |
| (d) Sign-out purge | PASS | Offline sign-out reached the sign-in screen in 189 ms. After reload: 0 `fv-*` keys, 0 rendered rows or messages. |
| One chat, no tabs | PASS | The presence/reply test asserts no tab elements, and every post lands in `threads/general`. |
| Decision cards render `intro`; resolved styling keyed on `resolved === true` | PASS | The QC seed check compares each card's intro to the data and the resolved class to `resolved === true \|\| status === "resolved"`. D1 shows the "Đã chốt" badge. |
| GSAP blocked, console clean, noindex, isolation, back-to-top | PASS | Same v1 QC tests re-run: all pass. |
| Live data is fully Vietnamese | BLOCKED-LIVE | This session cannot read the live project. Tests use the English v1 fixtures, which is why English shows inside data cells in the screenshots. Muse should eyeball the live page. |

**Intentional English exceptions (not visible as interface text):**
- Proper nouns: John, Nickie, Johnny, Google, Visa (part of the owner-specified role name "Visa & Giấy tờ"). Also CCCD (a Vietnamese abbreviation) and the codes D1–D4.
- Code only: CSS class names (`vote-row`, `msg--agent`…), template expressions, and the English agent role ids used as data keys (`Flights & Travel` → "Vé & Di chuyển").
- The stored 72-hour reminder text is English because `firestore.rules` pins that exact template. It is never shown: the chat renders it as "Nhắc nhở: đề xuất “…” đã chờ bỏ phiếu hơn 72 giờ…". Changing the rules was avoided, as the brief asked.

**Decisions to re-verify live:** see `WORK-LOG.md` section 6.
- The typeface changed to Be Vietnam Pro, because the v1 face has no Vietnamese subset.
- Proposals show in the one chat whatever thread they were filed under, and the pending strip shows all of them.
- 72-hour reminders are only visible if the proposal's `threadId` is `general`.
- The decisions section is a plain section, not a collapsible `<details>`, so D-links always land on a visible card.

**Open risk for the owner:** the deleted v1 screenshots (plan with prices) and the v1 `board.json` remain readable in the repo's git history on GitHub. Removing them needs a history rewrite of `main`, which is the owner's or Muse's call.

---

## v1 (branch `family-visit-app`)

Note added in v2: the `qc/*.png` files referenced below were removed from the repo (they showed the real plan). Later screenshots are written outside the repo.

Self-QC of `site/family-visit/` on branch `family-visit-app`, 2026-11-07. Evidence comes from `node site/family-visit/tests/run.mjs --qc` (22 of 22 passing; per-test detail in `tests/last-run.json`). Screenshots are in `qc/`. Everything ran against the Firebase Local Emulator Suite. Anything that needs the live project or a real phone is marked BLOCKED-LIVE, not PASS.

## Checks

| Check | Result | Evidence |
|---|---|---|
| Layout order title, then timeline table, then chat, then back-to-top, at 360 px | PASS | QC layout test: title top 0, table 921, chat 3060 px. `qc/layout-360.png` |
| Same order at desktop width (1440 px) | PASS | Title 0, table 645, chat 2040 px. `qc/layout-1440.png` |
| Back-to-top appears after scrolling and returns to the top | PASS | Hidden at the top, shown after scrolling; the click smooth-scrolled to `scrollY` 0. `qc/back-to-top-360.png` |
| Back-to-top never overlaps the composer or the vote buttons | PASS | 0 overlaps in 4 positions: page bottom with the composer in view, and each vote-button row placed at the bottom edge of a 360 px screen. |
| Every button wired, no dead controls | PASS | All 28 buttons map to a handler (ids, `data-vote`, `data-action`, `data-thread`, or form submit). The other members' OK/No buttons are disabled by design (see decision 14). |
| No horizontal page scroll at 360 px | PASS | Measured `document.documentElement.scrollWidth` = 360 at viewport 360, with a pending proposal and a 300-character unbroken message on screen. |
| No horizontal page scroll at 390 px | PASS | Measured `scrollWidth` = 390 at viewport 390. |
| Timeline table on narrow screens | PASS | It sits in its own horizontal scroll region with the Date column `position: sticky`; the Date cell did not move when the region scrolled 300 px. |
| Touch targets ≥ 44 px | PASS | Every visible button, link, summary, and textarea is ≥ 44 × 44 px at 360 px. The vote buttons are 48 px tall and half the card wide each. `qc/vote-360.png` |
| Composer font ≥ 16 px (no iOS focus zoom) | PASS | Computed font-size 16 px. |
| One complete vote at 360 px | PASS | John's OK stored (`votes.john = "ok"`) from a 360 px viewport. `qc/vote-360.png` |
| One chat message sent at 360 px | PASS | Stored with `authorId: "john"`. `qc/message-360.png` |
| Full flow with the GSAP CDN blocked | PASS | `window.gsap` undefined. A message was delivered live to a second session, the third OK applied a proposal, the table updated, and back-to-top worked. No errors besides the blocked script request. |
| No placeholder text | PASS | 0 matches for lorem / ipsum / TODO / TBD / FIXME / xxx / placeholder in the rendered text. The composer's hint "Write to the family and agents" is instruction copy, not filler. |
| Seed prices and dates byte-identical to `board.json` | PASS | Title, 4 decisions (headings, statuses, resolution, all 12 price strings with their check dates), the 2 seeded agent posts (role, time, topic, text), and the 4 rows of `timeline-seed.json` match character for character. |
| No whitelist address or sensitive data visible | PASS | 0 email-shaped strings in the rendered HTML while signed in. Signed-out and denied visitors see no plan content (tests b, e2). Committed files contain no real address: rules and config hold only SHA-256 hashes, and tests use `@family-visit.test` addresses. |
| Privacy reminder under the message box | PASS | "Never post home addresses, ID or passport numbers, or booking codes here." `qc/message-360.png` |
| Console free of errors during sign-in, post, reload | PASS | 0 console errors and 0 page errors (0 console lines at all). Sign-in used the emulator's Google credential, not the live popup. |
| noindex, not linked, not in the sitemap, no robots.txt Disallow | PASS | `<meta name="robots" content="noindex, nofollow">` present; no file outside `site/family-visit/` mentions the path. |
| (a) Two-session live messaging | PASS | Test (a): seen 526 ms after send, no reload. |
| (b) Non-whitelisted user denied read and write | PASS | Test (b): 8 denied operations, including unverified-email and non-Google sign-ins. |
| (c) Offline message delivered exactly once | PASS | Test (c): 0 server docs while offline, then exactly 1 doc and 1 rendered copy per session. |
| (d) Malformed writes rejected | PASS | Test (d): 19 denied writes, 2 valid controls accepted. |
| (e) Listener killed: reconnecting, then polling, never blank | PASS | Test (e) and test (e2). `qc/e-polling-fallback.png`, `qc/e-offline-snapshot.png` |
| (f) Gate: 2 OK no change, 3rd OK applies, one No freezes | PASS | Test (f): rows JSON and table HTML byte-identical at 2 OK and after the No; applied at 3 OK with version bumps. `qc/f-applied.png` |
| 72-hour reminder exactly once | PASS | Reminder test: 1 document, fixed text; a second, an early, and a free-text reminder were refused. |
| Real Google sign-in (popup, and the redirect fallback on phones) | BLOCKED-LIVE | Needs the live project and authorized domain; the emulator signs in with a test credential. |
| Rules deployed to `family-visit-81a60` | BLOCKED-LIVE | Not deployed from here (no project credentials). The same rules text is what the emulator ran. |
| Two real devices on real networks | BLOCKED-LIVE | Two emulated sessions only. |
| Composer stays above the on-screen keyboard; safe-area insets | BLOCKED-LIVE | Built with `100dvh`, `interactive-widget=resizes-content`, and `env(safe-area-inset-*)`, but a headless browser has no on-screen keyboard or notch. |
| Dark mode | Not checked | Tokens are defined for `prefers-color-scheme: dark`; no dark-mode screenshot review was done. |

## BLOCKED-EXTERNAL

- **Agent writes need an Admin SDK service account** (Muse side). Proposals, pinned summaries, decisions, the heartbeat, and agent posts are not writable by signed-in people by design. The data contract is in `WORK-LOG.md` section 3.
- **Live seeding:** `planRows/*` and `planMeta/table` must be created on the live project from `timeline-seed.json` before the first proposal can apply. Until then the page shows the seed rows read-only.
- **Rules deploy:** `firestore.rules` must be deployed by someone with access to the Firebase project.

## Decisions to re-verify live

All are explained in `WORK-LOG.md` section 2, with the alternatives that were rejected.
1. Whitelist stored as SHA-256 hashes, plus required `email_verified` and the `google.com` provider.
2. Test rules are derived from the production file by swapping hashes.
3. Agents write via the Admin SDK only.
4. The 72-hour reminder is client-triggered: fixed id, fixed text, enforced once by the rules.
5. The third OK applies the change in a transaction from the voter's browser, checked row by row in the rules. At most 4 rows per proposal.
6. A stale proposal cannot apply; voters are told to vote No.
7. Voting needs a connection; messages queue offline.
8. Presence is a Firestore heartbeat: "online" lapses after 90 s, "away" after 10 min.
9. Unread markers and drafts are per-device; sign-out clears all local data and the Firestore cache.
10. The offline snapshot is shown only on a device that signed in before.
11. Health checks: a canary listener; backoff 1 to 30 s; polling every 30 s after 60 s of reconnecting.
12. Timeline seed rows are built from the DATA section and D1 only.
13. On mobile, the table scrolls inside its region with a sticky Date column.
14. Vote buttons are shown for all three members, but only your own pair is enabled.
15. Back-to-top avoidance: it lifts above obstacles or hides.
16. The emulator uses project id `demo-family-visit`.
17. GSAP 3.13.0 and Firebase 11.10.0 load from CDNs, as the brief requires.

## Independent review

A separate reviewer read the rules and client code. It found no rules hole (forged votes, fewer than 3 OKs, frozen edits, out-of-transaction row writes, agent impersonation, non-member reads) and no XSS path. Its client findings and what was done:

| Finding | Done |
|---|---|
| Sign-out hung offline (awaited a presence write) | Fixed: never waits on the network; clears the DOM, localStorage, and the Firestore cache, then reloads. New test "sign out works offline…" |
| Content stayed in the hidden DOM after sign-out or denial | Fixed: rendered content is cleared |
| "Load earlier" could stop for good after an offline cache read | Fixed: reads from the server only; on failure it offers a retry |
| Stale or oversized proposals swallowed the 3rd OK with a vague error | Fixed: clear messages that say to vote No |
| A due reminder allowed free text under the Coordinator label | Fixed: the rules pin the exact text; a free-text attempt is refused (tested) |
| A reminder failure blocked retries until reload | Fixed: retries unless the server refused it |
| Presence writes queued offline; "away" went stale too fast | Fixed: heartbeat only while live; "away" lasts 10 min |
| One refused listener sent a member to the denied screen | Fixed: token refresh and one retry first |
| Seed files fetched before sign-in | Fixed: loaded only after member sign-in, or for the offline snapshot |
| Other members' disabled vote buttons | Kept: the brief requires OK / No for each of the three |
| `board.json`, `timeline-seed.json`, and these reports are publicly downloadable from GitHub Pages | Open risk for the owner, see below |

## Open risk for the owner

- **The brief puts `board.json` (and the reports) in `site/family-visit/`, which GitHub Pages serves to anyone who knows the URL.** noindex keeps the files out of search results but does not hide them. Exposed: route, dates, quoted prices, and the open B1/B2 visa question. Not exposed: addresses, documents, and booking codes.
- **Unsalted hashes can be guessed.** Someone who guesses a candidate address can confirm it against the published hash. Allow-listing by Firebase UID would avoid this, but the UIDs only exist after each person's first sign-in.

## v5 (branch `family-visit-v5`, 2026-11-07): member name chips in the header

| Check | Result | Evidence |
|---|---|---|
| Name chips render | CODE-REVIEWED, live E2E pending | `renderPresence()` emits dot + visible name + visible status word per member; `.pres--me` + "Bạn" badge for the signed-in member. Emulator suite not run on the build machine (no Java/firebase-tools/Playwright); suite assertions were extended for the chips and `node --check` passes. |
| Everything else unchanged | PASS by diff scope | v5 diff touches only `app.js` (renderPresence), `app.css` (.pres block), `tests/e2e.mjs`, and these reports. |

## v6 (branch `family-visit-v6`, 2026-11-07): sign-out becomes a real button; "Bạn" badge removed

| Check | Result | Evidence |
|---|---|---|
| Sign-out reads as a button | CODE-REVIEWED, live E2E pending | `#signout` switched from `.btn--quiet` (transparent) to `.btn--signout` (solid glass bg, strong border, 44px). |
| No "Bạn" badge | CODE-REVIEWED, live E2E pending | `.pres-you` removed from render + CSS; e2e asserts its absence. Self chip keeps the pine highlight only. |

## v7 (branch `family-visit-v7`, 2026-11-07): name cards reverted to v4; sign-out card button kept

| Check | Result | Evidence |
|---|---|---|
| Presence back to v4 rendering | PASS by construction | `renderPresence()` + `.pres` CSS restored byte-for-byte from the v4 commit (9792d43); live E2E after merge confirms visually. |
| Sign-out card button retained | PASS by diff scope | v7 diff touches only the presence code/CSS and the test file; `.btn--signout` untouched. |

## v8 (branch `family-visit-v7`, 2026-11-07): cache-busted asset URLs

| Check | Result | Evidence |
|---|---|---|
| Served app.js is the v4-presence build | PASS | Fresh fetch of the served `app.js` shows `renderPresence()` with name span + sr-only status; zero `pres-you` / `pres--me` in the file. |
| Versioned asset tags | PASS by diff | `index.html` references `app.css?v=8` / `app.js?v=8`; future releases must bump the number (standing rule, WORK-LOG v8). |

## v9 (branch `family-visit-v9`, 2026-11-07): Báo lỗi side tab (owner's kiểu C, liquid glass)

| Check | Result | Evidence |
|---|---|---|
| Rules deployed with issues block | PASS | Firebase Rules API: ruleset c69774f8 content verified to contain `match /issues/{iid}` + validIssue; release cloud.firestore points at it. |
| Watcher detects issues | PASS (dry run) | Hook dry run on the new script returns the combined silent decision with an empty queue; live wake proven in the post-merge E2E below. |
| Emulator suite | NOT RUN on this VM (no Java/firebase-tools/Playwright) | New e2e test (n) added for the report flow; suite run still owed on the dev PC, same standing note as v5–v8. |
| Live E2E (tab → sheet → submit → team wake → resolve → regression) | See post-merge verification in WORK-LOG/QC addenda of the merge commit | Performed on the live page after merge, per the feature-change protocol. |

## v9 live verification (2026-11-07, after merge — feature-change protocol)

| Check | Result | Evidence |
|---|---|---|
| Tab hidden when signed out | PASS | Browser E2E: sign-in screen shows no Báo lỗi control. |
| Tab on the board | PASS | Verbatim: "Vertical, translucent/glass tab reading 'Báo lỗi' at the right edge, vertically in the middle." |
| Sheet + categories | PASS | Heading "Báo lỗi"; chips exactly "Hiển thị sai / Không bấm được / Nội dung sai / Khác". |
| Offline guard | PASS | First submit while reconnecting was refused with "Cần có mạng để gửi báo lỗi…" and nothing was written; after reload (Trực tuyến) the submit succeeded. |
| Submit → Firestore | PASS | Confirmation quoted exactly: "Đã gửi. Nhóm trợ lý sẽ kiểm tra và trả lời ngay trên bảng này." Issue doc landed once: reporter john, category display, status open, appVersion v9. |
| Team pipeline | PASS | Watcher woke with the issue in its payload; the sweep posted a Coordinator acknowledgement on the board (Vietnamese), triaged it as John's labelled test, closed it `wontfix` with a note, queues clear. Test artifacts deleted afterwards. |
| Regression | PASS | First plan row verbatim "Khoảng Chủ nhật 20/12/2026"; planMeta version still 1; sign-out clears content and hides the tab. |

## v10 (branch `family-visit-v10`, 2026-11-07): reception acknowledgements + typing signal

| Check | Result | Evidence |
|---|---|---|
| Reception pass runs clean on the live DB | PASS | Direct run + hook dry run: `{"acked": [], "typing": false, "unprocessed": 0}` on the (genuinely empty) queue. |
| Acks don't satisfy the sweep | PASS by code | `pending()` excludes kind "ack" from its replied set; AGENT-LOOP.md updated to match. |
| Emulator suite | NOT RUN on this VM (standing limitation) | New e2e test (o) seeds an ack + typing doc and asserts the receipt pill and typing bar render and follow state. |
| Live E2E (post → ack ≤ ~30 s → typing bar → substantive replies → signals clear) | See the post-merge verification note appended after the live run | Performed on the live page after merge, per the feature-change protocol. |

## v11 (branch `family-visit-v11`, 2026-11-07): thread stacking

| Check | Result | Evidence |
|---|---|---|
| Grouping logic | PASS by code review | Root-following sort in `renderMessages()`; orphans fall back to root position; category-filtered parents fall back the same way. |
| Emulator suite | NOT RUN on this VM (standing limitation) | New e2e test (p) seeds root A, unrelated root B, then a later reply to A, and asserts DOM order A, reply, B plus the indent class on the reply only. |
| Live E2E | See the post-merge verification note appended after the live run | Thread position checked on the live page with verbatim quotes + Firestore cross-check, per the feature-change protocol. |
| Status-cell wrap fix (owner screenshot) | PASS by code | Pill → block tag with balanced wrap + 11rem column minimum; verified visually in the post-merge live E2E (status texts quoted verbatim, fully visible). |

## v12 (branch `family-visit-v12`, 2026-11-07): thread collapse toggle

| Check | Result | Evidence |
|---|---|---|
| Toggle logic | PASS by code | Post-diff management in `renderMessages()`: counts real replies per thread root; hides replies of collapsed roots; root itself never hidden. |
| Emulator suite | NOT RUN on this VM (standing limitation) | New e2e test (q): root + 2 replies (one nested) — toggle collapses both, expands both, root stays visible throughout. |
| Live E2E | See the post-merge verification note appended after the live run | Collapse/expand exercised on the live page against a real test thread, per the feature-change protocol. |
| Report-tab transparency (owner report) | PASS by code | Tab gradient alpha cut from 72%→32% max with blur retained; verified visually in the post-merge live E2E (tab over table content, text beneath visible through it). |

## v13 (branch `family-visit-v12`, 2026-11-07): static route rail, smooth chat scroll, "Làm mới", East Coast backdrop, test pack A/B

Everything below ran against the Local Emulator Suite (`demo-family-visit`, auth :9099,
firestore :8080) through `tests/run.mjs`. Nothing touched the live project or the live board.
Fixtures: `FV_FIXTURES_DIR` pointed at **synthetic** fixtures written for this run (same shape
as the private `board.json` / `timeline-seed.json`: 4 rows incl. `san-jose`, D1–D4, 2 seeded
agent posts; placeholder text, no real prices or dates), because the private fixtures are not
on this VM. Screenshots are in `FV_QC_DIR`, outside the repo. JVM run with
`-Djava.net.preferIPv4Stack=true`.

### Keeploop gate (machine-readable)

| Run | Code | Result | File |
|---|---|---|---|
| Base, suite as it stood | `1e331a3` | **27/29** | `tests/evidence/last-run-base-1e331a3.json` |
| Base, with the new cases | `1e331a3` + new tests | 31/39 | `tests/evidence/last-run-base-1e331a3-with-new-tests.json` |
| v12 as committed, case (q) | `55d4ace` | 0/1 | `tests/evidence/last-run-v12-55d4ace-case-q.json` |
| **After (v13)** | this branch | **39/39** | `tests/last-run.json` |

- Base reds, both test defects, not app defects: (p) waited for exactly 3 `li[data-key]` and the
  baseline seeds the board's 2 agent posts (red with any fixture that has posts); "no dead
  control" had a button inventory older than the Báo lỗi tab. Fixed in the tests, same assertions.
  (A first base run gave 26/29: one extra red came from my fixture's `topic: null`; the fixture
  was corrected and the base re-run. Log kept outside the repo.)
- All 29 base cases are green after; no case that was green at base turned red. Final run 2026-11-07T21:50:57.229Z: 39 passed, 0 failed, in one run.
- Intermittent: (n) Báo lỗi was red once at base and once in a v13 run. Root cause found and
  fixed (an app bug, not the test): the sheet refused to send while the connection was still
  "connecting" right after sign-in, even online. Repro with the emulator stream slowed by
  400 ms: 4/4 refused before, 4/4 sent after. Back-to-top overlap (1 of 4 positions) was red
  once in the base run with new tests and green in every other base and v13 run; not reproduced,
  not changed.
- Durations (ms per case) are in each `last-run.json`; the full `--qc` run takes about 5 min
  on this 4-vCPU VM, (y) alone about 90 s. No case was cut.

Also changed in v13 at the owner's request mid-task: the "Làm mới" button (case (z)) and the
East Coast backdrop palette (visual; screenshots `layout-360.png` / `layout-1440.png` before and
after in the QC kit). The full suite ran after the palette change.

### Per case

| ID | Case | Result | Evidence |
|---|---|---|---|
| A1 = (f) | 3rd OK applies at once; planRows new value, planMeta +1, proposal applied | PASS | `last-run.json` (f): "2 OK: … identical … 3rd OK: row applied (version 2), table version 2" |
| A2 = (f) | One No freezes; no further votes, no forced apply (forged client writes) | PASS | (f): "status rejected … server refused votes/edits on the frozen proposal, forged applies refused" |
| A3 = (o) | Reception ack line + typing bar | PASS | (o) |
| A4 = (p) | Reply directly under its root, indented | PASS (test fixed, see above) | (p): order root-a, reply-c, root-b |
| A5 = (q) | Collapse toggle "Thu gọn/Xem N trả lời", root never hidden, acks not counted | **FAIL on v12 → PASS on v13** | v12 `55d4ace`: toggle never appears (`threadKey` never set). v13: (q) and (t) green |
| A6 = (n) | Báo lỗi files exactly 1 open issue under the reporter | PASS (after the connecting-race fix) | (n); repro above |
| A7 = (a)(c)(e) | Live sync; offline post exactly once; reconnect/polling, never blank | PASS | (a), (c), (e), (e2) |
| A8 = QC | No h-scroll 360/390; ≥ 44 px; order Plan → Thảo luận → Chi tiết D; Vietnamese UI; no email; noindex | PASS | QC rows; `layout-360.png`, `layout-1440.png` |
| B1 = (r) | Root → ack → 2 role replies stay one block; a root posted in between sits after; same after reload | PASS | (r): DOM order root1, r-ack-1, r-reply-coord, r-reply-scout, root2; replies indented 40 px; `r-thread-block.png` |
| B2 = (s) | Applied proposal shows in Nickie's open session without reload | PASS | (s): new value 253 ms after John's third OK; planMeta 1 → 2; navigation count unchanged; `s-nickie-live-plan.png` |
| B3 = (t) | Collapsed thread stays collapsed on a new reply and on an ack; count follows | PASS (v13) | (t): "Xem 2" → new reply → "Xem 3", aria-expanded=false → ack → still 3 |
| B4 = (u) | 3-sentence pinned summary never scrolls in its box, 360/390 | **FAIL at base → PASS** | base: scrollHeight 128 > clientHeight 116; v13: 128 ≤ 128 both widths; `u-summary-360/390.png` |
| B5 = (v) | Rail continuous + static, no transform, no `--rail`, GSAP blocked too | **FAIL at base → PASS** | see Part 1 below; `v-rail-*.png` |
| B6 = (w) | Change own vote while pending | PASS (behavior recorded) | Supported: OK → No (rules `prev == 'ok' && mine == 'no'`, UI keeps No enabled); that No freezes like A2. Not supported: No → OK, OK → pending. No behavior changed. |
| B7 = (x) | Host writes planRows/planMeta directly | PASS | (x): 8 attempts, all `permission-denied`; rows and meta byte-identical |
| B8 = (y) | Chat scroll, 390 px, 4× CPU, ~120 messages | **PASS** | see Part 1b below |
| new = (z) | "Làm mới" button | PASS | (z): Button "Làm mới" 124x44 px; read 33 messages from the server (fromServer=true); scrolled the newest agent message into view (true); status "Đã cập nhật lúc 21:48."; offline tap showed the "cần có mạng" note and the button stayed usable.; `z-refresh-390.png` |

B1 note (required): in production the reception desk and the agent loop write these documents
and only watch the live project. In the emulator their writes are simulated with admin access
in the same document shape (`authorKind: "agent"`, `role`, `category`, `replyTo`, `kind: "ack"`),
because rule 1 forbids testing on the live app. (r) checks the display and data layer, not the
real agents' latency.

### Part 1 — route rail, before / after (B5)

| | Base `1e331a3` | v13 |
|---|---|---|
| 360 px, page not scrolled | `transform: matrix(1, 0, 0, 0.586667, 0, 0)`; `--rail: 0.586667` inline on the table | `transform: none`; no `--rail` anywhere in the chain |
| Body pixel rows on the line (dots hidden, line column vs. same cell +5 px) | 360: 277/379 · 1440: 277/380 · 390 GSAP-blocked dark: 277/379 | 360: **379/379** · 1440: **380/380** · 390 GSAP-blocked dark: **379/379** |
| Code | `railDraw`, `railTrigger`, `--rail`, first/last-row clamps | none (checked by the test) |

Screenshots: `v-rail-360.png`, `v-rail-1440.png`, `v-rail-390-gsap-blocked-dark.png` (base copies
from the base run, v13 copies from the final run).

### Part 1b — B8 numbers (medians of 3 runs, same VM, same scenario)

| | Base `1e331a3` | v13 |
|---|---|---|
| Long-task total | **2039 ms** | **63 ms** |
| Longest task | 710 ms | 80 ms (limit 200) |
| Long tasks | 12 | 1 |
| Frames > 50 ms | 8 | 3 |
| Script / layout / style | 601 / 1557 / 266 ms | 408 / 320 / 58 ms |

Criteria: no long task > 200 ms (met), total ≤ 50% of base (met: 97% less). Base file:
`tests/b8-baseline.json`; v13 file: `b8-metrics-v13.json` in the QC folder. Screenshots
`y-chat-390-base-1e331a3.png` / `y-chat-390-v13.png` show the same glass UI. Honest limits: the
emulator VM with software rendering is a proxy; blur cost lives on the GPU/compositor and does
not show up as main-thread long tasks. The owner's phone is the final judge after deploy.

## v15 (branch `family-visit-v15`, 2026-11-08): phone density

| Check | Result | Evidence |
|---|---|---|
| Full emulator suite (`--qc`) after the change | PASS, 39/39 | `tests/last-run.json` |
| Touch targets ≥ 44 px, composer 16 px, no horizontal scroll at 360/390 | PASS | QC rows in the same run |
| Sizes match the researched references (phones) | PASS | Computed: body 16/24, h1/h2 20/25, proposal summary and D titles 17, vote 16 px text in 44 px buttons, footnotes 13 |
| Page shorter on phones | PASS | 390 px: 4160 → 3699 px; 360: 4145 → 3703; 412: 4100 → 3691 (measure script, reduced motion, synthetic fixtures) |
| Desktop unchanged | PASS by code | All overrides sit in `@media (max-width: 47.99rem)`; QC layout check at 1440 px green |
| Live check on the owner's phone | TO DO after deploy | Owner judges the final size |
