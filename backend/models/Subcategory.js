const mongoose = require('mongoose');

const subcategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subcategory name is required'],
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Parent Category is required']
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound Index: Subcategory name must be unique within a Category
subcategorySchema.index({ category: 1, name: 1 }, { unique: true });

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

module.exports = Subcategory;
