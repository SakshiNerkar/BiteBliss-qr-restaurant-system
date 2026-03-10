const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = mongoose.Schema({
    adminName: {
        type: String,
        required: [true, 'Admin name is required'],
        trim: true
    },
    restaurantName: {
        type: String,
        required: [true, 'Restaurant name is required'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    // Retaining username for backward compatibility but email is preferred login
    username: {
        type: String,
        unique: true,
        sparse: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Security: Do not return password by default
    },
    role: {
        type: String,
        enum: ['Admin', 'Manager', 'Staff'],
        default: 'Admin'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    logo: {
        type: String
    },
    themeColor: {
        type: String,
        default: '#3b82f6'
    },
    settings: {
        currency: { type: String, default: 'USD' },
        timezone: { type: String, default: 'UTC' }
    }
}, {
    timestamps: true
});

// Method to check entered password
adminSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save middleware to hash password
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
