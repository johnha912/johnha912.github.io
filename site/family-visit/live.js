// Realtime listeners with recovery.
//
// - Every watch is an onSnapshot listener with metadata changes, so cached and pending data render at once.
// - A canary watch (meta/heartbeat) tells whether the server is reachable: fromCache=false means live.
// - Listener error, or "online but only cached data" for longer than staleMs, starts reconnecting with
//   exponential backoff (1 s, 2 s, 4 s ... capped at 30 s): the network is cycled and every listener resubscribed.
// - If reconnecting lasts longer than pollAfterMs, the watches are also fetched from the server every pollMs
//   (30 s in production) until a listener is live again.
// - permission-denied is never retried: it goes to onDenied.

export function createConnection({ fs, db, timing, onState, onDenied }) {
  const watches = new Map();
  let state = navigator.onLine ? "connecting" : "offline";
  let attempts = 0;
  let reconnectTimer = null;
  let pollTimer = null;
  let cacheSince = Date.now();
  let canaryLive = false;
  let reconnectingSince = null;
  let stopped = false;

  const setState = (s) => {
    if (s === state) return;
    state = s;
    onState?.(s);
  };

  function subscribe(w) {
    w.unsub?.();
    const opts = { includeMetadataChanges: true };
    w.unsub = fs.onSnapshot(w.target, opts, (snap) => {
      w.fromCache = snap.metadata.fromCache;
      if (w.canary) handleCanary(!snap.metadata.fromCache);
      else if (!snap.metadata.fromCache) markLive();
      w.onData(snap, { fromCache: snap.metadata.fromCache, polled: false });
    }, (err) => handleError(w, err));
  }

  function handleCanary(isLive) {
    if (isLive) { canaryLive = true; markLive(); }
    else { if (canaryLive) cacheSince = Date.now(); canaryLive = false; }
  }

  function markLive() {
    attempts = 0;
    reconnectingSince = null;
    clearTimeout(reconnectTimer); reconnectTimer = null;
    stopPolling();
    if (navigator.onLine) setState("live");
  }

  function handleError(w, err) {
    w.unsub?.(); w.unsub = null;
    if (err?.code === "permission-denied") { console.warn(`[family-visit] listener "${w.name}" was refused by the server`); onDenied?.(err, w.name); return; }
    console.warn(`[family-visit] listener "${w.name}" failed: ${err?.code || err}`);
    scheduleReconnect();
  }

  function scheduleReconnect() {
    if (stopped || reconnectTimer) return;
    if (!navigator.onLine) { setState("offline"); return; }
    if (!reconnectingSince) reconnectingSince = Date.now();
    if (state !== "polling") setState("reconnecting");
    attempts += 1;
    const delay = Math.min(timing.backoffBaseMs * 2 ** (attempts - 1), timing.backoffMaxMs);
    reconnectTimer = setTimeout(async () => {
      reconnectTimer = null;
      try { await fs.disableNetwork(db); await fs.enableNetwork(db); } catch { /* keep going */ }
      for (const w of watches.values()) subscribe(w);
      maybeStartPolling();
      // If the canary is still not live after this attempt, the monitor schedules the next one.
    }, delay);
  }

  function maybeStartPolling() {
    if (pollTimer || !reconnectingSince) return;
    if (Date.now() - reconnectingSince < timing.pollAfterMs) return;
    setState("polling");
    const poll = async () => {
      for (const w of watches.values()) {
        try {
          const snap = w.isDoc ? await fs.getDocFromServer(w.target) : await fs.getDocsFromServer(w.target);
          w.onData(snap, { fromCache: false, polled: true });
        } catch { /* backend still unreachable; try again next round */ }
      }
    };
    poll();
    pollTimer = setInterval(poll, timing.pollMs);
  }

  function stopPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }

  // Health monitor: offline, stale cache while online, and the polling threshold.
  const monitor = setInterval(() => {
    if (stopped) return;
    if (!navigator.onLine) { setState("offline"); return; }
    if (state === "offline") { setState("reconnecting"); scheduleReconnect(); return; }
    if (!canaryLive && Date.now() - cacheSince > timing.staleMs) scheduleReconnect();
    maybeStartPolling();
  }, 1000);

  const onOnline = () => { cacheSince = Date.now(); setState("reconnecting"); attempts = 0; scheduleReconnect(); };
  const onOffline = () => { canaryLive = false; setState("offline"); };
  addEventListener("online", onOnline);
  addEventListener("offline", onOffline);

  return {
    watch(name, target, onData, { isDoc = false, canary = false } = {}) {
      const old = watches.get(name);
      old?.unsub?.();
      const w = { name, target, onData, isDoc, canary, unsub: null, fromCache: true };
      watches.set(name, w);
      subscribe(w);
      return w;
    },
    unwatch(name) {
      const w = watches.get(name);
      w?.unsub?.();
      watches.delete(name);
    },
    state: () => state,
    isLive: () => state === "live",
    stop() {
      stopped = true;
      clearInterval(monitor);
      clearTimeout(reconnectTimer);
      stopPolling();
      removeEventListener("online", onOnline);
      removeEventListener("offline", onOffline);
      for (const w of watches.values()) w.unsub?.();
      watches.clear();
    }
  };
}
