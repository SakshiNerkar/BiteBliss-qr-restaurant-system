const Menu = require('../models/Menu');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

// --- MENU CONTROLLERS ---

// @desc    Get all menu items (Public or Admin filtered)
// @route   GET /api/menu
// @access  Public (Query param ?restaurantId=...) / Private (Admin)
const getMenu = async (req, res) => {
    try {
        let query = { isDeleted: false };

        // Search functionality
        if (req.query.search) {
            query.$text = { $search: req.query.search };
        }

        // Category filter
        if (req.query.category) {
            query.category = req.query.category;
        }

        const menu = await Menu.find(query)
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort({ category: 1, name: 1 });

        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a menu item
// @route   POST /api/menu
// @access  Private/Admin
const createMenu = async (req, res) => {
    let { name, description, price, category, subcategory, isAvailable } = req.body;
    let image = req.body.image || '';

    if (req.file) {
        image = '/' + req.file.path.replace(/\\/g, '/');
    }

    // Convert string 'true'/'false' from FormData
    if (typeof isAvailable === 'string') {
        isAvailable = isAvailable === 'true';
    }

    try {
        // Validate Category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({ message: 'Invalid category' });
        }

        // Enforce unique menu item name
        const itemExists = await Menu.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            isDeleted: false
        });
        if (itemExists) {
            return res.status(400).json({ message: 'A menu item with this name already exists.' });
        }

        if (subcategory) {
            const subcategoryExists = await Subcategory.findById(subcategory);
            if (!subcategoryExists) return res.status(400).json({ message: 'Invalid subcategory' });
        }

        const menuItem = new Menu({
            name,
            description,
            price: Number(price),
            category,
            subcategory: subcategory || null,
            image,
            isAvailable
        });

        const createdMenu = await menuItem.save();
        res.status(201).json(createdMenu);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
const updateMenu = async (req, res) => {
    let { name, description, price, category, subcategory, image, isAvailable } = req.body;

    if (req.file) {
        image = '/' + req.file.path.replace(/\\/g, '/');
    }

    // Convert string 'true'/'false' from FormData
    if (typeof isAvailable === 'string') {
        isAvailable = isAvailable === 'true';
    }

    try {
        const menuItem = await Menu.findById(req.params.id);

        if (menuItem) {
            menuItem.name = name || menuItem.name;
            menuItem.description = description !== undefined ? description : menuItem.description;
            menuItem.price = price !== undefined ? Number(price) : menuItem.price;
            if (image !== undefined) menuItem.image = image;
            if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;

            if (category) {
                const categoryExists = await Category.findById(category);
                if (!categoryExists) {
                    return res.status(400).json({ message: 'Invalid category' });
                }
                menuItem.category = category;
            }

            if (subcategory !== undefined) {
                if (subcategory === '') {
                    menuItem.subcategory = null;
                } else if (subcategory) {
                    const subExists = await Subcategory.findById(subcategory);
                    if (!subExists) return res.status(400).json({ message: 'Invalid subcategory' });
                    menuItem.subcategory = subcategory;
                }
            }

            const updatedMenu = await menuItem.save();
            res.json(updatedMenu);
        } else {
            res.status(404).json({ message: 'Menu item not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete (Soft) a menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
const deleteMenu = async (req, res) => {
    try {
        const menuItem = await Menu.findById(req.params.id);

        if (menuItem) {
            menuItem.isDeleted = true;
            await menuItem.save();
            res.json({ message: 'Menu item removed' });
        } else {
            res.status(404).json({ message: 'Menu item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- CATEGORY CONTROLLERS ---

// @desc    Get all categories
// @route   GET /api/category
// @access  Public (Query param ?restaurantId=...) / Private (Admin)
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isDeleted: false });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a category
// @route   POST /api/category
// @access  Private/Admin
const createCategory = async (req, res) => {
    const { name } = req.body;

    try {
        const categoryExists = await Category.findOne({ name });

        if (categoryExists) {
            res.status(400).json({ message: 'Category already exists' });
            return;
        }

        const category = await Category.create({ name });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a category
// @route   PUT /api/category/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
    const { name } = req.body;

    try {
        const category = await Category.findById(req.params.id);

        if (category) {
            category.name = name || category.name;
            const updatedCategory = await category.save();
            res.json(updatedCategory);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a category
// @route   DELETE /api/category/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (category) {
            category.isDeleted = true;
            await category.save();
            res.json({ message: 'Category removed' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMenu,
    createMenu,
    updateMenu,
    deleteMenu,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
