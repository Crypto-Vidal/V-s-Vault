// ==========================================
// ADMIN VIDEO MANAGEMENT
// ==========================================

class VideoAdmin {
    constructor() {
        this.storage = new VideoStorage();
        this.init();
    }

    init() {
        this.initForm();
        this.loadVideoList();
        this.initExportImport();
    }

    // Initialize add video form
    initForm() {
        const form = document.getElementById('addVideoForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddVideo(form);
        });

        // Update URL placeholder based on source
        const sourceSelect = document.getElementById('videoSource');
        const urlInput = document.getElementById('videoUrl');

        if (sourceSelect && urlInput) {
            sourceSelect.addEventListener('change', () => {
                const source = sourceSelect.value;
                switch (source) {
                    case 'youtube':
                        urlInput.placeholder = 'https://www.youtube.com/watch?v=... or Video ID';
                        break;
                    case 'vimeo':
                        urlInput.placeholder = 'https://vimeo.com/...';
                        break;
                    case 'direct':
                        urlInput.placeholder = 'https://example.com/video.mp4';
                        break;
                }
            });
        }
    }

    // Handle add video form submission
    handleAddVideo(form) {
        const formData = new FormData(form);
        const videoData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            source: formData.get('source'),
            url: formData.get('url'),
            thumbnail: formData.get('thumbnail') || ''
        };

        // Validate required fields
        if (!videoData.title || !videoData.category || !videoData.source || !videoData.url) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Validate URL based on source
        if (!this.validateVideoUrl(videoData.source, videoData.url)) {
            this.showNotification('Invalid video URL for the selected source', 'error');
            return;
        }

        // Add video
        try {
            this.storage.addVideo(videoData);
            this.showNotification('Video added successfully!', 'success');
            form.reset();
            this.loadVideoList();
        } catch (error) {
            this.showNotification('Error adding video: ' + error.message, 'error');
        }
    }

    // Validate video URL
    validateVideoUrl(source, url) {
        switch (source) {
            case 'youtube':
                // Accept full URL or video ID
                return /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)|^[a-zA-Z0-9_-]{11}$/.test(url);
            case 'vimeo':
                return /vimeo\.com\/\d+/.test(url);
            case 'direct':
                return /^https?:\/\/.+\.(mp4|webm|ogg)$/i.test(url);
            default:
                return false;
        }
    }

    // Load video list
    loadVideoList() {
        const listEl = document.getElementById('videoList');
        if (!listEl) return;

        const videos = this.storage.getVideos();

        if (videos.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📹</div>
                    <p>No videos added yet. Add your first video using the form above.</p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = videos.map(video => this.createVideoItem(video)).join('');

        // Add event listeners
        listEl.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const videoId = btn.dataset.videoId;
                this.editVideo(videoId);
            });
        });

        listEl.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const videoId = btn.dataset.videoId;
                this.deleteVideo(videoId);
            });
        });
    }

    // Create video item HTML
    createVideoItem(video) {
        const thumbnail = this.getVideoThumbnail(video);
        const formattedDate = this.formatDate(video.createdAt);

        return `
            <div class="video-item">
                <div class="video-item-thumbnail">
                    <img src="${thumbnail}" alt="${this.escapeHtml(video.title)}" onerror="this.src='https://via.placeholder.com/120x68/0a1628/00F0FF?text=Video'">
                </div>
                <div class="video-item-info">
                    <div class="video-item-title">${this.escapeHtml(video.title)}</div>
                    <div class="video-item-meta">
                        <span class="video-category-badge">${video.category}</span>
                        <span class="video-date">${formattedDate}</span>
                        <span class="video-date">${video.views || 0} views</span>
                    </div>
                </div>
                <div class="video-item-actions">
                    <button class="btn-icon btn-edit" data-video-id="${video.id}" title="Edit">
                        ✏️
                    </button>
                    <button class="btn-icon btn-danger btn-delete" data-video-id="${video.id}" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    // Edit video
    editVideo(videoId) {
        const video = this.storage.getVideoById(videoId);
        if (!video) return;

        // Populate form with video data
        document.getElementById('videoTitle').value = video.title;
        document.getElementById('videoDescription').value = video.description || '';
        document.getElementById('videoCategory').value = video.category;
        document.getElementById('videoSource').value = video.source;
        document.getElementById('videoUrl').value = video.url;
        document.getElementById('videoThumbnail').value = video.thumbnail || '';

        // Change form to edit mode
        const form = document.getElementById('addVideoForm');
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<span>Update Video</span><div class="btn-glow"></div>';

        // Update form handler
        form.onsubmit = (e) => {
            e.preventDefault();
            this.handleUpdateVideo(videoId, form);
        };

        // Scroll to form
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Handle update video
    handleUpdateVideo(videoId, form) {
        const formData = new FormData(form);
        const updates = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            source: formData.get('source'),
            url: formData.get('url'),
            thumbnail: formData.get('thumbnail') || ''
        };

        try {
            this.storage.updateVideo(videoId, updates);
            this.showNotification('Video updated successfully!', 'success');
            this.resetForm(form);
            this.loadVideoList();
        } catch (error) {
            this.showNotification('Error updating video: ' + error.message, 'error');
        }
    }

    // Reset form to add mode
    resetForm(form) {
        form.reset();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<span>Add Video</span><div class="btn-glow"></div>';

        form.onsubmit = (e) => {
            e.preventDefault();
            this.handleAddVideo(form);
        };
    }

    // Delete video
    deleteVideo(videoId) {
        const video = this.storage.getVideoById(videoId);
        if (!video) return;

        if (confirm(`Are you sure you want to delete "${video.title}"?`)) {
            try {
                this.storage.deleteVideo(videoId);
                this.showNotification('Video deleted successfully!', 'success');
                this.loadVideoList();
            } catch (error) {
                this.showNotification('Error deleting video: ' + error.message, 'error');
            }
        }
    }

    // Initialize export/import
    initExportImport() {
        const exportBtn = document.getElementById('exportVideos');
        const importBtn = document.getElementById('importVideos');
        const importModal = document.getElementById('importModal');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportVideos());
        }

        if (importBtn && importModal) {
            importBtn.addEventListener('click', () => {
                importModal.style.display = 'flex';
            });

            // Close modal
            const closeBtn = importModal.querySelector('.video-modal-close');
            const cancelBtn = document.getElementById('cancelImport');
            const overlay = importModal.querySelector('.video-modal-overlay');

            [closeBtn, cancelBtn, overlay].forEach(el => {
                if (el) {
                    el.addEventListener('click', () => {
                        importModal.style.display = 'none';
                        document.getElementById('importData').value = '';
                    });
                }
            });

            // Confirm import
            const confirmBtn = document.getElementById('confirmImport');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => this.importVideos());
            }
        }
    }

    // Export videos
    exportVideos() {
        const jsonData = this.storage.exportVideos();
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dynasty-labz-videos-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Videos exported successfully!', 'success');
    }

    // Import videos
    importVideos() {
        const importData = document.getElementById('importData').value.trim();
        if (!importData) {
            this.showNotification('Please paste JSON data', 'error');
            return;
        }

        try {
            if (this.storage.importVideos(importData)) {
                this.showNotification('Videos imported successfully!', 'success');
                document.getElementById('importModal').style.display = 'none';
                document.getElementById('importData').value = '';
                this.loadVideoList();
            } else {
                this.showNotification('Invalid JSON data', 'error');
            }
        } catch (error) {
            this.showNotification('Error importing videos: ' + error.message, 'error');
        }
    }

    // Get video thumbnail (same as VideoPlayer)
    getVideoThumbnail(video) {
        if (video.thumbnail) {
            return video.thumbnail;
        }

        if (video.source === 'youtube') {
            const videoId = this.extractYouTubeId(video.url);
            if (videoId) {
                return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            }
        }

        return 'https://via.placeholder.com/120x68/0a1628/00F0FF?text=Video';
    }

    // Extract YouTube ID (same as VideoPlayer)
    extractYouTubeId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
            /^([a-zA-Z0-9_-]{11})$/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }

        return null;
    }

    // Format date (same as VideoPlayer)
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? 'rgba(0, 255, 142, 0.15)' : 'rgba(255, 0, 0, 0.15)'};
            border: 1px solid ${type === 'success' ? 'rgba(0, 255, 142, 0.5)' : 'rgba(255, 0, 0, 0.5)'};
            border-radius: 8px;
            color: ${type === 'success' ? '#00FF8E' : '#ff3333'};
            font-family: 'Rajdhani', sans-serif;
            font-size: 1rem;
            z-index: 10000;
            box-shadow: 0 10px 30px ${type === 'success' ? 'rgba(0, 255, 142, 0.3)' : 'rgba(255, 0, 0, 0.3)'};
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize admin on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new VideoAdmin();
    });
} else {
    new VideoAdmin();
}
