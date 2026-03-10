const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Menu = require('../models/Menu');

// @desc    One-time seed route for demo data (exact replica of previous local DB)
// @route   GET /api/seed?secret=BiteBlissSeed2025
// @access  Semi-private (secret key required)
router.get('/', async (req, res) => {
    if (req.query.secret !== 'BiteBlissSeed2025') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        // -- 1. Clear existing data ----------------------------------------
        await Menu.deleteMany({});
        await Subcategory.deleteMany({});
        await Category.deleteMany({});

        // -- 2. Categories ---------------------------------------------------
        const catNames = ['Starters', 'Beverages', 'Desserts', 'Main Course', 'Rice and Breads', 'Fast Food'];
        const insertedCats = await Category.insertMany(catNames.map(name => ({ name })));
        const C = {};
        insertedCats.forEach(c => { C[c.name] = c._id; });

        // -- 3. Subcategories ------------------------------------------------
        const subData = [
            { name: 'Indian Veg Starters',       category: C['Starters'] },
            { name: 'Indo-Chinese Starters',      category: C['Starters'] },
            { name: 'North Indian Main Course',   category: C['Main Course'] },
            { name: 'Indo-Chinese Main Course',   category: C['Main Course'] },
            { name: 'Biryani and Rice',           category: C['Rice and Breads'] },
            { name: 'Indian Breads',              category: C['Rice and Breads'] },
            { name: 'Burgers and Sandwiches',     category: C['Fast Food'] },
            { name: 'Ice Cream',                  category: C['Desserts'] },
            { name: 'Indian Fusion Desserts',     category: C['Desserts'] },
            { name: 'Hot Desserts',               category: C['Desserts'] },
            { name: 'Mocktails',                  category: C['Beverages'] },
            { name: 'Fresh Juices',               category: C['Beverages'] },
            { name: 'Shakes and Smoothies',       category: C['Beverages'] },
            { name: 'Tea and Coffee',             category: C['Beverages'] },
            { name: 'Soft Drinks',                category: C['Beverages'] },
            { name: 'Signature Drinks',           category: C['Beverages'] },
            { name: 'Mocktails and Coolers',      category: C['Beverages'] },
        ];
        const insertedSubs = await Subcategory.insertMany(subData);
        const S = {};
        insertedSubs.forEach(s => { S[s.name] = s._id; });

        // -- 4. Menu Items ---------------------------------------------------
        const menuData = [
            // ── STARTERS / Indian Veg ────────────────────────────────────────
            { name: 'Aloo Tikki',               category: C['Starters'], subcategory: S['Indian Veg Starters'],     price: 120, isAvailable: true,  image: '/uploads/image-1772082607333.webp', description: 'Crispy potato patties seasoned with herbs and served with chutneys.' },
            { name: 'Cheese Corn Balls',        category: C['Starters'], subcategory: S['Indian Veg Starters'],     price: 180, isAvailable: true,  image: '/uploads/image-1772082731520.jpg',  description: 'Crunchy fried balls filled with melted cheese and sweet corn.' },
            { name: 'Paneer Tikka',             category: C['Starters'], subcategory: S['Indian Veg Starters'],     price: 230, isAvailable: true,  image: '/uploads/image-1772090069348.jpg',  description: 'Marinated paneer cubes grilled to perfection in tandoor.' },
            { name: 'Dahi Ke Sholay',           category: C['Starters'], subcategory: S['Indian Veg Starters'],     price: 180, isAvailable: true,  image: '/uploads/image-1772089998196.jpg',  description: 'Crispy fried yogurt-stuffed bread rolls.' },
            { name: 'Stuffed Mushroom',         category: C['Starters'], subcategory: S['Indian Veg Starters'],     price: 200, isAvailable: true,  image: '/uploads/image-1772090189314.png',  description: 'Mushrooms stuffed with spiced batter and deep fried.' },
            { name: 'Veg Seekh Kebab',          category: C['Starters'], subcategory: S['Indian Veg Starters'],     price: 190, isAvailable: true,  image: '/uploads/image-1772090287387.jpg',  description: 'Spiced vegetable kebabs skewered and grilled on open flame.' },
            { name: 'Tandoori Broccoli',        category: C['Starters'], subcategory: S['Indian Veg Starters'],     price: 210, isAvailable: true,  image: '/uploads/image-1772107108964.jpg',  description: 'Fresh broccoli marinated in tandoori spice and char-grilled.' },
            { name: 'Corn Pops',                category: C['Starters'], subcategory: S['Indian Veg Starters'],     price: 140, isAvailable: true,  image: '/uploads/image-1772107265396.jpg',  description: 'Crispy popcorn-style corn bites tossed in masala.' },
            // ── STARTERS / Indo-Chinese ──────────────────────────────────────
            { name: 'Chilli Paneer',            category: C['Starters'], subcategory: S['Indo-Chinese Starters'],   price: 230, isAvailable: true,  image: '/uploads/image-1772107983729.jpg',  description: 'Fried paneer tossed with capsicum and chili sauce.' },
            { name: 'Crispy Baby Corn',         category: C['Starters'], subcategory: S['Indo-Chinese Starters'],   price: 180, isAvailable: true,  image: '/uploads/image-1772130324936.jpg',  description: 'Golden fried baby corn served with tangy dip.' },
            { name: 'Veg Hakka Noodles (Starter Portion)', category: C['Starters'], subcategory: S['Indo-Chinese Starters'], price: 150, isAvailable: true, image: '/uploads/image-1772128416735.jpg', description: 'Stir-fried noodles with vegetables in chili-soy sauce.' },
            { name: 'Szechwan Paneer',          category: C['Starters'], subcategory: S['Indo-Chinese Starters'],   price: 200, isAvailable: true,  image: '/uploads/image-1772128504391.jpg',  description: 'Paneer in fiery Szechwan sauce with bell peppers.' },
            { name: 'Mushroom Pepper Fry',      category: C['Starters'], subcategory: S['Indo-Chinese Starters'],   price: 220, isAvailable: true,  image: '/uploads/image-1772128745195.jpg',  description: 'Mushrooms sautéed with black pepper and Asian spices.' },
            { name: 'Crispy Spinach',           category: C['Starters'], subcategory: S['Indo-Chinese Starters'],   price: 140, isAvailable: true,  image: '/uploads/image-1772130273536.jpg',  description: 'Thin crispy fried spinach leaves with chaat seasoning.' },

            // ── MAIN COURSE / North Indian ───────────────────────────────────
            { name: 'Paneer Butter Masala',     category: C['Main Course'], subcategory: S['North Indian Main Course'], price: 280, isAvailable: true, image: '/uploads/image-1772197133228.jpg', description: 'Rich creamy tomato-based curry with soft paneer chunks.' },
            { name: 'Kadai Paneer',             category: C['Main Course'], subcategory: S['North Indian Main Course'], price: 270, isAvailable: true, image: '/uploads/image-1772197205313.jpg', description: 'Paneer cooked in a spicy kadai masala with vegetables.' },
            { name: 'Shahi Paneer',             category: C['Main Course'], subcategory: S['North Indian Main Course'], price: 250, isAvailable: true, image: '/uploads/image-1772194858869.jpg', description: 'Paneer in rich, creamy mughlai gravy with nuts.' },
            { name: 'Malai Kofta',              category: C['Main Course'], subcategory: S['North Indian Main Course'], price: 260, isAvailable: true, image: '/uploads/image-1772197337605.jpg', description: 'Soft paneer and potato balls in a creamy tomato gravy.' },
            { name: 'Dal Makhani',              category: C['Main Course'], subcategory: S['North Indian Main Course'], price: 220, isAvailable: true, image: '/uploads/image-1772196520621.jpg', description: 'Slow-cooked black lentils in buttery tomato gravy.' },
            { name: 'Chole Masala',             category: C['Main Course'], subcategory: S['North Indian Main Course'], price: 210, isAvailable: true, image: '/uploads/image-1772194943772.jpg', description: 'Tangy and spicy North Indian chickpea curry.' },
            { name: 'Palak Paneer',             category: C['Main Course'], subcategory: S['North Indian Main Course'], price: 250, isAvailable: true, image: '/uploads/image-1772197488281.jpg', description: 'Paneer cubes in smooth spiced spinach gravy.' },
            { name: 'Methi Malai Matar',        category: C['Main Course'], subcategory: S['North Indian Main Course'], price: 240, isAvailable: true, image: '/uploads/image-1772197438637.jpg', description: 'Green peas and fenugreek leaves in creamy sauce.' },
            { name: 'Veg Kolhapuri',            category: C['Main Course'], subcategory: S['North Indian Main Course'], price: 210, isAvailable: true, image: '/uploads/image-1772197011594.jpg', description: 'Spicy mixed vegetable curry in Kolhapuri masala.' },
            { name: 'Dum Aloo',                 category: C['Main Course'], subcategory: S['North Indian Main Course'], price: 200, isAvailable: true, image: '/uploads/image-1772196712388.jpg', description: 'Baby potatoes slow-cooked in aromatic gravy.' },
            // ── MAIN COURSE / Indo-Chinese ───────────────────────────────────
            { name: 'Veg Manchurian Gravy',     category: C['Main Course'], subcategory: S['Indo-Chinese Main Course'], price: 200, isAvailable: true, image: '/uploads/image-1772196431537.jpg', description: 'Vegetable balls tossed in spicy Manchurian sauce.' },
            { name: 'Paneer Manchurian',        category: C['Main Course'], subcategory: S['Indo-Chinese Main Course'], price: 240, isAvailable: true, image: '/uploads/image-1772193648314.jpg', description: 'Crispy paneer in tangy Manchurian sauce.' },
            { name: 'Veg Hakka Noodles',        category: C['Main Course'], subcategory: S['Indo-Chinese Main Course'], price: 180, isAvailable: true, image: '/uploads/image-1772196365679.jpg', description: 'Stir-fried Chinese noodles with mixed vegetables.' },
            { name: 'Szechwan Noodles',         category: C['Main Course'], subcategory: S['Indo-Chinese Main Course'], price: 190, isAvailable: true, image: '/uploads/image-1772194478223.jpg', description: 'Spicy Szechwan-style noodles with crunchy vegetables.' },
            { name: 'Veg Fried Rice',           category: C['Main Course'], subcategory: S['Indo-Chinese Main Course'], price: 170, isAvailable: true, image: '/uploads/image-1772196320607.jpg', description: 'Wok-tossed rice with mixed vegetables and soy sauce.' },
            { name: 'Paneer Fried Rice',        category: C['Main Course'], subcategory: S['Indo-Chinese Main Course'], price: 210, isAvailable: true, image: '/uploads/image-1772193586814.jpg', description: 'Fried rice tossed with paneer and oriental spices.' },
            { name: 'Mushroom Chilli Gravy',    category: C['Main Course'], subcategory: S['Indo-Chinese Main Course'], price: 230, isAvailable: true, image: '/uploads/image-1772193256270.jpg', description: 'Mushrooms in spicy chilli garlic sauce.' },
            { name: 'Baby Corn Manchurian',     category: C['Main Course'], subcategory: S['Indo-Chinese Main Course'], price: 210, isAvailable: true, image: '/uploads/image-1772187140738.jpg', description: 'Crispy baby corn in tangy Manchurian gravy.' },
            { name: 'Veg American Chopsuey',    category: C['Main Course'], subcategory: S['Indo-Chinese Main Course'], price: 180, isAvailable: true, image: '/uploads/image-1772196122413.jpg', description: 'Crispy noodles topped with sweet and sour vegetable sauce.' },
            { name: 'Triple Schezwan Rice',     category: C['Main Course'], subcategory: S['Indo-Chinese Main Course'], price: 260, isAvailable: true, image: '/uploads/image-1772194907809.jpg', description: 'Triple portion Schezwan rice with extra vegetables.' },

            // ── RICE AND BREADS / Biryani ─────────────────────────────────────
            { name: 'Veg Biryani',              category: C['Rice and Breads'], subcategory: S['Biryani and Rice'], price: 250, isAvailable: true, image: '/uploads/image-1772197557318.jpg', description: 'Fragrant basmati rice cooked with vegetables and whole spices.' },
            { name: 'Paneer Biryani',           category: C['Rice and Breads'], subcategory: S['Biryani and Rice'], price: 280, isAvailable: true, image: '/uploads/image-1772197522771.jpg', description: 'Aromatic dum biryani with marinated paneer cubes.' },
            { name: 'Dum Veg Biryani',          category: C['Rice and Breads'], subcategory: S['Biryani and Rice'], price: 230, isAvailable: true, image: '/uploads/image-1772196565566.jpg', description: 'Slow-cooked dum biryani with fresh vegetables.' },
            { name: 'Jeera Rice',               category: C['Rice and Breads'], subcategory: S['Biryani and Rice'], price: 150, isAvailable: true, image: '/uploads/image-1772197600631.jpg', description: 'Basmati rice tempered with whole cumin.' },
            { name: 'Veg Pulao',                category: C['Rice and Breads'], subcategory: S['Biryani and Rice'], price: 180, isAvailable: true, image: '/uploads/image-1772196604773.jpg', description: 'Light rice cooked with mixed vegetables.' },
            { name: 'Lemon Rice',               category: C['Rice and Breads'], subcategory: S['Biryani and Rice'], price: 140, isAvailable: true, image: '/uploads/image-1772197390898.jpg', description: 'South Indian lemon-flavored rice with peanuts.' },
            { name: 'Curd Rice',                category: C['Rice and Breads'], subcategory: S['Biryani and Rice'], price: 130, isAvailable: true, image: '/uploads/image-1772108669908.jpg', description: 'Comforting South Indian rice mixed with thick curd.' },
            { name: 'Szechwan Rice',            category: C['Rice and Breads'], subcategory: S['Biryani and Rice'], price: 180, isAvailable: true, image: '/uploads/image-1772197707391.jpg', description: 'Spicy Szechwan fried rice with vegetables.' },
            { name: 'Steamed Rice',             category: C['Rice and Breads'], subcategory: S['Biryani and Rice'], price: 100, isAvailable: true, image: '/uploads/image-1772197640303.jpg', description: 'Plain steamed basmati rice.' },
            // ── RICE AND BREADS / Indian Breads ──────────────────────────────
            { name: 'Butter Naan',              category: C['Rice and Breads'], subcategory: S['Indian Breads'], price: 50,  isAvailable: true, image: '/uploads/image-1772193298671.jpg', description: 'Soft leavened bread baked in tandoor, brushed with butter.' },
            { name: 'Garlic Naan',              category: C['Rice and Breads'], subcategory: S['Indian Breads'], price: 60,  isAvailable: true, image: '/uploads/image-1772196645663.jpg', description: 'Naan topped with fresh garlic and coriander.' },
            { name: 'Tandoori Roti',            category: C['Rice and Breads'], subcategory: S['Indian Breads'], price: 30,  isAvailable: true, image: '/uploads/image-1772193214849.jpg', description: 'Whole wheat bread baked in clay oven.' },
            { name: 'Butter Roti',              category: C['Rice and Breads'], subcategory: S['Indian Breads'], price: 40,  isAvailable: true, image: '/uploads/image-1772196784989.jpg', description: 'Whole wheat roti brushed with butter.' },
            { name: 'Laccha Paratha',           category: C['Rice and Breads'], subcategory: S['Indian Breads'], price: 50,  isAvailable: false, image: '/uploads/image-1772193821214.jpg', description: 'Layered flaky paratha made with whole wheat flour.' },
            { name: 'Stuffed Kulcha',           category: C['Rice and Breads'], subcategory: S['Indian Breads'], price: 70,  isAvailable: true, image: '/uploads/image-1772194434480.jpg', description: 'Leavened flatbread stuffed with spiced potato filling.' },
            { name: 'Cheese Naan',              category: C['Rice and Breads'], subcategory: S['Indian Breads'], price: 80,  isAvailable: true, image: '/uploads/image-1772196868142.jpg', description: 'Naan filled and topped with melted cheese.' },
            { name: 'Plain Naan',               category: C['Rice and Breads'], subcategory: S['Indian Breads'], price: 40,  isAvailable: true, image: '/uploads/image-1772196269821.jpg', description: 'Classic tandoor-baked leavened bread.' },
            { name: 'Missi Roti',               category: C['Rice and Breads'], subcategory: S['Indian Breads'], price: 45,  isAvailable: true, image: '/uploads/image-1772196484188.jpg', description: 'Besan and wheat blend flatbread with spices.' },
            { name: 'Pudina Paratha',           category: C['Rice and Breads'], subcategory: S['Indian Breads'], price: 50,  isAvailable: true, image: '/uploads/image-1772194980410.jpg', description: 'Mint-flavored multi-layered paratha.' },

            // ── FAST FOOD / Burgers and Sandwiches ───────────────────────────
            { name: 'Paneer Burger',            category: C['Fast Food'], subcategory: S['Burgers and Sandwiches'], price: 150, isAvailable: true, image: '/uploads/image-1772186707592.jpg', description: 'Crispy paneer patty in a soft bun with fresh toppings.' },
            { name: 'Cheese Burger',            category: C['Fast Food'], subcategory: S['Burgers and Sandwiches'], price: 140, isAvailable: true, image: '/uploads/image-1772129927543.jpg', description: 'Classic burger loaded with melted cheese slices.' },
            { name: 'Peri Peri Burger',         category: C['Fast Food'], subcategory: S['Burgers and Sandwiches'], price: 160, isAvailable: true, image: '/uploads/image-1772186854303.jpg', description: 'Spicy peri peri flavored burger with crispy fries.' },
            { name: 'Veg Club Sandwich',        category: C['Fast Food'], subcategory: S['Burgers and Sandwiches'], price: 130, isAvailable: true, image: '/uploads/image-1772186783187.jpg', description: 'Triple-layered club sandwich with fresh vegetables.' },
            { name: 'Grilled Cheese Sandwich',  category: C['Fast Food'], subcategory: S['Burgers and Sandwiches'], price: 110, isAvailable: true, image: '/uploads/image-1772130376805.jpg', description: 'Toasted sandwich filled with melted cheese.' },
            { name: 'Veg Mayo Sandwich',        category: C['Fast Food'], subcategory: S['Burgers and Sandwiches'], price: 100, isAvailable: true, image: '/uploads/image-1772130611824.jpg', description: 'Soft bread filled with vegetable mayo mixture.' },
            { name: 'Paneer Tikka Sandwich',    category: C['Fast Food'], subcategory: S['Burgers and Sandwiches'], price: 160, isAvailable: true, image: '/uploads/image-1772186820669.jpg', description: 'Grilled sandwich filled with spiced paneer.' },
            { name: 'Corn Cheese Sandwich',     category: C['Fast Food'], subcategory: S['Burgers and Sandwiches'], price: 140, isAvailable: true, image: '/uploads/image-1772130195522.jpg', description: 'Sweet corn and melted cheese stuffed sandwich.' },
            { name: 'Mushroom Sandwich',        category: C['Fast Food'], subcategory: S['Burgers and Sandwiches'], price: 150, isAvailable: true, image: '/uploads/image-1772130571302.jpg', description: 'Sautéed mushrooms layered inside toasted bread.' },

            // ── DESSERTS / Ice Cream ──────────────────────────────────────────
            { name: 'Vanilla Ice Cream',        category: C['Desserts'], subcategory: S['Ice Cream'], price: 90,  isAvailable: false, image: '/uploads/image-1772128234155.jpg', description: 'Classic creamy vanilla ice cream with smooth texture.' },
            { name: 'Chocolate Ice Cream',      category: C['Desserts'], subcategory: S['Ice Cream'], price: 110, isAvailable: true,  image: '/uploads/image-1772128061006.jpg', description: 'Rich chocolate ice cream made with premium cocoa.' },
            { name: 'Strawberry Ice Cream',     category: C['Desserts'], subcategory: S['Ice Cream'], price: 100, isAvailable: true,  image: '/uploads/image-1772129638982.jpg', description: 'Creamy strawberry-flavored ice cream with fruity notes.' },
            { name: 'Butterscotch Ice Cream',   category: C['Desserts'], subcategory: S['Ice Cream'], price: 120, isAvailable: true,  image: '/uploads/image-1772128023248.jpg', description: 'Sweet and nutty butterscotch flavored ice cream.' },
            { name: 'Chocolate Sundae',         category: C['Desserts'], subcategory: S['Ice Cream'], price: 180, isAvailable: true,  image: '/uploads/image-1772128181374.jpg', description: 'Chocolate ice cream topped with fudge sauce.' },
            { name: 'Brownie with Ice Cream',   category: C['Desserts'], subcategory: S['Ice Cream'], price: 200, isAvailable: true,  image: '/uploads/image-1772108401277.jpg', description: 'Warm brownie served with vanilla ice cream.' },
            { name: 'Oreo Sundae',              category: C['Desserts'], subcategory: S['Ice Cream'], price: 190, isAvailable: true,  image: '/uploads/image-1772129250152.jpg', description: 'Ice cream layered with crushed Oreo cookies.' },
            { name: 'Mango Ice Cream',          category: C['Desserts'], subcategory: S['Ice Cream'], price: 130, isAvailable: true,  image: '/uploads/image-1772129087909.jpg', description: 'Seasonal mango-flavored creamy ice cream.' },
            { name: 'Paan Ice Cream',           category: C['Desserts'], subcategory: S['Ice Cream'], price: 140, isAvailable: true,  image: '/uploads/image-1772129745274.jpg', description: 'Ice cream infused with refreshing paan flavor.' },
            { name: 'Dry Fruit Sundae',         category: C['Desserts'], subcategory: S['Ice Cream'], price: 180, isAvailable: true,  image: '/uploads/image-1772128987155.jpg', description: 'Ice cream topped with assorted nuts and syrup.' },
            // ── DESSERTS / Indian Fusion ──────────────────────────────────────
            { name: 'Gulab Jamun Cheesecake',   category: C['Desserts'], subcategory: S['Indian Fusion Desserts'], price: 250, isAvailable: true, image: '/uploads/image-1772185861014.jpg', description: 'Creamy cheesecake topped with mini gulab jamuns and saffron syrup.' },
            { name: 'Rasmalai Tres Leches',     category: C['Desserts'], subcategory: S['Indian Fusion Desserts'], price: 230, isAvailable: true, image: '/uploads/image-1772186564476.jpg', description: 'Milk-soaked sponge cake layered with rasmalai cream.' },
            { name: 'Chocolate Samosa',         category: C['Desserts'], subcategory: S['Indian Fusion Desserts'], price: 150, isAvailable: true, image: '/uploads/image-1772129990167.jpg', description: 'Crispy pastry filled with molten chocolate.' },
            { name: 'Paan Mousse',              category: C['Desserts'], subcategory: S['Indian Fusion Desserts'], price: 150, isAvailable: true, image: '/uploads/image-1772186513547.jpg', description: 'Smooth mousse infused with traditional paan flavors.' },
            { name: 'Shahi Tukda',              category: C['Desserts'], subcategory: S['Indian Fusion Desserts'], price: 180, isAvailable: true, image: '/uploads/image-1772186612118.jpg', description: 'Fried bread soaked in saffron milk and topped with rabdi.' },
            { name: 'Gajar Halwa',              category: C['Desserts'], subcategory: S['Indian Fusion Desserts'], price: 160, isAvailable: true, image: '/uploads/image-1772185815241.jpg', description: 'Slow-cooked carrot dessert with ghee and dry fruits.' },
            { name: 'Moong Dal Halwa',          category: C['Desserts'], subcategory: S['Indian Fusion Desserts'], price: 170, isAvailable: true, image: '/uploads/image-1772186455753.jpg', description: 'Rich lentil halwa cooked with pure ghee.' },
            { name: 'Malai Kulfi',              category: C['Desserts'], subcategory: S['Indian Fusion Desserts'], price: 120, isAvailable: true, image: '/uploads/image-1772185940732.jpg', description: 'Traditional frozen dessert made with thickened milk.' },
            { name: 'Coconut Ladoo',            category: C['Desserts'], subcategory: S['Indian Fusion Desserts'], price: 100, isAvailable: true, image: '/uploads/image-1772130530402.jpg', description: 'Sweet coconut balls flavored with cardamom.' },
            { name: 'Kesar Pista Kulfi',        category: C['Desserts'], subcategory: S['Indian Fusion Desserts'], price: 140, isAvailable: true, image: '/uploads/image-1772185906066.jpg', description: 'Saffron and pistachio flavored traditional kulfi.' },

            // ── BEVERAGES / Mocktails and Coolers ─────────────────────────────
            { name: 'Watermelon Mint Cooler',   category: C['Beverages'], subcategory: S['Mocktails and Coolers'], price: 160, isAvailable: true, image: '/uploads/image-1772110136051.jpg', description: 'Fresh watermelon juice blended with mint.' },
            { name: 'Paan Mojito',              category: C['Beverages'], subcategory: S['Mocktails and Coolers'], price: 170, isAvailable: true, image: '/uploads/image-1772108313675.jpg', description: 'Mint cooler infused with paan flavor.' },
            { name: 'Lemon Iced Tea',           category: C['Beverages'], subcategory: S['Mocktails and Coolers'], price: 140, isAvailable: true, image: '/uploads/image-1772108332060.jpg', description: 'Chilled tea flavored with lemon.' },
            { name: 'Peach Iced Tea',           category: C['Beverages'], subcategory: S['Mocktails and Coolers'], price: 160, isAvailable: true, image: '/uploads/image-1772108705520.jpg', description: 'Iced tea blended with peach syrup.' },
            { name: 'Strawberry Cooler',        category: C['Beverages'], subcategory: S['Mocktails and Coolers'], price: 170, isAvailable: true, image: '/uploads/image-1772108840631.jpg', description: 'Sweet and tangy strawberry-based drink.' },
            { name: 'Pineapple Mint Cooler',    category: C['Beverages'], subcategory: S['Mocktails and Coolers'], price: 160, isAvailable: true, image: '/uploads/image-1772108744858.jpg', description: 'Fresh pineapple blended with mint.' },
            { name: 'Rose Lemonade',            category: C['Beverages'], subcategory: S['Mocktails and Coolers'], price: 150, isAvailable: true, image: '/uploads/image-1772108787612.jpg', description: 'Refreshing lemonade infused with rose syrup.' },
            { name: 'Green Apple Fizz',         category: C['Beverages'], subcategory: S['Mocktails and Coolers'], price: 170, isAvailable: true, image: '/uploads/image-1772108323206.jpg', description: 'Tangy green apple flavored sparkling drink.' },
        ];

        const insertedMenu = await Menu.insertMany(menuData);

        res.json({
            success: true,
            message: `✅ Seeded ${insertedCats.length} categories, ${insertedSubs.length} subcategories, and ${insertedMenu.length} menu items into Atlas!`,
        });
    } catch (err) {
        console.error('Seed error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
