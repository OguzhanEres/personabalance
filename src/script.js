// PersonaBalance
// Week 1–2: Desktop UI + window behavior
// Week 3: Interaction tracking + mode calculation
// Week 4: localStorage persistence + History panel

/* ===================== DOM ELEMENTS ===================== */
import {
  initDb,
  insertRecord,
  getRecentRecords,
  clearRecords
} from "./sqliteClient.js";

const modeText = document.getElementById("modeText");
const clickCountEl = document.getElementById("clickCount");
const keyCountEl = document.getElementById("keyCount");
const focusCountEl = document.getElementById("focusCount");
const debugBox = document.getElementById("debugBox");
const historyPanel = document.getElementById("historyPanel");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const closeBtn = document.getElementById("closeBtn");

const windowEl = document.getElementById("systemWindow");
const titleBar = document.querySelector(".title-bar");

/* ===================== STATE ===================== */

let clickCount = 0;
let keyCount = 0;
let focusCount = 0;

let analysisTimer = null;
const WINDOW_MS = 30000;

/* ===================== DEBUG LOGGER ===================== */

function logDebug(message) {
  const time = new Date().toLocaleTimeString();
  const line = document.createElement("div");
  line.textContent = `[${time}] ${message}`;
  debugBox.prepend(line);
}

/* ===================== WINDOW DRAG ===================== */

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

titleBar.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - windowEl.offsetLeft;
  offsetY = e.clientY - windowEl.offsetTop;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    windowEl.style.left = `${e.clientX - offsetX}px`;
    windowEl.style.top = `${e.clientY - offsetY}px`;
  }
});

closeBtn.addEventListener("click", () => {
  windowEl.style.display = "none";
});

/* ===================== EVENT TRACKING (WEEK 3) ===================== */

document.addEventListener("click", () => {
  clickCount++;
  clickCountEl.textContent = clickCount;
});

document.addEventListener("keydown", (e) => {
  keyCount++;
  keyCountEl.textContent = keyCount;
  logDebug(`Key pressed: ${e.key}`);
});

window.addEventListener("focus", () => {
  focusCount++;
  focusCountEl.textContent = focusCount;
  logDebug("Window focus gained");
});

/* ===================== MODE LOGIC ===================== */

function getIntensityScore() {
  return (clickCount * 2) + (keyCount * 1) + (focusCount * 3);
}

function calculateMode(score) {
  if (score < 20) return "Calm";
  if (score < 60) return "Balanced";
  return "Aggressive";
}

/* ===================== WEEK 4: DATA MODEL ===================== */

function buildInteractionRecord(score, mode) {
  return {
    timestamp: new Date().toISOString(),
    clickCount,
    keyCount,
    focusCount,
    score,
    mode
  };
}

function saveRecordToLocalStorage(record) {
  const key = "personaBalanceRecords";
  const existing = JSON.parse(localStorage.getItem(key)) || [];
  existing.push(record);
  localStorage.setItem(key, JSON.stringify(existing));
  logDebug("Record saved to localStorage");
}

function loadRecordsFromLocalStorage() {
  return JSON.parse(localStorage.getItem("personaBalanceRecords")) || [];
}

/* ===================== HISTORY PANEL ===================== */

async function renderHistoryPanel() {
  const records = await getRecentRecords(10);
  historyPanel.innerHTML = "";

  if (records.length === 0) {
    historyPanel.innerHTML =
      `<p class="empty-history">Henüz kayıt yok.</p>`;
    return;
  }

  records.forEach((rec) => {
    const item = document.createElement("div");
    item.className = "history-item";

    item.innerHTML = `
      <div><b>${new Date(rec.timestamp).toLocaleTimeString()}</b></div>
      <div>
        Mode: <span class="mode">${rec.mode}</span> |
        Score: ${rec.score}
      </div>
      <div>
        C:${rec.click_count} K:${rec.key_count} F:${rec.focus_count}
      </div>
    `;

    historyPanel.appendChild(item);
  });
}


/* ===================== ANALYSIS CYCLE ===================== */

async function runAnalysisCycle() {
  const score = getIntensityScore();
  const mode = calculateMode(score);

  // UI update
  modeText.textContent = mode;
  modeText.style.color =
    mode === "Calm" ? "green" :
    mode === "Balanced" ? "orange" : "red";

  // Build record
  const record = buildInteractionRecord(score, mode);
  console.log("INSERT ATTEMPT", record);

  // ✅ SQLite insert
  await insertRecord(record);

  // ✅ Refresh history panel from SQLite
  await renderHistoryPanel();

  // Debug log
  logDebug(
    `Cycle completed | score=${score} | mode=${mode} ` +
    `(click=${clickCount}, key=${keyCount}, focus=${focusCount})`
  );

  // Reset counters
  clickCount = 0;
  keyCount = 0;
  focusCount = 0;

  clickCountEl.textContent = "0";
  keyCountEl.textContent = "0";
  focusCountEl.textContent = "0";
}


/* ===================== CONTROLS ===================== */

startBtn.addEventListener("click", () => {
  if (analysisTimer) {
    logDebug("Analysis already running.");
    return;
  }
  logDebug("Analysis started (30s windows).");
  analysisTimer = setInterval(runAnalysisCycle, WINDOW_MS);
});

resetBtn.addEventListener("click", async () => {
  // Reset counters
  clickCount = 0;
  keyCount = 0;
  focusCount = 0;

  clickCountEl.textContent = "0";
  keyCountEl.textContent = "0";
  focusCountEl.textContent = "0";

  // Reset mode UI
  modeText.textContent = "Balanced";
  modeText.style.color = "black";

  // Clear debug output
  debugBox.innerHTML = "";

  // Stop analysis timer
  if (analysisTimer) {
    clearInterval(analysisTimer);
    analysisTimer = null;
  }

  // ✅ Clear SQLite records
  await clearRecords();

  // ✅ Refresh history panel
  await renderHistoryPanel();

  logDebug("SQLite records cleared");
});

async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const granted = await navigator.storage.persist();
    console.log("Persistent storage granted:", granted);
  }
}

/* ===================== INIT ===================== */

(async () => {
  await requestPersistentStorage(); // 👈 EKLENDİ
  await initDb();
  await renderHistoryPanel();
})();


