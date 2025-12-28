/* ========================================
   ADMIN DASHBOARD JAVASCRIPT
   Handles all admin functionality
   ======================================== */

class AdminDashboard {
    constructor() {
        this.content = null;
        this.currentEditId = null;
        this.confirmCallback = null;
        this.init();
    }

    async init() {
        // Load content from JSON
        await this.loadContent();

        // Initialize all event listeners
        this.initTabs();
        this.initPortfolio();
        this.initHome();
        this.initServices();
        this.initModals();
        this.initSettings();

        // Load portfolio items
        this.renderPortfolioList();
        this.updateStats();

        // Load home content
        this.loadHomeContent();

        // Load services content
        this.loadServicesContent();
    }

    // Load content from JSON file or localStorage
    async loadContent() {
        try {
            // First check localStorage for any pending changes
            const localContent = localStorage.getItem('siteContent');
            if (localContent) {
                this.content = JSON.parse(localContent);
                console.log('Loaded content from localStorage (live preview)');
            } else {
                // Load from file
                const response = await fetch('content/site-content.json');
                if (!response.ok) throw new Error('Content file not found');
                this.content = await response.json();
                // Store in localStorage for live updates
                localStorage.setItem('siteContent', JSON.stringify(this.content));
            }
        } catch (error) {
            console.error('Error loading content:', error);
            this.showToast('Error loading content', 'error');
        }
    }

    // Save content to localStorage (for live updates)
    saveToLocalStorage() {
        localStorage.setItem('siteContent', JSON.stringify(this.content));
        this.showToast('Changes saved! Updates are live on the website.');

        // Trigger a custom event that the main site can listen to
        window.dispatchEvent(new CustomEvent('contentUpdated', {
            detail: this.content
        }));
    }

