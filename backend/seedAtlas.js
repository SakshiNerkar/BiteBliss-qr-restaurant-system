// ============================================================
// BiteBliss - MongoDB Atlas Seed Script
// Run: node seedAtlas.js
// This script connects DIRECTLY to Atlas and seeds sample data
// ============================================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Models
const Category = require('./models/Category');
const Menu     = require('./models/Menu');

// ── Your Atlas URI ─────────────────────────────────────────
// Paste the full connection string in your .env as MONGO_URI
// or pass it as the second argument: node seedAtlas.js "<uri>"
const ATLAS_URI = process.argv[2] || process.env.MONGO_URI;

if (!ATLAS_URI || ATLAS_URI.includes('localhost')) {
    console.error('\n❌  Please provide your Atlas MONGO_URI:');
    console.error('    node seedAtlas.js "mongodb+srv://..."');
    console.error('    OR set MONGO_URI in backend/.env to the Atlas string.\n');
    process.exit(1);
}

// ── Sample Data ────────────────────────────────────────────
const categoryData = [
    { name: 'Starters' },
    { name: 'Main Course' },
    { name: 'Breads' },
    { name: 'Beverages' },
    { name: 'Desserts' },
];

// Menu items use category NAME (mapped to _id after creation)
const menuData = [
    // Starters
    { name: 'Aloo Tikki',       category: 'Starters',       price: 120, description: 'Crispy potato patties seasoned with herbs and served with chutneys.', isAvailable: true },
    { name: 'Cheese Corn Balls',category: 'Starters',       price: 180, description: 'Crunchy fried balls filled with melted cheese and sweet corn.', isAvailable: true },
    { name: 'Chilli Paneer',    category: 'Starters',       price: 230, description: 'Fried paneer tossed with capsicum and chili sauce.', isAvailable: true },
    { name: 'Crispy Baby Corn', category: 'Starters',       price: 180, description: 'Golden fried baby corn served with tangy dip.', isAvailable: true },
    { name: 'Veg Spring Rolls', category: 'Starters',       price: 160, description: 'Crispy rolls stuffed with fresh vegetables.', isAvailable: true },

    // Main Course
    { name: 'Paneer Butter Masala', category: 'Main Course', price: 280, description: 'Rich and creamy tomato-based curry with soft paneer chunks.', isAvailable: true },
    { name: 'Dal Makhani',          category: 'Main Course', price: 220, description: 'Slow-cooked black lentils in buttery tomato gravy.', isAvailable: true },
    { name: 'Veg Biryani',          category: 'Main Course', price: 250, description: 'Fragrant basmati rice cooked with vegetables and whole spices.', isAvailable: true },
    { name: 'Chole Bhature',        category: 'Main Course', price: 190, description: 'Spicy chickpea curry served with fluffy deep-fried bread.', isAvailable: true },
    { name: 'Palak Paneer',         category: 'Main Course', price: 260, description: 'Paneer cubes in a smooth, spiced spinach gravy.', isAvailable: true },

    // Breads
    { name: 'Butter Naan',    category: 'Breads', price: 60,  description: 'Soft leavened bread baked in tandoor and brushed with butter.', isAvailable: true },
    { name: 'Garlic Naan',    category: 'Breads', price: 70,  description: 'Naan topped with fresh garlic and coriander.', isAvailable: true },
    { name: 'Tandoori Roti',  category: 'Breads', price: 40,  description: 'Whole wheat bread baked in clay oven.', isAvailable: true },
    { name: 'Stuffed Paratha',category: 'Breads', price: 90,  description: 'Flaky flatbread stuffed with spiced potato filling.', isAvailable: true },

    // Beverages
    { name: 'Mango Lassi',    category: 'Beverages', price: 100, description: 'Chilled yogurt drink blended with ripe Alphonso mangoes.', isAvailable: true },
    { name: 'Masala Chai',    category: 'Beverages', price: 50,  description: 'Indian spiced tea brewed with ginger, cardamom and milk.', isAvailable: true },
    { name: 'Fresh Lime Soda',category: 'Beverages', price: 70,  description: 'Cool refreshing lime soda with mint, sweet or salted.', isAvailable: true },
    { name: 'Cold Coffee',    category: 'Beverages', price: 120, description: 'Creamy blended coffee with vanilla ice cream.', isAvailable: true },

    // Desserts
    { name: 'Gulab Jamun',   category: 'Desserts', price: 80,  description: 'Soft milk-solid dumplings soaked in rose-flavored sugar syrup.', isAvailable: true },
    { name: 'Rasmalai',      category: 'Desserts', price: 100, description: 'Spongy cheese patties in sweetened, thickened milk.', isAvailable: true },
    { name: 'Mango Kulfi',   category: 'Desserts', price: 90,  description: 'Traditional Indian ice cream with real mango flavour.', isAvailable: true },
    { name: 'Chocolate Cake',category: 'Desserts', price: 150, description: 'Moist chocolate cake slice with ganache frosting.', isAvailable: true },
];

// ── Seed Function ──────────────────────────────────────────
const seed = async () => {
    try {
        await mongoose.connect(ATLAS_URI);
        console.log('✅  Connected to MongoDB Atlas');

        // Optionally wipe existing data
        await Category.deleteMany({});
        await Menu.deleteMany({ isDeleted: false });
        console.log('🗑️  Cleared old data');

        // Insert categories
        const insertedCats = await Category.insertMany(categoryData);
        console.log(`📁  Inserted ${insertedCats.length} categories`);

        // Build name → _id map
        const catMap = {};
        insertedCats.forEach(c => { catMap[c.name] = c._id; });

        // Build menu items with correct ObjectId references
        const menuDocs = menuData.map(item => ({
            ...item,
            category: catMap[item.category],
        }));

        const insertedMenu = await Menu.insertMany(menuDocs);
        console.log(`🍽️  Inserted ${insertedMenu.length} menu items`);

        console.log('\n🎉  Atlas database seeded successfully!\n');
    } catch (err) {
        console.error('❌  Seed error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

seed();
