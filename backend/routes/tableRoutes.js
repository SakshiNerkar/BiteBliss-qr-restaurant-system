const express = require('express');
const router = express.Router();
const {
    getTables,
    createTable,
    deleteTable
} = require('../controllers/tableController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getTables)
    .post(protect, createTable);

router.route('/:id')
    .delete(protect, deleteTable);

module.exports = router;
