// Family Visit forum: sign-in, confirmed timeline, 3-of-3 proposals, topic chat.
import { firebaseConfig, FIREBASE_CDN, EMULATOR, usingEmulator, memberTable } from "./config.js";
import * as gate from "./gate.js";
import * as motion from "./motion.js";
import { createConnection } from "./live.js";

/* ---------------- constants ---------------- */
const THREADS = [
  { id: "flights", name: "Flights" },
  { id: "san-jose", name: "San Jose" },
  { id: "nyc", name: "NYC" },
  { id: "niagara-falls", name: "Niagara Falls" },
  { id: "pennsylvania", name: "Pennsylvania" },
  { id: "budget", name: "Budget" },
  { id: "documents-visa", name: "Documents & Visa" },
  { id: "general", name: "General" }
];
const THREAD_IDS = THREADS.map((t) => t.id);
const AGENTS = {
  "Coordinator": "coordinator",
  "Flights & Travel": "flights",
  "Stay & Home Prep": "stay",
  "Itinerary & Food": "itinerary",
  "Budget": "budget",
  "Scout — Research & Verification": "scout",
  "Visa & Documents": "visa"
};
const PAGE_SIZE = 50;
const fast = usingEmulator() && new URLSearchParams(location.search).get("timing") === "fast";
const TIMING = fast
  ? { backoffBaseMs: 1000, backoffMaxMs: 30000, staleMs: 3000, pollAfterMs: 6000, pollMs: 5000, bootMs: 4000, presenceMs: 45000, presenceStaleMs: 90000 }
  : { backoffBaseMs: 1000, backoffMaxMs: 30000, staleMs: 10000, pollAfterMs: 60000, pollMs: 30000, bootMs: 8000, presenceMs: 45000, presenceStaleMs: 90000 };
const LS = {
  member: "fv-member",
  plan: "fv-plan-cache",
  thread: "fv-thread",
  read: "fv-read",
  draft: (tid) => `fv-draft-${tid}`
};

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
const store = {
  get(key, fallback = null) { try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } },
  del(key) { try { localStorage.removeItem(key); } catch { /* storage unavailable */ } },
  clearAll() { try { Object.keys(localStorage).filter((k) => k.startsWith("fv-")).forEach((k) => localStorage.removeItem(k)); } catch { /* storage unavailable */ } }
};
const fmtTime = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const fmtDay = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const tsMs = (t) => (t && typeof t.toMillis === "function") ? t.toMillis() : (typeof t === "number" ? t : null);
function ago(ms) {
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const hr = Math.round(m / 60);
  if (hr < 48) return `${hr} h ago`;
  return fmtTime.format(ms);
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
  board: null, seed: null,
  rows: new Map(), rowsFromServer: false, tableMeta: null,
  proposals: new Map(),
  decisions: null,
  threadDocs: new Map(),
  heartbeat: null,
  presence: new Map(),
  latest: new Map(),
  thread: THREAD_IDS.includes(store.get(LS.thread)) ? store.get(LS.thread) : "general",
  msgs: new Map(), pending: new Set(),
  oldestDoc: null, liveCount: 0, moreOlder: false, loadingOlder: false,
  replyTo: null, editing: null, confirmDelete: null,
  voteBusy: new Set(), voteMsg: new Map(),
  remindersTried: new Set(),
  snapshotMode: false, booted: false,
  presenceTimer: null, clockTimer: null
};

/* ---------------- screens ---------------- */
function show(id) {
  for (const s of document.querySelectorAll("[data-screen]")) s.hidden = s.id !== id;
}

/* ---------------- boot ---------------- */
// Plan seed files load only for a member (or a device that signed in as one before, for the offline snapshot).
async function loadSeedFiles() {
  if (S.board && S.seed) return;
  try {
    const [board, seed] = await Promise.all([
      fetch("board.json", { cache: "no-cache" }).then((r) => r.json()),
      fetch("timeline-seed.json", { cache: "no-cache" }).then((r) => r.json())
    ]);
    S.board = board; S.seed = seed;
  } catch {
    // Offline and not cached: the page still renders whatever live or saved data exists.
  }
}

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
      state: () => ({ conn: S.conn?.state() || null, member: S.member, snapshot: S.snapshotMode, thread: S.thread }),
      // Drops the current server connection (the SDK reconnects on its own), like a network blip.
      dropConnection: async () => { await fb.fs.disableNetwork(db); await fb.fs.enableNetwork(db); }
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
async function handleUser(user) {
  S.booted = true;
  if (!user) { teardown(); S.member = null; show("screen-signin"); return; }
  const email = (user.email || "").toLowerCase();
  const member = email ? memberTable()[await sha256Hex(email)] : null;
  if (!member) { teardown(); clearRendered(); S.member = null; store.clearAll(); show("screen-denied"); return; }
  await loadSeedFiles();
  if (S.member === member && S.conn) return;
  S.member = member;
  store.set(LS.member, member);
  S.snapshotMode = false;
  show("screen-board");
  $("#who").textContent = gate.NAMES[member];
  renderAll();
  startLive();
}

