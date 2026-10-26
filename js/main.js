/* ==========================================================================
   BIG MUSCLE STORE - MAIN APPLICATION LOGIC (v7.0)
   ========================================================================== */

function safeInitMain() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}

safeInitMain();

function initApp() {
  initHamburgerMenu();
  initLangToggle();
  initCartBadge();
  initModalCloseHandlers();
  initSearch();
}

// 1. Mobile Hamburger Menu Toggle
function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn') 
                    || document.querySelector('.hamburger-btn');
  const navMenu = document.getElementById('navMenu') 
               || document.querySelector('.nav-menu');

  if (!hamburgerBtn || !navMenu) return;

  hamburgerBtn.onclick = function(e) {
    e.stopPropagation();
    e.preventDefault();
    navMenu.classList.toggle('active');
  };

  document.onclick = function(e) {
    if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      navMenu.classList.remove('active');
    }
  };
}

// 2. Language Toggle
function initLangToggle() {
  const langToggleBtn = document.getElementById('langToggle');
  const currentLang = localStorage.getItem('lang') || 'en';
  
  if (currentLang === 'ar') {
    document.body.classList.add('rtl');
    if (langToggleBtn) langToggleBtn.textContent = 'EN';
  } else {
    document.body.classList.remove('rtl');
    if (langToggleBtn) langToggleBtn.textContent = 'AR';
  }

  if (langToggleBtn) {
    langToggleBtn.onclick = function() {
      const isRtl = document.body.classList.toggle('rtl');
      const newLang = isRtl ? 'ar' : 'en';
      localStorage.setItem('lang', newLang);
      langToggleBtn.textContent = isRtl ? 'EN' : 'AR';
      location.reload();
    };
  }
}

// 3. Update Cart Badge Counter
function initCartBadge() {
  const cart = JSON.parse(localStorage.getItem('bigmuscle_cart')) || [];
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const badgeEl = document.getElementById('cartBadge');
  if (badgeEl) {
    badgeEl.textContent = totalCount;
  }
}

// 4. Search Handler
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  const executeSearch = () => {
    const query = searchInput ? searchInput.value.trim() : '';
    if (query) {
      window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
  };

  if (searchBtn) searchBtn.onclick = executeSearch;
  if (searchInput) {
    searchInput.onkeypress = function(e) {
      if (e.key === 'Enter') executeSearch();
    };
  }
}

// 5. Product Modal Global Functions
window.openProductModal = function(productId) {
  const products = window.allLoadedProducts || [];
  const product = products.find(p => String(p._id) === String(productId));
  if (!product) return;

  const modal = document.getElementById('productModal');
  if (!modal) return;

  const lang = localStorage.getItem('lang') || 'en';
  const images = (product.images && product.images.length > 0) ? product.images : [product.image || 'images/logo.png'];

  const mainImg = document.getElementById('modalMainImg');
  const thumbsContainer = document.getElementById('modalThumbnails');
  const catEl = document.getElementById('modalCategory');
  const titleEl = document.getElementById('modalTitle');
  const priceEl = document.getElementById('modalPrice');
  const descEl = document.getElementById('modalDescription');
  const cartBtn = document.getElementById('modalAddToCartBtn');

  if (mainImg) mainImg.src = images[0];
  if (thumbsContainer) {
    thumbsContainer.innerHTML = images.map((imgUrl, idx) => `
      <img src="${imgUrl}" class="thumb-img ${idx === 0 ? 'active' : ''}" onclick="window.changeModalImage('${imgUrl}', this)">
    `).join('');
  }

  if (catEl) catEl.textContent = product.category || '';
  if (titleEl) titleEl.textContent = lang === 'ar' ? (product.nameAr || product.name) : product.name;
  if (priceEl) priceEl.textContent = `${product.price} EGP`;
  if (descEl) descEl.textContent = lang === 'ar' ? (product.descriptionAr || product.description || 'لا يوجد وصف متاح') : (product.description || 'No detailed description available.');

  if (cartBtn) {
    cartBtn.onclick = function(e) {
      if (e) e.stopPropagation();
      if (typeof addToCart === 'function') {
        addToCart(product._id, product.name, product.nameAr, product.price, images[0]);
      }
      modal.classList.remove('active');
    };
  }

  modal.classList.add('active');
};

window.closeProductModal = function() {
  const modal = document.getElementById('productModal');
  if (modal) modal.classList.remove('active');
};

window.changeModalImage = function(imgUrl, thumbEl) {
  const mainImg = document.getElementById('modalMainImg');
  if (mainImg) mainImg.src = imgUrl;
  document.querySelectorAll('.thumb-img').forEach(el => el.classList.remove('active'));
  if (thumbEl) thumbEl.classList.add('active');
};

function initModalCloseHandlers() {
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modal = document.getElementById('productModal');

  if (closeModalBtn) closeModalBtn.onclick = closeProductModal;
  if (modal) {
    modal.onclick = function(e) {
      if (e.target === modal) closeProductModal();
    };
  }
}