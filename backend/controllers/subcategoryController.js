const Subcategory = require('../models/Subcategory');
const Menu = require('../models/Menu');

// @desc    Get all subcategories (optionally filter by category)
// @route   GET /api/subcategories
// @access  Public (or Private if you prefer)
const getSubcategories = async (req, res) => {
    try {
        const filter = { isDeleted: false };
        if (req.query.category) {
            filter.category = req.query.category;
        }

        const subcategories = await Subcategory.find(filter).populate('category', 'name').sort({ name: 1 });
        res.json(subcategories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a subcategory
// @route   POST /api/subcategories
// @access  Private/Admin
const createSubcategory = async (req, res) => {
    try {
        const { name, category } = req.body;

        if (!name || !category) {
            return res.status(400).json({ message: 'Name and Category are required' });
        }

        const subcategoryExists = await Subcategory.findOne({ name, category, isDeleted: false });

        if (subcategoryExists) {
            return res.status(400).json({ message: 'Subcategory already exists in this category' });
        }

        const subcategory = await Subcategory.create({
            name,
            category
        });

        res.status(201).json(subcategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a subcategory
// @route   PUT /api/subcategories/:id
// @access  Private/Admin
const updateSubcategory = async (req, res) => {
    try {
        const { name, category } = req.body;
        const subcategory = await Subcategory.findById(req.params.id);

        if (subcategory) {
            subcategory.name = name || subcategory.name;
            subcategory.category = category || subcategory.category;

            const updatedSubcategory = await subcategory.save();
            res.json(updatedSubcategory);
        } else {
            res.status(404).json({ message: 'Subcategory not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a subcategory (soft delete)
// @route   DELETE /api/subcategories/:id
// @access  Private/Admin
const deleteSubcategory = async (req, res) => {
    try {
        const subcategory = await Subcategory.findById(req.params.id);

        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        // Check if subcategory has active menu items
        const menuItems = await Menu.find({ subcategory: req.params.id, isDeleted: false });
        if (menuItems.length > 0) {
            return res.status(400).json({ message: 'Cannot delete subcategory with active menu items' });
        }

        subcategory.isDeleted = true;
        await subcategory.save();
        res.json({ message: 'Subcategory removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory
};
