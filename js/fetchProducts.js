/* ==========================================================================
   BIG MUSCLE STORE - FETCH PRODUCTS & RENDER GRID
   ========================================================================== */

window.allLoadedProducts = [];

document.addEventListener('DOMContentLoaded', () => {
  fetchAndRenderProducts();
});

async function fetchAndRenderProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to fetch products');
    const products = await response.json();
    
    window.allLoadedProducts = products;

    // Check query params for filtering
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const searchParam = urlParams.get('search');

    let filtered = products;

    if (categoryParam) {
      const decodedCat = decodeURIComponent(categoryParam).toLowerCase().replace(/\s+/g, '');
      filtered = filtered.filter(p => {
        const pCat = (p.category || '').toLowerCase().replace(/\s+/g, '');
        return pCat === decodedCat;
      });
    }

    if (searchParam) {
      const query = searchParam.toLowerCase();
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.nameAr && p.nameAr.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query))
      );
    }

    renderProductsGrid(filtered);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

function renderProductsGrid(products) {
  const gridContainer = document.getElementById('productsGrid') || document.getElementById('featuredProductsGrid');
  if (!gridContainer) return;

  if (products.length === 0) {
    gridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #a0a0a0;">No products found</div>`;
    return;
  }

  const lang = localStorage.getItem('lang') || 'en';

  gridContainer.innerHTML = products.map(product => {
    const title = lang === 'ar' ? (product.nameAr || product.name) : product.name;
    const mainImg = (product.images && product.images.length > 0) ? product.images[0] : (product.image || 'images/logo.png');

    return `
      <div class="product-card" onclick="openProductModal('${product._id}')">
        <div class="product-image">
          <img src="${mainImg}" alt="${title}">
          <button class="add-to-cart-btn" onclick="handleCardAddToCart(event, '${product._id}')">
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
  e.stopPropagation(); // Prevents opening modal on button click
  const product = window.allLoadedProducts.find(p => p._id === productId);
  if (product && typeof addToCart === 'function') {
    const mainImg = (product.images && product.images.length > 0) ? product.images[0] : (product.image || 'images/logo.png');
    addToCart(product._id, product.name, product.nameAr, product.price, mainImg);
  }
};