async function signIn() {
  const err = $("#signin-error");
  err.textContent = "";
  if (!S.fb) { err.textContent = "Can't reach Google sign-in right now. Check your connection, then reload the page."; return; }
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
        ? "Sign-in needs a connection. Check your network and try again."
        : "Sign-in didn't finish. Try again.";
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
  show("screen-signin");
  try { if (S.auth) await withTimeout(S.fb.auth.signOut(S.auth), 3000); } catch { /* local sign-out still happens below */ }
  try {
    if (S.db) {
      await withTimeout(S.fb.fs.terminate(S.db), 3000);
      await withTimeout(S.fb.fs.clearIndexedDbPersistence(S.db), 3000);
    }
  } catch { /* the cache is cleared on the next load at the latest */ }
  location.reload();
}

function clearRendered() {
  for (const sel of ["#timeline-body", "#pending-strip", "#decisions", "#summary", "#presence", "#threads"]) $(sel)?.replaceChildren();
  $("#messages").replaceChildren($("#load-older-wrap"));
  $("#who").textContent = "";
  $("#table-meta").textContent = "";
}

function teardown() {
  S.conn?.stop(); S.conn = null;
  clearInterval(S.presenceTimer); S.presenceTimer = null;
  S.msgs.clear(); S.pending.clear(); S.proposals.clear(); S.rows.clear(); S.latest.clear(); S.presence.clear();
  S.rowsFromServer = false; S.tableMeta = null; S.oldestDoc = null; S.liveCount = 0; S.moreOlder = false;
}

/* ---------------- no backend: offline snapshot ---------------- */
async function noBackend(reason) {
  S.booted = true;
  const member = store.get(LS.member);
  if (!member) {
    show("screen-signin");
    $("#signin-error").textContent = "Can't reach Google sign-in right now. Check your connection, then reload the page.";
    return;
  }
  await loadSeedFiles();
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
  const notice = $("#snapshot-notice");
  notice.hidden = false;
  notice.textContent = cache?.rows?.length
    ? `Offline snapshot: the server can't be reached, so this is the last plan saved on this device (${fmtTime.format(cache.savedAt)}). It updates by itself when the connection is back.`
    : "Offline snapshot: the server can't be reached, so this is the plan as first published. It updates by itself when the connection is back.";
  setConnLabel(reason === "sdk" ? "Offline snapshot (sign-in service unreachable)" : "Offline snapshot");
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
  });

  c.watch("decisions", fs.collection(db, "decisions"), (snap) => {
    S.decisions = snap.docs.length ? snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true })) : null;
    renderDecisions();
  });

  c.watch("threads", fs.collection(db, "threads"), (snap) => {
    S.threadDocs.clear();
    for (const d of snap.docs) S.threadDocs.set(d.id, d.data({ serverTimestamps: "estimate" }));
    renderSummary();
  });

  c.watch("presence", fs.collection(db, "presence"), (snap) => {
    S.presence.clear();
    for (const d of snap.docs) S.presence.set(d.id, d.data({ serverTimestamps: "estimate" }));
    renderPresence(); renderTabs();
  });

  for (const t of THREADS) {
    c.watch(`latest-${t.id}`, fs.query(fs.collection(db, "threads", t.id, "messages"), fs.orderBy("createdAt", "desc"), fs.limit(1)), (snap) => {
      const d = snap.docs[0];
      if (d) {
        const m = d.data({ serverTimestamps: "estimate" });
        S.latest.set(t.id, { ms: tsMs(m.createdAt) ?? m.clientCreatedAt ?? 0, authorId: m.authorId || null });
      } else S.latest.delete(t.id);
      renderTabs();
    });
  }

  watchThread();
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
    version: S.tableMeta?.version ?? null,
    updatedBy: S.tableMeta?.updatedBy ?? null,
    savedAt: Date.now()
  });
}

