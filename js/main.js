document.addEventListener('DOMContentLoaded', () => {
    initLang();
    initMobileMenu();
    initSearch();
    updateCartCount();
});

// 1. Language Toggle (AR / EN)
function initLang() {
    const langBtn = document.getElementById('langToggleBtn');
    if (!langBtn) return;

    // Read saved lang or default to EN
    const savedLang = localStorage.getItem('lang') || 'en';
    applyLang(savedLang);

    langBtn.addEventListener('click', () => {
        const currentLang = localStorage.getItem('lang') || 'en';
        const newLang = currentLang === 'en' ? 'ar' : 'en';
        localStorage.setItem('lang', newLang);
        applyLang(newLang);
        window.location.reload(); // Reload to refresh elements
    });
}

function applyLang(lang) {
    const langBtn = document.getElementById('langToggleBtn');
    if (lang === 'ar') {
        document.body.classList.add('rtl');
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
        if (langBtn) langBtn.innerText = 'EN';
    } else {
        document.body.classList.remove('rtl');
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = 'en';
        if (langBtn) langBtn.innerText = 'AR';
    }

    // Translate elements with data-en and data-ar
    document.querySelectorAll('[data-en]').forEach(el => {
        const text = lang === 'ar' ? el.getAttribute('data-ar') : el.getAttribute('data-en');
        if (text) el.innerText = text;
    });

    // Translate placeholders
    document.querySelectorAll('[data-en-placeholder]').forEach(el => {
        const placeholder = lang === 'ar' ? el.getAttribute('data-ar-placeholder') : el.getAttribute('data-en-placeholder');
        if (placeholder) el.placeholder = placeholder;
    });
}

// 2. Mobile Sidebar & Hamburger Handler
function initMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    let navOverlay = document.getElementById('navOverlay');

    // Create overlay if not present
    if (!navOverlay) {
        navOverlay = document.createElement('div');
        navOverlay.id = 'navOverlay';
        navOverlay.className = 'nav-overlay';
        document.body.appendChild(navOverlay);
    }

    function toggleMenu(open) {
        if (!navMenu) return;
        const shouldOpen = open !== undefined ? open : !navMenu.classList.contains('active');
        
        if (shouldOpen) {
            navMenu.classList.add('active');
            if (hamburgerBtn) hamburgerBtn.classList.add('active');
            navOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            navMenu.classList.remove('active');
            if (hamburgerBtn) hamburgerBtn.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    if (navOverlay) {
        navOverlay.addEventListener('click', () => toggleMenu(false));
    }

    // Dropdown toggle on mobile
    const dropdowns = document.querySelectorAll('.nav-item.dropdown');
    dropdowns.forEach(drop => {
        const link = drop.querySelector('.nav-link');
        if (link) {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    drop.classList.toggle('open');
                }
            });
        }
    });
}

// 3. Global Search
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    function executeSearch() {
        if (!searchInput) return;
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        }
    }

    if (searchBtn) searchBtn.addEventListener('click', executeSearch);
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') executeSearch();
        });
    }
}

// 4. Cart Count Badge
function updateCartCount() {
    const badge = document.getElementById('cartCount');
    if (!badge) return;
    const cart = JSON.parse(localStorage.getItem('bigMuscleCart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    badge.innerText = totalItems;
}