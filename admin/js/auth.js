// Authentication Module
// Simple client-side authentication for demo purposes
// In production, this should use a proper backend authentication system

const AUTH_CONFIG = {
    // Default credentials (change these!)
    defaultUsername: 'admin',
    defaultPassword: '1234',
    sessionKey: 'cms_session',
    sessionDuration: 24 * 60 * 60 * 1000 // 24 hours
};

class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.checkSession();
    }

    // Check if user has valid session
    checkSession() {
        const session = localStorage.getItem(AUTH_CONFIG.sessionKey);
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                const now = new Date().getTime();

                if (sessionData.expiry > now) {
                    this.isAuthenticated = true;
                    return true;
                } else {
                    // Session expired
                    this.logout();
                }
            } catch (e) {
                console.error('Invalid session data');
                this.logout();
            }
        }
        return false;
    }

    // Login function
    login(username, password, rememberMe = false) {
        // Simple authentication check
        // TODO: Replace with proper backend authentication
        if (username === AUTH_CONFIG.defaultUsername && password === AUTH_CONFIG.defaultPassword) {
            const sessionData = {
                username: username,
                loginTime: new Date().getTime(),
                expiry: new Date().getTime() + AUTH_CONFIG.sessionDuration
            };

            localStorage.setItem(AUTH_CONFIG.sessionKey, JSON.stringify(sessionData));

            if (rememberMe) {
                localStorage.setItem('cms_remember', 'true');
            }

            this.isAuthenticated = true;
            return { success: true, message: 'Login successful' };
        } else {
            return { success: false, message: 'Invalid username or password' };
        }
    }

    // Logout function
    logout() {
        localStorage.removeItem(AUTH_CONFIG.sessionKey);
        localStorage.removeItem('cms_remember');
        this.isAuthenticated = false;
        window.location.href = 'login.html';
    }

    // Require authentication for page
    requireAuth() {
        if (!this.checkSession()) {
            window.location.href = 'login.html';
        }
    }

    // Get current user
    getCurrentUser() {
        const session = localStorage.getItem(AUTH_CONFIG.sessionKey);
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                return sessionData.username;
            } catch (e) {
                return null;
            }
        }
        return null;
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Login form handler
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // Redirect if already logged in
    if (authManager.checkSession()) {
        window.location.href = 'dashboard.html';
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        const result = authManager.login(username, password, rememberMe);

        if (result.success) {
            // Successful login - redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Show error message
            errorMessage.textContent = result.message;
            errorMessage.style.display = 'block';

            // Shake animation
            loginForm.style.animation = 'shake 0.5s';
            setTimeout(() => {
                loginForm.style.animation = '';
            }, 500);
        }
    });
}

// Logout button handler (for all admin pages)
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            authManager.logout();
        }
    });
}

// Protect admin pages (call this on all admin pages except login)
if (window.location.pathname.includes('/admin/') &&
    !window.location.pathname.includes('login.html')) {
    authManager.requireAuth();
}

// Add shake animation for login errors
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);
