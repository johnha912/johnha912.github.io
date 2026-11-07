// Rules harness: drives the real Firebase JS SDK against the Local Emulator Suite so tests can
// attempt reads and writes as a given test account. Refuses to run anywhere but the emulator.
import { firebaseConfig, FIREBASE_CDN, EMULATOR, usingEmulator } from "../config.js";

const status = document.getElementById("status");
if (!usingEmulator()) {
  status.textContent = "Not running: this harness only works against the local emulator.";
} else {
  const [{ initializeApp }, A, F] = await Promise.all([
    import(`${FIREBASE_CDN}/firebase-app.js`),
    import(`${FIREBASE_CDN}/firebase-auth.js`),
    import(`${FIREBASE_CDN}/firebase-firestore.js`)
  ]);
  const app = initializeApp({ ...firebaseConfig, projectId: EMULATOR.projectId }, `harness-${Math.random()}`);
  const auth = A.getAuth(app);
  A.connectAuthEmulator(auth, `http://${EMULATOR.host}:${EMULATOR.authPort}`, { disableWarnings: true });
  const db = F.getFirestore(app);
  F.connectFirestoreEmulator(db, EMULATOR.host, EMULATOR.firestorePort);

  // {"$st":1} -> serverTimestamp(), {"$ts":"ISO"} -> Timestamp, {"$del":1} -> deleteField()
  const revive = (v) => {
    if (Array.isArray(v)) return v.map(revive);
    if (v && typeof v === "object") {
      if ("$st" in v) return F.serverTimestamp();
      if ("$ts" in v) return F.Timestamp.fromDate(new Date(v.$ts));
      if ("$del" in v) return F.deleteField();
      return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, revive(x)]));
    }
    return v;
  };
  const wrap = async (fn) => {
    try { const r = await fn(); return { ok: true, value: r ?? null }; }
    catch (e) { return { ok: false, code: e.code || String(e.message || e) }; }
  };
  const ref = (path) => F.doc(db, ...path.split("/"));

  window.H = {
    signIn: (email, verified = true, provider = "google") => wrap(async () => {
      if (auth.currentUser) await A.signOut(auth);
      if (provider === "google") {
        await A.signInWithCredential(auth, A.GoogleAuthProvider.credential(JSON.stringify({ sub: `harness-${email}`, email, email_verified: verified })));
      } else {
        await A.createUserWithEmailAndPassword(auth, email, "test-password-123");
      }
      return auth.currentUser.email;
    }),
    get: (path) => wrap(async () => { const s = await F.getDoc(ref(path)); return s.exists() ? s.data() : null; }),
    list: (path) => wrap(async () => (await F.getDocs(F.collection(db, ...path.split("/")))).docs.map((d) => d.id)),
    set: (path, data) => wrap(() => F.setDoc(ref(path), revive(data))),
    update: (path, data) => wrap(() => F.updateDoc(ref(path), revive(data))),
    del: (path) => wrap(() => F.deleteDoc(ref(path))),
    batch: (ops) => wrap(async () => {
      const b = F.writeBatch(db);
      for (const op of ops) {
        if (op.type === "set") b.set(ref(op.path), revive(op.data));
        else if (op.type === "update") b.update(ref(op.path), revive(op.data));
      }
      await b.commit();
    })
  };
  status.textContent = "ready";
}
