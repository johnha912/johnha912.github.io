// Emulator-only admin helpers over REST ("Bearer owner" bypasses security rules in the emulator).
// Never point these at a live project.

export const PROJECT = "demo-family-visit";
export const FS = "http://127.0.0.1:8080";
export const AUTH = "http://127.0.0.1:9099";
const DOCS = `${FS}/v1/projects/${PROJECT}/databases/(default)/documents`;
const OWNER = { Authorization: "Bearer owner", "Content-Type": "application/json" };

export function enc(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
}

export function dec(v) {
  if (!v) return undefined;
  if ("nullValue" in v) return null;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("stringValue" in v) return v.stringValue;
  if ("timestampValue" in v) return { __ts: v.timestampValue };
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(dec);
  if ("mapValue" in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, dec(x)]));
  return v;
}

export async function setDoc(path, data) {
  const res = await fetch(`${DOCS}/${path}`, { method: "PATCH", headers: OWNER, body: JSON.stringify({ fields: enc(data).mapValue.fields }) });
  if (!res.ok) throw new Error(`admin set ${path}: ${res.status} ${await res.text()}`);
}

export async function getDoc(path) {
  const res = await fetch(`${DOCS}/${path}`, { headers: OWNER });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`admin get ${path}: ${res.status}`);
  const j = await res.json();
  return dec({ mapValue: { fields: j.fields || {} } });
}

export async function listDocs(collectionPath) {
  const out = [];
  let token = "";
  do {
    const res = await fetch(`${DOCS}/${collectionPath}?pageSize=300${token ? `&pageToken=${token}` : ""}`, { headers: OWNER });
    if (!res.ok) throw new Error(`admin list ${collectionPath}: ${res.status}`);
    const j = await res.json();
    for (const d of j.documents || []) out.push({ id: d.name.split("/").pop(), ...dec({ mapValue: { fields: d.fields || {} } }) });
    token = j.nextPageToken || "";
  } while (token);
  return out;
}

export async function clearAll() {
  await fetch(`${FS}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: "DELETE" });
  await fetch(`${AUTH}/emulator/v1/projects/${PROJECT}/accounts`, { method: "DELETE" });
}

export function cells(row) {
  const { order, date, leg, transport, stay, activities, cost, status } = row;
  return { order, date, leg, transport, stay, activities, cost, status };
}

// The baseline every test starts from: timeline rows from timeline-seed.json, table version 1,
// thread docs, and an agent heartbeat. Decisions stay unseeded so the page renders board.json.
export async function seedBaseline(seed, { heartbeatAt = new Date() } = {}) {
  for (const r of seed.rows) {
    await setDoc(`planRows/${r.id}`, { ...cells(r), version: 1, updatedBy: "seed", updatedAt: new Date(), appliedProposal: "seed-initial" });
  }
  await setDoc("planMeta/table", { version: 1, updatedAt: new Date(), updatedBy: "seed", lastProposal: "seed-initial" });
  await setDoc("meta/heartbeat", { lastActive: heartbeatAt, role: "Coordinator" });
  for (const id of ["flights", "san-jose", "nyc", "niagara-falls", "pennsylvania", "budget", "documents-visa", "general"]) {
    await setDoc(`threads/${id}`, { title: id });
  }
}

export async function seedProposal(id, { rowIds, changes, threadId = "general", summary, createdAt = new Date(), votes = { john: "pending", nickie: "pending", johnny: "pending" }, createdBy = "Coordinator" }) {
  await setDoc(`proposals/${id}`, {
    id, summary, threadId, rowIds, changes, votes, status: "pending",
    createdAt, createdBy, updatedBy: createdBy, reminderSent: false
  });
}
