// The unanimous confirmation gate, as pure functions (no Firebase), shared by the app and the tests.
// firestore.rules enforces the same outcome on the server.

export const MEMBERS = ["john", "nickie", "johnny"];
export const NAMES = { john: "John", nickie: "Nickie", johnny: "Johnny" };
export const CELL_FIELDS = ["order", "date", "leg", "transport", "stay", "activities", "cost", "status"];
export const FIELD_LABELS = {
  order: "Thứ tự", date: "Ngày", leg: "Chặng", transport: "Di chuyển", stay: "Chỗ ở",
  activities: "Hoạt động chính", cost: "Chi phí ước tính", status: "Trạng thái"
};
export const REMINDER_AFTER_MS = 72 * 60 * 60 * 1000;

// Which vote changes a member may make on a pending proposal.
export function canVote(proposal, member, choice) {
  if (!proposal || proposal.status !== "pending") return false;
  if (!MEMBERS.includes(member) || (choice !== "ok" && choice !== "no")) return false;
  const prev = proposal.votes?.[member];
  return (prev === "pending") || (prev === "ok" && choice === "no");
}

// Result of casting a vote: "rejected" on any No, "applied" when all three are OK, else "pending".
export function outcomeAfterVote(votes, member, choice) {
  const next = { ...votes, [member]: choice };
  if (MEMBERS.some((m) => next[m] === "no")) return { votes: next, status: "rejected" };
  if (MEMBERS.every((m) => next[m] === "ok")) return { votes: next, status: "applied" };
  return { votes: next, status: "pending" };
}

export function pickCells(row) {
  if (!row) return null;
  const out = {};
  for (const f of CELL_FIELDS) out[f] = row[f];
  return out;
}

export function sameCells(a, b) {
  if (a === null || b === null || a === undefined || b === undefined) return (a ?? null) === (b ?? null);
  return CELL_FIELDS.every((f) => a[f] === b[f]);
}

// True when every row the proposal touches still matches the proposal's "before" values.
export function proposalStillFits(proposal, rowsById) {
  return (proposal.rowIds || []).every((id) => sameCells(pickCells(rowsById[id]) ?? null, proposal.changes?.[id]?.before ?? null));
}

// Human-readable list of the field changes in a proposal: [{ rowId, rowLabel, field, before, after }].
export function describeChanges(proposal, rowsById) {
  const items = [];
  for (const id of proposal.rowIds || []) {
    const ch = proposal.changes?.[id] || {};
    const before = ch.before || {};
    const after = ch.after || {};
    const rowLabel = after.leg || before.leg || rowsById[id]?.leg || id;
    for (const f of CELL_FIELDS) {
      if (f === "order" && ch.before) { if (before.order !== after.order) items.push({ rowId: id, rowLabel, field: f, before: String(before.order), after: String(after.order) }); continue; }
      if (!ch.before) { if (f !== "order") items.push({ rowId: id, rowLabel, field: f, before: null, after: after[f] }); continue; }
      if (before[f] !== after[f]) items.push({ rowId: id, rowLabel, field: f, before: before[f], after: after[f] });
    }
  }
  return items;
}

// Must match reminderText() in firestore.rules exactly.
export function reminderText(summary) {
  return `Reminder: "${summary}" is still waiting for votes after 72 hours. Vote OK or No above the plan table.`;
}

export function reminderDue(proposal, nowMs) {
  const created = proposal.createdAtMs;
  return proposal.status === "pending" && proposal.reminderSent === false && typeof created === "number" && nowMs - created > REMINDER_AFTER_MS;
}
