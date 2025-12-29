// src/logic/triggerService.js
// Görev: Kullanıcı stres modunu takip edip 30 dk sonra rapor tetiklemek.

const TRIGGER_DURATION_MS = 30 * 60 * 1000; // 30 Dakika
let stressTimer = null;

export function monitorUserState(state) {
    if (state === 'AGGRESSIVE') {
        if (!stressTimer) {
            console.log("[Logic] Agresif mod başladı. Sayaç kuruluyor...");
            stressTimer = setTimeout(() => {
                console.log("[Logic] 30 Dakika doldu! AI Raporu isteniyor.");
                // fetchAIReport();
            }, TRIGGER_DURATION_MS);
        }
    } else {
        if (stressTimer) {
            console.log("[Logic] Kullanıcı sakinleşti. Sayaç iptal.");
            clearTimeout(stressTimer);
            stressTimer = null;
        }
    }
}
