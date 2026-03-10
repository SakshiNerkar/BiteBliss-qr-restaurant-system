const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
const authAdmin = async (req, res) => {
    const { email, password } = req.body;

    // Allow login with either email or unique restaurantName (if implemented)
    // For now, sticking to email as primary
    const admin = await Admin.findOne({ email }).select('+password');

    if (admin && (await admin.matchPassword(password))) {
        res.json({
            _id: admin._id,
            adminName: admin.adminName,
            restaurantName: admin.restaurantName,
            email: admin.email,
            role: admin.role,
            token: generateToken(admin._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new admin (restaurant)
// @route   POST /api/auth/register
// @access  Public
const registerAdmin = async (req, res) => {
    const {
        adminName,
        restaurantName,
        email,
        password,
        phone,
        address
    } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
        res.status(400).json({ message: 'Admin with this email already exists' });
        return;
    }

    const restaurantExists = await Admin.findOne({ restaurantName });
    if (restaurantExists) {
        res.status(400).json({ message: 'Restaurant name already taken' });
        return;
    }

    const admin = await Admin.create({
        adminName,
        restaurantName,
        email,
        password,
        phone,
        address
    });

    if (admin) {
        res.status(201).json({
            _id: admin._id,
            adminName: admin.adminName,
            restaurantName: admin.restaurantName,
            email: admin.email,
            role: admin.role,
            token: generateToken(admin._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid admin data' });
    }
};

// @desc    Get admin profile
// @route   GET /api/auth/profile
// @access  Private
const getAdminProfile = async (req, res) => {
    const admin = await Admin.findById(req.admin._id);

    if (admin) {
        res.json({
            _id: admin._id,
            adminName: admin.adminName,
            restaurantName: admin.restaurantName,
            email: admin.email,
            phone: admin.phone || '',
            address: admin.address || '',
            role: admin.role,
        });
    } else {
        res.status(404).json({ message: 'Admin not found' });
    }
};

// @desc    Update admin profile
// @route   PUT /api/auth/profile
// @access  Private
const updateAdminProfile = async (req, res) => {
    const admin = await Admin.findById(req.admin._id).select('+password');

    if (admin) {
        admin.adminName = req.body.adminName || admin.adminName;
        admin.restaurantName = req.body.restaurantName || admin.restaurantName;
        admin.email = req.body.email || admin.email;
        admin.phone = req.body.phone !== undefined ? req.body.phone : admin.phone;
        admin.address = req.body.address !== undefined ? req.body.address : admin.address;

        if (req.body.password) {
            admin.password = req.body.password;
        }

        const updatedAdmin = await admin.save();

        res.json({
            _id: updatedAdmin._id,
            adminName: updatedAdmin.adminName,
            restaurantName: updatedAdmin.restaurantName,
            email: updatedAdmin.email,
            phone: updatedAdmin.phone,
            address: updatedAdmin.address,
            role: updatedAdmin.role,
            token: generateToken(updatedAdmin._id),
        });
    } else {
        res.status(404).json({ message: 'Admin not found' });
    }
};

module.exports = { authAdmin, registerAdmin, getAdminProfile, updateAdminProfile };