function watchThread() {
  const { fs } = S.fb;
  const tid = S.thread;
  S.msgs.clear(); S.pending.clear(); S.oldestDoc = null; S.moreOlder = false; S.olderLoaded = false; S.replyTo = null; S.editing = null; S.confirmDelete = null;
  renderMessages(true);
  S.conn.watch("messages", fs.query(fs.collection(S.db, "threads", tid, "messages"), fs.orderBy("createdAt", "desc"), fs.limit(PAGE_SIZE)), (snap) => {
    if (tid !== S.thread) return;
    for (const d of snap.docs) {
      S.msgs.set(d.id, { id: d.id, ...d.data({ serverTimestamps: "estimate" }) });
      if (d.metadata.hasPendingWrites) S.pending.add(d.id); else S.pending.delete(d.id);
    }
    S.liveCount = snap.docs.length;
    // The cursor for "load earlier" is the oldest message in the live window (a first, cache-only
    // snapshot can hold just one message, so keep moving it until an older page has been loaded).
    if (!S.olderLoaded && snap.docs.length) S.oldestDoc = snap.docs[snap.docs.length - 1];
    if (snap.docs.length >= PAGE_SIZE && !S.olderLoaded) S.moreOlder = true;
    renderMessages();
    markRead();
  });
}

async function loadOlder() {
  if (S.loadingOlder || !S.moreOlder || !S.oldestDoc || !S.fb) return;
  const { fs } = S.fb;
  const tid = S.thread;
  S.loadingOlder = true;
  renderLoadOlder();
  const list = $("#messages");
  const prevHeight = list.scrollHeight;
  try {
    // From the server only: a cache read can be partial and would hide older history for good.
    const snap = await fs.getDocsFromServer(fs.query(fs.collection(S.db, "threads", tid, "messages"), fs.orderBy("createdAt", "desc"), fs.startAfter(S.oldestDoc), fs.limit(PAGE_SIZE)));
    if (tid !== S.thread) return;
    for (const d of snap.docs) S.msgs.set(d.id, { id: d.id, ...d.data({ serverTimestamps: "estimate" }) });
    if (snap.docs.length) S.oldestDoc = snap.docs[snap.docs.length - 1];
    S.olderLoaded = true;
    S.moreOlder = snap.docs.length === PAGE_SIZE;
    renderMessages();
    list.scrollTop += list.scrollHeight - prevHeight;
  } catch {
    S.loadingOlder = false;
    renderLoadOlder();
    $("#load-older").textContent = "Earlier messages need a connection. Tap to try again.";
    return;
  }
  S.loadingOlder = false;
  renderLoadOlder();
}

/* ---------------- presence ---------------- */
function writePresence(state) {
  if (!S.fb || !S.db || !S.member) return Promise.resolve();
  const { fs } = S.fb;
  return fs.setDoc(fs.doc(S.db, "presence", S.member), { member: S.member, state, lastSeen: fs.serverTimestamp(), thread: S.thread });
}
// Heartbeats are written only while connected, so nothing piles up offline to flush later.
function heartbeat() {
  if (!S.conn?.isLive()) return;
  writePresence(document.visibilityState === "visible" ? "online" : "away").catch(() => {});
}
function startPresence() {
  clearInterval(S.presenceTimer);
  writePresence("online").catch(() => {});
  S.presenceTimer = setInterval(() => { heartbeat(); renderPresence(); renderTabs(); }, TIMING.presenceMs);
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

/* ---------------- votes ---------------- */
async function castVote(pid, choice) {
  const p = S.proposals.get(pid);
  if (!p || S.voteBusy.has(pid)) return;
  if (!gate.canVote(p, S.member, choice)) return;
  if (S.snapshotMode || !navigator.onLine) { S.voteMsg.set(pid, "Voting needs a connection. Try again when you're back online."); renderStrip(); renderMessages(); return; }
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
      frozen: "This proposal is already closed.",
      gone: "This proposal no longer exists.",
      stale: "The table changed after this proposal was made, so an OK can't apply it. Vote No to close it; the agents will post an updated proposal.",
      "too-big": "This proposal changes more rows than one vote can apply (up to 4). Vote No to close it; the agents will split it up.",
      "no-table": "The plan table isn't set up yet, so this change can't be applied.",
      "not-allowed": "That vote isn't available."
    }[code] || (e?.code === "unavailable" ? "Voting needs a connection. Try again when you're back online." : "Your vote didn't go through. Try again.");
    S.voteMsg.set(pid, text);
  } finally {
    S.voteBusy.delete(pid);
    renderStrip(); renderMessages();
  }
}

