// Family Visit board (v2): Vietnamese UI. Sign-in, confirmed plan table, 3-of-3 proposals,
// one family chat (threads/general), decision details D1–D4.
import { firebaseConfig, FIREBASE_CDN, EMULATOR, usingEmulator, memberTable } from "./config.js";
import * as gate from "./gate.js";
// Modules changed in a release carry the same ?v= as app.js, so a cached older copy is never mixed in.
import * as motion from "./motion.js?v=13";
import { createConnection } from "./live.js?v=13";

/* ---------------- constants ---------------- */
// One chat. Other thread collections are legacy and are not shown (the rules still allow them).
const THREAD = "general";
// Agent role names are canonical English ids in the data; this maps them to display names and colors.
const AGENTS = {
  "Coordinator": { key: "coordinator", vi: "Điều phối" },
  "Flights & Travel": { key: "flights", vi: "Vé & Di chuyển" },
  "Stay & Home Prep": { key: "stay", vi: "Chỗ ở & Chuẩn bị nhà" },
  "Itinerary & Food": { key: "itinerary", vi: "Lịch trình & Ăn uống" },
  "Budget": { key: "budget", vi: "Ngân sách" },
  "Scout — Research & Verification": { key: "scout", vi: "Kiểm chứng thông tin" },
  "Visa & Documents": { key: "visa", vi: "Visa & Giấy tờ" },
  "Reception": { key: "reception", vi: "Tiếp nhận" }
};
// One chat, but agents tag each of their messages with a topic (field `category`, one of these ids).
// The chat shows the tag and offers a filter; a reply takes the topic of the message it answers.
const CATEGORIES = {
  "flights": "Vé máy bay", "san-jose": "San Jose", "nyc": "New York", "niagara-falls": "Thác Niagara",
  "pennsylvania": "Pennsylvania", "budget": "Ngân sách", "documents-visa": "Giấy tờ & Visa", "general": "Chung"
};
const roleName = (role) => AGENTS[role]?.vi || role || "Nhóm trợ lý";
const PAGE_SIZE = 50;
const fast = usingEmulator() && new URLSearchParams(location.search).get("timing") === "fast";
const TIMING = fast
  ? { backoffBaseMs: 1000, backoffMaxMs: 30000, staleMs: 3000, pollAfterMs: 6000, pollMs: 5000, bootMs: 4000, presenceMs: 45000, presenceStaleMs: 90000 }
  : { backoffBaseMs: 1000, backoffMaxMs: 30000, staleMs: 10000, pollAfterMs: 60000, pollMs: 30000, bootMs: 8000, presenceMs: 45000, presenceStaleMs: 90000 };
const LS = {
  member: "fv-member",
  plan: "fv-plan-cache",
  draft: "fv-draft-general"
};
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

/* ---------------- tiny DOM helpers ---------------- */
const $ = (sel, root = document) => root.querySelector(sel);
function h(tag, attrs = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) node.append(kid);
  return node;
}
// Content from the database is marked data-c (used by the QC language audit to tell UI words from data).
const dc = (tag, attrs, text) => h(tag, { ...attrs, "data-c": "" }, text);
const store = {
  get(key, fallback = null) { try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } },
  del(key) { try { localStorage.removeItem(key); } catch { /* storage unavailable */ } },
  clearAll() { try { Object.keys(localStorage).filter((k) => k.startsWith("fv-")).forEach((k) => localStorage.removeItem(k)); } catch { /* storage unavailable */ } }
};
const fmtClock = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" });
// "7/11 lúc 09:14"
function fmtTime(ms) {
  const d = new Date(ms);
  return `${d.getDate()}/${d.getMonth() + 1} lúc ${fmtClock.format(d)}`;
}
const tsMs = (t) => (t && typeof t.toMillis === "function") ? t.toMillis() : (typeof t === "number" ? t : null);
function ago(ms) {
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return "vừa xong";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} phút trước`;
  const hr = Math.round(m / 60);
  if (hr < 48) return `${hr} giờ trước`;
  return fmtTime(ms);
}
function newId() {
  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return Array.from(bytes, (b) => abc[b % abc.length]).join("");
}
async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

/* ---------------- state ---------------- */
const S = {
  fb: null, auth: null, db: null, conn: null,
  member: null,
  rows: new Map(), rowsFromServer: false, tableMeta: null,
  proposals: new Map(),
  decisions: [],
  summaryDoc: null,
  typingDoc: null,
  heartbeat: null,
  presence: new Map(),
  msgs: new Map(), pending: new Set(),
  oldestDoc: null, moreOlder: false, olderLoaded: false, loadingOlder: false,
  replyTo: null, editing: null, confirmDelete: null,
  voteBusy: new Set(), voteMsg: new Map(),
  dOpen: new Set(),
  expandedThreads: new Set(),
  refreshing: false, lastRefresh: null,
  catFilter: null,
  remindersTried: new Set(),
  snapshotMode: false, booted: false,
  presenceTimer: null, clockTimer: null
};

/* ---------------- screens ---------------- */
function show(id) {
  for (const s of document.querySelectorAll("[data-screen]")) s.hidden = s.id !== id;
  // The report tab belongs to the board only: never on the sign-in / denied / loading screens.
  const tab = $("#report-tab");
  if (tab) tab.hidden = id !== "screen-board";
  if (id !== "screen-board") closeReportSheet();
  motion.startBackdrop();
  if (id !== "screen-board") {
    $("#dock").hidden = true;
    motion.gateIntro(document.querySelector(`#${id} .gate-card`));
  }
}

/* ---------------- boot ---------------- */
// Plan data lives only in Firestore (owner decision, Nov 7, 2026): no seed files ship with the page.
async function boot() {
  wireStaticUi();
  let fb;
  try {
    fb = await withTimeout(loadFirebase(), 12000);
  } catch (err) {
    console.warn("[family-visit] Firebase SDK could not load:", err?.message || err);
    noBackend("sdk");
    return;
  }
  S.fb = fb;
  const appConfig = usingEmulator() ? { ...firebaseConfig, projectId: EMULATOR.projectId } : firebaseConfig;
  const app = fb.app.initializeApp(appConfig);
  S.auth = fb.auth.getAuth(app);
  S.auth.languageCode = "vi";
  let db;
  try {
    db = fb.fs.initializeFirestore(app, { localCache: fb.fs.persistentLocalCache({ tabManager: fb.fs.persistentMultipleTabManager() }) });
  } catch {
    db = fb.fs.getFirestore(app);
  }
  S.db = db;
  if (usingEmulator()) {
    fb.auth.connectAuthEmulator(S.auth, `http://${EMULATOR.host}:${EMULATOR.authPort}`, { disableWarnings: true });
    fb.fs.connectFirestoreEmulator(db, EMULATOR.host, EMULATOR.firestorePort);
    window.fvTest = {
      signIn: (email) => fb.auth.signInWithCredential(S.auth, fb.auth.GoogleAuthProvider.credential(JSON.stringify({ sub: `test-${email}`, email, email_verified: true }))),
      state: () => ({ conn: S.conn?.state() || null, member: S.member, snapshot: S.snapshotMode }),
      // Drops the current server connection (the SDK reconnects on its own), like a network blip.
      dropConnection: async () => { await fb.fs.disableNetwork(db); await fb.fs.enableNetwork(db); },
      // Result of the last tap on "Làm mới" ({ ok, fromServer, fetched, added }).
      lastRefresh: () => S.lastRefresh
    };
  }

  // If auth cannot settle (no network, nothing cached), do not leave the loading screen up forever.
  const authTimer = setTimeout(() => { if (!S.booted) noBackend("auth"); }, TIMING.bootMs + 4000);
  fb.auth.onAuthStateChanged(S.auth, (user) => { clearTimeout(authTimer); handleUser(user); }, () => { clearTimeout(authTimer); noBackend("auth"); });
}

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))]);
}

async function loadFirebase() {
  const [app, auth, fs] = await Promise.all([
    import(`${FIREBASE_CDN}/firebase-app.js`),
    import(`${FIREBASE_CDN}/firebase-auth.js`),
    import(`${FIREBASE_CDN}/firebase-firestore.js`)
  ]);
  return { app, auth, fs };
}

/* ---------------- auth ---------------- */
const NO_SIGNIN = "Hiện không kết nối được với Google để đăng nhập. Hãy kiểm tra mạng, rồi tải lại trang.";

async function handleUser(user) {
  S.booted = true;
  if (!user) { teardown(); S.member = null; show("screen-signin"); return; }
  const email = (user.email || "").toLowerCase();
  const member = email ? memberTable()[await sha256Hex(email)] : null;
  if (!member) { teardown(); clearRendered(); S.member = null; store.clearAll(); show("screen-denied"); return; }
  if (S.member === member && S.conn) return;
  S.member = member;
  store.set(LS.member, member);
  S.snapshotMode = false;
  show("screen-board");
  $("#who").textContent = gate.NAMES[member];
  renderAll();
  startLive();
  // The page opens on the plan, never scrolled down into the chat.
  if (!location.hash) scrollTo(0, 0);
  motion.boardIntro();
}

