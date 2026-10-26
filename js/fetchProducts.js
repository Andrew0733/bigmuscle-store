/* ==========================================================================
   BIG MUSCLE STORE - FETCH PRODUCTS & RENDER GRID (v7.0 Safe Loader)
   ========================================================================== */

//window.allLoadedProducts = [];

// Guarantee execution regardless of when script is loaded
/*function safeInitProducts() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchAndRenderProducts);
  } else {
    fetchAndRenderProducts();
  }
}

safeInitProducts();

async function fetchAndRenderProducts() {
  const gridContainer = document.getElementById('productsGrid') 
                     || document.getElementById('featuredProductsGrid')
                     || document.querySelector('.products-grid');

  if (!gridContainer) return;

  gridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #E60000; font-size: 1.1rem;"><i class="fas fa-spinner fa-spin"></i> Loading products...</div>`;

  try {
    let response = await fetch('/api/products');
    if (!response.ok) {
      response = await fetch('https://bigmuscle-api.vercel.app/api/products');
    }
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const products = await response.json();
    window.allLoadedProducts = products;

    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');

    let filtered = products;

    if (categoryParam) {
      const cleanParam = categoryParam.toLowerCase().replace(/[^a-z0-9]/g, '');
      const categoryMatches = products.filter(p => {
        const pCat = (p.category || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return pCat === cleanParam || pCat.includes(cleanParam) || cleanParam.includes(pCat);
      });
      if (categoryMatches.length > 0) {
        filtered = categoryMatches;
      }
    }

    if (searchParam) {
      const q = searchParam.toLowerCase().trim();
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.nameAr && p.nameAr.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    renderProductsGrid(gridContainer, filtered);
  } catch (error) {
    console.error('Error fetching products:', error);
    gridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ff4d4d;">Failed to load products. Please refresh the page.</div>`;
  }
}

function renderProductsGrid(container, products) {
  if (!products || products.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; color: #a0a0a0;">
        <h3 style="margin-bottom: 10px; color: #fff;">No products found</h3>
        <a href="products.html" style="color: #E60000; text-decoration: underline;">View all products</a>
      </div>
    `;
    return;
  }

  const lang = localStorage.getItem('lang') || 'en';

  container.innerHTML = products.map(product => {
    const title = lang === 'ar' ? (product.nameAr || product.name) : product.name;
    const mainImg = (product.images && product.images.length > 0) ? product.images[0] : (product.image || 'images/logo.png');

    return `
      <div class="product-card" onclick="window.openProductModal('${product._id}')">
        <div class="product-image">
          <img src="${mainImg}" alt="${title}">
          <button class="add-to-cart-btn" onclick="window.handleCardAddToCart(event, '${product._id}')">
            <i class="fas fa-shopping-cart"></i> Add to Cart
          </button>
        </div>
        <div class="product-info">
          <span class="product-category">${product.category || ''}</span>
          <h3 class="product-title">${title}</h3>
          <div class="product-price">${product.price} EGP</div>
        </div>
      </div>
    `;
  }).join('');
}

window.handleCardAddToCart = function(e, productId) {
  if (e) e.stopPropagation();
  const product = (window.allLoadedProducts || []).find(p => String(p._id) === String(productId));
  if (product && typeof addToCart === 'function') {
    const mainImg = (product.images && product.images.length > 0) ? product.images[0] : (product.image || 'images/logo.png');
    addToCart(product._id, product.name, product.nameAr, product.price, mainImg);
  }
};*/

/* ==========================================================================
   BIG MUSCLE STORE - FETCH PRODUCTS & RENDER GRID
   ========================================================================== */

/* ==========================================================================
   BIG MUSCLE STORE - FETCH PRODUCTS (Unified & Cleaned)
   ========================================================================== */

window.allLoadedProducts = [];

document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
});

// Fallback execution if DOM is ready
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  fetchProducts();
}

// Helper Text Normalizers for Category Matching
function normalizeText(str) {
  return (str || '').toString().trim().toLowerCase();
}

function normalizeStrict(str) {
  return (str || '').toString().trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '');
}

