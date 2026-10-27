/* ==========================================================================
   BIG MUSCLE STORE - FETCH PRODUCTS (Mobile Top-Image Modal Layout)
   ========================================================================== */

window.allLoadedProducts = [];

document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
});

if (document.readyState === 'interactive' || document.readyState === 'complete') {
  fetchProducts();
}

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
      <div class="product-card" onclick="window.openProductModalById('${productIdStr}')" style="cursor: pointer;">
        <div class="product-image">
          <img src="${mainImg}" alt="${safeNameForCart}" loading="lazy" onerror="this.src='https://via.placeholder.com/300'">
        </div>
        <div class="product-info">
          <span class="product-category">${category}</span>
          <h3 class="product-title">${displayName}</h3> <div class="product-price">${price} ${currentLang === 'ar' ? 'ج.م' : 'EGP'}</div>
          
          <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${productIdStr}', '${safeNameForCart}', ${price}, '${mainImg}')">
            <i class="fa-solid fa-cart-shopping"></i>
            <span data-en="Add to Cart" data-ar="أضف لسلة">${currentLang === 'ar' ? 'أضف لسلة' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// SELF-CONTAINED DYNAMIC MODAL (Top Image -> Bottom Details)
window.openProductModalById = function(id) {
  const products = window.allLoadedProducts || [];
  const product = products.find(p => String(p._id) === String(id));
  if (!product) return;

  let modal = document.getElementById('productDetailModal') || document.getElementById('productModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'productDetailModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const currentLang = localStorage.getItem('lang') || 'en';
  const nameAr = product.nameAr || product.name || 'منتج بدون اسم';
  const nameEn = product.name || product.nameAr || 'Unnamed Product';
  const displayName = currentLang === 'ar' ? nameAr : nameEn;
  const desc = currentLang === 'ar' ? (product.descriptionAr || product.description) : product.description;
  const descText = desc || (currentLang === 'ar' ? 'لا يوجد وصف متاح لهذا المنتج.' : 'No additional details available for this product.');
  const price = product.price || 0;
  const category = product.category || 'General';

  let images = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    images = product.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
  }
  if (images.length === 0 && product.image) {
    images = [product.image];
  }
  if (images.length === 0) {
    images = ['https://via.placeholder.com/300'];
  }

  const firstImg = images[0];

  modal.innerHTML = `
    <div class="modal-content-box">
      <button class="modal-close-btn" onclick="window.closeProductModalDirect()">&times;</button>
      
      <!-- TOP: IMAGE GALLERY CONTAINER -->
      <div class="modal-gallery-box">
        <div class="modal-main-img-wrap">
          <img id="directModalMainImg" src="${firstImg}" alt="${displayName}">
        </div>
        ${images.length > 1 ? `
          <div class="modal-thumbs-wrap">
            ${images.map((img, idx) => `
              <img src="${img}" class="modal-thumb-item ${idx===0 ? 'active' : ''}" onclick="document.getElementById('directModalMainImg').src='${img}'">
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- BOTTOM: PRODUCT DETAILS -->
      <div class="modal-details-box">
        <span class="modal-cat-text">${category}</span>
        <h2 class="modal-title-text">${displayName}</h2>
        <div class="modal-price-text">${price} ${currentLang === 'ar' ? 'ج.م' : 'EGP'}</div>
        <div class="modal-desc-box">${descText}</div>
        <button class="modal-cart-btn" onclick="event.stopPropagation(); addToCart('${product._id}', '${displayName.replace(/'/g, "\\'")}', ${price}, '${firstImg}'); window.closeProductModalDirect();">
          <i class="fa-solid fa-cart-shopping"></i> ${currentLang === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
        </button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  modal.classList.add('active');

  modal.onclick = function(e) {
    if (e.target === modal) {
      window.closeProductModalDirect();
    }
  };
};

window.closeProductModalDirect = function() {
  const modal = document.getElementById('productDetailModal') || document.getElementById('productModal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('active');
  }
};