async function signIn() {
  const err = $("#signin-error");
  err.textContent = "";
  if (S.needsReload) { location.reload(); return; }
  if (!S.fb) { err.textContent = NO_SIGNIN; return; }
  const { auth: A } = S.fb;
  const provider = new A.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    await A.signInWithPopup(S.auth, provider);
  } catch (e) {
    if (e?.code === "auth/popup-blocked" || e?.code === "auth/operation-not-supported-in-this-environment") {
      await A.signInWithRedirect(S.auth, provider);
    } else if (e?.code !== "auth/popup-closed-by-user" && e?.code !== "auth/cancelled-popup-request") {
      err.textContent = e?.code === "auth/network-request-failed"
        ? "Cần có mạng để đăng nhập. Hãy kiểm tra kết nối rồi thử lại."
        : "Đăng nhập chưa xong. Hãy thử lại.";
    }
  }
}

// Sign-out never waits on the network, and leaves nothing behind on a shared device:
// rendered content, localStorage, and Firestore's offline cache are all cleared, then the page reloads.
async function signOut() {
  if (S.member && S.db && S.conn?.isLive()) writePresence("offline").catch(() => {});
  teardown();
  clearRendered();
  store.clearAll();
  S.member = null;
  // The sign-in screen appears only once Firebase has dropped the saved session on this device;
  // showing it earlier let a quick reload (or closing the tab) come back still signed in.
  $("#screen-loading p:last-child").textContent = "Đang đăng xuất…";
  show("screen-loading");
  try { if (S.auth) await withTimeout(S.fb.auth.signOut(S.auth), 3000); } catch { /* fall back to the reload below */ }
  show("screen-signin");
  try {
    if (S.db) {
      await withTimeout(S.fb.fs.terminate(S.db), 3000);
      await withTimeout(S.fb.fs.clearIndexedDbPersistence(S.db), 3000);
    }
  } catch { /* the cache is cleared on the next load at the latest */ }
  // A fresh page resets Firebase. Offline, a reload would show the browser's "no internet" page,
  // so stay on the sign-in screen and reload once the connection is back (or on "Đăng nhập").
  if (navigator.onLine) location.reload();
  else {
    S.needsReload = true;
    addEventListener("online", () => location.reload(), { once: true });
  }
}

function clearRendered() {
  for (const sel of ["#timeline-body", "#pending-strip", "#decisions", "#summary", "#presence"]) $(sel)?.replaceChildren();
  $("#refresh-status").textContent = "";
  $("#messages").replaceChildren($("#load-older-wrap"));
  $("#who").textContent = "";
  $("#table-meta").textContent = "";
}

function teardown() {
  S.conn?.stop(); S.conn = null;
  clearInterval(S.presenceTimer); S.presenceTimer = null;
  S.msgs.clear(); S.pending.clear(); S.proposals.clear(); S.rows.clear(); S.presence.clear();
  S.decisions = []; S.summaryDoc = null; S.typingDoc = null; S.expandedThreads.clear();
  S.rowsFromServer = false; S.tableMeta = null; S.oldestDoc = null; S.moreOlder = false; S.olderLoaded = false;
}

/* ---------------- no backend: offline snapshot ---------------- */
function noBackend(reason) {
  S.booted = true;
  const member = store.get(LS.member);
  if (!member) {
    show("screen-signin");
    $("#signin-error").textContent = NO_SIGNIN;
    return;
  }
  enterSnapshot(member, reason);
}

function enterSnapshot(member, reason) {
  S.snapshotMode = true;
  S.member = S.member || member;
  show("screen-board");
  $("#who").textContent = gate.NAMES[S.member] || "";
  const cache = store.get(LS.plan);
  S.rows.clear();
  if (cache?.rows?.length) {
    for (const r of cache.rows) S.rows.set(r.id, r);
    S.tableMeta = { version: cache.version, updatedBy: cache.updatedBy, savedAt: cache.savedAt };
  }
  if (cache?.decisions?.length) S.decisions = cache.decisions;
  const notice = $("#snapshot-notice");
  notice.hidden = false;
  notice.textContent = cache?.rows?.length
    ? `Bản lưu ngoại tuyến: hiện không kết nối được máy chủ, nên đây là kế hoạch lưu gần nhất trên máy này (${fmtTime(cache.savedAt)}). Trang tự cập nhật khi có mạng lại.`
    : "Bản lưu ngoại tuyến: hiện không kết nối được máy chủ và máy này chưa lưu kế hoạch nào. Trang tự cập nhật khi có mạng lại.";
  setConnLabel(reason === "sdk" ? "Bản lưu ngoại tuyến (không tới được dịch vụ đăng nhập)" : "Bản lưu ngoại tuyến");
  renderAll();
}

function leaveSnapshot() {
  if (!S.snapshotMode) return;
  S.snapshotMode = false;
  $("#snapshot-notice").hidden = true;
}

/* ---------------- live data ---------------- */
function startLive() {
  const { fs } = S.fb;
  const db = S.db;
  S.conn?.stop();
  S.conn = createConnection({
    fs, db, timing: TIMING,
    onState: (s) => { renderConn(s); if (s === "live") leaveSnapshot(); },
    onDenied: () => handleDenied()
  });
  renderConn(S.conn.state());
  const c = S.conn;

  c.watch("heartbeat", fs.doc(db, "meta", "heartbeat"), (snap) => {
    S.heartbeat = snap.exists() ? snap.data({ serverTimestamps: "estimate" }) : null;
    renderStatus();
  }, { isDoc: true, canary: true });

  c.watch("rows", fs.query(fs.collection(db, "planRows"), fs.orderBy("order")), (snap, info) => {
    // An empty cache must not replace the offline snapshot that is already on screen.
    if (S.snapshotMode && info.fromCache && !snap.docs.length) return;
    S.rows.clear();
    for (const d of snap.docs) S.rows.set(d.id, { id: d.id, ...d.data({ serverTimestamps: "estimate" }) });
    S.rowsFromServer = S.rowsFromServer || !info.fromCache;
    if (snap.docs.length) leaveSnapshotIfData();
    renderTable(); renderStrip();
    if (S.flashNext?.length) { motion.flashRows(S.flashNext.map((id) => document.querySelector(`#timeline-body tr[data-row="${id}"]`))); S.flashNext = []; }
    savePlanCache();
  });

  c.watch("tableMeta", fs.doc(db, "planMeta", "table"), (snap) => {
    S.tableMeta = snap.exists() ? snap.data({ serverTimestamps: "estimate" }) : null;
    renderTableMeta(); savePlanCache();
  }, { isDoc: true });

  c.watch("proposals", fs.query(fs.collection(db, "proposals"), fs.orderBy("createdAt", "desc"), fs.limit(50)), (snap) => {
    const before = new Map(S.proposals);
    S.proposals.clear();
    for (const d of snap.docs) {
      const p = { id: d.id, ...d.data({ serverTimestamps: "estimate" }) };
      p.createdAtMs = tsMs(p.createdAt);
      S.proposals.set(d.id, p);
    }
    renderStrip(before);
    renderMessages();
    maybeSendReminders();
    // Rows a proposal just changed glow once when the table catches up.
    for (const p of S.proposals.values()) {
      if (p.status === "applied" && before.get(p.id)?.status === "pending") S.flashNext = [...(S.flashNext || []), ...(p.rowIds || [])];
    }
  });

  c.watch("decisions", fs.collection(db, "decisions"), (snap, info) => {
    if (S.snapshotMode && info.fromCache && !snap.docs.length) return;
    S.decisions = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));
    renderDecisions();
    // D-references in the table and proposal cards become links once the decision ids are known.
    renderTable(); renderStrip(); renderMessages();
    savePlanCache();
  });

  c.watch("summary", fs.doc(db, "threads", THREAD), (snap) => {
    S.summaryDoc = snap.exists() ? snap.data({ serverTimestamps: "estimate" }) : null;
    renderSummary();
  }, { isDoc: true });

  c.watch("typing", fs.doc(db, "meta", "typing"), (snap) => {
    S.typingDoc = snap.exists() ? snap.data({ serverTimestamps: "estimate" }) : null;
    renderTyping();
  }, { isDoc: true });

  c.watch("presence", fs.collection(db, "presence"), (snap) => {
    S.presence.clear();
    for (const d of snap.docs) S.presence.set(d.id, d.data({ serverTimestamps: "estimate" }));
    renderPresence();
  });

  watchMessages();
  startPresence();

  // Backend reachable but nothing at all arrives (no server data, nothing cached): show the snapshot.
  setTimeout(() => {
    if (S.member && !S.rows.size && !S.rowsFromServer && S.conn && S.conn.state() !== "live") enterSnapshot(S.member, "backend");
  }, TIMING.bootMs);
}

// A refused listener: refresh the sign-in token once and start over; refused again means not a member.
async function handleDenied() {
  if (S.denyRetrying) return; // several listeners can be refused at once; one retry covers them all
  if (S.deniedOnce) {
    teardown(); clearRendered(); store.clearAll(); S.member = null;
    show("screen-denied");
    return;
  }
  S.deniedOnce = true;
  S.denyRetrying = true;
  S.conn?.stop(); S.conn = null;
  try { await S.auth.currentUser?.getIdToken(true); } catch { /* fall through to the retry */ }
  S.denyRetrying = false;
  if (S.member) startLive();
}

function leaveSnapshotIfData() {
  if (S.snapshotMode && S.conn?.isLive()) leaveSnapshot();
}

function savePlanCache() {
  if (!S.rowsFromServer || !S.rows.size) return;
  store.set(LS.plan, {
    rows: [...S.rows.values()].map((r) => ({ id: r.id, ...gate.pickCells(r) })),
    decisions: S.decisions,
    version: S.tableMeta?.version ?? null,
    updatedBy: S.tableMeta?.updatedBy ?? null,
    savedAt: Date.now()
  });
}

