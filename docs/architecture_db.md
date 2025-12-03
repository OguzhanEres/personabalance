# Database Notes

## Decisions

**Library: sql.js**
We decided to use `sql.js` for the prototype.
* **Reason:** It allows us to set up an in-memory DB instantly without configuring Worker threads or Webpack for now.
* **Plan:** We will implement persistence (saving to IndexedDB) in Sprint 2.

---

## Data Contracts (JSON Format)

These are the object structures we agreed on for Week 2 integration.

### 1. Raw Event (Input from Tracker)
Furkan's module sends this every 30 seconds:

```json
{
  "ts": 1701388800000,   // Unix timestamp (ms)
  "clicks": 5,           // Int
  "keys": 23,            // Int
  "window_switches": 0   // Int (Optional)
}