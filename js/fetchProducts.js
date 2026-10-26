/* ==========================================================================
   BIG MUSCLE STORE - FETCH PRODUCTS & RENDER GRID (v7.0 Safe Loader)
   ========================================================================== */

window.allLoadedProducts = [];

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
   BIG MUSCLE STORE - FETCH PRODUCTS & CARD CLICK FIX
   ========================================================================== */

window.allLoadedProducts = [];

document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderProducts();
});

// Fallback if DOM is already loaded
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  fetchAndRenderProducts();
}

async function fetchAndRenderProducts() {
  const gridContainer = document.getElementById('productsGrid') 
                     || document.getElementById('featuredProductsGrid')
                     || document.querySelector('.products-grid');

  if (!gridContainer) return;

  try {
    let response = await fetch('/api/products');
    if (!response.ok) {
      response = await fetch('https://bigmuscle-api.vercel.app/api/products');
    }
    if (!response.ok) throw new Error('Failed to load products');

    const products = await response.json();
    window.allLoadedProducts = products;

    // Read URL Parameters for filtering
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
    gridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ff4d4d;">Failed to load products.</div>`;
  }
}

function renderProductsGrid(container, products) {
  if (!products || products.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; color: #a0a0a0;">
        <h3 style="margin-bottom: 10px; color: #fff;">No products found</h3>
      </div>
    `;
    return;
  }

  const lang = localStorage.getItem('lang') || 'en';

  container.innerHTML = products.map(product => {
    const title = lang === 'ar' ? (product.nameAr || product.name) : product.name;
    const mainImg = (product.images && product.images.length > 0) ? product.images[0] : (product.image || 'images/logo.png');
    const pId = String(product._id);

    return `
      <div class="product-card" onclick="window.openProductModal('${pId}')" style="cursor: pointer;">
        <div class="product-image">
          <img src="${mainImg}" alt="${title}">
          <button class="add-to-cart-btn" onclick="window.handleCardCartClick(event, '${pId}')">
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

// Separate helper function for Add to Cart button on card
window.handleCardCartClick = function(e, productId) {
  if (e) e.stopPropagation(); // Prevents opening modal when clicking Add to Cart
  const products = window.allLoadedProducts || [];
  const product = products.find(p => String(p._id) === String(productId));
  if (product && typeof addToCart === 'function') {
    const mainImg = (product.images && product.images.length > 0) ? product.images[0] : (product.image || 'images/logo.png');
    addToCart(product._id, product.name, product.nameAr, product.price, mainImg);
  }
};