function watchMessages() {
  const { fs } = S.fb;
  S.msgs.clear(); S.pending.clear(); S.oldestDoc = null; S.moreOlder = false; S.olderLoaded = false;
  renderMessages(true);
  S.conn.watch("messages", fs.query(fs.collection(S.db, "threads", THREAD, "messages"), fs.orderBy("createdAt", "desc"), fs.limit(PAGE_SIZE)), (snap) => {
    for (const d of snap.docs) {
      S.msgs.set(d.id, { id: d.id, ...d.data({ serverTimestamps: "estimate" }) });
      if (d.metadata.hasPendingWrites) S.pending.add(d.id); else S.pending.delete(d.id);
    }
    // The cursor for "load earlier" is the oldest message in the live window (a first, cache-only
    // snapshot can hold just one message, so keep moving it until an older page has been loaded).
    if (!S.olderLoaded && snap.docs.length) S.oldestDoc = snap.docs[snap.docs.length - 1];
    if (snap.docs.length >= PAGE_SIZE && !S.olderLoaded) S.moreOlder = true;
    renderMessages();
  });
}

async function loadOlder() {
  if (S.loadingOlder || !S.moreOlder || !S.oldestDoc || !S.fb) return;
  const { fs } = S.fb;
  const list = $("#messages");
  // Read the scroll geometry before any DOM write, so it costs no forced layout.
  const prevHeight = list.scrollHeight;
  const prevTop = list.scrollTop;
  S.loadingOlder = true;
  renderLoadOlder();
  try {
    // From the server only: a cache read can be partial and would hide older history for good.
    const snap = await fs.getDocsFromServer(fs.query(fs.collection(S.db, "threads", THREAD, "messages"), fs.orderBy("createdAt", "desc"), fs.startAfter(S.oldestDoc), fs.limit(PAGE_SIZE)));
    for (const d of snap.docs) S.msgs.set(d.id, { id: d.id, ...d.data({ serverTimestamps: "estimate" }) });
    if (snap.docs.length) S.oldestDoc = snap.docs[snap.docs.length - 1];
    S.olderLoaded = true;
    S.moreOlder = snap.docs.length === PAGE_SIZE;
    renderMessages(false, { history: true });
    // Keep the message that was on screen in place: one layout read, then one write.
    list.scrollTop = prevTop + (list.scrollHeight - prevHeight);
  } catch {
    S.loadingOlder = false;
    renderLoadOlder();
    $("#load-older").textContent = "Cần có mạng để xem tin nhắn cũ. Chạm để thử lại.";
    return;
  }
  S.loadingOlder = false;
  renderLoadOlder();
}

/* ---------------- chat refresh button ---------------- */
// "Làm mới": reads the newest chat page, the pinned summary, the typing signal and the
// proposals straight from the server (not the cache), then jumps to the newest message.
// Useful when a phone was asleep or the live connection is stuck; harmless otherwise.
async function refreshChat() {
  const btn = $("#refresh-chat");
  const status = $("#refresh-status");
  if (S.refreshing) return;
  if (!S.conn || !S.fb || S.snapshotMode || !navigator.onLine) {
    status.textContent = "Chưa làm mới được: cần có mạng. Hãy thử lại khi có mạng.";
    S.lastRefresh = { ok: false, fromServer: false, reason: "offline" };
    return;
  }
  S.refreshing = true;
  btn.disabled = true; btn.setAttribute("aria-busy", "true");
  status.textContent = "Đang tải tin mới nhất…";
  const before = new Set(S.msgs.keys());
  try {
    const fetched = await withTimeout(S.conn.refresh(["messages", "summary", "typing", "proposals"]), 10000);
    const added = [...S.msgs.keys()].filter((id) => !before.has(id)).length;
    scrollToBottom(true);
    status.textContent = `Đã cập nhật lúc ${fmtClock.format(new Date())}${added ? `, có ${added} tin mới` : ""}.`;
    S.lastRefresh = { ok: true, fromServer: true, fetched: fetched.messages ?? 0, added };
  } catch {
    status.textContent = "Chưa làm mới được: cần có mạng. Hãy thử lại khi có mạng.";
    S.lastRefresh = { ok: false, fromServer: false, reason: "error" };
  } finally {
    S.refreshing = false;
    btn.disabled = false; btn.removeAttribute("aria-busy");
  }
}

/* ---------------- presence ---------------- */
function writePresence(state) {
  if (!S.fb || !S.db || !S.member) return Promise.resolve();
  const { fs } = S.fb;
  return fs.setDoc(fs.doc(S.db, "presence", S.member), { member: S.member, state, lastSeen: fs.serverTimestamp(), thread: THREAD });
}
// Heartbeats are written only while connected, so nothing piles up offline to flush later.
function heartbeat() {
  if (!S.conn?.isLive()) return;
  writePresence(document.visibilityState === "visible" ? "online" : "away").catch(() => {});
}
function startPresence() {
  clearInterval(S.presenceTimer);
  writePresence("online").catch(() => {});
  S.presenceTimer = setInterval(() => { heartbeat(); renderPresence(); }, TIMING.presenceMs);
}
document.addEventListener("visibilitychange", () => { if (S.member && !S.snapshotMode) heartbeat(); });
addEventListener("pagehide", () => { if (S.member && S.conn?.isLive()) writePresence("offline").catch(() => {}); });

// "online" lapses after 90 s without a heartbeat; "away" (hidden tabs, whose timers the browser slows) after 10 min.
function presenceOf(member) {
  const p = S.presence.get(member);
  if (!p) return "offline";
  const seen = tsMs(p.lastSeen) ?? 0;
  const limit = p.state === "away" ? 10 * 60 * 1000 : TIMING.presenceStaleMs;
  if (Date.now() - seen > limit) return "offline";
  return p.state;
}
const PRESENCE_VI = { online: "Trực tuyến", away: "Tạm vắng", offline: "Ngoại tuyến" };

/* ---------------- votes ---------------- */
const NEED_NET = "Bỏ phiếu cần có mạng. Hãy thử lại khi có mạng.";

async function castVote(pid, choice) {
  const p = S.proposals.get(pid);
  if (!p || S.voteBusy.has(pid)) return;
  if (!gate.canVote(p, S.member, choice)) return;
  if (S.snapshotMode || !navigator.onLine) { S.voteMsg.set(pid, NEED_NET); renderStrip(); renderMessages(); return; }
  const { fs } = S.fb;
  const db = S.db;
  const me = S.member;
  S.voteBusy.add(pid); S.voteMsg.delete(pid);
  renderStrip(); renderMessages();
  try {
    await fs.runTransaction(db, async (tx) => {
      const pRef = fs.doc(db, "proposals", pid);
      const pSnap = await tx.get(pRef);
      if (!pSnap.exists()) throw new Error("gone");
      const cur = pSnap.data();
      if (cur.status !== "pending") throw new Error("frozen");
      if (!gate.canVote(cur, me, choice)) throw new Error("not-allowed");
      const result = gate.outcomeAfterVote(cur.votes, me, choice);
      if (result.status === "rejected") {
        tx.update(pRef, { votes: result.votes, status: "rejected", rejectedAt: fs.serverTimestamp(), updatedBy: me });
        return;
      }
      if (result.status === "pending") {
        tx.update(pRef, { votes: result.votes, updatedBy: me });
        return;
      }
      // Third OK: apply every row change and bump the table version in this same transaction.
      const tRef = fs.doc(db, "planMeta", "table");
      const tSnap = await tx.get(tRef);
      if (!tSnap.exists()) throw new Error("no-table");
      const rowSnaps = {};
      for (const id of cur.rowIds) rowSnaps[id] = await tx.get(fs.doc(db, "planRows", id));
      const current = {};
      for (const id of cur.rowIds) current[id] = rowSnaps[id].exists() ? rowSnaps[id].data() : null;
      if (!cur.rowIds?.length || cur.rowIds.length > 4) throw new Error("too-big");
      if (!gate.proposalStillFits(cur, current)) throw new Error("stale");
      const version = (tSnap.data().version || 0) + 1;
      tx.update(tRef, { version, updatedAt: fs.serverTimestamp(), updatedBy: me, lastProposal: pid });
      for (const id of cur.rowIds) {
        const prev = current[id];
        tx.set(fs.doc(db, "planRows", id), {
          ...cur.changes[id].after,
          version: prev ? (prev.version || 0) + 1 : 1,
          updatedBy: me,
          updatedAt: fs.serverTimestamp(),
          appliedProposal: pid
        });
      }
      tx.update(pRef, { votes: result.votes, status: "applied", appliedAt: fs.serverTimestamp(), appliedVersion: version, updatedBy: me });
    });
  } catch (e) {
    const code = e?.message || e?.code || "";
    const text = {
      frozen: "Đề xuất này đã đóng.",
      gone: "Đề xuất này không còn nữa.",
      stale: "Bảng đã thay đổi sau khi có đề xuất này, nên bấm Đồng ý không áp dụng được. Hãy bấm Không để đóng; nhóm trợ lý sẽ đưa đề xuất mới.",
      "too-big": "Đề xuất này thay đổi quá nhiều dòng một lúc (tối đa 4). Hãy bấm Không để đóng; nhóm trợ lý sẽ chia nhỏ ra.",
      "no-table": "Bảng kế hoạch chưa được thiết lập, nên chưa áp dụng được thay đổi này.",
      "not-allowed": "Bạn không bỏ được phiếu này."
    }[code] || (e?.code === "unavailable" ? NEED_NET : "Phiếu của bạn chưa được ghi nhận. Hãy thử lại.");
    S.voteMsg.set(pid, text);
  } finally {
    S.voteBusy.delete(pid);
    renderStrip(); renderMessages();
  }
}

