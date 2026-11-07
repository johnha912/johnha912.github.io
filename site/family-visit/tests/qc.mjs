// QC pass (run with --qc): layout, mobile, wiring, GSAP-blocked flow, seed fidelity, privacy, console.
// Screenshots go to site/family-visit/qc/.
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
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
  // One agent message with a topic, so the topic tag and filter chips are part of every QC screen.
  await admin.setDoc("threads/general/messages/qc-agent-topic-1", { id: "qc-agent-topic-1", threadId: "general", authorKind: "agent", role: "Itinerary & Food", category: "nyc", text: "Gợi ý vài quán ăn gần khách sạn ở New York.", replyTo: null, createdAt: new Date(), clientCreatedAt: Date.now(), deleted: false });
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
const ALLOWED = new Set(["john", "nickie", "johnny", "google", "visa", "cccd", "d1", "d2", "d3", "d4", "san", "jose", "new", "york", "niagara", "pennsylvania"]); // + place names used as topic labels
const pos = (page, sel) => page.$eval(sel, (n) => { const r = n.getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY, left: r.left, right: r.right, height: r.height }; });


/* ---------- B5 helpers: the route rail in the Date column ---------- */
// DOM + computed-style facts about the rail, read WITHOUT scrolling (a scroll-driven effect would hide here).
async function railDom(page) {
  return page.evaluate(() => {
    const rails = [...document.querySelectorAll("#timeline-body th.c-date .rail")];
    const vars = [];
    for (let n = rails[0]; n; n = n.parentElement) {
      const v = getComputedStyle(n).getPropertyValue("--rail").trim();
      if (v) vars.push(`${n.tagName.toLowerCase()}${n.className ? "." + String(n.className).split(" ")[0] : ""}=${v}`);
      if (n.style?.getPropertyValue("--rail")) vars.push(`inline on ${n.tagName}`);
    }
    return {
      count: rails.length,
      rows: document.querySelectorAll("#timeline-body tr[data-row]").length,
      line: rails.map((r) => { const c = getComputedStyle(r, "::before"); return { transform: c.transform, animation: c.animationName, transition: c.transitionDuration, display: c.display, height: c.height }; }),
      dots: rails.map((r) => getComputedStyle(r, "::after").display),
      railVars: vars
    };
  });
}
// Pixel proof: hide the stop dots, screenshot the Date column, and check every pixel row of the
// table body for the line (line column vs. the same cell 5 px to its right).
async function railPixels(page, ctx, file) {
  await page.evaluate(() => {
    const t = document.querySelector("#plan .table-wrap");
    window.scrollTo(0, t.getBoundingClientRect().top + scrollY - 70);
  });
  await page.waitForTimeout(1200);
  await page.locator("#plan .table-wrap").screenshot({ path: `${ctx.qcDir}/${file}` });
  const geo = await page.evaluate(() => {
    const style = document.createElement("style");
    style.id = "qc-hide-dots";
    style.textContent = ".rail::after { visibility: hidden !important; }";
    document.head.append(style);
    const ths = [...document.querySelectorAll("#timeline-body th.c-date")];
    const rail = ths[0].querySelector(".rail").getBoundingClientRect();
    const first = ths[0].getBoundingClientRect(), last = ths[ths.length - 1].getBoundingClientRect();
    return { x: Math.floor(rail.left), top: Math.ceil(first.top), bottom: Math.floor(last.bottom), vh: innerHeight, boundaries: ths.slice(1).map((t) => Math.round(t.getBoundingClientRect().top - first.top)) };
  });
  assert(geo.bottom <= geo.vh, `table body does not fit the viewport for the pixel check (${geo.top}-${geo.bottom} of ${geo.vh})`);
  const png = await page.screenshot({ clip: { x: geo.x, y: geo.top, width: 14, height: geo.bottom - geo.top } });
  await page.evaluate(() => document.getElementById("qc-hide-dots")?.remove());
  const res = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const px = (x, y) => { const i = (y * c.width + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
    const diff = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
    const gaps = [];
    for (let y = 0; y < c.height; y++) {
      const line = Math.max(diff(px(5, y), px(11, y)), diff(px(6, y), px(11, y)));
      if (line < 40) gaps.push(y);
    }
    return { height: c.height, gaps };
  }, png.toString("base64"));
  return { ...res, boundaries: geo.boundaries };
}

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
      await eventually(async () => (await s.page.$$eval(".decision", (n) => n.length)) === ctx.board.decisions.length && (await s.page.$$eval("#timeline-body tr[data-row]", (n) => n.length)) === ctx.seed.rows.length
        && (await s.page.$$eval("#messages .msg--agent", (n) => n.length)) === ctx.board.discussion.length + 1); // + the QC topic message
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
      assert(dom.title === "Chuyến thăm của ba mẹ, tháng 12/2026", "title differs"); // Static page title (trip meta no longer ships with the page).
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
        assert(r && r.role === ROLE_VI[d.agent] && r.topic === d.topic && r.text === d.text, `discussion ${i + 1} differs: ${JSON.stringify(r)}`); // role shown through the Vietnamese display map // Time not compared: seeded posts now carry a real Firestore timestamp instead of the fixture display string.
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
        // Every handler the app wires: ids, plus the data-* hooks (report sheet chips and close, thread toggles).
        const known = new Set(["signin-btn", "retry-btn", "signout-denied", "signout", "cancel-reply", "load-older", "to-top", "report-tab", "refresh-chat"]);
        const dead = [...document.querySelectorAll("button")].filter((b) =>
          !known.has(b.id) && !b.dataset.vote && !b.dataset.action && !b.dataset.dtoggle && !b.dataset.cat && !b.dataset.rcat && !b.dataset.thread
          && !b.hasAttribute("data-report-close") && b.type !== "submit").map((b) => b.outerHTML.slice(0, 80));
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
  },
  {
    name: "(u) the pinned summary (3 short sentences) shows in full without scrolling inside its box at 360 px and 390 px",
    async run(ctx) {
      await baseline(ctx, { proposal: false });
      // The owner's rule: at most 3 short sentences (settled route, biggest unlock, what is still open).
      const summary = "Tuyến đã chốt: San Jose → New York → Thác Niagara → Pennsylvania → San Jose. Mở khoá lớn nhất: ba mẹ đã có ngày bay (D1). Việc còn mở: chọn cách đi New York (D2) và chỗ ở (D4).";
      await admin.setDoc("threads/general", { title: "general", summary, summaryUpdatedAt: new Date(), updatedBy: "Coordinator" });
      const out = [];
      for (const width of [360, 390]) {
        const s = await newSession(ctx.browser, { member: "john", viewport: { width, height: 800 }, isMobile: true });
        await eventually(async () => (await s.page.$eval("#summary", (n) => n.textContent)).includes("Việc còn mở"), 15000);
        await s.page.evaluate(() => document.querySelector("#chat .chat-frame").scrollIntoView({ block: "start" }));
        await s.page.waitForTimeout(800);
        const m = await s.page.$eval("#summary", (n) => ({ sh: n.scrollHeight, ch: n.clientHeight, text: n.querySelector(".summary-text").textContent }));
        await s.page.locator("#chat .chat-frame").screenshot({ path: `${ctx.qcDir}/u-summary-${width}.png` });
        await close(s);
        assert(m.text === summary, `${width}px: summary text differs`);
        assert(m.sh <= m.ch, `${width}px: summary box scrolls (scrollHeight ${m.sh} > clientHeight ${m.ch})`);
        out.push(`${width}px: scrollHeight ${m.sh} <= clientHeight ${m.ch} (u-summary-${width}.png)`);
      }
      return `${summary.length}-character, 3-sentence summary shown in full. ${out.join("; ")}.`;
    }
  },
  {
    name: "(v) the Date-column rail is one continuous, static line (no transform, no --rail), also with GSAP blocked",
    async run(ctx) {
      // Every check runs and is reported (so a failing build still leaves its screenshots and numbers).
      const problems = [];
      // No orphaned references to the old scroll-drawn rail anywhere in the app's code.
      const src = ["motion.js", "app.js", "app.css"].map((f) => [f, readFileSync(join(SITE, "family-visit", f), "utf8")]);
      const orphans = src.filter(([, t]) => /--rail\b|railDraw|railTrigger/.test(t)).map(([f]) => f);
      if (orphans.length) problems.push(`rail scroll-draw references left in ${orphans}`);
      await baseline(ctx, { proposal: false });
      const runs = [
        { label: "360", viewport: { width: 360, height: 800 }, isMobile: true },
        { label: "1440", viewport: { width: 1440, height: 900 } },
        { label: "390-gsap-blocked-dark", viewport: { width: 390, height: 844 }, isMobile: true, blockGsap: true, dark: true }
      ];
      const out = [];
      for (const r of runs) {
        const s = await newSession(ctx.browser, { member: "john", viewport: r.viewport, isMobile: !!r.isMobile, blockGsap: !!r.blockGsap });
        if (r.dark) await s.page.emulateMedia({ colorScheme: "dark" });
        await eventually(async () => (await s.page.$$eval("#timeline-body tr[data-row]", (n) => n.length)) === ctx.seed.rows.length, 15000);
        await s.page.waitForTimeout(1500); // entrance motion settles; the page has NOT been scrolled
        const dom = await railDom(s.page);
        if (!(dom.count === dom.rows && dom.count > 0)) problems.push(`${r.label}: ${dom.count} rails for ${dom.rows} rows`);
        const moved = dom.line.filter((l) => l.transform !== "none" || l.animation !== "none" || l.display === "none");
        if (moved.length) problems.push(`${r.label}: rail line not static at the top of the page (${moved.length} rows, e.g. transform ${moved[0].transform})`);
        if (dom.railVars.length) problems.push(`${r.label}: --rail still set: ${dom.railVars}`);
        if (!dom.dots.every((d) => d !== "none")) problems.push(`${r.label}: a stop dot is missing`);
        const px = await railPixels(s.page, ctx, `v-rail-${r.label}.png`);
        if (px.gaps.length) problems.push(`${r.label}: ${px.gaps.length} of ${px.height} body pixel rows have no line (first at y=${px.gaps.slice(0, 6)}; row boundaries at ${px.boundaries})`);
        if (r.blockGsap && !(await s.page.evaluate(() => typeof window.gsap === "undefined"))) problems.push("GSAP loaded despite the block");
        await close(s);
        out.push(`${r.label}: ${dom.count} rows, line transform ${[...new Set(dom.line.map((l) => l.transform))].join("/")}, --rail ${dom.railVars.length ? dom.railVars.join(" ") : "none"}, ${px.height - px.gaps.length}/${px.height} body pixel rows on the line (v-rail-${r.label}.png)`);
      }
      assert(problems.length === 0, `${problems.join("; ")} || ${out.join("; ")}`);
      return `No --rail/railDraw in motion.js, app.js, app.css. ${out.join("; ")}.`;
    }
  },
  {
    name: "(y) long-thread chat scroll at 390 px with 4x CPU throttle: no long task > 200 ms, total long-task time at most half the base",
    async run(ctx) {
      const label = process.env.FV_B8_LABEL || "current";
      const reps = Number(process.env.FV_B8_REPS || 3);
      const runs = [];
      for (let i = 0; i < reps; i++) runs.push(await b8Scenario(ctx, i === 0 ? label : null));
      const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
      const sum = {
        label, at: new Date().toISOString(), reps, cpuThrottle: 4, viewport: "390x844",
        longTaskTotalMs: med(runs.map((r) => r.ltTotal)), longTaskMaxMs: Math.max(...runs.map((r) => r.ltMax)), longTaskCount: med(runs.map((r) => r.ltCount)),
        framesOver50ms: med(runs.map((r) => r.slowFrames)), worstFrameMs: Math.max(...runs.map((r) => r.worstFrame)),
        scriptMs: med(runs.map((r) => r.script)), layoutMs: med(runs.map((r) => r.layout)), styleMs: med(runs.map((r) => r.style)),
        messagesRendered: med(runs.map((r) => r.rendered)), runs
      };
      writeFileSync(join(ctx.qcDir, `b8-metrics-${label}.json`), JSON.stringify(sum, null, 1));
      const basePath = process.env.FV_B8_BASELINE || join(dirname(fileURLToPath(import.meta.url)), "b8-baseline.json");
      const detail = `${label}: long tasks median total ${sum.longTaskTotalMs} ms (count ${sum.longTaskCount}), worst ${sum.longTaskMaxMs} ms; frames > 50 ms: ${sum.framesOver50ms}, worst frame ${sum.worstFrameMs} ms; script ${sum.scriptMs} ms, layout ${sum.layoutMs} ms, style ${sum.styleMs} ms (medians of ${reps}; b8-metrics-${label}.json)`;
      if (process.env.FV_B8_MEASURE_ONLY) return `${detail}. Measure-only run (no pass criteria applied).`;
      assert(sum.longTaskMaxMs <= 200, `long task over 200 ms while scrolling: ${detail}`);
      assert(existsSync(basePath), `no base measurement at ${basePath}`);
      const base = JSON.parse(readFileSync(basePath, "utf8"));
      assert(sum.longTaskTotalMs <= base.longTaskTotalMs * 0.5, `total long-task time ${sum.longTaskTotalMs} ms is not <= 50% of the base ${base.longTaskTotalMs} ms: ${detail}`);
      return `${detail}. Base (${base.label}, ${base.commit || "?"}): total ${base.longTaskTotalMs} ms, worst ${base.longTaskMaxMs} ms -> ${Math.round((1 - sum.longTaskTotalMs / Math.max(1, base.longTaskTotalMs)) * 100)}% less long-task time.`;
    }
  }
];

