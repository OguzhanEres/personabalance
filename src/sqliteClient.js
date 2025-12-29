import { initDb as initCoreDb, insertEvent, insertSummary } from "./db/db.js";

let db;

export async function initDb() {
  db = await initCoreDb();
  return db;
}

export async function insertRecord(rec) {
  await initDb();
  if (!rec) return;

  db.exec({
    sql: `
      INSERT INTO interaction_summary
      (timestamp, click_count, key_count, focus_count, score, mode)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    bind: [
      rec.timestamp,
      rec.clickCount ?? 0,
      rec.keyCount ?? 0,
      rec.focusCount ?? 0,
      rec.score ?? 0,
      rec.mode ?? "Balanced",
    ],
  });

  // Report-aligned tables (events/summary) for Week 2-5 DB module.
  const ts = Math.floor(Date.parse(rec.timestamp) / 1000) || Math.floor(Date.now() / 1000);
  await insertEvent({
    ts,
    clicks: rec.clickCount ?? 0,
    keys: rec.keyCount ?? 0,
    focus: rec.focusCount ?? 0,
    window_id: "analysisCycle",
  });
  await insertSummary({
    ts,
    click_count: rec.clickCount ?? 0,
    key_count: rec.keyCount ?? 0,
    focus_count: rec.focusCount ?? 0,
    score: rec.score ?? 0,
    mood: rec.mode ?? "Balanced",
  });
}

export async function getRecentRecords(limit = 10) {
  await initDb();
  const rows = [];

  db.exec({
    sql: `
      SELECT timestamp, click_count, key_count, focus_count, score, mode
      FROM interaction_summary
      ORDER BY id DESC
      LIMIT ?
    `,
    bind: [limit],
    rowMode: "object",
    callback: (row) => rows.push(row),
  });

  return rows;
}

export async function clearRecords() {
  await initDb();
  db.exec("DELETE FROM interaction_summary;");
}
