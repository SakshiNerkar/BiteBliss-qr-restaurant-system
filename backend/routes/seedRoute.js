const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Menu = require('../models/Menu');

// @desc    One-time seed route — exact replica of original local database
// @route   GET /api/seed?secret=BiteBlissSeed2025
// @access  Semi-private
router.get('/', async (req, res) => {
    if (req.query.secret !== 'BiteBlissSeed2025') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        // 1. Clear everything
        await Menu.deleteMany({});
        await Subcategory.deleteMany({});
        await Category.deleteMany({});

        // 2. Categories (exact original order)
        const catNames = ['Starters', 'Beverages', 'Desserts', 'Main Course', 'Rice and Breads', 'Fast Food'];
        const insertedCats = await Category.insertMany(catNames.map(name => ({ name })));
        const C = {};
        insertedCats.forEach(c => { C[c.name] = c._id; });

        // 3. Subcategories (exact original)
        const subData = [
            { name: 'Mocktails',                category: C['Beverages'] },
            { name: 'Ice-Cream',                category: C['Desserts'] },
            { name: 'Indian Fusion Desserts',   category: C['Desserts'] },
            { name: 'Hot Desserts',             category: C['Desserts'] },
            { name: 'Cakes & Cheesecakes',      category: C['Desserts'] },
            { name: 'Fresh Juices',             category: C['Beverages'] },
            { name: 'Shakes & Smoothies',       category: C['Beverages'] },
            { name: 'Tea & Coffee',             category: C['Beverages'] },
            { name: 'Soft Drinks',              category: C['Beverages'] },
            { name: 'Signature Drinks',         category: C['Beverages'] },
            { name: 'Indian Veg Starters',      category: C['Starters'] },
            { name: 'Indo-Chinese Starters',    category: C['Starters'] },
            { name: 'North Indian Main Course', category: C['Main Course'] },
            { name: 'Indo-Chinese Main Course', category: C['Main Course'] },
            { name: 'Biryani and Rice',         category: C['Rice and Breads'] },
            { name: 'Indian Breads',            category: C['Rice and Breads'] },
            { name: 'Burgers and Sandwiches',   category: C['Fast Food'] },
            { name: 'Ice Cream',                category: C['Desserts'] },
            { name: 'Mocktails and Coolers',    category: C['Beverages'] },
        ];
        const insertedSubs = await Subcategory.insertMany(subData);
        const S = {};
        insertedSubs.forEach(s => { S[s.name] = s._id; });

        // 4. All 90 menu items (no images — upload from admin panel)
        const menuData = [
            // ── STARTERS / Indian Veg ─────────────────────────────────────────
            { name: 'Aloo Tikki',              cat: 'Starters',       sub: 'Indian Veg Starters',     price: 120, avail: true,  desc: 'Crispy potato patties seasoned with herbs and served with chutneys.' },
            { name: 'Cheese Corn Balls',       cat: 'Starters',       sub: 'Indian Veg Starters',     price: 180, avail: true,  desc: 'Crunchy fried balls filled with melted cheese and sweet corn.' },
            { name: 'Paneer Tikka',            cat: 'Starters',       sub: 'Indian Veg Starters',     price: 230, avail: true,  desc: 'Marinated paneer cubes grilled to perfection in tandoor.' },
            { name: 'Dahi Ke Sholay',          cat: 'Starters',       sub: 'Indian Veg Starters',     price: 180, avail: true,  desc: 'Crispy fried yogurt-stuffed bread rolls.' },
            { name: 'Stuffed Mushroom',        cat: 'Starters',       sub: 'Indian Veg Starters',     price: 200, avail: true,  desc: 'Mushrooms stuffed with spiced batter and deep fried.' },
            { name: 'Veg Seekh Kebab',         cat: 'Starters',       sub: 'Indian Veg Starters',     price: 190, avail: true,  desc: 'Spiced vegetable kebabs skewered and grilled on open flame.' },
            { name: 'Tandoori Broccoli',       cat: 'Starters',       sub: 'Indian Veg Starters',     price: 210, avail: true,  desc: 'Fresh broccoli marinated in tandoori spice and char-grilled.' },
            { name: 'Corn Pops',               cat: 'Starters',       sub: 'Indian Veg Starters',     price: 140, avail: true,  desc: 'Crispy popcorn-style corn bites tossed in masala.' },
            // ── STARTERS / Indo-Chinese ───────────────────────────────────────
            { name: 'Chilli Paneer',           cat: 'Starters',       sub: 'Indo-Chinese Starters',   price: 230, avail: true,  desc: 'Fried paneer tossed with capsicum and chili sauce.' },
            { name: 'Crispy Baby Corn',        cat: 'Starters',       sub: 'Indo-Chinese Starters',   price: 180, avail: true,  desc: 'Golden fried baby corn served with tangy dip.' },
            { name: 'Veg Hakka Noodles (Starter Portion)', cat: 'Starters', sub: 'Indo-Chinese Starters', price: 150, avail: true, desc: 'Stir-fried noodles with vegetables in chili-soy sauce.' },
            { name: 'Szechwan Paneer',         cat: 'Starters',       sub: 'Indo-Chinese Starters',   price: 200, avail: true,  desc: 'Paneer in fiery Szechwan sauce with bell peppers.' },
            { name: 'Mushroom Pepper Fry',     cat: 'Starters',       sub: 'Indo-Chinese Starters',   price: 220, avail: true,  desc: 'Mushrooms sautéed with black pepper and Asian spices.' },
            { name: 'Crispy Spinach',          cat: 'Starters',       sub: 'Indo-Chinese Starters',   price: 140, avail: true,  desc: 'Thin crispy fried spinach leaves with chaat seasoning.' },
            // ── MAIN COURSE / North Indian ────────────────────────────────────
            { name: 'Paneer Butter Masala',    cat: 'Main Course',    sub: 'North Indian Main Course', price: 280, avail: true,  desc: 'Rich creamy tomato-based curry with soft paneer chunks.' },
            { name: 'Kadai Paneer',            cat: 'Main Course',    sub: 'North Indian Main Course', price: 270, avail: true,  desc: 'Paneer cooked in a spicy kadai masala with vegetables.' },
            { name: 'Shahi Paneer',            cat: 'Main Course',    sub: 'North Indian Main Course', price: 250, avail: true,  desc: 'Paneer in rich, creamy mughlai gravy with nuts.' },
            { name: 'Malai Kofta',             cat: 'Main Course',    sub: 'North Indian Main Course', price: 260, avail: true,  desc: 'Soft paneer and potato balls in a creamy tomato gravy.' },
            { name: 'Dal Makhani',             cat: 'Main Course',    sub: 'North Indian Main Course', price: 220, avail: true,  desc: 'Slow-cooked black lentils in buttery tomato gravy.' },
            { name: 'Chole Masala',            cat: 'Main Course',    sub: 'North Indian Main Course', price: 210, avail: true,  desc: 'Tangy and spicy North Indian chickpea curry.' },
            { name: 'Palak Paneer',            cat: 'Main Course',    sub: 'North Indian Main Course', price: 250, avail: true,  desc: 'Paneer cubes in smooth spiced spinach gravy.' },
            { name: 'Methi Malai Matar',       cat: 'Main Course',    sub: 'North Indian Main Course', price: 240, avail: true,  desc: 'Green peas and fenugreek leaves in creamy sauce.' },
            { name: 'Veg Kolhapuri',           cat: 'Main Course',    sub: 'North Indian Main Course', price: 210, avail: true,  desc: 'Spicy mixed vegetable curry in Kolhapuri masala.' },
            { name: 'Dum Aloo',                cat: 'Main Course',    sub: 'North Indian Main Course', price: 200, avail: true,  desc: 'Baby potatoes slow-cooked in aromatic gravy.' },
            // ── MAIN COURSE / Indo-Chinese ────────────────────────────────────
            { name: 'Veg Manchurian Gravy',    cat: 'Main Course',    sub: 'Indo-Chinese Main Course', price: 200, avail: true,  desc: 'Vegetable balls tossed in spicy Manchurian sauce.' },
            { name: 'Paneer Manchurian',       cat: 'Main Course',    sub: 'Indo-Chinese Main Course', price: 240, avail: true,  desc: 'Crispy paneer in tangy Manchurian sauce.' },
            { name: 'Veg Hakka Noodles',       cat: 'Main Course',    sub: 'Indo-Chinese Main Course', price: 180, avail: true,  desc: 'Stir-fried Chinese noodles with mixed vegetables.' },
            { name: 'Szechwan Noodles',        cat: 'Main Course',    sub: 'Indo-Chinese Main Course', price: 190, avail: true,  desc: 'Spicy Szechwan-style noodles with crunchy vegetables.' },
            { name: 'Veg Fried Rice',          cat: 'Main Course',    sub: 'Indo-Chinese Main Course', price: 170, avail: true,  desc: 'Wok-tossed rice with mixed vegetables and soy sauce.' },
            { name: 'Paneer Fried Rice',       cat: 'Main Course',    sub: 'Indo-Chinese Main Course', price: 210, avail: true,  desc: 'Fried rice tossed with paneer and oriental spices.' },
            { name: 'Mushroom Chilli Gravy',   cat: 'Main Course',    sub: 'Indo-Chinese Main Course', price: 230, avail: true,  desc: 'Mushrooms in spicy chilli garlic sauce.' },
            { name: 'Baby Corn Manchurian',    cat: 'Main Course',    sub: 'Indo-Chinese Main Course', price: 210, avail: true,  desc: 'Crispy baby corn in tangy Manchurian gravy.' },
            { name: 'Veg American Chopsuey',   cat: 'Main Course',    sub: 'Indo-Chinese Main Course', price: 180, avail: true,  desc: 'Crispy noodles topped with sweet and sour vegetable sauce.' },
            { name: 'Triple Schezwan Rice',    cat: 'Main Course',    sub: 'Indo-Chinese Main Course', price: 260, avail: true,  desc: 'Triple portion Schezwan rice with extra vegetables.' },
            // ── RICE AND BREADS / Biryani ─────────────────────────────────────
            { name: 'Veg Biryani',             cat: 'Rice and Breads', sub: 'Biryani and Rice', price: 250, avail: true,  desc: 'Fragrant basmati rice cooked with vegetables and whole spices.' },
            { name: 'Paneer Biryani',          cat: 'Rice and Breads', sub: 'Biryani and Rice', price: 280, avail: true,  desc: 'Aromatic dum biryani with marinated paneer cubes.' },
            { name: 'Dum Veg Biryani',         cat: 'Rice and Breads', sub: 'Biryani and Rice', price: 230, avail: true,  desc: 'Slow-cooked dum biryani with fresh vegetables.' },
            { name: 'Jeera Rice',              cat: 'Rice and Breads', sub: 'Biryani and Rice', price: 150, avail: true,  desc: 'Basmati rice tempered with whole cumin.' },
            { name: 'Veg Pulao',               cat: 'Rice and Breads', sub: 'Biryani and Rice', price: 180, avail: true,  desc: 'Light rice cooked with mixed vegetables.' },
            { name: 'Lemon Rice',              cat: 'Rice and Breads', sub: 'Biryani and Rice', price: 140, avail: true,  desc: 'South Indian lemon-flavored rice with peanuts.' },
            { name: 'Curd Rice',               cat: 'Rice and Breads', sub: 'Biryani and Rice', price: 130, avail: true,  desc: 'Comforting South Indian rice mixed with thick curd.' },
            { name: 'Szechwan Rice',           cat: 'Rice and Breads', sub: 'Biryani and Rice', price: 180, avail: true,  desc: 'Spicy Szechwan fried rice with vegetables.' },
            { name: 'Steamed Rice',            cat: 'Rice and Breads', sub: 'Biryani and Rice', price: 100, avail: true,  desc: 'Plain steamed basmati rice.' },
            // ── RICE AND BREADS / Breads ──────────────────────────────────────
            { name: 'Butter Naan',             cat: 'Rice and Breads', sub: 'Indian Breads', price: 50,  avail: true,  desc: 'Soft leavened bread baked in tandoor and brushed with butter.' },
            { name: 'Garlic Naan',             cat: 'Rice and Breads', sub: 'Indian Breads', price: 60,  avail: true,  desc: 'Naan topped with fresh garlic and coriander.' },
            { name: 'Tandoori Roti',           cat: 'Rice and Breads', sub: 'Indian Breads', price: 30,  avail: true,  desc: 'Whole wheat bread baked in clay oven.' },
            { name: 'Butter Roti',             cat: 'Rice and Breads', sub: 'Indian Breads', price: 40,  avail: true,  desc: 'Whole wheat roti brushed with butter.' },
            { name: 'Laccha Paratha',          cat: 'Rice and Breads', sub: 'Indian Breads', price: 50,  avail: false, desc: 'Layered flaky paratha made with whole wheat flour.' },
            { name: 'Stuffed Kulcha',          cat: 'Rice and Breads', sub: 'Indian Breads', price: 70,  avail: true,  desc: 'Leavened flatbread stuffed with spiced potato filling.' },
            { name: 'Cheese Naan',             cat: 'Rice and Breads', sub: 'Indian Breads', price: 80,  avail: true,  desc: 'Naan filled and topped with melted cheese.' },
            { name: 'Plain Naan',              cat: 'Rice and Breads', sub: 'Indian Breads', price: 40,  avail: true,  desc: 'Classic tandoor-baked leavened bread.' },
            { name: 'Missi Roti',              cat: 'Rice and Breads', sub: 'Indian Breads', price: 45,  avail: true,  desc: 'Besan and wheat blend flatbread with spices.' },
            { name: 'Pudina Paratha',          cat: 'Rice and Breads', sub: 'Indian Breads', price: 50,  avail: true,  desc: 'Mint-flavored multi-layered paratha.' },
            // ── FAST FOOD ──────────────────────────────────────────────────────
            { name: 'Paneer Burger',           cat: 'Fast Food', sub: 'Burgers and Sandwiches', price: 150, avail: true,  desc: 'Crispy paneer patty in a soft bun with fresh toppings.' },
            { name: 'Cheese Burger',           cat: 'Fast Food', sub: 'Burgers and Sandwiches', price: 140, avail: true,  desc: 'Classic burger loaded with melted cheese slices.' },
            { name: 'Peri Peri Burger',        cat: 'Fast Food', sub: 'Burgers and Sandwiches', price: 160, avail: true,  desc: 'Spicy peri peri flavored burger with crispy fries.' },
            { name: 'Veg Club Sandwich',       cat: 'Fast Food', sub: 'Burgers and Sandwiches', price: 130, avail: true,  desc: 'Triple-layered club sandwich with fresh vegetables.' },
            { name: 'Grilled Cheese Sandwich', cat: 'Fast Food', sub: 'Burgers and Sandwiches', price: 110, avail: true,  desc: 'Toasted sandwich filled with melted cheese.' },
            { name: 'Veg Mayo Sandwich',       cat: 'Fast Food', sub: 'Burgers and Sandwiches', price: 100, avail: true,  desc: 'Soft bread filled with vegetable mayo mixture.' },
            { name: 'Paneer Tikka Sandwich',   cat: 'Fast Food', sub: 'Burgers and Sandwiches', price: 160, avail: true,  desc: 'Grilled sandwich filled with spiced paneer.' },
            { name: 'Corn Cheese Sandwich',    cat: 'Fast Food', sub: 'Burgers and Sandwiches', price: 140, avail: true,  desc: 'Sweet corn and melted cheese stuffed sandwich.' },
            { name: 'Mushroom Sandwich',       cat: 'Fast Food', sub: 'Burgers and Sandwiches', price: 150, avail: true,  desc: 'Sautéed mushrooms layered inside toasted bread.' },
            // ── DESSERTS / Ice Cream ──────────────────────────────────────────
            { name: 'Vanilla Ice Cream',       cat: 'Desserts', sub: 'Ice Cream', price: 90,  avail: false, desc: 'Classic creamy vanilla ice cream with smooth texture.' },
            { name: 'Chocolate Ice Cream',     cat: 'Desserts', sub: 'Ice Cream', price: 110, avail: true,  desc: 'Rich chocolate ice cream made with premium cocoa.' },
            { name: 'Strawberry Ice Cream',    cat: 'Desserts', sub: 'Ice Cream', price: 100, avail: true,  desc: 'Creamy strawberry-flavored ice cream with fruity notes.' },
            { name: 'Butterscotch Ice Cream',  cat: 'Desserts', sub: 'Ice Cream', price: 120, avail: true,  desc: 'Sweet and nutty butterscotch flavored ice cream.' },
            { name: 'Chocolate Sundae',        cat: 'Desserts', sub: 'Ice Cream', price: 180, avail: true,  desc: 'Chocolate ice cream topped with fudge sauce.' },
            { name: 'Brownie with Ice Cream',  cat: 'Desserts', sub: 'Ice Cream', price: 200, avail: true,  desc: 'Warm brownie served with vanilla ice cream.' },
            { name: 'Oreo Sundae',             cat: 'Desserts', sub: 'Ice Cream', price: 190, avail: true,  desc: 'Ice cream layered with crushed Oreo cookies.' },
            { name: 'Mango Ice Cream',         cat: 'Desserts', sub: 'Ice Cream', price: 130, avail: true,  desc: 'Seasonal mango-flavored creamy ice cream.' },
            { name: 'Paan Ice Cream',          cat: 'Desserts', sub: 'Ice Cream', price: 140, avail: true,  desc: 'Ice cream infused with refreshing paan flavor.' },
            { name: 'Dry Fruit Sundae',        cat: 'Desserts', sub: 'Ice Cream', price: 180, avail: true,  desc: 'Ice cream topped with assorted nuts and syrup.' },
            // ── DESSERTS / Indian Fusion ──────────────────────────────────────
            { name: 'Gulab Jamun Cheesecake',  cat: 'Desserts', sub: 'Indian Fusion Desserts', price: 250, avail: true, desc: 'Creamy cheesecake topped with mini gulab jamuns and saffron syrup.' },
            { name: 'Rasmalai Tres Leches',    cat: 'Desserts', sub: 'Indian Fusion Desserts', price: 230, avail: true, desc: 'Milk-soaked sponge cake layered with rasmalai cream.' },
            { name: 'Chocolate Samosa',        cat: 'Desserts', sub: 'Indian Fusion Desserts', price: 150, avail: true, desc: 'Crispy pastry filled with molten chocolate.' },
            { name: 'Paan Mousse',             cat: 'Desserts', sub: 'Indian Fusion Desserts', price: 150, avail: true, desc: 'Smooth mousse infused with traditional paan flavors.' },
            { name: 'Shahi Tukda',             cat: 'Desserts', sub: 'Indian Fusion Desserts', price: 180, avail: true, desc: 'Fried bread soaked in saffron milk and topped with rabdi.' },
            { name: 'Gajar Halwa',             cat: 'Desserts', sub: 'Indian Fusion Desserts', price: 160, avail: true, desc: 'Slow-cooked carrot dessert with ghee and dry fruits.' },
            { name: 'Moong Dal Halwa',         cat: 'Desserts', sub: 'Indian Fusion Desserts', price: 170, avail: true, desc: 'Rich lentil halwa cooked with pure ghee.' },
            { name: 'Malai Kulfi',             cat: 'Desserts', sub: 'Indian Fusion Desserts', price: 120, avail: true, desc: 'Traditional frozen dessert made with thickened milk.' },
            { name: 'Coconut Ladoo',           cat: 'Desserts', sub: 'Indian Fusion Desserts', price: 100, avail: true, desc: 'Sweet coconut balls flavored with cardamom.' },
            { name: 'Kesar Pista Kulfi',       cat: 'Desserts', sub: 'Indian Fusion Desserts', price: 140, avail: true, desc: 'Saffron and pistachio flavored traditional kulfi.' },
            // ── BEVERAGES / Mocktails and Coolers ─────────────────────────────
            { name: 'Watermelon Mint Cooler',  cat: 'Beverages', sub: 'Mocktails and Coolers', price: 160, avail: true, desc: 'Fresh watermelon juice blended with mint.' },
            { name: 'Paan Mojito',             cat: 'Beverages', sub: 'Mocktails and Coolers', price: 170, avail: true, desc: 'Mint cooler infused with paan flavor.' },
            { name: 'Lemon Iced Tea',          cat: 'Beverages', sub: 'Mocktails and Coolers', price: 140, avail: true, desc: 'Chilled tea flavored with lemon.' },
            { name: 'Peach Iced Tea',          cat: 'Beverages', sub: 'Mocktails and Coolers', price: 160, avail: true, desc: 'Iced tea blended with peach syrup.' },
            { name: 'Strawberry Cooler',       cat: 'Beverages', sub: 'Mocktails and Coolers', price: 170, avail: true, desc: 'Sweet and tangy strawberry-based drink.' },
            { name: 'Pineapple Mint Cooler',   cat: 'Beverages', sub: 'Mocktails and Coolers', price: 160, avail: true, desc: 'Fresh pineapple blended with mint.' },
            { name: 'Rose Lemonade',           cat: 'Beverages', sub: 'Mocktails and Coolers', price: 150, avail: true, desc: 'Refreshing lemonade infused with rose syrup.' },
            { name: 'Green Apple Fizz',        cat: 'Beverages', sub: 'Mocktails and Coolers', price: 170, avail: true, desc: 'Tangy green apple flavored sparkling drink.' },
        ];

        const menuDocs = menuData.map(item => ({
            name:        item.name,
            description: item.desc,
            price:       item.price,
            category:    C[item.cat],
            subcategory: S[item.sub],
            isAvailable: item.avail,
            image:       '', // upload from Admin Panel → Menu Items → Edit
        }));

        const insertedMenu = await Menu.insertMany(menuDocs);

        res.json({
            success: true,
            message: `Seeded ${insertedCats.length} categories, ${insertedSubs.length} subcategories, and ${insertedMenu.length} menu items. Upload images from the Admin Panel.`,
        });
    } catch (err) {
        console.error('Seed error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
