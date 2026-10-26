/* ==========================================================================
   BIG MUSCLE STORE - MAIN APPLICATION LOGIC (v8.0 Dynamic Modal & Nav Fix)
   ========================================================================== */

// Global Mobile Menu Toggle
/*window.toggleMobileMenu = function() {
  const navMenu = document.getElementById('navMenu') || document.querySelector('.nav-menu');
  if (navMenu) {
    navMenu.classList.toggle('active');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initHamburgerMenu();
  initLangToggle();
  initCartBadge();
  initSearch();
  ensureModalExists();
});

function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn') || document.querySelector('.hamburger-btn');
  const navMenu = document.getElementById('navMenu') || document.querySelector('.nav-menu');

  if (hamburgerBtn) {
    hamburgerBtn.onclick = function(e) {
      e.stopPropagation();
      window.toggleMobileMenu();
    };
  }

  document.addEventListener('click', (e) => {
    if (navMenu && navMenu.classList.contains('active')) {
      if (!navMenu.contains(e.target) && hamburgerBtn && !hamburgerBtn.contains(e.target)) {
        navMenu.classList.remove('active');
      }
    }
  });
}

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

function initCartBadge() {
  const cart = JSON.parse(localStorage.getItem('bigmuscle_cart')) || [];
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const badgeEl = document.getElementById('cartBadge');
  if (badgeEl) {
    badgeEl.textContent = totalCount;
  }
}

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

// Ensures the Modal HTML element exists dynamically on any page
function ensureModalExists() {
  if (document.getElementById('productModal')) return;

  const modalHtml = `
    <div class="modal-overlay" id="productModal">
      <div class="modal-content">
        <button class="modal-close-btn" onclick="window.closeProductModal()">&times;</button>
        <div class="modal-gallery">
          <div class="main-image-box">
            <img id="modalMainImg" src="" alt="Product Detail">
          </div>
          <div class="thumbnails-row" id="modalThumbnails"></div>
        </div>
        <div class="modal-details">
          <span class="product-category" id="modalCategory">Category</span>
          <h2 id="modalTitle" style="color: #fff; font-family: var(--font-heading); font-size: 1.4rem;">Product Title</h2>
          <div class="product-price" id="modalPrice" style="font-size: 1.3rem; font-weight: 800; color: var(--primary-color);">0 EGP</div>
          <p id="modalDescription" style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin: 10px 0;">Description...</p>
          <button id="modalAddToCartBtn" class="add-to-cart-btn" style="position: static !important; width: 100% !important; height: 42px !important; transform: none !important; opacity: 1 !important; font-size: 0.95rem !important; border-radius: 8px !important;">
            <i class="fas fa-shopping-cart"></i> <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modal = document.getElementById('productModal');
  modal.onclick = function(e) {
    if (e.target === modal) window.closeProductModal();
  };
}

// Global Product Modal Functions
window.openProductModal = function(productId) {
  ensureModalExists();

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
};*/

/* ==========================================================================
   BIG MUSCLE STORE - MAIN JS (Step 1: Direct Hamburger Toggle)
   ========================================================================== */

// Global Toggle Function for Mobile Menu
window.toggleMobileMenu = function(e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  
  const navMenu = document.getElementById('navMenu') || document.querySelector('.nav-menu');
  if (!navMenu) return;

  const isRtl = document.body.classList.contains('rtl');
  const isOpen = navMenu.classList.contains('active');

  if (isOpen) {
    navMenu.classList.remove('active');
    navMenu.style.transform = isRtl ? 'translateX(-100%)' : 'translateX(100%)';
  } else {
    navMenu.classList.add('active');
    navMenu.style.transform = 'translateX(0)';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initHamburger();
  initLangToggle();
  initCartBadge();
  initSearch();
});

function initHamburger() {
  const hamburgerBtn = document.getElementById('hamburgerBtn') || document.querySelector('.hamburger-btn');
  const navMenu = document.getElementById('navMenu') || document.querySelector('.nav-menu');

  if (hamburgerBtn) {
    hamburgerBtn.onclick = window.toggleMobileMenu;
  }

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (navMenu && navMenu.classList.contains('active')) {
      if (!navMenu.contains(e.target) && hamburgerBtn && !hamburgerBtn.contains(e.target)) {
        const isRtl = document.body.classList.contains('rtl');
        navMenu.classList.remove('active');
        navMenu.style.transform = isRtl ? 'translateX(-100%)' : 'translateX(100%)';
      }
    }
  });
}

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

function initCartBadge() {
  const cart = JSON.parse(localStorage.getItem('bigmuscle_cart')) || [];
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const badgeEl = document.getElementById('cartBadge');
  if (badgeEl) {
    badgeEl.textContent = totalCount;
  }
}

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
