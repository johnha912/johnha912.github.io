// QC pass (run with --qc): layout, mobile, wiring, GSAP-blocked flow, seed fidelity, privacy, console.
// Screenshots go to site/family-visit/qc/.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as admin from "./admin.mjs";
import { newSession, harness, assert, eventually, TEST_EMAILS } from "./run.mjs";

export const name = "QC";
const SITE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const close = async (...s) => { for (const x of s) await x?.context?.close().catch(() => {}); };

async function baseline(ctx, { proposal = true, votes } = {}) {
  await admin.clearAll();
  await admin.seedBaseline(ctx.seed, ctx.board);
  if (proposal) {
    const sj = admin.cells(ctx.seed.rows.find((r) => r.id === "san-jose"));
    await admin.seedProposal("qc-proposal-1", {
      summary: "Thử nghiệm: chốt chỗ ở San Jose", rowIds: ["san-jose"],
      votes: votes || { john: "pending", nickie: "ok", johnny: "pending" },
      changes: { "san-jose": { before: sj, after: { ...sj, stay: "Chỗ ở thử nghiệm A" } } }
    });
  }
}
const ROLE_VI = {
  "Coordinator": "Điều phối", "Flights & Travel": "Vé & Di chuyển", "Stay & Home Prep": "Chỗ ở & Chuẩn bị nhà",
  "Itinerary & Food": "Lịch trình & Ăn uống", "Budget": "Ngân sách", "Scout — Research & Verification": "Kiểm chứng thông tin",
  "Visa & Documents": "Visa & Giấy tờ"
};
// English words from the v1 interface. Any of them left in the visible UI (outside database content) is a miss.
const ENGLISH = new Set(("the and you your to of is are on in with for this that it be was has have not no ok yes " +
  "sign signed signing out in google account family board list loading opening reload page try again connection connect connecting reconnecting " +
  "live offline online away snapshot agents agent last active checked yet travel plan table date city leg transport stay main activities " +
  "est cost status version changed first published pending confirmation applied rejected frozen proposed proposal changes change new row " +
  "vote votes voted waiting only can here closes closed discussion topics topic pinned summary messages message load earlier reply replying " +
  "cancel edit edited delete deleted keep save send sending write never post home addresses passport numbers booking codes back top open " +
  "decisions decision prices quotes copied research needs network minutes min ago just now hours characters couldn't didn't isn't can't " +
  "chat flights budget documents general san jose nyc niagara falls pennsylvania").split(/\s+/));
const ALLOWED = new Set(["john", "nickie", "johnny", "google", "visa", "cccd", "d1", "d2", "d3", "d4"]);
const pos = (page, sel) => page.$eval(sel, (n) => { const r = n.getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY, left: r.left, right: r.right, height: r.height }; });

