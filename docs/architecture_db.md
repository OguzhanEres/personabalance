# PersonaBalance - Database Architecture (Week 1-5)

Owner / Scrum Master & Reporting Member (DB scope): Oguzhan Eres

This document reflects the DB layer described in the Week 1-5 sprint reports.
Implementation lives in `src/db/db.js`. The current UI-facing adapter remains in `src/sqliteClient.js`.

## Overview
Client-side analytics runs fully in the browser using a SQLite WASM runtime (in-memory by default).

## System Data Flow
1. **Input (Tracker):** raw interaction events are captured and inserted via `insertEvent()`.
2. **Aggregation:** per-cycle summaries (including `score` + `mood`) are inserted via `insertSummary()`.
3. **AI Export (Week 3):** `getRecentSummary(minutes)` aggregates the last N minutes into an AI-friendly JSON payload.
4. **AI Persistence (Week 4):** AI outputs are saved via `insertReport()` and listed via `getAllReports()`.
5. **Stability (Week 5):** `cleanupOldEvents(24)` deletes raw logs older than 24 hours to stabilize memory usage.

## Database Schema (SQLite)

### Table: `events` (raw logs)
```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,          -- Unix timestamp (seconds)
  clicks INTEGER NOT NULL DEFAULT 0,
  keys INTEGER NOT NULL DEFAULT 0,
  focus INTEGER NOT NULL DEFAULT 0,
  window_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `summary` (aggregated cycles)
```sql
CREATE TABLE summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,          -- Unix timestamp (seconds)
  click_count INTEGER NOT NULL DEFAULT 0,
  key_count INTEGER NOT NULL DEFAULT 0,
  focus_count INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  mood TEXT,                    -- Calm | Balanced | Aggressive
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `reports` (AI report persistence)
```sql
CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,          -- Unix timestamp (seconds)
  mood_tag TEXT,                -- Calm | Balanced | Aggressive
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Database API (Week 2-5)

- `initDb()` initializes WASM DB and creates/migrates schema.
- `insertEvent(event)` validates input and inserts with parameter binding.
- `insertSummary(summary)` validates input and inserts with parameter binding.
- `getRecentSummary(minutes)` aggregates recent activity into an AI payload.
- `insertReport(reportData)` persists AI output (parameter binding; no SQL concatenation).
- `getAllReports(limit)` returns report history for UI display.
- `cleanupOldEvents(maxAgeHours)` deletes old raw data to stabilize memory usage.
