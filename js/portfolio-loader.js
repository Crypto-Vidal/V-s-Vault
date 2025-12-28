/* ========================================
   PORTFOLIO LOADER
   Dynamically loads portfolio from JSON
   ======================================== */

class PortfolioLoader {
    constructor() {
        this.content = null;
        this.init();
    }

    async init() {
        await this.loadContent();
        this.renderPortfolio();

        // Listen for content updates from admin dashboard
        window.addEventListener('contentUpdated', (e) => {
            this.content = e.detail;
            this.renderPortfolio();
        });

        // Also listen for storage changes (when admin dashboard updates)
        window.addEventListener('storage', (e) => {
            if (e.key === 'siteContent') {
                this.loadContent().then(() => this.renderPortfolio());
            }
        });
    }

    async loadContent() {
        try {
            // First check localStorage for live updates
            const localContent = localStorage.getItem('siteContent');
            if (localContent) {
                this.content = JSON.parse(localContent);
                console.log('📦 Loaded portfolio from localStorage (live preview)');
                return;
            }

            // Fallback to JSON file
            const response = await fetch('content/site-content.json');
            if (!response.ok) throw new Error('Content file not found');
            this.content = await response.json();
            console.log('📦 Loaded portfolio from site-content.json');
        } catch (error) {
            console.error('Error loading portfolio:', error);
        }
    }

    renderPortfolio() {
        if (!this.content || !this.content.portfolio) {
            console.warn('No portfolio content found');
            return;
        }

        const portfolio = this.content.portfolio;

        // Update page title and subtitle
        this.updatePageHeader(portfolio);

        // Render portfolio items
        this.renderItems(portfolio.items || []);

        // Update CTA section
        this.updateCTA(portfolio.cta);
    }

    updatePageHeader(portfolio) {
        const titleEl = document.querySelector('.page-title .gradient-text');
        const subtitleEl = document.querySelector('.page-subtitle');

        if (titleEl && portfolio.pageTitle) {
            titleEl.textContent = portfolio.pageTitle;
        }

        if (subtitleEl && portfolio.pageSubtitle) {
            subtitleEl.textContent = portfolio.pageSubtitle;
        }
    }

    renderItems(items) {
        const grid = document.querySelector('.portfolio-grid');
        if (!grid) return;

        if (items.length === 0) {
            grid.innerHTML = `
                <div class="holo-panel" style="grid-column: 1 / -1; padding: 4rem; text-align: center;">
                    <div class="panel-glow"></div>
                    <h3 style="color: var(--cyan); margin-bottom: 1rem;">No Projects Yet</h3>
                    <p style="color: var(--gray-light);">Portfolio items will appear here once added.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = items.map(item => this.createPortfolioItem(item)).join('');
    }

    createPortfolioItem(item) {
        const isFeatured = item.featured || false;
        const hasMeta = item.meta && item.meta.length > 0;
        const hasLink = item.link && item.link !== '#';

        return `
            <div class="portfolio-item ${isFeatured ? 'featured' : ''}">
                <div class="holo-panel">
                    <div class="panel-glow"></div>
                    ${isFeatured && item.badge ? `<div class="portfolio-badge">${item.badge}</div>` : ''}
                    <div class="portfolio-image">
                        <div class="image-placeholder">
                            <span class="placeholder-icon">${item.icon || '📄'}</span>
                        </div>
                    </div>
                    <div class="portfolio-content">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        ${this.createTags(item.tags)}
                        ${hasMeta ? this.createMeta(item.meta) : ''}
                        ${hasLink ? this.createLink(item.link) : ''}
                    </div>
                </div>
            </div>
        `;
    }

    createTags(tags) {
        if (!tags || tags.length === 0) return '';

        return `
            <div class="portfolio-tags">
                ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        `;
    }

    createMeta(meta) {
        if (!meta || meta.length === 0) return '';

        return `
            <div class="portfolio-meta">
                ${meta.map(m => `<span class="meta-item">${m}</span>`).join('')}
            </div>
        `;
    }

    createLink(link) {
        return `
            <div class="portfolio-links">
                <a href="${link}" class="portfolio-link" target="_blank">
                    View Live Demo →
                </a>
            </div>
        `;
    }

    updateCTA(cta) {
        if (!cta) return;

        const ctaSection = document.querySelector('.cta-section');
        if (!ctaSection) return;

        const titleEl = ctaSection.querySelector('h2');
        const descEl = ctaSection.querySelector('p');
        const btnEl = ctaSection.querySelector('.btn');

        if (titleEl && cta.title) {
            titleEl.textContent = cta.title;
        }

        if (descEl && cta.description) {
            descEl.textContent = cta.description;
        }

        if (btnEl && cta.buttonText) {
            btnEl.querySelector('span').textContent = cta.buttonText;
        }

        if (btnEl && cta.link) {
            btnEl.href = cta.link;
        }
    }
}

// Initialize portfolio loader when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PortfolioLoader();
    });
} else {
    new PortfolioLoader();
}