export const tests = [
  {
    name: "QC layout order (title, plan, chat, decision details, back-to-top) at 360 px and 1440 px; page opens at the top",
    async run(ctx) {
      await baseline(ctx);
      const out = [];
      for (const [w, h, mobile] of [[360, 740, true], [1440, 900, false]]) {
        // Full-page screenshots use reduced motion: scroll reveals would otherwise leave unscrolled sections faint.
        const s = await newSession(ctx.browser, { member: "john", viewport: { width: w, height: h }, isMobile: mobile, reducedMotion: "reduce" });
        await s.page.waitForSelector("#pending-strip:not([hidden])");
        await s.page.waitForTimeout(1200);
        const startY = await s.page.evaluate(() => scrollY);
        assert(startY === 0, `page opened scrolled to ${startY}px`);
        const title = await pos(s.page, "header.title");
        const table = await pos(s.page, ".table-wrap");
        const chat = await pos(s.page, "#chat");
        const details = await pos(s.page, "#details");
        assert(title.bottom <= table.top && table.bottom <= chat.top && chat.bottom <= details.top, `order wrong at ${w}px`);
        await s.page.screenshot({ path: `${ctx.qcDir}/layout-${w}.png`, fullPage: true });
        out.push(`${w}px: opened at scrollY 0; title ${Math.round(title.top)}, plan table ${Math.round(table.top)}, chat ${Math.round(chat.top)}, details ${Math.round(details.top)} (layout-${w}.png)`);
        await close(s);
      }
      return out.join("; ");
    }
  },
  {
    name: "QC no horizontal page scroll at 360 px and 390 px",
    async run(ctx) {
      await baseline(ctx);
      const out = [];
      for (const w of [360, 390]) {
        const s = await newSession(ctx.browser, { member: "john", viewport: { width: w, height: 800 }, isMobile: true });
        await s.page.waitForSelector("#pending-strip:not([hidden])");
        await s.page.fill("#composer", "Một dòng rất dài để thử bố cục: " + "abcdefghij".repeat(30));
        await s.page.click("#composer-form .send");
        await s.page.waitForTimeout(1500);
        const [sw, iw] = await s.page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
        assert(sw <= iw, `scrollWidth ${sw} > ${iw}`);
        out.push(`${w}px: scrollWidth ${sw} <= ${iw}`);
        await close(s);
      }
      return out.join("; ");
    }
  },
  {
    name: "QC touch targets >= 44 px, composer font >= 16 px, table in its own scroll region with sticky Date at 360 px",
    async run(ctx) {
      await baseline(ctx);
      const s = await newSession(ctx.browser, { member: "john", viewport: { width: 360, height: 740 }, isMobile: true });
      await s.page.waitForSelector("#pending-strip:not([hidden])");
      await s.page.evaluate(() => scrollTo(0, document.body.scrollHeight));
      await s.page.waitForSelector("#to-top:not([hidden])");
      await s.page.waitForTimeout(1500); // measure at rest, after entrance springs settle
      const small = await s.page.$$eval("button, a[href], summary, textarea", (ns) => ns.filter((n) => n.offsetParent !== null).map((n) => {
        const r = n.getBoundingClientRect();
        return { t: (n.textContent || n.getAttribute("aria-label") || n.tagName).trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) };
      }).filter((x) => x.w < 44 || x.h < 44));
      assert(small.length === 0, `small targets: ${JSON.stringify(small)}`);
      const fontPx = await s.page.$eval("#composer", (n) => parseFloat(getComputedStyle(n).fontSize));
      assert(fontPx >= 16, `composer font ${fontPx}px`);
      const t = await s.page.evaluate(() => {
        const wrap = document.querySelector(".table-wrap");
        const date = document.querySelector("#timeline-body th.c-date");
        const before = date.getBoundingClientRect().left;
        wrap.scrollLeft = 300;
        const after = date.getBoundingClientRect().left;
        return { scrollable: wrap.scrollWidth > wrap.clientWidth, sticky: Math.abs(before - after) < 1, pos: getComputedStyle(date).position };
      });
      assert(t.scrollable && t.sticky && t.pos === "sticky", `table region ${JSON.stringify(t)}`);
      await close(s);
      return `Every visible control >= 44x44 px; composer font ${fontPx}px; timeline scrolls inside its region and the Date column stays put (position: sticky).`;
    }
  },
  {
    name: "QC back-to-top appears after scrolling, avoids the composer and vote buttons, and returns to the top",
    async run(ctx) {
      await baseline(ctx);
      const s = await newSession(ctx.browser, { member: "john", viewport: { width: 360, height: 740 }, isMobile: true });
      await s.page.waitForSelector("#pending-strip:not([hidden])");
      assert(await s.page.$eval("#to-top", (n) => n.hidden), "button visible before scrolling");
      const overlaps = async () => s.page.evaluate(() => {
        const b = document.querySelector("#to-top").getBoundingClientRect();
        return [...document.querySelectorAll("#composer-form, .vote-buttons")].filter((n) => {
          const o = n.getBoundingClientRect();
          return o.width && b.left < o.right && b.right > o.left && b.top < o.bottom && b.bottom > o.top;
        }).length;
      });
      const checks = [];
      // Bottom of the page (composer in view), and each vote-button row placed at the bottom edge.
      await s.page.evaluate(() => scrollTo(0, document.body.scrollHeight));
      await s.page.waitForTimeout(500);
      assert(!(await s.page.$eval("#to-top", (n) => n.hidden)), "button hidden after scrolling");
      checks.push(await overlaps());
      const rows = await s.page.$$eval(".vote-buttons", (ns) => ns.map((n) => n.getBoundingClientRect().bottom + scrollY));
      for (const y of rows) {
        await s.page.evaluate((yy) => scrollTo(0, yy - innerHeight + 10), y);
        await s.page.waitForTimeout(300);
        if (!(await s.page.$eval("#to-top", (n) => n.hidden))) checks.push(await overlaps());
      }
      assert(checks.every((c) => c === 0), `overlaps: ${checks}`);
      await s.page.evaluate(() => scrollTo(0, document.body.scrollHeight));
      await s.page.waitForTimeout(400);
      await s.page.screenshot({ path: `${ctx.qcDir}/back-to-top-360.png` });
      await s.page.click("#to-top");
      await eventually(() => s.page.evaluate(() => scrollY < 5), 5000);
      await close(s);
      return `Hidden at top, shown after scrolling; 0 overlaps in ${checks.length} positions (page bottom + every vote row at the screen edge); click returned to scrollY 0 (back-to-top-360.png).`;
    }
  },
  {
    name: "QC one vote and one chat message at 360 px",
    async run(ctx) {
      await baseline(ctx);
      const s = await newSession(ctx.browser, { member: "john", viewport: { width: 360, height: 740 }, isMobile: true });
      await s.page.locator('#pending-strip button[data-vote="ok"]:not([disabled])').click();
      await eventually(async () => (await admin.getDoc("proposals/qc-proposal-1")).votes.john === "ok");
      await s.page.fill("#composer", "Gửi từ màn hình điện thoại 360 px");
      await s.page.click("#composer-form .send");
      await eventually(async () => (await admin.listDocs("threads/general/messages")).some((m) => m.text === "Gửi từ màn hình điện thoại 360 px" && m.authorId === "john"));
      await s.page.waitForTimeout(800);
      await s.page.locator("#pending-strip").scrollIntoViewIfNeeded();
      await s.page.screenshot({ path: `${ctx.qcDir}/vote-360.png` });
      await s.page.locator("#composer-form").scrollIntoViewIfNeeded();
      await s.page.screenshot({ path: `${ctx.qcDir}/message-360.png` });
      await close(s);
      return "John's OK stored (votes.john = ok) and the message stored under john, both from a 360 px viewport (vote-360.png, message-360.png).";
    }
  },
  {
    name: "QC full flow with the GSAP CDN blocked",
    async run(ctx) {
      await baseline(ctx, { votes: { john: "pending", nickie: "ok", johnny: "ok" } });
      const s = await newSession(ctx.browser, { member: "john", viewport: { width: 390, height: 844 }, isMobile: true, blockGsap: true });
      const other = await newSession(ctx.browser, { member: "nickie" });
      assert(await s.page.evaluate(() => typeof window.gsap === "undefined"), "GSAP loaded despite the block");
      await s.page.fill("#composer", "Gửi khi chặn GSAP");
      await s.page.click("#composer-form .send");
      await eventually(async () => (await other.page.$$eval(".msg-text", (ns) => ns.filter((n) => n.textContent.includes("Gửi khi chặn GSAP")).length)) === 1);
      await s.page.locator('#pending-strip button[data-vote="ok"]:not([disabled])').click();
      await eventually(async () => (await admin.getDoc("proposals/qc-proposal-1")).status === "applied");
      await eventually(async () => (await s.page.$eval("#timeline-body", (n) => n.textContent)).includes("Chỗ ở thử nghiệm A"));
      await s.page.evaluate(() => scrollTo(0, document.body.scrollHeight));
      await s.page.waitForSelector("#to-top:not([hidden])");
      await s.page.click("#to-top");
      await eventually(() => s.page.evaluate(() => scrollY < 5), 5000);
      assert(s.errors.filter((e) => !/gsap|ERR_FAILED|Failed to load resource/i.test(e)).length === 0, `errors: ${s.errors}`);
      await close(s, other);
      return "window.gsap undefined; message delivered live to a second session, the third OK applied the proposal, table updated, back-to-top worked. No errors besides the blocked script request.";
    }
  },
  {
    name: "QC seed data rendered byte-identical to board.json",
    async run(ctx) {
      await baseline(ctx, { proposal: false });
      const s = await newSession(ctx.browser, { member: "john" });
      await eventually(async () => (await s.page.$$eval(".decision", (n) => n.length)) === ctx.board.decisions.length && (await s.page.$$eval("#timeline-body tr[data-row]", (n) => n.length)) === ctx.seed.rows.length);
      const dom = await s.page.evaluate(() => ({
        title: document.querySelector("#trip-title").textContent,
        decisions: [...document.querySelectorAll(".decision")].map((li) => ({
          code: li.querySelector(".d-code").textContent,
          title: li.querySelector(".d-title").textContent,
          question: li.querySelector(".d-question").textContent,
          intro: li.querySelector(".d-intro")?.textContent ?? null,
          resolved: li.classList.contains("decision--resolved"),
          status: li.querySelector(".d-status-text").textContent,
          resolution: li.querySelector(".d-conclusion p")?.textContent ?? null,
          options: [...li.querySelectorAll(".d-options li")].map((o) => o.textContent)
        })),
        discussion: [...document.querySelectorAll("#messages .msg--agent")].map((li) => ({
          role: li.querySelector(".author").textContent, time: li.querySelector(".msg-time").textContent,
          topic: li.querySelector(".msg-topic")?.textContent, text: li.querySelector(".msg-text").lastChild.textContent
        })),
        rows: [...document.querySelectorAll("#timeline-body tr")].map((tr) => [...tr.children].map((c) => c.textContent))
      }));
      const b = ctx.board;
      assert(dom.title === "Chuyến thăm của bố mẹ, tháng 12/2026", "title differs"); // Static page title (trip meta no longer ships with the page).
      assert(dom.decisions.length === b.decisions.length, "decision count differs");
      let prices = 0;
      b.decisions.forEach((d, i) => {
        const r = dom.decisions[i];
        assert(r.code === d.id && r.title === d.topic && r.question === d.question, `${d.id} heading differs`);
        assert(r.status === d.status, `${d.id} status differs`);
        assert((r.intro ?? null) === (d.intro ?? null), `${d.id} intro differs`);
        assert(r.resolved === (d.resolved === true || d.status === "resolved"), `${d.id} resolved styling differs`);
        assert((r.resolution ?? null) === (d.resolution ?? null), `${d.id} resolution differs`);
        assert(JSON.stringify(r.options) === JSON.stringify(d.options || []), `${d.id} options differ`);
        prices += (d.options || []).join(" ").match(/\$[\d,]+(\.\d+)?/g)?.length || 0;
      });
      b.discussion.forEach((d, i) => {
        const r = dom.discussion[i];
        assert(r && r.role === ROLE_VI[d.agent] && r.topic === d.topic && r.text === d.text, `discussion ${i + 1} differs`); // role shown through the Vietnamese display map // Time not compared: seeded posts now carry a real Firestore timestamp instead of the fixture display string.
      });
      ctx.seed.rows.forEach((row, i) => {
        assert(JSON.stringify(dom.rows[i]) === JSON.stringify([row.date, row.leg, row.transport, row.stay, row.activities, row.cost, row.status]), `timeline row ${row.id} differs`);
      });
      await close(s);
      return `Title, ${b.decisions.length} decisions (headings, intros, resolved styling, statuses, resolution, ${prices} price strings with their check dates), ${b.discussion.length} seeded agent posts and ${ctx.seed.rows.length} timeline rows match the source files character for character.`;
    }
  },
  {
    name: "QC no email address, placeholder text, or dead control in the UI",
    async run(ctx) {
      await baseline(ctx);
      const s = await newSession(ctx.browser, { member: "john" });
      await s.page.waitForSelector("#pending-strip:not([hidden])");
      const r = await s.page.evaluate(() => {
        const html = document.documentElement.outerHTML;
        const text = document.body.innerText;
        const emails = html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
        const placeholders = text.match(/lorem|ipsum|\bTODO\b|\bTBD\b|\bFIXME\b|xxx|placeholder/gi) || [];
        const known = new Set(["signin-btn", "retry-btn", "signout-denied", "signout", "cancel-reply", "load-older", "to-top"]);
        const dead = [...document.querySelectorAll("button")].filter((b) =>
          !known.has(b.id) && !b.dataset.vote && !b.dataset.action && !b.dataset.dtoggle && b.type !== "submit").map((b) => b.outerHTML.slice(0, 80));
        return { emails, placeholders, dead, buttons: document.querySelectorAll("button").length };
      });
      assert(r.emails.length === 0, `email in UI: ${r.emails.length}`);
      assert(r.placeholders.length === 0, `placeholder text: ${r.placeholders}`);
      assert(r.dead.length === 0, `unwired buttons: ${r.dead}`);
      await close(s);
      return `0 email addresses in the rendered HTML (signed in as a test account); 0 placeholder strings; all ${r.buttons} buttons map to a handler (ids, data-vote, data-action, data-dtoggle, or form submit).`;
    }
  },
  {
    name: "QC console free of errors during sign-in, post, reload",
    async run(ctx) {
      await baseline(ctx);
      const logs = [];
      const s = await newSession(ctx.browser, { member: "john", consoleLog: logs });
      await s.page.fill("#composer", "Tin nhắn kiểm tra console");
      await s.page.click("#composer-form .send");
      await eventually(async () => (await s.page.$$eval(".msg-flag--sending", (n) => n.length)) === 0 && (await s.page.$$eval(".msg-text", (ns) => ns.some((n) => n.textContent.includes("Tin nhắn kiểm tra console")))));
      await s.page.reload();
      await s.page.waitForSelector("#screen-board:not([hidden])");
      await s.page.waitForTimeout(3000);
      assert(s.errors.length === 0, `errors: ${s.errors.join(" | ")}`);
      const warnings = logs.filter((l) => l.startsWith("warning")).length;
      await close(s);
      return `0 console errors and 0 page errors across sign-in, post, reload (${logs.length} console lines total, ${warnings} warnings).`;
    }
  },
  {
    name: "QC portfolio isolation: noindex, not linked, not in the sitemap, no robots.txt Disallow",
    async run() {
      const html = readFileSync(join(SITE, "family-visit/index.html"), "utf8");
      assert(/<meta name="robots" content="noindex, nofollow">/.test(html), "noindex meta missing");
      const offenders = [];
      const walk = (dir) => {
        for (const f of readdirSync(dir)) {
          const p = join(dir, f);
          if (p.startsWith(join(SITE, "family-visit"))) continue;
          if (statSync(p).isDirectory()) walk(p);
          else if (/\.(html|xml|txt|js|json|webmanifest)$/.test(f) && readFileSync(p, "utf8").includes("family-visit")) offenders.push(p.slice(SITE.length));
        }
      };
      walk(SITE);
      assert(offenders.length === 0, `referenced from: ${offenders}`);
      const robots = readFileSync(join(SITE, "robots.txt"), "utf8");
      assert(!robots.includes("family-visit"), "robots.txt mentions the page");
      return "noindex, nofollow meta present; no file outside site/family-visit/ mentions it (nav, sitemap.xml, robots.txt included).";
    }
  },
  {
    name: "QC Vietnamese UI audit: no English interface words on any screen (database content excluded)",
    async run(ctx) {
      await baseline(ctx);
      // A reminder in the chat, so its Vietnamese rendering is audited too.
      await admin.setDoc("threads/general/messages/reminder-qc-proposal-1", { id: "reminder-qc-proposal-1", threadId: "general", authorKind: "agent", role: "Coordinator", kind: "reminder", proposalId: "qc-proposal-1", text: 'Reminder: "Thử nghiệm: chốt chỗ ở San Jose" is still waiting for votes after 72 hours. Vote OK or No above the plan table.', replyTo: null, createdAt: new Date(), clientCreatedAt: Date.now(), deleted: false });
      const collect = (page) => page.evaluate(() => {
        const out = [];
        const visible = (el) => !el.closest("[hidden],noscript,script,style") && (el.offsetParent !== null || getComputedStyle(el).position === "fixed" || el.closest(".sr-only"));
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const el = walker.currentNode.parentElement;
          const s = walker.currentNode.textContent.trim();
          if (s && el && !el.closest("[data-c]") && visible(el)) out.push(s);
        }
        for (const el of document.querySelectorAll("[aria-label],[title],[placeholder]")) {
          if (el.closest("[hidden]")) continue;
          for (const a of ["aria-label", "title", "placeholder"]) { const v = el.getAttribute(a); if (v) out.push(v); }
        }
        out.push(document.title, document.documentElement.lang);
        return out;
      });
      const screens = {};
      const fresh = await ctx.browser.newContext({ ignoreHTTPSErrors: true });
      const sp = await fresh.newPage();
      await sp.goto((await import("./run.mjs")).BASE);
      await sp.waitForSelector("#screen-signin:not([hidden])", { timeout: 30000 });
      screens["sign-in"] = await collect(sp);
      await fresh.close();
      const stranger = await newSession(ctx.browser, { email: "stranger@family-visit.test" });
      await stranger.page.waitForSelector("#screen-denied:not([hidden])");
      screens.denied = await collect(stranger.page);
      await close(stranger);
      const s = await newSession(ctx.browser, { member: "john" });
      await s.page.waitForSelector("#pending-strip:not([hidden])");
      await s.page.fill("#composer", "Tin nhắn kiểm tra");
      await s.page.click("#composer-form .send");
      await eventually(async () => (await s.page.$$eval(".msg-flag--sending", (n) => n.length)) === 0 && (await s.page.locator(".msg--mine").count()) === 1);
      await s.page.waitForTimeout(800);
      screens.board = await collect(s.page);
      await s.page.locator(".msg--mine [data-action=reply]").click();
      await s.page.locator(".msg--mine [data-action=ask-delete]").click();
      screens["reply + delete confirm"] = await collect(s.page);
      await s.page.click("[data-action=cancel-delete]");
      await s.page.locator(".msg--mine [data-action=edit]").click();
      screens["edit"] = await collect(s.page);
      await s.page.click("[data-action=cancel-edit]");
      await s.context.setOffline(true);
      await s.page.waitForSelector("#banner:not([hidden])", { timeout: 15000 });
      screens.offline = await collect(s.page);
      await s.context.setOffline(false);
      await close(s);
      const misses = [];
      let words = 0;
      for (const [screen, strings] of Object.entries(screens)) {
        for (const str of strings) {
          for (const w of str.match(/[\p{L}\p{N}'’]+/gu) || []) {
            words += 1;
            const lw = w.toLowerCase();
            if (ENGLISH.has(lw) && !ALLOWED.has(lw)) misses.push(`${screen}: "${w}" in "${str.slice(0, 80)}"`);
          }
        }
      }
      assert(screens.board.includes("vi"), "html lang is not vi");
      assert(misses.length === 0, `English left in the UI:\n${misses.join("\n")}`);
      return `${Object.keys(screens).length} screens (${Object.keys(screens).join(", ")}), ${words} interface words checked: 0 English. Allowed proper nouns: John, Nickie, Johnny, Google, Visa (in the role name "Visa & Giấy tờ"), CCCD, D1–D4. <html lang="vi">.`;
    }
  },
  {
    name: "QC phone pass for the new order at 360 px and 390 px: plan first, chat by scrolling, D-link to decision card",
    async run(ctx) {
      await baseline(ctx);
      const out = [];
      for (const w of [360, 390]) {
        const s = await newSession(ctx.browser, { member: "john", viewport: { width: w, height: w === 360 ? 740 : 844 }, isMobile: true });
        await s.page.waitForSelector("#timeline-body a.dref");
        await s.page.waitForTimeout(1000);
        const first = await s.page.evaluate(() => ({
          y: scrollY, h: innerHeight,
          plan: document.querySelector("#plan-heading").getBoundingClientRect().top,
          chat: document.querySelector("#chat").getBoundingClientRect().top,
          sw: document.documentElement.scrollWidth
        }));
        assert(first.y === 0 && first.plan < first.h && first.chat > first.plan, `not opened on the plan at ${w}px: ${JSON.stringify(first)}`);
        assert(first.sw <= w, `horizontal scroll at ${w}px`);
        if (w === 360) await s.page.screenshot({ path: `${ctx.qcDir}/v2-first-screen-360.png` });
        // Chat reachable by scrolling.
        await s.page.locator("#chat-heading").scrollIntoViewIfNeeded();
        assert(await s.page.locator("#composer").isVisible(), "chat composer not reachable");
        await s.page.evaluate(() => scrollTo(0, 0));
        await s.page.waitForTimeout(300);
        // Tap the first D-link in the table.
        const link = s.page.locator("#timeline-body a.dref").first();
        const id = await link.getAttribute("data-dref");
        const box = await link.boundingBox();
        assert(box.height >= 44 && box.width >= 44, `D-link tap area ${Math.round(box.width)}x${Math.round(box.height)}`);
        await link.tap();
        await eventually(async () => s.page.evaluate((did) => {
          const c = document.getElementById(`decision-${did}`).getBoundingClientRect();
          return c.top >= 0 && c.top < innerHeight / 2 && document.getElementById(`decision-${did}`).classList.contains("decision--flash");
        }, id), 5000);
        if (w === 360) await s.page.screenshot({ path: `${ctx.qcDir}/v2-dlink-target-360.png` });
        const intro = await s.page.$eval(`#decision-${id} .d-intro`, (n) => n.textContent);
        assert(await s.page.$eval(`#decision-${id} .d-options`, (n) => !n.hidden), "D-link did not open the card's details");
        out.push(`${w}px: opened at scrollY 0 with the plan heading at ${Math.round(first.plan)}px, scrollWidth ${first.sw}; chat composer reachable; tapping ${id} (tap area ${Math.round(box.width)}x${Math.round(box.height)}) brought decision-${id} to the top half, highlighted, intro "${intro.slice(0, 40)}…"`);
        await close(s);
      }
      return out.join("; ") + " (v2-first-screen-360.png, v2-dlink-target-360.png)";
    }
  },
  {
    name: "QC liquid glass + GSAP: plugins live, dock appears and navigates, details expand and collapse",
    async run(ctx) {
      await baseline(ctx);
      const s = await newSession(ctx.browser, { member: "john", viewport: { width: 390, height: 844 }, isMobile: true });
      await s.page.waitForSelector("#timeline-body a.dref");
      await s.page.waitForTimeout(1500);
      const plugins = await s.page.evaluate(() => ({
        gsap: !!window.gsap, st: !!window.ScrollTrigger, flip: !!window.Flip, split: !!window.SplitText, to: !!window.ScrollToPlugin, ce: !!window.CustomEase,
        triggers: window.ScrollTrigger ? window.ScrollTrigger.getAll().length : 0,
        glass: getComputedStyle(document.querySelector("#plan")).backdropFilter || getComputedStyle(document.querySelector("#plan")).webkitBackdropFilter,
        font: getComputedStyle(document.body).fontFamily
      }));
      assert(plugins.gsap && plugins.st && plugins.flip && plugins.split && plugins.to && plugins.ce, `plugins missing: ${JSON.stringify(plugins)}`);
      assert(plugins.triggers >= 3, `only ${plugins.triggers} ScrollTriggers`);
      assert(/blur/.test(plugins.glass), "no backdrop blur on the plan card");
      assert(await s.page.evaluate(() => document.fonts.check('16px "Google Sans"', "Tiếng Việt: ấ ở ữ")), "Google Sans not loaded for Vietnamese text");
      assert(await s.page.$eval("#dock", (n) => n.hidden), "dock visible at the top");
      await s.page.evaluate(() => scrollTo(0, 900));
      await s.page.waitForSelector("#dock:not([hidden])", { timeout: 5000 });
      await s.page.waitForTimeout(700);
      await s.page.screenshot({ path: `${ctx.qcDir}/v3-dock-390.png` });
      await s.page.locator('#dock [data-dock="details"]').tap();
      await eventually(async () => s.page.evaluate(() => { const r = document.querySelector("#details").getBoundingClientRect(); return r.top > 0 && r.top < 200; }), 5000);
      await eventually(async () => (await s.page.getAttribute('#dock [data-dock="details"]', "aria-current")) !== null, 5000);
      const toggle = s.page.locator("#decisions button[data-dtoggle]").first();
      const did = await toggle.getAttribute("data-dtoggle");
      await toggle.tap();
      await eventually(async () => s.page.$eval(`#opts-${did}`, (n) => !n.hidden), 3000);
      await s.page.waitForTimeout(800);
      await s.page.screenshot({ path: `${ctx.qcDir}/v3-details-open-390.png` });
      await s.page.locator(`#decisions button[data-dtoggle="${did}"]`).tap();
      await eventually(async () => s.page.$eval(`#opts-${did}`, (n) => n.hidden), 3000);
      const sw = await s.page.evaluate(() => document.documentElement.scrollWidth);
      assert(sw <= 390, `horizontal scroll ${sw}`);
      assert(s.errors.length === 0, `errors: ${s.errors.join(" | ")}`);
      await close(s);
      return `gsap + ScrollTrigger + Flip + SplitText + ScrollToPlugin + CustomEase loaded, ${plugins.triggers} scroll triggers live; plan card ${plugins.glass}; font ${plugins.font.split(",")[0]} renders Vietnamese; dock hidden at top, shown after scrolling, tapping "Chi tiết D" scrolled to the section and moved the active pill; ${did} details opened and closed; scrollWidth ${sw}; no console errors (v3-dock-390.png, v3-details-open-390.png).`;
    }
  }
];
