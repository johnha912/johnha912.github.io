# Family Visit: emulator test report

## v4 re-run (branch `family-visit-v2`, 2026-11-07)

**13 of 13 end-to-end tests and 13 of 13 QC checks pass.** The new end-to-end test, "one chat only", covers legacy-thread exclusion, topic tags, the topic filter, topic inheritance on replies, and that posting while filtered still goes to `general`.

## v3 re-run (branch `family-visit-v2`, 2026-11-07)

**12 of 12 end-to-end tests and 13 of 13 QC checks pass**, with Vietnamese fixtures and test strings. The offline sign-out test now also checks that the page stays on the sign-in screen while offline, reloads itself on reconnect, and comes back signed out. The new QC check covers the GSAP plugins, the glass, the font, the floating section bar, and the D details toggle.

## v2 re-run (branch `family-visit-v2`, 2026-11-07)

**Result: 12 of 12 end-to-end tests pass, plus 12 of 12 QC checks** (see `QC-REPORT.md`).

How to run v2. Fixtures and screenshots both live outside the repo:
```bash
export FV_FIXTURES_DIR=/path/to/family-visit-fixtures   # board.json + timeline-seed.json (private)
export FV_QC_DIR=/path/to/family-visit-qc               # screenshots (default ../family-visit-qc)
node site/family-visit/tests/run.mjs --qc
```

What changed in the suite for v2:
- Assertions read the Vietnamese interface ("Đang kết nối lại…", "mỗi 30 giây", "Bản lưu ngoại tuyến", "đã sửa", "Tin nhắn đã bị xoá", "Trả lời Nickie").
- Pagination and the reminder test use the single chat (`threads/general`). The reminder test also checks the Vietnamese rendering of the stored, rules-pinned reminder text.
- The per-thread unread test was replaced by a check that no topic tabs exist and that every post lands in `general`.
- New QC checks: the Vietnamese UI audit, and the phone pass for the new order with a D-link tap.

All results from the v1 table below still hold. In the final v2 run:
- (a) sync took 524 ms.
- (c) the offline message was delivered exactly once.
- (f) the gate was byte-identical at 2 OK, applied at the 3rd OK, and frozen by one No.
- Offline sign-out took 189 ms.

---

## v1

**Result: 12 of 12 end-to-end tests pass** (plus 10 of 10 QC checks, see `QC-REPORT.md`), run on 2026-11-07 against the Firebase Local Emulator Suite (Auth + Firestore). No live data was read or written.

## Setup

- **Emulator:** firebase-tools 15.35.0 on OpenJDK 21, project id `demo-family-visit` (the app switches to it automatically on localhost, so it can never reach the live project).
- **Rules under test:** the real `firestore.rules`, with the three production member hashes swapped for hashes of fake test accounts (`john@`, `nickie@`, `johnny@`, and `stranger@family-visit.test`). The runner refuses to start unless exactly three hashes were swapped.
- **Browser:** Chromium via Playwright. The Firebase JS SDK 11.10.0 and GSAP 3.13.0 load from their real CDNs. Pages are served from `site/` by the runner's static server on 127.0.0.1:8770.
- **Data:** each test starts from a cleared database seeded with the four rows of `timeline-seed.json`, table version 1, the eight topic documents, and an agent heartbeat.

## How to run

```bash
# Java 11+, Node 18+, Playwright with Chromium, and firebase-tools are required.
npm i -g firebase-tools            # or set FIREBASE_BIN=/path/to/firebase
node site/family-visit/tests/run.mjs          # end-to-end suite
node site/family-visit/tests/run.mjs --qc     # suite + QC pass (writes qc/*.png)
node site/family-visit/tests/run.mjs --serve  # emulator + page for manual checks
```
Results are written to `tests/last-run.json`.

## Results