// One reminder per proposal pending for over 72 hours (the server allows exactly one).
async function maybeSendReminders() {
  if (!S.conn?.isLive() || !S.fb) return;
  const { fs } = S.fb;
  for (const p of S.proposals.values()) {
    if (!gate.reminderDue(p, Date.now()) || S.remindersTried.has(p.id) || !THREAD_IDS.includes(p.threadId)) continue;
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

/* ---------------- chat actions ---------------- */
function sendMessage(text) {
  const { fs } = S.fb;
  const tid = S.thread;
  const id = newId();
  const data = {
    id, threadId: tid, authorKind: "human", authorId: S.member, text,
    replyTo: S.replyTo, createdAt: fs.serverTimestamp(), clientCreatedAt: Date.now(), deleted: false
  };
  // Client-generated id: offline sends queue on this device and land exactly once on reconnect.
  fs.setDoc(fs.doc(S.db, "threads", tid, "messages", id), data).catch((e) => {
    if (e?.code === "permission-denied") flash(`A message couldn't be saved: the server refused it.`);
  });
  S.replyTo = null;
  renderReply();
  scrollToBottom(true);
}

function saveEdit(id, text) {
  const { fs } = S.fb;
  fs.updateDoc(fs.doc(S.db, "threads", S.thread, "messages", id), { text, editedAt: fs.serverTimestamp() }).catch(() => flash("The edit didn't save. Try again."));
  S.editing = null;
  renderMessages();
}

function deleteMessage(id) {
  const { fs } = S.fb;
  fs.updateDoc(fs.doc(S.db, "threads", S.thread, "messages", id), { deleted: true, text: "", deletedAt: fs.serverTimestamp() }).catch(() => flash("The message wasn't deleted. Try again."));
  S.confirmDelete = null;
  renderMessages();
}

function flash(text) {
  const n = $("#composer-error");
  n.textContent = text;
  clearTimeout(flash.t);
  flash.t = setTimeout(() => { n.textContent = ""; }, 6000);
}

function markRead() {
  const all = [...S.msgs.values()];
  if (!all.length) return;
  const max = Math.max(...all.map((m) => tsMs(m.createdAt) ?? m.clientCreatedAt ?? 0));
  const read = store.get(LS.read, {});
  if ((read[S.thread] || 0) < max) { read[S.thread] = max; store.set(LS.read, read); renderTabs(); }
}

function selectThread(tid) {
  if (!THREAD_IDS.includes(tid) || tid === S.thread) return;
  saveDraft();
  S.thread = tid;
  store.set(LS.thread, tid);
  renderTabs(); renderSummary(); loadDraft();
  if (S.conn && !S.snapshotMode) { watchThread(); writePresence("online").catch(() => {}); }
  else renderMessages(true);
}

function saveDraft() {
  const v = $("#composer").value;
  if (v) store.set(LS.draft(S.thread), v); else store.del(LS.draft(S.thread));
}
function loadDraft() {
  const ta = $("#composer");
  ta.value = store.get(LS.draft(S.thread), "");
  autoGrow(ta);
}
function autoGrow(ta) {
  ta.style.height = "auto";
  ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
}

/* ---------------- rendering: title & status ---------------- */
function renderAll() {
  renderTitle(); renderConn(S.conn?.state() || (S.snapshotMode ? "snapshot" : "connecting")); renderStatus();
  renderStrip(); renderTable(); renderTableMeta(); renderDecisions();
  renderPresence(); renderTabs(); renderSummary(); renderMessages(true); renderReply(); loadDraft();
}

function renderTitle() {
  const meta = S.board?.meta;
  if (!meta) return;
  $("#trip-title").textContent = meta.title;
  const a = new Date(`${meta.core_window.arrive}T00:00:00Z`);
  const d = new Date(`${meta.core_window.depart}T00:00:00Z`);
  $("#trip-window").textContent = `${meta.window}. Core window ${fmtDay.format(a)} to ${fmtDay.format(d)}, ${meta.core_window.nights} nights.`;
  document.title = "Family Visit";
}

const CONN_LABELS = {
  connecting: "Connecting",
  live: "Live",
  offline: "Offline",
  reconnecting: "Reconnecting…",
  polling: "Live updates down, checking every 30 seconds",
  snapshot: "Offline snapshot"
};
function renderConn(state) {
  if (S.snapshotMode && state !== "live") { setConnLabel(CONN_LABELS.snapshot); }
  else setConnLabel(CONN_LABELS[state] || state);
  const banner = $("#banner");
  const text = {
    offline: "You're offline. New messages wait on this device and send when you reconnect. Voting needs a connection.",
    reconnecting: "Reconnecting…",
    polling: "Live updates are down. Checking for changes every 30 seconds."
  }[state];
  banner.hidden = !text;
  banner.textContent = text || "";
  banner.dataset.state = state;
  document.body.dataset.conn = state;
}
function setConnLabel(text) {
  const n = $("#conn");
  n.textContent = text;
}

function renderStatus() {
  const n = $("#agents-active");
  const ms = tsMs(S.heartbeat?.lastActive);
  n.textContent = ms ? `Agents last active ${ago(ms)}` : (S.snapshotMode ? "Agent activity unavailable offline" : "Agents haven't checked in yet");
}

function renderPresence() {
  const wrap = $("#presence");
  wrap.replaceChildren(...gate.MEMBERS.map((m) => {
    const st = m === S.member && !S.snapshotMode ? "online" : presenceOf(m);
    return h("li", { class: `pres pres--${st}`, title: `${gate.NAMES[m]}: ${st}` },
      h("span", { class: "dot", "aria-hidden": "true" }), h("span", { text: gate.NAMES[m] }), h("span", { class: "sr-only", text: ` ${st}` }));
  }));
}

/* ---------------- rendering: plan board ---------------- */
function currentRows() {
  const rows = S.rows.size ? [...S.rows.values()] : (S.seed?.rows || []);
  return [...rows].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
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
    h("th", { scope: "row", class: "c-date" }, h("span", { class: "rail", "aria-hidden": "true" }), h("span", { class: "date-text", text: r.date })),
    h("td", { class: "c-leg", text: r.leg }),
    h("td", { text: r.transport }),
    h("td", { text: r.stay }),
    h("td", { text: r.activities }),
    h("td", { class: "c-cost", text: r.cost }),
    h("td", {}, h("span", { class: "row-status", text: r.status }))
  )));
  if (!rows.length) body.replaceChildren(h("tr", {}, h("td", { colspan: "7", text: "The timeline couldn't be loaded. Reload the page to try again." })));
}