    // Export content as JSON file for permanent storage
    exportContent() {
        const dataStr = JSON.stringify(this.content, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'site-content.json';
        link.click();
        URL.revokeObjectURL(url);
        this.showToast('Content exported! Replace content/site-content.json with this file.');
    }

    /* ========================================
       TAB NAVIGATION
       ======================================== */

    initTabs() {
        const tabs = document.querySelectorAll('.admin-tab');
        const sections = document.querySelectorAll('.admin-section');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const sectionId = tab.dataset.section;

                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update active section
                sections.forEach(s => s.classList.remove('active'));
                document.getElementById(`section-${sectionId}`).classList.add('active');
            });
        });
    }

    /* ========================================
       PORTFOLIO MANAGEMENT
       ======================================== */

    initPortfolio() {
        const addBtn = document.getElementById('addPortfolioBtn');
        const saveBtn = document.getElementById('saveProjectBtn');

        addBtn.addEventListener('click', () => this.openPortfolioModal());
        saveBtn.addEventListener('click', () => this.saveProject());
    }

    renderPortfolioList() {
        const list = document.getElementById('portfolioList');
        const items = this.content.portfolio?.items || [];

        if (items.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📁</div>
                    <h3>No projects yet</h3>
                    <p>Click "Add New Project" to create your first portfolio item.</p>
                </div>
            `;
            return;
        }

        list.innerHTML = items.map(item => `
            <div class="portfolio-item-admin ${item.featured ? 'featured' : ''}" data-id="${item.id}">
                <div class="portfolio-icon">${item.icon || '📄'}</div>
                <div class="portfolio-details">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <div class="portfolio-tags-admin">
                        ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="portfolio-actions">
                    <button class="btn-edit" onclick="adminDashboard.editProject('${item.id}')">
                        ✏️ Edit
                    </button>
                    <button class="btn-delete" onclick="adminDashboard.deleteProject('${item.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    openPortfolioModal(projectId = null) {
        const modal = document.getElementById('portfolioModal');
        const modalTitle = document.getElementById('modalTitle');

        if (projectId) {
            // Edit mode
            modalTitle.textContent = 'Edit Project';
            this.currentEditId = projectId;
            this.loadProjectData(projectId);
        } else {
            // Add mode
            modalTitle.textContent = 'Add New Project';
            this.currentEditId = null;
            this.clearProjectForm();
        }

        modal.classList.add('active');
    }

    loadProjectData(projectId) {
        const project = this.content.portfolio.items.find(p => p.id === projectId);
        if (!project) return;

        document.getElementById('projectTitle').value = project.title;
        document.getElementById('projectDescription').value = project.description;
        document.getElementById('projectIcon').value = project.icon || '';
        document.getElementById('projectTags').value = project.tags.join(', ');
        document.getElementById('projectLink').value = project.link || '';
        document.getElementById('projectMeta').value = project.meta ? project.meta.join(', ') : '';
        document.getElementById('projectFeatured').checked = project.featured || false;
    }

    clearProjectForm() {
        document.getElementById('projectTitle').value = '';
        document.getElementById('projectDescription').value = '';
        document.getElementById('projectIcon').value = '';
        document.getElementById('projectTags').value = '';
        document.getElementById('projectLink').value = '';
        document.getElementById('projectMeta').value = '';
        document.getElementById('projectFeatured').checked = false;
    }

    saveProject() {
        const title = document.getElementById('projectTitle').value.trim();
        const description = document.getElementById('projectDescription').value.trim();
        const icon = document.getElementById('projectIcon').value.trim();
        const tags = document.getElementById('projectTags').value.split(',').map(t => t.trim()).filter(t => t);
        const link = document.getElementById('projectLink').value.trim();
        const meta = document.getElementById('projectMeta').value.split(',').map(m => m.trim()).filter(m => m);
        const featured = document.getElementById('projectFeatured').checked;

        // Validation
        if (!title || !description || !icon || tags.length === 0) {
            alert('Please fill in all required fields (marked with *)');
            return;
        }

        // Confirm action
        this.showConfirmation(
            'Save Project',
            `Are you sure you want to ${this.currentEditId ? 'update' : 'add'} this project?`,
            () => {
                const projectData = {
                    id: this.currentEditId || this.generateId(title),
                    title,
                    description,
                    icon,
                    tags,
                    link: link || '#',
                    featured
                };

                if (meta.length > 0) {
                    projectData.meta = meta;
                }

                if (featured) {
                    projectData.badge = 'Featured App';
                }

                if (!this.content.portfolio) {
                    this.content.portfolio = { items: [] };
                }

                if (this.currentEditId) {
                    // Update existing
                    const index = this.content.portfolio.items.findIndex(p => p.id === this.currentEditId);
                    if (index !== -1) {
                        this.content.portfolio.items[index] = projectData;
                    }
                } else {
                    // Add new
                    this.content.portfolio.items.push(projectData);
                }

                // Save changes
                this.saveToLocalStorage();
                this.renderPortfolioList();
                this.updateStats();
                this.closeModal('portfolioModal');
                this.clearProjectForm();
            }
        );
    }

    editProject(projectId) {
        this.openPortfolioModal(projectId);
    }

    deleteProject(projectId) {
        const project = this.content.portfolio.items.find(p => p.id === projectId);
        if (!project) return;

        this.showConfirmation(
            'Delete Project',
            `Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
            () => {
                this.content.portfolio.items = this.content.portfolio.items.filter(p => p.id !== projectId);
                this.saveToLocalStorage();
                this.renderPortfolioList();
                this.updateStats();
            }
        );
    }

    updateStats() {
        const items = this.content.portfolio?.items || [];
        const featured = items.filter(i => i.featured).length;

        document.getElementById('totalProjects').textContent = items.length;
        document.getElementById('featuredProjects').textContent = featured;
        document.getElementById('regularProjects').textContent = items.length - featured;
    }

    /* ========================================
       HOME PAGE MANAGEMENT
       ======================================== */

    initHome() {
        const saveBtn = document.getElementById('saveHomeBtn');
        saveBtn.addEventListener('click', () => this.saveHomeContent());
    }

    loadHomeContent() {
        if (!this.content.home) return;

        const { hero, cta } = this.content.home;

        if (hero) {
            document.getElementById('heroLine1').value = hero.title?.line1 || '';
            document.getElementById('heroLine2').value = hero.title?.line2 || '';
            document.getElementById('heroSubtitle').value = hero.subtitle || '';
        }

        if (cta) {
            document.getElementById('ctaTitle').value = cta.title || '';
            document.getElementById('ctaDescription').value = cta.description || '';
        }
    }

    saveHomeContent() {
        this.showConfirmation(
            'Save Home Content',
            'Are you sure you want to update the home page content?',
            () => {
                if (!this.content.home) {
                    this.content.home = {};
                }

                this.content.home.hero = {
                    ...this.content.home.hero,
                    title: {
                        line1: document.getElementById('heroLine1').value,
                        line2: document.getElementById('heroLine2').value
                    },
                    subtitle: document.getElementById('heroSubtitle').value
                };

                this.content.home.cta = {
                    ...this.content.home.cta,
                    title: document.getElementById('ctaTitle').value,
                    description: document.getElementById('ctaDescription').value
                };

                this.saveToLocalStorage();
            }
        );
    }

    /* ========================================
       SERVICES MANAGEMENT
       ======================================== */

    initServices() {
        const addBtn = document.getElementById('addServiceBtn');
        const saveBtn = document.getElementById('saveServiceBtn');

        addBtn.addEventListener('click', () => this.openServiceModal());
        saveBtn.addEventListener('click', () => this.saveService());

        this.loadServicesContent();
    }

    loadServicesContent() {
        const list = document.getElementById('servicesList');

        // Initialize services structure if it doesn't exist
        if (!this.content.home) {
            this.content.home = {};
        }
        if (!this.content.home.services) {
            this.content.home.services = { cards: [] };
        }

        const services = this.content.home.services.cards || [];

        if (services.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⚙️</div>
                    <h3>No services yet</h3>
                    <p>Click "Add Service" to create your first service card.</p>
                </div>
            `;
            return;
        }

        list.innerHTML = services.map((service, index) => `
            <div class="service-item-admin" data-index="${index}">
                <div class="portfolio-icon">${service.icon || '⚙️'}</div>
                <div class="portfolio-details">
                    <h3>${service.title}</h3>
                    <p>${service.description}</p>
                </div>
                <div class="portfolio-actions">
                    <button class="btn-edit" onclick="adminDashboard.editService(${index})">
                        ✏️ Edit
                    </button>
                    <button class="btn-delete" onclick="adminDashboard.deleteService(${index})">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    openServiceModal(serviceIndex = null) {
        const modal = document.getElementById('serviceModal');
        const modalTitle = document.getElementById('serviceModalTitle');

        if (serviceIndex !== null) {
            // Edit mode
            modalTitle.textContent = 'Edit Service';
            this.currentEditId = serviceIndex;
            this.loadServiceData(serviceIndex);
        } else {
            // Add mode
            modalTitle.textContent = 'Add New Service';
            this.currentEditId = null;
            this.clearServiceForm();
        }

        modal.classList.add('active');
    }

    loadServiceData(serviceIndex) {
        const service = this.content.home.services.cards[serviceIndex];
        if (!service) return;

        document.getElementById('serviceIcon').value = service.icon || '';
        document.getElementById('serviceTitle').value = service.title || '';
        document.getElementById('serviceDescription').value = service.description || '';
        document.getElementById('serviceLink').value = service.link || '';
    }

    clearServiceForm() {
        document.getElementById('serviceIcon').value = '';
        document.getElementById('serviceTitle').value = '';
        document.getElementById('serviceDescription').value = '';
        document.getElementById('serviceLink').value = '';
    }

    saveService() {
        const icon = document.getElementById('serviceIcon').value.trim();
        const title = document.getElementById('serviceTitle').value.trim();
        const description = document.getElementById('serviceDescription').value.trim();
        const link = document.getElementById('serviceLink').value.trim();

        // Validation
        if (!icon || !title || !description) {
            alert('Please fill in all required fields (marked with *)');
            return;
        }

        this.showConfirmation(
            'Save Service',
            `Are you sure you want to ${this.currentEditId !== null ? 'update' : 'add'} this service?`,
            () => {
                const serviceData = {
                    icon,
                    title,
                    description,
                    link: link || '#'
                };

                if (this.currentEditId !== null) {
                    // Update existing
                    this.content.home.services.cards[this.currentEditId] = serviceData;
                } else {
                    // Add new
                    this.content.home.services.cards.push(serviceData);
                }

                // Save changes
                this.saveToLocalStorage();
                this.loadServicesContent();
                this.closeModal('serviceModal');
                this.clearServiceForm();
            }
        );
    }

    editService(serviceIndex) {
        this.openServiceModal(serviceIndex);
    }

    deleteService(serviceIndex) {
        const service = this.content.home.services.cards[serviceIndex];
        if (!service) return;

        this.showConfirmation(
            'Delete Service',
            `Are you sure you want to delete "${service.title}"? This action cannot be undone.`,
            () => {
                this.content.home.services.cards.splice(serviceIndex, 1);
                this.saveToLocalStorage();
                this.loadServicesContent();
            }
        );
    }

    /* ========================================
       SETTINGS
       ======================================== */

    initSettings() {
        const exportBtn = document.getElementById('exportDataBtn');
        const resetBtn = document.getElementById('resetDataBtn');

        exportBtn.addEventListener('click', () => this.exportContent());
        resetBtn.addEventListener('click', () => this.resetData());
    }

    resetData() {
        this.showConfirmation(
            'Reset to Default',
            'Are you sure you want to reset all content to default? This will clear all your changes from localStorage.',
            () => {
                localStorage.removeItem('siteContent');
                location.reload();
            }
        );
    }

    /* ========================================
       MODAL MANAGEMENT
       ======================================== */

    initModals() {
        // Close buttons
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Click outside to close
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Confirmation modal buttons
        document.getElementById('confirmCancel').addEventListener('click', () => {
            this.closeModal('confirmModal');
            this.confirmCallback = null;
        });

        document.getElementById('confirmOk').addEventListener('click', () => {
            if (this.confirmCallback) {
                this.confirmCallback();
                this.confirmCallback = null;
            }
            this.closeModal('confirmModal');
        });
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    showConfirmation(title, message, callback) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        this.confirmCallback = callback;
        document.getElementById('confirmModal').classList.add('active');
    }

    /* ========================================
       UTILITIES
       ======================================== */

    generateId(title) {
        return title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('successToast');
        const messageEl = toast.querySelector('.toast-message');

        messageEl.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize admin dashboard when DOM is loaded
let adminDashboard;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        adminDashboard = new AdminDashboard();
    });
} else {
    adminDashboard = new AdminDashboard();
}

// Global function for inline onclick handlers
window.adminDashboard = adminDashboard;
