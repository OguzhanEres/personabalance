import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

let sqlite3;
let db;

export async function initDb() {
  if (db) return db;

  sqlite3 = await sqlite3InitModule({
    print: console.log,
    printErr: console.error,
  });

 db = new sqlite3.oo1.DB("personabalance.sqlite3", "c");



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

  return db;
}

export async function insertRecord(rec) {
  await initDb();
  db.exec({
    sql: `
      INSERT INTO interaction_summary
      (timestamp, click_count, key_count, focus_count, score, mode)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    bind: [
      rec.timestamp,
      rec.clickCount,
      rec.keyCount,
      rec.focusCount,
      rec.score,
      rec.mode,
    ],
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