function renderTableMeta() {
  const n = $("#table-meta");
  const m = S.tableMeta;
  if (!m) { n.textContent = S.seed ? `Table version ${S.seed.version}, as first published.` : ""; return; }
  const by = gate.NAMES[m.updatedBy] || (m.updatedBy === "seed" ? null : m.updatedBy);
  const when = tsMs(m.updatedAt);
  n.textContent = by
    ? `Table version ${m.version}, last changed by ${by}${when ? ` on ${fmtTime.format(when)}` : ""}.`
    : `Table version ${m.version ?? 1}, as first published.`;
}

function voteWidget(p) {
  const me = S.member;
  const busy = S.voteBusy.has(p.id);
  const open = p.status === "pending" && !S.snapshotMode;
  const stateLabel = { pending: "Waiting", ok: "OK", no: "No" };
  return h("div", { class: "votes", role: "group", "aria-label": "Votes" },
    gate.MEMBERS.map((m) => {
      const v = p.votes?.[m] || "pending";
      const mine = m === me;
      const can = (c) => mine && open && !busy && gate.canVote(p, m, c);
      const btn = (c, label) => h("button", {
        type: "button", class: `vote vote--${c}`, "data-pid": p.id, "data-vote": c,
        "aria-pressed": String(v === c), disabled: !can(c),
        "aria-label": `${label} from ${gate.NAMES[m]}`,
        title: mine ? null : `Only ${gate.NAMES[m]} can vote here`
      }, label);
      return h("div", { class: `vote-row vote-row--${v}${mine ? " vote-row--me" : ""}` },
        h("span", { class: "voter", text: mine ? `${gate.NAMES[m]} (you)` : gate.NAMES[m] }),
        h("span", { class: "vote-state", text: stateLabel[v] || v }),
        h("span", { class: "vote-buttons" }, btn("ok", "OK"), btn("no", "No")));
    }));
}

function changeList(p) {
  const items = gate.describeChanges(p, rowsById());
  return h("ul", { class: "changes" }, items.map((c) => h("li", {},
    h("span", { class: "chg-where", text: `${c.rowLabel}, ${gate.FIELD_LABELS[c.field]}: ` }),
    c.before === null ? h("span", { class: "chg-new", text: "new row" }) : h("del", { text: c.before }),
    h("span", { class: "chg-arrow", "aria-hidden": "true", text: " ⟶ " }), h("span", { class: "sr-only", text: " changes to " }),
    h("ins", { text: c.after }))));
}

