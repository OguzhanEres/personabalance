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
        document.querySelectorAll('.window').forEach(w => w.style.zIndex = '10');
        windowElement.style.zIndex = '20';
    }

    // --- WEEK 4: BİLDİRİM FONKSİYONU ---
    function showNotification(title, message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        // HTML elemanını oluştur
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        toast.innerHTML = `
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        `;

        // Konteynere ekle
        container.appendChild(toast);
        logEvent(`Bildirim Gönderildi: ${title}`);

        // Ses efekti simülasyonu
        // (Buraya ilerde ses eklenebilir)

        // 5 Saniye sonra sil
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300); // Animasyon bitince sil
        }, 5000);
    }

    // Başlangıç Logu
    logEvent("Sistem Başlatıldı. Bildirim Servisi Hazır.");

    // --- GLOBAL TRACKING ---
    document.addEventListener('click', (e) => {
        let target = e.target;
        const parentWindow = target.closest('.window');
        if (parentWindow) bringToFront(parentWindow);

        let info = target.tagName;
        if(target.className) info += `.${target.className.split(' ')[0]}`;
        logEvent(`Tıklandı: <span style="color:yellow">${info}</span>`);
    });

    document.addEventListener('keydown', (e) => {
        logEvent(`Klavye Basıldı: <span style="color:cyan">[${e.key}]</span>`);
    });

    // --- PENCERE KONTROLLERİ ---
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

    // --- RAPOR PENCERESİ ---
    const reportIcon = document.getElementById('reportIcon');
    const reportWindow = document.getElementById('reportWindow');

    if (reportIcon && reportWindow) {
        reportIcon.addEventListener('dblclick', () => {
            reportWindow.style.display = 'flex';
            bringToFront(reportWindow);
            logEvent('Sistem: AI Rapor Penceresi Açıldı.');
        });
    }

    // --- ANALİZ BUTONU VE BİLDİRİM TESTİ (WEEK 4) ---
    const analizBtn = document.getElementById('analizBtn');
    if (analizBtn) {
        analizBtn.addEventListener('click', () => {
            logEvent("Analiz başlatılıyor...");
            analizBtn.innerText = "Analiz Yapılıyor...";
            
            // 2 Saniye sonra sonucu simüle et
            setTimeout(() => {
                analizBtn.innerText = "Analiz Başlat";
                // Rastgele bir bildirim fırlat
                showNotification(
                    "Denge Uyarısı!", 
                    "Kullanıcı aktivitesinde hafif artış tespit edildi. Biraz yavaşlayın.", 
                    "warning"
                );
            }, 2000);
        });
    }
});