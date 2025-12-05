// Media Library Module

class MediaLibrary {
    constructor() {
        this.media = [];
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        await this.loadMedia();
        this.setupEventListeners();
        this.renderMedia();
    }

    // Load media from JSON
    async loadMedia() {
        try {
            const response = await fetch('../content/media.json');
            const data = await response.json();

            // Convert media object to array
            this.media = [];

            // Add images
            if (data.images && Array.isArray(data.images.portfolio)) {
                this.media.push(...data.images.portfolio.map(img => ({
                    ...img,
                    type: 'image'
                })));
            }

            // Add videos
            if (data.videos && Array.isArray(data.videos)) {
                this.media.push(...data.videos.map(vid => ({
                    ...vid,
                    type: 'video'
                })));
            }

            // Add documents
            if (data.documents && Array.isArray(data.documents)) {
                this.media.push(...data.documents.map(doc => ({
                    ...doc,
                    type: 'document'
                })));
            }

            console.log('Media loaded:', this.media);
        } catch (error) {
            console.error('Error loading media:', error);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Upload button
        document.getElementById('uploadBtn').addEventListener('click', () => {
            this.toggleUploadArea(true);
        });

        // Cancel upload
        document.getElementById('cancelUpload').addEventListener('click', () => {
            this.toggleUploadArea(false);
        });

        // Browse button
        document.getElementById('browseBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        // File input change
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Drag and drop
        const dropzone = document.getElementById('uploadDropzone');

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('drag-over');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Modal close
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modalOverlay').addEventListener('click', () => {
            this.closeModal();
        });
    }

    // Toggle upload area
    toggleUploadArea(show) {
        document.getElementById('uploadArea').style.display = show ? 'block' : 'none';
    }

    // Handle file upload
    async handleFiles(files) {
        if (files.length === 0) return;

        const progressEl = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        progressEl.style.display = 'block';

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Simulate upload progress
            progressText.textContent = `Uploading ${file.name}...`;

            for (let p = 0; p <= 100; p += 10) {
                progressFill.style.width = p + '%';
                await this.sleep(50);
            }

            // Process file
            await this.processFile(file);
        }

        progressEl.style.display = 'none';
        this.toggleUploadArea(false);
        this.renderMedia();

        this.showNotification('Files uploaded successfully! Download media.json to save changes.');
    }

    // Process uploaded file
    async processFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const mediaItem = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    url: e.target.result, // Base64 data URL
                    size: this.formatFileSize(file.size),
                    uploadDate: new Date().toISOString(),
                    type: this.getMediaType(file.type)
                };

                this.media.push(mediaItem);

                // Save to localStorage
                this.saveMedia();

                resolve();
            };

            reader.readAsDataURL(file);
        });
    }

    // Get media type from MIME type
    getMediaType(mimeType) {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        return 'document';
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Sleep utility
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Set filter
    setFilter(filter) {
        this.currentFilter = filter;

        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        this.renderMedia();
    }

    // Render media grid
    renderMedia() {
        const grid = document.getElementById('mediaGrid');
        const emptyState = document.getElementById('emptyState');

        let filteredMedia = this.media;
        if (this.currentFilter !== 'all') {
            filteredMedia = this.media.filter(m => m.type === this.currentFilter || m.type + 's' === this.currentFilter);
        }

        if (filteredMedia.length === 0) {
            emptyState.style.display = 'block';
            // Remove existing media items
            grid.querySelectorAll('.media-item').forEach(item => item.remove());
            return;
        }

        emptyState.style.display = 'none';

        // Clear existing items
        grid.querySelectorAll('.media-item').forEach(item => item.remove());

        // Add media items
        filteredMedia.forEach(item => {
            const mediaEl = this.createMediaElement(item);
            grid.appendChild(mediaEl);
        });
    }

    // Create media element
    createMediaElement(item) {
        const div = document.createElement('div');
        div.className = 'media-item';
        div.onclick = () => this.showMediaModal(item);

        const thumbnail = item.type === 'image'
            ? `<img src="${item.url || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Crect fill=\'%23334\' width=\'200\' height=\'200\'/%3E%3Ctext fill=\'%2300f0ff\' font-family=\'Arial\' font-size=\'14\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\'%3ENo Image%3C/text%3E%3C/svg%3E'}" class="media-thumbnail" alt="${item.name || 'Media'}">`
            : `<div class="media-thumbnail" style="display: flex; align-items: center; justify-content: center; font-size: 3rem;">
                ${item.type === 'video' ? '🎥' : '📄'}
               </div>`;

        div.innerHTML = `
            ${thumbnail}
            <div class="media-item-info">
                <div class="media-item-name">${item.name || 'Untitled'}</div>
                <div class="media-item-type">${item.type || 'Unknown'}</div>
            </div>
        `;

        return div;
    }

    // Show media modal
    showMediaModal(item) {
        const modal = document.getElementById('mediaModal');
        const preview = document.getElementById('mediaPreview');
        const name = document.getElementById('mediaName');
        const url = document.getElementById('mediaUrl');
        const type = document.getElementById('mediaType');
        const size = document.getElementById('mediaSize');

        name.textContent = item.name || 'Untitled';
        url.value = item.url || '';
        type.textContent = item.type || 'Unknown';
        size.textContent = item.size || '-';

        // Set preview
        if (item.type === 'image') {
            preview.innerHTML = `<img src="${item.url}" alt="${item.name}" style="max-width: 100%; border-radius: 8px;">`;
        } else if (item.type === 'video') {
            preview.innerHTML = `<video src="${item.url}" controls style="max-width: 100%; border-radius: 8px;"></video>`;
        } else {
            preview.innerHTML = `<div style="padding: 2rem; text-align: center; font-size: 4rem;">📄</div>`;
        }

        modal.style.display = 'flex';

        // Copy URL button
        document.getElementById('copyUrl').onclick = () => {
            url.select();
            document.execCommand('copy');
            this.showNotification('URL copied to clipboard!');
        };

        // Delete button
        document.getElementById('deleteMedia').onclick = () => {
            if (confirm('Are you sure you want to delete this media file?')) {
                this.deleteMedia(item);
                this.closeModal();
            }
        };
    }

    // Close modal
    closeModal() {
        document.getElementById('mediaModal').style.display = 'none';
    }

    // Delete media
    deleteMedia(item) {
        this.media = this.media.filter(m => m.id !== item.id);
        this.saveMedia();
        this.renderMedia();
        this.showNotification('Media deleted successfully!');
    }

    // Save media to localStorage and trigger download
    saveMedia() {
        const mediaData = {
            images: {
                logo: { url: '', alt: 'Dynasty labz Logo', description: 'Main site logo' },
                'hero-background': { url: '', alt: 'Hero section background', description: 'Background image for hero section' },
                portfolio: this.media.filter(m => m.type === 'image')
            },
            videos: this.media.filter(m => m.type === 'video'),
            documents: this.media.filter(m => m.type === 'document')
        };

        localStorage.setItem('media-library', JSON.stringify(mediaData, null, 2));

        // Also trigger download
        this.downloadJSON(mediaData, 'media.json');
    }

    // Download JSON
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Show notification
    showNotification(message) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = 'save-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✅</span>
                <span class="notification-text">${message}</span>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize media library
if (document.getElementById('mediaGrid')) {
    const mediaLibrary = new MediaLibrary();
}
