const express = require('express');
const { uploadAudioAndAnalyze } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Error handler wrapper for Multer limits or file filter rejections
const handleUpload = (req, res, next) => {
  const uploadSingle = upload.single('audio');

  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('Multer file upload error:', err.message);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// @route   POST /api/upload
// @route   POST /api/analyze
// Maps both routes to the upload & assessment pipeline
router.post('/upload', handleUpload, uploadAudioAndAnalyze);
router.post('/analyze', handleUpload, uploadAudioAndAnalyze);

module.exports = router;
