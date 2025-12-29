console.log("PersonaBalance - Complete System");
// PersonaBalance - Complete Implementation
// Features: Balance Bar, Theme System, AI Reports, Notifications, Window Management

/* ===================== IMPORTS ===================== */
import {
  initDb,
  insertRecord,
  getRecentRecords,
  clearRecords
} from "./sqliteClient.js";
import { generateAIReport, updateAIConfig, getAIConfig } from "./aiConfig.js";

/* ===================== SAFE HELPERS ===================== */
function $(id) {
  return document.getElementById(id);
}

/* ===================== STATE ===================== */
let clickCount = 0;
let keyCount = 0;
let focusCount = 0;
let currentMode = "Balanced";
let modeHistory = [];
let analysisTimer = null;
let reportTimer = null;
let imbalanceCounter = 0;
const WINDOW_MS = 30000; // 30 seconds
const REPORT_INTERVAL = 300000; // 5 minutes for AI reports
const IMBALANCE_THRESHOLD = 3; // 3 consecutive aggressive/calm cycles

/* ===================== WINDOW POSITION (localStorage) ===================== */
function saveWindowPosition(windowEl, windowId) {
  if (!windowEl) return;
  const pos = {
    left: windowEl.style.left || `${windowEl.offsetLeft}px`,
    top: windowEl.style.top || `${windowEl.offsetTop}px`
  };
  localStorage.setItem(`windowPosition_${windowId}`, JSON.stringify(pos));
}

function restoreWindowPosition(windowEl, windowId) {
  if (!windowEl) return;
  const pos = JSON.parse(localStorage.getItem(`windowPosition_${windowId}`));
  if (!pos) return;
  windowEl.style.left = pos.left;
  windowEl.style.top = pos.top;
}

/* ===================== CLOCK ===================== */
function updateClock() {
  const clockEl = document.querySelector(".clock");
  if (!clockEl) return;

  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

/* ===================== DEBUG LOGGER ===================== */
function logDebug(debugBox, message) {
  if (!debugBox) return;
  const time = new Date().toLocaleTimeString();
  const line = document.createElement("div");
  line.textContent = `[${time}] ${message}`;
  debugBox.prepend(line);
  if (debugBox.children.length > 20) {
    debugBox.removeChild(debugBox.lastChild);
  }
}

/* ===================== MODE LOGIC ===================== */
function getIntensityScore() {
  return (clickCount * 2) + (keyCount * 1) + (focusCount * 3);
}

function calculateMode(score) {
  if (score < 20) return "Calm";
  if (score < 60) return "Balanced";
  return "Aggressive";
}

/* ===================== THEME SYSTEM ===================== */
function applyTheme(mode) {
  document.body.className = `theme-${mode.toLowerCase()}`;
  currentMode = mode;
}

/* ===================== BALANCE BAR UPDATE ===================== */
function updateBalanceBar(mode, score) {
  const balanceFill = $("balanceFill");
  const balanceModeText = $("balanceModeText");
  
  if (!balanceFill || !balanceModeText) return;

  let height = 50; // Default balanced
  let text = "Balanced";

  if (mode === "Calm") {
    height = 30;
    text = "Calm";
  } else if (mode === "Aggressive") {
    height = 80;
    text = "Aggressive";
  }

  balanceFill.style.height = `${height}%`;
  balanceModeText.textContent = text;
}

/* ===================== NOTIFICATION SYSTEM ===================== */
function showNotification(message, type = "warning") {
  // Remove existing notification
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideDown 0.3s ease reverse";
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

function checkImbalance(mode) {
  modeHistory.push(mode);
  if (modeHistory.length > 5) modeHistory.shift();

  // Check for prolonged imbalance
  const recentModes = modeHistory.slice(-IMBALANCE_THRESHOLD);
  const allSame = recentModes.every(m => m === mode) && recentModes.length === IMBALANCE_THRESHOLD;
  
  if (allSame && (mode === "Aggressive" || mode === "Calm")) {
    imbalanceCounter++;
    if (imbalanceCounter >= IMBALANCE_THRESHOLD) {
      const message = mode === "Aggressive" 
        ? "⚠️ Uzun süredir agresif moddasınız. Biraz ara vermeyi düşünün."
        : "ℹ️ Uzun süredir sakin moddasınız. Aktivite seviyenizi artırmayı düşünün.";
      showNotification(message, mode === "Aggressive" ? "warning" : "info");
      imbalanceCounter = 0; // Reset after notification
    }
  } else {
    imbalanceCounter = 0;
  }
}

/* ===================== AI REPORT GENERATION ===================== */
async function generateAIReportData() {
  const records = await getRecentRecords(20);
  if (!records || records.length < 5) {
    return null; // Not enough data
  }

  // Use AI config module for report generation
  return await generateAIReport(records);
}

async function renderAIReports(reportPanel) {
  if (!reportPanel) return;

  const report = await generateAIReportData();
  
  if (!report) {
    if (reportPanel.children.length === 0) {
      reportPanel.innerHTML = `<p class="empty-report">Henüz rapor oluşturulmadı. Analiz başladıktan sonra raporlar burada görünecek.</p>`;
    }
    return;
  }

  // Remove empty message
  const emptyMsg = reportPanel.querySelector(".empty-report");
  if (emptyMsg) emptyMsg.remove();

  const reportItem = document.createElement("div");
  reportItem.className = "ai-report-item";
  
  const lines = report.content.split('\n');
  let html = `<h5>${lines[0]}</h5>`;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      html += `<p>${lines[i]}</p>`;
    }
  }

  reportItem.innerHTML = html;
  reportPanel.prepend(reportItem);

  // Keep only last 3 reports
  while (reportPanel.children.length > 3) {
    reportPanel.removeChild(reportPanel.lastChild);
  }
}

