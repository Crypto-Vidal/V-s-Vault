// ==========================================
// VIDEO PLAYER MANAGEMENT SYSTEM
// ==========================================

// Video Storage Manager
class VideoStorage {
    constructor() {
        this.storageKey = 'dynasty_labz_videos';
    }

    // Get all videos
    getVideos() {
        try {
            const videos = localStorage.getItem(this.storageKey);
            return videos ? JSON.parse(videos) : [];
        } catch (error) {
            console.error('Error loading videos:', error);
            return [];
        }
    }

    // Save videos
    saveVideos(videos) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(videos));
            return true;
        } catch (error) {
            console.error('Error saving videos:', error);
            return false;
        }
    }

    // Add new video
    addVideo(videoData) {
        const videos = this.getVideos();
        const newVideo = {
            id: this.generateId(),
            ...videoData,
            createdAt: new Date().toISOString(),
            views: 0
        };
        videos.unshift(newVideo);
        this.saveVideos(videos);
        return newVideo;
    }

    // Update video
    updateVideo(id, updates) {
        const videos = this.getVideos();
        const index = videos.findIndex(v => v.id === id);
        if (index !== -1) {
            videos[index] = { ...videos[index], ...updates };
            this.saveVideos(videos);
            return videos[index];
        }
        return null;
    }

    // Delete video
    deleteVideo(id) {
        const videos = this.getVideos();
        const filtered = videos.filter(v => v.id !== id);
        this.saveVideos(filtered);
        return filtered.length < videos.length;
    }

    // Get video by ID
    getVideoById(id) {
        const videos = this.getVideos();
        return videos.find(v => v.id === id);
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Export videos as JSON
    exportVideos() {
        const videos = this.getVideos();
        return JSON.stringify(videos, null, 2);
    }

    // Import videos from JSON
    importVideos(jsonData) {
        try {
            const videos = JSON.parse(jsonData);
            if (Array.isArray(videos)) {
                this.saveVideos(videos);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing videos:', error);
            return false;
        }
    }
}

// Video Player Manager
class VideoPlayer {
    constructor() {
        this.storage = new VideoStorage();
        this.currentFilter = 'all';
        this.modal = null;
        this.init();
    }

    init() {
        if (document.getElementById('videoGallery')) {
            this.loadGallery();
            this.initFilterButtons();
            this.initModal();
        }
    }

    // Load video gallery
    loadGallery() {
        const gallery = document.getElementById('videoGallery');
        if (!gallery) return;

        const videos = this.storage.getVideos();
        const filteredVideos = this.filterVideos(videos, this.currentFilter);

        if (filteredVideos.length === 0) {
            gallery.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎬</div>
                    <h3>No Videos ${this.currentFilter !== 'all' ? 'in this category' : 'Yet'}</h3>
                    <p>${this.currentFilter !== 'all' ? 'Try selecting a different category.' : 'Videos will appear here once they are added through the admin dashboard.'}</p>
                    <a href="admin.html" class="btn btn-primary">
                        <span>Go to Admin Dashboard</span>
                        <div class="btn-glow"></div>
                    </a>
                </div>
            `;
            return;
        }

        gallery.innerHTML = filteredVideos.map(video => this.createVideoCard(video)).join('');

        // Add click handlers
        gallery.querySelectorAll('.video-card').forEach(card => {
            card.addEventListener('click', () => {
                const videoId = card.dataset.videoId;
                this.openVideo(videoId);
            });
        });
    }

    // Filter videos by category
    filterVideos(videos, category) {
        if (category === 'all') return videos;
        return videos.filter(v => v.category === category);
    }

    // Create video card HTML
    createVideoCard(video) {
        const thumbnail = this.getVideoThumbnail(video);
        const formattedDate = this.formatDate(video.createdAt);

        return `
            <div class="video-card" data-video-id="${video.id}">
                <div class="video-card-thumbnail">
                    <img src="${thumbnail}" alt="${video.title}" onerror="this.src='https://via.placeholder.com/400x225/0a1628/00F0FF?text=Video'">
                    <div class="video-card-play-btn">▶</div>
                </div>
                <div class="video-card-content">
                    <h3 class="video-card-title">${this.escapeHtml(video.title)}</h3>
                    <p class="video-card-description">${this.escapeHtml(video.description || 'No description available')}</p>
                    <div class="video-card-meta">
                        <span class="video-category-badge">${video.category}</span>
                        <span class="video-date">${formattedDate}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Get video thumbnail
    getVideoThumbnail(video) {
        if (video.thumbnail) {
            return video.thumbnail;
        }

        // Auto-generate thumbnail for YouTube videos
        if (video.source === 'youtube') {
            const videoId = this.extractYouTubeId(video.url);
            if (videoId) {
                return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            }
        }

        // Auto-generate thumbnail for Vimeo videos
        if (video.source === 'vimeo') {
            // Vimeo thumbnails require API call, use placeholder for now
            return 'https://via.placeholder.com/400x225/0a1628/00F0FF?text=Vimeo+Video';
        }

        return 'https://via.placeholder.com/400x225/0a1628/00F0FF?text=Video';
    }

    // Initialize filter buttons
    initFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update filter and reload gallery
                this.currentFilter = btn.dataset.category;
                this.loadGallery();
            });
        });
    }

    // Initialize modal
    initModal() {
        this.modal = document.getElementById('videoModal');
        if (!this.modal) return;

        // Close button
        const closeBtn = this.modal.querySelector('.video-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Close on overlay click
        const overlay = this.modal.querySelector('.video-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.closeModal());
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    // Open video in modal
    openVideo(videoId) {
        const video = this.storage.getVideoById(videoId);
        if (!video || !this.modal) return;

        // Update modal content
        const titleEl = document.getElementById('modalVideoTitle');
        const descEl = document.getElementById('modalVideoDescription');
        const categoryEl = document.getElementById('modalVideoCategory');
        const dateEl = document.getElementById('modalVideoDate');
        const playerEl = document.getElementById('modalVideoPlayer');

        if (titleEl) titleEl.textContent = video.title;
        if (descEl) descEl.textContent = video.description || 'No description available';
        if (categoryEl) categoryEl.textContent = video.category;
        if (dateEl) dateEl.textContent = this.formatDate(video.createdAt);

        // Load video player
        if (playerEl) {
            playerEl.innerHTML = this.createVideoEmbed(video);
        }

        // Show modal
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Increment view count
        this.storage.updateVideo(videoId, { views: (video.views || 0) + 1 });
    }

    // Close modal
    closeModal() {
        if (!this.modal) return;

        this.modal.classList.remove('active');
        document.body.style.overflow = '';

        // Stop video playback
        const playerEl = document.getElementById('modalVideoPlayer');
        if (playerEl) {
            playerEl.innerHTML = '';
        }
    }

    // Create video embed based on source
    createVideoEmbed(video) {
        switch (video.source) {
            case 'youtube':
                return this.createYouTubeEmbed(video.url);
            case 'vimeo':
                return this.createVimeoEmbed(video.url);
            case 'direct':
                return this.createDirectVideoEmbed(video.url);
            default:
                return '<p style="color: #fff; text-align: center; padding: 2rem;">Unsupported video source</p>';
        }
    }

    // Create YouTube embed
    createYouTubeEmbed(url) {
        const videoId = this.extractYouTubeId(url);
        if (!videoId) {
            return '<p style="color: #fff; text-align: center; padding: 2rem;">Invalid YouTube URL</p>';
        }

        return `
            <iframe
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
            ></iframe>
        `;
    }

    // Create Vimeo embed
    createVimeoEmbed(url) {
        const videoId = this.extractVimeoId(url);
        if (!videoId) {
            return '<p style="color: #fff; text-align: center; padding: 2rem;">Invalid Vimeo URL</p>';
        }

        return `
            <iframe
                src="https://player.vimeo.com/video/${videoId}?autoplay=1"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowfullscreen
            ></iframe>
        `;
    }

    // Create direct video embed
    createDirectVideoEmbed(url) {
        return `
            <video controls autoplay style="width: 100%; border-radius: 8px;">
                <source src="${url}" type="video/mp4">
                <source src="${url}" type="video/webm">
                Your browser does not support the video tag.
            </video>
        `;
    }

    // Extract YouTube video ID from URL
    extractYouTubeId(url) {
        // Handle various YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
            /^([a-zA-Z0-9_-]{11})$/  // Direct video ID
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }

        return null;
    }

    // Extract Vimeo video ID from URL
    extractVimeoId(url) {
        const pattern = /vimeo\.com\/(\d+)/;
        const match = url.match(pattern);
        return match ? match[1] : null;
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize video player on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new VideoPlayer();
    });
} else {
    new VideoPlayer();
}
