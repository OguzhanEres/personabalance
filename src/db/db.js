/**
 * PersonaBalance Database Module
 * Handles SQLite (wasm) integration and local data storage.
 */

let db = null;

// Initialize the database and create tables
export async function initDb() {
    if (db) return db;

    try {
        console.log("[DB] Loading sql.js...");
        
        // Load sql.js from CDN
        const initSqlJs = await import("https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js");
        const SQL = await initSqlJs.default({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        db = new SQL.Database();

        // Table: Raw events (30-sec intervals)
        db.run(`
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ts INTEGER,
                clicks INTEGER,
                keys INTEGER,
                window_switches INTEGER
            )
        `);

        // Table: Aggregated summaries (processed by Logic module)
        db.run(`
            CREATE TABLE IF NOT EXISTS summary (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ts INTEGER,
                clicks INTEGER,
                keys INTEGER,
                score INTEGER,
                mood TEXT
            )
        `);

        console.log("[DB] Initialized and tables created.");
        return db;

    } catch (error) {
        console.error("[DB] Init failed:", error);
        throw error;
    }
}

// -- Core Functions --

/**
 * Inserts raw tracker data. 
 * Called by: Tracker Module
 */
export function insertEvent(ev) {
    if (!db) return console.error("[DB] Not initialized!");

    // Simple validation
    if (!ev || typeof ev.ts !== 'number') {
        console.warn("[DB] Invalid event data:", ev);
        return;
    }

    try {
        const stmt = db.prepare("INSERT INTO events (ts, clicks, keys, window_switches) VALUES (?, ?, ?, ?)");
        stmt.run([ev.ts, ev.clicks, ev.keys, ev.window_switches || 0]);
        stmt.free();
        
        // Debug 
        // console.log(`[DB] Event saved: ${ev.ts}`);
    } catch (e) {
        console.error("[DB] Insert Event Error:", e);
    }
}

/**
 * Inserts processed summary.
 * Called by: Logic/Mode Calculator
 */
export function insertSummary(sum) {
    if (!db) return console.error("[DB] Not initialized!");

    // Validate enum and range
    const validMoods = ["CALM", "BALANCED", "AGGRESSIVE"];
    if (sum.mood && !validMoods.includes(sum.mood)) {
        console.warn(`[DB] Invalid mood: ${sum.mood}`);
        return;
    }

    try {
        const stmt = db.prepare("INSERT INTO summary (ts, clicks, keys, score, mood) VALUES (?, ?, ?, ?, ?)");
        stmt.run([
            sum.ts, 
            sum.clicks, 
            sum.keys, 
            sum.score || 0, 
            sum.mood || "UNKNOWN"
        ]);
        stmt.free();
        
        console.log(`[DB] Summary saved: ${sum.mood} (Score: ${sum.score})`);
    } catch (e) {
        console.error("[DB] Insert Summary Error:", e);
    }
}

// -- Queries 

export function getEvents(startTs, endTs) {
    // TODO: Implement SELECT range query
    return [];
}

export function getSummary(startTs, endTs) {
    // TODO: Implement summary query for charts
    return [];
}

// -- Dev Tools --

export function clearDatabase() {
    if(db) {
        db.run("DELETE FROM events; DELETE FROM summary;");
        console.log("[DB] All data cleared.");
    }
}

// Quick test to verify tables and inserts work
export async function selfTest() {
    console.log("--- Running DB Self Test ---");
    
    await initDb();

    // 1. Mock Event
    insertEvent({ 
        ts: Date.now(), 
        clicks: 10, 
        keys: 5, 
        window_switches: 1 
    });

    // 2. Mock Summary
    insertSummary({
        ts: Date.now(),
        clicks: 50,
        keys: 120,
        score: 85,
        mood: "AGGRESSIVE"
    });

    // 3. Verify
    const res = db.exec("SELECT * FROM events");
    const resSum = db.exec("SELECT * FROM summary");

    if (res.length > 0 && resSum.length > 0) {
        console.log("DB Test Passed: Rows inserted successfully.");
    } else {
        console.error("DB Test Failed: No data found.");
    }
    console.log("----------------------------");
}