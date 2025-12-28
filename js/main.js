// ==========================================
// HOLOGRAPHIC PERSONAL WEBSITE
// Main JavaScript File
// ==========================================

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initScrollEffects();
    initParticleEffects();
    initHolographicEffects();
    initIntersectionObserver();
    initSmoothScroll();
});

// ==========================================
// MOBILE MENU
// ==========================================
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!menuToggle || !navMenu) return;

    // Toggle menu
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');

        // Animate burger icon
        const spans = menuToggle.querySelectorAll('span');
        if (menuToggle.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translateY(10px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-10px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');

            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');

            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// ==========================================
// SCROLL EFFECTS
// ==========================================
function initScrollEffects() {
    const nav = document.querySelector('.nav-container');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add shadow on scroll
        if (currentScroll > 50) {
            nav.style.boxShadow = '0 4px 30px rgba(0, 240, 255, 0.2)';
        } else {
            nav.style.boxShadow = 'none';
        }

        // Hide/show nav on scroll (optional - commented out for now)
        // if (currentScroll > lastScroll && currentScroll > 100) {
        //     nav.style.transform = 'translateY(-100%)';
        // } else {
        //     nav.style.transform = 'translateY(0)';
        // }

        lastScroll = currentScroll;
    });
}

// ==========================================
// PARTICLE EFFECTS
// ==========================================
function initParticleEffects() {
    const particleContainer = document.querySelector('.floating-particles');
    if (!particleContainer) return;

    // Create floating particles
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        createParticle(particleContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Random position
    const x = Math.random() * 100;
    const y = Math.random() * 100;

    // Random size
    const size = Math.random() * 3 + 1;

    // Random animation duration
    const duration = Math.random() * 10 + 10;

    // Random delay
    const delay = Math.random() * 5;

    // Apply styles
    particle.style.cssText = `
        position: absolute;
        left: ${x}%;
        top: ${y}%;
        width: ${size}px;
        height: ${size}px;
        background: ${Math.random() > 0.5 ? 'rgba(0, 240, 255, 0.6)' : 'rgba(0, 255, 142, 0.6)'};
        border-radius: 50%;
        box-shadow: 0 0 10px ${Math.random() > 0.5 ? 'rgba(0, 240, 255, 0.8)' : 'rgba(0, 255, 142, 0.8)'};
        animation: floatParticle ${duration}s ${delay}s infinite ease-in-out;
        pointer-events: none;
    `;

    container.appendChild(particle);
}

// Add particle animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes floatParticle {
        0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
        }
        25% {
            transform: translate(20px, -30px) scale(1.2);
            opacity: 0.6;
        }
        50% {
            transform: translate(-20px, -60px) scale(0.8);
            opacity: 0.4;
        }
        75% {
            transform: translate(30px, -30px) scale(1.1);
            opacity: 0.7;
        }
    }
`;
document.head.appendChild(style);

// ==========================================
// HOLOGRAPHIC EFFECTS
// ==========================================
function initHolographicEffects() {
    const panels = document.querySelectorAll('.holo-panel');

    panels.forEach(panel => {
        // Mouse move effect
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            // Apply subtle 3D rotation (commented out to avoid motion sickness)
            // panel.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            // Create glow effect at mouse position
            const glow = panel.querySelector('.panel-glow');
            if (glow) {
                glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 240, 255, 0.2) 0%, transparent 50%)`;
            }
        });

        panel.addEventListener('mouseleave', () => {
            // panel.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    });
}

// ==========================================
// INTERSECTION OBSERVER (Scroll Animations)
// ==========================================
function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe service cards
    const cards = document.querySelectorAll('.service-card, .skill-card, .portfolio-item, .tool-card, .faq-item');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}

// ==========================================
// SMOOTH SCROLL
// ==========================================
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Skip if href is just "#"
            if (href === '#') return;

            e.preventDefault();

            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==========================================
// CURSOR GLOW EFFECT (Optional)
// ==========================================
function initCursorGlow() {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-glow';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0, 240, 255, 0.5), transparent);
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: screen;
        transition: transform 0.2s ease;
    `;
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
    });

    // Scale up on hover over interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .nav-link, .btn');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(2)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
        });
    });
}

// Uncomment to enable cursor glow
// initCursorGlow();

// ==========================================
// TYPING EFFECT (Optional for hero title)
// ==========================================
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// ==========================================
// NUMBER COUNTER ANIMATION
// ==========================================
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Apply counter animation to stats on scroll
function initCounterAnimation() {
    const stats = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const text = entry.target.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                const suffix = text.replace(/[0-9]/g, '');

                entry.target.classList.add('counted');

                let current = 0;
                const increment = number / 100;

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= number) {
                        entry.target.textContent = number + suffix;
                        clearInterval(timer);
                    } else {
                        entry.target.textContent = Math.floor(current) + suffix;
                    }
                }, 20);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
}

initCounterAnimation();

// ==========================================
// SKILL PROGRESS BAR ANIMATION
// ==========================================
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target.style.getPropertyValue('--progress');
                entry.target.style.width = progress;
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => {
        bar.style.width = '0%';
        observer.observe(bar);
    });
}

if (document.querySelector('.skill-progress')) {
    initSkillBars();
}

// ==========================================
// LOADING SCREEN (Optional)
// ==========================================
function initLoadingScreen() {
    const loader = document.createElement('div');
    loader.className = 'loading-screen';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #05080B;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.5s ease;
    `;

    loader.innerHTML = `
        <div style="text-align: center;">
            <div style="font-family: 'Orbitron', sans-serif; font-size: 2rem; font-weight: 900; background: linear-gradient(135deg, #00F0FF, #00FF8E); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem;">
                AI<span style="-webkit-text-fill-color: #00FF8E;">NEXUS</span>
            </div>
            <div style="width: 50px; height: 50px; border: 3px solid rgba(0, 240, 255, 0.3); border-top-color: #00F0FF; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        </div>
    `;

    document.body.appendChild(loader);

    // Add spin animation
    const spinStyle = document.createElement('style');
    spinStyle.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(spinStyle);

    // Remove loader after page load
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.remove();
            }, 500);
        }, 500);
    });
}

// Uncomment to enable loading screen
// initLoadingScreen();

// ==========================================
// CONSOLE MESSAGE
// ==========================================
console.log('%c🚀 AI NEXUS - Holographic Interface Active', 'color: #00F0FF; font-size: 16px; font-weight: bold; text-shadow: 0 0 10px #00F0FF;');
console.log('%c⚡ Built with cutting-edge web technologies', 'color: #00FF8E; font-size: 12px;');

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Get random number in range
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// ==========================================
// PERFORMANCE OPTIMIZATION
// ==========================================

// Reduce animations on low-end devices
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--transition-fast', '0s');
    document.documentElement.style.setProperty('--transition-normal', '0s');
    document.documentElement.style.setProperty('--transition-slow', '0s');
}

// ==========================================
// ERROR HANDLING
// ==========================================
window.addEventListener('error', (e) => {
    console.error('An error occurred:', e.error);
});

// ==========================================
// EXPORT (for module usage)
// ==========================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initMobileMenu,
        initScrollEffects,
        initParticleEffects,
        initHolographicEffects,
        debounce,
        throttle
    };
}
