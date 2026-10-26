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



/* ==========================================================================
   BIG MUSCLE STORE - MAIN APPLICATION LOGIC (v8.1 Universal Modal Fix)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHamburgerMenu();
  initLangToggle();
  initCartBadge();
  initSearch();
  initModalCloseHandlers();
});

// 1. Mobile Hamburger Menu
function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn') || document.querySelector('.hamburger-btn');
  const navMenu = document.getElementById('navMenu') || document.querySelector('.nav-menu');

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.onclick = function(e) {
      e.stopPropagation();
      navMenu.classList.toggle('active');
    };

    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        navMenu.classList.remove('active');
      }
    });
  }
}

// 2. Language Toggle (Arabic / English)
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

// 3. Update Cart Badge
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

// 5. UNIVERSAL PRODUCT MODAL OPENER
window.openProductModal = function(productId) {
  const products = window.allLoadedProducts || [];
  const product = products.find(p => String(p._id) === String(productId));
  if (!product) return;

  const modal = document.getElementById('productModal');
  if (!modal) return;

  const lang = localStorage.getItem('lang') || 'en';

  // Extract clean images array
  let images = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    images = product.images.filter(img => img && img.trim() !== '');
  }
  if (images.length === 0 && product.image) {
    images = [product.image];
  }
  if (images.length === 0) {
    images = ['images/logo.png'];
  }

  // Multi-selector query to support all HTML templates
  const mainImg = document.getElementById('modalMainImg') 
               || document.getElementById('modalProductImage') 
               || modal.querySelector('.main-image-box img')
               || modal.querySelector('.modal-gallery img');

  const titleEl = document.getElementById('modalTitle') 
               || document.getElementById('modalProductName') 
               || modal.querySelector('.modal-details h2')
               || modal.querySelector('h2');

  const priceEl = document.getElementById('modalPrice') 
               || document.getElementById('modalProductPrice') 
               || modal.querySelector('.modal-details .product-price')
               || modal.querySelector('.product-price');

  const catEl   = document.getElementById('modalCategory') 
               || document.getElementById('modalProductCategory') 
               || modal.querySelector('.modal-details .product-category')
               || modal.querySelector('.product-category');

  const descEl  = document.getElementById('modalDescription') 
               || document.getElementById('modalProductDescription') 
               || modal.querySelector('.modal-details p')
               || modal.querySelector('p');

  const thumbsContainer = document.getElementById('modalThumbnails') 
                       || document.getElementById('modalProductThumbnails')
                       || modal.querySelector('.thumbnails-row');

  const cartBtn = document.getElementById('modalAddToCartBtn') 
               || document.getElementById('modalAddCart')
               || modal.querySelector('.add-to-cart-btn');

  // Fill Modal Elements
  if (mainImg) mainImg.src = images[0];

  if (thumbsContainer) {
    if (images.length > 1) {
      thumbsContainer.innerHTML = images.map((imgUrl, idx) => `
        <img src="${imgUrl}" class="thumb-img ${idx === 0 ? 'active' : ''}" onclick="window.changeModalImage('${imgUrl}', this)">
      `).join('');
      thumbsContainer.style.display = 'flex';
    } else {
      thumbsContainer.innerHTML = '';
      thumbsContainer.style.display = 'none';
    }
  }

  if (catEl) catEl.textContent = product.category || '';
  
  const prodName = lang === 'ar' ? (product.nameAr || product.name) : product.name;
  if (titleEl) titleEl.textContent = prodName || 'Product';

  if (priceEl) priceEl.textContent = `${product.price || 0} EGP`;

  const prodDesc = lang === 'ar' ? (product.descriptionAr || product.description) : product.description;
  if (descEl) descEl.textContent = prodDesc || (lang === 'ar' ? 'لا يوجد وصف متاح' : 'No detailed description available.');

  // Attach Add to Cart Event
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
  const modal = document.getElementById('productModal');
  if (!modal) return;

  const mainImg = document.getElementById('modalMainImg') 
               || document.getElementById('modalProductImage') 
               || modal.querySelector('.main-image-box img');

  if (mainImg) mainImg.src = imgUrl;

  const thumbs = modal.querySelectorAll('.thumb-img');
  thumbs.forEach(el => el.classList.remove('active'));
  if (thumbEl) thumbEl.classList.add('active');
};

function initModalCloseHandlers() {
  const closeModalBtn = document.getElementById('closeModalBtn') || document.querySelector('.modal-close-btn');
  const modal = document.getElementById('productModal');

  if (closeModalBtn) closeModalBtn.onclick = closeProductModal;
  if (modal) {
    modal.onclick = function(e) {
      if (e.target === modal) closeProductModal();
    };
  }
}