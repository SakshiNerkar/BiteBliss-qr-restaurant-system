const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Menu = require('../models/Menu');
const cloudinary = require('../config/cloudinary');

// Helper: upload a remote image URL to Cloudinary
const uploadImg = async (remoteUrl, publicId) => {
    try {
        const result = await cloudinary.uploader.upload(remoteUrl, {
            folder: 'bitebliss_menu',
            public_id: publicId,
            overwrite: true,
            transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
        });
        return result.secure_url;
    } catch {
        return remoteUrl;
    }
};

// @desc    One-time seed + Cloudinary image upload route
// @route   GET /api/seed?secret=BiteBlissSeed2025
// @access  Semi-private (secret key required)
router.get('/', async (req, res) => {
    if (req.query.secret !== 'BiteBlissSeed2025') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        await Menu.deleteMany({});
        await Subcategory.deleteMany({});
        await Category.deleteMany({});

        const catNames = ['Starters', 'Beverages', 'Desserts', 'Main Course', 'Rice and Breads', 'Fast Food'];
        const insertedCats = await Category.insertMany(catNames.map(name => ({ name })));
        const C = {};
        insertedCats.forEach(c => { C[c.name] = c._id; });

        const subData = [
            { name: 'Indian Veg Starters',     category: C['Starters'] },
            { name: 'Indo-Chinese Starters',    category: C['Starters'] },
            { name: 'North Indian Main Course', category: C['Main Course'] },
            { name: 'Indo-Chinese Main Course', category: C['Main Course'] },
            { name: 'Biryani and Rice',         category: C['Rice and Breads'] },
            { name: 'Indian Breads',            category: C['Rice and Breads'] },
            { name: 'Burgers and Sandwiches',   category: C['Fast Food'] },
            { name: 'Ice Cream',                category: C['Desserts'] },
            { name: 'Indian Fusion Desserts',   category: C['Desserts'] },
            { name: 'Mocktails and Coolers',    category: C['Beverages'] },
        ];
        const insertedSubs = await Subcategory.insertMany(subData);
        const S = {};
        insertedSubs.forEach(s => { S[s.name] = s._id; });

        // Free Unsplash food images - uploaded to Cloudinary for permanent storage
        const menuData = [
            // STARTERS - Indian Veg
            { name: 'Aloo Tikki', cat: 'Starters', sub: 'Indian Veg Starters', price: 120, avail: true, img: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800', desc: 'Crispy potato patties seasoned with herbs and served with chutneys.' },
            { name: 'Paneer Tikka', cat: 'Starters', sub: 'Indian Veg Starters', price: 230, avail: true, img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800', desc: 'Marinated paneer cubes grilled to perfection in tandoor.' },
            { name: 'Stuffed Mushroom', cat: 'Starters', sub: 'Indian Veg Starters', price: 200, avail: true, img: 'https://images.unsplash.com/photo-1608039855788-a8e91c2c1fc0?w=800', desc: 'Mushrooms stuffed with spiced paneer and deep fried.' },
            { name: 'Veg Seekh Kebab', cat: 'Starters', sub: 'Indian Veg Starters', price: 190, avail: true, img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800', desc: 'Spiced vegetable kebabs skewered and grilled on open flame.' },
            { name: 'Cheese Corn Balls', cat: 'Starters', sub: 'Indian Veg Starters', price: 180, avail: true, img: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=800', desc: 'Crunchy fried balls filled with melted cheese and sweet corn.' },
            // STARTERS - Indo-Chinese
            { name: 'Chilli Paneer', cat: 'Starters', sub: 'Indo-Chinese Starters', price: 230, avail: true, img: 'https://images.unsplash.com/photo-1645177628172-a5a3aa25a0cc?w=800', desc: 'Fried paneer tossed with capsicum and chili sauce.' },
            { name: 'Crispy Baby Corn', cat: 'Starters', sub: 'Indo-Chinese Starters', price: 180, avail: true, img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', desc: 'Golden fried baby corn served with tangy dip.' },
            { name: 'Mushroom Pepper Fry', cat: 'Starters', sub: 'Indo-Chinese Starters', price: 220, avail: true, img: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800', desc: 'Mushrooms in black pepper and Asian spices.' },
            { name: 'Szechwan Paneer', cat: 'Starters', sub: 'Indo-Chinese Starters', price: 200, avail: true, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800', desc: 'Paneer in fiery Szechwan sauce with bell peppers.' },
            // MAIN COURSE - North Indian
            { name: 'Paneer Butter Masala', cat: 'Main Course', sub: 'North Indian Main Course', price: 280, avail: true, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800', desc: 'Rich creamy tomato-based curry with soft paneer chunks.' },
            { name: 'Dal Makhani', cat: 'Main Course', sub: 'North Indian Main Course', price: 220, avail: true, img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800', desc: 'Slow-cooked black lentils in buttery tomato gravy.' },
            { name: 'Shahi Paneer', cat: 'Main Course', sub: 'North Indian Main Course', price: 250, avail: true, img: 'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=800', desc: 'Paneer in rich creamy mughlai gravy with nuts.' },
            { name: 'Palak Paneer', cat: 'Main Course', sub: 'North Indian Main Course', price: 250, avail: true, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800', desc: 'Paneer cubes in smooth spiced spinach gravy.' },
            { name: 'Chole Masala', cat: 'Main Course', sub: 'North Indian Main Course', price: 210, avail: true, img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', desc: 'Tangy and spicy North Indian chickpea curry.' },
            { name: 'Malai Kofta', cat: 'Main Course', sub: 'North Indian Main Course', price: 260, avail: true, img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800', desc: 'Soft paneer and potato balls in creamy tomato gravy.' },
            { name: 'Dum Aloo', cat: 'Main Course', sub: 'North Indian Main Course', price: 200, avail: true, img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', desc: 'Baby potatoes slow cooked in aromatic gravy.' },
            // MAIN COURSE - Indo-Chinese
            { name: 'Veg Hakka Noodles', cat: 'Main Course', sub: 'Indo-Chinese Main Course', price: 180, avail: true, img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800', desc: 'Stir-fried Chinese noodles with mixed vegetables.' },
            { name: 'Veg Fried Rice', cat: 'Main Course', sub: 'Indo-Chinese Main Course', price: 170, avail: true, img: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800', desc: 'Wok-tossed rice with mixed vegetables and soy sauce.' },
            { name: 'Paneer Manchurian', cat: 'Main Course', sub: 'Indo-Chinese Main Course', price: 240, avail: true, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800', desc: 'Crispy paneer in tangy Manchurian sauce.' },
            { name: 'Szechwan Noodles', cat: 'Main Course', sub: 'Indo-Chinese Main Course', price: 190, avail: true, img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800', desc: 'Spicy Szechwan-style noodles with crunchy vegetables.' },
            // RICE AND BREADS
            { name: 'Veg Biryani', cat: 'Rice and Breads', sub: 'Biryani and Rice', price: 250, avail: true, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800', desc: 'Fragrant basmati rice with vegetables and whole spices.' },
            { name: 'Paneer Biryani', cat: 'Rice and Breads', sub: 'Biryani and Rice', price: 280, avail: true, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800', desc: 'Aromatic dum biryani with marinated paneer cubes.' },
            { name: 'Jeera Rice', cat: 'Rice and Breads', sub: 'Biryani and Rice', price: 150, avail: true, img: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800', desc: 'Basmati rice tempered with whole cumin.' },
            { name: 'Veg Pulao', cat: 'Rice and Breads', sub: 'Biryani and Rice', price: 180, avail: true, img: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800', desc: 'Light rice cooked with mixed vegetables.' },
            { name: 'Butter Naan', cat: 'Rice and Breads', sub: 'Indian Breads', price: 50, avail: true, img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800', desc: 'Soft leavened bread baked in tandoor and brushed with butter.' },
            { name: 'Garlic Naan', cat: 'Rice and Breads', sub: 'Indian Breads', price: 60, avail: true, img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800', desc: 'Naan topped with fresh garlic and coriander.' },
            { name: 'Cheese Naan', cat: 'Rice and Breads', sub: 'Indian Breads', price: 80, avail: true, img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800', desc: 'Naan filled and topped with melted cheese.' },
            { name: 'Tandoori Roti', cat: 'Rice and Breads', sub: 'Indian Breads', price: 30, avail: true, img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800', desc: 'Whole wheat bread baked in clay oven.' },
            // FAST FOOD
            { name: 'Paneer Burger', cat: 'Fast Food', sub: 'Burgers and Sandwiches', price: 150, avail: true, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', desc: 'Crispy paneer patty in a soft bun with fresh toppings.' },
            { name: 'Cheese Burger', cat: 'Fast Food', sub: 'Burgers and Sandwiches', price: 140, avail: true, img: 'https://images.unsplash.com/photo-1461006447960-5bef5b10fb12?w=800', desc: 'Classic burger loaded with melted cheese slices.' },
            { name: 'Peri Peri Burger', cat: 'Fast Food', sub: 'Burgers and Sandwiches', price: 160, avail: true, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', desc: 'Spicy peri peri flavored burger.' },
            { name: 'Grilled Cheese Sandwich', cat: 'Fast Food', sub: 'Burgers and Sandwiches', price: 110, avail: true, img: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=800', desc: 'Toasted sandwich filled with melted cheese.' },
            { name: 'Corn Cheese Sandwich', cat: 'Fast Food', sub: 'Burgers and Sandwiches', price: 140, avail: true, img: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=800', desc: 'Sweet corn and melted cheese stuffed sandwich.' },
            { name: 'Paneer Tikka Sandwich', cat: 'Fast Food', sub: 'Burgers and Sandwiches', price: 160, avail: true, img: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=800', desc: 'Grilled sandwich filled with spiced paneer.' },
            // DESSERTS - Ice Cream
            { name: 'Chocolate Ice Cream', cat: 'Desserts', sub: 'Ice Cream', price: 110, avail: true, img: 'https://images.unsplash.com/photo-1511817462301-1b194de1ce1e?w=800', desc: 'Rich chocolate ice cream with premium cocoa.' },
            { name: 'Strawberry Ice Cream', cat: 'Desserts', sub: 'Ice Cream', price: 100, avail: true, img: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800', desc: 'Creamy strawberry-flavored ice cream.' },
            { name: 'Butterscotch Ice Cream', cat: 'Desserts', sub: 'Ice Cream', price: 120, avail: true, img: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800', desc: 'Sweet and nutty butterscotch flavored ice cream.' },
            { name: 'Chocolate Sundae', cat: 'Desserts', sub: 'Ice Cream', price: 180, avail: true, img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800', desc: 'Chocolate ice cream topped with fudge sauce.' },
            { name: 'Brownie with Ice Cream', cat: 'Desserts', sub: 'Ice Cream', price: 200, avail: true, img: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800', desc: 'Warm brownie served with vanilla ice cream.' },
            { name: 'Mango Ice Cream', cat: 'Desserts', sub: 'Ice Cream', price: 130, avail: true, img: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800', desc: 'Seasonal mango-flavored creamy ice cream.' },
            // DESSERTS - Indian Fusion
            { name: 'Gulab Jamun', cat: 'Desserts', sub: 'Indian Fusion Desserts', price: 90, avail: true, img: 'https://images.unsplash.com/photo-1666869986951-7f02b3f6a0b3?w=800', desc: 'Soft milk-solid dumplings soaked in rose-flavored sugar syrup.' },
            { name: 'Gajar Halwa', cat: 'Desserts', sub: 'Indian Fusion Desserts', price: 160, avail: true, img: 'https://images.unsplash.com/photo-1666869986951-7f02b3f6a0b3?w=800', desc: 'Slow-cooked carrot dessert with ghee and dry fruits.' },
            { name: 'Malai Kulfi', cat: 'Desserts', sub: 'Indian Fusion Desserts', price: 120, avail: true, img: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800', desc: 'Traditional frozen dessert made with thickened milk.' },
            { name: 'Shahi Tukda', cat: 'Desserts', sub: 'Indian Fusion Desserts', price: 180, avail: true, img: 'https://images.unsplash.com/photo-1666869986951-7f02b3f6a0b3?w=800', desc: 'Fried bread soaked in saffron milk and topped with rabdi.' },
            // BEVERAGES
            { name: 'Mango Lassi', cat: 'Beverages', sub: 'Mocktails and Coolers', price: 120, avail: true, img: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800', desc: 'Chilled yogurt drink blended with ripe Alphonso mangoes.' },
            { name: 'Paan Mojito', cat: 'Beverages', sub: 'Mocktails and Coolers', price: 170, avail: true, img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', desc: 'Mint cooler infused with paan flavor.' },
            { name: 'Watermelon Mint Cooler', cat: 'Beverages', sub: 'Mocktails and Coolers', price: 160, avail: true, img: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800', desc: 'Fresh watermelon juice blended with mint.' },
            { name: 'Lemon Iced Tea', cat: 'Beverages', sub: 'Mocktails and Coolers', price: 140, avail: true, img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800', desc: 'Chilled tea flavored with lemon.' },
            { name: 'Strawberry Cooler', cat: 'Beverages', sub: 'Mocktails and Coolers', price: 170, avail: true, img: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800', desc: 'Sweet and tangy strawberry-based drink.' },
            { name: 'Cold Coffee', cat: 'Beverages', sub: 'Mocktails and Coolers', price: 130, avail: true, img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800', desc: 'Creamy blended coffee with vanilla ice cream.' },
            { name: 'Masala Chai', cat: 'Beverages', sub: 'Mocktails and Coolers', price: 50, avail: true, img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800', desc: 'Indian spiced tea brewed with ginger and cardamom.' },
            { name: 'Rose Lemonade', cat: 'Beverages', sub: 'Mocktails and Coolers', price: 150, avail: true, img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800', desc: 'Refreshing lemonade infused with rose syrup.' },
        ];

        const menuDocs = [];
        for (const item of menuData) {
            const cloudUrl = await uploadImg(item.img, item.name.toLowerCase().replace(/\s+/g, '-'));
            menuDocs.push({
                name:        item.name,
                description: item.desc,
                price:       item.price,
                category:    C[item.cat],
                subcategory: S[item.sub],
                isAvailable: item.avail,
                image:       cloudUrl,
            });
        }

        const insertedMenu = await Menu.insertMany(menuDocs);

        res.json({
            success: true,
            message: `Seeded ${insertedCats.length} categories, ${insertedSubs.length} subcategories, ${insertedMenu.length} menu items with Cloudinary images!`,
        });
    } catch (err) {
        console.error('Seed error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
