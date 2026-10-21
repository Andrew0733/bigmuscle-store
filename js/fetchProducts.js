document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    createProductModalHTML();
});

let allLoadedProducts = [];

async function fetchProducts() {
    // دعم الصفحة الرئيسية وصفحة المنتجات معاً
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
        const searchQuery = urlParams.get('search')?.toLowerCase().trim();
        const categoryQuery = urlParams.get('category')?.toLowerCase().trim();

        let filteredProducts = [...products];

        if (searchQuery) {
            filteredProducts = filteredProducts.filter(p => {
                const nameEn = (p.name || '').toLowerCase();
                const nameAr = (p.nameAr || '').toLowerCase();
                const cat = (p.category || '').toLowerCase();
                return nameEn.includes(searchQuery) || nameAr.includes(searchQuery) || cat.includes(searchQuery);
            });
        }

        if (categoryQuery) {
            filteredProducts = filteredProducts.filter(p => 
                (p.category || '').toLowerCase() === categoryQuery
            );
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
        // حماية البيانات الناقصة من الكراش
        const nameAr = product.nameAr || product.name || 'منتج بدون اسم';
        const nameEn = product.name || product.nameAr || 'Unnamed Product';
        const displayName = currentLang === 'ar' ? nameAr : nameEn;
        
        const price = product.price || 0;
        const category = product.category || 'General';

        // استخراج الصورة الرئيسية
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
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${product._id}', '${safeNameForCart}', ${price}, '${mainImg}')">
                        <i class="fa-solid fa-cart-shopping"></i> <span data-en="Add to Cart" data-ar="أضف للسلة">Add to Cart</span>
                    </button>
                </div>
                <div class="product-info">
                    <span class="product-category">${category}</span>
                    <h3 class="product-title">${displayName}</h3>
                    <div class="product-price">${price} ${currentLang === 'ar' ? 'ج.م' : 'EGP'}</div>
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
            <img id="modalMainImg" src="" class="product-modal-main-img" alt="Product Image">
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
    
    // Images Gallery
    let imageList = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
        imageList = product.images.filter(Boolean);
    } else if (product.image) {
        imageList = [product.image];
    }

    const firstImg = imageList[0] || 'https://via.placeholder.com/300';
    mainImg.src = firstImg;

    thumbsContainer.innerHTML = '';
    if (imageList.length > 1) {
        imageList.forEach((imgUrl, index) => {
            const thumb = document.createElement('img');
            thumb.src = imgUrl;
            thumb.className = `product-modal-thumb ${index === 0 ? 'active' : ''}`;
            thumb.onclick = () => {
                mainImg.src = imgUrl;
                document.querySelectorAll('.product-modal-thumb').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            };
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