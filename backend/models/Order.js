const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    tableNo: {
        type: Number,
        required: [true, 'Table number is required'],
        immutable: true // Cannot be changed once set
    },
    items: [
        {
            menuId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Menu',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Quantity must be at least 1']
            },
            priceAtOrderTime: {
                type: Number,
                required: true
            },
            subtotal: {
                type: Number,
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative']
    },
    status: {
        type: String,
        enum: ['Pending', 'Preparing', 'Ready', 'Served', 'Paid', 'Cancelled'],
        default: 'Pending'
    },
    notes: {
        type: String,
        default: ''
    },
    // --- PAYMENT FIELDS ---
    paymentId: {
        type: String
    },
    paymentProvider: {
        type: String,
        enum: ['Stripe', 'Razorpay', 'Cash', 'UPI'],
        default: 'Stripe'
    },
    paymentMode: {
        type: String,
        enum: ['Card', 'Cash', 'UPI', 'None'],
        default: 'None'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Requested', 'Paid', 'Failed'],
        default: 'Pending'
    },
    paidAt: {
        type: Date
    },
    paymentMetadata: {
        type: Object
    },
    paymentAttempts: {
        type: Number,
        default: 0
    },
    isPaid: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentId: 1 }); // For fast lookup during webhook

// Middleware to prevent modification of items or reduction of precision
orderSchema.pre('save', function () {
    // STRICT LOCKING: If paid, prevent ANY modification
    if (!this.isNew && this.isPaid && this.isModified()) {
        const modifiedPaths = this.modifiedPaths();
        if (modifiedPaths.includes('totalAmount') || modifiedPaths.includes('items')) {
            throw new Error('Cannot modify paid order critical fields.');
        }
    }
});

// Middleware to calculate totalAmount (TRUST NO ONE)
orderSchema.pre('validate', function () {
    if (this.items && this.items.length > 0) {
        let total = 0;
        this.items.forEach(item => {
            item.subtotal = item.quantity * item.priceAtOrderTime;
            total += item.subtotal;
        });
        this.totalAmount = total;
    }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