function proposalCard(p, where) {
  const statusText = { pending: "Pending confirmation", applied: "Applied to the plan", rejected: "Rejected, frozen" }[p.status] || p.status;
  const by = p.createdBy ? `Proposed by ${p.createdBy}` : "Proposed by the agents";
  const created = p.createdAtMs ? `, ${fmtTime.format(p.createdAtMs)}` : "";
  const tail = p.status === "applied"
    ? `Applied${p.appliedVersion ? ` as table version ${p.appliedVersion}` : ""} after all three voted OK.`
    : p.status === "rejected"
      ? `${gate.MEMBERS.filter((m) => p.votes?.[m] === "no").map((m) => gate.NAMES[m]).join(", ")} voted No. The table did not change; the agents will discuss and post a new proposal.`
      : "The table changes only when John, Nickie, and Johnny all vote OK. One No closes this proposal.";
  const msg = S.voteMsg.get(p.id);
  return h("article", { class: `proposal proposal--${p.status}`, "data-pid": p.id, "data-where": where, "aria-label": `Proposal: ${p.summary}` },
    h("p", { class: "proposal-status", text: statusText }),
    h("h3", { class: "proposal-summary", text: p.summary }),
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
  strip.replaceChildren(h("h3", { class: "strip-title", text: pending.length === 1 ? "1 change waiting for your votes" : `${pending.length} changes waiting for your votes` }), ...cards);
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

function renderDecisions() {
  const list = $("#decisions");
  const decisions = S.decisions || S.board?.decisions || [];
  list.replaceChildren(...decisions.map((d) => {
    const voteNames = Object.keys(d.votes || {});
    const voted = voteNames.filter((k) => d.votes[k] !== null && d.votes[k] !== undefined);
    return h("li", { class: `decision${d.status === "resolved" ? " decision--resolved" : ""}`, id: `decision-${d.id}` },
      h("h4", {}, h("span", { class: "d-id", text: d.id }), h("span", { text: ` ${d.topic}: ${d.question}` })),
      h("p", { class: "d-status", text: d.status }),
      d.resolution ? h("p", { class: "d-resolution", text: d.resolution }) : null,
      d.options?.length ? h("ul", { class: "d-options" }, d.options.map((o) => h("li", { text: o }))) : null,
      voteNames.length ? h("p", { class: "d-votes", text: voted.length ? voted.map((k) => `${k}: ${d.votes[k]}`).join(", ") : "No votes recorded yet." }) : null);
  }));
}

/* ---------------- rendering: chat ---------------- */
function renderTabs() {
  const nav = $("#threads");
  const read = store.get(LS.read, {});
  nav.replaceChildren(...THREADS.map((t) => {
    const latest = S.latest.get(t.id);
    const unread = latest && latest.authorId !== S.member && latest.ms > (read[t.id] || 0) && t.id !== S.thread;
    const here = gate.MEMBERS.filter((m) => m !== S.member && presenceOf(m) === "online" && S.presence.get(m)?.thread === t.id);
    return h("button", {
      type: "button", role: "tab", class: `tab${t.id === S.thread ? " tab--on" : ""}${unread ? " tab--unread" : ""}`,
      "aria-selected": String(t.id === S.thread), "data-thread": t.id,
      "aria-label": `${t.name}${unread ? ", unread messages" : ""}${here.length ? `, ${here.map((m) => gate.NAMES[m]).join(" and ")} here` : ""}`
    },
      h("span", { text: t.name }),
      unread ? h("span", { class: "unread-dot", "aria-hidden": "true" }) : null,
      here.length ? h("span", { class: "here", "aria-hidden": "true" }, here.map((m) => h("span", { class: `here-dot here-dot--${m}`, title: `${gate.NAMES[m]} is here` }))) : null);
  }));
}

function renderSummary() {
  const box = $("#summary");
  const doc = S.threadDocs.get(S.thread);
  const t = THREADS.find((x) => x.id === S.thread);
  $("#thread-name").textContent = t.name;
  if (doc?.summary) {
    const ms = tsMs(doc.summaryUpdatedAt);
    box.replaceChildren(
      h("p", { class: "summary-label", text: `Pinned summary${doc.updatedBy ? ` by ${doc.updatedBy}` : ""}${ms ? `, ${fmtTime.format(ms)}` : ""}` }),
      h("p", { class: "summary-text", text: doc.summary }));
  } else {
    box.replaceChildren(h("p", { class: "summary-empty", text: "No pinned summary yet. The agents pin one here once this topic has something to track." }));
  }
}

function seedDiscussion() {
  if (S.thread !== "general" || !S.board?.discussion) return [];
  return S.board.discussion.map((d, i) => ({
    id: `seed-discussion-${i + 1}`, authorKind: "agent", role: d.agent, text: d.text, topic: d.topic, displayTime: d.time,
    sortMs: -1000 + i, seed: true, deleted: false
  }));
}

function msgSortKey(m) {
  return m.sortMs ?? tsMs(m.createdAt) ?? m.clientCreatedAt ?? 0;
}

function renderMessages(reset = false) {
  const list = $("#messages");
  const nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
  const items = [];
  const stored = [...S.msgs.values()];
  const seedIds = new Set(stored.map((m) => m.id));
  for (const s of seedDiscussion()) if (!seedIds.has(s.id)) items.push({ kind: "msg", key: s.id, sort: msgSortKey(s), m: s });
  for (const m of stored) items.push({ kind: "msg", key: m.id, sort: msgSortKey(m), m });
  for (const p of S.proposals.values()) if (p.threadId === S.thread) items.push({ kind: "proposal", key: `p-${p.id}`, sort: p.createdAtMs ?? 0, p });
  items.sort((a, b) => a.sort - b.sort || String(a.key).localeCompare(String(b.key)));

  const existing = new Map([...list.querySelectorAll(":scope > li[data-key]")].map((n) => [n.dataset.key, n]));
  const fresh = [];
  const nodes = items.map((it) => {
    const sig = it.kind === "proposal"
      ? JSON.stringify([it.p.status, it.p.votes, S.voteBusy.has(it.p.id), S.voteMsg.get(it.p.id), it.p.summary])
      : JSON.stringify([it.m.text, it.m.deleted, it.m.editedAt ? 1 : 0, S.pending.has(it.key), S.editing === it.key, S.confirmDelete === it.key, it.m.replyTo]);
    let node = existing.get(it.key);
    if (node && node.dataset.sig === sig) return node;
    if (node && S.editing === it.key && node.querySelector("textarea")) return node;
    const isNew = !node && !reset;
    const statusChanged = node && it.kind === "proposal" && node.dataset.status !== it.p.status;
    node = it.kind === "proposal" ? proposalItem(it.p) : messageItem(it.m);
    node.dataset.key = it.key; node.dataset.sig = sig;
    if (isNew) fresh.push(node);
    if (statusChanged) fresh.push(node);
    return node;
  });
  const sentinel = $("#load-older-wrap");
  list.replaceChildren(sentinel, ...nodes);
  if (!items.length) list.append(h("li", { class: "empty", text: S.snapshotMode ? "Chat needs a connection. Messages appear here when you're back online." : "No messages in this topic yet. Start the conversation below." }));
  renderLoadOlder();
  fresh.forEach((n) => (n.classList.contains("msg--proposal") ? motion.stateChanged(n) : motion.settleIn(n)));
  if (reset || nearBottom) scrollToBottom(true);
}

function proposalItem(p) {
  const li = h("li", { class: "msg msg--agent msg--proposal", "data-status": p.status },
    h("div", { class: "msg-head" }, roleLabel(p.createdBy || "Coordinator"), h("span", { class: "msg-time", text: p.createdAtMs ? fmtTime.format(p.createdAtMs) : "" })),
    proposalCard(p, "chat"));
  return li;
}

function roleLabel(role) {
  const key = AGENTS[role] || "agent";
  return h("span", { class: `author author--agent role--${key}` }, h("span", { class: "role-dot", "aria-hidden": "true" }), h("span", { text: role }));
}

function messageItem(m) {
  const mine = m.authorKind === "human" && m.authorId === S.member;
  const agent = m.authorKind === "agent";
  const time = m.displayTime || (tsMs(m.createdAt) ? fmtTime.format(tsMs(m.createdAt)) : (m.clientCreatedAt ? fmtTime.format(m.clientCreatedAt) : ""));
  const head = h("div", { class: "msg-head" },
    agent ? roleLabel(m.role) : h("span", { class: `author author--human member--${m.authorId}`, text: gate.NAMES[m.authorId] || "Family member" }),
    h("span", { class: "msg-time", text: time }),
    m.editedAt && !m.deleted ? h("span", { class: "msg-flag", text: "edited" }) : null,
    S.pending.has(m.id) ? h("span", { class: "msg-flag msg-flag--sending", text: "sending…" }) : null);

  let quote = null;
  if (m.replyTo) {
    const parent = S.msgs.get(m.replyTo);
    const who = parent ? (parent.authorKind === "agent" ? parent.role : gate.NAMES[parent.authorId]) : null;
    const snippet = parent ? (parent.deleted ? "deleted message" : parent.text.slice(0, 90)) : "an earlier message";
    quote = h("a", { class: "quote", href: `#m-${m.replyTo}`, "data-jump": m.replyTo }, `Replying to ${who || "a message"}: ${snippet}`);
  }

  let body;
  if (S.editing === m.id) {
    const ta = h("textarea", { class: "edit-box", rows: "3", maxlength: "2000", "aria-label": "Edit message" });
    ta.value = m.text;
    body = h("form", { class: "edit-form", "data-edit": m.id },
      ta, h("div", { class: "row-actions" },
        h("button", { type: "submit", class: "btn btn--primary", text: "Save edit" }),
        h("button", { type: "button", class: "btn", "data-action": "cancel-edit", text: "Cancel" })));
  } else {
    body = h("div", { class: `msg-text${m.deleted ? " msg-text--deleted" : ""}` },
      m.topic ? h("strong", { class: "msg-topic", text: m.topic }) : null,
      m.deleted ? "Message deleted" : m.text);
  }

  let actions = null;
  if (!m.seed && !m.deleted && S.editing !== m.id && !S.snapshotMode) {
    if (S.confirmDelete === m.id) {
      actions = h("div", { class: "row-actions confirm" },
        h("span", { text: "Delete this message?" }),
        h("button", { type: "button", class: "btn btn--danger", "data-action": "delete", "data-id": m.id, text: "Delete" }),
        h("button", { type: "button", class: "btn", "data-action": "cancel-delete", text: "Keep" }));
    } else {
      actions = h("div", { class: "msg-actions" },
        h("button", { type: "button", class: "link-btn", "data-action": "reply", "data-id": m.id, text: "Reply" }),
        mine ? h("button", { type: "button", class: "link-btn", "data-action": "edit", "data-id": m.id, text: "Edit" }) : null,
        mine ? h("button", { type: "button", class: "link-btn", "data-action": "ask-delete", "data-id": m.id, text: "Delete" }) : null);
    }
  }

  return h("li", { class: `msg ${agent ? "msg--agent" : "msg--human"}${mine ? " msg--mine" : ""}${m.kind === "reminder" ? " msg--reminder" : ""}`, id: `m-${m.id}` },
    head, quote, body, actions);
}

function renderLoadOlder() {
  const wrap = $("#load-older-wrap");
  const btn = $("#load-older");
  wrap.hidden = !S.moreOlder;
  btn.disabled = S.loadingOlder;
  btn.textContent = S.loadingOlder ? "Loading earlier messages…" : "Load earlier messages";
}

function renderReply() {
  const bar = $("#replying");
  if (!S.replyTo) { bar.hidden = true; return; }
  const m = S.msgs.get(S.replyTo);
  bar.hidden = false;
  $("#replying-text").textContent = m ? `Replying to ${m.authorKind === "agent" ? m.role : gate.NAMES[m.authorId]}: ${m.text.slice(0, 80)}` : "Replying to a message";
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

  // Votes (strip and chat cards share the same markup).
  document.addEventListener("click", (e) => {
    const vote = e.target.closest("button[data-vote]");
    if (vote && !vote.disabled) castVote(vote.dataset.pid, vote.dataset.vote);
  });

  $("#threads").addEventListener("click", (e) => {
    const b = e.target.closest("[data-thread]");
    if (b) selectThread(b.dataset.thread);
  });
  $("#threads").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = THREAD_IDS.indexOf(S.thread);
    const next = THREAD_IDS[(i + (e.key === "ArrowRight" ? 1 : THREAD_IDS.length - 1)) % THREAD_IDS.length];
    selectThread(next);
    $(`#threads [data-thread="${next}"]`)?.focus();
  });

  $("#messages").addEventListener("click", (e) => {
    const jump = e.target.closest("[data-jump]");
    if (jump) {
      e.preventDefault();
      const target = document.getElementById(`m-${jump.dataset.jump}`);
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
      target?.classList.add("msg--flash");
      setTimeout(() => target?.classList.remove("msg--flash"), 1600);
      return;
    }
    const b = e.target.closest("button[data-action]");
    if (!b) return;
    const id = b.dataset.id;
    switch (b.dataset.action) {
      case "reply": S.replyTo = id; renderReply(); $("#composer").focus(); break;
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
  list.addEventListener("scroll", () => { if (list.scrollTop < 40 && S.moreOlder) loadOlder(); }, { passive: true });

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
    if (S.snapshotMode || !S.fb || !S.member) { flash("Chat needs a connection to the family board. Your draft is saved on this device."); return; }
    if (text.length > 2000) { flash("Messages can be up to 2,000 characters."); return; }
    sendMessage(text);
    ta.value = ""; autoGrow(ta); store.del(LS.draft(S.thread));
  });
  $("#cancel-reply").addEventListener("click", () => { S.replyTo = null; renderReply(); });

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

  S.clockTimer = setInterval(() => { renderStatus(); maybeSendReminders(); }, 30000);
}

// Where the back-to-top button can sit without covering the composer or any vote buttons:
// start at its normal bottom-right spot and move up past whatever is underneath. If that would
// take it more than halfway up the screen, it stays hidden until the obstacle scrolls away.
let btnSize = { w: 150, h: 48 };
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
