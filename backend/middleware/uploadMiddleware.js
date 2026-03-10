const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Cloudinary storage engine — images are uploaded directly to the cloud
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'bitebliss_menu',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
        transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
    },
});

const upload = multer({ storage });

module.exports = upload;