// One reminder per proposal pending for over 72 hours (the server allows exactly one). The stored
// text is the fixed template the rules require; the chat shows it in Vietnamese (reminderDisplay).
async function maybeSendReminders() {
  if (!S.conn?.isLive() || !S.fb) return;
  const { fs } = S.fb;
  for (const p of S.proposals.values()) {
    if (!gate.reminderDue(p, Date.now()) || S.remindersTried.has(p.id) || typeof p.threadId !== "string") continue;
    S.remindersTried.add(p.id);
    const id = `reminder-${p.id}`;
    const batch = fs.writeBatch(S.db);
    batch.set(fs.doc(S.db, "threads", p.threadId, "messages", id), {
      id, threadId: p.threadId, authorKind: "agent", role: "Coordinator", kind: "reminder", proposalId: p.id,
      text: gate.reminderText(p.summary), replyTo: null, createdAt: fs.serverTimestamp(), clientCreatedAt: Date.now(), deleted: false
    });
    batch.update(fs.doc(S.db, "proposals", p.id), { reminderSent: true });
    batch.commit().catch((e) => {
      // permission-denied means another session sent it first (or it isn't due): done. Anything else: retry later.
      if (e?.code !== "permission-denied") S.remindersTried.delete(p.id);
    });
  }
}
function reminderDisplay(m) {
  const p = S.proposals.get(m.proposalId);
  const summary = p?.summary ?? (/^Reminder: "(.*)" is still waiting/s.exec(m.text || "")?.[1] || "");
  return ["Nhắc nhở: đề xuất “", dc("span", {}, summary), "” đã chờ bỏ phiếu hơn 72 giờ. Hãy bấm Đồng ý hoặc Không ở phía trên bảng kế hoạch."];
}

/* ---------------- chat actions ---------------- */
// Threads start collapsed; this set holds the ones the reader opened. Replying into
// a thread opens it, so your own reply — and the team's answers landing under it —
// are never hidden from you.
function openThreadOf(messageId) {
  let m = S.msgs.get(messageId);
  let hops = 0;
  while (m?.replyTo && S.msgs.has(m.replyTo) && hops++ < 10) m = S.msgs.get(m.replyTo);
  if (m) S.expandedThreads.add(m.id);
}

function sendMessage(text) {
  const { fs } = S.fb;
  const id = newId();
  const data = {
    id, threadId: THREAD, authorKind: "human", authorId: S.member, text,
    replyTo: S.replyTo, createdAt: fs.serverTimestamp(), clientCreatedAt: Date.now(), deleted: false
  };
  // Client-generated id: offline sends queue on this device and land exactly once on reconnect.
  fs.setDoc(fs.doc(S.db, "threads", THREAD, "messages", id), data).catch((e) => {
    if (e?.code === "permission-denied") flash("Một tin nhắn không lưu được: máy chủ đã từ chối.");
  });
  if (S.replyTo) openThreadOf(S.replyTo);
  S.replyTo = null;
  renderReply();
  scrollToBottom(true);
}

function saveEdit(id, text) {
  const { fs } = S.fb;
  fs.updateDoc(fs.doc(S.db, "threads", THREAD, "messages", id), { text, editedAt: fs.serverTimestamp() }).catch(() => flash("Chưa lưu được chỉnh sửa. Hãy thử lại."));
  S.editing = null;
  renderMessages();
}

function deleteMessage(id) {
  const { fs } = S.fb;
  fs.updateDoc(fs.doc(S.db, "threads", THREAD, "messages", id), { deleted: true, text: "", deletedAt: fs.serverTimestamp() }).catch(() => flash("Chưa xoá được tin nhắn. Hãy thử lại."));
  S.confirmDelete = null;
  renderMessages();
}

/* ---------------- report issue (Báo lỗi tab) ---------------- */
// A report is a single Firestore doc in `issues`; the agent team's watcher picks it up
// from there and replies on this board. Shape is fixed by the security rules.
let reportCategory = "other";
function openReportSheet() {
  const sheet = $("#report-sheet");
  if (!sheet.hidden) return;
  sheet.hidden = false;
  $("#report-error").textContent = "";
  $("#report-done").hidden = true;
  setTimeout(() => $("#report-text").focus(), 60);
}
function closeReportSheet() {
  const sheet = $("#report-sheet");
  if (sheet) sheet.hidden = true;
}
function reportError(text) { $("#report-error").textContent = text; }

// Resolves once the live connection is up, or after `ms` (whichever comes first).
async function waitForLive(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end && S.conn && !S.conn.isLive() && navigator.onLine) await new Promise((r) => setTimeout(r, 200));
}

async function submitReport(text) {
  const { fs } = S.fb;
  const id = newId();
  const data = {
    id, reporter: S.member, category: reportCategory, text, status: "open",
    createdAt: fs.serverTimestamp(), clientCreatedAt: Date.now(),
    userAgent: String(navigator.userAgent || "").slice(0, 300), appVersion: "v14"
  };
  await fs.setDoc(fs.doc(S.db, "issues", id), data);
}

function flash(text) {
  const n = $("#composer-error");
  n.textContent = text;
  clearTimeout(flash.t);
  flash.t = setTimeout(() => { n.textContent = ""; }, 6000);
}

function saveDraft() {
  const v = $("#composer").value;
  if (v) store.set(LS.draft, v); else store.del(LS.draft);
}
function loadDraft() {
  const ta = $("#composer");
  ta.value = store.get(LS.draft, "");
  autoGrow(ta);
}
function autoGrow(ta) {
  ta.style.height = "auto";
  ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
}

/* ---------------- D-references: "D1", "(D3)", "ở D4" become links to the decision card ---------------- */
const DREF = /\bD(\d{1,2})\b/g;
function withDLinks(text) {
  const str = String(text ?? "");
  const ids = new Set(S.decisions.map((d) => d.id));
  const out = [];
  let last = 0;
  for (const m of str.matchAll(DREF)) {
    const id = `D${m[1]}`;
    if (!ids.has(id)) continue;
    if (m.index > last) out.push(str.slice(last, m.index));
    out.push(h("a", { class: "dref", href: `#decision-${id}`, "data-dref": id, "aria-label": `Xem quyết định ${id}` }, id));
    last = m.index + m[0].length;
  }
  if (last < str.length) out.push(str.slice(last));
  return out;
}
const dcLinked = (tag, attrs, text) => h(tag, { ...attrs, "data-c": "" }, ...withDLinks(text));

function goToDecision(id) {
  let card = document.getElementById(`decision-${id}`);
  if (!card) return;
  // Arriving from a link opens the card's full details.
  if (!S.dOpen.has(id)) { S.dOpen.add(id); renderDecisions(); card = document.getElementById(`decision-${id}`); }
  motion.scrollTo(card, topOffset());
  card.focus({ preventScroll: true });
  card.classList.remove("decision--flash");
  void card.offsetWidth; // restart the highlight if tapped twice
  card.classList.add("decision--flash");
  clearTimeout(goToDecision.t);
  goToDecision.t = setTimeout(() => card.classList.remove("decision--flash"), 2000);
  history.replaceState(null, "", `#decision-${id}`);
}

/* ---------------- rendering: title & status ---------------- */
function renderAll() {
  renderConn(S.conn?.state() || (S.snapshotMode ? "snapshot" : "connecting")); renderStatus();
  renderStrip(); renderTable(); renderTableMeta(); renderDecisions();
  renderPresence(); renderSummary(); renderMessages(true); renderReply(); loadDraft();
}

const CONN_LABELS = {
  connecting: "Đang kết nối",
  live: "Trực tuyến",
  offline: "Ngoại tuyến",
  reconnecting: "Đang kết nối lại…",
  polling: "Mất cập nhật trực tiếp, tự kiểm tra mỗi 30 giây",
  snapshot: "Bản lưu ngoại tuyến"
};
function renderConn(state) {
  if (S.snapshotMode && state !== "live") setConnLabel(CONN_LABELS.snapshot);
  else setConnLabel(CONN_LABELS[state] || state);
  const banner = $("#banner");
  const text = {
    offline: "Bạn đang ngoại tuyến. Tin nhắn mới sẽ chờ trên máy này và tự gửi khi có mạng lại. Bỏ phiếu thì cần có mạng.",
    reconnecting: "Đang kết nối lại…",
    polling: "Mất cập nhật trực tiếp. Trang tự kiểm tra thay đổi mỗi 30 giây."
  }[state];
  banner.hidden = !text;
  banner.textContent = text || "";
  banner.dataset.state = state;
  document.body.dataset.conn = state;
}
function setConnLabel(text) { $("#conn").textContent = text; }

function renderStatus() {
  const n = $("#agents-active");
  const ms = tsMs(S.heartbeat?.lastActive);
  n.textContent = ms ? `Nhóm trợ lý hoạt động lần cuối: ${ago(ms)}` : (S.snapshotMode ? "Không xem được hoạt động của nhóm trợ lý khi ngoại tuyến" : "Nhóm trợ lý chưa hoạt động");
}

