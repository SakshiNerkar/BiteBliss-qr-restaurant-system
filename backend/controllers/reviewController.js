const Review = require('../models/Review');
const Menu = require('../models/Menu');
const Order = require('../models/Order');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Public
const createReview = async (req, res) => {
    try {
        const { menuId, tableNo, reviewerName, rating, reviewText } = req.body;

        if (!menuId || !tableNo || !rating || !reviewText) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Validate that this table has ordered and paid for this item
        const hasOrdered = await Order.findOne({
            tableNo: Number(tableNo),
            'items.menuId': menuId,
            isPaid: true
        });

        if (!hasOrdered) {
            return res.status(403).json({ message: 'You can only review items you have ordered and paid for.' });
        }

        // Check if already reviewed (optional depending on rules, but we'll allow multiple or just prevent spam if needed. Let's prevent multiple reviews from same table recently)
        const recentReview = await Review.findOne({
            menuId,
            tableNo,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // within 24 hours
        });

        if (recentReview) {
            return res.status(400).json({ message: 'You have already reviewed this item recently.' });
        }

        const review = await Review.create({
            menuId,
            tableNo,
            reviewerName: reviewerName || 'Guest',
            rating: Number(rating),
            reviewText
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reviews for a menu item
// @route   GET /api/reviews/:menuId
// @access  Public
const getReviews = async (req, res) => {
    try {
        const { menuId } = req.params;

        const reviews = await Review.find({ menuId }).sort({ createdAt: -1 }).limit(10);

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReview,
    getReviews
};
