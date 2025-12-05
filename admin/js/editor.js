// Content Editor Module

class ContentEditor {
    constructor() {
        this.content = null;
        this.hasChanges = false;
        this.init();
    }

    async init() {
        await this.loadContent();
        this.setupEventListeners();
        this.populateForms();
        this.checkURLParams();
    }

    // Load content from JSON
    async loadContent() {
        try {
            const response = await fetch('../content/site-content.json');
            this.content = await response.json();
            console.log('Content loaded:', this.content);
        } catch (error) {
            console.error('Error loading content:', error);
            this.showNotification('Error loading content', 'error');
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Tab switching
        const tabs = document.querySelectorAll('.editor-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.section);
            });
        });

        // Save button
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveContent();
        });

        // Preview button
        document.getElementById('previewBtn').addEventListener('click', () => {
            this.previewChanges();
        });

        // Track changes
        const inputs = document.querySelectorAll('.form-input, .form-textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.hasChanges = true;
            });
        });

        // Warn before leaving if there are unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.hasChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    // Switch between tabs
    switchTab(section) {
        // Update tabs
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.editor-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}Section`).classList.add('active');
    }

    // Check URL parameters for section
    checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const section = urlParams.get('section');
        if (section) {
            this.switchTab(section);
        }
    }

    // Populate forms with content
    populateForms() {
        if (!this.content) return;

        // Home Section
        if (this.content.home) {
            // Hero
            if (this.content.home.hero) {
                this.setValue('heroTitle1', this.content.home.hero.title.line1);
                this.setValue('heroTitle2', this.content.home.hero.title.line2);
                this.setValue('heroSubtitle', this.content.home.hero.subtitle);
                this.setValue('primaryCTA', this.content.home.hero.primaryCTA.text);
                this.setValue('primaryCTALink', this.content.home.hero.primaryCTA.link);
                this.setValue('secondaryCTA', this.content.home.hero.secondaryCTA.text);
                this.setValue('secondaryCTALink', this.content.home.hero.secondaryCTA.link);

                // Hero Stats
                this.populateStats(this.content.home.hero.stats);
            }

            // Services
            if (this.content.home.services) {
                this.setValue('servicesTitle', this.content.home.services.sectionTitle);
                this.populateServiceCards(this.content.home.services.cards);
            }

            // CTA
            if (this.content.home.cta) {
                this.setValue('ctaTitle', this.content.home.cta.title);
                this.setValue('ctaDescription', this.content.home.cta.description);
                this.setValue('ctaButton', this.content.home.cta.buttonText);
                this.setValue('ctaLink', this.content.home.cta.link);
            }
        }

        // Global Section
        if (this.content.header) {
            this.setValue('logoText', this.content.header.logo.text);
            this.setValue('logoAccent', this.content.header.logo.accent);
            this.populateNavLinks(this.content.header.navigation);
        }

        if (this.content.footer) {
            this.setValue('footerBrand', this.content.footer.brand.text);
            this.setValue('footerAccent', this.content.footer.brand.accent);
            this.setValue('footerTagline', this.content.footer.tagline);
            this.setValue('footerCopyright', this.content.footer.copyright);
        }
    }

    // Populate hero stats
    populateStats(stats) {
        const container = document.getElementById('heroStats');
        container.innerHTML = stats.map((stat, index) => `
            <div class="stat-editor-item">
                <div class="form-row">
                    <div class="form-group">
                        <label>Stat ${index + 1} Number</label>
                        <input type="text" class="form-input"
                            data-path="home.hero.stats.${index}.number"
                            value="${stat.number}">
                    </div>
                    <div class="form-group">
                        <label>Stat ${index + 1} Label</label>
                        <input type="text" class="form-input"
                            data-path="home.hero.stats.${index}.label"
                            value="${stat.label}">
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Populate service cards
    populateServiceCards(cards) {
        const container = document.getElementById('serviceCards');
        container.innerHTML = cards.map((card, index) => `
            <div class="card-editor-item">
                <h4>Card ${index + 1}</h4>
                <div class="form-group">
                    <label>Icon (Emoji)</label>
                    <input type="text" class="form-input"
                        data-path="home.services.cards.${index}.icon"
                        value="${card.icon}">
                </div>
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" class="form-input"
                        data-path="home.services.cards.${index}.title"
                        value="${card.title}">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea class="form-textarea" rows="3"
                        data-path="home.services.cards.${index}.description">${card.description}</textarea>
                </div>
                <div class="form-group">
                    <label>Link</label>
                    <input type="text" class="form-input"
                        data-path="home.services.cards.${index}.link"
                        value="${card.link}">
                </div>
            </div>
        `).join('');
    }

    // Populate navigation links
    populateNavLinks(links) {
        const container = document.getElementById('navLinks');
        container.innerHTML = links.map((link, index) => `
            <div class="link-editor-item">
                <div class="form-row">
                    <div class="form-group">
                        <label>Link ${index + 1} Text</label>
                        <input type="text" class="form-input"
                            data-path="header.navigation.${index}.text"
                            value="${link.text}">
                    </div>
                    <div class="form-group">
                        <label>Link ${index + 1} URL</label>
                        <input type="text" class="form-input"
                            data-path="header.navigation.${index}.link"
                            value="${link.link}">
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Helper to set value
    setValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value || '';
        }
    }

    // Get value by path
    getValueByPath(obj, path) {
        return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
    }

    // Set value by path
    setValueByPath(obj, path, value) {
        const parts = path.split('.');
        const last = parts.pop();
        const target = parts.reduce((curr, prop) => {
            if (!curr[prop]) curr[prop] = {};
            return curr[prop];
        }, obj);
        target[last] = value;
    }

    // Collect form data
    collectFormData() {
        const updatedContent = JSON.parse(JSON.stringify(this.content));

        // Collect all inputs with IDs
        const simpleFields = {
            'heroTitle1': 'home.hero.title.line1',
            'heroTitle2': 'home.hero.title.line2',
            'heroSubtitle': 'home.hero.subtitle',
            'primaryCTA': 'home.hero.primaryCTA.text',
            'primaryCTALink': 'home.hero.primaryCTA.link',
            'secondaryCTA': 'home.hero.secondaryCTA.text',
            'secondaryCTALink': 'home.hero.secondaryCTA.link',
            'servicesTitle': 'home.services.sectionTitle',
            'ctaTitle': 'home.cta.title',
            'ctaDescription': 'home.cta.description',
            'ctaButton': 'home.cta.buttonText',
            'ctaLink': 'home.cta.link',
            'logoText': 'header.logo.text',
            'logoAccent': 'header.logo.accent',
            'footerBrand': 'footer.brand.text',
            'footerAccent': 'footer.brand.accent',
            'footerTagline': 'footer.tagline',
            'footerCopyright': 'footer.copyright'
        };

        for (const [id, path] of Object.entries(simpleFields)) {
            const element = document.getElementById(id);
            if (element) {
                this.setValueByPath(updatedContent, path, element.value);
            }
        }

        // Collect all inputs with data-path attribute
        document.querySelectorAll('[data-path]').forEach(input => {
            const path = input.getAttribute('data-path');
            this.setValueByPath(updatedContent, path, input.value);
        });

        return updatedContent;
    }

    // Save content
    async saveContent() {
        try {
            const updatedContent = this.collectFormData();

            // In a real implementation, this would send to a backend
            // For now, we'll save to localStorage and download as file

            // Save to localStorage
            localStorage.setItem('site-content', JSON.stringify(updatedContent, null, 2));

            // Also trigger a download
            this.downloadJSON(updatedContent, 'site-content.json');

            this.hasChanges = false;
            this.showNotification('Changes saved! Download the file and replace content/site-content.json', 'success');

            // Log activity
            this.logActivity('Content updated');
        } catch (error) {
            console.error('Error saving content:', error);
            this.showNotification('Error saving content', 'error');
        }
    }

    // Download JSON file
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

    // Preview changes
    previewChanges() {
        const updatedContent = this.collectFormData();
        localStorage.setItem('preview-content', JSON.stringify(updatedContent));
        window.open('../index.html?preview=true', '_blank');
    }

    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.getElementById('saveNotification');
        const text = notification.querySelector('.notification-text');
        text.textContent = message;

        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Log activity
    logActivity(action) {
        const activities = JSON.parse(localStorage.getItem('cms_activities') || '[]');
        activities.unshift({
            action,
            timestamp: new Date().toISOString(),
            user: authManager.getCurrentUser()
        });
        // Keep only last 20 activities
        localStorage.setItem('cms_activities', JSON.stringify(activities.slice(0, 20)));
    }
}

// Initialize editor when page loads
if (document.getElementById('editorContent')) {
    const editor = new ContentEditor();
}