// B8 scenario: ~120-message thread-heavy chat, scrolled bottom -> top -> bottom over ~10 s while new
// replies, acks and a vote land; long tasks (PerformanceObserver) and frame gaps (rAF) are recorded.
async function b8Scenario(ctx, shotLabel) {
  await baseline(ctx);
  const t0 = Date.now() - 3 * 3600 * 1000;
  const roles = ["Coordinator", "Flights & Travel", "Budget", "Scout — Research & Verification", "Itinerary & Food"];
  const people = ["john", "nickie", "johnny"];
  let n = 0;
  const at = () => { n += 1; return t0 + n * 20000; };
  const put = (id, data) => { const ms = at(); return admin.setDoc(`threads/general/messages/${id}`, { id, threadId: "general", replyTo: null, deleted: false, createdAt: new Date(ms), clientCreatedAt: ms, ...data }); };
  const writes = [];
  for (let i = 0; i < 30; i++) {
    const root = `b8-root-${i}`;
    writes.push(put(root, { authorKind: "human", authorId: people[i % 3], text: `Câu hỏi số ${i}: cả nhà xem giúp lịch ngày ${i % 12 + 1} nhé, có cần đổi giờ không?` }));
    writes.push(put(`b8-ack-${i}`, { authorKind: "agent", role: "Reception", kind: "ack", text: "Đã nhận tin. Tiếp nhận đã chuyển cho team — team đang xem và sẽ trả lời ngay tại đây.", replyTo: root }));
    writes.push(put(`b8-reply-${i}`, { authorKind: "agent", role: roles[i % roles.length], category: "general", text: `Trả lời cho câu ${i}: đã kiểm tra, phương án hiện tại vẫn ổn. Nếu muốn đổi, nhóm sẽ đưa đề xuất để cả nhà bỏ phiếu.`, replyTo: root }));
    writes.push(put(`b8-nested-${i}`, { authorKind: "human", authorId: people[(i + 1) % 3], text: `Cảm ơn, vậy giữ nguyên câu ${i}.`, replyTo: `b8-reply-${i}` }));
  }
  // Six proposal cards spread through the history (each card carries 6 vote buttons), as in the live chat.
  const sj = admin.cells(ctx.seed.rows.find((r) => r.id === "san-jose"));
  for (let i = 0; i < 6; i++) {
    writes.push(admin.seedProposal(`b8-proposal-${i}`, { summary: `Thử nghiệm: đề xuất số ${i}`, rowIds: ["san-jose"], createdAt: new Date(t0 + (i * 20 + 5) * 20000), changes: { "san-jose": { before: sj, after: { ...sj, stay: `Phương án ${i}` } } } }));
  }
  await Promise.all(writes);
  const s = await newSession(ctx.browser, { member: "john", viewport: { width: 390, height: 844 }, isMobile: true });
  await eventually(async () => (await s.page.$$eval("#messages > li[data-key]", (x) => x.length)) >= 50, 20000);
  await s.page.evaluate(() => document.querySelector("#chat .chat-frame").scrollIntoView({ block: "start" }));
  await s.page.waitForTimeout(2000);
  if (shotLabel) await s.page.screenshot({ path: `${ctx.qcDir}/y-chat-390-${shotLabel}.png` });
  const cdp = await s.context.newCDPSession(s.page);
  await cdp.send("Performance.enable");
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const metrics = async () => Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
  const m0 = await metrics();
  // FV_B8_TRACE=1: also record a Chrome trace of the scroll phase (diagnostics only).
  const trace = process.env.FV_B8_TRACE && shotLabel ? join(ctx.qcDir, `b8-trace-${shotLabel}.json`) : null;
  if (trace) await ctx.browser.startTracing(s.page, { path: trace, categories: ["devtools.timeline", "disabled-by-default-devtools.timeline", "v8.execute", "blink.user_timing"] });
  await s.page.evaluate(() => {
    window.__b8 = { lt: [], ltAt: [], muts: [], frames: [], stop: false, t0: performance.now() };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__b8.lt.push(e.duration); window.__b8.ltAt.push([Math.round(e.startTime - window.__b8.t0), Math.round(e.duration)]); } }).observe({ type: "longtask" });
    // Diagnostics: when the chat list changed and by how much (to attribute long tasks).
    new MutationObserver((ms) => {
      let added = 0, removed = 0;
      for (const m of ms) if (m.target.id === "messages") { added += m.addedNodes.length; removed += m.removedNodes.length; }
      if (added || removed) window.__b8.muts.push([Math.round(performance.now() - window.__b8.t0), added, removed]);
    }).observe(document.querySelector("#messages"), { childList: true });
    let last = performance.now();
    const tick = (t) => { window.__b8.frames.push(t - last); last = t; if (!window.__b8.stop) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  const scrolling = s.page.evaluate(async () => {
    const list = document.querySelector("#messages");
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const start = performance.now();
    while (performance.now() - start < 5000) { list.scrollBy(0, -140); await sleep(40); }
    while (performance.now() - start < 10000) { list.scrollBy(0, 140); await sleep(40); }
    window.__b8.stop = true;
  });
  // New activity while the reader scrolls: two agent replies, two acks, a new host message, one vote.
  const live = [
    () => put("b8-live-reply-1", { authorKind: "agent", role: "Coordinator", category: "general", text: "Cập nhật mới trong lúc đang đọc.", replyTo: "b8-root-29" }),
    () => put("b8-live-ack-1", { authorKind: "agent", role: "Reception", kind: "ack", text: "Đã nhận tin.", replyTo: "b8-root-28" }),
    () => admin.updateDoc("proposals/qc-proposal-1", { "votes.johnny": "ok", updatedBy: "johnny" }),
    () => put("b8-live-host-1", { authorKind: "human", authorId: "nickie", text: "Tin mới của Nickie." }),
    () => put("b8-live-reply-2", { authorKind: "agent", role: "Budget", category: "general", text: "Ngân sách vẫn trong mức đã bàn.", replyTo: "b8-root-27" }),
    () => put("b8-live-ack-2", { authorKind: "agent", role: "Reception", kind: "ack", text: "Đã nhận tin.", replyTo: "b8-live-host-1" })
  ];
  for (const w of live) { await new Promise((r) => setTimeout(r, 1400)); await w(); }
  await scrolling;
  if (trace) await ctx.browser.stopTracing();
  const m1 = await metrics();
  const r = await s.page.evaluate(() => ({ lt: window.__b8.lt, ltAt: window.__b8.ltAt, muts: window.__b8.muts, frames: window.__b8.frames, rendered: document.querySelectorAll("#messages > li[data-key]").length }));
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  if (shotLabel) {
    await s.page.$eval("#messages", (x) => { x.scrollTop = x.scrollHeight; });
    await s.page.waitForTimeout(800);
    await s.page.screenshot({ path: `${ctx.qcDir}/y-chat-390-${shotLabel}-after-scroll.png` });
  }
  await close(s);
  const d = (k) => Math.round((m1[k] - m0[k]) * 1000);
  return {
    ltCount: r.lt.length, ltTotal: Math.round(r.lt.reduce((a, b) => a + b, 0)), ltMax: Math.round(Math.max(0, ...r.lt)),
    slowFrames: r.frames.filter((f) => f > 50).length, worstFrame: Math.round(Math.max(0, ...r.frames)), frames: r.frames.length,
    script: d("ScriptDuration"), layout: d("LayoutDuration"), style: d("RecalcStyleDuration"), rendered: r.rendered,
    longTasksAt: r.ltAt, listMutations: r.muts
  };
}