function renderPresence() {
  const wrap = $("#presence");
  wrap.replaceChildren(...gate.MEMBERS.map((m) => {
    const st = m === S.member && !S.snapshotMode ? "online" : presenceOf(m);
    return h("li", { class: `pres pres--${st}`, title: `${gate.NAMES[m]}: ${PRESENCE_VI[st] || st}` },
      h("span", { class: "dot", "aria-hidden": "true" }), h("span", { text: gate.NAMES[m] }), h("span", { class: "sr-only", text: `: ${PRESENCE_VI[st] || st}` }));
  }));
}

/* ---------------- rendering: plan ---------------- */
function currentRows() {
  return [...S.rows.values()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
function rowsById() {
  const out = {};
  for (const r of currentRows()) out[r.id] = r;
  return out;
}

function renderTable() {
  const body = $("#timeline-body");
  const rows = currentRows();
  body.replaceChildren(...rows.map((r) => h("tr", { "data-row": r.id },
    h("th", { scope: "row", class: "c-date" }, h("span", { class: "rail", "aria-hidden": "true" }), dcLinked("span", { class: "date-text" }, r.date)),
    dcLinked("td", { class: "c-leg" }, r.leg),
    dcLinked("td", {}, r.transport),
    dcLinked("td", {}, r.stay),
    dcLinked("td", {}, r.activities),
    dcLinked("td", { class: "c-cost" }, r.cost),
    h("td", {}, dcLinked("span", { class: "row-status" }, r.status))
  )));
  if (!rows.length) {
    const text = S.snapshotMode ? "Máy này chưa lưu kế hoạch nào. Bảng sẽ hiện khi có mạng lại." : "Đang tải kế hoạch…";
    body.replaceChildren(h("tr", {}, h("td", { colspan: "7", class: "table-empty", text })));
  }
}

function renderTableMeta() {
  const n = $("#table-meta");
  const m = S.tableMeta;
  if (!m) { n.textContent = ""; return; }
  const by = gate.NAMES[m.updatedBy] || (m.updatedBy === "seed" ? null : roleName(m.updatedBy));
  const when = tsMs(m.updatedAt);
  n.textContent = by
    ? `Bảng phiên bản ${m.version}, ${by} cập nhật lần cuối${when ? ` ${fmtTime(when)}` : ""}.`
    : `Bảng phiên bản ${m.version ?? 1}, bản đầu tiên.`;
}

function voteWidget(p) {
  const me = S.member;
  const busy = S.voteBusy.has(p.id);
  const open = p.status === "pending" && !S.snapshotMode;
  const stateLabel = { pending: "Đang chờ", ok: "Đồng ý", no: "Không" };
  return h("div", { class: "votes", role: "group", "aria-label": "Phiếu bầu" },
    gate.MEMBERS.map((m) => {
      const v = p.votes?.[m] || "pending";
      const mine = m === me;
      const can = (c) => mine && open && !busy && gate.canVote(p, m, c);
      const btn = (c, label) => h("button", {
        type: "button", class: `vote vote--${c}`, "data-pid": p.id, "data-vote": c,
        "aria-pressed": String(v === c), disabled: !can(c),
        "aria-label": `${label}: ${gate.NAMES[m]}`,
        title: mine ? null : `Chỉ ${gate.NAMES[m]} mới bấm được ở đây`
      }, label);
      return h("div", { class: `vote-row vote-row--${v}${mine ? " vote-row--me" : ""}` },
        h("span", { class: "voter", text: mine ? `${gate.NAMES[m]} (bạn)` : gate.NAMES[m] }),
        h("span", { class: "vote-state", text: stateLabel[v] || v }),
        h("span", { class: "vote-buttons" }, btn("ok", "Đồng ý"), btn("no", "Không")));
    }));
}

function changeList(p) {
  const items = gate.describeChanges(p, rowsById());
  return h("ul", { class: "changes" }, items.map((c) => h("li", {},
    h("span", { class: "chg-where" }, dc("span", {}, c.rowLabel), `, ${gate.FIELD_LABELS[c.field]}: `),
    c.before === null ? h("span", { class: "chg-new", text: "dòng mới" }) : dcLinked("del", {}, c.before),
    h("span", { class: "chg-arrow", "aria-hidden": "true", text: " ⟶ " }), h("span", { class: "sr-only", text: " đổi thành " }),
    dcLinked("ins", {}, c.after))));
}

function proposalCard(p, where) {
  const statusText = { pending: "Đang chờ xác nhận", applied: "Đã áp dụng vào kế hoạch", rejected: "Bị từ chối, đã khoá" }[p.status] || p.status;
  const by = `Đề xuất bởi ${p.createdBy ? roleName(p.createdBy) : "nhóm trợ lý"}`;
  const created = p.createdAtMs ? `, ${fmtTime(p.createdAtMs)}` : "";
  const tail = p.status === "applied"
    ? `Đã áp dụng${p.appliedVersion ? ` thành bảng phiên bản ${p.appliedVersion}` : ""} sau khi cả ba cùng bấm Đồng ý.`
    : p.status === "rejected"
      ? `${gate.MEMBERS.filter((m) => p.votes?.[m] === "no").map((m) => gate.NAMES[m]).join(", ")} đã bấm Không. Bảng không thay đổi; nhóm trợ lý sẽ thảo luận và đưa ra đề xuất mới.`
      : "Bảng chỉ thay đổi khi cả John, Nickie và Johnny cùng bấm Đồng ý. Chỉ cần một người bấm Không là đề xuất này đóng lại.";
  const msg = S.voteMsg.get(p.id);
  const titleId = `ps-${where}-${p.id}`;
  return h("article", { class: `proposal proposal--${p.status}`, "data-pid": p.id, "data-where": where, "aria-labelledby": titleId },
    h("p", { class: "proposal-status", text: statusText }),
    dcLinked("h3", { class: "proposal-summary", id: titleId }, p.summary),
    changeList(p),
    voteWidget(p),
    h("p", { class: "proposal-foot", text: tail }),
    msg ? h("p", { class: "proposal-msg", role: "alert", text: msg }) : null,
    h("p", { class: "proposal-by", text: `${by}${created}` }));
}

function renderStrip(prevProposals) {
  const strip = $("#pending-strip");
  const pending = [...S.proposals.values()].filter((p) => p.status === "pending").sort((a, b) => (a.createdAtMs ?? 0) - (b.createdAtMs ?? 0));
  const wasEmpty = strip.hidden;
  strip.hidden = pending.length === 0;
  const cards = pending.map((p) => proposalCard(p, "strip"));
  strip.replaceChildren(h("h3", { class: "strip-title", text: `${pending.length} thay đổi đang chờ cả nhà bỏ phiếu` }), ...cards);
  if (pending.length && wasEmpty) motion.stripIn(strip);
  if (prevProposals) {
    for (const p of pending) {
      const old = prevProposals.get(p.id);
      const card = strip.querySelector(`[data-pid="${p.id}"]`);
      if (!old) motion.settleIn(card);
      else if (JSON.stringify(old.votes) !== JSON.stringify(p.votes)) motion.stateChanged(card);
    }
  }
}

// Decision cards, built for a first read: code + short topic, the question, a plain-language intro,
// a clear "decided / still open" pill, the conclusion when there is one, and the long option list
// folded behind one button. Every database string is rendered unchanged.
function renderDecisions(animate = false) {
  const list = $("#decisions");
  const nav = $("#d-nav");
  const decisions = S.decisions || [];
  if (!decisions.length) {
    nav.replaceChildren();
    list.replaceChildren(h("li", { class: "decisions-empty", text: S.snapshotMode ? "Máy này chưa lưu chi tiết quyết định nào." : "Chưa có quyết định nào được ghi lại." }));
    return;
  }
  const isResolved = (d) => d.resolved === true || d.status === "resolved";
  nav.replaceChildren(...decisions.map((d) => h("a", { class: `d-chip sheen${isResolved(d) ? " d-chip--done" : ""}`, href: `#decision-${d.id}`, "data-dref": d.id },
    h("span", { class: "d-chip-code", text: d.id }),
    dc("span", { class: "d-chip-topic" }, d.topic),
    isResolved(d) ? h("span", { class: "d-chip-mark", "aria-label": "đã chốt", text: "✓" }) : null)));

  const build = () => list.replaceChildren(...decisions.map((d) => {
    const resolved = isResolved(d);
    const open = S.dOpen.has(d.id);
    const options = d.options || [];
    const voteNames = Object.keys(d.votes || {});
    const voted = voteNames.filter((k) => d.votes[k] !== null && d.votes[k] !== undefined);
    return h("li", { class: `decision glass${resolved ? " decision--resolved" : ""}${open ? " decision--open" : ""}`, id: `decision-${d.id}`, tabindex: "-1" },
      h("div", { class: "d-head" },
        h("span", { class: "d-id d-code", text: d.id }),
        h("div", { class: "d-heading" },
          dc("h3", { class: "d-title" }, d.topic),
          dc("p", { class: "d-question" }, d.question)),
        h("span", { class: `d-pill ${resolved ? "d-pill--done" : "d-pill--open"}`, text: resolved ? "Đã chốt" : "Chưa chốt" })),
      d.intro ? dc("p", { class: "d-intro" }, d.intro) : null,
      d.resolution ? h("div", { class: "d-conclusion" }, h("span", { class: "d-label", text: "Kết luận" }), dc("p", {}, d.resolution)) : null,
      h("p", { class: "d-status" }, h("span", { class: "d-label", text: "Tình trạng" }), dc("span", { class: "d-status-text" }, d.status)),
      options.length ? h("button", {
        type: "button", class: "d-toggle sheen", "data-dtoggle": d.id, "aria-expanded": String(open), "aria-controls": `opts-${d.id}`
      }, open ? "Thu gọn" : `Xem chi tiết (${options.length} mục)`) : null,
      options.length ? h("ul", { class: "d-options", id: `opts-${d.id}`, hidden: !open }, options.map((o) => h("li", { "data-c": "" }, ...optionParts(o)))) : null,
      voteNames.length ? h("p", { class: "d-votes" }, voted.length ? dc("span", {}, voted.map((k) => `${k}: ${d.votes[k]}`).join(", ")) : "Chưa có ai bỏ phiếu.") : null);
  }));
  if (animate) motion.flipLayout("#decisions > li, #decisions .d-options li", build);
  else build();
  motion.reveal([...list.children]);
}

// Long options that list alternatives as "A | B | C" show one alternative per line. The separators
// stay in the text (hidden), so the content is character-for-character the database string.
function optionParts(text) {
  const parts = String(text).split(" | ");
  const out = [];
  parts.forEach((part, i) => {
    if (i) out.push(h("span", { class: "d-sep", "aria-hidden": "true", text: " | " }));
    out.push(h("span", { class: "d-seg" }, ...withDLinks(part)));
  });
  return out;
}

function toggleDecision(id) {
  if (S.dOpen.has(id)) S.dOpen.delete(id); else S.dOpen.add(id);
  renderDecisions(true);
}

/* ---------------- rendering: chat ---------------- */
function renderSummary() {
  const box = $("#summary");
  const doc = S.summaryDoc;
  if (doc?.summary) {
    const ms = tsMs(doc.summaryUpdatedAt);
    box.replaceChildren(
      h("p", { class: "summary-label", text: `Tóm tắt được ghim${doc.updatedBy ? `, bởi ${roleName(doc.updatedBy)}` : ""}${ms ? `, ${fmtTime(ms)}` : ""}` }),
      dc("p", { class: "summary-text" }, doc.summary));
  } else {
    box.replaceChildren(h("p", { class: "summary-empty", text: "Chưa có tóm tắt được ghim. Nhóm trợ lý sẽ ghim ở đây khi có điều cần theo dõi." }));
  }
}

function msgCategory(m, depth = 0) {
  if (m?.kind === "ack") return null;
  if (m && CATEGORIES[m.category]) return m.category;
  if (m?.kind === "reminder") return proposalCategory(S.proposals.get(m.proposalId));
  if (m?.replyTo && depth < 5) return msgCategory(S.msgs.get(m.replyTo), depth + 1);
  return null;
}
function proposalCategory(p) {
  if (!p) return null;
  if (CATEGORIES[p.category]) return p.category;
  return p.threadId && p.threadId !== "general" && CATEGORIES[p.threadId] ? p.threadId : null;
}

function renderCatFilter(counts) {
  const box = $("#cat-filter");
  const cats = Object.keys(CATEGORIES).filter((c) => counts[c]);
  if (S.catFilter && !counts[S.catFilter]) S.catFilter = null;
  // Rebuilt only when a count or the active chip changed: an unchanged chip row is not touched.
  const sig = JSON.stringify([S.catFilter, cats.map((c) => counts[c])]) + cats.join();
  if (box.dataset.sig === sig) return;
  box.dataset.sig = sig;
  box.hidden = cats.length === 0;
  const chip = (id, label) => h("button", { type: "button", class: "cat-chip", "data-cat": id, "aria-pressed": String((S.catFilter || "all") === id) }, label);
  box.replaceChildren(chip("all", "Tất cả"), ...cats.map((c) => chip(c, `${CATEGORIES[c]} (${counts[c]})`)));
}

function msgSortKey(m) {
  return tsMs(m.createdAt) ?? m.clientCreatedAt ?? 0;
}

// A reply's thread root never changes (replyTo is immutable), so the walk up the reply chain is
// cached per message id once it reaches a root. A chain cut by a not-yet-loaded parent is not
// cached; the cache is dropped when the topic filter changes or the chat is reset.
const threadRoots = { filter: null, map: new Map() };
// Same order as String#localeCompare, without its per-call setup cost.
const keyOrder = new Intl.Collator();
// The reader's distance from the bottom of the chat, kept by the scroll listener, so a render
// never has to read layout before it writes (no forced reflow on every snapshot).
let chatNearBottom = true;
const MAX_ENTRANCES = 4;

// history: the render that follows "load earlier messages" (those land above the screen).
function renderMessages(reset = false, { history = false } = {}) {
  const list = $("#messages");
  if (reset) chatNearBottom = true;
  const nearBottom = chatNearBottom;
  const items = [];
  const f = S.catFilter;
  const counts = {};
  const cats = new Map();
  for (const m of S.msgs.values()) {
    const c = msgCategory(m);
    cats.set(m.id, c);
    if (c) counts[c] = (counts[c] || 0) + 1;
    if (!f || c === f) items.push({ kind: "msg", key: m.id, sort: msgSortKey(m), m });
  }
  // One chat: every proposal appears in it, whichever legacy thread it was filed under.
  for (const p of S.proposals.values()) {
    const c = proposalCategory(p);
    if (c) counts[c] = (counts[c] || 0) + 1;
    if (!f || c === f) items.push({ kind: "proposal", key: `p-${p.id}`, sort: p.createdAtMs ?? 0, p });
  }
  renderCatFilter(counts);
  // Thread stacking (Slack-style): a reply is placed directly under the root of its
  // thread instead of at its own timestamp, so a conversation never drifts apart
  // when other messages land in between. Threads are ordered by their root message.
  if (reset || threadRoots.filter !== f) { threadRoots.filter = f; threadRoots.map.clear(); }
  const msgItems = new Map();
  for (const it of items) if (it.kind === "msg") msgItems.set(it.key, it);
  for (const it of items) {
    let root = it;
    if (it.kind === "msg") {
      const cached = threadRoots.map.get(it.key);
      if (cached !== undefined && msgItems.has(cached)) root = msgItems.get(cached);
      else {
        let hops = 0;
        while (root.m.replyTo && msgItems.has(root.m.replyTo) && hops++ < 10) root = msgItems.get(root.m.replyTo);
        if (!root.m.replyTo || hops > 10) threadRoots.map.set(it.key, root.key);
      }
    }
    it.threadSort = root.sort;
    it.threadKey = root.key;
    it.isReply = root !== it;
  }
  items.sort((a, b) => (a.threadSort - b.threadSort) || ((a.isReply ? 1 : 0) - (b.isReply ? 1 : 0)) || (a.sort - b.sort) || keyOrder.compare(String(a.key), String(b.key)));

  const existing = new Map();
  for (const n of list.children) if (n.dataset.key) existing.set(n.dataset.key, n);
  const fresh = [];
  const decisionKey = S.decisions.map((d) => d.id).join(",");
  const nodes = items.map((it) => {
    const sig = it.kind === "proposal"
      ? JSON.stringify([it.p.status, it.p.votes, S.voteBusy.has(it.p.id), S.voteMsg.get(it.p.id), it.p.summary, decisionKey])
      : JSON.stringify([it.m.text, it.m.deleted, it.m.editedAt ? 1 : 0, S.pending.has(it.key), S.editing === it.key, S.confirmDelete === it.key, it.m.replyTo, cats.get(it.key), it.isReply ? 1 : 0]);
    let node = existing.get(it.key);
    if (node && node.dataset.sig === sig) return node;
    if (node && S.editing === it.key && node.querySelector("textarea")) return node;
    const isNew = !node && !reset;
    const statusChanged = node && it.kind === "proposal" && node.dataset.status !== it.p.status;
    node = it.kind === "proposal" ? proposalItem(it.p) : messageItem(it.m);
    if (it.kind === "msg") node.classList.toggle("msg--thread", !!it.isReply && it.m.kind !== "ack");
    node.dataset.key = it.key; node.dataset.sig = sig;
    if (isNew || statusChanged) fresh.push(node);
    return node;
  });
  // Thread collapse (Slack-style): threads start COLLAPSED (owner rule, 2026-11-07) —
  // a root with replies carries a toggle that opens its reply stack on demand; the
  // count covers real replies, not reception acks.
  // Only what changed is written, so an unchanged thread costs no DOM work.
  const replyCounts = new Map();
  for (const it of items) if (it.kind === "msg" && it.isReply && it.m.kind !== "ack") replyCounts.set(it.threadKey, (replyCounts.get(it.threadKey) || 0) + 1);
  nodes.forEach((node, i) => {
    const it = items[i];
    if (it.kind !== "msg") return;
    if (it.isReply) { const hide = !S.expandedThreads.has(it.threadKey); if (node.hidden !== hide) node.hidden = hide; return; }
    if (node.hidden) node.hidden = false;
    const count = replyCounts.get(it.key) || 0;
    let tg = node.lastElementChild?.classList.contains("thread-toggle") ? node.lastElementChild : null;
    if (!count) { tg?.remove(); return; }
    const collapsed = !S.expandedThreads.has(it.key);
    if (!tg) { tg = h("button", { type: "button", class: "thread-toggle", "data-thread": it.key }); node.append(tg); }
    const expanded = String(!collapsed);
    if (tg.getAttribute("aria-expanded") !== expanded) tg.setAttribute("aria-expanded", expanded);
    const label = collapsed ? `Xem ${count} trả lời` : `Thu gọn ${count} trả lời`;
    if (tg.textContent !== label) tg.textContent = label;
  });
  // Keyed update instead of re-inserting the whole list: drop what left, then insert or move
  // only the nodes that are not already in place (a new message at the end is one insert).
  const sentinel = $("#load-older-wrap");
  if (list.firstElementChild !== sentinel) list.prepend(sentinel);
  const wanted = new Set(nodes);
  for (const n of [...list.children]) if (n !== sentinel && !wanted.has(n)) n.remove();
  let ref = sentinel.nextElementSibling;
  for (const node of nodes) {
    if (node === ref) { ref = ref.nextElementSibling; continue; }
    list.insertBefore(node, ref);
  }
  if (!items.length && f) list.append(h("li", { class: "empty", text: "Chưa có tin nhắn nào trong chủ đề này." }));
  else if (!items.length) list.append(h("li", { class: "empty", text: S.snapshotMode ? "Cần có mạng để xem và gửi tin nhắn. Tin nhắn sẽ hiện ở đây khi có mạng lại." : "Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện ở ô bên dưới." }));
  renderLoadOlder();
  // Entrance motion only for live arrivals, and only a few per render: GSAP reads each node's
  // style when a tween starts, so animating a page of loaded history (50 nodes, off screen
  // anyway) forced one layout per node — the 600 ms stalls measured in the B8 scroll test.
  if (!history) fresh.slice(-MAX_ENTRANCES).forEach((n) => (n.classList.contains("msg--proposal") ? motion.stateChanged(n) : motion.settleIn(n)));
  // Keeps the newest message in view inside the chat box (the page itself does not scroll).
  if (nearBottom) scrollToBottom(true);
}

function proposalItem(p) {
  return h("li", { class: "msg msg--agent msg--proposal", "data-status": p.status },
    h("div", { class: "msg-head" }, roleLabel(p.createdBy || "Coordinator"), h("span", { class: "msg-time", text: p.createdAtMs ? fmtTime(p.createdAtMs) : "" }),
      proposalCategory(p) ? h("span", { class: "msg-cat", text: CATEGORIES[proposalCategory(p)] }) : null),
    proposalCard(p, "chat"));
}

function roleLabel(role) {
  const key = AGENTS[role]?.key || "agent";
  return h("span", { class: `author author--agent role--${key}` }, h("span", { class: "role-dot", "aria-hidden": "true" }), h("span", { text: roleName(role) }));
}

function authorName(m) {
  return m.authorKind === "agent" ? roleName(m.role) : (gate.NAMES[m.authorId] || "Thành viên gia đình");
}

function messageItem(m) {
  const mine = m.authorKind === "human" && m.authorId === S.member;
  const agent = m.authorKind === "agent";
  const ms = tsMs(m.createdAt) ?? m.clientCreatedAt;
  // Reception acknowledgement: a compact system line, not a chat bubble — it is the
  // "seen" receipt for a host message, written within seconds by the reception desk.
  if (m.kind === "ack" && !m.deleted) {
    return h("li", { class: "msg msg--ack", id: `m-${m.id}` },
      h("span", { class: "ack-pill" },
        h("span", { class: "ack-check", "aria-hidden": "true", text: "✓" }),
        dc("span", {}, m.text),
        h("span", { class: "msg-time", text: ms ? fmtTime(ms) : "" })));
  }
  const head = h("div", { class: "msg-head" },
    agent ? roleLabel(m.role) : h("span", { class: `author author--human member--${m.authorId}`, text: authorName(m) }),
    h("span", { class: "msg-time", text: ms ? fmtTime(ms) : "" }),
    msgCategory(m) ? h("span", { class: "msg-cat", text: CATEGORIES[msgCategory(m)] }) : null,
    m.editedAt && !m.deleted ? h("span", { class: "msg-flag", text: "đã sửa" }) : null,
    S.pending.has(m.id) ? h("span", { class: "msg-flag msg-flag--sending", text: "đang gửi…" }) : null);

  let quote = null;
  if (m.replyTo) {
    const parent = S.msgs.get(m.replyTo);
    const snippet = parent ? (parent.deleted ? "tin nhắn đã xoá" : String(parent.text).slice(0, 90)) : "một tin nhắn trước đó";
    // One inner span: the quote is a flex box, and separate flex items would drop the space after the colon.
    quote = h("a", { class: "quote", href: `#m-${m.replyTo}`, "data-jump": m.replyTo },
      h("span", {}, `Trả lời ${parent ? authorName(parent) : "một tin nhắn"}: `, dc("span", {}, snippet)));
  }

  let body;
  if (S.editing === m.id) {
    const ta = h("textarea", { class: "edit-box", rows: "3", maxlength: "2000", "aria-label": "Sửa tin nhắn" });
    ta.value = m.text;
    body = h("form", { class: "edit-form", "data-edit": m.id },
      ta, h("div", { class: "row-actions" },
        h("button", { type: "submit", class: "btn btn--primary", text: "Lưu" }),
        h("button", { type: "button", class: "btn", "data-action": "cancel-edit", text: "Huỷ" })));
  } else if (m.deleted) {
    body = h("div", { class: "msg-text msg-text--deleted", text: "Tin nhắn đã bị xoá" });
  } else if (m.kind === "reminder") {
    body = h("div", { class: "msg-text" }, ...reminderDisplay(m));
  } else {
    body = h("div", { class: "msg-text" },
      m.topic ? dc("strong", { class: "msg-topic" }, m.topic) : null,
      dc("span", {}, m.text));
  }

  let actions = null;
  if (!m.deleted && m.kind !== "reminder" && S.editing !== m.id && !S.snapshotMode) {
    if (S.confirmDelete === m.id) {
      actions = h("div", { class: "row-actions confirm" },
        h("span", { text: "Xoá tin nhắn này?" }),
        h("button", { type: "button", class: "btn btn--danger", "data-action": "delete", "data-id": m.id, text: "Xoá" }),
        h("button", { type: "button", class: "btn", "data-action": "cancel-delete", text: "Giữ lại" }));
    } else {
      actions = h("div", { class: "msg-actions" },
        h("button", { type: "button", class: "link-btn", "data-action": "reply", "data-id": m.id, text: "Trả lời" }),
        mine ? h("button", { type: "button", class: "link-btn", "data-action": "edit", "data-id": m.id, text: "Sửa" }) : null,
        mine ? h("button", { type: "button", class: "link-btn", "data-action": "ask-delete", "data-id": m.id, text: "Xoá" }) : null);
    }
  }

  return h("li", { class: `msg ${agent ? "msg--agent" : "msg--human"}${mine ? " msg--mine" : ""}${m.kind === "reminder" ? " msg--reminder" : ""}`, id: `m-${m.id}` },
    head, quote, body, actions);
}

// The typing signal (meta/typing, kept fresh by the reception desk) shows only while
// it is active AND recent — a stale "active" from a dead process must not linger.
function renderTyping() {
  const bar = $("#typing");
  if (!bar) return;
  const t = S.typingDoc;
  const ms = t ? tsMs(t.updatedAt) : null;
  bar.hidden = !(t && t.active === true && ms && Date.now() - ms < 120000);
}

function renderLoadOlder() {
  const wrap = $("#load-older-wrap");
  const btn = $("#load-older");
  wrap.hidden = !S.moreOlder;
  btn.disabled = S.loadingOlder;
  btn.textContent = S.loadingOlder ? "Đang tải tin nhắn cũ…" : "Xem tin nhắn cũ hơn";
}

function renderReply() {
  const bar = $("#replying");
  if (!S.replyTo) { bar.hidden = true; return; }
  const m = S.msgs.get(S.replyTo);
  bar.hidden = false;
  const text = $("#replying-text");
  text.replaceChildren(m ? `Đang trả lời ${authorName(m)}: ` : "Đang trả lời một tin nhắn", m ? dc("span", {}, String(m.text).slice(0, 80)) : "");
}

function scrollToBottom(force) {
  const list = $("#messages");
  if (force || list.scrollHeight - list.scrollTop - list.clientHeight < 200) list.scrollTop = list.scrollHeight;
}

/* ---------------- static UI wiring ---------------- */
function wireStaticUi() {
  $("#signin-btn").addEventListener("click", signIn);
  $("#signout-denied").addEventListener("click", signOut);
  $("#signout").addEventListener("click", signOut);
  $("#retry-btn").addEventListener("click", () => location.reload());

  // Touch feedback: controls give under the finger and spring back (GSAP; no-op without it).
  const pressable = ".btn, .vote, .dock-link, .d-chip, .d-toggle, .to-top, .link-btn, .report-tab";
  document.addEventListener("pointerdown", (e) => { const b = e.target.closest(pressable); if (b && !b.disabled) motion.press(b); }, { passive: true });
  for (const type of ["pointerup", "pointercancel", "pointerleave"]) {
    document.addEventListener(type, (e) => { const b = e.target.closest?.(pressable); if (b) motion.release(b); }, { passive: true, capture: type === "pointerleave" });
  }
  // Glass highlight follows the pointer on mouse/trackpad devices.
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest(".sheen, .glass");
      if (!el) return;
      const r = el.getBoundingClientRect();
      motion.sheen(el, ((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
    }, { passive: true });
  }

  document.addEventListener("click", (e) => {
    const cat = e.target.closest("button[data-cat]");
    if (cat) { S.catFilter = cat.dataset.cat === "all" ? null : cat.dataset.cat; renderMessages(true); return; }
    const toggle = e.target.closest("button[data-dtoggle]");
    if (toggle) { toggleDecision(toggle.dataset.dtoggle); return; }
    const dockLink = e.target.closest("a[data-dock]");
    if (dockLink) { e.preventDefault(); motion.scrollTo(document.getElementById(dockLink.dataset.dock), topOffset()); return; }
    // Votes (strip and chat cards share the same markup).
    const vote = e.target.closest("button[data-vote]");
    if (vote && !vote.disabled) { castVote(vote.dataset.pid, vote.dataset.vote); return; }
    // D-reference links.
    const dref = e.target.closest("a[data-dref]");
    if (dref) { e.preventDefault(); goToDecision(dref.dataset.dref); }
  });

  $("#messages").addEventListener("click", (e) => {
    const tbtn = e.target.closest(".thread-toggle");
    if (tbtn) {
      const id = tbtn.dataset.thread;
      if (S.expandedThreads.has(id)) S.expandedThreads.delete(id); else S.expandedThreads.add(id);
      renderMessages();
      return;
    }
    const jump = e.target.closest("[data-jump]");
    if (jump) {
      e.preventDefault();
      const target = document.getElementById(`m-${jump.dataset.jump}`);
      target?.scrollIntoView({ block: "center", behavior: reducedMotion.matches ? "auto" : "smooth" });
      target?.classList.add("msg--flash");
      setTimeout(() => target?.classList.remove("msg--flash"), 1600);
      return;
    }
    const b = e.target.closest("button[data-action]");
    if (!b) return;
    const id = b.dataset.id;
    switch (b.dataset.action) {
      case "reply": S.replyTo = id; openThreadOf(id); renderMessages(); renderReply(); $("#composer").focus(); break;
      case "edit": S.editing = id; S.confirmDelete = null; renderMessages(); $(".edit-box")?.focus(); break;
      case "cancel-edit": S.editing = null; renderMessages(); break;
      case "ask-delete": S.confirmDelete = id; renderMessages(); break;
      case "cancel-delete": S.confirmDelete = null; renderMessages(); break;
      case "delete": deleteMessage(id); break;
    }
  });
  $("#messages").addEventListener("submit", (e) => {
    const form = e.target.closest("[data-edit]");
    if (!form) return;
    e.preventDefault();
    const text = form.querySelector("textarea").value.trim();
    if (text && text.length <= 2000) saveEdit(form.dataset.edit, text);
  });
  $("#load-older").addEventListener("click", loadOlder);
  const list = $("#messages");
  list.addEventListener("scroll", () => {
    chatNearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
    motion.holdBackdrop();
    if (list.scrollTop < 40 && S.moreOlder) loadOlder();
  }, { passive: true });
  $("#refresh-chat").addEventListener("click", refreshChat);

  const ta = $("#composer");
  let draftTimer = null;
  ta.addEventListener("input", () => { autoGrow(ta); clearTimeout(draftTimer); draftTimer = setTimeout(saveDraft, 300); });
  ta.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); $("#composer-form").requestSubmit(); }
  });
  $("#composer-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = ta.value.trim();
    if (!text) return;
    if (S.snapshotMode || !S.fb || !S.member) { flash("Cần kết nối tới bảng gia đình để trò chuyện. Bản nháp đã được lưu trên máy này."); return; }
    if (text.length > 2000) { flash("Tin nhắn dài tối đa 2.000 ký tự."); return; }
    // A new message has no topic of its own, so show the whole chat again or it would vanish from view.
    if (S.catFilter && !S.replyTo) { S.catFilter = null; renderMessages(true); }
    sendMessage(text);
    ta.value = ""; autoGrow(ta); store.del(LS.draft);
  });
  $("#cancel-reply").addEventListener("click", () => { S.replyTo = null; renderReply(); });

  // Report issue: the side tab opens the sheet; one category at a time; submit writes one issue doc.
  $("#report-tab").addEventListener("click", openReportSheet);
  for (const el of document.querySelectorAll("[data-report-close]")) el.addEventListener("click", closeReportSheet);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeReportSheet(); });
  for (const chip of document.querySelectorAll("[data-rcat]")) {
    chip.addEventListener("click", () => {
      reportCategory = chip.dataset.rcat;
      for (const c of document.querySelectorAll("[data-rcat]")) c.setAttribute("aria-pressed", String(c === chip));
    });
  }
  $("#report-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = $("#report-text").value.trim();
    if (!text) { reportError("Hãy viết vài dòng mô tả lỗi trước khi gửi."); return; }
    if (text.length > 2000) { reportError("Mô tả dài tối đa 2.000 ký tự."); return; }
    const send = $("#report-send");
    send.disabled = true; send.textContent = "Đang gửi…";
    reportError("");
    // Right after sign-in (or on a slow network) the device is online but the live connection is
    // still opening: wait for it briefly instead of refusing a report that would go through.
    if (!S.snapshotMode && S.fb && S.member && navigator.onLine && !S.conn?.isLive()) await waitForLive(8000);
    if (S.snapshotMode || !S.fb || !S.member || !S.conn?.isLive()) {
      send.disabled = false; send.textContent = "Gửi báo lỗi";
      reportError("Cần có mạng để gửi báo lỗi. Hãy thử lại khi trang hiện “Trực tuyến”.");
      return;
    }
    try {
      await submitReport(text);
      $("#report-text").value = "";
      $("#report-done").hidden = false;
      setTimeout(closeReportSheet, 1800);
    } catch {
      reportError("Chưa gửi được. Hãy kiểm tra mạng rồi thử lại.");
    } finally {
      send.disabled = false; send.textContent = "Gửi báo lỗi";
    }
  });

  // Back to top: appears after scrolling, never covers the composer or the vote buttons.
  const topBtn = $("#to-top");
  topBtn.addEventListener("click", motion.smoothScrollTop);
  let ticking = false;
  const place = () => {
    ticking = false;
    const wanted = scrollY > 600 && !$("#screen-board").hidden;
    const spot = wanted ? findSpot(topBtn) : { lift: 0, ok: false };
    topBtn.style.setProperty("--lift", `${spot.lift}px`);
    const visible = wanted && spot.ok;
    if (visible && topBtn.hidden) motion.showButton(topBtn);
    else if (!visible && !topBtn.hidden) motion.hideButton(topBtn);
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(place); } }, { passive: true });
  addEventListener("resize", () => requestAnimationFrame(place));

  S.clockTimer = setInterval(() => { renderStatus(); renderTyping(); maybeSendReminders(); }, 30000);
  wireDock();
}

