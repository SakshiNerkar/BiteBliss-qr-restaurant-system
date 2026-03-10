const express = require('express');
const router = express.Router();
const {
    getMenu,
    createMenu,
    updateMenu,
    deleteMenu,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Menu routes
router.route('/menu')
    .get(getMenu)
    .post(protect, upload.single('image'), createMenu);

router.route('/menu/:id')
    .put(protect, upload.single('image'), updateMenu)
    .delete(protect, deleteMenu);

// Category routes
router.route('/category')
    .get(getCategories)
    .post(protect, createCategory);

router.route('/category/:id')
    .put(protect, updateCategory)
    .delete(protect, deleteCategory);

module.exports = router;
