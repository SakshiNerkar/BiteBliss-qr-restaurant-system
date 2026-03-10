const mongoose = require('mongoose');

const menuSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Menu name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price must be positive']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory'
    },
    image: {
        type: String
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10 // 4.66666 => 4.7
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for Performance
menuSchema.index({ category: 1 });
menuSchema.index({ name: 1 });

// Partial Index for Soft Deletes (Faster queries ignoring deleted items)
menuSchema.index({ isDeleted: 1 }, { partialFilterExpression: { isDeleted: false } });

// Text Index for Search
menuSchema.index({ name: 'text', description: 'text' });

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;
