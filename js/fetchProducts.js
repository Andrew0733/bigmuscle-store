async function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    try {
        const response = await fetch('/api/products');
        let products = await response.json();

        // قراءة اللينك (هل العميل دايس على قسم؟ ولا عامل بحث؟)
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        const searchParam = urlParams.get('search'); // الكلمة المبحوث عنها
        
        const isAr = document.body.classList.contains('rtl');
        const catTitle = document.getElementById('category-title');

        // فلترة بناءً على القسم أو البحث
        if (categoryParam) {
            products = products.filter(p => p.category === categoryParam);
            if (catTitle) {
                const arabicTitles = { "Whey Protein": "واي بروتين", "Creatine": "كرياتين", "Pre-Workout": "قبل التمرين" };
                catTitle.textContent = isAr ? (arabicTitles[categoryParam] || categoryParam) : categoryParam.toUpperCase();
            }
        } else if (searchParam) {
            // لو العميل عامل بحث
            const lowerQuery = searchParam.toLowerCase();
            products = products.filter(p => 
                (p.name && p.name.toLowerCase().includes(lowerQuery)) || 
                (p.nameAr && p.nameAr.toLowerCase().includes(lowerQuery)) ||
                (p.category && p.category.toLowerCase().includes(lowerQuery))
            );
            if (catTitle) {
                catTitle.textContent = isAr ? `نتائج البحث عن: "${searchParam}"` : `SEARCH RESULTS: "${searchParam}"`;
            }
        } else if (catTitle) {
            catTitle.textContent = isAr ? 'كل المنتجات' : 'ALL PRODUCTS';
        }

        // لو مفيش نتيجة للبحث
        if (products.length === 0) {
            const emptyMsg = searchParam 
                ? (isAr ? 'لم يتم العثور على منتجات مطابقة لبحثك.' : 'No products matched your search.')
                : (isAr ? 'لا توجد منتجات حالياً.' : 'No products available.');
                
            productsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888; font-size: 1.2rem;">${emptyMsg}</p>`;
            return;
        }

        // رسم المنتجات
        productsGrid.innerHTML = products.map(product => {
            const productName = isAr ? (product.nameAr || product.name) : product.name;
            const currency = isAr ? 'ج.م' : 'EGP';
            const btnText = isAr ? 'أضف للسلة' : 'Add to Cart';

            return `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.image}" alt="${productName}" onerror="this.src='https://via.placeholder.com/200?text=Big+Muscle'" style="max-width:100%; max-height:100%; object-fit:contain;">
                    </div>
                    <h3 class="product-name">${productName}</h3>
                    <p class="product-desc" style="color:var(--primary-red); font-weight:bold;">${product.category}</p>
                    <div class="product-price">
                        <span class="price-val">${product.price}</span>
                        <span class="currency">${currency}</span>
                    </div>
                    <button class="btn btn-outline" onclick="addToCart('${product._id}', '${productName}', ${product.price}, '${product.image}')">${btnText}</button>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error('Error loading products:', err);
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red;">فشل في تحميل المنتجات من السيرفر</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadProducts);

const langBtnToggle = document.getElementById('lang-toggle');
if (langBtnToggle) {
    langBtnToggle.addEventListener('click', () => {
        setTimeout(loadProducts, 50);
    });
}