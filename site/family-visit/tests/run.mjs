#!/usr/bin/env node
// Family Visit emulator test runner.
//
//   node site/family-visit/tests/run.mjs            # end-to-end suite (TEST-REPORT.md)
//   node site/family-visit/tests/run.mjs --qc       # suite + QC pass with screenshots (QC-REPORT.md)
//
// Needs: Node 18+, Java 11+, firebase-tools (set FIREBASE_BIN to its binary, default "firebase"),
// and Playwright with Chromium. Everything runs against the Local Emulator Suite; the live project
// is never contacted. The rules under test are ../../../firestore.rules with the three production
// member hashes swapped for the hashes of the fake test accounts below.

import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, extname, resolve, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../../..");
const SITE = join(REPO, "site");
export const BASE = "http://127.0.0.1:8770/family-visit/";
export const TEST_EMAILS = { john: "john@family-visit.test", nickie: "nickie@family-visit.test", johnny: "johnny@family-visit.test" };
export const STRANGER = "stranger@family-visit.test";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

/* ---------- test rules: production hashes -> test hashes ---------- */
function testRules() {
  const rules = readFileSync(join(REPO, "firestore.rules"), "utf8");
  let swapped = 0;
  const out = rules.replace(/'([0-9a-f]{64})': '(john|nickie|johnny)'/g, (_, _hash, member) => {
    swapped += 1;
    return `'${createHash("sha256").update(TEST_EMAILS[member]).digest("hex")}': '${member}'`;
  });
  if (swapped !== 3) throw new Error(`expected 3 member hashes in firestore.rules, found ${swapped}`);
  return out;
}

/* ---------- emulator ---------- */
async function waitFor(url, ms = 90000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try { await fetch(url); return; } catch { await new Promise((r) => setTimeout(r, 500)); }
  }
  throw new Error(`timed out waiting for ${url}`);
}

function startEmulator() {
  const dir = mkdtempSync(join(tmpdir(), "fv-emu-"));
  writeFileSync(join(dir, "firestore.rules"), testRules());
  writeFileSync(join(dir, "firebase.json"), JSON.stringify({
    firestore: { rules: "firestore.rules" },
    emulators: {
      auth: { host: "127.0.0.1", port: 9099 },
      firestore: { host: "127.0.0.1", port: 8080 },
      hub: { host: "127.0.0.1", port: 4400 },
      logging: { host: "127.0.0.1", port: 4500 },
      ui: { enabled: false }
    }
  }));
  const bin = process.env.FIREBASE_BIN || "firebase";
  const proc = spawn(bin, ["emulators:start", "--only", "auth,firestore", "--project", "demo-family-visit"], { cwd: dir, stdio: ["ignore", "pipe", "pipe"] });
  let log = "";
  proc.stdout.on("data", (d) => { log += d; });
  proc.stderr.on("data", (d) => { log += d; });
  return { proc, dir, log: () => log };
}

/* ---------- static server for site/ ---------- */
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
function startStatic() {
  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    let p = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
    let file = join(SITE, p);
    if (!file.startsWith(SITE)) { res.writeHead(403).end(); return; }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!existsSync(file)) { res.writeHead(404).end("not found"); return; }
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(readFileSync(file));
  });
  return new Promise((r) => server.listen(8770, "127.0.0.1", () => r(server)));
}

/* ---------- browser + tiny test framework ---------- */
export async function launch() {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  return chromium.launch(proxy ? { proxy: { server: proxy, bypass: "127.0.0.1,localhost" } } : {});
}

export async function newSession(browser, { member = null, email = null, viewport = { width: 1280, height: 900 }, path = "", blockGsap = false, isMobile = false, consoleLog = null } = {}) {
  const context = await browser.newContext({ viewport, ignoreHTTPSErrors: true, isMobile, hasTouch: isMobile, deviceScaleFactor: 1 });
  if (blockGsap) await context.route(/cdn\.jsdelivr\.net\/npm\/gsap/, (r) => r.abort());
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`console: ${m.text()}`); consoleLog?.push(`${m.type()}: ${m.text()}`); });
  await page.goto(BASE + path);
  const who = email || (member ? TEST_EMAILS[member] : null);
  if (who) {
    await page.waitForFunction(() => window.fvTest, null, { timeout: 30000 });
    await page.evaluate((e) => window.fvTest.signIn(e), who);
    if (member) await page.waitForSelector("#screen-board:not([hidden])", { timeout: 30000 });
  }
  return { context, page, errors };
}

