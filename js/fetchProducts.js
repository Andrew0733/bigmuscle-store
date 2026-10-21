document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    createProductModalHTML();
});

let currentModalProduct = null;

async function fetchProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    try {
        const response = await fetch('/api/products');
        const products = await response.json();

        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search')?.toLowerCase();
        const categoryQuery = urlParams.get('category');

        let filteredProducts = products;

        if (searchQuery) {
            filteredProducts = filteredProducts.filter(p => 
                (p.name && p.name.toLowerCase().includes(searchQuery)) ||
                (p.nameAr && p.nameAr.toLowerCase().includes(searchQuery)) ||
                (p.category && p.category.toLowerCase().includes(searchQuery))
            );
        }

        if (categoryQuery) {
            filteredProducts = filteredProducts.filter(p => 
                p.category && p.category.toLowerCase() === categoryQuery.toLowerCase()
            );
        }

        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px;">
                    <i class="fa-solid fa-box-open" style="font-size: 3rem; margin-bottom: 10px;"></i>
                    <p data-en="No products found" data-ar="لا توجد منتجات مطابقة">لا توجد منتجات مطابقة</p>
                </div>`;
            return;
        }

        renderProducts(filteredProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        productsGrid.innerHTML = '<p style="color:red; text-align:center;">Failed to load products.</p>';
    }
}

function renderProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    const currentLang = localStorage.getItem('lang') || 'en';

    productsGrid.innerHTML = products.map(product => {
        const name = currentLang === 'ar' ? product.nameAr : product.name;
        const mainImg = (product.images && product.images.length > 0) ? product.images[0] : (product.image || '');

        return `
            <div class="product-card" onclick="openProductModal(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                <div class="product-image">
                    <img src="${mainImg}" alt="${name}" loading="lazy" onerror="this.src='https://via.placeholder.com/200'">
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${product._id}', '${name.replace(/'/g, "\\'")}', ${product.price}, '${mainImg}')">
                        <i class="fa-solid fa-cart-shopping"></i> <span data-en="Add to Cart" data-ar="أضف للسلة">Add to Cart</span>
                    </button>
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-title">${name}</h3>
                    <div class="product-price">${product.price} EGP</div>
                </div>
            </div>
        `;
    }).join('');
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
    currentModalProduct = product;
    const currentLang = localStorage.getItem('lang') || 'en';

    const modal = document.getElementById('productDetailModal');
    const mainImg = document.getElementById('modalMainImg');
    const thumbsContainer = document.getElementById('modalThumbs');
    const cat = document.getElementById('modalCat');
    const title = document.getElementById('modalTitle');
    const price = document.getElementById('modalPrice');
    const desc = document.getElementById('modalDesc');
    const addBtn = document.getElementById('modalAddBtn');

    const name = currentLang === 'ar' ? product.nameAr : product.name;
    const descriptionText = currentLang === 'ar' ? (product.descriptionAr || product.description) : (product.description || product.descriptionAr);
    
    // Images Gallery
    let imageList = (product.images && product.images.length > 0) ? product.images : [product.image];
    imageList = imageList.filter(Boolean);

    mainImg.src = imageList[0] || 'https://via.placeholder.com/300';

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
    title.innerText = name;
    price.innerText = `${product.price} ${currentLang === 'ar' ? 'ج.م' : 'EGP'}`;
    desc.innerText = descriptionText || (currentLang === 'ar' ? 'لا توجد تفاصيل إضافية للمنتج.' : 'No additional details available for this product.');

    addBtn.onclick = () => {
        addToCart(product._id, name, product.price, imageList[0]);
        closeProductModal();
    };

    modal.classList.add('active');
}

function closeProductModal(e) {
    if (!e || e.target.id === 'productDetailModal' || e.target.closest('.product-modal-close')) {
        const modal = document.getElementById('productDetailModal');
        if (modal) modal.classList.remove('active');
    }
}