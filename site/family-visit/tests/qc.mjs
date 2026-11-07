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
  await admin.seedBaseline(ctx.seed);
  if (proposal) {
    const sj = admin.cells(ctx.seed.rows.find((r) => r.id === "san-jose"));
    await admin.seedProposal("qc-proposal-1", {
      summary: "Test: set the San Jose stay", rowIds: ["san-jose"],
      votes: votes || { john: "pending", nickie: "ok", johnny: "pending" },
      changes: { "san-jose": { before: sj, after: { ...sj, stay: "Test stay value A" } } }
    });
  }
}
const pos = (page, sel) => page.$eval(sel, (n) => { const r = n.getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY, left: r.left, right: r.right, height: r.height }; });

export const tests = [
  {
    name: "QC layout order (title, timeline table, chat, back-to-top) at 360 px and 1440 px",
    async run(ctx) {
      await baseline(ctx);
      const out = [];
      for (const [w, h, mobile] of [[360, 740, true], [1440, 900, false]]) {
        const s = await newSession(ctx.browser, { member: "john", viewport: { width: w, height: h }, isMobile: mobile });
        await s.page.waitForSelector("#pending-strip:not([hidden])");
        await s.page.waitForTimeout(1200); // let entrance motion finish so the screenshot shows the resting state
        const title = await pos(s.page, "header.title");
        const table = await pos(s.page, ".table-wrap");
        const chat = await pos(s.page, "#chat");
        assert(title.bottom <= table.top && table.bottom <= chat.top, `order wrong at ${w}px`);
        await s.page.screenshot({ path: `${ctx.qcDir}/layout-${w}.png`, fullPage: true });
        out.push(`${w}px: title ${Math.round(title.top)}, table ${Math.round(table.top)}, chat ${Math.round(chat.top)} (layout-${w}.png)`);
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
        await s.page.fill("#composer", "A long line to stress the layout: " + "abcdefghij".repeat(30));
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
      await s.page.fill("#composer", "Sent from a 360 px phone screen");
      await s.page.click("#composer-form .send");
      await eventually(async () => (await admin.listDocs("threads/general/messages")).some((m) => m.text === "Sent from a 360 px phone screen" && m.authorId === "john"));
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
      await s.page.fill("#composer", "Posted with GSAP blocked");
      await s.page.click("#composer-form .send");
      await eventually(async () => (await other.page.$$eval(".msg-text", (ns) => ns.filter((n) => n.textContent.includes("Posted with GSAP blocked")).length)) === 1);
      await s.page.locator('#pending-strip button[data-vote="ok"]:not([disabled])').click();
      await eventually(async () => (await admin.getDoc("proposals/qc-proposal-1")).status === "applied");
      await eventually(async () => (await s.page.$eval("#timeline-body", (n) => n.textContent)).includes("Test stay value A"));
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
      const dom = await s.page.evaluate(() => ({
        title: document.querySelector("#trip-title").textContent,
        decisions: [...document.querySelectorAll(".decision")].map((li) => ({
          head: li.querySelector("h4").textContent,
          status: li.querySelector(".d-status").textContent,
          resolution: li.querySelector(".d-resolution")?.textContent ?? null,
          options: [...li.querySelectorAll(".d-options li")].map((o) => o.textContent)
        })),
        discussion: [...document.querySelectorAll("#messages .msg--agent")].map((li) => ({
          role: li.querySelector(".author").textContent, time: li.querySelector(".msg-time").textContent,
          topic: li.querySelector(".msg-topic")?.textContent, text: li.querySelector(".msg-text").lastChild.textContent
        })),
        rows: [...document.querySelectorAll("#timeline-body tr")].map((tr) => [...tr.children].map((c) => c.textContent))
      }));
      const b = ctx.board;
      assert(dom.title === b.meta.title, "title differs");
      assert(dom.decisions.length === b.decisions.length, "decision count differs");
      let prices = 0;
      b.decisions.forEach((d, i) => {
        const r = dom.decisions[i];
        assert(r.head === `${d.id} ${d.topic}: ${d.question}`, `${d.id} heading differs`);
        assert(r.status === d.status, `${d.id} status differs`);
        assert((r.resolution ?? null) === (d.resolution ?? null), `${d.id} resolution differs`);
        assert(JSON.stringify(r.options) === JSON.stringify(d.options || []), `${d.id} options differ`);
        prices += (d.options || []).join(" ").match(/\$[\d,]+(\.\d+)?/g)?.length || 0;
      });
      b.discussion.forEach((d, i) => {
        const r = dom.discussion[i];
        assert(r && r.role === d.agent && r.time === d.time && r.topic === d.topic && r.text === d.text, `discussion ${i + 1} differs`);
      });
      ctx.seed.rows.forEach((row, i) => {
        assert(JSON.stringify(dom.rows[i]) === JSON.stringify([row.date, row.leg, row.transport, row.stay, row.activities, row.cost, row.status]), `timeline row ${row.id} differs`);
      });
      await close(s);
      return `Title, ${b.decisions.length} decisions (headings, statuses, resolution, ${prices} price strings with their check dates), ${b.discussion.length} seeded agent posts and ${ctx.seed.rows.length} timeline rows match the source files character for character.`;
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
          !known.has(b.id) && !b.dataset.vote && !b.dataset.action && !b.dataset.thread && b.type !== "submit").map((b) => b.outerHTML.slice(0, 80));
        return { emails, placeholders, dead, buttons: document.querySelectorAll("button").length };
      });
      assert(r.emails.length === 0, `email in UI: ${r.emails.length}`);
      assert(r.placeholders.length === 0, `placeholder text: ${r.placeholders}`);
      assert(r.dead.length === 0, `unwired buttons: ${r.dead}`);
      await close(s);
      return `0 email addresses in the rendered HTML (signed in as a test account); 0 placeholder strings; all ${r.buttons} buttons map to a handler (ids, data-vote, data-action, data-thread, or form submit).`;
    }
  },
  {
    name: "QC console free of errors during sign-in, post, reload",
    async run(ctx) {
      await baseline(ctx);
      const logs = [];
      const s = await newSession(ctx.browser, { member: "john", consoleLog: logs });
      await s.page.fill("#composer", "Console check message");
      await s.page.click("#composer-form .send");
      await eventually(async () => (await s.page.$$eval(".msg-flag--sending", (n) => n.length)) === 0 && (await s.page.$$eval(".msg-text", (ns) => ns.some((n) => n.textContent.includes("Console check message")))));
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
  }
];