export async function harness(browser, email) {
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  await page.goto(BASE + "tests/harness.html");
  await page.waitForFunction(() => document.getElementById("status")?.textContent === "ready", null, { timeout: 30000 });
  if (email) {
    const r = await page.evaluate((e) => window.H.signIn(e), email);
    if (!r.ok) throw new Error(`harness sign-in failed: ${r.code}`);
  }
  const call = (fn, ...args) => page.evaluate(([f, a]) => window.H[f](...a), [fn, args]);
  return { context, page, call, close: () => context.close() };
}

export function assert(cond, msg) { if (!cond) throw new Error(msg); }
export async function eventually(fn, ms = 15000, step = 250) {
  const end = Date.now() + ms;
  let last;
  while (Date.now() < end) {
    try { const v = await fn(); if (v) return v; } catch (e) { last = e; }
    await new Promise((r) => setTimeout(r, step));
  }
  throw last || new Error("condition not met in time");
}

/* ---------- main ---------- */
// --serve: start the emulator (with test rules) and the static server, seed the baseline, and wait.
// Open http://127.0.0.1:8770/family-visit/ and sign in from the console with fvTest.signIn("john@family-visit.test").
async function serve() {
  const emu = startEmulator();
  await waitFor("http://127.0.0.1:8080/");
  await waitFor("http://127.0.0.1:9099/");
  await startStatic();
  const admin = await import("./admin.mjs");
  await admin.clearAll();
  await admin.seedBaseline(JSON.parse(readFileSync(join(SITE, "family-visit/timeline-seed.json"), "utf8")));
  console.log(`serving ${BASE} (emulator ready, baseline seeded). Ctrl-C to stop.`);
  process.on("SIGINT", () => { emu.proc.kill("SIGINT"); setTimeout(() => process.exit(0), 1500); });
}

async function main() {
  if (process.argv.includes("--serve")) return serve();
  const qc = process.argv.includes("--qc");
  const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);
  const emu = startEmulator();
  let server, browser;
  const results = [];
  try {
    await waitFor("http://127.0.0.1:8080/");
    await waitFor("http://127.0.0.1:9099/");
    server = await startStatic();
    browser = await launch();
    const seed = JSON.parse(readFileSync(join(SITE, "family-visit/timeline-seed.json"), "utf8"));
    const board = JSON.parse(readFileSync(join(SITE, "family-visit/board.json"), "utf8"));
    const ctx = { browser, seed, board, results, qcDir: join(SITE, "family-visit/qc") };
    mkdirSync(ctx.qcDir, { recursive: true });
    const suites = [await import("./e2e.mjs")];
    if (qc) suites.push(await import("./qc.mjs"));
    for (const suite of suites) {
      for (const t of suite.tests) {
        if (only && !t.name.includes(only)) continue;
        const start = Date.now();
        try {
          const detail = await t.run(ctx);
          results.push({ suite: suite.name, name: t.name, pass: true, ms: Date.now() - start, detail: detail || "" });
          console.log(`PASS  ${t.name} (${Date.now() - start} ms)${detail ? `\n      ${detail}` : ""}`);
        } catch (e) {
          results.push({ suite: suite.name, name: t.name, pass: false, ms: Date.now() - start, detail: e.stack || String(e) });
          console.log(`FAIL  ${t.name}\n      ${e.stack || e}`);
        }
      }
    }
  } finally {
    await browser?.close().catch(() => {});
    server?.close();
    emu.proc.kill("SIGINT");
    await new Promise((r) => setTimeout(r, 1500));
    if (!emu.proc.killed) emu.proc.kill("SIGKILL");
  }
  const failed = results.filter((r) => !r.pass).length;
  writeFileSync(join(HERE, "last-run.json"), JSON.stringify({ at: new Date().toISOString(), passed: results.length - failed, failed, results }, null, 1));
  console.log(`\n${results.length - failed} passed, ${failed} failed`);
  if (failed) console.log(`emulator log tail:\n${emu.log().slice(-3000)}`);
  process.exit(failed ? 1 : 0);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
