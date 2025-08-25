/**
 * Modern JavaScript for Professional Static Website
 * Enhanced with performance optimizations and accessibility features
 */

// ===========================================
// Utility Functions
// ===========================================

const utils = {
    // Debounce function for performance optimization
    debounce: (func, wait, immediate) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    // Throttle function for scroll events
    throttle: (func, limit) => {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Check if element is in viewport
    isInViewport: (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Smooth scroll to element
    smoothScrollTo: (element, duration = 1000) => {
        const targetPosition = element.offsetTop - 80; // Account for fixed navbar
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }
};

// ===========================================
// Navigation Component
// ===========================================

class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.isScrolled = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.handleActiveLink();
    }

    bindEvents() {
        // Mobile menu toggle
        if (this.mobileMenu) {
            this.mobileMenu.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close mobile menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        utils.smoothScrollTo(targetElement);
                    }
                }
                this.closeMobileMenu();
            });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', utils.throttle(() => {
            this.handleScroll();
        }, 10));

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.navbar.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        this.navMenu.classList.toggle('active');
        this.mobileMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    }

    closeMobileMenu() {
        this.navMenu.classList.remove('active');
        this.mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100 && !this.isScrolled) {
            this.navbar.classList.add('scrolled');
            this.isScrolled = true;
        } else if (scrollTop <= 100 && this.isScrolled) {
            this.navbar.classList.remove('scrolled');
            this.isScrolled = false;
        }
    }

    handleActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }
}

// ===========================================
// Form Handler
// ===========================================

class FormHandler {
    constructor() {
        this.contactForm = document.getElementById('contactForm');
        this.init();
    }

    init() {
        if (this.contactForm) {
            this.bindEvents();
        }
    }

    bindEvents() {
        this.contactForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        const inputs = this.contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', utils.debounce(() => this.validateField(input), 300));
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.contactForm);
        const formObject = Object.fromEntries(formData.entries());
        
        // Validate all fields
        const isValid = this.validateForm();
        
        if (!isValid) {
            this.showMessage('Please correct the errors before submitting.', 'error');
            return;
        }

        // Show loading state
        const submitButton = this.contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        try {
            // Simulate form submission (replace with actual API call)
            await this.simulateFormSubmission(formObject);
            
            this.showMessage('Thank you! Your message has been sent successfully.', 'success');
            this.contactForm.reset();
            this.clearValidation();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage('Sorry, there was an error sending your message. Please try again.', 'error');
        } finally {
            // Restore button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    validateForm() {
        const inputs = this.contactForm.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        let isValid = true;
        let errorMessage = '';

        // Clear previous validation
        this.clearFieldValidation(field);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required.';
        }
        // Email validation
        else if (fieldType === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address.';
            }
        }
        // Phone validation
        else if (fieldType === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number.';
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        // Create or update error message
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    clearFieldValidation(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    clearValidation() {
        const inputs = this.contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => this.clearFieldValidation(input));
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;

        // Insert message
        this.contactForm.insertBefore(messageElement, this.contactForm.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);

        // Scroll to message
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    async simulateFormSubmission(formData) {
        // Simulate API call delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random success/failure for demo
                if (Math.random() > 0.1) { // 90% success rate
                    console.log('Form submitted:', formData);
                    resolve(formData);
                } else {
                    reject(new Error('Network error'));
                }
            }, 2000);
        });
    }
}

// ===========================================
// Scroll Animations
// ===========================================

class ScrollAnimations {
    constructor() {
        this.animatedElements = document.querySelectorAll('[data-animate]');
        this.init();
    }

    init() {
        this.observeElements();
        this.addAnimationClasses();
    }

    addAnimationClasses() {
        // Add initial animation classes
        this.animatedElements.forEach(element => {
            element.classList.add('animate-hidden');
        });
    }

    observeElements() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateElement(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            this.animatedElements.forEach(element => {
                observer.observe(element);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            this.animatedElements.forEach(element => {
                this.animateElement(element);
            });
        }
    }

    animateElement(element) {
        const animationType = element.getAttribute('data-animate') || 'fadeIn';
        element.classList.remove('animate-hidden');
        element.classList.add('animate-visible', `animate-${animationType}`);
    }
}

// ===========================================
// Performance Optimizations
// ===========================================

class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.preloadCriticalResources();
        this.optimizeScrollPerformance();
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    preloadCriticalResources() {
        // Preload critical assets
        const criticalAssets = [
            '/assets/logo.svg',
            '/assets/hero-image.jpg'
        ];

        criticalAssets.forEach(asset => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = asset.endsWith('.svg') ? 'image' : 'image';
            link.href = asset;
            document.head.appendChild(link);
        });
    }

    optimizeScrollPerformance() {
        // Use passive listeners for better scroll performance
        let ticking = false;

        function updateScrollPosition() {
            // Scroll-dependent operations go here
            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateScrollPosition);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick, { passive: true });
    }
}

// ===========================================
// Accessibility Enhancements
// ===========================================

class AccessibilityEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.handleKeyboardNavigation();
        this.enhanceFocusManagement();
        this.addAriaLabels();
    }

    handleKeyboardNavigation() {
        // Escape key handler for mobile menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeMenu = document.querySelector('.nav-menu.active');
                if (activeMenu) {
                    activeMenu.classList.remove('active');
                    document.querySelector('.nav-toggle').classList.remove('active');
                }
            }
        });

        // Skip to main content link
        this.addSkipLink();
    }

    enhanceFocusManagement() {
        // Add focus indicators for keyboard users
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-color);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.3s;
        `;

        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    addAriaLabels() {
        // Add aria-labels to elements that need them
        const socialLinks = document.querySelectorAll('.social-links a');
        socialLinks.forEach((link, index) => {
            if (!link.getAttribute('aria-label')) {
                const platforms = ['Facebook', 'Twitter', 'LinkedIn'];
                link.setAttribute('aria-label', platforms[index] || 'Social Media');
            }
        });
    }
}

// ===========================================
// Cookie Consent (Optional)
// ===========================================

class CookieConsent {
    constructor() {
        this.cookieName = 'website-consent';
        this.init();
    }

    init() {
        if (!this.hasConsent()) {
            this.showConsentBanner();
        }
    }

    hasConsent() {
        return localStorage.getItem(this.cookieName) === 'accepted';
    }

    showConsentBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-consent';
        banner.innerHTML = `
            <div class="cookie-content">
                <p>This website uses cookies to ensure you get the best experience on our website.</p>
                <div class="cookie-actions">
                    <button class="btn btn-primary accept-cookies">Accept</button>
                    <button class="btn btn-secondary decline-cookies">Decline</button>
                </div>
            </div>
        `;

        banner.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--gray-900);
            color: white;
            padding: 1rem;
            z-index: 1000;
            transform: translateY(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(banner);

        // Animate in
        setTimeout(() => {
            banner.style.transform = 'translateY(0)';
        }, 100);

        // Bind events
        banner.querySelector('.accept-cookies').addEventListener('click', () => {
            this.acceptCookies();
            this.hideBanner(banner);
        });

        banner.querySelector('.decline-cookies').addEventListener('click', () => {
            this.declineCookies();
            this.hideBanner(banner);
        });
    }

    acceptCookies() {
        localStorage.setItem(this.cookieName, 'accepted');
        // Initialize analytics or other cookie-dependent features here
        console.log('Cookies accepted');
    }

    declineCookies() {
        localStorage.setItem(this.cookieName, 'declined');
        console.log('Cookies declined');
    }

    hideBanner(banner) {
        banner.style.transform = 'translateY(100%)';
        setTimeout(() => {
            banner.remove();
        }, 300);
    }
}

// ===========================================
// Main Application
// ===========================================

class WebsiteApp {
    constructor() {
        this.components = {
            navigation: null,
            formHandler: null,
            scrollAnimations: null,
            performanceOptimizer: null,
            accessibilityEnhancer: null,
            cookieConsent: null
        };
        
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // Initialize core components
            this.components.navigation = new Navigation();
            this.components.formHandler = new FormHandler();
            this.components.scrollAnimations = new ScrollAnimations();
            this.components.performanceOptimizer = new PerformanceOptimizer();
            this.components.accessibilityEnhancer = new AccessibilityEnhancer();
            
            // Initialize optional components
            // this.components.cookieConsent = new CookieConsent();

            // Add global event listeners
            this.addGlobalEventListeners();
            
            console.log('Website application initialized successfully');
        } catch (error) {
            console.error('Error initializing website application:', error);
        }
    }

    addGlobalEventListeners() {
        // Handle external links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.hostname !== location.hostname) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });

        // Handle print styles
        window.addEventListener('beforeprint', () => {
            document.body.classList.add('print-mode');
        });

        window.addEventListener('afterprint', () => {
            document.body.classList.remove('print-mode');
        });
    }
}

// ===========================================
// Additional CSS for JavaScript functionality
// ===========================================

// Inject additional styles for JavaScript functionality
const additionalStyles = `
    <style>
        /* Animation styles */
        .animate-hidden {
            opacity: 0;
            transform: translateY(20px);
        }
        
        .animate-visible {
            opacity: 1;
            transform: translateY(0);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .animate-fadeIn {
            animation: fadeIn 0.6s ease forwards;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Form validation styles */
        .form-group input.error,
        .form-group textarea.error,
        .form-group select.error {
            border-color: var(--error-color);
            box-shadow: 0 0 0 3px rgb(239 68 68 / 0.1);
        }
        
        .error-message {
            display: block;
            color: var(--error-color);
            font-size: var(--font-size-sm);
            margin-top: var(--space-2);
        }
        
        .form-message {
            padding: var(--space-4);
            border-radius: var(--radius-md);
            margin-bottom: var(--space-6);
            font-weight: 500;
        }
        
        .form-message.success {
            background-color: rgb(34 197 94 / 0.1);
            color: var(--success-color);
            border: 1px solid rgb(34 197 94 / 0.2);
        }
        
        .form-message.error {
            background-color: rgb(239 68 68 / 0.1);
            color: var(--error-color);
            border: 1px solid rgb(239 68 68 / 0.2);
        }
        
        /* Navbar scroll effect */
        .navbar.scrolled {
            background-color: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            box-shadow: var(--shadow-lg);
        }
        
        /* Keyboard navigation styles */
        .keyboard-navigation *:focus {
            outline: 2px solid var(--primary-color);
            outline-offset: 2px;
        }
        
        /* Print styles */
        @media print {
            .navbar,
            .footer,
            .cta,
            .nav-toggle {
                display: none !important;
            }
            
            .hero {
                margin-top: 0 !important;
            }
        }
        
        /* Cookie consent styles */
        .cookie-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .cookie-actions {
            display: flex;
            gap: var(--space-4);
        }
        
        @media (max-width: 768px) {
            .cookie-content {
                flex-direction: column;
                gap: var(--space-4);
            }
        }
    </style>
`;

// Inject styles into head
document.head.insertAdjacentHTML('beforeend', additionalStyles);

// Initialize the application
const app = new WebsiteApp();
