document.addEventListener('DOMContentLoaded', () => {

    // 1. نظام تغيير اللغة (عربي / إنجليزي)
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        let currentLang = 'en';

        langBtn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'ar' : 'en';

            if (currentLang === 'ar') {
                document.body.classList.add('rtl');
                document.body.setAttribute('dir', 'rtl');
                langBtn.textContent = 'English';
            } else {
                document.body.classList.remove('rtl');
                document.body.setAttribute('dir', 'ltr');
                langBtn.textContent = 'عربي';
            }

            const elements = document.querySelectorAll('[data-ar][data-en]');
            elements.forEach(el => {
                el.innerHTML = el.getAttribute(`data-${currentLang}`);
            });
        });
    }

    // 2. القائمة المنسدلة للموبايل (Mobile Hamburger Menu)
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    // 3. مودال من نحن (About Us Modal)
    const aboutBtn = document.getElementById('aboutUsBtn');
    const aboutModal = document.getElementById('aboutModal');
    const closeAboutBtn = document.getElementById('closeAboutModal');

    function openAboutModal() {
        if (!aboutModal) return;
        aboutModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        const isAr = document.body.classList.contains('rtl');
        aboutModal.querySelectorAll('[data-ar][data-en]').forEach(el => {
            el.innerHTML = el.getAttribute(isAr ? 'data-ar' : 'data-en');
        });
    }

    function closeAboutModal() {
        if (!aboutModal) return;
        aboutModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (aboutBtn) {
        aboutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openAboutModal();
        });
    }

    if (closeAboutBtn) {
        closeAboutBtn.addEventListener('click', closeAboutModal);
    }

    if (aboutModal) {
        aboutModal.addEventListener('click', (e) => {
            if (e.target === aboutModal) closeAboutModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAboutModal();
    });

    // ===== نظام البحث (Search) =====
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    function executeSearch() {
        const query = searchInput.value.trim();
        if (query) {
            // بيحول العميل لصفحة المنتجات ويبعت معاها كلمة البحث
            window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        }
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', executeSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                executeSearch();
            }
        });
    }


});


// ==========================================
// جلب شريط العروض الديناميكي لعرضه للزوار
// ==========================================
async function loadDynamicAnnouncement() {
    try {
        const response = await fetch('/api/announcement');
        if (!response.ok) return;
        
        const data = await response.json();
        const topBarTextP = document.querySelector('.top-bar-text p');

        if (topBarTextP && data) {
            // تحديث السمات للترجمة التلقائية
            if (data.textAr) topBarTextP.setAttribute('data-ar', data.textAr);
            if (data.textEn) topBarTextP.setAttribute('data-en', data.textEn);

            // تحديد اللغة الحالية وعرض النص المناسب فوراً
            const isArabic = document.body.classList.contains('rtl') || document.documentElement.lang === 'ar';
            topBarTextP.textContent = isArabic ? (data.textAr || data.textEn) : (data.textEn || data.textAr);
        }
    } catch (error) {
        console.log('سيتم استخدام النص الافتراضي لشريط العروض:', error);
    }
}

// تشغيل جلب العرض فور تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadDynamicAnnouncement);