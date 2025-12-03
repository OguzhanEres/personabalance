# PersonaBalance - System Architecture (Week 1)

## Overview
Client-side analytics running in the browser.
**Tech Stack:** HTML/JS (UI) + sql.js (In-memory DB).

## Module Status
* **Event Tracker:** In progress (Furkan). Currently sending mock data.
* **Database:** Week 1 focus. Defining schema and API structure.
* **UI:** Layouts are ready (Mustafa/Muhammed).

---

## Data Flow (Draft)
1. **Input:** Tracker captures clicks/keys every 30 seconds.
2. **Process:** `insertEvent()` receives raw JSON.
3. **Storage:** Saved to in-memory SQLite (events table).
4. **Output:** UI queries DB for stats (Week 2).

---

## Database Schema

Using `sql.js` for the prototype. We will add IndexedDB persistence later.

### 1. Table: `events`
Raw interaction logs.

```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,          -- Unix timestamp
  clicks INTEGER DEFAULT 0,
  keys INTEGER DEFAULT 0,
  window_switches TEXT,         -- TODO: Add logic in Week 2
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);