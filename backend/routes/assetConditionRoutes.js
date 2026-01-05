const express = require('express');
const router = express.Router();
const { uploadBeforeImages, uploadAfterImages, getAssetCondition } = require('../controllers/assetConditionController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multer.config');

// Get Condition
router.get('/booking/:bookingId/asset-condition', authMiddleware, getAssetCondition);

// Upload Before Images (Owner)
router.post('/upload-before-images', authMiddleware, upload.array('images', 10), uploadBeforeImages);

// Upload After Images (Renter)
router.post('/upload-after-images', authMiddleware, upload.array('images', 10), uploadAfterImages);

module.exports = router;
