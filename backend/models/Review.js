const mongoose = require('mongoose');
const Menu = require('./Menu');

const reviewSchema = mongoose.Schema({
    menuId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        required: [true, 'Review must belong to a menu item']
    },
    tableNo: {
        type: Number,
        required: [true, 'Review must come from a table']
    },
    reviewerName: {
        type: String,
        default: 'Guest',
        trim: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Review must have a rating']
    },
    reviewText: {
        type: String,
        required: [true, 'Review cannot be empty']
    }
}, {
    timestamps: true
});

// Calculate average rating after save
reviewSchema.statics.calcAverageRatings = async function (menuId) {
    const stats = await this.aggregate([
        {
            $match: { menuId }
        },
        {
            $group: {
                _id: '$menuId',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await Menu.findByIdAndUpdate(menuId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Menu.findByIdAndUpdate(menuId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};

reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.menuId);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
    if (doc) {
        await doc.constructor.calcAverageRatings(doc.menuId);
    }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
