const mongoose = require('mongoose');

const tableSchema = mongoose.Schema({
    tableNo: {
        type: Number,
        required: [true, 'Table number is required']
    },
    qrCodeUrl: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index: Table Number must be unique
tableSchema.index({ tableNo: 1 }, { unique: true });

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
