const eventTracker = {
    clickCount: 0,
    keyPressCount: 0,
    isActive: true,
    dataBuffer: [],

    init: function() {
        console.log("Event Tracker v1.0 initialized.");
        this.trackMouse();
        this.trackKeyboard();
        this.trackFocus();
        this.startAggregationCycle();
    },

    trackMouse: function() {
        document.addEventListener('click', () => {
            this.clickCount++;
        }, { passive: true });
    },

    trackKeyboard: function() {
        document.addEventListener('keydown', (e) => {
            this.keyPressCount++;
        }, { passive: true });
    },

    trackFocus: function() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.isActive = false;
                console.log("User switched window (Focus lost)");
            } else {
                this.isActive = true;
                console.log("User returned (Focus gained)");
            }
        });
    },

    startAggregationCycle: function() {
        setInterval(() => {
            const snapshot = {
                clicks: this.clickCount,
                keys: this.keyPressCount,
                timestamp: new Date().toISOString()
            };
            
            this.dataBuffer.push(snapshot);
            console.log("30s Aggregation Complete:", snapshot);
            
            this.clickCount = 0;
            this.keyPressCount = 0;
        }, 30000); 
    }
};

export default eventTracker;
