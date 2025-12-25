console.log("Drag JS loaded");
// PersonaBalance
// Week 1–2: Desktop UI + window behavior
// Week 3: Interaction tracking + mode calculation
// Week 4: SQLite WASM persistence + History panel
// Week 5: Stabilization & finalization

/* ===================== IMPORTS ===================== */
import {
  initDb,
  insertRecord,
  getRecentRecords,
  clearRecords
} from "./sqliteClient.js";

/* ===================== DOM ELEMENTS ===================== */
const modeText = document.getElementById("modeText");
const clickCountEl = document.getElementById("clickCount");
const keyCountEl = document.getElementById("keyCount");
const focusCountEl = document.getElementById("focusCount");
const debugBox = document.getElementById("debugBox");
const historyPanel = document.getElementById("historyPanel");
const desktopIcon = document.getElementById("desktopIcon");

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

desktopIcon.addEventListener("dblclick", () => {
  windowEl.style.display = "block";
  restoreWindowPosition();
  logDebug("Window opened from desktop icon");
});
function saveWindowPosition() {
  const pos = {
    left: windowEl.style.left,
    top: windowEl.style.top
  };
  localStorage.setItem("windowPosition", JSON.stringify(pos));
}
function restoreWindowPosition() {
  const pos = JSON.parse(localStorage.getItem("windowPosition"));
  if (pos) {
    windowEl.style.left = pos.left;
    windowEl.style.top = pos.top;
  }
}


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
  e.preventDefault(); // 🔴 KRİTİK
  isDragging = true;
  offsetX = e.clientX - windowEl.offsetLeft;
  offsetY = e.clientY - windowEl.offsetTop;
});


document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  windowEl.style.left = `${e.clientX - offsetX}px`;
  windowEl.style.top = `${e.clientY - offsetY}px`;
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    saveWindowPosition();
  }
  isDragging = false;
});


closeBtn.addEventListener("click", () => {
  saveWindowPosition();
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

/* ===================== DATA MODEL (WEEK 4) ===================== */
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

  // Build & save record
  const record = buildInteractionRecord(score, mode);
  await insertRecord(record);

  // Refresh history
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
  logDebug("Analysis started (30s window).");
  analysisTimer = setInterval(runAnalysisCycle, WINDOW_MS);
});

resetBtn.addEventListener("click", async () => {
  clickCount = 0;
  keyCount = 0;
  focusCount = 0;

  clickCountEl.textContent = "0";
  keyCountEl.textContent = "0";
  focusCountEl.textContent = "0";

  modeText.textContent = "Balanced";
  modeText.style.color = "black";

  debugBox.innerHTML = "";

  if (analysisTimer) {
    clearInterval(analysisTimer);
    analysisTimer = null;
  }

  await clearRecords();
  await renderHistoryPanel();

  logDebug("SQLite records cleared");
});

/* ===================== INIT ===================== */
(async () => {
  await requestPersistentStorage();
  await initDb();

  restoreWindowPosition();   // 👈 EKLENDİ
  await renderHistoryPanel();
})();

