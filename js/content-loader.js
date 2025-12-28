// Content Loader Module
// Dynamically loads content from JSON files into the website

class ContentLoader {
    constructor() {
        this.content = null;
        this.isPreview = this.checkPreviewMode();
        this.init();
    }

    // Check if in preview mode
    checkPreviewMode() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('preview') === 'true';
    }

    // Initialize content loader
    async init() {
        await this.loadContent();
        if (this.content) {
            this.applyContent();
        }
    }

    // Load content from JSON
    async loadContent() {
        try {
            // Check for live updates from admin dashboard first
            const liveContent = localStorage.getItem('siteContent');
            if (liveContent) {
                try {
                    this.content = JSON.parse(liveContent);
                    console.log('📦 Loaded content from admin dashboard (live preview)');
                    return;
                } catch (e) {
                    console.warn('Invalid live content in localStorage, falling back to file');
                }
            }

            // Check for preview content
            if (this.isPreview) {
                const previewContent = localStorage.getItem('preview-content');
                if (previewContent) {
                    this.content = JSON.parse(previewContent);
                    this.showPreviewBanner();
                    return;
                }
            }

            // Load from JSON file
            const response = await fetch('content/site-content.json');
            if (!response.ok) {
                console.warn('Content file not found, using default content');
                return;
            }
            this.content = await response.json();
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    // Apply content to the page
    applyContent() {
        if (!this.content) return;

        // Update header/logo
        if (this.content.header) {
            this.updateHeader(this.content.header);
        }

        // Update footer
        if (this.content.footer) {
            this.updateFooter(this.content.footer);
        }

        // Update page-specific content
        if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
            this.updateHomePage(this.content.home);
        }
    }

    // Update header
    updateHeader(header) {
        // Update logo
        const logoElements = document.querySelectorAll('.logo-text');
        logoElements.forEach(logo => {
            if (header.logo) {
                logo.innerHTML = `${header.logo.text}<span class="logo-accent">${header.logo.accent}</span>`;
            }
        });

        // Update navigation (if needed in the future)
        if (header.navigation) {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu && navMenu.children.length === 0) {
                // Only populate if empty (to avoid overwriting existing nav)
                navMenu.innerHTML = header.navigation.map(link => {
                    const classes = link.admin ? 'nav-link admin-link' : 'nav-link';
                    return `<li><a href="${link.link}" class="${classes}">${link.text}</a></li>`;
                }).join('');
            }
        }
    }

    // Update footer
    updateFooter(footer) {
        // Update footer brand
        const footerBrand = document.querySelector('.footer-brand .logo-text');
        if (footerBrand && footer.brand) {
            footerBrand.innerHTML = `${footer.brand.text}<span class="logo-accent">${footer.brand.accent}</span>`;
        }

        // Update tagline
        const tagline = document.querySelector('.footer-brand p');
        if (tagline && footer.tagline) {
            tagline.textContent = footer.tagline;
        }

        // Update copyright
        const copyright = document.querySelector('.footer-bottom p');
        if (copyright && footer.copyright) {
            copyright.innerHTML = footer.copyright;
        }
    }

    // Update home page content
    updateHomePage(home) {
        if (!home) return;

        // Update hero section
        if (home.hero) {
            this.updateHeroSection(home.hero);
        }

        // Update services section
        if (home.services) {
            this.updateServicesSection(home.services);
        }

        // Update CTA section
        if (home.cta) {
            this.updateCTASection(home.cta);
        }
    }

    // Update hero section
    updateHeroSection(hero) {
        // Update hero title
        const titleLines = document.querySelectorAll('.hero-title .title-line');
        if (titleLines.length >= 2 && hero.title) {
            titleLines[0].textContent = hero.title.line1;

            // Handle second line with gradient text
            const gradientText = titleLines[1].querySelector('.gradient-text');
            if (gradientText) {
                const parts = hero.title.line2.split('AI Intelligence');
                if (parts.length > 1) {
                    titleLines[1].innerHTML = `${parts[0]}<span class="gradient-text">AI Intelligence</span>${parts[1] || ''}`;
                } else {
                    titleLines[1].textContent = hero.title.line2;
                }
            } else {
                titleLines[1].textContent = hero.title.line2;
            }
        }

        // Update subtitle
        const subtitle = document.querySelector('.hero-subtitle');
        if (subtitle && hero.subtitle) {
            subtitle.textContent = hero.subtitle;
        }

        // Update stats
        if (hero.stats) {
            const statItems = document.querySelectorAll('.hero-stats .stat-item');
            hero.stats.forEach((stat, index) => {
                if (statItems[index]) {
                    const number = statItems[index].querySelector('.stat-number');
                    const label = statItems[index].querySelector('.stat-label');
                    if (number) number.textContent = stat.number;
                    if (label) label.textContent = stat.label;
                }
            });
        }

        // Update CTA buttons
        if (hero.primaryCTA) {
            const primaryBtn = document.querySelector('.hero-cta .btn-primary');
            if (primaryBtn) {
                const span = primaryBtn.querySelector('span');
                if (span) span.textContent = hero.primaryCTA.text;
                primaryBtn.href = hero.primaryCTA.link;
            }
        }

        if (hero.secondaryCTA) {
            const secondaryBtn = document.querySelector('.hero-cta .btn-secondary');
            if (secondaryBtn) {
                const span = secondaryBtn.querySelector('span');
                if (span) span.textContent = hero.secondaryCTA.text;
                secondaryBtn.href = hero.secondaryCTA.link;
            }
        }
    }

    // Update services section
    updateServicesSection(services) {
        // Update section title
        const sectionTitle = document.querySelector('.services-preview .section-title');
        if (sectionTitle && services.sectionTitle) {
            // Preserve the title-accent span if it exists
            const accent = sectionTitle.querySelector('.title-accent');
            if (accent && services.sectionTitle.includes(' ')) {
                const parts = services.sectionTitle.split(' ');
                sectionTitle.innerHTML = `<span class="title-accent">${parts[0]}</span> ${parts.slice(1).join(' ')}`;
            } else {
                sectionTitle.textContent = services.sectionTitle;
            }
        }

        // Update service cards
        if (services.cards) {
            const serviceCards = document.querySelectorAll('.services-preview .service-card');
            services.cards.forEach((card, index) => {
                if (serviceCards[index]) {
                    const icon = serviceCards[index].querySelector('.card-icon span');
                    const title = serviceCards[index].querySelector('h3');
                    const description = serviceCards[index].querySelector('p');
                    const link = serviceCards[index].querySelector('.card-link');

                    if (icon) icon.textContent = card.icon;
                    if (title) title.textContent = card.title;
                    if (description) description.textContent = card.description;
                    if (link) link.href = card.link;
                }
            });
        }
    }

    // Update CTA section
    updateCTASection(cta) {
        const ctaPanel = document.querySelector('.cta-section .cta-panel');
        if (!ctaPanel) return;

        const title = ctaPanel.querySelector('h2');
        const description = ctaPanel.querySelector('p');
        const button = ctaPanel.querySelector('.btn-primary');

        if (title && cta.title) {
            title.textContent = cta.title;
        }

        if (description && cta.description) {
            description.textContent = cta.description;
        }

        if (button && cta.buttonText) {
            const span = button.querySelector('span');
            if (span) span.textContent = cta.buttonText;
            button.href = cta.link;
        }
    }

    // Show preview banner
    showPreviewBanner() {
        const banner = document.createElement('div');
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #00f0ff, #ff00ff);
            color: #000;
            padding: 1rem;
            text-align: center;
            font-family: 'Rajdhani', sans-serif;
            font-weight: 700;
            font-size: 1.1rem;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0, 240, 255, 0.5);
        `;
        banner.innerHTML = '👁️ PREVIEW MODE - Changes not yet published';
        document.body.prepend(banner);

        // Adjust body padding to account for banner
        document.body.style.paddingTop = '60px';
    }
}

// Initialize content loader when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ContentLoader();
    });
} else {
    new ContentLoader();
}