// Space the floating section bar takes at the top, so scrolled-to content lands below it.
function topOffset() {
  // The bar is about 52 px tall at 10 px from the top, and it appears as soon as the title scrolls away.
  return 76;
}

// Floating section bar: shown once the title has scrolled away; the pill follows the section in view.
function wireDock() {
  const dock = $("#dock");
  const header = $("header.title");
  const indicator = $(".dock-indicator");
  if (!("IntersectionObserver" in window)) return;
  new IntersectionObserver(([entry]) => {
    const want = !entry.isIntersecting && !$("#screen-board").hidden;
    if (want && dock.hidden) { motion.showDock(dock); requestAnimationFrame(() => setActive(S.activeSection || "plan")); }
    else if (!want && !dock.hidden) motion.hideDock(dock);
  }, { threshold: 0 }).observe(header);
  const setActive = (id) => {
    S.activeSection = id;
    for (const a of dock.querySelectorAll("[data-dock]")) a.toggleAttribute("aria-current", a.dataset.dock === id);
    if (!dock.hidden) motion.moveIndicator(indicator, dock.querySelector(`[data-dock="${id}"]`));
  };
  // The section crossing a band just above the middle of the screen is the active one.
  const io = new IntersectionObserver((entries) => {
    const hit = entries.filter((en) => en.isIntersecting).pop();
    if (hit) setActive(hit.target.id);
  }, { rootMargin: "-35% 0px -55% 0px" });
  for (const id of ["plan", "chat", "details"]) io.observe(document.getElementById(id));
}

