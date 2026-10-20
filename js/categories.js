// تحميل التصنيفات في قائمة Shop
async function loadCategoriesIntoNavbar() {
    try {
        const res = await fetch('/api/categories');
        const categories = await res.json();
        const isAr = document.body.classList.contains('rtl');

        const dropdowns = document.querySelectorAll('.dropdown-menu');

        dropdowns.forEach(menu => {
            if (categories.length === 0) {
                menu.innerHTML = `<li><a href="#" style="color:#888;">${isAr ? 'لا توجد أقسام' : 'No categories'}</a></li>`;
                return;
            }

            menu.innerHTML = categories.map(cat => {
                const name = isAr ? cat.nameAr : cat.name;
                return `<li><a href="products.html?category=${encodeURIComponent(cat.name)}" data-ar="${cat.nameAr}" data-en="${cat.name}">${name}</a></li>`;
            }).join('');
        });

    } catch (err) {
        console.error('Error loading categories:', err);
    }
}

// تشغيل عند فتح أي صفحة
document.addEventListener('DOMContentLoaded', loadCategoriesIntoNavbar);

// إعادة التحميل عند تغيير اللغة بدون تعارض في المتغيرات
document.addEventListener('DOMContentLoaded', () => {
    const langBtnElement = document.getElementById('lang-toggle');
    if (langBtnElement) {
        langBtnElement.addEventListener('click', () => {
            setTimeout(loadCategoriesIntoNavbar, 100);
        });
    }
});