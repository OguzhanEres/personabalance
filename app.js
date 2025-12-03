document.addEventListener('DOMContentLoaded', () => {
    const logArea = document.getElementById('log-area');

    function logEvent(message) {
        if (!logArea) return;
        const time = new Date().toLocaleTimeString();
        logArea.innerHTML += `> [${time}] ${message}<br>`;
        logArea.scrollTop = logArea.scrollHeight;
    }

    logEvent("Sistem Başlatıldı. Tracking Aktif...");

    // Tıklamaları dinle
    document.addEventListener('click', (e) => {
        let target = e.target;
        let info = target.tagName;
        if(target.className) info += `.${target.className.split(' ')[0]}`;
        logEvent(`Tıklandı: <span style="color:yellow">${info}</span>`);
    });

    // Klavyeyi dinle
    document.addEventListener('keydown', (e) => {
        logEvent(`Klavye Basıldı: <span style="color:cyan">[${e.key}]</span>`);
    });

    // Kapatma tuşu testi
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
});