// Where the back-to-top button can sit without covering the composer or any vote buttons:
// start at its normal bottom-right spot and move up past whatever is underneath. If that would
// take it more than halfway up the screen, it stays hidden until the obstacle scrolls away.
let btnSize = { w: 52, h: 52 };
function findSpot(btn) {
  if (!btn.hidden && btn.offsetWidth) btnSize = { w: btn.offsetWidth, h: btn.offsetHeight };
  const cs = getComputedStyle(btn);
  const currentLift = parseFloat(cs.getPropertyValue("--lift")) || 0;
  const baseBottom = (parseFloat(cs.bottom) || 16) - currentLift;
  const right = document.documentElement.clientWidth - (parseFloat(cs.right) || 16);
  const left = right - btnSize.w;
  const floor = innerHeight - baseBottom;
  const obstacles = [...document.querySelectorAll("#composer-form, .vote-buttons, #replying")]
    .map((el) => el.getBoundingClientRect()).filter((o) => o.width && o.height);
  let bottom = floor;
  for (let i = 0; i < 20; i++) {
    const top = bottom - btnSize.h;
    const hit = obstacles.find((o) => left < o.right && right > o.left && top < o.bottom && bottom > o.top);
    if (!hit) return { lift: Math.round(floor - bottom), ok: true };
    bottom = hit.top - 12;
    if (floor - bottom > innerHeight * 0.5) break;
  }
  return { lift: 0, ok: false };
}

boot();
