/* ==========================================================================
   BIG MUSCLE STORE - UNIFIED CART SYSTEM (v16.0 Smart Price & Arg Parser)
   ========================================================================== */

function getCart() {
  const keys = ['bigmuscle_cart', 'cart', 'bigmuscleCart'];
  for (let k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch(e) {}
  }
  return [];
}

function saveCart(cart) {
  const keys = ['bigmuscle_cart', 'cart', 'bigmuscleCart'];
  const json = JSON.stringify(cart);
  keys.forEach(k => localStorage.setItem(k, json));
  updateCartBadge();
}

// Smart Add to Cart supporting both 4 and 5 parameters
window.addToCart = function(id, name, nameAr, price, image) {
  let realNameAr = nameAr;
  let realPrice = price;
  let realImage = image;

  // If 4 arguments passed: (id, name, price, image)
  if (typeof nameAr === 'number' || (typeof nameAr === 'string' && !isNaN(parseFloat(nameAr)) && !nameAr.includes('http') && !nameAr.includes('/'))) {
    realImage = price;
    realPrice = parseFloat(nameAr);
    realNameAr = name;
  }

  realPrice = parseFloat(String(realPrice).replace(/[^0-9.]/g, '')) || 0;

  let cart = getCart();
  const cleanId = String(id);

  const existingIndex = cart.findIndex(item => String(item.id || item._id) === cleanId);

  if (existingIndex > -1) {
    cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    if (realPrice > 0) cart[existingIndex].price = realPrice;
  } else {
    cart.push({
      id: cleanId,
      _id: cleanId,
      name: name || 'Product',
      nameAr: realNameAr || name || 'منتج',
      price: realPrice,
      image: realImage || 'images/logo.png',
      quantity: 1
    });
  }

  saveCart(cart);

  const lang = localStorage.getItem('lang') || 'en';
  alert(lang === 'ar' ? 'تمت إضافة المنتج إلى السلة بنجاح!' : 'Product added to cart successfully!');
};

function updateCartBadge() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = totalCount;
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  const cartContainer = document.getElementById('cartItemsContainer') || document.getElementById('cartTableBody');
  if (cartContainer) {
    renderCartPage(cartContainer);
  }
});

function renderCartPage(container) {
  const cart = getCart();
  const lang = localStorage.getItem('lang') || 'en';

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:50px 20px; color:#a0a0a0;">
        <i class="fas fa-shopping-cart" style="font-size:3rem; color:#E60000; margin-bottom:15px;"></i>
        <h3>${lang === 'ar' ? 'السلة فارغة حالياً' : 'Your cart is empty'}</h3>
        <a href="products.html" style="display:inline-block; margin-top:15px; color:#E60000; text-decoration:underline; font-weight:bold;">
          ${lang === 'ar' ? 'تصفح المنتجات وأضف للسلة' : 'Browse Products'}
        </a>
      </div>
    `;
    const subtotalEl = document.getElementById('cartSubtotal');
    if (subtotalEl) subtotalEl.textContent = '0 EGP';
    return;
  }

  let subtotal = 0;
  container.innerHTML = cart.map((item, index) => {
    const itemPrice = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
    const itemQty = item.quantity || 1;
    const itemTotal = itemPrice * itemQty;
    subtotal += itemTotal;

    const title = lang === 'ar' ? (item.nameAr || item.name) : item.name;

    return `
      <div style="display:flex; align-items:center; justify-content:space-between; background:#141414; border:1px solid #262626; border-radius:10px; padding:12px; margin-bottom:12px; gap:12px; flex-wrap:wrap;">
        <img src="${item.image || 'images/logo.png'}" style="width:55px; height:55px; object-fit:contain; background:#fff; border-radius:6px; padding:3px;">
        
        <div style="flex:1; min-width:130px;">
          <h4 style="color:#fff; font-size:0.9rem; margin:0 0 4px 0;">${title}</h4>
          <div style="color:#E60000; font-weight:700; font-size:0.88rem;">${itemPrice} ${lang==='ar'?'ج.م':'EGP'}</div>
        </div>

        <div style="display:flex; align-items:center; gap:6px;">
          <button onclick="window.changeQty(${index}, -1)" style="background:#1f1f1f; border:1px solid #262626; color:#fff; width:28px; height:28px; border-radius:4px; cursor:pointer; font-weight:700;">-</button>
          <span style="color:#fff; font-weight:700; min-width:18px; text-align:center;">${itemQty}</span>
          <button onclick="window.changeQty(${index}, 1)" style="background:#1f1f1f; border:1px solid #262626; color:#fff; width:28px; height:28px; border-radius:4px; cursor:pointer; font-weight:700;">+</button>
        </div>

        <div style="color:#E60000; font-weight:800; min-width:65px; text-align:right;">${itemTotal} ${lang==='ar'?'ج.م':'EGP'}</div>

        <button onclick="window.removeCartItem(${index})" style="background:none; border:none; color:#ff4d4d; cursor:pointer; font-size:1.1rem; padding:4px;">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  }).join('');

  const subtotalEl = document.getElementById('cartSubtotal');
  if (subtotalEl) subtotalEl.textContent = `${subtotal} ${lang==='ar'?'ج.م':'EGP'}`;
}

window.changeQty = function(index, delta) {
  let cart = getCart();
  if (!cart[index]) return;

  cart[index].quantity = (cart[index].quantity || 1) + delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart(cart);
  const cartContainer = document.getElementById('cartItemsContainer') || document.getElementById('cartTableBody');
  if (cartContainer) renderCartPage(cartContainer);
};

window.removeCartItem = function(index) {
  let cart = getCart();
  if (!cart[index]) return;

  cart.splice(index, 1);
  saveCart(cart);
  const cartContainer = document.getElementById('cartItemsContainer') || document.getElementById('cartTableBody');
  if (cartContainer) renderCartPage(cartContainer);
};