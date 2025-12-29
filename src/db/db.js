/**
 * PersonaBalance Database Module (Week 1-5 reports)
 *
 * DB ownership/reporting: Oguzhan Eres
 *
 * This module implements the DB layer described in the sprint reports:
 * - Week 1: research + schema + DB API skeleton
 * - Week 2: WASM init + table creation + inserts + selfTest
 * - Week 3: read-and-process export for AI (getRecentSummary)
 * - Week 4: report persistence (reports table)
 * - Week 5: stability cleanup (cleanupOldEvents)
 *
 * Implementation uses a browser SQLite WASM runtime (`@sqlite.org/sqlite-wasm`).
 */
import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

let sqlite3;
let db;
const SCHEMA_VERSION = 1;

function asInt(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
}

function normalizeMood(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed === "Calm" || trimmed === "Balanced" || trimmed === "Aggressive") return trimmed;
  return null;
}

function nowUnixSeconds() {
  return Math.floor(Date.now() / 1000);
}

async function ensureRuntime() {
  if (sqlite3) return sqlite3;
  sqlite3 = await sqlite3InitModule({
    print: console.log,
    printErr: console.error,
  });
  return sqlite3;
}

function createSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts INTEGER NOT NULL,
      clicks INTEGER NOT NULL DEFAULT 0,
      keys INTEGER NOT NULL DEFAULT 0,
      focus INTEGER NOT NULL DEFAULT 0,
      window_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS summary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts INTEGER NOT NULL,
      click_count INTEGER NOT NULL DEFAULT 0,
      key_count INTEGER NOT NULL DEFAULT 0,
      focus_count INTEGER NOT NULL DEFAULT 0,
      score INTEGER NOT NULL DEFAULT 0,
      mood TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts INTEGER NOT NULL,
      mood_tag TEXT,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Legacy table kept for current UI (`src/script.js`) which expects it.
  db.exec(`
    CREATE TABLE IF NOT EXISTS interaction_summary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      click_count INTEGER NOT NULL,
      key_count INTEGER NOT NULL,
      focus_count INTEGER NOT NULL,
      score INTEGER NOT NULL,
      mode TEXT NOT NULL
    );
  `);

  db.exec({
    sql: "INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)",
    bind: ["schemaVersion", String(SCHEMA_VERSION)],
  });
}

export async function initDb(options = {}) {
  if (db) return db;

  await ensureRuntime();
  const filename = options.filename || "personabalance.sqlite3";
  const flags = options.flags || "c";
  db = new sqlite3.oo1.DB(filename, flags);

  createSchema();
  return db;
}

/**
 * Week 2: Insert raw event data into `events`.
 * Data contract: { ts, clicks, keys, focus, window_id? }
 */
export async function insertEvent(event) {
  await initDb();
  if (!event || typeof event !== "object") throw new Error("[DB] event is required");

  const ts = asInt(event.ts);
  if (ts <= 0) throw new Error("[DB] Invalid event.ts");

  const clicks = Math.max(0, asInt(event.clicks));
  const keys = Math.max(0, asInt(event.keys));
  const focus = Math.max(0, asInt(event.focus));
  const windowId = typeof event.window_id === "string" ? event.window_id : null;

  db.exec({
    sql: "INSERT INTO events (ts, clicks, keys, focus, window_id) VALUES (?, ?, ?, ?, ?)",
    bind: [ts, clicks, keys, focus, windowId],
  });

  const out = [];
  db.exec({
    sql: "SELECT last_insert_rowid() AS id",
    rowMode: "object",
    callback: (row) => out.push(row),
  });
  return { success: true, id: out[0]?.id };
}

/**
 * Week 2: Insert aggregated summary into `summary`.
 * Data contract: { ts, click_count, key_count, focus_count, score, mood }
 */
export async function insertSummary(summary) {
  await initDb();
  if (!summary || typeof summary !== "object") throw new Error("[DB] summary is required");

  const ts = asInt(summary.ts);
  if (ts <= 0) throw new Error("[DB] Invalid summary.ts");

  const clickCount = Math.max(0, asInt(summary.click_count ?? summary.clickCount ?? summary.clicks));
  const keyCount = Math.max(0, asInt(summary.key_count ?? summary.keyCount ?? summary.keys));
  const focusCount = Math.max(0, asInt(summary.focus_count ?? summary.focusCount ?? summary.focus));
  const score = Math.max(0, asInt(summary.score));
  const mood = normalizeMood(summary.mood ?? summary.mode);

  db.exec({
    sql: `
      INSERT INTO summary (ts, click_count, key_count, focus_count, score, mood)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    bind: [ts, clickCount, keyCount, focusCount, score, mood],
  });

  return { success: true };
}

/**
 * Week 3: Aggregate "last N minutes" into a JSON-friendly payload for AI.
 */
export async function getRecentSummary(minutes = 60) {
  await initDb();
  const minutesInt = Math.max(1, asInt(minutes, 60));
  const startTs = nowUnixSeconds() - minutesInt * 60;

  const buckets = [];
  db.exec({
    sql: `
      SELECT
        (ts / 60) * 60 AS bucket_ts,
        SUM(clicks) AS clicks,
        SUM(keys) AS keys,
        SUM(focus) AS focus,
        COUNT(*) AS samples
      FROM events
      WHERE ts >= ?
      GROUP BY bucket_ts
      ORDER BY bucket_ts ASC
    `,
    bind: [startTs],
    rowMode: "object",
    callback: (row) => buckets.push(row),
  });

  const totals = buckets.reduce(
    (acc, row) => {
      acc.clicks += asInt(row.clicks);
      acc.keys += asInt(row.keys);
      acc.focus += asInt(row.focus);
      acc.samples += asInt(row.samples);
      return acc;
    },
    { clicks: 0, keys: 0, focus: 0, samples: 0 }
  );

  return {
    windowMinutes: minutesInt,
    startTs,
    endTs: nowUnixSeconds(),
    totals,
    buckets: buckets.map((r) => ({
      ts: asInt(r.bucket_ts),
      clicks: asInt(r.clicks),
      keys: asInt(r.keys),
      focus: asInt(r.focus),
      samples: asInt(r.samples),
    })),
  };
}

/**
 * Week 4: Persist AI report output.
 */
export async function insertReport(reportData) {
  await initDb();
  if (!reportData || typeof reportData !== "object") throw new Error("[DB] reportData is required");

  const ts = asInt(reportData.ts ?? reportData.timestamp ?? nowUnixSeconds());
  const moodTag = normalizeMood(reportData.mood_tag ?? reportData.moodTag ?? reportData.mood) ?? null;
  const content = String(reportData.content ?? "").trim();
  if (!content) throw new Error("[DB] report content is required");

  db.exec({
    sql: "INSERT INTO reports (ts, mood_tag, content) VALUES (?, ?, ?)",
    bind: [ts, moodTag, content],
  });

  return { success: true };
}

export async function getAllReports(limit = 50) {
  await initDb();
  const limitInt = Math.max(1, Math.min(500, asInt(limit, 50)));
  const rows = [];

  db.exec({
    sql: `
      SELECT id, ts, mood_tag, content
      FROM reports
      ORDER BY id DESC
      LIMIT ?
    `,
    bind: [limitInt],
    rowMode: "object",
    callback: (row) => rows.push(row),
  });

  return rows;
}

/**
 * Week 5: Delete raw logs older than N hours to prevent long-session memory growth.
 */
export async function cleanupOldEvents(maxAgeHours = 24) {
  await initDb();
  const hours = Math.max(1, asInt(maxAgeHours, 24));
  const cutoffTs = nowUnixSeconds() - hours * 3600;

  db.exec({ sql: "DELETE FROM events WHERE ts < ?", bind: [cutoffTs] });
  return { success: true, cutoffTs };
}

export async function clearDatabase() {
  await initDb();
  db.exec("DELETE FROM events;");
  db.exec("DELETE FROM summary;");
  db.exec("DELETE FROM reports;");
  db.exec("DELETE FROM interaction_summary;");
}

/**
 * Week 2: Basic verification routine for demos/dev.
 */
export async function selfTest() {
  await initDb();

  const ts = nowUnixSeconds();
  await insertEvent({ ts, clicks: 1, keys: 2, focus: 1, window_id: "selfTest" });
  await insertSummary({ ts, click_count: 1, key_count: 2, focus_count: 1, score: 10, mood: "Balanced" });
  await insertReport({ ts, mood_tag: "Balanced", content: "Self-test report" });
  await cleanupOldEvents(24);

  const payloadSample = await getRecentSummary(60);
  const reportsSample = await getAllReports(5);

  return { ok: true, schemaVersion: SCHEMA_VERSION, payloadSample, reportsSample };
}
