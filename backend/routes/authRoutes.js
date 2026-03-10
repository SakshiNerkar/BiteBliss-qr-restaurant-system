const express = require('express');
const router = express.Router();
const { authAdmin, registerAdmin, getAdminProfile, updateAdminProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', authAdmin);
router.post('/register', registerAdmin);

router.route('/profile')
    .get(protect, getAdminProfile)
    .put(protect, updateAdminProfile);

module.exports = router;
