// End-to-end suite against the Local Emulator Suite. Each test starts from a clean, seeded database.
import * as admin from "./admin.mjs";
import { newSession, harness, assert, eventually, TEST_EMAILS, STRANGER } from "./run.mjs";

export const name = "emulator suite";

const CELLS = (r) => admin.cells(r);
async function fresh(ctx) {
  await admin.clearAll();
  await admin.seedBaseline(ctx.seed, ctx.board);
}
const rowsJson = async () => JSON.stringify((await admin.listDocs("planRows")).map((d) => ({ ...d, updatedAt: d.updatedAt })));
const tableHtml = (page) => page.$eval("#timeline-body", (n) => n.innerHTML);
const msgCount = (page, text) => page.$$eval(".msg-text", (ns, t) => ns.filter((n) => n.textContent.includes(t)).length, text);
const close = async (...sessions) => { for (const s of sessions) await s?.context?.close().catch(() => {}); };
const msgDoc = (member, id, text, extra = {}) => ({
  id, threadId: "general", authorKind: "human", authorId: member, text, replyTo: null,
  createdAt: { $st: 1 }, clientCreatedAt: Date.now(), deleted: false, ...extra
});

export const tests = [
  {
    name: "(a) a whitelisted user posts and a second session sees it live",
    async run(ctx) {
      await fresh(ctx);
      const john = await newSession(ctx.browser, { member: "john" });
      const nickie = await newSession(ctx.browser, { member: "nickie" });
      const navs = await nickie.page.evaluate(() => performance.getEntriesByType("navigation").length);
      const text = `Hello from John ${Date.now()}`;
      await john.page.fill("#composer", text);
      await john.page.click("#composer-form .send");
      const t0 = Date.now();
      await eventually(async () => (await msgCount(nickie.page, text)) === 1, 15000);
      const ms = Date.now() - t0;
      assert(await nickie.page.evaluate(() => performance.getEntriesByType("navigation").length) === navs, "nickie's page reloaded");
      const stored = (await admin.listDocs("threads/general/messages")).filter((m) => m.text === text);
      assert(stored.length === 1 && stored[0].authorId === "john", "message not stored once under john");
      await close(john, nickie);
      return `Nickie saw John's message ${ms} ms after send, without a reload; 1 document stored.`;
    }
  },
  {
    name: "(b) a non-whitelisted user is denied read and write",
    async run(ctx) {
      await fresh(ctx);
      await admin.setDoc("threads/general/messages/existing-msg-0001", { id: "existing-msg-0001", threadId: "general", authorKind: "human", authorId: "john", text: "Family only", replyTo: null, createdAt: new Date(), clientCreatedAt: 1, deleted: false });
      const stranger = await newSession(ctx.browser, { email: STRANGER });
      await stranger.page.waitForSelector("#screen-denied:not([hidden])", { timeout: 20000 });
      assert(await stranger.page.$eval("#screen-board", (n) => n.hidden), "board visible to a stranger");
      const bodyText = await stranger.page.evaluate(() => document.body.innerText);
      assert(!bodyText.includes("Family only") && !bodyText.includes("San Jose"), "content leaked to stranger UI");
      const h = await harness(ctx.browser, STRANGER);
      const checks = {
        readRows: await h.call("list", "planRows"),
        readMessages: await h.call("list", "threads/general/messages"),
        readProposal: await h.call("get", "planMeta/table"),
        readPresence: await h.call("list", "presence"),
        writeMessage: await h.call("set", "threads/general/messages/stranger-msg-001", msgDoc("john", "stranger-msg-001", "hi")),
        writePresence: await h.call("set", "presence/john", { member: "john", state: "online", lastSeen: { $st: 1 }, thread: "general" })
      };
      // Unverified email and non-Google sign-in for a whitelisted test address are refused too.
      const h2 = await harness(ctx.browser, null);
      await h2.call("signIn", TEST_EMAILS.john, false);
      checks.unverifiedRead = await h2.call("list", "planRows");
      await h2.call("signIn", TEST_EMAILS.nickie, true, "password");
      checks.passwordProviderRead = await h2.call("list", "planRows");
      for (const [k, r] of Object.entries(checks)) assert(!r.ok && r.code === "permission-denied", `${k} was not denied: ${JSON.stringify(r)}`);
      await close(stranger, h, h2);
      return `Denied: ${Object.keys(checks).join(", ")}. Stranger sees only the "not on the family list" screen.`;
    }
  },
  {
    name: "(c) a message posted offline appears exactly once after reconnect",
    async run(ctx) {
      await fresh(ctx);
      const john = await newSession(ctx.browser, { member: "john" });
      const nickie = await newSession(ctx.browser, { member: "nickie" });
      await eventually(() => john.page.evaluate(() => window.fvTest.state().conn === "live"));
      await john.context.setOffline(true);
      const text = `Sent while offline ${Date.now()}`;
      await john.page.fill("#composer", text);
      await john.page.click("#composer-form .send");
      await eventually(async () => (await john.page.$$eval(".msg-flag--sending", (n) => n.length)) === 1, 5000);
      assert(await msgCount(john.page, text) === 1, "offline message not shown once locally");
      await new Promise((r) => setTimeout(r, 2500));
      assert((await admin.listDocs("threads/general/messages")).filter((m) => m.text === text).length === 0, "reached server while offline");
      await john.context.setOffline(false);
      await eventually(async () => (await john.page.$$eval(".msg-flag--sending", (n) => n.length)) === 0, 30000);
      await eventually(async () => (await msgCount(nickie.page, text)) === 1, 15000);
      await new Promise((r) => setTimeout(r, 3000));
      const stored = (await admin.listDocs("threads/general/messages")).filter((m) => m.text === text);
      assert(stored.length === 1, `stored ${stored.length} times`);
      assert(await msgCount(nickie.page, text) === 1 && await msgCount(john.page, text) === 1, "shown more than once");
      await john.page.reload();
      await john.page.waitForSelector("#screen-board:not([hidden])");
      await eventually(async () => (await msgCount(john.page, text)) === 1, 15000);
      await close(john, nickie);
      return `Showed "sending…" offline, 0 server docs while offline, then exactly 1 doc (id ${stored[0].id}) and 1 rendered copy in both sessions, also after reload.`;
    }
  },
  {
    name: "(d) malformed writes are rejected by the rules",
    async run(ctx) {
      await fresh(ctx);
      await admin.setDoc("threads/general/messages/nickie-msg-0001", { id: "nickie-msg-0001", threadId: "general", authorKind: "human", authorId: "nickie", text: "Nickie's message", replyTo: null, createdAt: new Date(), clientCreatedAt: 1, deleted: false });
      const h = await harness(ctx.browser, TEST_EMAILS.john);
      const base = (id) => msgDoc("john", id, "ok text");
      const bad = {
        oversizedText: ["set", "threads/general/messages/bad-msg-0001", { ...base("bad-msg-0001"), text: "x".repeat(2001) }],
        emptyText: ["set", "threads/general/messages/bad-msg-0002", { ...base("bad-msg-0002"), text: "" }],
        missingCreatedAt: ["set", "threads/general/messages/bad-msg-0003", (({ createdAt, ...r }) => r)(base("bad-msg-0003"))],
        clientTimestamp: ["set", "threads/general/messages/bad-msg-0004", { ...base("bad-msg-0004"), createdAt: { $ts: "2026-01-01T00:00:00Z" } }],
        impersonation: ["set", "threads/general/messages/bad-msg-0005", { ...base("bad-msg-0005"), authorId: "nickie" }],
        postsAsAgent: ["set", "threads/general/messages/bad-msg-0006", { ...base("bad-msg-0006"), authorKind: "agent" }],
        extraField: ["set", "threads/general/messages/bad-msg-0007", { ...base("bad-msg-0007"), address: "x" }],
        idMismatch: ["set", "threads/general/messages/bad-msg-0008", { ...base("bad-msg-9999") }],
        unknownThread: ["set", "threads/secret/messages/bad-msg-0009", { ...base("bad-msg-0009"), threadId: "secret" }],
        stringClientTime: ["set", "threads/general/messages/bad-msg-0010", { ...base("bad-msg-0010"), clientCreatedAt: "now" }],
        editOthers: ["update", "threads/general/messages/nickie-msg-0001", { text: "changed", editedAt: { $st: 1 } }],
        hardDelete: ["update", "threads/general/messages/nickie-msg-0001", { deleted: true, text: "", deletedAt: { $st: 1 } }],
        presenceForOther: ["set", "presence/nickie", { member: "nickie", state: "online", lastSeen: { $st: 1 }, thread: "general" }],
        presenceBadState: ["set", "presence/john", { member: "john", state: "invisible", lastSeen: { $st: 1 }, thread: "general" }],
        directRowWrite: ["set", "planRows/san-jose", { ...CELLS(ctx.seed.rows[1]), stay: "Direct edit", version: 2, updatedBy: "john", updatedAt: { $st: 1 }, appliedProposal: "none-0000" }],
        tableBump: ["update", "planMeta/table", { version: 2, updatedAt: { $st: 1 }, updatedBy: "john", lastProposal: "none-0000" }],
        writeThreadSummary: ["update", "threads/general", { summary: "x" }],
        writeHeartbeat: ["set", "meta/heartbeat", { lastActive: { $st: 1 } }],
        createProposal: ["set", "proposals/fake-proposal-1", { status: "pending" }]
      };
      const denied = [];
      for (const [k, [op, path, data]] of Object.entries(bad)) {
        const r = await h.call(op, path, data);
        assert(!r.ok && r.code === "permission-denied", `${k} was accepted: ${JSON.stringify(r)}`);
        denied.push(k);
      }
      const good = await h.call("set", "threads/general/messages/good-msg-0001", base("good-msg-0001"));
      assert(good.ok, `control write failed: ${JSON.stringify(good)}`);
      const edit = await h.call("update", "threads/general/messages/good-msg-0001", { text: "edited text", editedAt: { $st: 1 } });
      assert(edit.ok, `own edit failed: ${JSON.stringify(edit)}`);
      await h.close();
      return `${denied.length} malformed writes denied (${denied.join(", ")}); a valid message and an own edit were accepted.`;
    }
  },
  {
    name: "(e) killing the listener connection shows reconnecting, then polling, never a blank page",
    async run(ctx) {
      await fresh(ctx);
      const john = await newSession(ctx.browser, { member: "john", path: "?timing=fast" });
      await eventually(() => john.page.evaluate(() => window.fvTest.state().conn === "live"));
      // Block the Firestore emulator for this session, then drop the open stream so listeners lose their connection.
      await john.context.route(/127\.0\.0\.1:8080/, (r) => r.abort());
      await john.page.evaluate(() => window.fvTest.dropConnection());
      const banner = () => john.page.$eval("#banner", (n) => (n.hidden ? "" : n.textContent));
      await eventually(async () => (await banner()).includes("Reconnecting"), 20000);
      const rowsDuring = await john.page.$$eval("#timeline-body tr", (n) => n.length);
      const textLen = await john.page.evaluate(() => document.body.innerText.trim().length);
      assert(rowsDuring === ctx.seed.rows.length && textLen > 200, "page went blank while reconnecting");
      await eventually(async () => (await banner()).includes("every 30 seconds"), 30000);
      await john.page.screenshot({ path: `${ctx.qcDir}/e-polling-fallback.png` });
      await john.context.unroute(/127\.0\.0\.1:8080/);
      await eventually(() => john.page.evaluate(() => window.fvTest.state().conn === "live"), 45000);
      assert(await john.page.$eval("#banner", (n) => n.hidden), "banner stayed after recovery");
      await close(john);
      return `Banner went "Reconnecting…" then "Checking for changes every 30 seconds"; ${rowsDuring} timeline rows stayed visible; recovered to Live after unblocking.`;
    }
  },
  {
    name: "(e2) backend unreachable entirely: offline snapshot instead of a blank page",
    async run(ctx) {
      await fresh(ctx);
      const john = await newSession(ctx.browser, { member: "john" });
      await eventually(() => john.page.evaluate(() => !!localStorage.getItem("fv-plan-cache")));
      // Firebase SDK unreachable (CDN blocked) on a device that signed in before.
      await john.context.route(/gstatic\.com\/firebasejs/, (r) => r.abort());
      await john.page.reload();
      await john.page.waitForSelector("#snapshot-notice:not([hidden])", { timeout: 30000 });
      const notice = await john.page.$eval("#snapshot-notice", (n) => n.textContent);
      const rows = await john.page.$$eval("#timeline-body tr", (n) => n.length);
      assert(notice.startsWith("Offline snapshot") && rows === ctx.seed.rows.length, "snapshot not rendered");
      await john.page.screenshot({ path: `${ctx.qcDir}/e-offline-snapshot.png`, fullPage: true });
      // A device that never signed in gets the sign-in screen with a clear error, not a blank page.
      const fresh2 = await ctx.browser.newContext({ ignoreHTTPSErrors: true });
      await fresh2.route(/gstatic\.com\/firebasejs/, (r) => r.abort());
      const p2 = await fresh2.newPage();
      await p2.goto((await john.page.url()).split("?")[0]);
      await p2.waitForSelector("#screen-signin:not([hidden])", { timeout: 30000 });
      await eventually(async () => (await p2.$eval("#signin-error", (n) => n.textContent)).includes("Can't reach"), 20000);
      assert(!(await p2.evaluate(() => document.body.innerText)).includes("San Jose"), "plan leaked without sign-in");
      await fresh2.close();
      await close(john);
      return `Signed-in device: "${notice.slice(0, 60)}…" with ${rows} rows. New device: sign-in screen with "Can't reach Google sign-in" and no plan content.`;
    }
  },
  {
    name: "(f) confirmation gate: no change at 2 OK, applied at the 3rd OK, a single No freezes",
    async run(ctx) {
      await fresh(ctx);
      const sj = ctx.seed.rows.find((r) => r.id === "san-jose");
      const afterA = { ...CELLS(sj), stay: "Test stay value A" };
      await admin.seedProposal("gate-proposal-1", { summary: "Test: set the San Jose stay", rowIds: ["san-jose"], changes: { "san-jose": { before: CELLS(sj), after: afterA } } });
      const john = await newSession(ctx.browser, { member: "john" });
      const nickie = await newSession(ctx.browser, { member: "nickie" });
      const johnny = await newSession(ctx.browser, { member: "johnny" });
      const stripBtn = (s, vote) => s.page.locator(`#pending-strip [data-pid="gate-proposal-1"] button[data-vote="${vote}"]:not([disabled])`);
      await stripBtn(john, "ok").waitFor({ timeout: 20000 });
      const rows0 = await rowsJson();
      const html0 = await tableHtml(john.page);

      await stripBtn(john, "ok").click();
      await eventually(async () => (await admin.getDoc("proposals/gate-proposal-1")).votes.john === "ok");
      await stripBtn(nickie, "ok").waitFor();
      await stripBtn(nickie, "ok").click();
      await eventually(async () => (await admin.getDoc("proposals/gate-proposal-1")).votes.nickie === "ok");
      await new Promise((r) => setTimeout(r, 1500));
      const p2 = await admin.getDoc("proposals/gate-proposal-1");
      assert(p2.status === "pending", "applied before the third OK");
      assert(await rowsJson() === rows0, "rows changed at 2 OK");
      assert(await tableHtml(john.page) === html0 && await tableHtml(nickie.page) === html0, "table DOM changed at 2 OK");

      await stripBtn(johnny, "ok").waitFor();
      await stripBtn(johnny, "ok").click();
      await eventually(async () => (await admin.getDoc("proposals/gate-proposal-1")).status === "applied", 15000);
      const row = await admin.getDoc("planRows/san-jose");
      const table = await admin.getDoc("planMeta/table");
      assert(row.stay === "Test stay value A" && row.version === 2 && row.appliedProposal === "gate-proposal-1", "row not applied");
      assert(table.version === 2 && table.lastProposal === "gate-proposal-1", "table version not bumped");
      await eventually(async () => (await tableHtml(nickie.page)).includes("Test stay value A"), 10000);
      await john.page.screenshot({ path: `${ctx.qcDir}/f-applied.png`, fullPage: true });

      // Second proposal: one No freezes it and the table stays byte-identical.
      const afterB = { ...afterA, stay: "Test stay value B" };
      await admin.seedProposal("gate-proposal-2", { summary: "Test: change the San Jose stay again", rowIds: ["san-jose"], changes: { "san-jose": { before: afterA, after: afterB } } });
      const btn2 = (s, vote) => s.page.locator(`#pending-strip [data-pid="gate-proposal-2"] button[data-vote="${vote}"]:not([disabled])`);
      await btn2(john, "ok").waitFor({ timeout: 15000 });
      const rows1 = await rowsJson();
      const html1 = await tableHtml(johnny.page);
      await btn2(john, "ok").click();
      await eventually(async () => (await admin.getDoc("proposals/gate-proposal-2")).votes.john === "ok");
      await btn2(nickie, "no").waitFor();
      await btn2(nickie, "no").click();
      await eventually(async () => (await admin.getDoc("proposals/gate-proposal-2")).status === "rejected", 15000);
      await new Promise((r) => setTimeout(r, 1500));
      assert(await rowsJson() === rows1, "rows changed after a No");
      assert(await tableHtml(johnny.page) === html1, "table DOM changed after a No");
      assert(await johnny.page.locator('[data-pid="gate-proposal-2"] button[data-vote]:not([disabled])').count() === 0, "frozen proposal still votable in the UI");
      // Frozen on the server too: no vote, no edit, no forced apply.
      const h = await harness(ctx.browser, TEST_EMAILS.johnny);
      const frozenVote = await h.call("update", "proposals/gate-proposal-2", { votes: { john: "ok", nickie: "no", johnny: "ok" }, updatedBy: "johnny" });
      const frozenEdit = await h.call("update", "proposals/gate-proposal-2", { summary: "edited" });
      assert(!frozenVote.ok && !frozenEdit.ok, "frozen proposal accepted a write");

      // Forgery attempts on a fresh pending proposal with only two OKs.
      await admin.seedProposal("gate-proposal-3", { summary: "Test: forged apply", rowIds: ["san-jose"], votes: { john: "ok", nickie: "pending", johnny: "pending" }, changes: { "san-jose": { before: afterA, after: { ...afterA, stay: "Forged" } } } });
      const forgedApply = await h.call("batch", [
        { type: "update", path: "proposals/gate-proposal-3", data: { votes: { john: "ok", nickie: "pending", johnny: "ok" }, status: "applied", appliedAt: { $st: 1 }, appliedVersion: 3, updatedBy: "johnny" } },
        { type: "update", path: "planMeta/table", data: { version: 3, updatedAt: { $st: 1 }, updatedBy: "johnny", lastProposal: "gate-proposal-3" } },
        { type: "set", path: "planRows/san-jose", data: { ...afterA, stay: "Forged", version: 3, updatedBy: "johnny", updatedAt: { $st: 1 }, appliedProposal: "gate-proposal-3" } }
      ]);
      const voteForOther = await h.call("update", "proposals/gate-proposal-3", { votes: { john: "ok", nickie: "ok", johnny: "pending" }, updatedBy: "johnny" });
      assert(!forgedApply.ok && !voteForOther.ok, "forged apply or vote-for-another accepted");
      assert((await admin.getDoc("planRows/san-jose")).stay === "Test stay value A", "forgery changed the table");
      await h.close();
      await close(john, nickie, johnny);
      return "2 OK: proposal pending, planRows JSON and table HTML identical in all sessions. 3rd OK: row applied (version 2), table version 2. One No: status rejected, rows JSON + table HTML byte-identical, vote buttons gone, server refused votes/edits on the frozen proposal, forged applies refused.";
    }
  },
  {
    name: "72-hour reminder is posted exactly once",
    async run(ctx) {
      await fresh(ctx);
      const sj = ctx.seed.rows.find((r) => r.id === "san-jose");
      await admin.seedProposal("old-proposal-1", { summary: "Test: an old proposal", threadId: "budget", createdAt: new Date(Date.now() - 73 * 3600 * 1000), votes: { john: "ok", nickie: "pending", johnny: "pending" }, rowIds: ["san-jose"], changes: { "san-jose": { before: CELLS(sj), after: { ...CELLS(sj), cost: "Test cost" } } } });
      await admin.seedProposal("new-proposal-1", { summary: "Test: a recent proposal", threadId: "budget", createdAt: new Date(Date.now() - 2 * 3600 * 1000), rowIds: ["san-jose"], changes: { "san-jose": { before: CELLS(sj), after: { ...CELLS(sj), cost: "Test cost 2" } } } });
      const john = await newSession(ctx.browser, { member: "john" });
      const nickie = await newSession(ctx.browser, { member: "nickie" });
      await eventually(async () => !!(await admin.getDoc("threads/budget/messages/reminder-old-proposal-1")), 20000);
      await new Promise((r) => setTimeout(r, 4000));
      const msgs = await admin.listDocs("threads/budget/messages");
      const reminders = msgs.filter((m) => m.kind === "reminder");
      assert(reminders.length === 1 && reminders[0].proposalId === "old-proposal-1", `expected exactly 1 reminder, got ${reminders.length}`);
      assert((await admin.getDoc("proposals/old-proposal-1")).reminderSent === true, "reminderSent not set");
      assert((await admin.getDoc("proposals/new-proposal-1")).reminderSent === false, "recent proposal reminded early");
      await close(john, nickie); // no live session may send the next proposal's reminder during the forgery checks
      const h = await harness(ctx.browser, TEST_EMAILS.johnny);
      const again = await h.call("batch", [
        { type: "set", path: "threads/budget/messages/reminder-old-proposal-1", data: { id: "reminder-old-proposal-1", threadId: "budget", authorKind: "agent", role: "Coordinator", kind: "reminder", proposalId: "old-proposal-1", text: "again", replyTo: null, createdAt: { $st: 1 }, clientCreatedAt: Date.now(), deleted: false } },
        { type: "update", path: "proposals/old-proposal-1", data: { reminderSent: true } }
      ]);
      const early = await h.call("batch", [
        { type: "set", path: "threads/budget/messages/reminder-new-proposal-1", data: { id: "reminder-new-proposal-1", threadId: "budget", authorKind: "agent", role: "Coordinator", kind: "reminder", proposalId: "new-proposal-1", text: "early", replyTo: null, createdAt: { $st: 1 }, clientCreatedAt: Date.now(), deleted: false } },
        { type: "update", path: "proposals/new-proposal-1", data: { reminderSent: true } }
      ]);
      // A due proposal still can't be used to post free text under the Coordinator label.
      await admin.seedProposal("old-proposal-2", { summary: "Test: another old proposal", threadId: "budget", createdAt: new Date(Date.now() - 80 * 3600 * 1000), rowIds: ["san-jose"], changes: { "san-jose": { before: CELLS(sj), after: { ...CELLS(sj), cost: "Test cost 3" } } } });
      const freeText = await h.call("batch", [
        { type: "set", path: "threads/budget/messages/reminder-old-proposal-2", data: { id: "reminder-old-proposal-2", threadId: "budget", authorKind: "agent", role: "Coordinator", kind: "reminder", proposalId: "old-proposal-2", text: "Coordinator says: send me your passport numbers", replyTo: null, createdAt: { $st: 1 }, clientCreatedAt: Date.now(), deleted: false } },
        { type: "update", path: "proposals/old-proposal-2", data: { reminderSent: true } }
      ]);
      assert(!again.ok && !early.ok && !freeText.ok, "second, early, or free-text reminder accepted");
      assert(reminders[0].text === 'Reminder: "Test: an old proposal" is still waiting for votes after 72 hours. Vote OK or No above the plan table.', "reminder text not the fixed template");
      await h.close();
      return "Two signed-in sessions, one 73-hour-old pending proposal: 1 reminder document, reminderSent=true; a second reminder, an early (2-hour) reminder, and a free-text Coordinator reminder were refused by the rules; the reminder text is the fixed template.";
    }
  },
  {
    name: "edit shows 'edited', soft delete shows 'Message deleted' in the other session",
    async run(ctx) {
      await fresh(ctx);
      const john = await newSession(ctx.browser, { member: "john" });
      const nickie = await newSession(ctx.browser, { member: "nickie" });
      const text = `Draft plan ${Date.now()}`;
      await john.page.fill("#composer", text);
      await john.page.click("#composer-form .send");
      await eventually(async () => (await msgCount(nickie.page, text)) === 1);
      const li = john.page.locator(".msg--mine", { hasText: text });
      await li.locator('[data-action="edit"]').click();
      await john.page.fill(".edit-box", `${text} (revised)`);
      await john.page.click('.edit-form button[type="submit"]');
      await eventually(async () => (await nickie.page.locator(".msg", { hasText: `${text} (revised)` }).locator(".msg-flag", { hasText: "edited" }).count()) === 1);
      await john.page.locator(".msg--mine", { hasText: `${text} (revised)` }).locator('[data-action="ask-delete"]').click();
      await john.page.click('[data-action="delete"]');
      await eventually(async () => (await nickie.page.locator(".msg-text--deleted").count()) === 1 && (await msgCount(nickie.page, text)) === 0);
      const stored = (await admin.listDocs("threads/general/messages")).filter((m) => m.deleted);
      assert(stored.length === 1 && stored[0].text === "", "soft delete not stored");
      await close(john, nickie);
      return "Edit flagged \"edited\" live; delete kept the document (deleted=true, text cleared) and showed \"Message deleted\".";
    }
  },
  {
    name: "chat loads 50 at a time and loads earlier messages on scroll up",
    async run(ctx) {
      await fresh(ctx);
      const t0 = Date.now() - 3600 * 1000;
      for (let i = 0; i < 62; i++) {
        const id = `page-msg-${String(i).padStart(4, "0")}`;
        await admin.setDoc(`threads/nyc/messages/${id}`, { id, threadId: "nyc", authorKind: "human", authorId: i % 2 ? "nickie" : "johnny", text: `NYC message ${i}`, replyTo: null, createdAt: new Date(t0 + i * 1000), clientCreatedAt: t0 + i * 1000, deleted: false });
      }
      const john = await newSession(ctx.browser, { member: "john" });
      await john.page.click('[data-thread="nyc"]');
      await eventually(async () => (await john.page.$$eval(".msg", (n) => n.length)) === 50);
      assert(await john.page.isVisible("#load-older"), "load-earlier control hidden");
      await john.page.$eval("#messages", (n) => { n.scrollTop = 0; n.dispatchEvent(new Event("scroll")); });
      await eventually(async () => (await john.page.$$eval(".msg", (n) => n.length)) === 62);
      assert(await msgCount(john.page, "NYC message 0") >= 1, "oldest message missing");
      await close(john);
      return "First render 50 messages; scrolling to the top loaded the remaining 12 (62 total).";
    }
  },
  {
    name: "presence, per-thread unread markers, reply threading, and draft autosave",
    async run(ctx) {
      await fresh(ctx);
      const john = await newSession(ctx.browser, { member: "john" });
      const nickie = await newSession(ctx.browser, { member: "nickie" });
      await eventually(async () => (await john.page.$$eval(".pres--online", (n) => n.map((x) => x.textContent))).some((t) => t.includes("Nickie")), 15000);
      await nickie.page.click('[data-thread="budget"]');
      await nickie.page.fill("#composer", "Budget question for everyone");
      await nickie.page.click("#composer-form .send");
      await eventually(async () => (await john.page.$$eval('[data-thread="budget"].tab--unread', (n) => n.length)) === 1, 15000);
      await john.page.click('[data-thread="budget"]');
      await eventually(async () => (await john.page.$$eval('[data-thread="budget"].tab--unread', (n) => n.length)) === 0);
      await john.page.locator(".msg", { hasText: "Budget question for everyone" }).locator('[data-action="reply"]').click();
      await john.page.fill("#composer", "Answering the budget question");
      await john.page.click("#composer-form .send");
      await eventually(async () => (await nickie.page.locator(".msg", { hasText: "Answering the budget question" }).locator(".quote", { hasText: "Replying to Nickie" }).count()) === 1);
      await john.page.fill("#composer", "Half-written thought");
      await john.page.waitForTimeout(600);
      await john.page.reload();
      await john.page.waitForSelector("#screen-board:not([hidden])");
      assert(await john.page.inputValue("#composer") === "Half-written thought", "draft not restored");
      await close(john, nickie);
      return "Nickie shown online to John; Budget tab got an unread marker and cleared on open; reply quoted \"Replying to Nickie\"; draft restored after reload.";
    }
  },
  {
    name: "sign out works offline and leaves no plan or chat content behind",
    async run(ctx) {
      await fresh(ctx);
      const john = await newSession(ctx.browser, { member: "john" });
      await john.page.fill("#composer", "Before signing out");
      await john.page.click("#composer-form .send");
      await eventually(async () => (await admin.listDocs("threads/general/messages")).some((m) => m.text === "Before signing out"));
      await eventually(() => john.page.evaluate(() => !!localStorage.getItem("fv-plan-cache")));
      await john.context.setOffline(true);
      const t0 = Date.now();
      await john.page.click("#signout");
      await john.page.waitForSelector("#screen-signin:not([hidden])", { timeout: 15000 });
      await john.page.waitForLoadState("domcontentloaded").catch(() => {});
      await john.context.setOffline(false);
      await john.page.reload();
      await john.page.waitForSelector("#screen-signin:not([hidden])", { timeout: 20000 });
      const after = await john.page.evaluate(() => ({
        keys: Object.keys(localStorage).filter((k) => k.startsWith("fv-")),
        rows: document.querySelectorAll("#timeline-body tr").length,
        msgs: document.querySelectorAll("#messages .msg").length,
        board: !document.querySelector("#screen-board").hidden
      }));
      assert(after.keys.length === 0 && after.rows === 0 && after.msgs === 0 && !after.board, `left behind: ${JSON.stringify(after)}`);
      await close(john);
      return `Offline sign-out reached the sign-in screen in ${Date.now() - t0} ms; after reload: still signed out, 0 fv-* storage keys, 0 rendered rows or messages.`;
    }
  }
];
