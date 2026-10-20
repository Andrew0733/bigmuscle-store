let currentOfferData = null; // العرض المفتوح حالياً

async function loadOffers() {
    const offersContainer = document.getElementById('offers-container');
    if (!offersContainer) return;

    try {
        const res = await fetch('/api/offers');
        const offers = await res.json();
        const isAr = document.body.classList.contains('rtl');
        const section = offersContainer.closest('.offers-section');

        if (offers.length === 0) {
            if (section) section.style.display = 'none';
            return;
        }

        if (section) section.style.display = 'block';

        offersContainer.innerHTML = offers.map(offer => {
            const title = isAr ? (offer.titleAr || offer.title) : offer.title;
            const discount = isAr ? (offer.discountTextAr || offer.discountText) : offer.discountText;

            // بنخزن بيانات العرض في data attributes عشان نفتح الـ Modal بيها
            return `
                <div class="offer-card"
                     data-id="${offer._id}"
                     data-title="${offer.title || ''}"
                     data-title-ar="${offer.titleAr || ''}"
                     data-discount="${offer.discountText || ''}"
                     data-discount-ar="${offer.discountTextAr || ''}"
                     data-desc="${offer.description || ''}"
                     data-desc-ar="${offer.descriptionAr || ''}"
                     data-price="${offer.price || 0}"
                     data-image="${offer.image || ''}">
                    <div class="offer-img">
                        <img src="${offer.image}" alt="${title}">
                    </div>
                    <div class="offer-details">
                        <span class="offer-badge">${discount}</span>
                        <h3>${title}</h3>
                        <button class="btn btn-primary offer-quick-btn" type="button">
                            ${isAr ? 'عرض التفاصيل' : 'View Deal'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // ربط الضغط على الكروت
        document.querySelectorAll('.offer-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // لو دوست على الزرار جوه الكارت برضه يفتح
                openOfferModal(card);
            });
        });

    } catch (err) {
        console.error('Error loading offers:', err);
    }
}

function openOfferModal(card) {
    const isAr = document.body.classList.contains('rtl');

    currentOfferData = {
        id: card.dataset.id,
        title: isAr ? (card.dataset.titleAr || card.dataset.title) : card.dataset.title,
        discount: isAr ? (card.dataset.discountAr || card.dataset.discount) : card.dataset.discount,
        desc: isAr ? (card.dataset.descAr || card.dataset.desc) : (card.dataset.desc || (isAr ? 'لا يوجد وصف إضافي' : 'No extra description')),
        price: Number(card.dataset.price) || 0,
        image: card.dataset.image
    };

    document.getElementById('modalOfferImg').src = currentOfferData.image;
    document.getElementById('modalOfferBadge').textContent = currentOfferData.discount;
    document.getElementById('modalOfferTitle').textContent = currentOfferData.title;
    document.getElementById('modalOfferDesc').textContent = currentOfferData.desc;
    document.getElementById('modalOfferPrice').textContent = currentOfferData.price;
    document.getElementById('modalOfferCurrency').textContent = isAr ? 'ج.م' : 'EGP';

    // تحديث نص زرار أضف للسلة حسب اللغة
    const addBtnSpan = document.querySelector('#modalAddToCartBtn span');
    if (addBtnSpan) addBtnSpan.textContent = isAr ? 'أضف للسلة' : 'Add to Cart';

    const closeBtn = document.getElementById('modalCloseBtn');
    if (closeBtn) closeBtn.textContent = isAr ? 'إغلاق' : 'Close';

    document.getElementById('offerModal').classList.add('active');
    document.body.style.overflow = 'hidden'; // منع سكرول الصفحة
}

function closeOfferModal() {
    document.getElementById('offerModal').classList.remove('active');
    document.body.style.overflow = '';
    currentOfferData = null;
}

// إضافة العرض للسلة
function addOfferToCart() {
    if (!currentOfferData) return;

    // بنستخدم دالة addToCart الموجودة في cart.js
    if (typeof addToCart === 'function') {
        addToCart(
            'offer_' + currentOfferData.id,
            currentOfferData.title,
            currentOfferData.price,
            currentOfferData.image
        );
        closeOfferModal();
    } else {
        alert('Cart system not loaded');
    }
}

// Events
document.addEventListener('DOMContentLoaded', () => {
    loadOffers();

    const overlay = document.getElementById('offerModal');
    const closeX = document.getElementById('closeOfferModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    const addBtn = document.getElementById('modalAddToCartBtn');

    if (closeX) closeX.addEventListener('click', closeOfferModal);
    if (closeBtn) closeBtn.addEventListener('click', closeOfferModal);
    if (addBtn) addBtn.addEventListener('click', addOfferToCart);

    // قفل لما تدوس برة المودال
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeOfferModal();
        });
    }

    // قفل بـ ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeOfferModal();
    });
});

// تحديث العروض عند تغيير اللغة
const langToggleBtn = document.getElementById('lang-toggle');
if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => setTimeout(loadOffers, 100));
}