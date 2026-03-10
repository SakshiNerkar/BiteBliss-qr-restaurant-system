const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Menu = require('../models/Menu');

// @desc    One-time seed route for demo data
// @route   GET /api/seed?secret=BiteBlissSeed2025
// @access  Semi-private (secret key required)
router.get('/', async (req, res) => {
    if (req.query.secret !== 'BiteBlissSeed2025') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        // Clear existing
        await Category.deleteMany({});
        await Menu.deleteMany({});

        const categoryData = [
            { name: 'Starters' },
            { name: 'Main Course' },
            { name: 'Breads' },
            { name: 'Beverages' },
            { name: 'Desserts' },
        ];

        const insertedCats = await Category.insertMany(categoryData);
        const catMap = {};
        insertedCats.forEach(c => { catMap[c.name] = c._id; });

        const menuData = [
            // Starters
            { name: 'Aloo Tikki',         category: catMap['Starters'],     price: 120, description: 'Crispy potato patties seasoned with herbs and served with chutneys.', isAvailable: true },
            { name: 'Cheese Corn Balls',  category: catMap['Starters'],     price: 180, description: 'Crunchy fried balls filled with melted cheese and sweet corn.', isAvailable: true },
            { name: 'Chilli Paneer',      category: catMap['Starters'],     price: 230, description: 'Fried paneer tossed with capsicum and chili sauce.', isAvailable: true },
            { name: 'Crispy Baby Corn',   category: catMap['Starters'],     price: 180, description: 'Golden fried baby corn served with tangy dip.', isAvailable: true },
            { name: 'Veg Spring Rolls',   category: catMap['Starters'],     price: 160, description: 'Crispy rolls stuffed with fresh vegetables.', isAvailable: true },
            // Main Course
            { name: 'Paneer Butter Masala', category: catMap['Main Course'], price: 280, description: 'Rich creamy tomato-based curry with soft paneer chunks.', isAvailable: true },
            { name: 'Dal Makhani',          category: catMap['Main Course'], price: 220, description: 'Slow-cooked black lentils in buttery tomato gravy.', isAvailable: true },
            { name: 'Veg Biryani',          category: catMap['Main Course'], price: 250, description: 'Fragrant basmati rice cooked with vegetables and whole spices.', isAvailable: true },
            { name: 'Chole Bhature',        category: catMap['Main Course'], price: 190, description: 'Spicy chickpea curry served with fluffy deep-fried bread.', isAvailable: true },
            { name: 'Palak Paneer',         category: catMap['Main Course'], price: 260, description: 'Paneer cubes in smooth spiced spinach gravy.', isAvailable: true },
            // Breads
            { name: 'Butter Naan',    category: catMap['Breads'], price: 60, description: 'Soft leavened bread baked in tandoor and brushed with butter.', isAvailable: true },
            { name: 'Garlic Naan',    category: catMap['Breads'], price: 70, description: 'Naan topped with fresh garlic and coriander.', isAvailable: true },
            { name: 'Tandoori Roti',  category: catMap['Breads'], price: 40, description: 'Whole wheat bread baked in clay oven.', isAvailable: true },
            { name: 'Stuffed Paratha',category: catMap['Breads'], price: 90, description: 'Flaky flatbread stuffed with spiced potato filling.', isAvailable: true },
            // Beverages
            { name: 'Mango Lassi',    category: catMap['Beverages'], price: 100, description: 'Chilled yogurt drink blended with ripe Alphonso mangoes.', isAvailable: true },
            { name: 'Masala Chai',    category: catMap['Beverages'], price: 50,  description: 'Indian spiced tea brewed with ginger, cardamom and milk.', isAvailable: true },
            { name: 'Fresh Lime Soda',category: catMap['Beverages'], price: 70,  description: 'Cool refreshing lime soda with mint.', isAvailable: true },
            { name: 'Cold Coffee',    category: catMap['Beverages'], price: 120, description: 'Creamy blended coffee with vanilla ice cream.', isAvailable: true },
            // Desserts
            { name: 'Gulab Jamun',   category: catMap['Desserts'], price: 80,  description: 'Soft milk-solid dumplings soaked in rose-flavored sugar syrup.', isAvailable: true },
            { name: 'Rasmalai',      category: catMap['Desserts'], price: 100, description: 'Spongy cheese patties in sweetened thickened milk.', isAvailable: true },
            { name: 'Mango Kulfi',   category: catMap['Desserts'], price: 90,  description: 'Traditional Indian ice cream with real mango flavour.', isAvailable: true },
            { name: 'Chocolate Cake',category: catMap['Desserts'], price: 150, description: 'Moist chocolate cake slice with ganache frosting.', isAvailable: true },
        ];

        const insertedMenu = await Menu.insertMany(menuData);

        res.json({
            success: true,
            message: `✅ Seeded ${insertedCats.length} categories and ${insertedMenu.length} menu items into Atlas!`,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
