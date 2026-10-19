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

// 1. Database Connection (MongoDB Atlas or Local)
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bigmuscle';
mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB Atlas Successfully'))
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
    // Local fallback storage
    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads/')),
        filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
    });
    upload = multer({ storage: storage });
}

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
    image: { type: String, required: true }
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

// Helper for Image URLs
const getImageUrl = (req) => {
    if (req.file && (req.file.path || req.file.secure_url)) {
        return req.file.path || req.file.secure_url;
    }
    return req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : '';
};

// 4. API Endpoints

// Root Route
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

// Products Routes
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const imageUrl = getImageUrl(req);
        const newProduct = new Product({
            name: req.body.name,
            nameAr: req.body.nameAr,
            price: req.body.price,
            category: req.body.category,
            image: imageUrl
        });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/products/:id', upload.single('image'), async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            nameAr: req.body.nameAr,
            price: req.body.price,
            category: req.body.category
        };
        if (req.file) {
            updateData.image = getImageUrl(req);
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
        const imageUrl = getImageUrl(req);
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
            updateData.image = getImageUrl(req);
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

// 5. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});