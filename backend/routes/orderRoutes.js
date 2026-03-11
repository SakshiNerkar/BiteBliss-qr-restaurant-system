const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrders,
    updateOrderStatus,
    getTableOrderStatus
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(addOrderItems)
    .get(protect, getOrders);

router.route('/table/:tableNo/status')
    .get(getTableOrderStatus);

router.route('/:id/status')
    .put(updateOrderStatus);

module.exports = router;
