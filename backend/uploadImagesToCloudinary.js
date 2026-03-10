// ============================================================
// BiteBliss - Bulk Image Upload to Cloudinary
// Usage: node uploadImagesToCloudinary.js
// Reads Atlas URI from .env.atlas file (ATLAS_URI= ...)
// ============================================================

const mongoose = require('mongoose');
const path     = require('path');
const fs       = require('fs');

// Load main .env first (for Cloudinary keys), then .env.atlas (for Atlas URI)
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '.env.atlas'), override: false });

const cloudinary = require('./config/cloudinary');
const Menu       = require('./models/Menu');

const ATLAS_URI = process.env.ATLAS_URI;
if (!ATLAS_URI) {
    console.error('\n❌  ATLAS_URI not found in .env.atlas file.\n');
    process.exit(1);
}

const UPLOADS_DIR = path.join(__dirname, 'uploads');

const run = async () => {
    await mongoose.connect(ATLAS_URI);
    console.log('✅  Connected to MongoDB Atlas\n');

    const items = await Menu.find({ image: /^\/uploads\// });
    console.log(`🔍  Found ${items.length} items with local /uploads/ images\n`);

    let success = 0;
    let skipped = 0;
    let failed  = 0;

    for (const item of items) {
        const filename  = path.basename(item.image);
        const localPath = path.join(UPLOADS_DIR, filename);

        if (!fs.existsSync(localPath)) {
            console.log(`⚠️   SKIPPED (file missing): ${filename}`);
            skipped++;
            continue;
        }

        try {
            const result = await cloudinary.uploader.upload(localPath, {
                folder:         'bitebliss_menu',
                public_id:      path.parse(filename).name,
                overwrite:      true,
                transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
            });

            await Menu.findByIdAndUpdate(item._id, { image: result.secure_url });
            console.log(`✅  ${item.name.padEnd(35)} → uploaded`);
            success++;
        } catch (err) {
            console.error(`❌  FAILED (${item.name}): ${err.message}`);
            failed++;
        }
    }

    console.log('\n' + '─'.repeat(60));
    console.log(`✅  Uploaded : ${success}`);
    console.log(`⚠️   Skipped  : ${skipped}  (local file not found)`);
    console.log(`❌  Failed   : ${failed}`);
    console.log('─'.repeat(60));
    console.log('🎉  Done! All images are now on Cloudinary.\n');

    await mongoose.disconnect();
};

run().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
