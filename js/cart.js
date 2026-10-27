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
// دالة تحديث رقم السلة في الناف بار لجميع الصفحات
function updateCartIcon() {
    // حساب مجموع الكميات في السلة
    const totalItems = cart.reduce((total, item) => {
        const qty = parseInt(item.quantity) || 1;
        return total + qty;
    }, 0);

    // تحديث كافة العناصر التي تحمل كلاس أو ID السلة بأي شكل
    const cartSelectors = document.querySelectorAll('.cart-count, .cart-badge, #cartCount, #cart-count');
    
    cartSelectors.forEach(element => {
        element.textContent = totalItems;
    });
}

// تشغيل التحديث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', updateCartIcon);