require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 1. Database Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bigmuscle';
mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB Successfully'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 2. Cloudinary Config & Multer Setup
let upload;
if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'bigmuscle_products',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
        }
    });
    upload = multer({ storage: storage });
} else {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads/')),
        filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
    });
    upload = multer({ storage: storage });
}

// Helper for Multiple Image URLs
const getImageUrls = (req) => {
    let urls = [];
    if (req.files && req.files.length > 0) {
        urls = req.files.map(f => f.path || f.secure_url || `${req.protocol}://${req.get('host')}/uploads/${f.filename}`);
    }
    return urls;
};

// 3. Schemas & Models
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    nameAr: { type: String, required: true }
});
const Category = mongoose.model('Category', categorySchema);

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    nameAr: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    descriptionAr: { type: String, default: '' },
    images: [{ type: String }],
    image: { type: String } // Backward compatibility
});
const Product = mongoose.model('Product', productSchema);

const offerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    titleAr: { type: String, required: true },
    discountText: { type: String, required: true },
    discountTextAr: { type: String, required: true },
    description: { type: String, required: true },
    descriptionAr: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true }
});
const Offer = mongoose.model('Offer', offerSchema);

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    notes: { type: String, default: '' },
    items: [
        {
            id: String,
            name: String,
            price: Number,
            quantity: Number,
            image: String
        }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'New' },
    date: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// ==========================================
// Schema الخاص بشريط العروض العلوي (Top Bar)
// ==========================================
const announcementSchema = new mongoose.Schema({
    textAr: { 
        type: String, 
        default: "خصم 20% على جميع منتجات البروتين هذا الأسبوع!" 
    },
    textEn: { 
        type: String, 
        default: "20% OFF ALL PROTEIN PRODUCTS THIS WEEK!" 
    }
}, { timestamps: true });

const Announcement = mongoose.model('Announcement', announcementSchema);

// 4. API Endpoints

app.get('/', (req, res) => {
    res.send('Big Muscle API is running smoothly 🚀');
});

// Admin Auth Route
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'bigmuscle2024';

    if (username === adminUser && password === adminPass) {
        return res.json({ success: true, token: 'bigmuscle_secure_token_2024' });
    }
    return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
});

// Categories Routes
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/categories', async (req, res) => {
    try {
        const newCategory = new Category(req.body);
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Products Routes (Supports Multiple Images & Description)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', upload.array('images', 5), async (req, res) => {
    try {
        const imageUrls = getImageUrls(req);
        const mainImage = imageUrls.length > 0 ? imageUrls[0] : '';
        const newProduct = new Product({
            name: req.body.name,
            nameAr: req.body.nameAr,
            price: req.body.price,
            category: req.body.category,
            description: req.body.description || '',
            descriptionAr: req.body.descriptionAr || '',
            images: imageUrls,
            image: mainImage
        });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});



app.put('/api/products/:id', upload.array('images', 5), async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            nameAr: req.body.nameAr,
            price: req.body.price,
            category: req.body.category,
            description: req.body.description || '',
            descriptionAr: req.body.descriptionAr || ''
        };
        const imageUrls = getImageUrls(req);
        if (imageUrls.length > 0) {
            updateData.images = imageUrls;
            updateData.image = imageUrls[0];
        }
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Offers Routes
app.get('/api/offers', async (req, res) => {
    try {
        const offers = await Offer.find();
        res.json(offers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/offers', upload.single('image'), async (req, res) => {
    try {
        const imageUrl = req.file ? (req.file.path || req.file.secure_url || `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`) : '';
        const newOffer = new Offer({
            title: req.body.title,
            titleAr: req.body.titleAr,
            discountText: req.body.discountText,
            discountTextAr: req.body.discountTextAr,
            description: req.body.description,
            descriptionAr: req.body.descriptionAr,
            price: req.body.price,
            image: imageUrl
        });
        await newOffer.save();
        res.status(201).json(newOffer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ==========================================
// API جلب شريط العروض (للموقع للجمهور)
// ==========================================
app.get('/api/announcement', async (req, res) => {
    try {
        let announcement = await Announcement.findOne();
        if (!announcement) {
            announcement = await Announcement.create({
                textAr: "خصم 20% على جميع منتجات البروتين هذا الأسبوع!",
                textEn: "20% OFF ALL PROTEIN PRODUCTS THIS WEEK!"
            });
        }
        res.json(announcement);
    } catch (error) {
        res.status(500).json({ message: "Error fetching announcement", error });
    }
});

// ==========================================
// API تحديث شريط العروض (من لوحة التحكم)
// ==========================================
app.post('/api/announcement', async (req, res) => {
    try {
        const { textAr, textEn } = req.body;
        let announcement = await Announcement.findOne();

        if (announcement) {
            announcement.textAr = textAr || announcement.textAr;
            announcement.textEn = textEn || announcement.textEn;
            await announcement.save();
        } else {
            announcement = await Announcement.create({ textAr, textEn });
        }

        res.json({ message: "تم تحديث الشريط بنجاح!", announcement });
    } catch (error) {
        res.status(500).json({ message: "Error updating announcement", error });
    }
});

app.put('/api/offers/:id', upload.single('image'), async (req, res) => {
    try {
        const updateData = {
            title: req.body.title,
            titleAr: req.body.titleAr,
            discountText: req.body.discountText,
            discountTextAr: req.body.discountTextAr,
            description: req.body.description,
            descriptionAr: req.body.descriptionAr,
            price: req.body.price
        };
        if (req.file) {
            updateData.image = req.file.path || req.file.secure_url || `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }
        const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedOffer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/offers/:id', async (req, res) => {
    try {
        await Offer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Offer deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Orders Routes
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});