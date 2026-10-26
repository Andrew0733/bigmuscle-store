// جلب المنتجات من الـ LocalStorage أو إنشاء سلة فارغة
let cart = JSON.parse(localStorage.getItem('bigMuscleCart')) || [];

// دالة إضافة منتج للسلة
function addToCart(id, name, price, image) {
    // التحقق إذا كان المنتج موجود مسبقاً
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1; // زيادة الكمية
    } else {
        cart.push({ id, name, price, image, quantity: 1 }); // إضافة منتج جديد
    }
    
    saveCart();
    updateCartIcon();
    alert(document.body.classList.contains('rtl') ? 'تمت الإضافة إلى السلة!' : 'Added to Cart!');
}

// دالة حفظ السلة
function saveCart() {
    localStorage.setItem('bigMuscleCart', JSON.stringify(cart));
}

// دالة تحديث رقم السلة في الناف بار
function updateCartIcon() {
    const cartCounts = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCounts.forEach(count => count.textContent = totalItems);
}

// تشغيل التحديث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', updateCartIcon);