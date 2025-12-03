/**
 * PersonaBalance Database Module
 * Status: Week 1 Skeleton
 * Note: Actual sql.js integration is scheduled for Week 2.
 */

let db = null;

// Initialize the database (Placeholder)
export async function initDb() {
    // TODO: Load sql.js wasm binary
    // TODO: Create tables (events, summary) if they don't exist
    console.log("[DB] initDb called. Waiting for sql.js implementation.");
}

/**
 * Insert raw event data from the tracker.
 * Data format: { ts: number, clicks: number, keys: number }
 */
export function insertEvent(event) {
    if (!event || typeof event.ts !== 'number') {
        console.error("[DB] Invalid event data");
        return;
    }

    // TODO: Validation & SQL Insert
    // console.log("INSERT INTO events...", event);
    console.log("[DB] Mock insertEvent:", event);
    
    return { success: true, id: Math.floor(Math.random() * 1000) }; 
}

/**
 * Insert aggregated summary data.
 * Data format: { ts, clicks, keys, window_type }
 * Note: 'mood' and 'score' columns will be populated later (AI module).
 */
export function insertSummary(summary) {
    // TODO: Check for duplicates based on timestamp + window_type
    console.log("[DB] Mock insertSummary:", summary);

    return { success: true };
}

// -- Queries (Planned for Week 2) --

export function getEvents(startTs, endTs) {
    // TODO: Implement SELECT range query
    console.log("[DB] getEvents not implemented yet.");
    return [];
}

export function getSummary(startTs, endTs, windowType = 'event') {
    // TODO: Implement summary query
    return [];
}

// -- Dev / Test Utils --

export function clearDatabase() {
    console.warn("[DB] clearDatabase: This will wipe in-memory data.");
}

export function selfTest() {
    console.log("--- DB Skeleton Check ---");
    if (typeof initDb === 'function') console.log("OK: initDb");
    if (typeof insertEvent === 'function') console.log("OK: insertEvent");
    console.log("Structure is ready for logic implementation.");
}