/* ===================== DATA MODEL ===================== */
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
async function renderHistoryPanel(historyPanel) {
  if (!historyPanel) return;

  const records = await getRecentRecords(10);
  historyPanel.innerHTML = "";

  if (!records || records.length === 0) {
    historyPanel.innerHTML = `<p class="empty-history">Henüz kayıt yok.</p>`;
    return;
  }

  records.forEach((rec) => {
    const item = document.createElement("div");
    item.className = "history-item";

    const modeColor = 
      rec.mode === "Calm" ? "green" :
      rec.mode === "Balanced" ? "orange" : "red";

    item.innerHTML = `
      <div><b>${new Date(rec.timestamp).toLocaleTimeString()}</b></div>
      <div>
        Mode: <span class="mode" style="color: ${modeColor}">${rec.mode}</span> |
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
async function runAnalysisCycle(ui) {
  const { modeText, historyPanel, debugBox, clickCountEl, keyCountEl, focusCountEl, reportPanel } = ui;

  const score = getIntensityScore();
  const mode = calculateMode(score);

  // Update theme
  applyTheme(mode);

  // Update balance bar
  updateBalanceBar(mode, score);

  // UI update
  if (modeText) {
    modeText.textContent = mode;
    modeText.style.color =
      mode === "Calm" ? "green" :
      mode === "Balanced" ? "orange" : "red";
  }

  // Check for imbalance
  checkImbalance(mode);

  // Save record to SQLite
  const record = buildInteractionRecord(score, mode);
  await insertRecord(record);

  // Refresh history
  await renderHistoryPanel(historyPanel);

  // Debug log
  logDebug(
    debugBox,
    `Cycle completed | score=${score} | mode=${mode} (click=${clickCount}, key=${keyCount}, focus=${focusCount})`
  );

  // Reset counters
  clickCount = 0;
  keyCount = 0;
  focusCount = 0;

  if (clickCountEl) clickCountEl.textContent = "0";
  if (keyCountEl) keyCountEl.textContent = "0";
  if (focusCountEl) focusCountEl.textContent = "0";
}

/* ===================== API MODE MANAGEMENT ===================== */
function updateAPIMode(mode, ui) {
  updateAIConfig({ mode });
  
  const config = getAIConfig();
  let statusText = '';
  let statusColor = '#666';

  if (mode === 'simulated') {
    statusText = 'Simulated mod aktif (API anahtarı gerektirmez)';
    statusColor = '#4caf50';
  } else if (mode === 'openai') {
    if (config.openaiApiKey) {
      statusText = 'OpenAI API aktif ✓';
      statusColor = '#4caf50';
    } else {
      statusText = 'OpenAI API anahtarı bulunamadı - Simulated moda düşülecek';
      statusColor = '#ff9800';
    }
  } else if (mode === 'huggingface') {
    if (config.huggingfaceApiKey) {
      statusText = 'HuggingFace API aktif ✓';
      statusColor = '#4caf50';
    } else {
      statusText = 'HuggingFace API anahtarı bulunamadı - Simulated moda düşülecek';
      statusColor = '#ff9800';
    }
  }

  if (ui.apiStatusText) {
    ui.apiStatusText.textContent = statusText;
    ui.apiStatusText.style.color = statusColor;
  }

  if (ui.debugBox) {
    logDebug(ui.debugBox, `API modu değiştirildi: ${mode}`);
  }
}

/* ===================== WINDOW MANAGEMENT ===================== */
function bindWindow(iconId, windowId) {
  const icon = $(iconId);
  const win = $(windowId);
  if (!icon || !win) return;

  const titleBar = win.querySelector(".title-bar");
  const closeBtn = win.querySelector(".close-btn") || win.querySelector("#closeBtn");

  // Open window on icon double-click
  icon.addEventListener("dblclick", () => {
    win.classList.remove("hidden");
    restoreWindowPosition(win, windowId);
    bringToFront(win);
    focusCount++;
  });

  // Close window
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      saveWindowPosition(win, windowId);
      win.classList.add("hidden");
    });
  }

  // Make window draggable
  if (titleBar) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    titleBar.addEventListener("mousedown", (e) => {
      e.preventDefault();
      isDragging = true;
      offsetX = e.clientX - win.offsetLeft;
      offsetY = e.clientY - win.offsetTop;
      bringToFront(win);
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      win.style.left = `${e.clientX - offsetX}px`;
      win.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        saveWindowPosition(win, windowId);
        isDragging = false;
      }
    });
  }

  // Window focus handling
  win.addEventListener("mousedown", () => {
    bringToFront(win);
    win.classList.add("active");
    win.classList.remove("inactive");
  });
}

function bringToFront(windowEl) {
  // Remove active class from all windows
  document.querySelectorAll(".window").forEach(w => {
    w.classList.remove("active");
    w.classList.add("inactive");
  });
  // Bring this window to front
  windowEl.classList.add("active");
  windowEl.classList.remove("inactive");
  windowEl.style.zIndex = "1000";
  
  // Lower other windows
  document.querySelectorAll(".window").forEach(w => {
    if (w !== windowEl) {
      w.style.zIndex = "100";
    }
  });
}

function initAllWindows() {
  bindWindow("desktopIcon", "systemWindow");
  bindWindow("icon-calculator", "calculatorWindow");
  bindWindow("icon-google", "googleWindow");

  // Calculator functionality
  const display = $("calcDisplay");
  if (display) {
    document.querySelectorAll(".calc-grid button").forEach(btn => {
      btn.addEventListener("click", () => {
        const v = btn.textContent;
        if (v === "C") {
          display.value = "";
        } else if (v === "=") {
          try {
            display.value = eval(display.value) || "";
          } catch (e) {
            display.value = "Error";
          }
        } else {
          display.value += v;
        }
      });
    });
  }

  // Google search (simulated)
  const googleSearch = $("googleSearch");
  if (googleSearch) {
    googleSearch.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        showNotification(`"${googleSearch.value}" için arama yapılıyor... (Simüle edildi)`, "info");
      }
    });
  }
}

/* ===================== INIT WINDOW UI (LEGACY - for system window) ===================== */
function initWindowUI(ui) {
  const { windowEl, titleBar, closeBtn, desktopIcon, debugBox } = ui;

  if (!windowEl || !closeBtn || !desktopIcon || !titleBar) {
    logDebug(debugBox, "UI elements missing. Check ids: desktopIcon, systemWindow, closeBtn, title-bar.");
    return;
  }

  restoreWindowPosition(windowEl, "systemWindow");

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    saveWindowPosition(windowEl, "systemWindow");
    windowEl.classList.add("hidden");
    logDebug(debugBox, "Window closed");
  });

  desktopIcon.addEventListener("dblclick", () => {
    windowEl.classList.remove("hidden");
    restoreWindowPosition(windowEl, "systemWindow");
    desktopIcon.classList.toggle("selected");
    bringToFront(windowEl);
    logDebug(debugBox, "Window opened");
  });
}

/* ===================== MAIN INIT ===================== */
document.addEventListener("DOMContentLoaded", async () => {
  // DOM refs
  const ui = {
    modeText: $("modeText"),
    clickCountEl: $("clickCount"),
    keyCountEl: $("keyCount"),
    focusCountEl: $("focusCount"),
    debugBox: $("debugBox"),
    historyPanel: $("historyPanel"),
    reportPanel: $("aiReportPanel"),

    startBtn: $("startBtn"),
    resetBtn: $("resetBtn"),
    generateReportBtn: $("generateReportBtn"),
    apiModeSelect: $("apiModeSelect"),
    apiStatusText: $("apiStatusText"),

    desktopIcon: $("desktopIcon"),
    closeBtn: $("closeBtn"),

    windowEl: $("systemWindow"),
    titleBar: document.querySelector("#systemWindow .title-bar"),
  };

  // Initialize theme
  applyTheme("Balanced");
  updateBalanceBar("Balanced", 0);

  // Clock
  updateClock();
  setInterval(updateClock, 1000);

  // Window UI
  initWindowUI(ui);
  initAllWindows();

  // Interaction tracking
  document.addEventListener("click", (e) => {
    // Don't count clicks on window controls
    if (e.target.closest(".title-bar button") || e.target.closest(".close-btn")) {
      return;
    }
    clickCount++;
    if (ui.clickCountEl) ui.clickCountEl.textContent = String(clickCount);
  });

  document.addEventListener("keydown", (e) => {
    // Don't count special keys
    if (e.key === "Tab" || e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") {
      return;
    }
    keyCount++;
    if (ui.keyCountEl) ui.keyCountEl.textContent = String(keyCount);
    logDebug(ui.debugBox, `Key pressed: ${e.key}`);
  });

  // Window focus tracking (track when user switches between windows)
  let lastActiveWindow = null;
  document.addEventListener("mousedown", (e) => {
    const clickedWindow = e.target.closest(".window");
    if (clickedWindow && clickedWindow !== lastActiveWindow) {
      focusCount++;
      if (ui.focusCountEl) ui.focusCountEl.textContent = String(focusCount);
      lastActiveWindow = clickedWindow;
      logDebug(ui.debugBox, "Window focus changed");
    }
  });

  // Controls
  if (ui.startBtn) {
    ui.startBtn.addEventListener("click", () => {
      if (analysisTimer) {
        logDebug(ui.debugBox, "Analysis already running.");
        return;
      }
      logDebug(ui.debugBox, "Analysis started (30s window).");
      analysisTimer = setInterval(() => runAnalysisCycle(ui), WINDOW_MS);
      
      // Start AI report generation timer (periodic updates)
      if (!reportTimer) {
        reportTimer = setInterval(() => renderAIReports(ui.reportPanel, ui.debugBox), REPORT_INTERVAL);
        logDebug(ui.debugBox, "AI report timer started (periodic updates every 5 minutes)");
      }
    });
  }

  // Manual report generation button
  if (ui.generateReportBtn) {
    ui.generateReportBtn.addEventListener("click", async () => {
      logDebug(ui.debugBox, "Manual report generation requested");
      await renderAIReports(ui.reportPanel, ui.debugBox);
    });
  }

  // API Mode Selection
  if (ui.apiModeSelect) {
    // Load saved mode from localStorage
    const savedMode = localStorage.getItem('aiApiMode') || 'simulated';
    ui.apiModeSelect.value = savedMode;
    updateAPIMode(savedMode, ui);

    ui.apiModeSelect.addEventListener("change", (e) => {
      const selectedMode = e.target.value;
      localStorage.setItem('aiApiMode', selectedMode);
      updateAPIMode(selectedMode, ui);
    });
  }

  if (ui.resetBtn) {
    ui.resetBtn.addEventListener("click", async () => {
      clickCount = 0;
      keyCount = 0;
      focusCount = 0;
      imbalanceCounter = 0;
      modeHistory = [];

      if (ui.clickCountEl) ui.clickCountEl.textContent = "0";
      if (ui.keyCountEl) ui.keyCountEl.textContent = "0";
      if (ui.focusCountEl) ui.focusCountEl.textContent = "0";

      if (ui.modeText) {
        ui.modeText.textContent = "Balanced";
        ui.modeText.style.color = "black";
      }

      applyTheme("Balanced");
      updateBalanceBar("Balanced", 0);

      if (ui.debugBox) ui.debugBox.innerHTML = "";

      if (analysisTimer) {
        clearInterval(analysisTimer);
        analysisTimer = null;
      }

      if (reportTimer) {
        clearInterval(reportTimer);
        reportTimer = null;
      }

      await clearRecords();
      await renderHistoryPanel(ui.historyPanel);
      if (ui.reportPanel) {
        ui.reportPanel.innerHTML = `<p class="empty-report">Henüz rapor oluşturulmadı. Analiz başladıktan sonra raporlar burada görünecek.</p>`;
      }

      logDebug(ui.debugBox, "SQLite records cleared and analysis reset");
    });
  }

  // SQLite init + initial render
  await initDb();
  await renderHistoryPanel(ui.historyPanel);

  // Initial log
  logDebug(ui.debugBox, "PersonaBalance initialized - Complete system ready");
});
