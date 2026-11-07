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
