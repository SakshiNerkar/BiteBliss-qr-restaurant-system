const express = require('express');
const router = express.Router();
const {
    getSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory
} = require('../controllers/subcategoryController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(getSubcategories)
    .post(protect, createSubcategory);

router.route('/:id')
    .put(protect, updateSubcategory)
    .delete(protect, deleteSubcategory);

module.exports = router;
