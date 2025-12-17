document.addEventListener('DOMContentLoaded', () => {
    const logArea = document.getElementById('log-area');

    // --- YARDIMCI FONKSİYONLAR ---
    function logEvent(message) {
        if (!logArea) return;
        const time = new Date().toLocaleTimeString();
        logArea.innerHTML += `> [${time}] ${message}<br>`;
        logArea.scrollTop = logArea.scrollHeight;
    }

    function bringToFront(windowElement) {
        // Diğer pencereleri arkaya at
        document.querySelectorAll('.window').forEach(w => w.style.zIndex = '10');
        // Seçileni öne çek
        windowElement.style.zIndex = '20';
    }

    // Başlangıç Logu
    logEvent("Sistem Başlatıldı. Tracking Modülü Aktif...");

    // --- GLOBAL TRACKING (Week 2) ---
    
    // Tıklamaları dinle
    document.addEventListener('click', (e) => {
        let target = e.target;
        
        // Pencerelere tıklayınca öne getirme mantığı
        const parentWindow = target.closest('.window');
        if (parentWindow) {
            bringToFront(parentWindow);
        }

        // Loglama
        let info = target.tagName;
        if(target.className) info += `.${target.className.split(' ')[0]}`;
        logEvent(`Tıklandı: <span style="color:yellow">${info}</span>`);
    });

    // Klavyeyi dinle
    document.addEventListener('keydown', (e) => {
        logEvent(`Klavye Basıldı: <span style="color:cyan">[${e.key}]</span>`);
    });

    // --- PENCERE KONTROLLERİ (Kapat/Küçült) ---
    const closeBtns = document.querySelectorAll('.control-btn.close');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const win = e.target.closest('.window');
            if (win) {
                logEvent(`Pencere Kapatıldı: ${win.id}`);
                win.style.display = 'none';
            }
        });
    });

    // --- RAPOR PENCERESİ MANTIĞI (Week 3) ---
    const reportIcon = document.getElementById('reportIcon');
    const reportWindow = document.getElementById('reportWindow');

    if (reportIcon && reportWindow) {
        // İkona çift tıklayınca aç
        reportIcon.addEventListener('dblclick', () => {
            reportWindow.style.display = 'flex';
            bringToFront(reportWindow);
            logEvent('Sistem: AI Rapor Penceresi Açıldı.');
        });
    }
});