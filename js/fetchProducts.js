// جلب وعرض المنتجات في صفحة المنتجات مع إظهار السعر
async function fetchAndDisplayProducts() {
    const productsGrid = document.getElementById('productsGrid') || document.querySelector('.products-grid');
    if (!productsGrid) return;

    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Network response was not ok');
        const products = await response.json();

        if (products.length === 0) {
            productsGrid.innerHTML = '<p style="text-align: center; color: #888; grid-column: 1/-1;">لا توجد منتجات حالياً / No products found</p>';
            return;
        }

        productsGrid.innerHTML = products.map(product => {
            // تنظيف السعر لضمان ظهوره بشكل رقمي صح
            const rawPrice = product.price || 0;
            const cleanPrice = typeof rawPrice === 'number' ? rawPrice : (parseFloat(String(rawPrice).replace(/[^0-9.]/g, '')) || 0);

            return `
                <div class="product-card" data-id="${product._id || product.id}">
                    <div class="product-img-wrap" onclick="openProductModalById('${product._id || product.id}')" style="cursor: pointer;">
                        <img src="${product.image || 'images/logo.png'}" alt="${product.name}">
                    </div>
                    <div class="product-info" style="padding: 10px; text-align: center;">
                        <span class="product-category" style="color: #E60000; font-size: 11px; font-weight: bold; text-transform: uppercase;">${product.category || 'Supplement'}</span>
                        <h3 class="product-title" onclick="openProductModalById('${product._id || product.id}')" style="cursor: pointer; font-size: 14px; margin: 5px 0; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${product.name}</h3>
                        
                        <!-- سعر المنتج بوضوح -->
                        <div class="product-price" style="font-size: 15px; font-weight: bold; color: #ffffff; margin: 6px 0;">
                            ${cleanPrice.toLocaleString()} EGP
                        </div>

                        <button onclick="addToCart('${product._id || product.id}', '${product.name.replace(/'/g, "\\'")}', ${cleanPrice}, '${product.image}')" class="btn btn-primary add-to-cart-btn" style="width: 100%; padding: 8px; font-size: 13px; margin-top: 5px;">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchAndDisplayProducts);