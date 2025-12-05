// Dashboard Module

class Dashboard {
    constructor() {
        this.init();
    }

    async init() {
        this.loadStats();
        this.loadActivities();
        this.startClock();
    }

    // Load dashboard stats
    async loadStats() {
        try {
            // Load media count
            const mediaResponse = await fetch('../content/media.json');
            const mediaData = await mediaResponse.json();

            let mediaCount = 0;
            if (mediaData.images && mediaData.images.portfolio) {
                mediaCount += mediaData.images.portfolio.length;
            }
            if (mediaData.videos) {
                mediaCount += mediaData.videos.length;
            }
            if (mediaData.documents) {
                mediaCount += mediaData.documents.length;
            }

            document.getElementById('totalImages').textContent = mediaCount;
            document.getElementById('mediaCount').textContent = `${mediaCount} items`;

            // Load last update time
            const lastUpdate = localStorage.getItem('last_content_update');
            if (lastUpdate) {
                const date = new Date(lastUpdate);
                document.getElementById('lastUpdate').textContent = this.formatDate(date);
            }

        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    // Load recent activities
    loadActivities() {
        const activities = JSON.parse(localStorage.getItem('cms_activities') || '[]');
        const activityList = document.getElementById('activityList');

        if (activities.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">📝</div>
                    <div class="activity-content">
                        <div class="activity-title">System Initialized</div>
                        <div class="activity-time">Just now</div>
                    </div>
                </div>
            `;
            return;
        }

        activityList.innerHTML = activities.slice(0, 10).map(activity => `
            <div class="activity-item">
                <div class="activity-icon">📝</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.action}</div>
                    <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    // Format date
    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;

        return date.toLocaleDateString();
    }

    // Format time
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

        return date.toLocaleDateString();
    }

    // Start clock for last update
    startClock() {
        setInterval(() => {
            this.loadStats();
            this.loadActivities();
        }, 60000); // Update every minute
    }

    // Add welcome message
    showWelcome() {
        const user = authManager.getCurrentUser();
        if (user) {
            console.log(`Welcome back, ${user}!`);
        }
    }
}

// Initialize dashboard
if (window.location.pathname.includes('dashboard.html')) {
    const dashboard = new Dashboard();
    dashboard.showWelcome();
}