async function fetchProducts() {
  const productsGrid = document.getElementById('productsGrid') || 
                       document.getElementById('featuredProductsGrid') || 
                       document.querySelector('.products-grid');

  if (!productsGrid) return;

  try {
    let response = await fetch('/api/products');
    if (!response.ok) {
      response = await fetch('https://bigmuscle-api.vercel.app/api/products');
    }
    if (!response.ok) throw new Error('Network response was not ok');

    const products = await response.json();

    if (!Array.isArray(products)) {
      console.error('Expected array of products, got:', products);
      return;
    }

    window.allLoadedProducts = products;

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = normalizeText(urlParams.get('search'));
    const categoryQuery = normalizeText(urlParams.get('category'));

    let filteredProducts = [...products];

    if (searchQuery) {
      filteredProducts = filteredProducts.filter(p => {
        const nameEn = normalizeText(p.name);
        const nameAr = normalizeText(p.nameAr);
        const cat = normalizeText(p.category);
        return nameEn.includes(searchQuery) || nameAr.includes(searchQuery) || cat.includes(searchQuery);
      });
    }

    if (categoryQuery) {
      let matched = filteredProducts.filter(p => normalizeText(p.category) === categoryQuery);

      if (matched.length === 0) {
        matched = filteredProducts.filter(p => 
          normalizeText(p.category).includes(categoryQuery) || 
          categoryQuery.includes(normalizeText(p.category))
        );
      }

      if (matched.length === 0) {
        const strictQuery = normalizeStrict(urlParams.get('category'));
        matched = filteredProducts.filter(p => normalizeStrict(p.category) === strictQuery);
      }

      filteredProducts = matched;
    }

    if (filteredProducts.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: #aaa; padding: 40px; background: #141414; border-radius: 8px;">
          <i class="fa-solid fa-box-open" style="font-size: 3rem; margin-bottom: 10px; color: #E60000;"></i>
          <p style="font-size: 1.1rem;">لا توجد منتجات معروضة حالياً</p>
        </div>
      `;
      return;
    }

    renderProducts(filteredProducts, productsGrid);
  } catch (error) {
    console.error('Error fetching products:', error);
    productsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: #ff4d4d; padding: 20px;">
        <p>تعذر تحميل المنتجات، يرجى إعادة المحاولة.</p>
      </div>
    `;
  }
}

function renderProducts(products, container) {
  const currentLang = localStorage.getItem('lang') || 'en';

  container.innerHTML = products.map(product => {
    const nameAr = product.nameAr || product.name || 'منتج بدون اسم';
    const nameEn = product.name || product.nameAr || 'Unnamed Product';
    const displayName = currentLang === 'ar' ? nameAr : nameEn;

    const price = product.price || 0;
    const category = product.category || 'General';

    let mainImg = 'https://via.placeholder.com/300';
    if (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) {
      mainImg = product.images[0];
    } else if (product.image) {
      mainImg = product.image;
    }

    const safeNameForCart = String(displayName).replace(/'/g, "\\'").replace(/"/g, "&quot;");
    const productIdStr = String(product._id);

    return `
      <div class="product-card" onclick="openProductModalById('${productIdStr}')" style="cursor: pointer;">
        <div class="product-image">
          <img src="${mainImg}" alt="${safeNameForCart}" loading="lazy" onerror="this.src='https://via.placeholder.com/300'">
        </div>
        <div class="product-info">
          <span class="product-category">${category}</span>
          <h3 class="product-title">${displayName}</h3>
          <div class="product-price">${price} ${currentLang === 'ar' ? 'ج.م' : 'EGP'}</div>
          <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${productIdStr}', '${safeNameForCart}', ${price}, '${mainImg}')">
            <i class="fa-solid fa-cart-shopping"></i>
            <span data-en="Add to Cart" data-ar="أضف لسلة">${currentLang === 'ar' ? 'أضف لسلة' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Function to find product and open unified Modal
window.openProductModalById = function(id) {
  const products = window.allLoadedProducts || [];
  const product = products.find(p => String(p._id) === String(id));
  if (product && typeof window.openProductModal === 'function') {
    window.openProductModal(product._id);
  }
};