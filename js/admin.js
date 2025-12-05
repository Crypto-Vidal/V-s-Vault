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
        this.initSearch();
        this.initAIAssistant();
        this.initKeyboardShortcuts();
    }

    // ==========================================
    // SEARCH FUNCTIONALITY
    // ==========================================

    initSearch() {
        const searchTrigger = document.getElementById('searchTrigger');
        const searchModal = document.getElementById('searchModal');
        const searchInput = document.getElementById('searchInput');
        const closeSearch = document.getElementById('closeSearch');
        const searchOverlay = searchModal?.querySelector('.search-modal-overlay');

        if (!searchModal) return;

        // Open search
        const openSearch = () => {
            searchModal.classList.add('active');
            setTimeout(() => searchInput?.focus(), 100);
        };

        // Close search
        const closeSearchModal = () => {
            searchModal.classList.remove('active');
            if (searchInput) searchInput.value = '';
        };

        searchTrigger?.addEventListener('click', openSearch);
        closeSearch?.addEventListener('click', closeSearchModal);
        searchOverlay?.addEventListener('click', closeSearchModal);

        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Quick action handlers
        const suggestionItems = searchModal.querySelectorAll('.suggestion-item');
        suggestionItems.forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                const filter = item.dataset.filter;

                if (action === 'add-video') {
                    closeSearchModal();
                    document.getElementById('addVideoForm')?.scrollIntoView({ behavior: 'smooth' });
                    document.getElementById('videoTitle')?.focus();
                } else if (action === 'export') {
                    closeSearchModal();
                    this.exportVideos();
                } else if (action === 'import') {
                    closeSearchModal();
                    document.getElementById('importModal').style.display = 'flex';
                } else if (filter) {
                    closeSearchModal();
                    this.filterVideosByCategory(filter);
                }
            });
        });
    }

    handleSearch(query) {
        if (!query) {
            // Show default suggestions
            return;
        }

        const videos = this.storage.getVideos();
        const results = videos.filter(video =>
            video.title.toLowerCase().includes(query.toLowerCase()) ||
            video.category.toLowerCase().includes(query.toLowerCase()) ||
            (video.description && video.description.toLowerCase().includes(query.toLowerCase()))
        );

        this.displaySearchResults(results, query);
    }

    displaySearchResults(results, query) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-suggestions">
                    <div class="suggestion-group">
                        <div class="suggestion-label">No results found for "${query}"</div>
                    </div>
                </div>
            `;
            return;
        }

        searchResults.innerHTML = `
            <div class="search-suggestions">
                <div class="suggestion-group">
                    <div class="suggestion-label">Videos (${results.length})</div>
                    ${results.map(video => `
                        <button class="suggestion-item" data-video-id="${video.id}">
                            📹 ${this.escapeHtml(video.title)}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Add click handlers to results
        searchResults.querySelectorAll('.suggestion-item[data-video-id]').forEach(item => {
            item.addEventListener('click', () => {
                const videoId = item.dataset.videoId;
                this.editVideo(videoId);
                document.getElementById('searchModal').classList.remove('active');
            });
        });
    }

    filterVideosByCategory(category) {
        // Filter and display videos by category
        const videos = this.storage.getVideos();
        const filtered = videos.filter(v => v.category === category);

        // Scroll to video list
        document.getElementById('videoList')?.scrollIntoView({ behavior: 'smooth' });

        // You could add visual filtering here
        this.showNotification(`Showing ${filtered.length} ${category} videos`, 'info');
    }

    // ==========================================
    // AI ASSISTANT FUNCTIONALITY
    // ==========================================

    initAIAssistant() {
        const aiBtn = document.getElementById('aiAssistantBtn');
        const aiAssistant = document.getElementById('aiAssistant');
        const closeAI = document.getElementById('closeAI');
        const aiOverlay = aiAssistant?.querySelector('.ai-assistant-overlay');
        const aiSendBtn = document.getElementById('aiSendBtn');
        const aiCopyBtn = document.getElementById('aiCopyBtn');
        const aiInput = document.getElementById('aiInput');

        if (!aiAssistant) return;

        // Open AI assistant
        const openAI = () => {
            aiAssistant.classList.add('active');
            setTimeout(() => aiInput?.focus(), 300);
        };

        // Close AI assistant
        const closeAIPanel = () => {
            aiAssistant.classList.remove('active');
        };

        aiBtn?.addEventListener('click', openAI);
        closeAI?.addEventListener('click', closeAIPanel);
        aiOverlay?.addEventListener('click', closeAIPanel);

        // Quick action buttons
        const quickActions = aiAssistant.querySelectorAll('.quick-action-btn');
        quickActions.forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.dataset.prompt;
                this.handleQuickAction(prompt);
            });
        });

        // Template buttons
        const templates = aiAssistant.querySelectorAll('.template-item');
        templates.forEach(btn => {
            btn.addEventListener('click', () => {
                const template = btn.textContent;
                if (aiInput) {
                    aiInput.value = template;
                    aiInput.focus();
                }
            });
        });

        // Send button
        aiSendBtn?.addEventListener('click', () => {
            this.handleAIRequest();
        });

        // Copy button
        aiCopyBtn?.addEventListener('click', () => {
            this.copyAIRequest();
        });

        // Enter to send (Ctrl+Enter for new line)
        aiInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
                e.preventDefault();
                this.handleAIRequest();
            }
        });
    }

    handleQuickAction(action) {
        const prompts = {
            'redesign-hero': 'I want to redesign the hero section of my website. Make it more modern and eye-catching with better animations and layout.',
            'add-feature': 'I need to add a new feature to my website. ',
            'fix-bug': 'There\'s a bug in my website that needs fixing: ',
            'optimize': 'I want to optimize the performance of my website. Focus on loading speed and animations.',
            'styling': 'I want to update the styling of my website. ',
            'content': 'I need to edit the content on my website. '
        };

        const aiInput = document.getElementById('aiInput');
        if (aiInput && prompts[action]) {
            aiInput.value = prompts[action];
            aiInput.focus();
            aiInput.setSelectionRange(aiInput.value.length, aiInput.value.length);
        }
    }

    handleAIRequest() {
        const aiInput = document.getElementById('aiInput');
        const aiMessages = document.getElementById('aiMessages');

        if (!aiInput || !aiInput.value.trim()) {
            this.showNotification('Please enter a request for Claude Code', 'error');
            return;
        }

        const request = aiInput.value.trim();

        // Add message to chat
        const messageEl = document.createElement('div');
        messageEl.className = 'ai-message';
        messageEl.innerHTML = `
            <strong>Your Request:</strong><br>
            ${this.escapeHtml(request)}<br><br>
            <strong>Next Steps:</strong><br>
            1. Copy this request using the 📋 button<br>
            2. Open Claude Code in your terminal/editor<br>
            3. Paste and send this request to Claude Code<br>
            4. Claude will make the changes to your website!
        `;

        aiMessages?.appendChild(messageEl);
        aiMessages?.scrollTo({ top: aiMessages.scrollHeight, behavior: 'smooth' });

        // Copy to clipboard automatically
        this.copyToClipboard(request);
        this.showNotification('Request copied to clipboard! Paste it in Claude Code.', 'success');
    }

    copyAIRequest() {
        const aiInput = document.getElementById('aiInput');

        if (!aiInput || !aiInput.value.trim()) {
            this.showNotification('Please enter a request first', 'error');
            return;
        }

        this.copyToClipboard(aiInput.value.trim());
        this.showNotification('Request copied to clipboard!', 'success');
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    }

    // ==========================================
    // KEYBOARD SHORTCUTS
    // ==========================================

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K or Cmd+K - Open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchModal = document.getElementById('searchModal');
                if (searchModal && !searchModal.classList.contains('active')) {
                    searchModal.classList.add('active');
                    setTimeout(() => document.getElementById('searchInput')?.focus(), 100);
                }
            }

            // Escape - Close modals
            if (e.key === 'Escape') {
                document.getElementById('searchModal')?.classList.remove('active');
                document.getElementById('aiAssistant')?.classList.remove('active');
            }
        });
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
