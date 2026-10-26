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

window.allLoadedProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    createProductModalHTML();
});

let allLoadedProducts = [];

// دالة توحيد النصوص: بتشيل المسافات الزيادة وتوحد الحروف
function normalizeStrict(str) {
    return (str || '').toString().trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '');
}

async function fetchProducts() {
    const productsGrid = document.getElementById('productsGrid') || 
                         document.getElementById('featuredProductsGrid') || 
                         document.querySelector('.products-grid');

    if (!productsGrid) return;

    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const products = await response.json();
        
        if (!Array.isArray(products)) {
            console.error('Expected array of products, got:', products);
            return;
        }

        allLoadedProducts = products;

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
    // المحاولة 1: مطابقة تامة
    let matched = filteredProducts.filter(p => normalizeText(p.category) === categoryQuery);

    // المحاولة 2: مطابقة جزئية
    if (matched.length === 0) {
        matched = filteredProducts.filter(p =>
            normalizeText(p.category).includes(categoryQuery) ||
            categoryQuery.includes(normalizeText(p.category))
        );
    }

    // المحاولة 3: مطابقة بعد حذف كل المسافات والرموز
    if (matched.length === 0) {
        const strictQuery = normalizeStrict(urlParams.get('category'));
        matched = filteredProducts.filter(p => normalizeStrict(p.category) === strictQuery);
    }

    filteredProducts = matched;
}

        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px; background: #1a1a1a; border-radius: 8px;">
                    <i class="fa-solid fa-box-open" style="font-size: 3rem; margin-bottom: 10px; color: #E60000;"></i>
                    <p style="font-size: 1.1rem;">لا توجد منتجات معروضة حالياً</p>
                </div>`;
            return;
        }

        renderProducts(filteredProducts, productsGrid);
    } catch (error) {
        console.error('Error fetching products:', error);
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #ff4d4d; padding: 20px;">
                <p>تعذر تحميل المنتجات. يرجى إعادة تحديث الصفحة.</p>
            </div>`;
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

        let mainImg = 'https://via.placeholder.com/200';
        if (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) {
            mainImg = product.images[0];
        } else if (product.image) {
            mainImg = product.image;
        }

        const safeNameForCart = String(displayName).replace(/'/g, "\\'").replace(/"/g, '&quot;');

                return `
            <div class="product-card" onclick="openProductModalById('${product._id}')" style="cursor: pointer;">
                <div class="product-image">
                    <img src="${mainImg}" alt="${safeNameForCart}" loading="lazy" onerror="this.src='https://via.placeholder.com/200'">
                </div>
                <div class="product-info">
                    <span class="product-category">${category}</span>
                    <h3 class="product-title">${displayName}</h3>
                    <div class="product-price">${price} ${currentLang === 'ar' ? 'ج.م' : 'EGP'}</div>
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${product._id}', '${safeNameForCart}', ${price}, '${mainImg}')">
                        <i class="fa-solid fa-cart-shopping"></i> <span data-en="Add to Cart" data-ar="أضف للسلة">Add to Cart</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function openProductModalById(id) {
    const product = allLoadedProducts.find(p => String(p._id) === String(id));
    if (product) {
        openProductModal(product);
    }
}

// Modal Generation & Logic
function createProductModalHTML() {
    if (document.getElementById('productDetailModal')) return;

    const modalHTML = `
      <div class="product-modal-backdrop" id="productDetailModal" onclick="closeProductModal(event)">
        <div class="product-modal-content" onclick="event.stopPropagation()">
          <button class="product-modal-close" onclick="closeProductModal()"><i class="fa-solid fa-xmark"></i></button>
          
          <div class="product-modal-gallery">
            <div class="product-modal-main-wrap">
              <img id="modalMainImg" src="" class="product-modal-main-img" alt="Product Image">
            </div>
            <div class="product-modal-thumbs" id="modalThumbs"></div>
          </div>

          <div class="product-modal-info">
            <span class="product-modal-cat" id="modalCat">CATEGORY</span>
            <h2 class="product-modal-title" id="modalTitle">Product Title</h2>
            <div class="product-modal-price" id="modalPrice">0 EGP</div>
            <div class="product-modal-desc" id="modalDesc">No details available.</div>
            
            <button class="product-modal-add-btn" id="modalAddBtn">
              <i class="fa-solid fa-cart-shopping"></i>
              <span data-en="ADD TO CART" data-ar="أضف إلى السلة">ADD TO CART</span>
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function openProductModal(product) {
    const currentLang = localStorage.getItem('lang') || 'en';

    const modal = document.getElementById('productDetailModal');
    const mainImg = document.getElementById('modalMainImg');
    const thumbsContainer = document.getElementById('modalThumbs');
    const cat = document.getElementById('modalCat');
    const title = document.getElementById('modalTitle');
    const price = document.getElementById('modalPrice');
    const desc = document.getElementById('modalDesc');
    const addBtn = document.getElementById('modalAddBtn');

    const displayName = currentLang === 'ar' ? (product.nameAr || product.name) : (product.name || product.nameAr);
    const descriptionText = currentLang === 'ar' ? (product.descriptionAr || product.description) : (product.description || product.descriptionAr);
    
    // إعداد واستخراج كل الصور بدون تكرار
    let imageList = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
        imageList = product.images.filter(img => img && typeof img === 'string');
    }
    if (imageList.length === 0 && product.image) {
        imageList = [product.image];
    }
    // إزالة الصور المكررة إن وجدت
    imageList = Array.from(new Set(imageList));

    const firstImg = imageList[0] || 'https://via.placeholder.com/300';
    mainImg.src = firstImg;

    // بناء المصغرات وتفعيل إمكانية الضغط والتبديل المباشر
    thumbsContainer.innerHTML = '';
    if (imageList.length > 1) {
        imageList.forEach((imgUrl, index) => {
            const thumb = document.createElement('img');
            thumb.src = imgUrl;
            thumb.alt = `Thumbnail ${index + 1}`;
            thumb.className = `product-modal-thumb ${index === 0 ? 'active' : ''}`;
            
            thumb.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                // تأثير تبديل الصورة بسلاسة
                mainImg.style.opacity = '0.3';
                setTimeout(() => {
                    mainImg.src = imgUrl;
                    mainImg.style.opacity = '1';
                }, 120);

                const allThumbs = thumbsContainer.querySelectorAll('.product-modal-thumb');
                allThumbs.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });

            thumbsContainer.appendChild(thumb);
        });
    }

    cat.innerText = product.category || 'SUPPLEMENT';
    title.innerText = displayName;
    price.innerText = `${product.price || 0} ${currentLang === 'ar' ? 'ج.م' : 'EGP'}`;
    desc.innerText = descriptionText || (currentLang === 'ar' ? 'لا توجد تفاصيل إضافية للمنتج.' : 'No additional details available for this product.');

    addBtn.onclick = () => {
        addToCart(product._id, displayName, product.price || 0, firstImg);
        closeProductModal();
    };

    if (modal) modal.classList.add('active');
}

function closeProductModal(e) {
    if (!e || e.target.id === 'productDetailModal' || e.target.closest('.product-modal-close')) {
        const modal = document.getElementById('productDetailModal');
        if (modal) modal.classList.remove('active');
    }
}