| # | Test | Result | Evidence |
|---|---|---|---|
| a | A whitelisted user posts and a second session sees it live | PASS | Nickie's session showed John's message 526 ms after send, with no page reload (navigation count unchanged). Exactly 1 document stored, `authorId: "john"`. |
| b | A non-whitelisted user is denied read and write | PASS | The stranger sees only "This Google account isn't on the family list". `permission-denied` on: reading timeline rows, messages, table meta, and presence; writing a message; writing presence; reading with an unverified email; reading with a non-Google (password) sign-in. |
| c | A message posted offline appears exactly once after reconnect | PASS | Offline: shown once locally as "sending…", 0 documents on the server after 2.5 s. Back online: "sending…" cleared, exactly 1 document (client-generated id) and exactly 1 rendered copy in both sessions, still 1 after a reload. |
| d | Malformed writes are rejected by the rules | PASS | 19 writes denied: oversized text (2,001 chars), empty text, missing `createdAt`, client-set timestamp, impersonating another member, posting as an agent, extra field, id mismatch, unknown topic, non-integer `clientCreatedAt`, editing someone else's message, deleting someone else's message, presence for another member, invalid presence state, direct timeline-row write, direct table-version bump, writing a topic summary, writing the agent heartbeat, creating a proposal. Controls: a valid message and an own edit were accepted. |
| e | Killing the listener connection shows reconnecting and fallback, never a blank page | PASS | Emulator traffic blocked for the session and the open stream dropped. The banner went to "Reconnecting…", then "Live updates are down. Checking for changes every 30 seconds." All 4 timeline rows and the page text stayed visible throughout (`qc/e-polling-fallback.png`). Unblocked: back to Live, banner gone. Uses `?timing=fast` (localhost only) to shorten the 10 s and 60 s thresholds. |
| e2 | Backend unreachable entirely | PASS | Firebase SDK CDN blocked on a device that had signed in: "Offline snapshot: the server can't be reached, so this is the last plan saved on this device…" with all 4 rows (`qc/e-offline-snapshot.png`). A device that never signed in gets the sign-in screen with "Can't reach Google sign-in right now…" and no plan content. |
| f | Confirmation gate | PASS | Two OKs: proposal still `pending`; `planRows` JSON and the table HTML byte-identical in all three sessions. Third OK: row written with `version: 2`, `appliedProposal` set, `planMeta/table.version` 1 to 2, the table updated live in another session (`qc/f-applied.png`). Second proposal, one OK then one No: status `rejected`; rows JSON and table HTML byte-identical; vote buttons gone. The server refused a later vote and an edit on the frozen proposal, a forged apply with only two OKs (proposal, table meta, and row in one batch), and a vote cast for another member. The table still showed the applied value. |
| 7 | 72-hour reminder is posted exactly once | PASS | Two live sessions, one pending proposal created 73 h ago: exactly 1 reminder document, with `reminderSent: true` and the fixed text. A proposal created 2 h ago was not reminded. The rules refused a second reminder, an early reminder, and a free-text "Coordinator" reminder. |
| 8 | Edit and soft delete | PASS | The edit showed "edited" in the other session. Delete kept the document (`deleted: true`, text cleared) and showed "Message deleted". |
| 9 | Chat pages of 50 | PASS | A topic with 62 messages rendered 50; scrolling to the top loaded the remaining 12. |
| 10 | Presence, unread markers, replies, drafts | PASS | Nickie shown online to John. The Budget tab got an unread marker when Nickie posted there and cleared when opened. A reply showed "Replying to Nickie" in her session. A half-written draft came back after a reload. |
| 11 | Sign out offline leaves nothing behind | PASS | Sign-out while offline reached the sign-in screen in 156 ms. After reload: still signed out, 0 `fv-*` storage keys, 0 rendered rows or messages. |

## Not testable in the emulator

These are listed as BLOCKED-LIVE in `QC-REPORT.md`:
- Real Google sign-in (popup, and the redirect fallback on phones).
- Rules deployed to the live project.
- Two real devices on real networks.
- On-screen keyboard behavior on iOS and Android.
